// models/Superadmin.js
const mongoose = require('mongoose');

const superadminSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    full_name: {
        type: String,
        required: true
    },
    contact_number: String
}, {
    timestamps: true
});

module.exports = mongoose.model('Superadmin', superadminSchema);