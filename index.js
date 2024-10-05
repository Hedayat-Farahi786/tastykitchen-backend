// index.js (or server.js)
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const app = express();
const PORT = process.env.PORT || 4000;
const dotenv = require("dotenv").config();
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

const cors = require("cors");

// Middleware
app.use(bodyParser.json());

app.use(cors());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });

app.get("/", (req, res) => {
  res.send("Hello! :)");
});

app.post('/api/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency = 'eur' } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Routes
app.use("/products", require("./src/routes/products"));
app.use("/categories", require("./src/routes/categories"));
app.use("/orders", require("./src/routes/orders"));
app.use("/users", require("./src/routes/users"));
app.use("/testimonials", require("./src/routes/testimonials"));
app.use("/contacts", require("./src/routes/contacts"));
app.use("/revenue", require("./src/routes/revenue"));
app.use("/customers", require("./src/routes/customers"));
app.use("/auth", require("./src/routes/auth"));

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
