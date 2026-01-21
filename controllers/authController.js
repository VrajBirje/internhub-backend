const AuthService = require('../services/authService');
const { successResponse, errorResponse } = require('../utils/response');

class AuthController {
    // Step 1: Initial registration
    static async registerStep1(req, res) {
        try {
            const result = await AuthService.registerStep1(req.body);
            successResponse(res, 'Registration step 1 completed', result, 201);
        } catch (error) {
            errorResponse(res, error.message, 400);
        }
    }

    // Update registration steps (2, 3, 4)
    static async updateRegistration(req, res) {
        try {
            const { userId } = req.user;
            const { step } = req.params;
            const stepNumber = parseInt(step);

            if (![2, 3, 4].includes(stepNumber)) {
                return errorResponse(res, 'Invalid step number', 400);
            }

            const result = await AuthService.updateRegistrationStep(userId, req.body, stepNumber);
            successResponse(res, `Registration step ${stepNumber} completed`, result);
        } catch (error) {
            errorResponse(res, error.message, 400);
        }
    }

    // Complete registration (all steps at once)
    static async completeRegistration(req, res) {
        try {
            const result = await AuthService.completeRegistration(req.body);
            successResponse(res, 'Registration completed successfully', result, 201);
        } catch (error) {
            errorResponse(res, error.message, 400);
        }
    }

    // Login
    static async login(req, res) {
        try {
            const { identifier, password } = req.body;

            if (!identifier || !password) {
                return errorResponse(res, 'Email/username and password are required', 400);
            }

            const result = await AuthService.login(identifier, password);
            successResponse(res, 'Login successful', result);
        } catch (error) {
            errorResponse(res, error.message, 401);
        }
    }

    // Get registration status
    static async getRegistrationStatus(req, res) {
        try {
            const { email } = req.body;
            const status = await AuthService.getRegistrationStatus(email);
            successResponse(res, 'Registration status retrieved', status);
        } catch (error) {
            errorResponse(res, error.message, 404);
        }
    }

    // Superadmin registration
    static async registerSuperadmin(req, res) {
        try {
            const allowSuperadminCreation = process.env.ALLOW_SUPERADMIN_CREATION === 'true';
            const result = await AuthService.registerSuperadmin(req.body, allowSuperadminCreation);
            successResponse(res, 'Superadmin registered successfully', result, 201);
        } catch (error) {
            errorResponse(res, error.message, 400);
        }
    }

    // SEND OTP
    static async sendVerificationEmail(req, res) {
        try {
            const { email } = req.body;
            if (!email) return errorResponse(res, 'Email is required', 400);

            const result = await AuthService.sendEmailVerificationOtp(email);
            successResponse(res, 'OTP sent successfully', result);
        } catch (error) {
            errorResponse(res, error.message, 400);
        }
    }

    // VERIFY OTP (POST, not GET)
    static async verifyEmail(req, res) {
        try {
            const { email, otp } = req.body;
            const result = await AuthService.verifyEmailOtp(email, otp);
            successResponse(res, 'Email verified successfully', result);
        } catch (error) {
            errorResponse(res, error.message, 400);
        }
    }

    // RESEND OTP
    static async resendVerification(req, res) {
        try {
            const { email } = req.body;
            if (!email) return errorResponse(res, 'Email is required', 400);

            const result = await AuthService.resendVerificationOtp(email);
            successResponse(res, 'OTP resent successfully', result);
        } catch (error) {
            errorResponse(res, error.message, 400);
        }
    }

    // Forgot password
    static async forgotPassword(req, res) {
        try {
            const { email } = req.body;
            if (!email) return errorResponse(res, 'Email is required', 400);
            const result = await AuthService.forgotPassword(email);
            successResponse(res, 'Password reset email sent', result);
        } catch (error) {
            errorResponse(res, error.message, 400);
        }
    }

    // Reset password
    static async resetPassword(req, res) {
        try {
            const { email, otp, newPassword } = req.body;
            if (!email || !otp || !newPassword) return errorResponse(res, 'Email, OTP and new password required', 400);
            const result = await AuthService.resetPassword(email, otp, newPassword);
            successResponse(res, 'Password reset successful', result);
        } catch (error) {
            errorResponse(res, error.message, 400);
        }
    }
}

module.exports = AuthController;