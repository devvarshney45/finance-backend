// src/models/User.js
// Defines the shape of a User document in MongoDB

const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs'); // For hashing passwords

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],  // Custom error message
      trim: true,                             // Remove leading/trailing spaces
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,       // No two users can have the same email
      lowercase: true,    // Always store as lowercase
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'], // Regex validation
    },

    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,  // IMPORTANT: Never return password in queries by default
    },

    role: {
      type: String,
      enum: ['viewer', 'analyst', 'admin'], // Only these 3 values allowed
      default: 'viewer',                    // New users are viewers by default
    },

    isActive: {
      type: Boolean,
      default: true,  // User is active when created
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// ─── PRE-SAVE HOOK ────────────────────────────────────────────────────────────
// This runs automatically BEFORE a user document is saved to the database
UserSchema.pre('save', async function (next) {
  // Only hash password if it was actually changed (not on every update)
  if (!this.isModified('password')) return next();

  // bcrypt.genSalt(10) creates a salt with complexity 10 (industry standard)
  const salt = await bcrypt.genSalt(10);
  
  // Replace plain text password with hashed version
  this.password = await bcrypt.hash(this.password, salt);
  next(); // Proceed to save
});

// ─── INSTANCE METHOD ─────────────────────────────────────────────────────────
// A method available on every User document instance
// Used during login to compare entered password with stored hash
UserSchema.methods.comparePassword = async function (enteredPassword) {
  // bcrypt.compare handles the comparison safely
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);