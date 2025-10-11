const Student = require('../models/Student');
const Company = require('../models/Company');
const Superadmin = require('../models/SuperAdmin');
const { errorResponse } = require('../utils/response');

// Check if user is a student
const isStudent = async (req, res, next) => {
    try {
        const student = await Student.findOne({ user: req.user.userId });
        
        if (!student) {
            return errorResponse(res, 'Student access required', 403);
        }

        req.user.studentId = student._id;
        next();
    } catch (error) {
        errorResponse(res, 'Authorization failed', 403);
    }
};

// Check if user is a company
const isCompany = async (req, res, next) => {
    try {
        const company = await Company.findOne({ user: req.user.userId });
        
        if (!company) {
            return errorResponse(res, 'Company access required', 403);
        }

        req.user.companyId = company._id;
        next();
    } catch (error) {
        errorResponse(res, 'Authorization failed', 403);
    }
};

// Check if company is verified
const isCompanyVerified = async (req, res, next) => {
    try {
        const company = await Company.findOne({ user: req.user.userId });
        
        if (!company) {
            return errorResponse(res, 'Company profile not found', 403);
        }

        if (!company.isVerified) {
            return errorResponse(res, 'Company not verified. Please complete verification process.', 403);
        }

        req.user.companyId = company._id;
        next();
    } catch (error) {
        errorResponse(res, 'Authorization failed', 403);
    }
};

// Check if user is a superadmin
const isSuperadmin = async (req, res, next) => {
    try {
        const superadmin = await Superadmin.findOne({ user_id: req.user.userId });
        
        if (!superadmin) {
            return errorResponse(res, 'Superadmin access required', 403);
        }

        req.user.superadminId = superadmin._id;
        next();
    } catch (error) {
        errorResponse(res, 'Authorization failed', 403);
    }
};

// Environment variable check for superadmin creation
const allowSuperadminCreation = (req, res, next) => {
    if (process.env.ALLOW_SUPERADMIN_CREATION !== 'true') {
        return errorResponse(res, 'Superadmin registration is currently disabled', 403);
    }
    next();
};

module.exports = {
    isStudent,
    isCompany,
    isCompanyVerified,
    isSuperadmin,
    allowSuperadminCreation
};