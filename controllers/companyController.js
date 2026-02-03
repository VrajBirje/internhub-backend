const CompanyService = require('../services/companyService');
const { successResponse, errorResponse } = require('../utils/response');

class CompanyController {
    // Step 1: Initial registration
    static async registerStep1(req, res) {
        try {
            const result = await CompanyService.registerStep1(req.body);
            successResponse(res, 'Company registration step 1 completed', result, 201);
        } catch (error) {
            errorResponse(res, error.message, 400);
        }
    }

    // Update registration steps (2, 3, 4)
    static async updateRegistration(req, res) {
        try {
            const { userId } = req.user;
            const { step } = req.params;
            const stepNumber = parseInt(step);
            
            if (![2, 3, 4].includes(stepNumber)) {
                return errorResponse(res, 'Invalid step number', 400);
            }

            const result = await CompanyService.updateRegistrationStep(userId, req.body, stepNumber);
            successResponse(res, `Registration step ${stepNumber} completed`, result);
        } catch (error) {
            errorResponse(res, error.message, 400);
        }
    }

    // Complete company registration in one go
    static async completeRegistration(req, res) {
        try {
            const result = await CompanyService.completeRegistration(req.body);
            successResponse(res, 'Company registration completed successfully', result, 201);
        } catch (error) {
            errorResponse(res, error.message, 400);
        }
    }

    // Send email verification OTP
    static async sendEmailVerification(req, res) {
        try {
            const { email } = req.body;
            const result = await CompanyService.sendEmailVerificationOtp(email);
            successResponse(res, 'Verification email sent', result);
        } catch (error) {
            errorResponse(res, error.message, 400);
        }
    }

    // Verify email OTP
    static async verifyEmail(req, res) {
        try {
            const { email, otp } = req.body;
            const result = await CompanyService.verifyEmailOtp(email, otp);
            successResponse(res, 'Email verified successfully', result);
        } catch (error) {
            errorResponse(res, error.message, 400);
        }
    }

    // Resend verification OTP
    static async resendVerification(req, res) {
        try {
            const { email } = req.body;
            const result = await CompanyService.resendVerificationOtp(email);
            successResponse(res, 'Verification email resent', result);
        } catch (error) {
            errorResponse(res, error.message, 400);
        }
    }

    // Get company profile
    static async getProfile(req, res) {
        try {
            const { userId } = req.user;
            const profile = await CompanyService.getCompanyProfile(userId);
            successResponse(res, 'Company profile retrieved', profile);
        } catch (error) {
            errorResponse(res, error.message, 404);
        }
    }

    // Get company profile by ID
    static async getProfileById(req, res) {
        try {
            const { userId } = req.params;
            const profile = await CompanyService.getCompanyProfile(userId);
            successResponse(res, 'Company profile retrieved', profile);
        } catch (error) {
            errorResponse(res, error.message, 404);
        }
    }

    // Update company details
    static async updateDetails(req, res) {
        try {
            const { userId } = req.user;
            const updated = await CompanyService.updateCompanyDetails(userId, req.body);
            successResponse(res, 'Company details updated', updated);
        } catch (error) {
            errorResponse(res, error.message, 400);
        }
    }

    // Add address
    static async addAddress(req, res) {
        try {
            const { userId } = req.user;
            const addresses = await CompanyService.addAddress(userId, req.body);
            successResponse(res, 'Address added', addresses, 201);
        } catch (error) {
            errorResponse(res, error.message, 400);
        }
    }

    // Add contact
    static async addContact(req, res) {
        try {
            const { userId } = req.user;
            const contacts = await CompanyService.addContact(userId, req.body);
            successResponse(res, 'Contact added', contacts, 201);
        } catch (error) {
            errorResponse(res, error.message, 400);
        }
    }

    // Get registration status
    static async getRegistrationStatus(req, res) {
        try {
            const { userId } = req.user;
            const status = await CompanyService.getRegistrationStatus(userId);
            successResponse(res, 'Registration status retrieved', status);
        } catch (error) {
            errorResponse(res, error.message, 404);
        }
    }
    // Address CRUD
    static async getAddresses(req, res) {
        try {
            const { userId } = req.user;
            const addresses = await CompanyService.getAddresses(userId);
            successResponse(res, 'Addresses retrieved', addresses);
        } catch (error) {
            errorResponse(res, error.message, 404);
        }
    }

    static async updateAddress(req, res) {
        try {
            const { userId } = req.user;
            const { id } = req.params;
            const updated = await CompanyService.updateAddress(userId, id, req.body);
            successResponse(res, 'Address updated', updated);
        } catch (error) {
            errorResponse(res, error.message, 400);
        }
    }

    static async deleteAddress(req, res) {
        try {
            const { userId } = req.user;
            const { id } = req.params;
            const addresses = await CompanyService.deleteAddress(userId, id);
            successResponse(res, 'Address deleted', addresses);
        } catch (error) {
            errorResponse(res, error.message, 400);
        }
    }

    // Contact CRUD
    static async getContacts(req, res) {
        try {
            const { userId } = req.user;
            const contacts = await CompanyService.getContacts(userId);
            successResponse(res, 'Contacts retrieved', contacts);
        } catch (error) {
            errorResponse(res, error.message, 404);
        }
    }

    static async updateContact(req, res) {
        try {
            const { userId } = req.user;
            const { id } = req.params;
            const updated = await CompanyService.updateContact(userId, id, req.body);
            successResponse(res, 'Contact updated', updated);
        } catch (error) {
            errorResponse(res, error.message, 400);
        }
    }

    static async deleteContact(req, res) {
        try {
            const { userId } = req.user;
            const { id } = req.params;
            const contacts = await CompanyService.deleteContact(userId, id);
            successResponse(res, 'Contact deleted', contacts);
        } catch (error) {
            errorResponse(res, error.message, 400);
        }
    }

    // Superadmin
    static async getPending(req, res) {
        try {
            const companies = await CompanyService.getPendingCompanies();
            successResponse(res, 'Pending companies retrieved', companies);
        } catch (error) {
            errorResponse(res, error.message, 400);
        }
    }

    static async verifyCompany(req, res) {
        try {
            const { id } = req.params;
            const company = await CompanyService.verifyCompany(id);
            successResponse(res, 'Company verified', company);
        } catch (error) {
            errorResponse(res, error.message, 400);
        }
    }

    static async rejectCompany(req, res) {
        try {
            const { id } = req.params;
            const result = await CompanyService.rejectCompany(id);
            successResponse(res, 'Company rejected', result);
        } catch (error) {
            errorResponse(res, error.message, 400);
        }
    }
    // Upload logo
    static async uploadLogo(req, res) {
        try {
            const { userId } = req.user;
            const { url } = req.body; // ✅ expecting Cloudinary URL
            const logo = await StudentService.uploadLogo(userId, url);
            successResponse(res, 'Logo uploaded', logo, 201);
        } catch (error) {
            errorResponse(res, error.message, 400);
        }
    }
}

module.exports = CompanyController;