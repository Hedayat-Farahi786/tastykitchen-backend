// product.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: String,
  description: String,
  image: String,
  optionsTitle: String,
  options: [
    {
      size: String,
      price: Number,
    },
  ],
  menuId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category', // Reference to the Category model
  },
  topProduct: Boolean, // New field to indicate if the product is a top product
  visible: Boolean,
});

module.exports = mongoose.model('Product', productSchema);
