const Application = require('../models/Application');
const Internship = require('../models/Internship');
const Student = require('../models/Student');
const Company = require('../models/Company');
const NotificationService = require('./notificationService');

class ApplicationService {
    // Apply to internship
    static async applyToInternship(internshipId, studentId, applicationData) {
        // Check for existing application
        const existingApplication = await Application.findOne({
            internship_id: internshipId,
            student_id: studentId
        });

        if (existingApplication) {
            if (existingApplication.status === 'Withdrawn') {
                // Optional: remove old withdrawn application
                await Application.deleteOne({ _id: existingApplication._id });
            } else {
                throw new Error('You have already applied to this internship');
            }
        }

        // Validate internship
        const internship = await Internship.findById(internshipId);
        if (!internship) throw new Error('Internship not found');
        if (!internship.is_active || internship.approval_status !== 'Approved') {
            throw new Error('This internship is not available for applications');
        }
        if (new Date() > internship.application_deadline) {
            throw new Error('Application deadline has passed');
        }

        // Validate answers if any
        if (applicationData.answers && internship.questions) {
            this.validateAnswers(applicationData.answers, internship.questions);
        }

        // Create new application
        const application = new Application({
            internship_id: internshipId,
            student_id: studentId,
            resume: applicationData.resume,
            cover_letter: applicationData.cover_letter,
            answers: applicationData.answers
        });

        // Save application first
        await application.save();

        // Populate the application before sending to notification
        const populatedApplication = await Application.findById(application._id)
            .populate({
                path: 'internship_id',
                select: 'title created_by'
            })
            .populate('student_id', 'firstName lastName');

        // Now notify with populated data
        await NotificationService.notifyNewApplication(populatedApplication);

        // Increment count
        await Internship.findByIdAndUpdate(internshipId, {
            $inc: { applications_count: 1 }
        });

        return populatedApplication;
    }


    // Validate answers against questions
    static validateAnswers(answers, questions) {
        questions.forEach(question => {
            if (question.is_required) {
                const answer = answers.find(
                    a => String(a.question_id) === String(question._id)
                );

                if (!answer) {
                    throw new Error(`Required question not answered: ${question.question_text}`);
                }

                const noText =
                    !answer.answer_text &&
                    answer.question_type !== 'file' &&
                    (!answer.selected_options || answer.selected_options.length === 0);

                if (noText) {
                    throw new Error(`Please answer the required question: ${question.question_text}`);
                }
            }
        });
    }


    // Get student's applications
    static async getStudentApplications(studentId, page = 1, limit = 10) {
        const skip = (page - 1) * limit;

        const applications = await Application.find({ student_id: studentId })
            .populate({
                path: 'internship_id',
                select: 'title company_id description application_deadline',
                populate: {
                    path: 'company_id',
                    select: 'companyName logoUrl'
                }
            })
            .sort({ applied_date: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Application.countDocuments({ student_id: studentId });

        return {
            applications,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        };
    }

    // Get application details
    static async getApplicationById(applicationId, studentId = null) {
        const query = { _id: applicationId };
        if (studentId) {
            query.student_id = studentId;
        }

        const application = await Application.findOne(query)
            .populate({
                path: 'internship_id',
                populate: {
                    path: 'company_id',
                    select: 'companyName description websiteUrl logoUrl'
                }
            })
            .populate('student_id', 'firstName lastName sapId education')
            .populate('resume', 'resumeFile uploadDate');

        if (!application) {
            throw new Error('Application not found');
        }

        return application;
    }

    // Withdraw application
    static async withdrawApplication(applicationId, studentId) {
        const application = await Application.findOne({
            _id: applicationId,
            student_id: studentId
        }).populate('student_id', 'user');

        if (!application) {
            throw new Error('Application not found');
        }

        if (application.status === 'Withdrawn') {
            throw new Error('Application is already withdrawn');
        }

        const oldStatus = application.status; // Save old status BEFORE changing
        application.status = 'Withdrawn';
        application.status_history.push({
            status: 'Withdrawn',
            changed_by: studentId,
            changed_by_type: 'Student',
            notes: 'Application withdrawn by student'
        });

        await application.save();

        // Now notify with the correct oldStatus
        await NotificationService.notifyApplicationStatusUpdate(
            application,
            oldStatus,
            'Withdrawn',
            'Application withdrawn by student'
        );

        return application;
    }

    // Get company's applications
    static async getCompanyApplications(companyId, page = 1, limit = 10, filters = {}) {
        const skip = (page - 1) * limit;

        // Find internships by company
        const internships = await Internship.find({ company_id: companyId }, '_id');
        const internshipIds = internships.map(i => i._id);

        const query = { internship_id: { $in: internshipIds } };

        // Apply filters
        if (filters.status) query.status = filters.status;
        if (filters.internship) query.internship_id = filters.internship;

        const applications = await Application.find(query)
            .populate({
                path: 'internship_id',
                select: 'title'
            })
            .populate('student_id', 'firstName lastName sapId education skills')
            .sort({ applied_date: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Application.countDocuments(query);

        return {
            applications,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        };
    }

    // Get applications for specific internship
    static async getInternshipApplications(internshipId, companyId, page = 1, limit = 10, filters = {}) {
        const skip = (page - 1) * limit;

        // Verify company owns the internship
        const internship = await Internship.findOne({
            _id: internshipId,
            company_id: companyId
        });
        if (!internship) {
            throw new Error('Internship not found or unauthorized');
        }

        const query = { internship_id: internshipId };
        if (filters.status) query.status = filters.status;

        const applications = await Application.find(query)
            .populate('student_id', 'firstName lastName sapId education skills experiences')
            .populate('resume', 'resumeFile uploadDate')
            .sort({ applied_date: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Application.countDocuments(query);

        return {
            applications,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        };
    }

    // Update application status (company)
    static async updateApplicationStatus(applicationId, companyId, statusData) {
        const application = await Application.findById(applicationId)
            .populate({
                path: 'internship_id',
                select: 'company_id'
            });

        if (!application) {
            throw new Error('Application not found');
        }

        // Verify company owns the internship
        if (!application.internship_id.company_id.equals(companyId)) {
            throw new Error('Unauthorized to update this application');
        }

        application.status = statusData.status;
        application.status_history.push({
            status: statusData.status,
            changed_by: companyId,
            changed_by_type: 'Company',
            notes: statusData.notes || `Status changed to ${statusData.status}`
        });

        if (statusData.notes) {
            application.notes = statusData.notes;
        }

        const oldStatus = application.status;
        application.status = statusData.status;
        await application.save();
        await NotificationService.notifyApplicationStatusUpdate(
            application,
            oldStatus,
            statusData.status,
            statusData.notes
        );
        await application.save();
        return application;
    }

    // Get application statistics for company
    static async getApplicationStats(companyId) {
        const internships = await Internship.find({ company_id: companyId }, '_id');
        const internshipIds = internships.map(i => i._id);

        const stats = await Application.aggregate([
            {
                $match: { internship_id: { $in: internshipIds } }
            },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        const totalApplications = await Application.countDocuments({
            internship_id: { $in: internshipIds }
        });

        return {
            total: totalApplications,
            byStatus: stats.reduce((acc, stat) => {
                acc[stat._id] = stat.count;
                return acc;
            }, {})
        };
    }
}

module.exports = ApplicationService;