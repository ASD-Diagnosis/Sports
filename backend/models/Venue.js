const mongoose = require('mongoose');

const venueSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Venue name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  address: {
    street: {
      type: String,
      required: [true, 'Street address is required']
    },
    city: {
      type: String,
      required: [true, 'City is required']
    },
    state: {
      type: String,
      required: [true, 'State is required']
    },
    zipCode: {
      type: String,
      required: [true, 'Zip code is required']
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
      default: 'USA'
    }
  },
  capacity: {
    type: Number,
    required: [true, 'Venue capacity is required'],
    min: [100, 'Capacity must be at least 100']
  },
  seatMap: {
    imageUrl: String,
    sections: [{
      name: String,
      category: {
        type: String,
        enum: ['bleachers', 'vip', 'premium', 'box']
      },
      rows: Number,
      seatsPerRow: Number,
      price: Number
    }]
  },
  facilities: [String], // e.g., ['Parking', 'Food court', 'VIP lounge']
  contactInfo: {
    phone: String,
    email: String,
    website: String
  },
  images: [{
    url: String,
    alt: String
  }],
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

// Index for better query performance
venueSchema.index({ 'address.city': 1 });
venueSchema.index({ name: 1 });

// Virtual for full address
venueSchema.virtual('fullAddress').get(function() {
  return `${this.address.street}, ${this.address.city}, ${this.address.state} ${this.address.zipCode}, ${this.address.country}`;
});

// Method to get available seats by category
venueSchema.methods.getAvailableSeats = function(category) {
  const section = this.seatMap.sections.find(sec => sec.category === category);
  return section ? section.rows * section.seatsPerRow : 0;
};

module.exports = mongoose.model('Venue', venueSchema);
