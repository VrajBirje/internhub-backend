const SavedInternshipService = require('../services/savedInternshipService');
const { successResponse, errorResponse } = require('../utils/response');

class SavedInternshipController {
    // Save internship
    static async saveInternship(req, res) {
        try {
            const { studentId } = req.user;
            const { internshipId } = req.params;
            const result = await SavedInternshipService.saveInternship(studentId, internshipId);
            successResponse(res, result.message);
        } catch (error) {
            errorResponse(res, error.message, 400);
        }
    }

    // Get saved internships
    static async getSavedInternships(req, res) {
        try {
            const { studentId } = req.user;
            const { page = 1, limit = 10 } = req.query;
            const result = await SavedInternshipService.getSavedInternships(
                studentId, 
                parseInt(page), 
                parseInt(limit)
            );
            successResponse(res, 'Saved internships retrieved', result);
        } catch (error) {
            errorResponse(res, error.message, 400);
        }
    }

    // Remove saved internship
    static async removeSavedInternship(req, res) {
        try {
            const { studentId } = req.user;
            const { internshipId } = req.params;
            const result = await SavedInternshipService.removeSavedInternship(studentId, internshipId);
            successResponse(res, result.message);
        } catch (error) {
            errorResponse(res, error.message, 400);
        }
    }

    // Check if internship is saved
    static async checkIfSaved(req, res) {
        try {
            const { studentId } = req.user;
            const { internshipId } = req.params;
            const result = await SavedInternshipService.checkIfSaved(studentId, internshipId);
            successResponse(res, 'Saved status checked', result);
        } catch (error) {
            errorResponse(res, error.message, 400);
        }
    }
}

module.exports = SavedInternshipController;