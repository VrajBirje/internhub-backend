const Company = require('../models/Company');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const NotificationService = require('./notificationService');
const jwt = require('jsonwebtoken');

class CompanyService {
    // Step 1: Create user and basic company profile
    static async registerStep1(userData) {
        const { username, email, password, ...companyData } = userData;

        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [{ email }, { username }]
        });

        if (existingUser) {
            throw new Error('User already exists with this email or username');
        }

        // Check if company name already exists
        const existingCompany = await Company.findOne({ companyName: companyData.companyName });
        if (existingCompany) {
            throw new Error('Company name already registered');
        }

        // Create user
        const hashedPassword = await bcrypt.hash(password, 12);
        const user = new User({
            username,
            email,
            password: hashedPassword,
            userType: 'company'
        });

        await user.save();

        // Create company profile
        const company = new Company({
            user: user._id,
            companyName: companyData.companyName,
            registrationStep: 2,
            profileCompletion: 25
        });

        await company.save();

        // ✅ Generate JWT token
        const token = jwt.sign(
            { userId: user._id, userType: user.userType },
            process.env.JWT_SECRET,
            { expiresIn: '7d' } // optional, e.g., valid for 7 days
        );

        // ✅ Return user + token
        return {
            token, // <-- frontend can store this in localStorage or headers
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                userType: user.userType
            },
            company: {
                registrationStep: company.registrationStep,
                profileCompletion: company.profileCompletion,
                isRegistrationComplete: company.isRegistrationComplete
            }
        };
    }


    // Update registration steps
    static async updateRegistrationStep(userId, stepData, stepNumber) {
        const company = await Company.findOne({ user: userId });

        if (!company) {
            throw new Error('Company profile not found');
        }

        // Validate step progression
        if (stepNumber !== company.registrationStep) {
            throw new Error(`Invalid step progression. Current step: ${company.registrationStep}`);
        }

        // Update based on step number
        switch (stepNumber) {
            case 2: // Company Details
                company.description = stepData.description;
                company.industry = stepData.industry;
                company.websiteUrl = stepData.websiteUrl;
                company.foundedYear = stepData.foundedYear;
                company.companySize = stepData.companySize;
                company.logoUrl = stepData.logoUrl;
                company.registrationStep = 3;
                break;

            case 3: // Addresses & Contacts
                if (stepData.addresses) company.addresses = stepData.addresses;
                if (stepData.contacts) company.contacts = stepData.contacts;
                company.registrationStep = 4;
                break;

            case 4: // Verification (admin does this, but mark as complete)
                // Verification is done by admin, so we just mark step as complete
                company.registrationStep = 4;
                break;
        }

        // Update completion percentage
        company.profileCompletion = company.calculateCompletion();
        await company.save();

        return {
            registrationStep: company.registrationStep,
            profileCompletion: company.profileCompletion,
            isRegistrationComplete: company.profileCompletion === 100
        };
    }

    // Get company profile
    static async getCompanyProfile(userId) {
        const company = await Company.findOne({ user: userId })
            .populate('user', '-password -resetToken -resetTokenExpiry');

        if (!company) {
            throw new Error('Company profile not found');
        }

        return company;
    }

    // Update company details
    static async updateCompanyDetails(userId, data) {
        const company = await Company.findOneAndUpdate(
            { user: userId },
            { $set: data },
            { new: true }
        ).populate('user', '-password');

        if (!company) throw new Error('Company profile not found');
        return company;
    }

    // Add address
    static async addAddress(userId, addressData) {
        const company = await Company.findOne({ user: userId });
        if (!company) throw new Error('Company profile not found');

        company.addresses.push(addressData);
        await company.save();
        return company.addresses;
    }

    // Add contact
    static async addContact(userId, contactData) {
        const company = await Company.findOne({ user: userId });
        if (!company) throw new Error('Company profile not found');

        company.contacts.push(contactData);
        await company.save();
        return company.contacts;
    }

    // Get registration status
    static async getRegistrationStatus(userId) {
        const company = await Company.findOne({ user: userId });
        if (!company) {
            throw new Error('Company profile not found');
        }

        return {
            registrationStep: company.registrationStep,
            profileCompletion: company.profileCompletion,
            isRegistrationComplete: company.profileCompletion === 100
        };
    }
    // Address CRUD
    static async getAddresses(userId) {
        const company = await Company.findOne({ user: userId });
        if (!company) throw new Error('Company profile not found');
        return company.addresses;
    }

    static async updateAddress(userId, addressId, data) {
        const company = await Company.findOne({ user: userId });
        if (!company) throw new Error('Company profile not found');

        const address = company.addresses.id(addressId);
        if (!address) throw new Error('Address not found');

        Object.assign(address, data);
        await company.save();
        return address;
    }

    static async deleteAddress(userId, addressId) {
        const company = await Company.findOne({ user: userId });
        if (!company) throw new Error('Company profile not found');

        company.addresses = company.addresses.filter(a => !a._id.equals(addressId));
        await company.save();
        return company.addresses;
    }

    // Contact CRUD
    static async getContacts(userId) {
        const company = await Company.findOne({ user: userId });
        if (!company) throw new Error('Company profile not found');
        return company.contacts;
    }

    static async updateContact(userId, contactId, data) {
        const company = await Company.findOne({ user: userId });
        if (!company) throw new Error('Company profile not found');

        const contact = company.contacts.id(contactId);
        if (!contact) throw new Error('Contact not found');

        Object.assign(contact, data);
        await company.save();
        return contact;
    }

    static async deleteContact(userId, contactId) {
        const company = await Company.findOne({ user: userId });
        if (!company) throw new Error('Company profile not found');

        company.contacts = company.contacts.filter(c => !c._id.equals(contactId));
        await company.save();
        return company.contacts;
    }

    // Superadmin: list pending companies
    static async getPendingCompanies() {
        return Company.find({ isVerified: false });
    }

    static async verifyCompany(companyId) {
        const company = await Company.findById(companyId);
        if (!company) throw new Error('Company not found');

        company.isVerified = true;
        company.registrationStep = 4;
        company.profileCompletion = 100; // Set to 100% when verified
        company.verificationDate = new Date();

        await company.save();
        await NotificationService.notifyCompanyVerification(company, true);
        return company;
    }

    static async rejectCompany(companyId) {
        const company = await Company.findById(companyId);
        if (!company) throw new Error('Company not found');

        await company.remove();
        // await NotificationService.notifyCompanyVerification(company, false);
        return { message: 'Company rejected and deleted' };
    }
    // Upload logo
    static async uploadLogo(userId, url) {
        if (!url) throw new Error('Logo URL is required');
        const company = await Company.findOne({ user: userId });
        if (!student) throw new Error('Student profile not found');

        student.logo = url; // ✅ store only URL
        await student.save();
        return { url: student.logo };
    }
}

module.exports = CompanyService;