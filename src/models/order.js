const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const orderSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the Product model
  },
  delivery: {
    street: String,
    postcode: String,
    floor: String,
    company: String,
    note: String,
  },
  products: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product', // Reference to the Product model
      },
      extras: [String], // Array of extra items or options
      price: Number,
      quantity: Number,
    },
  ],
  totalPrice: Number,
  payment: String,
  orderNumber: String,
  status: String,
  time: Date,
});

orderSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Order', orderSchema);
