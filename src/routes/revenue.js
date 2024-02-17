// users.js
const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Order = require("../models/order")


router.get("/", async (req, res) => {
  try {
    const { start, end } = req.query;
    const startDate = new Date(start);
    const endDate = new Date(end);
    console.log(startDate, endDate)
    
    // Fetch orders within the specified date range
    const orders = await Order.find({
      time: { $gte: startDate, $lte: endDate },
    });
    // Calculate revenue data
    const revenueData = calculateRevenueData(orders);

    res.json(revenueData);
  } catch (error) {
    console.error("Error fetching daily revenue:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Function to calculate revenue data and trend
function calculateRevenueData(orders) {
  let totalRevenue = 0;
  const revenueByDate = {};

  orders.forEach((order) => {
    const { time, totalPrice } = order;
    const date = time.toISOString();

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
  const revenueArray = Object.keys(revenueByDate).map((date) => ({
    date,
    value: revenueByDate[date],
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
    total: totalRevenue,
  };
}


module.exports = router;
