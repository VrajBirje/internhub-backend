// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  userType: { type: String, enum: ['superadmin', 'student', 'company'], required: true },

  isActive: { type: Boolean, default: true },
  lastLogin: Date,

  // EMAIL VERIFICATION (OTP)
  emailVerified: { type: Boolean, default: false },
  emailOtp: String,
  emailOtpExpiry: Date,

  // PASSWORD RESET (OTP)
  resetOtp: String,
  resetOtpExpiry: Date

}, { timestamps: true });

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
