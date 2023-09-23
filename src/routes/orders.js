// orders.js
const express = require('express');
const router = express.Router();
const Order = require('../models/order');
const User = require('../models/user')

// Create a new order
router.post('/', async (req, res) => {
    try {
      // Extract order data from the request body
      const {
        customer,
        delivery,
        products,
        totalPrice,
        payment,
        time,
      } = req.body;
  
      // Check if a user with the given phone number already exists
      let user = await User.findOne({ phone: customer.phone });
  
      if (!user) {
        // If the user doesn't exist, create a new user
        res = customer;

        res.address = {
            street: delivery.street,
            postcode: delivery.postcode,
            floor: delivery.floor,
        }

        user = new User(customer);
        // Assuming 'customer' contains fields like 'name', 'phone', and other user details
  
        // Save the new user to the database
        await user.save();
      }
      console.log(user);
  
      // Create a new Order document using the Order model
      const newOrder = new Order({
        customer: user._id, // Connect the order to the user
        delivery,
        products,
        totalPrice,
        payment,
        time,
      });

      console.log(newOrder.customer);
  
      // Save the new order to the database
      const savedOrder = await newOrder.save();
  
      res.status(201).json(savedOrder);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

// Get all orders
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find();
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a single order by ID
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update an order by ID
router.put('/:id', async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete an order by ID
router.delete('/:id', async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
