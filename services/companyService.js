const Company = require('../models/Company');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const NotificationService = require('./notificationService');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

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

    // Complete company registration in one go (all 4 steps)
    static async completeRegistration(companyData) {
        const {
            // Step 1: Basic Info
            username,
            email,
            password,
            companyName,
            
            // Step 2: Company Details
            description,
            industry,
            websiteUrl,
            foundedYear,
            companySize,
            logoUrl,
            
            // Step 3: Addresses & Contacts
            addresses,
            contacts
        } = companyData;

        // Validate required fields
        if (!username || !email || !password || !companyName) {
            throw new Error('Username, email, password, and company name are required');
        }

        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [{ email }, { username }]
        });

        if (existingUser) {
            throw new Error('User already exists with this email or username');
        }

        // Check if company name already exists
        const existingCompany = await Company.findOne({ companyName });
        if (existingCompany) {
            throw new Error('Company name already registered');
        }

        // Validate website URL if provided
        if (websiteUrl) {
            try {
                new URL(websiteUrl);
            } catch {
                throw new Error('Invalid website URL format');
            }
        }

        // Validate founded year
        if (foundedYear) {
            const currentYear = new Date().getFullYear();
            if (foundedYear < 1800 || foundedYear > currentYear) {
                throw new Error(`Founded year must be between 1800 and ${currentYear}`);
            }
        }

        // Validate addresses structure
        if (addresses && Array.isArray(addresses)) {
            addresses.forEach((address, index) => {
                if (!address.addressLine1 || !address.city || !address.state || !address.pincode) {
                    throw new Error(`Address ${index + 1} is missing required fields`);
                }
            });
        }

        // Validate contacts structure
        if (contacts && Array.isArray(contacts)) {
            contacts.forEach((contact, index) => {
                if (!contact.contactName || !contact.email || !contact.phoneNumber) {
                    throw new Error(`Contact ${index + 1} is missing required fields`);
                }
                
                // Validate email format
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(contact.email)) {
                    throw new Error(`Contact ${index + 1} has invalid email format`);
                }
                
                // Validate phone number (basic validation)
                const phoneRegex = /^[0-9]{10}$/;
                if (!phoneRegex.test(contact.phoneNumber)) {
                    throw new Error(`Contact ${index + 1} phone number must be 10 digits`);
                }
            });
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

        // Send email verification (non-blocking)
        try {
            await this.sendEmailVerificationOtp(email);
        } catch (err) {
            console.error('Failed to send verification email:', err.message);
            // Don't throw error - registration should continue even if email fails
        }

        // Create complete company profile
        const company = new Company({
            user: user._id,
            // Step 1 data
            companyName,
            // Step 2 data
            description,
            industry,
            websiteUrl,
            foundedYear,
            companySize,
            logoUrl,
            // Step 3 data
            addresses: addresses || [],
            contacts: contacts || [],
            // Step 4 will be handled by admin verification
            // Registration status
            registrationStep: 4, // All steps completed by user
            isRegistrationComplete: true,
            profileCompletion: 75 // 25% for step 1, 25% for step 2, 25% for step 3, 25% pending for verification
        });

        await company.save();

        // Generate JWT token
        const token = jwt.sign(
            { 
                userId: user._id, 
                userType: user.userType,
                email: user.email,
                companyId: company._id 
            },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        return {
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                userType: user.userType,
                emailVerified: user.emailVerified || false
            },
            company: {
                id: company._id,
                companyName: company.companyName,
                registrationStep: company.registrationStep,
                profileCompletion: company.profileCompletion,
                isRegistrationComplete: company.isRegistrationComplete,
                isVerified: company.isVerified
            }
        };
    }

    /* ---------- EMAIL VERIFICATION METHODS ---------- */

    // Send email verification OTP
    static async sendEmailVerificationOtp(email) {
        const user = await User.findOne({ email });
        if (!user) {
            throw new Error('No user found with this email');
        }
        
        if (user.emailVerified) {
            throw new Error('Email already verified');
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Save OTP to user (expires in 10 minutes)
        user.emailOtp = otp;
        user.emailOtpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes
        await user.save();

        // Send email
        await this.sendVerificationEmail(user, otp);

        return { 
            message: 'Verification email sent successfully',
            email: user.email,
            expiresIn: '10 minutes'
        };
    }

    // Verify email OTP
    static async verifyEmailOtp(email, otp) {
        if (!email || !otp) {
            throw new Error('Email and OTP are required');
        }

        const user = await User.findOne({
            email,
            emailOtp: otp,
            emailOtpExpiry: { $gt: Date.now() }
        });

        if (!user) {
            throw new Error('Invalid or expired OTP');
        }

        // Mark email as verified
        user.emailVerified = true;
        user.emailOtp = undefined;
        user.emailOtpExpiry = undefined;
        await user.save();

        return { 
            success: true, 
            message: 'Email verified successfully',
            emailVerified: true 
        };
    }

    // Resend verification OTP
    static async resendVerificationOtp(email) {
        return this.sendEmailVerificationOtp(email);
    }

    /* ---------- PRIVATE HELPER METHODS ---------- */

    // Send verification email
    static async sendVerificationEmail(user, otp) {
        // Create email transporter
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });

        const mailOptions = {
            from: `"Company Portal" <${process.env.SMTP_FROM}>`,
            to: user.email,
            subject: 'Verify Your Email Address',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
                        <h1 style="color: white; margin: 0;">Company Portal</h1>
                    </div>
                    
                    <div style="padding: 30px; background-color: #f9f9f9;">
                        <h2 style="color: #333;">Email Verification</h2>
                        <p style="color: #666; font-size: 16px; line-height: 1.6;">
                            Hello ${user.username},<br><br>
                            Thank you for registering with Company Portal. Please use the OTP below to verify your email address:
                        </p>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <div style="background: white; padding: 20px; border-radius: 10px; display: inline-block; border: 2px dashed #667eea;">
                                <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #764ba2;">
                                    ${otp}
                                </span>
                            </div>
                        </div>
                        
                        <p style="color: #666; font-size: 14px;">
                            This OTP is valid for 10 minutes.<br>
                            If you didn't create an account, please ignore this email.
                        </p>
                    </div>
                    
                    <div style="background-color: #f1f1f1; padding: 20px; text-align: center; color: #888; font-size: 12px;">
                        <p>&copy; ${new Date().getFullYear()} Company Portal. All rights reserved.</p>
                    </div>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
    }

    // Helper method to generate JWT token
    static generateToken(userId, userType) {
        return jwt.sign(
            { userId, userType },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
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