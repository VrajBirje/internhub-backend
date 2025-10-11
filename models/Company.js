// models/Company.js
const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
    addressType: { type: String, enum: ['Headquarters', 'Office', 'Other'], default: 'Headquarters' },
    addressLine1: { type: String, required: true },
    addressLine2: String,
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, default: 'India' },
    pincode: { type: String, required: true },
    isPrimary: { type: Boolean, default: false }
});

const contactSchema = new mongoose.Schema({
    contactName: { type: String, required: true },
    designation: String,
    email: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    isPrimary: { type: Boolean, default: false }
});

const companySchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    
    // Basic Info (Step 1)
    companyName: { type: String, required: true },
    
    // Company Details (Step 2)
    description: String,
    industry: String,
    websiteUrl: String,
    foundedYear: Number,
    companySize: {
        type: String,
        enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1001-5000', '5001-10000', '10000+']
    },
    logoUrl: String,
    
    // Addresses & Contacts (Step 3) - EMBEDDED ARRAYS
    addresses: [addressSchema],
    contacts: [contactSchema],
    
    // Verification (Step 4)
    isVerified: { type: Boolean, default: false },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Superadmin
    verificationDate: Date,
    
    // Registration Progress
    registrationStep: { type: Number, enum: [1, 2, 3, 4], default: 1 },
    profileCompletion: { type: Number, min: 0, max: 100, default: 25 }
}, { timestamps: true });

// Calculate completion percentage
companySchema.methods.calculateCompletion = function() {
    let completion = 25; // Step 1 completed
    
    if (this.description && this.industry) completion += 25; // Step 2
    if (this.addresses && this.addresses.length > 0 && 
        this.contacts && this.contacts.length > 0) completion += 25; // Step 3
    if (this.isVerified) completion += 25; // Step 4
    
    return completion;
};

module.exports = mongoose.model('Company', companySchema);