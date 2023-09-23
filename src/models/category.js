// category.js
const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: String,
  description: String,
  extras: [
    {
      name: String,
      price: Number,
    },
  ],
});

module.exports = mongoose.model('Category', categorySchema);
