// users.js
const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Order = require("../models/order")

// Create a new user
router.post('/', async (req, res) => {
  try {
    const userData = {
      ...req.body,
      createdAt: new Date() // Add createdAt field with current date and time
    };

    const user = new User(userData);
    await user.save();
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all users
router.get('/', async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:userId/orders', async (req, res) => {
    try {
      // Find the user by their ID
      const user = await User.findById(req.params.userId);
  
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      // Retrieve orders associated with the user's ID
      const orders = await Order.find({ 'customer': req.params.userId });
  
      res.status(200).json(orders);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

// Get a single user by ID
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a user by ID
router.put('/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a user by ID
router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
