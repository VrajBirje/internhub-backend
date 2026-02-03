const express = require('express');
const CompanyController = require('../controllers/companyController');
const { authenticate } = require('../middleware/auth');
const {isCompany} = require('../middleware/authorize');
const {isSuperadmin} = require('../middleware/authorize');

const router = express.Router();

// Public
router.post('/register/step1', CompanyController.registerStep1);

// Public routes
router.post('/register/complete', CompanyController.completeRegistration);
router.post('/verify/send-email', CompanyController.sendEmailVerification);
router.post('/verify/email', CompanyController.verifyEmail);
router.post('/verify/resend', CompanyController.resendVerification);

router.get('/profile/superadmin/:userId', CompanyController.getProfileById);

// Protected
router.use(authenticate);

// Profile
router.put('/register/step/:step', CompanyController.updateRegistration);
router.get('/profile', CompanyController.getProfile);
router.put('/profile', isCompany, CompanyController.updateDetails);
router.post('/logo', isCompany, CompanyController.uploadLogo);
// Addresses
router.get('/addresses', CompanyController.getAddresses);
router.post('/addresses', isCompany, CompanyController.addAddress);
router.put('/addresses/:id', isCompany, CompanyController.updateAddress);
router.delete('/addresses/:id', isCompany, CompanyController.deleteAddress);

// Contacts
router.get('/contacts', CompanyController.getContacts);
router.post('/contacts', isCompany, CompanyController.addContact);
router.put('/contacts/:id', isCompany, CompanyController.updateContact);
router.delete('/contacts/:id', isCompany, CompanyController.deleteContact);

// Registration status
router.get('/registration-status', CompanyController.getRegistrationStatus);

module.exports = router;
