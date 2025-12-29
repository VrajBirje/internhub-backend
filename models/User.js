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
    // email verification
    emailVerified: { type: Boolean, default: false },
    verificationToken: String,
    verificationTokenExpiry: Date,
    // password reset
    resetToken: String,
    resetTokenExpiry: Date
}, { timestamps: true });

userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Create model (or reuse if already compiled to prevent OverwriteModelError in dev)
const User = mongoose.models.User || mongoose.model('User', userSchema);

module.exports = User;
