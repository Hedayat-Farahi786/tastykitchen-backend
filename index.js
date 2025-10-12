// index.js (or server.js)
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const http = require("http");
const socketIo = require("socket.io");
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: [
      "http://localhost:5173", // Main app dev
      "http://localhost:5174", // Admin app dev
      "http://localhost:4173", // Main app preview
      "http://localhost:4174", // Admin app preview
      "*", // Allow all for development (remove in production)
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
});
const PORT = process.env.PORT || 4000;
const dotenv = require("dotenv").config();
const Stripe = require("stripe");
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

app.post("/api/create-payment-intent", async (req, res) => {
  try {
    const { amount, currency = "eur" } = req.body;

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

// Socket.io connection handling
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  // Listen for new_order event from main app
  socket.on("new_order", (order) => {
    console.log(
      "New order received via socket:",
      order.orderNumber || order._id
    );
    // Broadcast the new order to all connected clients
    io.emit("new_order", order);
  });

  // Also support new-order with hyphen for compatibility
  socket.on("new-order", (order) => {
    console.log(
      "New order received via socket (hyphen):",
      order.orderNumber || order._id
    );
    io.emit("new_order", order);
  });

  // Test event for debugging
  socket.on("test", (data) => {
    console.log("Test event received:", data);
    socket.emit("test-response", { message: "Test successful!" });
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Make io accessible to routes
app.set("io", io);

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Socket.io is ready`);
});
