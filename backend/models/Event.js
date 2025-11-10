const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Event description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  sport: {
    type: String,
    required: [true, 'Sport type is required'],
    enum: ['football', 'cricket', 'basketball', 'baseball', 'soccer', 'tennis', 'other']
  },
  date: {
    type: Date,
    required: [true, 'Event date is required'],
    validate: {
      validator: function(date) {
        return date > new Date();
      },
      message: 'Event date must be in the future'
    }
  },
  venue: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Venue',
    required: [true, 'Venue is required']
  },
  teams: {
    home: {
      name: String,
      logo: String
    },
    away: {
      name: String,
      logo: String
    }
  },
  ticketCategories: [{
    name: {
      type: String,
      required: true,
      enum: ['bleachers', 'vip', 'premium', 'box']
    },
    price: {
      type: Number,
      required: true,
      min: [0, 'Price cannot be negative']
    },
    availableSeats: {
      type: Number,
      required: true,
      min: [0, 'Available seats cannot be negative']
    },
    totalSeats: {
      type: Number,
      required: true,
      min: [1, 'Total seats must be at least 1']
    },
    benefits: [String] // e.g., ['Free parking', 'VIP lounge access']
  }],
  status: {
    type: String,
    enum: ['upcoming', 'live', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  images: [{
    url: String,
    alt: String
  }],
  tags: [String],
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
eventSchema.index({ date: 1, status: 1 });
eventSchema.index({ sport: 1 });
eventSchema.index({ 'teams.home.name': 1, 'teams.away.name': 1 });
eventSchema.index({ createdBy: 1 });

// Virtual for checking if event is sold out
eventSchema.virtual('isSoldOut').get(function() {
  return this.ticketCategories.every(category => category.availableSeats === 0);
});

// Virtual for total tickets sold
eventSchema.virtual('totalTicketsSold').get(function() {
  return this.ticketCategories.reduce((total, category) => {
    return total + (category.totalSeats - category.availableSeats);
  }, 0);
});

// Method to check seat availability
eventSchema.methods.checkSeatAvailability = function(categoryName, quantity = 1) {
  const category = this.ticketCategories.find(cat => cat.name === categoryName);
  if (!category) return false;
  return category.availableSeats >= quantity;
};

// Method to reserve seats
eventSchema.methods.reserveSeats = function(categoryName, quantity = 1) {
  const category = this.ticketCategories.find(cat => cat.name === categoryName);
  if (!category || category.availableSeats < quantity) {
    throw new Error('Insufficient seats available');
  }
  category.availableSeats -= quantity;
  return this.save();
};

module.exports = mongoose.model('Event', eventSchema);
