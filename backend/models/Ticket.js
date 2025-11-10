const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: [true, 'Event is required']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  seatInfo: {
    category: {
      type: String,
      required: [true, 'Seat category is required'],
      enum: ['bleachers', 'vip', 'premium', 'box']
    },
    section: String,
    row: String,
    seatNumber: String
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  purchaseDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'used', 'cancelled', 'refunded'],
    default: 'active'
  },
  qrCode: {
    type: String,
    unique: true
  },
  paymentInfo: {
    method: {
      type: String,
      enum: ['credit_card', 'debit_card', 'paypal', 'bank_transfer']
    },
    transactionId: String,
    amount: Number
  },
  isSeasonPass: {
    type: Boolean,
    default: false
  },
  seasonPassId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SeasonPass'
  },
  discountApplied: {
    type: Number,
    default: 0,
    min: [0, 'Discount cannot be negative']
  },
  loyaltyPointsEarned: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for better query performance
ticketSchema.index({ event: 1, user: 1 });
ticketSchema.index({ user: 1, status: 1 });
ticketSchema.index({ qrCode: 1 });
ticketSchema.index({ purchaseDate: -1 });

// Virtual for ticket validity
ticketSchema.virtual('isValid').get(function() {
  return this.status === 'active' && new Date(this.event.date) > new Date();
});

// Method to mark ticket as used
ticketSchema.methods.markAsUsed = function() {
  if (this.status !== 'active') {
    throw new Error('Ticket is not active');
  }
  this.status = 'used';
  return this.save();
};

// Method to cancel ticket
ticketSchema.methods.cancel = function() {
  if (this.status !== 'active') {
    throw new Error('Ticket cannot be cancelled');
  }
  this.status = 'cancelled';
  return this.save();
};

// Pre-save middleware to generate QR code
ticketSchema.pre('save', function(next) {
  if (this.isNew && !this.qrCode) {
    // Generate a unique QR code (in production, use a proper QR code library)
    this.qrCode = `TICKET-${this._id}-${Date.now()}`;
  }
  next();
});

module.exports = mongoose.model('Ticket', ticketSchema);
