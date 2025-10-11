const ApplicationService = require('../services/applicationService');
const { successResponse, errorResponse } = require('../utils/response');

class ApplicationController {
    // Student: Apply to internship
    static async applyToInternship(req, res) {
        try {
            const { studentId } = req.user;
            const { internshipId } = req.params;
            const application = await ApplicationService.applyToInternship(
                internshipId, 
                studentId, 
                req.body
            );
            successResponse(res, 'Application submitted successfully', application, 201);
        } catch (error) {
            errorResponse(res, error.message, 400);
        }
    }

    // Student: Get my applications
    static async getStudentApplications(req, res) {
        try {
            const { studentId } = req.user;
            const { page = 1, limit = 10 } = req.query;
            const result = await ApplicationService.getStudentApplications(
                studentId, 
                parseInt(page), 
                parseInt(limit)
            );
            successResponse(res, 'Applications retrieved', result);
        } catch (error) {
            errorResponse(res, error.message, 400);
        }
    }

    // Student: Get application details
    static async getApplicationDetails(req, res) {
        try {
            const { studentId } = req.user;
            const { id } = req.params;
            const application = await ApplicationService.getApplicationById(id, studentId);
            successResponse(res, 'Application details retrieved', application);
        } catch (error) {
            errorResponse(res, error.message, 404);
        }
    }

    // Student: Withdraw application
    static async withdrawApplication(req, res) {
        try {
            const { studentId } = req.user;
            const { id } = req.params;
            const application = await ApplicationService.withdrawApplication(id, studentId);
            successResponse(res, 'Application withdrawn successfully', application);
        } catch (error) {
            errorResponse(res, error.message, 400);
        }
    }

    // Company: Get all applications
    static async getCompanyApplications(req, res) {
        try {
            const { companyId } = req.user;
            const { page = 1, limit = 10, ...filters } = req.query;
            const result = await ApplicationService.getCompanyApplications(
                companyId, 
                parseInt(page), 
                parseInt(limit),
                filters
            );
            successResponse(res, 'Company applications retrieved', result);
        } catch (error) {
            errorResponse(res, error.message, 400);
        }
    }

    // Company: Get internship applications
    static async getInternshipApplications(req, res) {
        try {
            const { companyId } = req.user;
            const { internshipId } = req.params;
            const { page = 1, limit = 10, ...filters } = req.query;
            const result = await ApplicationService.getInternshipApplications(
                internshipId,
                companyId,
                parseInt(page), 
                parseInt(limit),
                filters
            );
            successResponse(res, 'Internship applications retrieved', result);
        } catch (error) {
            errorResponse(res, error.message, 400);
        }
    }

    // Company: Update application status
    static async updateApplicationStatus(req, res) {
        try {
            const { companyId } = req.user;
            const { id } = req.params;
            const application = await ApplicationService.updateApplicationStatus(
                id, 
                companyId, 
                req.body
            );
            successResponse(res, 'Application status updated', application);
        } catch (error) {
            errorResponse(res, error.message, 400);
        }
    }

    // Company: Get application statistics
    static async getApplicationStats(req, res) {
        try {
            const { companyId } = req.user;
            const stats = await ApplicationService.getApplicationStats(companyId);
            successResponse(res, 'Application statistics retrieved', stats);
        } catch (error) {
            errorResponse(res, error.message, 400);
        }
    }
}

module.exports = ApplicationController;