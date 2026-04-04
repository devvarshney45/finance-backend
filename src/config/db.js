// src/config/db.js
// Handles MongoDB connection using Mongoose

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // mongoose.connect returns a promise, so we await it
    const conn = await mongoose.connect(process.env.MONGO_URI);
    
    // conn.connection.host tells us which server we connected to
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    // If connection fails, log and exit the process — no point running without DB
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1); // Exit with failure code
  }
};

module.exports = connectDB;