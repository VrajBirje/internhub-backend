const AdminService = require('../services/adminService');
const { successResponse, errorResponse } = require('../utils/response');

class AdminController {
    // Company Management
    static async getPendingCompanies(req, res) {
        try {
            const { page = 1, limit = 10 } = req.query;
            const result = await AdminService.getPendingCompanies(parseInt(page), parseInt(limit));
            successResponse(res, 'Pending companies retrieved', result);
        } catch (error) {
            errorResponse(res, error.message, 400);
        }
    }

    static async getAllCompanies(req, res) {
        try {
            const { page = 1, limit = 10 } = req.query;
            const result = await AdminService.getAllCompanies(parseInt(page), parseInt(limit));
            successResponse(res, 'All companies retrieved', result);
        } catch (error) {
            errorResponse(res, error.message, 400);
        }
    }

    static async verifyCompany(req, res) {
        try {
            const { companyId } = req.params;
            const company = await AdminService.verifyCompany(companyId);
            successResponse(res, 'Company verified successfully', company);
        } catch (error) {
            errorResponse(res, error.message, 400);
        }
    }

    static async rejectCompany(req, res) {
        try {
            const { companyId } = req.params;
            const { reason } = req.body;
            const company = await AdminService.rejectCompany(companyId, reason);
            successResponse(res, 'Company verification rejected', company);
        } catch (error) {
            errorResponse(res, error.message, 400);
        }
    }

    // Student Management
    static async getAllStudents(req, res) {
        try {
            const { page = 1, limit = 10 } = req.query;
            const result = await AdminService.getAllStudents(parseInt(page), parseInt(limit));
            successResponse(res, 'All students retrieved', result);
        } catch (error) {
            errorResponse(res, error.message, 400);
        }
    }

    static async getStudentById(req, res) {
        try {
            const { studentId } = req.params;
            const student = await AdminService.getStudentById(studentId);
            successResponse(res, 'Student details retrieved', student);
        } catch (error) {
            errorResponse(res, error.message, 404);
        }
    }

    static async updateStudent(req, res) {
        try {
            const { studentId } = req.params;
            const student = await AdminService.updateStudent(studentId, req.body);
            successResponse(res, 'Student updated successfully', student);
        } catch (error) {
            errorResponse(res, error.message, 400);
        }
    }

    // Internship Management
    static async getPendingInternships(req, res) {
        try {
            const { page = 1, limit = 10 } = req.query;
            const result = await AdminService.getPendingInternships(parseInt(page), parseInt(limit));
            successResponse(res, 'Pending internships retrieved', result);
        } catch (error) {
            errorResponse(res, error.message, 400);
        }
    }

    static async approveInternship(req, res) {
        try {
            const { internshipId } = req.params;
            const approvedBy = req.user.userId;
            const internship = await AdminService.approveInternship(internshipId, approvedBy);
            successResponse(res, 'Internship approved successfully', internship);
        } catch (error) {
            errorResponse(res, error.message, 400);
        }
    }

    static async rejectInternship(req, res) {
        try {
            const { internshipId } = req.params;
            const { reason } = req.body;
            const rejectedBy = req.user.userId;
            const internship = await AdminService.rejectInternship(internshipId, reason, rejectedBy);
            successResponse(res, 'Internship rejected', internship);
        } catch (error) {
            errorResponse(res, error.message, 400);
        }
    }

    // User Management
    static async getAllUsers(req, res) {
        try {
            const { page = 1, limit = 10 } = req.query;
            const result = await AdminService.getAllUsers(parseInt(page), parseInt(limit));
            successResponse(res, 'All users retrieved', result);
        } catch (error) {
            errorResponse(res, error.message, 400);
        }
    }

    static async toggleUserStatus(req, res) {
        try {
            const { userId } = req.params;
            const result = await AdminService.toggleUserStatus(userId);
            successResponse(res, `User ${result.isActive ? 'activated' : 'deactivated'}`, result);
        } catch (error) {
            errorResponse(res, error.message, 400);
        }
    }

    // Dashboard
    static async getDashboardStats(req, res) {
        try {
            const stats = await AdminService.getDashboardStats();
            successResponse(res, 'Dashboard stats retrieved', stats);
        } catch (error) {
            errorResponse(res, error.message, 400);
        }
    }
}

module.exports = AdminController;