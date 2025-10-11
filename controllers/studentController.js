const StudentService = require('../services/studentService');
const { successResponse, errorResponse } = require('../utils/response');

class StudentController {
    // -------- BASIC PROFILE --------
    static async getProfile(req, res) {
        try {
            const { userId } = req.user;
            const profile = await StudentService.getProfile(userId);
            successResponse(res, 'Student profile retrieved', profile);
        } catch (error) {
            errorResponse(res, error.message, 404);
        }
    }

    static async updateProfile(req, res) {
        try {
            const { userId } = req.user;
            const updated = await StudentService.updateProfile(userId, req.body);
            successResponse(res, 'Profile updated successfully', updated);
        } catch (error) {
            errorResponse(res, error.message, 400);
        }
    }

    static async uploadPhoto(req, res) {
        try {
            const { userId } = req.user;
            const photoUrl = await StudentService.uploadPhoto(userId, req.file);
            successResponse(res, 'Profile picture uploaded', { photoUrl });
        } catch (error) {
            errorResponse(res, error.message, 400);
        }
    }

    // -------- EDUCATION --------
    static async getEducation(req, res) {
        try {
            const { userId } = req.user;
            const education = await StudentService.getEducation(userId);
            successResponse(res, 'Education retrieved', education);
        } catch (error) {
            errorResponse(res, error.message, 404);
        }
    }

    static async addEducation(req, res) {
        try {
            const { userId } = req.user;
            const education = await StudentService.addEducation(userId, req.body);
            successResponse(res, 'Education added', education, 201);
        } catch (error) {
            errorResponse(res, error.message, 400);
        }
    }

    static async updateEducation(req, res) {
        try {
            const { userId } = req.user;
            const education = await StudentService.updateEducation(userId, req.body);
            successResponse(res, 'Education updated', education);
        } catch (error) {
            errorResponse(res, error.message, 400);
        }
    }

    static async deleteEducation(req, res) {
        try {
            const { userId } = req.user;
            const { id } = req.params;
            await StudentService.deleteEducation(userId, id);
            successResponse(res, 'Education removed');
        } catch (error) {
            errorResponse(res, error.message, 400);
        }
    }

    // -------- SKILLS --------
    static async getSkills(req, res) {
        try {
            const { userId } = req.user;
            const skills = await StudentService.getSkills(userId);
            successResponse(res, 'Skills retrieved', skills);
        } catch (error) {
            errorResponse(res, error.message, 404);
        }
    }

    static async addSkill(req, res) {
        try {
            const { userId } = req.user;
            const skill = await StudentService.addSkill(userId, req.body);
            successResponse(res, 'Skill added', skill, 201);
        } catch (error) {
            errorResponse(res, error.message, 400);
        }
    }

    static async deleteSkill(req, res) {
        try {
            const { userId } = req.user;
            const { id } = req.params;
            await StudentService.deleteSkill(userId, id);
            successResponse(res, 'Skill removed');
        } catch (error) {
            errorResponse(res, error.message, 400);
        }
    }

    // -------- EXPERIENCE --------
    static async getExperience(req, res) {
        try {
            const { userId } = req.user;
            const exp = await StudentService.getExperience(userId);
            successResponse(res, 'Experiences retrieved', exp);
        } catch (error) {
            errorResponse(res, error.message, 404);
        }
    }

    static async addExperience(req, res) {
        try {
            const { userId } = req.user;
            const exp = await StudentService.addExperience(userId, req.body);
            successResponse(res, 'Experience added', exp, 201);
        } catch (error) {
            errorResponse(res, error.message, 400);
        }
    }

    static async updateExperience(req, res) {
        try {
            const { userId } = req.user;
            const { id } = req.params;
            const exp = await StudentService.updateExperience(userId, id, req.body);
            successResponse(res, 'Experience updated', exp);
        } catch (error) {
            errorResponse(res, error.message, 400);
        }
    }

    static async deleteExperience(req, res) {
        try {
            const { userId } = req.user;
            const { id } = req.params;
            await StudentService.deleteExperience(userId, id);
            successResponse(res, 'Experience removed');
        } catch (error) {
            errorResponse(res, error.message, 400);
        }
    }

    // -------- PROJECTS --------
    static async getProjects(req, res) {
        try {
            const { userId } = req.user;
            const projects = await StudentService.getProjects(userId);
            successResponse(res, 'Projects retrieved', projects);
        } catch (error) {
            errorResponse(res, error.message, 404);
        }
    }

    static async addProject(req, res) {
        try {
            const { userId } = req.user;
            const project = await StudentService.addProject(userId, req.body);
            successResponse(res, 'Project added', project, 201);
        } catch (error) {
            errorResponse(res, error.message, 400);
        }
    }

    static async deleteProject(req, res) {
        try {
            const { userId } = req.user;
            const { id } = req.params;
            await StudentService.deleteProject(userId, id);
            successResponse(res, 'Project removed');
        } catch (error) {
            errorResponse(res, error.message, 400);
        }
    }

    // -------- RESUMES --------
    static async getResumes(req, res) {
        try {
            const { userId } = req.user;
            const resumes = await StudentService.getResumes(userId);
            successResponse(res, 'Resumes retrieved', resumes);
        } catch (error) {
            errorResponse(res, error.message, 404);
        }
    }

    static async uploadResume(req, res) {
        try {
            const { userId } = req.user;
            const { url } = req.body; // frontend sends Cloudinary URL

            const resume = await StudentService.uploadResume(userId, url);
            successResponse(res, 'Resume uploaded', resume, 201);
        } catch (error) {
            errorResponse(res, error.message, 400);
        }
    }

    static async setDefaultResume(req, res) {
        try {
            const { userId } = req.user;
            const { id } = req.params;

            const updated = await StudentService.setDefaultResume(userId, id);
            successResponse(res, 'Default resume set', updated);
        } catch (error) {
            errorResponse(res, error.message, 400);
        }
    }

    static async deleteResume(req, res) {
        try {
            const { userId } = req.user;
            const { id } = req.params;

            await StudentService.deleteResume(userId, id);
            successResponse(res, 'Resume removed');
        } catch (error) {
            errorResponse(res, error.message, 400);
        }
    }

    // -------- ADMIN APIs --------
    static async getAllStudents(req, res) {
        try {
            const students = await StudentService.getAllStudents();
            successResponse(res, 'All students retrieved', students);
        } catch (error) {
            errorResponse(res, error.message, 500);
        }
    }

    static async editStudent(req, res) {
        try {
            const { id } = req.params;
            const updated = await StudentService.editStudent(id, req.body);
            successResponse(res, 'Student updated successfully', updated);
        } catch (error) {
            errorResponse(res, error.message, 400);
        }
    }
}

module.exports = StudentController;
