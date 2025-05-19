
const mongoose = require('mongoose');
const Notification = mongoose.model('Notification');
const User = mongoose.model('User');

/**
 * Create a notification for a user
 * 
 * @param {Object} data Notification data
 * @returns {Promise<Object>} Created notification or error
 */
const createNotification = async (data) => {
    try {
        if (!data.userId || !data.title || !data.message || !data.type) {
            return {
                success: false,
                message: "Missing required notification fields"
            };
        }

        // Check if user has enabled notifications of this type
        const user = await User.findById(data.userId);
        if (!user) {
            return {
                success: false,
                message: "User not found"
            };
        }

        // Skip if notifications are disabled for this type
        if (user.notificationPreferences && 
            user.notificationPreferences.inApp && 
            !user.notificationPreferences.inApp.enabled) {
            return {
                success: false,
                message: "User has disabled in-app notifications"
            };
        }

        // Create the notification
        const notification = new Notification(data);
        await notification.save();

        return {
            success: true,
            data: notification
        };
    } catch (error) {
        console.error('Error creating notification:', error);
        return {
            success: false,
            message: "Failed to create notification",
            error: error.message
        };
    }
};

/**
 * Create notifications for many users
 * 
 * @param {Array} userIds Array of user IDs
 * @param {Object} notificationData Notification data (without userId)
 * @returns {Promise<Object>} Result
 */
const createNotificationForMany = async (userIds, notificationData) => {
    try {
        if (!userIds || !userIds.length || !notificationData.title || !notificationData.message || !notificationData.type) {
            return {
                success: false,
                message: "Missing required notification fields or user IDs"
            };
        }

        // Prepare notification objects for all users
        const notifications = userIds.map(userId => ({
            userId,
            ...notificationData,
            createdAt: new Date()
        }));

        // Insert all notifications at once
        await Notification.insertMany(notifications);

        return {
            success: true,
            message: `Created ${notifications.length} notifications`
        };
    } catch (error) {
        console.error('Error creating notifications for many users:', error);
        return {
            success: false,
            message: "Failed to create notifications",
            error: error.message
        };
    }
};

/**
 * Create notification for status update
 */
const notifyStatusUpdate = async (complaint, statusUpdate) => {
    try {
        // Notify the citizen
        await createNotification({
            userId: complaint.userId,
            title: "Complaint Status Updated",
            message: `Your complaint regarding "${complaint.category}" has been updated to: ${statusUpdate.status}`,
            type: 'status-update',
            relatedId: complaint._id,
            onModel: 'Complaints'
        });
        
        // Update the complaint's notification tracking
        complaint.notificationsSent.statusUpdates.push({
            updateId: statusUpdate._id,
            sent: true,
            timestamp: new Date()
        });
        
        await complaint.save();
        
        return { success: true };
    } catch (error) {
        console.error('Error notifying status update:', error);
        return {
            success: false,
            message: "Failed to send status update notification",
            error: error.message
        };
    }
};

/**
 * Create notification for new complaint
 */
const notifyNewComplaint = async (complaint) => {
    try {
        // Find all admin users
        const admins = await User.find({ role: 'admin' });
        
        if (admins.length > 0) {
            // Prepare notification for all admins
            const adminIds = admins.map(admin => admin._id);
            
            await createNotificationForMany(adminIds, {
                title: "New Complaint Submitted",
                message: `A new complaint has been submitted in category: ${complaint.category}`,
                type: 'complaint',
                relatedId: complaint._id,
                onModel: 'Complaints'
            });
        }
        
        // If department is assigned, also notify department users
        if (complaint.departmentId) {
            const departmentUsers = await User.find({ 
                role: 'department',
                departmentId: complaint.departmentId
            });
            
            if (departmentUsers.length > 0) {
                const departmentUserIds = departmentUsers.map(user => user._id);
                
                await createNotificationForMany(departmentUserIds, {
                    title: "New Complaint Assigned",
                    message: `A new complaint has been assigned to your department in category: ${complaint.category}`,
                    type: 'complaint',
                    relatedId: complaint._id,
                    onModel: 'Complaints'
                });
            }
        }
        
        // Update the complaint's notification tracking
        complaint.notificationsSent.created = true;
        await complaint.save();
        
        return { success: true };
    } catch (error) {
        console.error('Error notifying new complaint:', error);
        return {
            success: false,
            message: "Failed to send new complaint notification",
            error: error.message
        };
    }
};

/**
 * Create notification for new comment
 */
const notifyComment = async (complaint, comment) => {
    try {
        // Get the commenting user
        const commentingUser = await User.findById(comment.postedBy);
        
        if (!commentingUser) {
            return {
                success: false,
                message: "Commenting user not found"
            };
        }

        // Determine who should be notified based on who commented
        let notifyUserId;
        let message;
        
        if (commentingUser.role === 'citizen') {
            // If citizen commented, notify department users and admins
            // Creating notification for department handled separately
            
            // For admins
            const admins = await User.find({ role: 'admin' });
            if (admins.length > 0) {
                const adminIds = admins.map(admin => admin._id);
                
                await createNotificationForMany(adminIds, {
                    title: "New Comment on Complaint",
                    message: `The citizen added a comment to complaint #${complaint._id}`,
                    type: 'complaint',
                    relatedId: complaint._id,
                    onModel: 'Complaints'
                });
            }
            
            // If department assigned, notify them too
            if (complaint.departmentId) {
                const departmentUsers = await User.find({ 
                    role: 'department',
                    departmentId: complaint.departmentId
                });
                
                if (departmentUsers.length > 0) {
                    const departmentUserIds = departmentUsers.map(user => user._id);
                    
                    await createNotificationForMany(departmentUserIds, {
                        title: "New Comment on Complaint",
                        message: `The citizen added a comment to complaint #${complaint._id}`,
                        type: 'complaint',
                        relatedId: complaint._id,
                        onModel: 'Complaints'
                    });
                }
            }
        } else {
            // If admin or department commented, notify citizen
            notifyUserId = complaint.userId;
            const role = commentingUser.role === 'admin' ? 'Administrator' : 'Department';
            message = `${role} has added a comment to your complaint`;
            
            await createNotification({
                userId: notifyUserId,
                title: "New Comment on Your Complaint",
                message: message,
                type: 'complaint',
                relatedId: complaint._id,
                onModel: 'Complaints'
            });
        }
        
        // Update complaint's notification tracking
        complaint.notificationsSent.comments.push({
            commentId: comment._id,
            sent: true,
            timestamp: new Date()
        });
        
        await complaint.save();
        
        return { success: true };
    } catch (error) {
        console.error('Error notifying comment:', error);
        return {
            success: false,
            message: "Failed to send comment notification",
            error: error.message
        };
    }
};

/**
 * Create notification for announcement
 */
const notifyAnnouncement = async (announcement) => {
    try {
        // Get all citizens
        const citizens = await User.find({ role: 'citizen' });
        
        if (citizens.length > 0) {
            const citizenIds = citizens.map(citizen => citizen._id);
            
            await createNotificationForMany(citizenIds, {
                title: "New Announcement",
                message: announcement.title,
                type: 'announcement',
                relatedId: announcement._id,
                onModel: 'Announcement'
            });
        }
        
        return { success: true };
    } catch (error) {
        console.error('Error notifying announcement:', error);
        return {
            success: false,
            message: "Failed to send announcement notification",
            error: error.message
        };
    }
};

module.exports = {
    createNotification,
    createNotificationForMany,
    notifyStatusUpdate,
    notifyNewComplaint,
    notifyComment,
    notifyAnnouncement
};
