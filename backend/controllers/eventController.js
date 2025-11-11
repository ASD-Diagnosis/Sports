const mongoose = require("mongoose");
const { validationResult } = require("express-validator");
const Event = require("../models/Event");
const Venue = require("../models/Venue");

// @desc    Get all events
// @route   GET /api/events
// @access  Public
const getEvents = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build query
    let query = { isActive: true };

    // Filter by sport
    if (req.query.sport) {
      query.sport = req.query.sport;
    }

    // Filter by date range
    if (req.query.startDate || req.query.endDate) {
      query.date = {};
      if (req.query.startDate) {
        query.date.$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        query.date.$lte = new Date(req.query.endDate);
      }
    }

    // Filter by status
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Search by title or team names
    if (req.query.search) {
      query.$or = [
        { title: { $regex: req.query.search, $options: "i" } },
        { "teams.home.name": { $regex: req.query.search, $options: "i" } },
        { "teams.away.name": { $regex: req.query.search, $options: "i" } },
      ];
    }

    // Sort options
    let sort = { date: 1 }; // Default: earliest first
    if (req.query.sort === "date_desc") {
      sort = { date: -1 };
    } else if (req.query.sort === "price_asc") {
      sort = { "ticketCategories.price": 1 };
    } else if (req.query.sort === "price_desc") {
      sort = { "ticketCategories.price": -1 };
    }

    const events = await Event.find(query)
      .populate("venue", "name address capacity")
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Event.countDocuments(query);

    res.status(200).json({
      success: true,
      count: events.length,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      data: events,
    });
  } catch (error) {
    console.error("Get events error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch events",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Public
const getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate("venue")
      .populate("createdBy", "name email");

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    res.status(200).json({
      success: true,
      data: event,
    });
  } catch (error) {
    console.error("Get event error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch event",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Create new event
// @route   POST /api/events
// @access  Private/Admin
const createEvent = async (req, res) => {
  try {
    // If ticketCategories was sent as a JSON string (from some forms), parse it
    if (
      req.body.ticketCategories &&
      typeof req.body.ticketCategories === "string"
    ) {
      try {
        req.body.ticketCategories = JSON.parse(req.body.ticketCategories);
      } catch (parseErr) {
        // leave as-is; the validator below will catch the invalid shape
      }
    }

    // If venue is provided as a name (not an ObjectId), try to resolve it to an ID
    if (req.body.venue && !mongoose.Types.ObjectId.isValid(req.body.venue)) {
      // try case-insensitive exact match on name
      const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const venueByName = await Venue.findOne({
        name: {
          $regex: `^${escapeRegex(String(req.body.venue))}$`,
          $options: "i",
        },
      });
      if (venueByName) {
        req.body.venue = venueByName._id;
      } else {
        // Create a minimal placeholder venue so any string can be used as a venue
        const placeholderVenue = await Venue.create({
          name: String(req.body.venue),
          address: {
            street: "TBD",
            city: "TBD",
            state: "TBD",
            zipCode: "00000",
            country: "TBD",
          },
          capacity: 100,
          createdBy: req.user ? req.user._id : undefined,
        });
        req.body.venue = placeholderVenue._id;
      }
    }

    // Run express-validator and return 400 with errors if any
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    // Add user to req.body
    req.body.createdBy = req.user._id;

    // Ensure availableSeats exists for each ticket category (default to totalSeats)
    if (Array.isArray(req.body.ticketCategories)) {
      for (let i = 0; i < req.body.ticketCategories.length; i++) {
        const cat = req.body.ticketCategories[i] || {};

        // normalize alias: accept `type` as an alias for `name`
        if ((!cat.name || cat.name === "") && cat.type) {
          cat.name = cat.type;
        }

        // Ensure numbers are numbers
        if (
          cat.totalSeats !== undefined &&
          typeof cat.totalSeats === "string"
        ) {
          const n = parseInt(cat.totalSeats, 10);
          if (!Number.isNaN(n)) cat.totalSeats = n;
        }
        if (
          cat.availableSeats !== undefined &&
          typeof cat.availableSeats === "string"
        ) {
          const n = parseInt(cat.availableSeats, 10);
          if (!Number.isNaN(n)) cat.availableSeats = n;
        }

        if (cat.availableSeats === undefined && cat.totalSeats !== undefined) {
          cat.availableSeats = cat.totalSeats;
        }

        // Validate presence of name
        if (!cat.name) {
          return res.status(400).json({
            success: false,
            message: `Ticket category at index ${i} must have a name (or type)`,
          });
        }

        req.body.ticketCategories[i] = cat;
      }
    }

    const event = await Event.create(req.body);

    res.status(201).json({
      success: true,
      data: event,
    });
  } catch (error) {
    console.error("Create event error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create event",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private/Admin
const updateEvent = async (req, res) => {
  try {
    let event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Check ownership or admin
    if (
      event.createdBy.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this event",
      });
    }

    // If ticketCategories was sent as a JSON string, parse it
    if (
      req.body.ticketCategories &&
      typeof req.body.ticketCategories === "string"
    ) {
      try {
        req.body.ticketCategories = JSON.parse(req.body.ticketCategories);
      } catch (parseErr) {
        // leave as-is; validators will handle it
      }
    }

    // If venue is provided as a name (not an ObjectId), try to resolve it to an ID
    if (req.body.venue && !mongoose.Types.ObjectId.isValid(req.body.venue)) {
      const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const venueByName = await Venue.findOne({
        name: {
          $regex: `^${escapeRegex(String(req.body.venue))}$`,
          $options: "i",
        },
      });
      if (venueByName) {
        req.body.venue = venueByName._id;
      } else {
        return res.status(400).json({
          success: false,
          message: `Venue not found: ${req.body.venue}`,
        });
      }
    }

    // Run express-validator and return 400 with errors if any
    const { validationResult } = require("express-validator");
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    // Ensure availableSeats exists for each ticket category (default to totalSeats)
    if (Array.isArray(req.body.ticketCategories)) {
      for (let i = 0; i < req.body.ticketCategories.length; i++) {
        const cat = req.body.ticketCategories[i] || {};

        // normalize alias: accept `type` as an alias for `name`
        if ((!cat.name || cat.name === "") && cat.type) {
          cat.name = cat.type;
        }

        if (
          cat.totalSeats !== undefined &&
          typeof cat.totalSeats === "string"
        ) {
          const n = parseInt(cat.totalSeats, 10);
          if (!Number.isNaN(n)) cat.totalSeats = n;
        }
        if (
          cat.availableSeats !== undefined &&
          typeof cat.availableSeats === "string"
        ) {
          const n = parseInt(cat.availableSeats, 10);
          if (!Number.isNaN(n)) cat.availableSeats = n;
        }
        if (cat.availableSeats === undefined && cat.totalSeats !== undefined) {
          cat.availableSeats = cat.totalSeats;
        }
        if (!cat.name) {
          return res.status(400).json({
            success: false,
            message: `Ticket category at index ${i} must have a name (or type)`,
          });
        }
        req.body.ticketCategories[i] = cat;
      }
    }

    event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: event,
    });
  } catch (error) {
    console.error("Update event error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update event",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private/Admin
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Check ownership or admin
    if (
      event.createdBy.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this event",
      });
    }

    await Event.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Event deleted successfully",
    });
  } catch (error) {
    console.error("Delete event error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete event",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Get event statistics
// @route   GET /api/events/:id/stats
// @access  Private/Admin
const getEventStats = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Calculate statistics
    const stats = {
      totalSeats: event.ticketCategories.reduce(
        (total, cat) => total + cat.totalSeats,
        0
      ),
      availableSeats: event.ticketCategories.reduce(
        (total, cat) => total + cat.availableSeats,
        0
      ),
      soldSeats: event.ticketCategories.reduce(
        (total, cat) => total + (cat.totalSeats - cat.availableSeats),
        0
      ),
      revenue: event.ticketCategories.reduce((total, cat) => {
        const sold = cat.totalSeats - cat.availableSeats;
        return total + sold * cat.price;
      }, 0),
      categories: event.ticketCategories.map((cat) => ({
        name: cat.name,
        totalSeats: cat.totalSeats,
        availableSeats: cat.availableSeats,
        soldSeats: cat.totalSeats - cat.availableSeats,
        price: cat.price,
        revenue: (cat.totalSeats - cat.availableSeats) * cat.price,
      })),
    };

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Get event stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch event statistics",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

module.exports = {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  getEventStats,
};
