// models/College.js
const mongoose = require('mongoose');

const collegeSchema = new mongoose.Schema({
    college_name: {
        type: String,
        required: true
    },
    college_code: {
        type: String,
        unique: true
    },
    address: String,
    city: String,
    state: String,
    country: {
        type: String,
        default: 'India'
    },
    pincode: String
}, {
    timestamps: true
});

module.exports = mongoose.model('College', collegeSchema);