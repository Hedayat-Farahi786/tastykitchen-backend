// index.js (or server.js)
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const app = express();
const PORT = process.env.PORT || 3000;
const dotenv = require("dotenv").config();

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

// Routes
app.use("/products", require("./src/routes/products"));
app.use("/categories", require("./src/routes/categories"));
app.use("/orders", require("./src/routes/orders"));
app.use("/users", require("./src/routes/users"));
app.use("/testimonials", require("./src/routes/testimonials"));
app.use("/contacts", require("./src/routes/contacts"));
app.use("/revenue", require("./src/routes/revenue"));
app.use("/customers", require("./src/routes/customers"));

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
