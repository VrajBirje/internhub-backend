const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    is_read: {
        type: Boolean,
        default: false
    },
    notification_type: {
        type: String,
        enum: [
            'Application_Status_Update', // Student: when application status changes
            'New_Application',           // Company: when someone applies
            'Internship_Approval',       // Company: when internship approved/rejected
            'Company_Verification',      // Company: when company verified/rejected
            'Skill_Match',               // Student: when internship matches skills
            'System', 
            'Promotional'
        ],
        required: true
    },
    related_entity_type: {
        type: String,
        enum: ['Internship', 'Application', 'Company', 'User', 'System'],
        default: 'System'
    },
    related_entity_id: mongoose.Schema.Types.ObjectId,
    metadata: {
        type: Map,
        of: mongoose.Schema.Types.Mixed
    }
}, {
    timestamps: true
});

// Indexes for better performance
notificationSchema.index({ user_id: 1 });
notificationSchema.index({ is_read: 1 });
notificationSchema.index({ notification_type: 1 });
notificationSchema.index({ created_at: -1 });

module.exports = mongoose.model('Notification', notificationSchema);