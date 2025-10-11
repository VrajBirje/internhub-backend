// models/InternshipCategory.js
const mongoose = require('mongoose');

const internshipCategorySchema = new mongoose.Schema({
    category_name: {
        type: String,
        required: true,
        unique: true
    },
    description: String
}, {
    timestamps: true
});

module.exports = mongoose.model('InternshipCategory', internshipCategorySchema);