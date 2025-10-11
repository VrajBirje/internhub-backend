const NotificationService = require('../services/notificationService');
const { successResponse, errorResponse } = require('../utils/response');

class NotificationController {
    // Get user notifications
    static async getNotifications(req, res) {
        try {
            const { userId } = req.user;
            const { page = 1, limit = 10 } = req.query;
            const result = await NotificationService.getUserNotifications(
                userId, 
                parseInt(page), 
                parseInt(limit)
            );
            successResponse(res, 'Notifications retrieved', result);
        } catch (error) {
            errorResponse(res, error.message, 400);
        }
    }

    // Mark notification as read
    static async markAsRead(req, res) {
        try {
            const { userId } = req.user;
            const { id } = req.params;
            const notification = await NotificationService.markAsRead(id, userId);
            successResponse(res, 'Notification marked as read', notification);
        } catch (error) {
            errorResponse(res, error.message, 404);
        }
    }

    // Mark all notifications as read
    static async markAllAsRead(req, res) {
        try {
            const { userId } = req.user;
            const result = await NotificationService.markAllAsRead(userId);
            successResponse(res, 'All notifications marked as read', {
                modifiedCount: result.modifiedCount
            });
        } catch (error) {
            errorResponse(res, error.message, 400);
        }
    }

    // Get unread count
    static async getUnreadCount(req, res) {
        try {
            const { userId } = req.user;
            const count = await NotificationService.getUnreadCount(userId);
            successResponse(res, 'Unread count retrieved', { count });
        } catch (error) {
            errorResponse(res, error.message, 400);
        }
    }
}

module.exports = NotificationController;