// orders.js
const express = require("express");
const router = express.Router();
const Order = require("../models/order");
const User = require("../models/user");

router.post("/", async (req, res) => {
  try {
    const { customer, delivery, products, totalPrice, payment, time } =
      req.body;

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
      status: "pending", // Set the default status to 'pending'
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
router.get("/", async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ orderNumber: -1 })
      .populate({ path: "customer", model: "Customer" })
      .populate({
        path: "products.productId",
        model: "Product",
      });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/sales', async (req, res) => {
  // Calculate totals
  const orders = await Order.find();

  const currentDate = new Date();

  const totals = {
      yearTotalSales: 0,
      monthTotalSales: 0,
      weekTotalSales: 0,
      dayTotalSales: 0,
      monthlyOrderTotals: {}
  };

  // Loop through orders to calculate totals
  orders.forEach(order => {
      const orderDate = new Date(order.time);

      // Calculate total sales for each category
      if (orderDate.getFullYear() === currentDate.getFullYear()) {
          totals.yearTotalSales += order.totalPrice;
      }

      if (orderDate.getFullYear() === currentDate.getFullYear() &&
          orderDate.getMonth() === currentDate.getMonth()) {
          totals.monthTotalSales += order.totalPrice;
      }

      // Calculate week total (assuming current week as 7 days)
      const millisecondsPerWeek = 7 * 24 * 60 * 60 * 1000;
      const weekAgo = currentDate - millisecondsPerWeek;
      if (orderDate >= weekAgo && orderDate <= currentDate) {
          totals.weekTotalSales += order.totalPrice;
      }

      // Calculate day total (assuming current day)
      const startOfDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
      if (orderDate >= startOfDay && orderDate <= currentDate) {
          totals.dayTotalSales += order.totalPrice;
      }

      // Calculate monthly order totals for all years and months
      const orderYear = orderDate.getFullYear();
      const orderMonth = orderDate.getMonth();
      if (!totals.monthlyOrderTotals[orderYear]) {
          totals.monthlyOrderTotals[orderYear] = Array(12).fill(0);
      }
      totals.monthlyOrderTotals[orderYear][orderMonth] += 1;
  });

  // Transform the monthlyOrderTotals object into the desired array format
  const monthlyOrderTotalsArray = Object.keys(totals.monthlyOrderTotals).map(year => ({
      name: year,
      data: totals.monthlyOrderTotals[year]
  }));

  const result = {
      yearTotalSales: totals.yearTotalSales,
      monthTotalSales: totals.monthTotalSales,
      weekTotalSales: totals.weekTotalSales,
      dayTotalSales: totals.dayTotalSales,
      monthlyOrderTotals: monthlyOrderTotalsArray
  };

  res.json(result);
});


// Get all orders
router.get("/dashboardOrders", async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ orderNumber: -1 })
      .limit(5)
      .populate({ path: "customer", model: "Customer" })
      .populate({
        path: "products.productId",
        model: "Product",
      });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a single order by ID
router.get("/:orderNumber", async (req, res) => {
  try {
    const order = await Order.findOne({ orderNumber: req.params.orderNumber });
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update an order by ID
router.put("/:id", async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete an order by ID
router.delete("/:id", async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
