const User = require('../models/User');
const Student = require('../models/Student');
const Company = require('../models/Company');
const Superadmin = require('../models/SuperAdmin');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { sendMail } = require('./mailService');
const { generateOtp } = require('../utils/otp');

const generateToken = (userId, userType) => {
    return jwt.sign(
        { userId, userType },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE }
    );
};

class AuthService {
    // Step 1: Create user and basic student profile
    static async registerStep1(userData) {
        const { username, email, password, ...studentData } = userData;

        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [{ email }, { username }]
        });

        if (existingUser) {
            throw new Error('User already exists with this email or username');
        }

        // Check if SAP ID already exists
        const existingStudent = await Student.findOne({ sapId: studentData.sapId });
        if (existingStudent) {
            throw new Error('SAP ID already registered');
        }

        // Create user
        const hashedPassword = await bcrypt.hash(password, 12);
        const user = new User({
            username,
            email,
            password: hashedPassword,
            userType: 'student'
        });

        await user.save();

        // Send email verification after initial registration (non-blocking)
        try {
            await AuthService.sendVerificationEmail(user);
        } catch (err) {
            // Log but do not fail registration if email sending fails
            console.error('Failed to send verification email:', err.message || err);
        }

        // Create student profile with step 1 data
        const student = new Student({
            user: user._id,
            sapId: studentData.sapId,
            firstName: studentData.firstName,
            lastName: studentData.lastName,
            dateOfBirth: studentData.dateOfBirth,
            gender: studentData.gender,
            phoneNumber: studentData.phoneNumber,
            alternateEmail: studentData.alternateEmail,
            profilePicture: studentData.profilePicture,
            registrationStep: 2, // Move to step 2
            profileCompletion: 25 // 25% complete
        });

        await student.save();

        const token = generateToken(user._id, 'student');

        return {
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                userType: user.userType
            },
            student: {
                registrationStep: student.registrationStep,
                profileCompletion: student.profileCompletion,
                isRegistrationComplete: student.isRegistrationComplete
            }
        };
    }

    // Update registration steps
    static async updateRegistrationStep(userId, stepData, stepNumber) {
        const student = await Student.findOne({ user: userId });

        if (!student) {
            throw new Error('Student profile not found');
        }

        // Validate step progression
        if (stepNumber !== student.registrationStep) {
            throw new Error(`Invalid step progression. Current step: ${student.registrationStep}`);
        }

        // Update based on step number
        switch (stepNumber) {
            case 2: // Education
                student.education = stepData;
                student.registrationStep = 3;
                break;

            case 3: // Skills, Experience, Projects
                if (stepData.skills) student.skills = stepData.skills;
                if (stepData.experiences) student.experiences = stepData.experiences;
                if (stepData.projects) student.projects = stepData.projects;
                student.registrationStep = 4;
                break;

            case 4: // Resume
                if (stepData.resumes) {
                    student.resumes = stepData.resumes;
                    student.isRegistrationComplete = true;
                }
                break;
        }

        // Update completion percentage
        student.profileCompletion = student.calculateCompletion();
        await student.save();

        return {
            registrationStep: student.registrationStep,
            profileCompletion: student.profileCompletion,
            isRegistrationComplete: student.isRegistrationComplete
        };
    }

    // Complete registration in one go (all steps)
    static async completeRegistration(userData) {
        const {
            username,
            email,
            password,
            // Step 1: Basic Info
            sapId,
            firstName,
            lastName,
            linkedin,
            github,
            dateOfBirth,
            gender,
            phoneNumber,
            alternateEmail,
            profilePicture,
            // Step 2: Education
            education,
            // Step 3: Skills, Experience, Projects
            skills,
            experiences,
            projects,
            // Step 4: Resume
            resumes
        } = userData;

        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [{ email }, { username }]
        });

        if (existingUser) {
            throw new Error('User already exists with this email or username');
        }

        // Check if SAP ID already exists
        const existingStudent = await Student.findOne({ sapId: sapId });
        if (existingStudent) {
            throw new Error('SAP ID already registered');
        }

        // Validate LinkedIn and GitHub URLs if provided
        const validateUrl = (url) => {
            if (!url) return true;
            try {
                new URL(url);
                return true;
            } catch {
                return false;
            }
        };

        if (linkedin && !validateUrl(linkedin)) {
            throw new Error('Invalid LinkedIn URL format');
        }

        if (github && !validateUrl(github)) {
            throw new Error('Invalid GitHub URL format');
        }

        // Validate phone number format
        const phoneRegex = /^[0-9]{10}$/;
        if (phoneNumber && !phoneRegex.test(phoneNumber)) {
            throw new Error('Invalid phone number format. Must be 10 digits');
        }

        // Validate date of birth (must be at least 16 years old)
        if (dateOfBirth) {
            const dob = new Date(dateOfBirth);
            const today = new Date();
            let age = today.getFullYear() - dob.getFullYear(); // CHANGED TO 'let'
            const monthDiff = today.getMonth() - dob.getMonth();

            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
                age--;
            }

            if (age < 16) {
                throw new Error('You must be at least 16 years old to register');
            }
        }

        // Create user
        const hashedPassword = await bcrypt.hash(password, 12);
        const user = new User({
            username,
            email,
            password: hashedPassword,
            userType: 'student'
        });

        await user.save();

        // Send email verification (non-blocking)
        try {
            await AuthService.sendVerificationEmail(user);
        } catch (err) {
            console.error('Failed to send verification email:', err.message || err);
        }

        // Create complete student profile
        const student = new Student({
            user: user._id,
            // Step 1 data
            sapId: sapId.toUpperCase(),
            firstName,
            lastName,
            linkedin,
            github,
            dateOfBirth: new Date(dateOfBirth), // Convert to Date object
            gender,
            phoneNumber,
            alternateEmail,
            profilePicture,
            // Step 2 data
            education: education || [],
            // Step 3 data
            skills: skills || [],
            experiences: experiences || [],
            projects: projects || [],
            // Step 4 data
            resumes: resumes || [],
            // Registration status
            registrationStep: resumes && resumes.length > 0 ? 4 : 3, // Changed from 5 to 4 (since enum is 1-4)
            isRegistrationComplete: true,
            profileCompletion: 100
        });

        await student.save();

        // Generate token
        const token = generateToken(user._id, 'student');

        return {
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                userType: user.userType
            },
            student: {
                id: student._id,
                registrationStep: student.registrationStep,
                profileCompletion: student.profileCompletion,
                isRegistrationComplete: student.isRegistrationComplete,
                hasResume: student.resumes && student.resumes.length > 0
            }
        };
    }

    // Superadmin registration (protected by environment variable)
    static async registerSuperadmin(userData, allowSuperadminCreation = false) {
        if (!allowSuperadminCreation) {
            throw new Error('Superadmin registration is disabled');
        }

        const { username, email, password, full_name, contact_number } = userData;

        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [{ email }, { username }]
        });

        if (existingUser) {
            throw new Error('User already exists with this email or username');
        }

        // Create user
        const hashedPassword = await bcrypt.hash(password, 12);
        const user = new User({
            username,
            email,
            password: hashedPassword,
            userType: 'superadmin'
        });

        await user.save();

        // Create superadmin profile
        const superadmin = new Superadmin({
            user_id: user._id,
            full_name,
            contact_number
        });

        await superadmin.save();

        const token = generateToken(user._id, 'superadmin');

        return {
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                userType: user.userType
            },
            superadmin: {
                full_name: superadmin.full_name
            }
        };
    }

    // Login
    // Update the login method in services/authService.js
    static async login(identifier, password) {
        const user = await User.findOne({
            $or: [{ email: identifier }, { username: identifier }]
        });

        if (!user) {
            throw new Error('Invalid credentials');
        }

        if (!user.isActive) {
            throw new Error('Account is deactivated');
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new Error('Invalid credentials');
        }

        user.lastLogin = new Date();
        await user.save();

        let profileData = {};

        if (user.userType === 'student') {
            const student = await Student.findOne({ user: user._id });
            if (!student) {
                throw new Error('Student profile not found');
            }

            profileData = {
                registrationStep: student.registrationStep,
                profileCompletion: student.profileCompletion,
                isRegistrationComplete: student.isRegistrationComplete
            };
        } else if (user.userType === 'company') {
            const company = await Company.findOne({ user: user._id });
            if (!company) {
                throw new Error('Company profile not found');
            }

            profileData = {
                registrationStep: company.registrationStep,
                profileCompletion: company.profileCompletion,
                isRegistrationComplete: company.profileCompletion === 100
            };
        } else if (user.userType === 'superadmin') {
            const superadmin = await Superadmin.findOne({ user_id: user._id });
            if (!superadmin) {
                throw new Error('Superadmin profile not found');
            }

            // Superadmin doesn't have registration steps, return empty or default values
            profileData = {
                registrationStep: 4, // Always complete for superadmin
                profileCompletion: 100, // Always 100% for superadmin
                isRegistrationComplete: true // Always true for superadmin
            };
        } else {
            throw new Error('Unsupported user type');
        }

        const token = generateToken(user._id, user.userType);

        return {
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                userType: user.userType
            },
            ...profileData
        };
    }


    // Get current registration status
    static async getRegistrationStatus(email) {
        // Find user by email
        const user = await User.findOne({ email }).select('_id');

        if (!user) {
            return {
                registrationStep: 0,
                profileCompletion: 0,
                isRegistrationComplete: false
            };
        }

        // Find student by user ID
        const student = await Student.findOne({ user: user._id })
            .select('registrationStep profileCompletion isRegistrationComplete');

        if (!student) {
            throw new Error('Student profile not found');
        }

        return {
            registrationStep: student.registrationStep,
            profileCompletion: student.profileCompletion,
            isRegistrationComplete: student.isRegistrationComplete
        };
    }

    /* ---------- SEND EMAIL OTP ---------- */
  static async sendEmailVerificationOtp(email) {
    const user = await User.findOne({ email });
    if (!user) throw new Error('No user found with this email');
    if (user.emailVerified) throw new Error('Email already verified');

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.emailOtp = otp;
    user.emailOtpExpiry = Date.now() + 10 * 60 * 1000;
    await user.save();

    await sendMail({
      to: user.email,
      subject: 'Verify your email address',
      html: `
        <p>Hello ${user.username || 'there'},</p>
        <p>Your verification code is:</p>
        <h2>${otp}</h2>
        <p>This code is valid for 10 minutes.</p>
      `
    });

    return { email: user.email };
  }

  /* ---------- VERIFY EMAIL OTP ---------- */
  static async verifyEmailOtp(email, otp) {
    if (!email || !otp) throw new Error('Email and OTP are required');

    const user = await User.findOne({
      email,
      emailOtp: otp,
      emailOtpExpiry: { $gt: Date.now() }
    });

    if (!user) throw new Error('Invalid or expired OTP');

    user.emailVerified = true;
    user.emailOtp = undefined;
    user.emailOtpExpiry = undefined;
    await user.save();

    return { emailVerified: true };
  }

  /* ---------- RESEND OTP ---------- */
  static async resendVerificationOtp(email) {
    return AuthService.sendEmailVerificationOtp(email);
  }

    // Verify email using token
    static async verifyEmailOtp(email, otp) {
        if (!email || !otp) throw new Error('Email and OTP are required');

        const user = await User.findOne({
            email,
            emailOtp: otp,
            emailOtpExpiry: { $gt: Date.now() }
        });

        if (!user) throw new Error('Invalid or expired verification code');

        user.emailVerified = true;
        user.emailOtp = undefined;
        user.emailOtpExpiry = undefined;
        await user.save();

        return { message: 'Email verified successfully' };
    }


    // Initiate forgot password flow
    static async forgotPassword(email) {
        if (!email) throw new Error('Email is required');

        const user = await User.findOne({ email });
        if (!user) throw new Error('No user found with this email');

        const otp = generateOtp();

        user.resetOtp = otp;
        user.resetOtpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes
        await user.save();

        const subject = 'Password reset verification code';
        const html = `
    <p>Hello ${user.username || 'there'},</p>
    <p>You requested to reset your password.</p>
    <p>Please use the verification code below:</p>
    <h2 style="letter-spacing:2px;">${otp}</h2>
    <p>This code is valid for <b>10 minutes</b>.</p>
    <p>If you did not request this, you can safely ignore this email.</p>
  `;

        await sendMail({
            to: user.email,
            subject,
            html,
            text: `Your password reset code is ${otp}. It expires in 10 minutes.`
        });

        return { message: 'Password reset OTP sent to your email' };
    }


    // Reset password using token
    static async resetPassword(email, otp, newPassword) {
        if (!email || !otp || !newPassword) {
            throw new Error('Email, OTP and new password are required');
        }

        const user = await User.findOne({
            email,
            resetOtp: otp,
            resetOtpExpiry: { $gt: Date.now() }
        });

        if (!user) throw new Error('Invalid or expired OTP');

        const hashed = await bcrypt.hash(newPassword, 12);
        user.password = hashed;
        user.resetOtp = undefined;
        user.resetOtpExpiry = undefined;

        await user.save();

        return { message: 'Password reset successfully' };
    }

}

module.exports = AuthService;