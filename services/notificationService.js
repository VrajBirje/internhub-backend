const Notification = require('../models/Notification');
const Student = require('../models/Student');
const User = require('../models/User');
const Application = require('../models/Application');

class NotificationService {
    // Create notification
    static async createNotification(notificationData) {
        const notification = new Notification(notificationData);
        await notification.save();
        return notification;
    }

    // Create multiple notifications for multiple users
    static async createBulkNotifications(userIds, notificationData) {
        const notifications = userIds.map(userId => ({
            ...notificationData,
            user_id: userId
        }));

        await Notification.insertMany(notifications);
        return notifications;
    }

    // Notify student when internship matches their skills
    static async notifyStudentsForMatchingInternship(internship) {
        try {
            const matchingStudents = await Student.find({
                'skills.name': { $in: internship.skills_required }
            }).populate('user');

            if (matchingStudents.length === 0) return;

            const userIds = matchingStudents.map(student => student.user._id);
            const notificationData = {
                title: 'New Internship Matching Your Skills',
                message: `A new internship "${internship.title}" requires skills that match your profile.`,
                notification_type: 'Skill_Match',
                related_entity_type: 'Internship',
                related_entity_id: internship._id,
                metadata: {
                    skills: internship.skills_required,
                    company: internship.company_id.companyName
                }
            };

            await this.createBulkNotifications(userIds, notificationData);
        } catch (error) {
            console.error('Error notifying students for matching internship:', error);
        }
    }

    // Notify company when verified/rejected
    static async notifyCompanyVerification(company, isVerified, reason = '') {
        try {
            const notificationData = {
                title: isVerified ? 'Company Verified Successfully' : 'Company Verification Rejected',
                message: isVerified
                    ? 'Your company has been verified and you can now post internships.'
                    : `Your company verification was rejected. ${reason}`,
                notification_type: 'Company_Verification',
                related_entity_type: 'Company',
                related_entity_id: company._id,
                metadata: {
                    is_verified: isVerified,
                    reason: reason
                }
            };

            await this.createNotification({
                ...notificationData,
                user_id: company.user
            });
        } catch (error) {
            console.error('Error notifying company verification:', error);
        }
    }

    // Notify company when internship is approved/rejected
    static async notifyInternshipApproval(internship, isApproved, reason = '') {
        try {
            const notificationData = {
                title: isApproved ? 'Internship Approved' : 'Internship Rejected',
                message: isApproved
                    ? `Your internship "${internship.title}" has been approved and is now live.`
                    : `Your internship "${internship.title}" was rejected. ${reason}`,
                notification_type: 'Internship_Approval',
                related_entity_type: 'Internship',
                related_entity_id: internship._id,
                metadata: {
                    is_approved: isApproved,
                    reason: reason
                }
            };

            await this.createNotification({
                ...notificationData,
                user_id: internship.created_by
            });
        } catch (error) {
            console.error('Error notifying internship approval:', error);
        }
    }

    // Notify company when someone applies
    static async notifyNewApplication(application) {
        try {
            // Ensure application has internship_id populated with created_by reference
            let populatedApplication = application;

            // If internship_id is not populated with created_by, populate it
            if (typeof application.internship_id === 'string' || !application.internship_id.created_by) {
                populatedApplication = await Application.findById(application._id)
                    .populate({
                        path: 'internship_id',
                        select: 'title created_by'
                    });
            }

            // Get the user_id from the internship creator
            const user_id = populatedApplication.internship_id.created_by;

            if (!user_id) {
                throw new Error('User ID not found for internship creator');
            }

            const notificationData = {
                title: 'New Application Received',
                message: `A student has applied for your internship "${populatedApplication.internship_id.title}".`,
                notification_type: 'New_Application',
                related_entity_type: 'Application',
                related_entity_id: application._id,
                metadata: {
                    internship_title: populatedApplication.internship_id.title,
                    student_name: 'A student' // You can populate student info if needed
                }
            };

            await this.createNotification({
                ...notificationData,
                user_id: user_id
            });
        } catch (error) {
            console.error('Error notifying new application:', error);
            throw error;
        }
    }

    // Notify student when application status changes
    static async notifyApplicationStatusUpdate(application, oldStatus, newStatus, notes = '') {
        try {
            // Ensure application has student_id populated with user reference
            let populatedApplication = application;

            // If student_id is not populated, populate it
            if (typeof application.student_id === 'string' || !application.student_id.user) {
                populatedApplication = await Application.findById(application._id)
                    .populate('student_id', 'user');
            }

            // Get the user_id from the student
            const user_id = populatedApplication.student_id.user || populatedApplication.student_id;

            if (!user_id) {
                throw new Error('User ID not found for student');
            }

            const statusMessages = {
                'Under Review': 'Your application is under review',
                'Shortlisted': 'Congratulations! Your application has been shortlisted',
                'Interview Scheduled': 'Interview has been scheduled for your application',
                'Rejected': 'Your application has been rejected',
                'Offer Extended': 'Congratulations! Offer has been extended',
                'Accepted': 'You have accepted the offer',
                'Withdrawn': 'You have withdrawn your application'
            };

            const notificationData = {
                title: `Application Status Updated: ${newStatus}`,
                message: statusMessages[newStatus] || `Your application status has been updated to ${newStatus}.`,
                notification_type: 'Application_Status_Update',
                related_entity_type: 'Application',
                related_entity_id: application._id,
                metadata: {
                    old_status: oldStatus,
                    new_status: newStatus,
                    notes: notes,
                    internship_title: application.internship_id?.title || 'Internship'
                }
            };

            await this.createNotification({
                ...notificationData,
                user_id: user_id
            });
        } catch (error) {
            console.error('Error notifying application status update:', error);
            throw error; // Re-throw to handle in calling function
        }
    }

    // Get user notifications
    static async getUserNotifications(userId, page = 1, limit = 10) {
        const skip = (page - 1) * limit;

        const notifications = await Notification.find({ user_id: userId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Notification.countDocuments({ user_id: userId });

        return {
            notifications,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        };
    }

    // Mark notification as read
    static async markAsRead(notificationId, userId) {
        const notification = await Notification.findOne({
            _id: notificationId,
            user_id: userId
        });

        if (!notification) {
            throw new Error('Notification not found');
        }

        notification.is_read = true;
        await notification.save();
        return notification;
    }

    // Mark all notifications as read
    static async markAllAsRead(userId) {
        const result = await Notification.updateMany(
            { user_id: userId, is_read: false },
            { $set: { is_read: true } }
        );
        return result;
    }

    // Get unread count
    static async getUnreadCount(userId) {
        const count = await Notification.countDocuments({
            user_id: userId,
            is_read: false
        });
        return count;
    }
}

module.exports = NotificationService;