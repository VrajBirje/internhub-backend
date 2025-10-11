const express = require('express');
const AdminController = require('../controllers/adminController');
const { authenticate } = require('../middleware/auth');
const { isSuperadmin } = require('../middleware/authorize');

const router = express.Router();

// All routes require superadmin authentication
router.use(authenticate);
router.use(isSuperadmin);

// Dashboard
router.get('/dashboard/stats', AdminController.getDashboardStats);

// Company Management
router.get('/companies/pending', AdminController.getPendingCompanies);
router.get('/companies', AdminController.getAllCompanies);
router.put('/companies/:companyId/verify', AdminController.verifyCompany);
router.put('/companies/:companyId/reject', AdminController.rejectCompany);

// Student Management
router.get('/students', AdminController.getAllStudents);
router.get('/students/:studentId', AdminController.getStudentById);
router.put('/students/:studentId', AdminController.updateStudent);

// Internship Management
router.get('/internships/pending', AdminController.getPendingInternships);
router.put('/internships/:internshipId/approve', AdminController.approveInternship);
router.put('/internships/:internshipId/reject', AdminController.rejectInternship);

// User Management
router.get('/users', AdminController.getAllUsers);
router.put('/users/:userId/toggle-status', AdminController.toggleUserStatus);

module.exports = router;