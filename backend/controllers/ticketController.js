const Ticket = require('../models/Ticket');
const Event = require('../models/Event');
const User = require('../models/User');
const SeasonPass = require('../models/SeasonPass');
const { sendEmail, emailTemplates } = require('../utils/emailService');

// @desc    Get user tickets
// @route   GET /api/tickets
// @access  Private
const getUserTickets = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let query = { user: req.user._id };

    // Filter by status
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Filter by event
    if (req.query.event) {
      query.event = req.query.event;
    }

    const tickets = await Ticket.find(query)
      .populate('event', 'title date venue teams sport')
      .populate('seasonPassId', 'name type')
      .sort({ purchaseDate: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Ticket.countDocuments(query);

    res.status(200).json({
      success: true,
      count: tickets.length,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      data: tickets
    });
  } catch (error) {
    console.error('Get user tickets error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tickets',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get single ticket
// @route   GET /api/tickets/:id
// @access  Private
const getTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('event')
      .populate('user', 'name email')
      .populate('seasonPassId');

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    // Check ownership or admin
    if (ticket.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this ticket'
      });
    }

    res.status(200).json({
      success: true,
      data: ticket
    });
  } catch (error) {
    console.error('Get ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch ticket',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Purchase ticket
// @route   POST /api/tickets
// @access  Private
const purchaseTicket = async (req, res) => {
  try {
    const { eventId, category, quantity = 1, seasonPassId, paymentMethod } = req.body;

    // Find event
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if event is in the future
    if (event.date <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot purchase tickets for past events'
      });
    }

    // Check seat availability
    if (!event.checkSeatAvailability(category, quantity)) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient seats available'
      });
    }

    // Find ticket category
    const ticketCategory = event.ticketCategories.find(cat => cat.name === category);
    if (!ticketCategory) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ticket category'
      });
    }

    let finalPrice = ticketCategory.price;
    let discountApplied = 0;
    let seasonPass = null;

    // Check for season pass discount
    if (seasonPassId) {
      seasonPass = await SeasonPass.findById(seasonPassId);
      if (seasonPass && seasonPass.canUseForEvent(event)) {
        // Apply discount based on season pass benefits
        if (seasonPass.benefits.includes('discounted_tickets')) {
          discountApplied = ticketCategory.price * 0.2; // 20% discount
          finalPrice = ticketCategory.price - discountApplied;
        }
      }
    }

    // Apply loyalty discount
    const user = await User.findById(req.user._id);
    if (user.loyaltyTier === 'gold') {
      discountApplied += ticketCategory.price * 0.1; // Additional 10% for gold tier
      finalPrice -= ticketCategory.price * 0.1;
    } else if (user.loyaltyTier === 'platinum') {
      discountApplied += ticketCategory.price * 0.15; // Additional 15% for platinum tier
      finalPrice -= ticketCategory.price * 0.15;
    }

    // Reserve seats
    await event.reserveSeats(category, quantity);

    // Create tickets
    const tickets = [];
    for (let i = 0; i < quantity; i++) {
      const ticket = await Ticket.create({
        event: eventId,
        user: req.user._id,
        seatInfo: {
          category,
          // In a real app, you'd assign specific seats
          seatNumber: `AUTO-${Date.now()}-${i}`
        },
        price: finalPrice,
        paymentInfo: {
          method: paymentMethod,
          amount: finalPrice
        },
        discountApplied,
        seasonPassId: seasonPass ? seasonPass._id : null
      });

      tickets.push(ticket);

      // Use season pass if applicable
      if (seasonPass) {
        await seasonPass.useForEvent();
      }
    }

    // Update user loyalty points
    user.loyaltyPoints += Math.floor(finalPrice * 0.1); // 10% of ticket price as points
    user.updateLoyaltyTier();
    await user.save();

    // Send confirmation emails
    for (const ticket of tickets) {
      try {
        await sendEmail({
          email: user.email,
          ...emailTemplates.ticketConfirmation(ticket, event)
        });
      } catch (emailError) {
        console.error('Ticket confirmation email failed:', emailError);
      }
    }

    res.status(201).json({
      success: true,
      message: `${quantity} ticket${quantity > 1 ? 's' : ''} purchased successfully`,
      data: tickets
    });
  } catch (error) {
    console.error('Purchase ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to purchase ticket',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Cancel ticket
// @route   PUT /api/tickets/:id/cancel
// @access  Private
const cancelTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id).populate('event');

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    // Check ownership
    if (ticket.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this ticket'
      });
    }

    // Check if ticket can be cancelled (e.g., not too close to event)
    const hoursUntilEvent = (ticket.event.date - new Date()) / (1000 * 60 * 60);
    if (hoursUntilEvent < 24) {
      return res.status(400).json({
        success: false,
        message: 'Tickets cannot be cancelled less than 24 hours before the event'
      });
    }

    // Cancel ticket
    await ticket.cancel();

    // Return seats to availability
    const event = ticket.event;
    const category = event.ticketCategories.find(cat => cat.name === ticket.seatInfo.category);
    if (category) {
      category.availableSeats += 1;
      await event.save();
    }

    // Refund loyalty points
    const user = await User.findById(req.user._id);
    user.loyaltyPoints = Math.max(0, user.loyaltyPoints - Math.floor(ticket.price * 0.1));
    user.updateLoyaltyTier();
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Ticket cancelled successfully'
    });
  } catch (error) {
    console.error('Cancel ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel ticket',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Validate ticket (for entry)
// @route   POST /api/tickets/validate
// @access  Private/Admin
const validateTicket = async (req, res) => {
  try {
    const { qrCode } = req.body;

    const ticket = await Ticket.findOne({ qrCode })
      .populate('event')
      .populate('user', 'name email');

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Invalid ticket'
      });
    }

    // Check if ticket is valid
    if (ticket.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: `Ticket is ${ticket.status}`
      });
    }

    // Check if event is today
    const today = new Date();
    const eventDate = new Date(ticket.event.date);
    if (eventDate.toDateString() !== today.toDateString()) {
      return res.status(400).json({
        success: false,
        message: 'Ticket is not valid for today'
      });
    }

    // Mark ticket as used
    await ticket.markAsUsed();

    res.status(200).json({
      success: true,
      message: 'Ticket validated successfully',
      data: {
        ticket: {
          id: ticket._id,
          event: ticket.event.title,
          user: ticket.user.name,
          seat: ticket.seatInfo
        }
      }
    });
  } catch (error) {
    console.error('Validate ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to validate ticket',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getUserTickets,
  getTicket,
  purchaseTicket,
  cancelTicket,
  validateTicket
};
