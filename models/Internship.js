// models/Internship.js
const mongoose = require('mongoose');

const durationSchema = new mongoose.Schema({
    duration_value: {
        type: Number,
        required: true
    },
    duration_unit: {
        type: String,
        enum: ['Days', 'Weeks', 'Months'],
        required: true
    },
    start_date_type: {
        type: String,
        enum: ['Immediately', 'Fixed Date', 'Flexible'],
        required: true
    },
    fixed_start_date: Date
});

const locationSchema = new mongoose.Schema({
    location_type: {
        type: String,
        enum: ['Remote', 'On-site', 'Hybrid'],
        required: true
    },
    address: {
        street: String,
        city: String,
        state: String,
        country: String,
        zip_code: String,
        coordinates: {
            latitude: Number,
            longitude: Number
        }
    }
});

const stipendSchema = new mongoose.Schema({
    is_paid: {
        type: Boolean,
        required: true,
        default: false
    },
    min_amount: Number,
    max_amount: Number,
    currency: {
        type: String,
        default: 'INR'
    },
    stipend_period: {
        type: String,
        enum: ['Per Month', 'Per Week', 'One-time', 'Performance Based']
    }
});

const internshipSchema = new mongoose.Schema({
    company_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    category_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'InternshipCategory',
        required: true
    },
    skills_required: [String],
    responsibilities: [String],
    perks: [String],
    who_can_apply: String,
    number_of_openings: {
        type: Number,
        required: true,
        min: 1
    },
    questions: [{
        question_text: {
            type: String,
            required: true,
            trim: true
        },
        question_type: {
            type: String,
            enum: ['text', 'textarea', 'multiple_choice', 'file'],
            default: 'text'
        },
        is_required: {
            type: Boolean,
            default: false
        },
        options: [String], // For multiple_choice type
        max_length: Number, // For text/textarea type
        file_types: [String] // For file type (e.g., ['pdf', 'docx'])
    }],
    duration: durationSchema,
    location: locationSchema,
    stipend: stipendSchema,
    is_active: {
        type: Boolean,
        default: true
    },
    application_deadline: {
        type: Date,
        required: true,
        validate: {
            validator: function(date) {
                return date > new Date();
            },
            message: 'Application deadline must be in the future'
        }
    },
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    approved_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Superadmin'
    },
    approval_status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
    },
    approval_date: Date,
    views_count: {
        type: Number,
        default: 0
    },
    applications_count: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Indexes for better performance
internshipSchema.index({ company_id: 1 });
internshipSchema.index({ category_id: 1 });
internshipSchema.index({ approval_status: 1 });
internshipSchema.index({ is_active: 1 });
internshipSchema.index({ 'location.location_type': 1 });
internshipSchema.index({ 'stipend.is_paid': 1 });
internshipSchema.index({ application_deadline: 1 });
internshipSchema.index({ created_at: -1 });

// Virtual for formatted duration
internshipSchema.virtual('formatted_duration').get(function() {
    if (!this.duration) return '';
    return `${this.duration.duration_value} ${this.duration.duration_unit}`;
});

// Virtual for checking if internship is expired
internshipSchema.virtual('is_expired').get(function() {
    return new Date() > this.application_deadline;
});

// Method to increment views
internshipSchema.methods.incrementViews = function() {
    this.views_count += 1;
    return this.save();
};

// Method to increment applications
internshipSchema.methods.incrementApplications = function() {
    this.applications_count += 1;
    return this.save();
};

// Pre-save middleware to validate data
internshipSchema.pre('save', function(next) {
    // Validate stipend data consistency
    if (this.stipend.is_paid) {
        if (!this.stipend.min_amount || !this.stipend.stipend_period) {
            return next(new Error('Paid internships require min_amount and stipend_period'));
        }
    } else {
        // Clear stipend fields for unpaid internships
        this.stipend.min_amount = undefined;
        this.stipend.max_amount = undefined;
        this.stipend.stipend_period = undefined;
    }

    // Validate location data
    if (this.location.location_type === 'On-site' && !this.location.address) {
        return next(new Error('On-site internships require address information'));
    }

    next();
});

module.exports = mongoose.model('Internship', internshipSchema);