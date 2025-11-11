const express = require("express");
const { body } = require("express-validator");
const {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  getEventStats,
} = require("../controllers/eventController");

const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// Validation rules
const createEventValidation = [
  body("title")
    .trim()
    .isLength({ max: 100 })
    .withMessage("Title cannot exceed 100 characters"),
  body("description")
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Description cannot exceed 1000 characters"),
  body("sport")
    .isIn([
      "football",
      "cricket",
      "basketball",
      "baseball",
      "soccer",
      "tennis",
      "other",
    ])
    .withMessage("Please select a valid sport"),
  body("date")
    .isISO8601()
    .withMessage("Please provide a valid date")
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error("Event date must be in the future");
      }
      return true;
    }),
  // venue validation removed to allow controller to accept either an ObjectId or a venue name
  // Accept ticketCategories as an array or a JSON string; allow either `name` or `type` field
  body("ticketCategories").custom((value, { req }) => {
    let cats = value;
    const allowed = ["bleachers", "vip", "premium", "box"];

    // If the client sent a JSON string (e.g., from a form), try to parse and replace
    if (typeof cats === "string") {
      try {
        cats = JSON.parse(cats);
        req.body.ticketCategories = cats;
      } catch (e) {
        throw new Error(
          "ticketCategories must be an array or a JSON string representing an array"
        );
      }
    }

    if (!Array.isArray(cats) || cats.length < 1) {
      throw new Error("At least one ticket category is required");
    }

    for (const cat of cats) {
      const v = cat.name ?? cat.type;
      if (!v || !allowed.includes(v)) {
        throw new Error("Invalid ticket category");
      }
    }

    return true;
  }),
  body("ticketCategories.*.price")
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),
  body("ticketCategories.*.totalSeats")
    .isInt({ min: 1 })
    .withMessage("Total seats must be at least 1"),
];

// Public routes
router.get("/", getEvents);
router.get("/:id", getEvent);

// Protected routes (Admin only)
router.post(
  "/",
  protect,
  authorize("admin"),
  createEventValidation,
  createEvent
);
router.put(
  "/:id",
  protect,
  authorize("admin"),
  createEventValidation,
  updateEvent
);
router.delete("/:id", protect, authorize("admin"), deleteEvent);
router.get("/:id/stats", protect, authorize("admin"), getEventStats);

module.exports = router;
