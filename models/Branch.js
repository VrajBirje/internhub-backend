// models/Branch.js
const mongoose = require('mongoose');

const branchSchema = new mongoose.Schema({
    branch_name: {
        type: String,
        required: true
    },
    branch_code: {
        type: String,
        unique: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Branch', branchSchema);