// models/SystemLog.js
const mongoose = require('mongoose');

const systemLogSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    action: {
        type: String,
        required: true
    },
    entity_type: String,
    entity_id: mongoose.Schema.Types.ObjectId,
    ip_address: String,
    user_agent: String,
    details: String
}, {
    timestamps: true
});

module.exports = mongoose.model('SystemLog', systemLogSchema);