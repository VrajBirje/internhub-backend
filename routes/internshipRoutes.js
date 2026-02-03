const express = require('express');
const InternshipController = require('../controllers/internshipController');
const { authenticate } = require('../middleware/auth');
const { isCompanyVerified } = require('../middleware/authorize');

const router = express.Router();

// Public routes
router.get('/', InternshipController.getAllInternships);
router.get('/search', InternshipController.searchInternships);
router.get('/:id', InternshipController.getInternship);
router.get('/admin/my-internships', InternshipController.getCompanyInternshipsAdmin);

// Company protected routes
router.use(authenticate);
router.use(isCompanyVerified); // Middleware to ensure user is a company

router.post('/', InternshipController.createInternship);
router.get('/company/my-internships', InternshipController.getCompanyInternships);
router.put('/:id', InternshipController.updateInternship);
router.delete('/:id', InternshipController.deleteInternship);
router.put('/:id/status', InternshipController.toggleInternshipStatus);

module.exports = router;