const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { authenticate } = require('../middleware/auth');

// Import models
const Notification = mongoose.model('Notification');
const User = mongoose.model('User');

// Get notifications for the authenticated user
router.get('/', authenticate, async (req, res) => {
    try {
        const notifications = await Notification.find({ 
            userId: req.user.id 
        })
        .sort({ createdAt: -1 })
        .limit(50); // Limit to recent 50 notifications
        
        res.json({
            success: true,
            data: notifications,
            unreadCount: notifications.filter(n => !n.isRead).length
        });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({
            success: false,
            message: "Error fetching notifications",
            error: error.message
        });
    }
});

// Mark notifications as read
router.put('/mark-read', authenticate, async (req, res) => {
    try {
        const { notificationIds } = req.body;
        
        // If specific IDs provided, mark only those as read
        if (notificationIds && notificationIds.length) {
            await Notification.updateMany(
                { 
                    _id: { $in: notificationIds },
                    userId: req.user.id 
                },
                { $set: { isRead: true } }
            );
        } 
        // Otherwise mark all as read
        else {
            await Notification.updateMany(
                { userId: req.user.id, isRead: false },
                { $set: { isRead: true } }
            );
        }
        
        res.json({
            success: true,
            message: "Notifications marked as read"
        });
    } catch (error) {
        console.error('Error marking notifications as read:', error);
        res.status(500).json({
            success: false,
            message: "Error updating notifications",
            error: error.message
        });
    }
});

// Get unread count
router.get('/unread-count', authenticate, async (req, res) => {
    try {
        const count = await Notification.countDocuments({ 
            userId: req.user.id,
            isRead: false
        });
        
        res.json({
            success: true,
            unreadCount: count
        });
    } catch (error) {
        console.error('Error counting unread notifications:', error);
        res.status(500).json({
            success: false,
            message: "Error counting notifications",
            error: error.message
        });
    }
});

// Delete notification
router.delete('/:id', authenticate, async (req, res) => {
    try {
        const notification = await Notification.findOneAndDelete({
            _id: req.params.id,
            userId: req.user.id
        });
        
        if (!notification) {
            return res.status(404).json({
                success: false,
                message: "Notification not found or you don't have permission to delete it"
            });
        }
        
        res.json({
            success: true,
            message: "Notification deleted"
        });
    } catch (error) {
        console.error('Error deleting notification:', error);
        res.status(500).json({
            success: false,
            message: "Error deleting notification",
            error: error.message
        });
    }
});

module.exports = router;
