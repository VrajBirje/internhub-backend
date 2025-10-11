const Student = require('../models/Student');
const User = require('../models/User');
const mongoose = require('mongoose');

class StudentService {
    // -------- PROFILE --------
    static async getProfile(userId) {
        const student = await Student.findOne({ user: userId }).populate('user', '-password');
        if (!student) throw new Error('Student profile not found');
        return student;
    }

    static async updateProfile(userId, profileData) {
        const student = await Student.findOneAndUpdate(
            { user: userId },
            { $set: profileData },
            { new: true }
        ).populate('user', '-password');

        if (!student) throw new Error('Student profile not found');
        return student;
    }

    static async uploadPhoto(userId, file) {
        if (!file) throw new Error('No file uploaded');
        const student = await Student.findOne({ user: userId });
        if (!student) throw new Error('Student profile not found');

        student.profilePicture = `/uploads/photos/${file.filename}`; // Example path
        await student.save();
        return student.profilePicture;
    }

    // -------- EDUCATION --------
    static async getEducation(userId) {
        const student = await Student.findOne({ user: userId }, 'education');
        if (!student) throw new Error('Student profile not found');
        return student.education;
    }

    static async addEducation(userId, data) {
        const student = await Student.findOne({ user: userId });
        if (!student) throw new Error('Student profile not found');

        student.education = data;
        await student.save();
        return student.education;
    }

    static async updateEducation(userId, data) {
        const student = await Student.findOne({ user: userId });
        if (!student) throw new Error('Student profile not found');
    
        // Since education is embedded, we update it directly
        student.education = { ...student.education, ...data };
        await student.save();
        
        return student.education;
    }
    
    static async deleteEducation(userId, id) {
        const student = await Student.findOne({ user: userId });
        if (!student) throw new Error('Student profile not found');

        if (student.education && student.education._id.equals(id)) {
            student.education = undefined;
            await student.save();
        } else {
            throw new Error('Education record not found');
        }
    }

    // -------- SKILLS --------
    static async getSkills(userId) {
        const student = await Student.findOne({ user: userId }, 'skills');
        if (!student) throw new Error('Student profile not found');
        return student.skills;
    }

    static async addSkill(userId, skill) {
        const student = await Student.findOne({ user: userId });
        if (!student) throw new Error('Student profile not found');

        student.skills.push(skill);
        await student.save();
        return student.skills;
    }

    static async deleteSkill(userId, skillId) {
        const student = await Student.findOne({ user: userId });
        if (!student) throw new Error('Student profile not found');

        student.skills = student.skills.filter(s => !s._id.equals(skillId));
        await student.save();
    }

    // -------- EXPERIENCE --------
    static async getExperience(userId) {
        const student = await Student.findOne({ user: userId }, 'experiences');
        if (!student) throw new Error('Student profile not found');
        return student.experiences;
    }

    static async addExperience(userId, exp) {
        const student = await Student.findOne({ user: userId });
        if (!student) throw new Error('Student profile not found');

        student.experiences.push(exp);
        await student.save();
        return student.experiences;
    }

    static async updateExperience(userId, expId, data) {
        const student = await Student.findOne({ user: userId });
        if (!student) throw new Error('Student profile not found');

        const experience = student.experiences.id(expId);
        if (!experience) throw new Error('Experience not found');

        Object.assign(experience, data);
        await student.save();
        return experience;
    }

    static async deleteExperience(userId, expId) {
        const student = await Student.findOne({ user: userId });
        if (!student) throw new Error('Student profile not found');

        student.experiences = student.experiences.filter(e => !e._id.equals(expId));
        await student.save();
    }

    // -------- PROJECTS --------
    static async getProjects(userId) {
        const student = await Student.findOne({ user: userId }, 'projects');
        if (!student) throw new Error('Student profile not found');
        return student.projects;
    }

    static async addProject(userId, project) {
        const student = await Student.findOne({ user: userId });
        if (!student) throw new Error('Student profile not found');

        student.projects.push(project);
        await student.save();
        return student.projects;
    }

    static async deleteProject(userId, projectId) {
        const student = await Student.findOne({ user: userId });
        if (!student) throw new Error('Student profile not found');

        student.projects = student.projects.filter(p => !p._id.equals(projectId));
        await student.save();
    }

    // -------- RESUMES --------
    static async getResumes(userId) {
        const student = await Student.findOne({ user: userId }, 'resumes');
        if (!student) throw new Error('Student profile not found');
        return student.resumes;
    }

    static async uploadResume(userId, url) {
        if (!url) throw new Error('No resume URL provided');

        const student = await Student.findOne({ user: userId });
        if (!student) throw new Error('Student profile not found');

        const resume = {
            resumeFile:url,
            isDefault: student.resumes.length === 0 // first resume is default
        };

        student.resumes.push(resume);
        await student.save();
        return resume;
    }

    static async setDefaultResume(userId, resumeId) {
        const student = await Student.findOne({ user: userId });
        if (!student) throw new Error('Student profile not found');

        student.resumes.forEach(r => {
            r.isDefault = r._id.equals(resumeId);
        });
        await student.save();
        return student.resumes;
    }

    static async deleteResume(userId, resumeId) {
        const student = await Student.findOne({ user: userId });
        if (!student) throw new Error('Student profile not found');

        student.resumes = student.resumes.filter(r => !r._id.equals(resumeId));
        await student.save();
    }

    // -------- ADMIN APIs --------
    static async getAllStudents() {
        return await Student.find()
            .populate('user', '-password')
            .lean();
    }

    static async editStudent(studentId, data) {
        const student = await Student.findByIdAndUpdate(studentId, { $set: data }, { new: true })
            .populate('user', '-password');

        if (!student) throw new Error('Student not found');
        return student;
    }
}

module.exports = StudentService;
