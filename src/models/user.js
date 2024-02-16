const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
    unique: true, // Ensures that each phone number is unique
  },
  address: {
    street: String,
    postcode: String,
    floor: String
    // Add more address-related fields as needed (e.g., city, state, country)
  },
  createdAt: Date
  // Add more customer-related fields as needed (e.g., loyaltyPoints, preferences, etc.)
});

module.exports = mongoose.model('Customer', customerSchema);
