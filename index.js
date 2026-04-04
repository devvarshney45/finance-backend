// index.js
// This is the main entry file — it boots up the entire server

const express = require('express');      // Express is the web framework
const cors = require('cors');            // Allows cross-origin requests (frontend calling backend)
const helmet = require('helmet');        // Adds security HTTP headers automatically
const morgan = require('morgan');        // Logs every incoming request to the console
const dotenv = require('dotenv');        // Loads .env variables into process.env

dotenv.config();                         // Must be called before anything uses process.env

const connectDB = require('./src/config/db');  // Our database connection function

// Import all route files
const authRoutes        = require('./src/routes/authRoutes');
const userRoutes        = require('./src/routes/userRoutes');
const transactionRoutes = require('./src/routes/transactionRoutes');
const dashboardRoutes   = require('./src/routes/dashboardRoutes');

const app = express();   // Create the Express application

// ─── GLOBAL MIDDLEWARE ───────────────────────────────────────────────────────
app.use(helmet());                    // Security headers (e.g., prevents clickjacking)
app.use(cors());                      // Allow all origins (can restrict in production)
app.use(morgan('dev'));               // Log: GET /api/auth/login 200 12ms
app.use(express.json());             // Parse incoming JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse form data

// ─── ROUTES ──────────────────────────────────────────────────────────────────
app.use('/api/auth',         authRoutes);        // /api/auth/login, /api/auth/register
app.use('/api/users',        userRoutes);        // /api/users (admin only)
app.use('/api/transactions', transactionRoutes); // /api/transactions (CRUD)
app.use('/api/dashboard',    dashboardRoutes);   // /api/dashboard/summary etc.

// ─── HEALTH CHECK ────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ message: 'Finance Backend API is running ✅' });
});

// ─── 404 HANDLER ─────────────────────────────────────────────────────────────
// This catches any route that doesn't exist
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ─── GLOBAL ERROR HANDLER ────────────────────────────────────────────────────
// Express calls this automatically if any middleware calls next(error)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// ─── START SERVER ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
});

module.exports = app; // Export for testing