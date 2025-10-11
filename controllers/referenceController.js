const ReferenceService = require('../services/referenceService');
const { successResponse, errorResponse } = require('../utils/response');

class ReferenceController {
    // College Controllers
    static async getAllColleges(req, res) {
        try {
            const { page = 1, limit = 10, search = '' } = req.query;
            const result = await ReferenceService.getAllColleges(
                parseInt(page), 
                parseInt(limit), 
                search
            );
            successResponse(res, 'Colleges retrieved successfully', result);
        } catch (error) {
            errorResponse(res, error.message, 400);
        }
    }

    static async getCollegeById(req, res) {
        try {
            const { id } = req.params;
            const college = await ReferenceService.getCollegeById(id);
            successResponse(res, 'College retrieved successfully', college);
        } catch (error) {
            errorResponse(res, error.message, 404);
        }
    }

    static async createCollege(req, res) {
        try {
            const college = await ReferenceService.createCollege(req.body);
            successResponse(res, 'College created successfully', college, 201);
        } catch (error) {
            errorResponse(res, error.message, 400);
        }
    }

    // Branch Controllers
    static async getAllBranches(req, res) {
        try {
            const { page = 1, limit = 10, search = '' } = req.query;
            const result = await ReferenceService.getAllBranches(
                parseInt(page), 
                parseInt(limit), 
                search
            );
            successResponse(res, 'Branches retrieved successfully', result);
        } catch (error) {
            errorResponse(res, error.message, 400);
        }
    }

    static async getBranchById(req, res) {
        try {
            const { id } = req.params;
            const branch = await ReferenceService.getBranchById(id);
            successResponse(res, 'Branch retrieved successfully', branch);
        } catch (error) {
            errorResponse(res, error.message, 404);
        }
    }

    static async createBranch(req, res) {
        try {
            const branch = await ReferenceService.createBranch(req.body);
            successResponse(res, 'Branch created successfully', branch, 201);
        } catch (error) {
            errorResponse(res, error.message, 400);
        }
    }

    // Skill Controllers
    static async getAllSkills(req, res) {
        try {
            const { page = 1, limit = 10, search = '', category = '' } = req.query;
            const result = await ReferenceService.getAllSkills(
                parseInt(page), 
                parseInt(limit), 
                search,
                category
            );
            successResponse(res, 'Skills retrieved successfully', result);
        } catch (error) {
            errorResponse(res, error.message, 400);
        }
    }

    static async getSkillById(req, res) {
        try {
            const { id } = req.params;
            const skill = await ReferenceService.getSkillById(id);
            successResponse(res, 'Skill retrieved successfully', skill);
        } catch (error) {
            errorResponse(res, error.message, 404);
        }
    }

    static async createSkill(req, res) {
        try {
            const skill = await ReferenceService.createSkill(req.body);
            successResponse(res, 'Skill created successfully', skill, 201);
        } catch (error) {
            errorResponse(res, error.message, 400);
        }
    }

    static async getSkillCategories(req, res) {
        try {
            const categories = await ReferenceService.getSkillCategories();
            successResponse(res, 'Skill categories retrieved successfully', categories);
        } catch (error) {
            errorResponse(res, error.message, 400);
        }
    }
}

module.exports = ReferenceController;