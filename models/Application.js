const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
    question_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    question_text: {
        type: String,
        required: true
    },
    question_type: {
        type: String,
        enum: ['text', 'textarea', 'multiple_choice', 'file'],
        required: true
    },
    answer_text: String, // For text/textarea types
    selected_options: [String], // For multiple_choice type
    file_url: String, // For file type
    file_name: String // For file type
});

const resumeSchema = new mongoose.Schema({
    resumeFile: { type: String, required: true },
    uploadDate: { type: Date, default: Date.now },
});

const applicationSchema = new mongoose.Schema({
    internship_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Internship',
        required: true
    },
    student_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    resume: resumeSchema,
    cover_letter: String,
    answers: [answerSchema], // Answers to internship questions
    status: {
        type: String,
        enum: ['Applied', 'Under Review', 'Shortlisted', 'Interview Scheduled', 'Rejected', 'Offer Extended', 'Accepted', 'Withdrawn'],
        default: 'Applied'
    },
    status_history: [{
        status: {
            type: String,
            required: true
        },
        changed_by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        changed_by_type: {
            type: String,
            enum: ['System', 'Student', 'Company', 'Admin'],
            required: true
        },
        change_date: {
            type: Date,
            default: Date.now
        },
        notes: String
    }],
    notes: String,
    applied_date: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Compound unique index
applicationSchema.index({ internship_id: 1, student_id: 1 }, { unique: true });

// Indexes for better performance
applicationSchema.index({ student_id: 1 });
applicationSchema.index({ status: 1 });
applicationSchema.index({ internship_id: 1 });

// Pre-save middleware to add status history
applicationSchema.pre('save', function(next) {
    if (this.isModified('status')) {
        this.status_history.push({
            status: this.status,
            changed_by: this.student_id, // Default to student, will be updated by company
            changed_by_type: 'Student', // Default, will be updated
            notes: 'Application submitted'
        });
    }
    next();
});

module.exports = mongoose.model('Application', applicationSchema);