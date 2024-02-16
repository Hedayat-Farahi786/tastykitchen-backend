// orders.js
const express = require('express');
const router = express.Router();
const Order = require('../models/order');
const User = require('../models/user')

router.post('/', async (req, res) => {
    try {
        const { customer, delivery, products, totalPrice, payment, time } = req.body;

        let user = await User.findOne({ phone: customer.phone });

        if (!user) {
            // Create a new user object omitting the email if not provided
            const userData = {
                name: customer.name,
                phone: customer.phone,
                // Include email only if it's provided in the payload
                ...(customer.email && { email: customer.email }),
                address: {
                    street: delivery.street,
                    postcode: delivery.postcode,
                    floor: delivery.floor,
                },
            };

            user = new User(userData);
            await user.save();
        }

        // Calculate the order number based on the current number of orders
        const ordersCount = await Order.countDocuments();
        const orderNumber = `${1000 + ordersCount}`;

        // Create a new Order document using the Order model
        const newOrder = new Order({
            orderNumber,
            status: 'pending', // Set the default status to 'pending'
            customer: user._id, // Connect the order to the user
            delivery,
            products,
            totalPrice,
            payment,
            time,
        });

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
router.get('/:orderNumber', async (req, res) => {
  try {
    const order = await Order.findOne({ orderNumber: req.params.orderNumber });
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

router.get('/dailyRevenue', async (req, res) => {
  try {
    const { start, end } = req.query;
    const startDate = new Date(start);
    const endDate = new Date(end);

    // Fetch orders within the specified date range
    const orders = await Order.find({
      createdAt: { $gte: startDate, $lte: endDate }
    });

    // Calculate revenue data
    const revenueData = calculateRevenueData(orders);

    res.json(revenueData);
  } catch (error) {
    console.error('Error fetching daily revenue:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Function to calculate revenue data and trend
function calculateRevenueData(orders) {
  let totalRevenue = 0;
  const revenueByDate = {};

  orders.forEach(order => {
    const { createdAt, totalPrice } = order;
    const date = createdAt.toISOString().split('T')[0];

    // Update total revenue
    totalRevenue += totalPrice;

    // Update revenue by date
    if (!revenueByDate[date]) {
      revenueByDate[date] = totalPrice;
    } else {
      revenueByDate[date] += totalPrice;
    }
  });

  // Convert revenue by date to array format
  const revenueArray = Object.keys(revenueByDate).map(date => ({
    date,
    value: revenueByDate[date]
  }));

  // Calculate trend using linear regression
  const n = revenueArray.length;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumX2 = 0;

  revenueArray.forEach(({ date, value }, index) => {
    const x = index + 1; // Use index as x value
    const y = value;

    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumX2 += x * x;
  });

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  const trend = slope * (n + 1) + intercept; // Predicted value for the next point

  return {
    data: revenueArray,
    trend,
    total: totalRevenue
  };
}


module.exports = router;
