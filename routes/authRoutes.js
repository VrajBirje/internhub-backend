const express = require('express');
const AuthController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/register/step1', AuthController.registerStep1);
router.post('/register/complete', AuthController.completeRegistration);

router.post('/login', AuthController.login);

router.post('/send-verification-email', AuthController.sendVerificationEmail);
router.post('/verify-email', AuthController.verifyEmail);
router.post('/resend-verification', AuthController.resendVerification);

router.post('/forgot-password', AuthController.forgotPassword);
router.post('/reset-password', AuthController.resetPassword);

// Protected routes (require authentication)
router.put('/register/step/:step', authenticate, AuthController.updateRegistration);
router.get('/registration-status', AuthController.getRegistrationStatus);

router.post('/register/superadmin', AuthController.registerSuperadmin);

module.exports = router;