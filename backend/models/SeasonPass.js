const mongoose = require('mongoose');

const seasonPassSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  name: {
    type: String,
    required: [true, 'Season pass name is required'],
    trim: true
  },
  description: String,
  sport: {
    type: String,
    required: [true, 'Sport type is required'],
    enum: ['football', 'cricket', 'basketball', 'baseball', 'soccer', 'tennis', 'all']
  },
  type: {
    type: String,
    enum: ['single_sport', 'multi_sport', 'vip', 'premium'],
    default: 'single_sport'
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  validityPeriod: {
    start: {
      type: Date,
      required: [true, 'Start date is required']
    },
    end: {
      type: Date,
      required: [true, 'End date is required'],
      validate: {
        validator: function(end) {
          return end > this.start;
        },
        message: 'End date must be after start date'
      }
    }
  },
  benefits: [{
    type: String,
    enum: [
      'priority_booking',
      'discounted_tickets',
      'vip_lounge_access',
      'free_parking',
      'exclusive_events',
      'merchandise_discount',
      'loyalty_points_bonus'
    ]
  }],
  maxEvents: {
    type: Number,
    default: null // null means unlimited
  },
  eventsUsed: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'cancelled'],
    default: 'active'
  },
  paymentInfo: {
    method: {
      type: String,
      enum: ['credit_card', 'debit_card', 'paypal', 'bank_transfer']
    },
    transactionId: String,
    amount: Number,
    date: {
      type: Date,
      default: Date.now
    }
  },
  autoRenew: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for better query performance
seasonPassSchema.index({ user: 1, status: 1 });
seasonPassSchema.index({ sport: 1 });
seasonPassSchema.index({ 'validityPeriod.end': 1 });

// Virtual for checking if pass is valid
seasonPassSchema.virtual('isValid').get(function() {
  const now = new Date();
  return this.status === 'active' &&
         now >= this.validityPeriod.start &&
         now <= this.validityPeriod.end &&
         (this.maxEvents === null || this.eventsUsed < this.maxEvents);
});

// Virtual for remaining events
seasonPassSchema.virtual('remainingEvents').get(function() {
  if (this.maxEvents === null) return 'unlimited';
  return Math.max(0, this.maxEvents - this.eventsUsed);
});

// Method to use the pass for an event
seasonPassSchema.methods.useForEvent = function() {
  if (!this.isValid) {
    throw new Error('Season pass is not valid');
  }
  if (this.maxEvents !== null && this.eventsUsed >= this.maxEvents) {
    throw new Error('Maximum events reached for this season pass');
  }
  this.eventsUsed += 1;
  return this.save();
};

// Method to check if pass can be used for a specific event
seasonPassSchema.methods.canUseForEvent = function(event) {
  if (!this.isValid) return false;
  if (this.sport !== 'all' && this.sport !== event.sport) return false;
  return true;
};

module.exports = mongoose.model('SeasonPass', seasonPassSchema);
