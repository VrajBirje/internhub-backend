const Company = require('../models/Company');
const Student = require('../models/Student');
const User = require('../models/User');
const Internship = require('../models/Internship');
const NotificationService = require('./notificationService');

class AdminService {
    // Company Management
    static async getPendingCompanies() {
        const companies = await Company.find({ isVerified: false })
            .populate('user', 'username email createdAt')
            .sort({ createdAt: 1 });
        return companies;
    }

    static async getAllCompanies(page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        
        const companies = await Company.find()
            .populate('user', 'username email')
            .populate('verifiedBy', 'username')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Company.countDocuments();

        return {
            companies,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        };
    }

    static async verifyCompany(companyId) {
        const company = await Company.findById(companyId);
        if (!company) throw new Error('Company not found');

        company.isVerified = true;
        company.registrationStep = 4;
        company.profileCompletion = 100;
        company.verificationDate = new Date();
        
        await company.save();
        await NotificationService.notifyCompanyVerification(company, true);
        return await company.populate('user', 'username email');
    }

    static async rejectCompany(companyId, reason) {
        const company = await Company.findById(companyId);
        if (!company) throw new Error('Company not found');

        company.isVerified = false;
        company.verificationDate = null;
        // You can add a rejectionReason field if needed
        
        await company.save();
        await NotificationService.notifyCompanyVerification(company, false, reason);
        return company;
    }

    // Student Management
    static async getAllStudents(page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        
        const students = await Student.find()
            .populate('user', 'username email')
            .populate('education.college')
            .populate('education.branch')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Student.countDocuments();

        return {
            students,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        };
    }

    static async getStudentById(studentId) {
        const student = await Student.findById(studentId)
            .populate('user', 'username email')
            .populate('education.college')
            .populate('education.branch');
        
        if (!student) throw new Error('Student not found');
        return student;
    }

    static async updateStudent(studentId, updateData) {
        const student = await Student.findByIdAndUpdate(
            studentId, 
            { $set: updateData }, 
            { new: true }
        ).populate('user', 'username email');

        if (!student) throw new Error('Student not found');
        return student;
    }

    // Internship Management
    static async getPendingInternships(page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        
        const internships = await Internship.find({ approval_status: 'Pending' })
            .populate('company_id', 'companyName logoUrl')
            .populate('category_id', 'category_name')
            .populate('created_by', 'username')
            .sort({ createdAt: 1 })
            .skip(skip)
            .limit(limit);

        const total = await Internship.countDocuments({ approval_status: 'Pending' });

        return {
            internships,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        };
    }

    static async approveInternship(internshipId, approvedBy) {
        const internship = await Internship.findById(internshipId);
        if (!internship) throw new Error('Internship not found');

        internship.approval_status = 'Approved';
        internship.approved_by = approvedBy;
        internship.approval_date = new Date();
        
        await internship.save();
        await NotificationService.notifyStudentsForMatchingInternship(internship);
        await NotificationService.notifyInternshipApproval(internship, true);
        return await internship.populate('company_id', 'companyName');
    }

    static async rejectInternship(internshipId, reason, rejectedBy) {
        const internship = await Internship.findById(internshipId);
        if (!internship) throw new Error('Internship not found');

        internship.approval_status = 'Rejected';
        internship.approved_by = rejectedBy;
        internship.approval_date = new Date();
        // You can add a rejection_reason field if needed
        
        await internship.save();
        await NotificationService.notifyInternshipApproval(internship, false, reason);
        return internship;
    }

    // User Management
    static async getAllUsers(page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        
        const users = await User.find()
            .select('-password -resetToken -resetTokenExpiry')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await User.countDocuments();

        return {
            users,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        };
    }

    static async toggleUserStatus(userId) {
        const user = await User.findById(userId);
        if (!user) throw new Error('User not found');

        user.isActive = !user.isActive;
        await user.save();

        return {
            id: user._id,
            username: user.username,
            email: user.email,
            userType: user.userType,
            isActive: user.isActive
        };
    }

    // Dashboard Statistics
    static async getDashboardStats() {
        const totalStudents = await Student.countDocuments();
        const totalCompanies = await Company.countDocuments();
        const verifiedCompanies = await Company.countDocuments({ isVerified: true });
        const pendingCompanies = await Company.countDocuments({ isVerified: false });
        const totalInternships = await Internship.countDocuments();
        const pendingInternships = await Internship.countDocuments({ approval_status: 'Pending' });
        const approvedInternships = await Internship.countDocuments({ approval_status: 'Approved' });
        const totalUsers = await User.countDocuments();
        const activeUsers = await User.countDocuments({ isActive: true });

        return {
            totalStudents,
            totalCompanies,
            verifiedCompanies,
            pendingCompanies,
            totalInternships,
            pendingInternships,
            approvedInternships,
            totalUsers,
            activeUsers
        };
    }
}

module.exports = AdminService;