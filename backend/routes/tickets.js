const express = require('express');
const { body } = require('express-validator');
const {
  getUserTickets,
  getTicket,
  purchaseTicket,
  cancelTicket,
  validateTicket
} = require('../controllers/ticketController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const purchaseTicketValidation = [
  body('eventId')
    .isMongoId()
    .withMessage('Please provide a valid event ID'),
  body('category')
    .isIn(['bleachers', 'vip', 'premium', 'box'])
    .withMessage('Please select a valid ticket category'),
  body('quantity')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Quantity must be between 1 and 10'),
  body('seasonPassId')
    .optional()
    .isMongoId()
    .withMessage('Please provide a valid season pass ID'),
  body('paymentMethod')
    .isIn(['credit_card', 'debit_card', 'paypal', 'bank_transfer'])
    .withMessage('Please select a valid payment method')
];

const validateTicketValidation = [
  body('qrCode')
    .notEmpty()
    .withMessage('QR code is required')
];

// User routes
router.get('/', protect, getUserTickets);
router.get('/:id', protect, getTicket);
router.post('/', protect, purchaseTicketValidation, purchaseTicket);
router.put('/:id/cancel', protect, cancelTicket);

// Admin routes
router.post('/validate', protect, authorize('admin'), validateTicketValidation, validateTicket);

module.exports = router;
