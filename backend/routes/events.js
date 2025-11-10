const express = require('express');
const { body } = require('express-validator');
const {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  getEventStats
} = require('../controllers/eventController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const createEventValidation = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  body('sport')
    .isIn(['football', 'cricket', 'basketball', 'baseball', 'soccer', 'tennis', 'other'])
    .withMessage('Please select a valid sport'),
  body('date')
    .isISO8601()
    .withMessage('Please provide a valid date')
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Event date must be in the future');
      }
      return true;
    }),
  body('venue')
    .isMongoId()
    .withMessage('Please provide a valid venue ID'),
  body('ticketCategories')
    .isArray({ min: 1 })
    .withMessage('At least one ticket category is required'),
  body('ticketCategories.*.name')
    .isIn(['bleachers', 'vip', 'premium', 'box'])
    .withMessage('Invalid ticket category'),
  body('ticketCategories.*.price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('ticketCategories.*.totalSeats')
    .isInt({ min: 1 })
    .withMessage('Total seats must be at least 1')
];

// Public routes
router.get('/', getEvents);
router.get('/:id', getEvent);

// Protected routes (Admin only)
router.post('/', protect, authorize('admin'), createEventValidation, createEvent);
router.put('/:id', protect, authorize('admin'), createEventValidation, updateEvent);
router.delete('/:id', protect, authorize('admin'), deleteEvent);
router.get('/:id/stats', protect, authorize('admin'), getEventStats);

module.exports = router;
