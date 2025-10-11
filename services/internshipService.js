const Internship = require('../models/Internship');
const Company = require('../models/Company');
const InternshipCategory = require('../models/InternshipCategory'); // ADD THIS LINE
const NotificationService = require('./notificationService');

class InternshipService {
    // Create new internship
    static async createInternship(companyId, internshipData, createdBy) {
        const company = await Company.findById(companyId);
        if (!company) throw new Error('Company not found');
        if (!company.isVerified) throw new Error('Company must be verified to post internships');

        // Validate category exists
        const category = await InternshipCategory.findById(internshipData.category_id);
        if (!category) throw new Error('Invalid internship category');

        const internship = new Internship({
            ...internshipData,
            company_id: companyId,
            created_by: createdBy
        });

        await internship.save();

        // Correct way to populate multiple fields
        return await Internship.findById(internship._id)
            .populate('company_id', 'companyName logoUrl')
            .populate('category_id', 'category_name');
    }

    // Get company's internships
    static async getCompanyInternships(companyId, page = 1, limit = 10) {
        const skip = (page - 1) * limit;

        const internships = await Internship.find({ company_id: companyId })
            .populate('company_id', 'companyName logoUrl')
            .populate('category_id', 'category_name')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Internship.countDocuments({ company_id: companyId });

        return {
            internships,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        };
    }

    // Get internship by ID
    static async getInternshipById(internshipId) {
        const internship = await Internship.findById(internshipId)
            .populate('company_id', 'companyName description websiteUrl logoUrl')
            .populate('category_id', 'category_name')
            .populate('created_by', 'username email');

        if (!internship) {
            throw new Error('Internship not found');
        }

        return internship;
    }

    // Update internship
    static async updateInternship(internshipId, companyId, updateData) {
        const internship = await Internship.findOne({
            _id: internshipId,
            company_id: companyId
        });

        if (!internship) {
            throw new Error('Internship not found or unauthorized');
        }

        Object.assign(internship, updateData);
        await internship.save();

        return await internship.populate('company_id', 'companyName logoUrl');
    }

    // Delete internship
    static async deleteInternship(internshipId, companyId) {
        const internship = await Internship.findOne({
            _id: internshipId,
            company_id: companyId
        });

        if (!internship) {
            throw new Error('Internship not found or unauthorized');
        }

        await Internship.findByIdAndDelete(internshipId);
        return { message: 'Internship deleted successfully' };
    }

    // Toggle internship status
    static async toggleInternshipStatus(internshipId, companyId, isActive) {
        const internship = await Internship.findOne({
            _id: internshipId,
            company_id: companyId
        });

        if (!internship) {
            throw new Error('Internship not found or unauthorized');
        }

        internship.is_active = isActive;
        await internship.save();

        return internship;
    }

    // Get all internships (for browsing)
    static async getAllInternships(filters = {}, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const query = { is_active: true, approval_status: 'Approved' };

        // Apply filters
        if (filters.category) query.category_id = filters.category;
        if (filters.locationType) query['location.location_type'] = filters.locationType;
        if (filters.isPaid !== undefined) query['stipend.is_paid'] = filters.isPaid;
        if (filters.company) query.company_id = filters.company;

        if (filters.skills && filters.skills.length > 0) {
            query.skills_required = { $in: filters.skills };
        }

        const internships = await Internship.find(query)
            .populate('company_id', 'companyName logoUrl')
            .populate('category_id', 'category_name')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Internship.countDocuments(query);

        return {
            internships,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        };
    }

    // Search internships
    static async searchInternships(searchTerm, filters = {}, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const query = {
            is_active: true,
            approval_status: 'Approved',
            $or: [
                { title: { $regex: searchTerm, $options: 'i' } },
                { description: { $regex: searchTerm, $options: 'i' } },
                { skills_required: { $regex: searchTerm, $options: 'i' } } // simpler than $in
            ]
        };

        // Apply filters properly
        if (filters.locationType)
            query['location.location_type'] = filters.locationType;

        if (filters.isPaid !== undefined) {
            if (typeof filters.isPaid === 'string')
                filters.isPaid = filters.isPaid === 'true';
            query['stipend.is_paid'] = filters.isPaid;
        }

        if (filters.category)
            query.category_id = filters.category;

        if (filters.company)
            query.company_id = filters.company;

        const internships = await Internship.find(query)
            .populate('company_id', 'companyName logoUrl')
            .populate('category_id', 'category_name')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Internship.countDocuments(query);

        return {
            internships,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        };
    }


    // Increment views
    static async incrementViews(internshipId) {
        const internship = await Internship.findById(internshipId);
        if (internship) {
            internship.views_count += 1;
            await internship.save();
        }
    }
}

module.exports = InternshipService;