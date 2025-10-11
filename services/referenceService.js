const College = require('../models/College');
const Branch = require('../models/Branch');
const Skill = require('../models/Skill');

class ReferenceService {
    // College Methods
    static async getAllColleges(page = 1, limit = 10, search = '') {
        const skip = (page - 1) * limit;
        const query = {};
        
        if (search) {
            query.$or = [
                { college_name: { $regex: search, $options: 'i' } },
                { city: { $regex: search, $options: 'i' } },
                { state: { $regex: search, $options: 'i' } }
            ];
        }

        const colleges = await College.find(query)
            .sort({ college_name: 1 })
            .skip(skip)
            .limit(limit);

        const total = await College.countDocuments(query);

        return {
            colleges,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        };
    }

    static async getCollegeById(collegeId) {
        const college = await College.findById(collegeId);
        if (!college) throw new Error('College not found');
        return college;
    }

    static async createCollege(collegeData) {
        const college = new College(collegeData);
        await college.save();
        return college;
    }

    // Branch Methods
    static async getAllBranches(page = 1, limit = 10, search = '') {
        const skip = (page - 1) * limit;
        const query = {};
        
        if (search) {
            query.$or = [
                { branch_name: { $regex: search, $options: 'i' } },
                { branch_code: { $regex: search, $options: 'i' } }
            ];
        }

        const branches = await Branch.find(query)
            .sort({ branch_name: 1 })
            .skip(skip)
            .limit(limit);

        const total = await Branch.countDocuments(query);

        return {
            branches,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        };
    }

    static async getBranchById(branchId) {
        const branch = await Branch.findById(branchId);
        if (!branch) throw new Error('Branch not found');
        return branch;
    }

    static async createBranch(branchData) {
        const branch = new Branch(branchData);
        await branch.save();
        return branch;
    }

    // Skill Methods
    static async getAllSkills(page = 1, limit = 10, search = '', category = '') {
        const skip = (page - 1) * limit;
        const query = {};
        
        if (search) {
            query.skill_name = { $regex: search, $options: 'i' };
        }
        
        if (category) {
            query.category = category;
        }

        const skills = await Skill.find(query)
            .sort({ skill_name: 1 })
            .skip(skip)
            .limit(limit);

        const total = await Skill.countDocuments(query);

        return {
            skills,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        };
    }

    static async getSkillById(skillId) {
        const skill = await Skill.findById(skillId);
        if (!skill) throw new Error('Skill not found');
        return skill;
    }

    static async createSkill(skillData) {
        const skill = new Skill(skillData);
        await skill.save();
        return skill;
    }

    static async getSkillCategories() {
        const categories = await Skill.distinct('category');
        return categories.filter(category => category); // Remove null/empty values
    }
}

module.exports = ReferenceService;