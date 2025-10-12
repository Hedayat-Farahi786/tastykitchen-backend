// Quick script to create a new admin user
// Run with: node create-admin.js

require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./src/models/Users");

// Update these with your desired credentials
const NEW_ADMIN_EMAIL = "yama@gmail.com";
const NEW_ADMIN_PASSWORD = "12345678";

async function createAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL || process.env.MONGO_URI);
    console.log("✓ Connected to MongoDB");

    // Check if user already exists
    const existingUser = await User.findOne({ username: NEW_ADMIN_EMAIL });

    if (existingUser) {
      console.log("⚠ User already exists. Updating password...");
      existingUser.password = NEW_ADMIN_PASSWORD;
      await existingUser.save();
      console.log("✓ Password updated successfully!");
    } else {
      // Create new admin user
      const newUser = new User({
        username: NEW_ADMIN_EMAIL,
        password: NEW_ADMIN_PASSWORD,
      });
      await newUser.save();
      console.log("✓ Admin user created successfully!");
    }

    console.log("\n📧 Email:", NEW_ADMIN_EMAIL);
    console.log("🔑 Password:", NEW_ADMIN_PASSWORD);
    console.log(
      "\nYou can now login to the admin panel with these credentials."
    );

    await mongoose.connection.close();
    console.log("✓ Database connection closed");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

createAdmin();
