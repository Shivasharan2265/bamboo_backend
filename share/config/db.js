require("dotenv").config();
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      // only the modern options are needed
      serverSelectionTimeoutMS: 5000, // optional, prevents long hangs
    });
    console.log("✅ MongoDB connection successful!");
  } catch (err) {
    console.error("❌ MongoDB connection failed!", err.message);
  }
};

module.exports = { connectDB };
