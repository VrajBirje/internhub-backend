// models/ApplicationStatusHistory.js
const mongoose = require('mongoose');

const applicationStatusHistorySchema = new mongoose.Schema({
    application_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Application',
        required: true
    },
    status: {
        type: String,
        enum: ['Applied', 'Under Review', 'Shortlisted', 'Interview Scheduled', 'Rejected', 'Offer Extended', 'Accepted', 'Withdrawn'],
        required: true
    },
    changed_by_type: {
        type: String,
        enum: ['System', 'Student', 'Company', 'Admin'],
        required: true
    },
    changed_by_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    notes: String
}, {
    timestamps: true
});

module.exports = mongoose.model('ApplicationStatusHistory', applicationStatusHistorySchema);