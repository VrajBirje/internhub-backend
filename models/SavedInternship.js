// models/SavedInternship.js
const mongoose = require('mongoose');

const savedInternshipSchema = new mongoose.Schema({
    student_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    internship_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Internship',
        required: true
    }
}, {
    timestamps: true
});

// Compound unique index
savedInternshipSchema.index({ student_id: 1, internship_id: 1 }, { unique: true });

module.exports = mongoose.model('SavedInternship', savedInternshipSchema);