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
            const { userId } = req.user;
            const status = await AuthService.getRegistrationStatus(userId);
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

    // Verify email (GET with token)
    static async verifyEmail(req, res) {
        try {
            const { token } = req.query;
            const result = await AuthService.verifyEmail(token);
            successResponse(res, 'Email verified', result);
        } catch (error) {
            errorResponse(res, error.message, 400);
        }
    }

    // Resend verification email
    static async resendVerification(req, res) {
        try {
            const { email } = req.body;
            if (!email) return errorResponse(res, 'Email is required', 400);
            const user = await AuthService.resendVerification ? await AuthService.resendVerification(email) : null;
            successResponse(res, 'Verification email sent', user || {});
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
            const { token, newPassword } = req.body;
            if (!token || !newPassword) return errorResponse(res, 'Token and new password required', 400);
            const result = await AuthService.resetPassword(token, newPassword);
            successResponse(res, 'Password reset successful', result);
        } catch (error) {
            errorResponse(res, error.message, 400);
        }
    }
}

module.exports = AuthController;