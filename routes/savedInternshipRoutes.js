const express = require('express');
const SavedInternshipController = require('../controllers/savedInternshipController');
const { authenticate } = require('../middleware/auth');
const { isStudent } = require('../middleware/authorize');

const router = express.Router();

// All routes require student authentication
router.use(authenticate);
router.use(isStudent);

router.post('/:internshipId', SavedInternshipController.saveInternship);
router.get('/', SavedInternshipController.getSavedInternships);
router.delete('/:internshipId', SavedInternshipController.removeSavedInternship);
router.get('/:internshipId/check', SavedInternshipController.checkIfSaved);

module.exports = router;