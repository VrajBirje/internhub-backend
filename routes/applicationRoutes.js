const express = require('express');
const ApplicationController = require('../controllers/applicationController');
const { authenticate } = require('../middleware/auth');
const { isStudent, isCompanyVerified } = require('../middleware/authorize');

const router = express.Router();

// Student routes
router.use('/students', authenticate, isStudent);
router.post('/students/internships/:internshipId/apply', ApplicationController.applyToInternship);
router.get('/students/applications', ApplicationController.getStudentApplications);
router.get('/students/applications/:id', ApplicationController.getApplicationDetails);
router.put('/students/applications/:id/withdraw', ApplicationController.withdrawApplication);

// Company routes
router.use('/companies', authenticate, isCompanyVerified);
router.get('/companies/applications', ApplicationController.getCompanyApplications);
router.get('/companies/internships/:internshipId/applications', ApplicationController.getInternshipApplications);
router.put('/companies/applications/:id/status', ApplicationController.updateApplicationStatus);
router.get('/companies/applications/stats', ApplicationController.getApplicationStats);

module.exports = router;