const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const User = require("../models/Users");
const router = express.Router();

const transporter = nodemailer.createTransport({
  service: 'gmail', // use your email service
  auth: {
    user: process.env.EMAIL_USER, // your email
    pass: process.env.EMAIL_PASS, // your email password
  },
});

router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    const newUser = new User({ username, password });
    await newUser.save();
    res.status(201).send("User registered successfully");
  } catch (error) {
    console.log(error)
    res.status(500).send("Error registering user");
  }
});

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).send("Invalid username or password");
    }
    const token = jwt.sign({ id: user._id, username }, process.env.JWT_SECRET, {
      expiresIn: "18h",
    });
    res.json({ token });
  } catch (error) {
    res.status(500).send("Error logging in");
  }
});

router.get("/validate", (req, res) => {
  const token = req.headers["authorization"];
  if (!token) {
    return res.status(401).send("Unauthorized");
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send("Unauthorized");
    }
    res.send("Authorized");
  });
});

router.post("/forgot-password", async (req, res) => {
  try {
    const { username } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).send({message: "User not found"});
    }

    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    const resetLink = `http://localhost:3000/#/reset-password/${resetToken}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: username,
      subject: "Password Reset",
      text: `Click on the following link to reset your password: ${resetLink}`,
    };

    await transporter.sendMail(mailOptions);

    res.send("Password reset link sent to your email");
  } catch (error) {
    console.log(error)
    res.status(500).send("Error sending reset link");
  }
});

router.post("/reset-password/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).send("User not found");
    }

    user.password = newPassword;
    await user.save();

    res.send("Password reset successfully");
  } catch (error) {
    res.status(500).send("Error resetting password");
  }
});

module.exports = router;
