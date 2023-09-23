// testimonial.js (create a new file for the testimonial model)
const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema({
  author: String, // The name or author of the testimonial
  content: String, // The content of the testimonial
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Testimonial', testimonialSchema);
