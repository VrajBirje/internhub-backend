// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    userType: { type: String, enum: ['superadmin', 'student', 'company'], required: true },
    isActive: { type: Boolean, default: true },
    lastLogin: Date,
    resetToken: String,
    resetTokenExpiry: Date
}, { timestamps: true });

// ✅ Create model (or reuse if already compiled to prevent OverwriteModelError in dev)
const User = mongoose.models.User || mongoose.model('User', userSchema);

userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// ✅ Export model
module.exports = User;
