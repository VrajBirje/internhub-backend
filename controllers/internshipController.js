const InternshipService = require('../services/internshipService');
const { successResponse, errorResponse } = require('../utils/response');

class InternshipController {
    // Create internship (Company)
    static async createInternship(req, res) {
        try {
            const { companyId } = req.user; // Assuming user has companyId
            const internship = await InternshipService.createInternship(
                companyId, 
                req.body, 
                req.user.userId
            );
            successResponse(res, 'Internship created successfully', internship, 201);
        } catch (error) {
            errorResponse(res, error.message, 400);
        }
    }

    // Get company's internships
    static async getCompanyInternships(req, res) {
        try {
            const { companyId } = req.user;
            const { page = 1, limit = 10 } = req.query;
            const result = await InternshipService.getCompanyInternships(companyId, parseInt(page), parseInt(limit));
            successResponse(res, 'Company internships retrieved', result);
        } catch (error) {
            errorResponse(res, error.message, 400);
        }
    }

    // Get internship details
    static async getInternship(req, res) {
        try {
            const { id } = req.params;
            const internship = await InternshipService.getInternshipById(id);
            
            // Increment views
            await InternshipService.incrementViews(id);
            
            successResponse(res, 'Internship details retrieved', internship);
        } catch (error) {
            errorResponse(res, error.message, 404);
        }
    }

    // Update internship
    static async updateInternship(req, res) {
        try {
            const { companyId } = req.user;
            const { id } = req.params;
            const internship = await InternshipService.updateInternship(id, companyId, req.body);
            successResponse(res, 'Internship updated successfully', internship);
        } catch (error) {
            errorResponse(res, error.message, 400);
        }
    }

    // Delete internship
    static async deleteInternship(req, res) {
        try {
            const { companyId } = req.user;
            const { id } = req.params;
            const result = await InternshipService.deleteInternship(id, companyId);
            successResponse(res, result.message);
        } catch (error) {
            errorResponse(res, error.message, 400);
        }
    }

    // Toggle internship status
    static async toggleInternshipStatus(req, res) {
        try {
            const { companyId } = req.user;
            const { id } = req.params;
            const { isActive } = req.body;
            const internship = await InternshipService.toggleInternshipStatus(id, companyId, isActive);
            successResponse(res, `Internship ${isActive ? 'activated' : 'deactivated'}`, internship);
        } catch (error) {
            errorResponse(res, error.message, 400);
        }
    }

    // Get all internships (Public)
    static async getAllInternships(req, res) {
        try {
            const { page = 1, limit = 10, ...filters } = req.query;
            const result = await InternshipService.getAllInternships(filters, parseInt(page), parseInt(limit));
            successResponse(res, 'Internships retrieved', result);
        } catch (error) {
            errorResponse(res, error.message, 400);
        }
    }

    // Search internships (Public)
    static async searchInternships(req, res) {
        try {
            const { q, page = 1, limit = 10, ...filters } = req.query;
            if (!q) {
                return errorResponse(res, 'Search term is required', 400);
            }
            const result = await InternshipService.searchInternships(q, filters, parseInt(page), parseInt(limit));
            successResponse(res, 'Search results', result);
        } catch (error) {
            errorResponse(res, error.message, 400);
        }
    }
}

module.exports = InternshipController;