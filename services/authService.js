const User = require('../models/User');
const Student = require('../models/Student');
const Company = require('../models/Company');
const Superadmin = require('../models/SuperAdmin');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

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
    static async getRegistrationStatus(userId) {
        const student = await Student.findOne({ user: userId });
        if (!student) {
            throw new Error('Student profile not found');
        }

        return {
            registrationStep: student.registrationStep,
            profileCompletion: student.profileCompletion,
            isRegistrationComplete: student.isRegistrationComplete
        };
    }
}

module.exports = AuthService;