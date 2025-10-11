const express = require('express');
const StudentController = require('../controllers/studentController');
const { authenticate } = require('../middleware/auth');
const { isStudent, isSuperadmin } = require('../middleware/authorize');
const multer = require('multer');

const router = express.Router();

// File uploads
const upload = multer({ dest: 'uploads/' });

// -------- BASIC PROFILE --------
router.get('/profile', authenticate, isStudent, StudentController.getProfile);
router.put('/profile', authenticate, isStudent, StudentController.updateProfile);
router.post('/profile/photo', authenticate, isStudent, upload.single('photo'), StudentController.uploadPhoto);

// -------- EDUCATION --------
router.get('/education', authenticate, isStudent, StudentController.getEducation);
router.post('/education', authenticate, isStudent, StudentController.addEducation);
router.put('/education', authenticate, isStudent, StudentController.updateEducation);
router.delete('/education/:id', authenticate, isStudent, StudentController.deleteEducation);

// -------- SKILLS --------
router.get('/skills', authenticate, isStudent, StudentController.getSkills);
router.post('/skills', authenticate, isStudent, StudentController.addSkill);
router.delete('/skills/:id', authenticate, isStudent, StudentController.deleteSkill);

// -------- EXPERIENCE --------
router.get('/experience', authenticate, isStudent, StudentController.getExperience);
router.post('/experience', authenticate, isStudent, StudentController.addExperience);
router.put('/experience/:id', authenticate, isStudent, StudentController.updateExperience);
router.delete('/experience/:id', authenticate, isStudent, StudentController.deleteExperience);

// -------- PROJECTS --------
router.get('/projects', authenticate, isStudent, StudentController.getProjects);
router.post('/projects', authenticate, isStudent, StudentController.addProject);
router.delete('/projects/:id', authenticate, isStudent, StudentController.deleteProject);

// -------- RESUMES --------
router.get('/resumes', authenticate, isStudent, StudentController.getResumes);
router.post('/resumes', authenticate, isStudent, StudentController.uploadResume);
router.put('/resumes/:id/default', authenticate, isStudent, StudentController.setDefaultResume);
router.delete('/resumes/:id', authenticate, isStudent, StudentController.deleteResume);

// -------- ADMIN APIs --------
router.get('/admin/all', authenticate, isSuperadmin, StudentController.getAllStudents);
router.put('/admin/:id', authenticate, isSuperadmin, StudentController.editStudent);

module.exports = router;