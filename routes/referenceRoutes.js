const express = require('express');
const ReferenceController = require('../controllers/referenceController');
const { authenticate } = require('../middleware/auth');
const { isSuperadmin } = require('../middleware/authorize');

const router = express.Router();

// Public routes (No authentication required)
router.get('/colleges', ReferenceController.getAllColleges);
router.get('/colleges/:id', ReferenceController.getCollegeById);
router.get('/branches', ReferenceController.getAllBranches);
router.get('/branches/:id', ReferenceController.getBranchById);
router.get('/skills', ReferenceController.getAllSkills);
router.get('/skills/:id', ReferenceController.getSkillById);
router.get('/skills/categories/list', ReferenceController.getSkillCategories);

// Protected routes (Superadmin only)
router.use(authenticate);
router.use(isSuperadmin);

router.post('/colleges', ReferenceController.createCollege);
router.post('/branches', ReferenceController.createBranch);
router.post('/skills', ReferenceController.createSkill);

module.exports = router;