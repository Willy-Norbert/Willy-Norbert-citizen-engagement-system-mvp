
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { authenticate, authorize } = require('../middleware/auth');

// Import models
const Announcement = mongoose.model('Announcement');
const Department = mongoose.model('Department');

// Create an announcement (department staff or admin only)
router.post('/', authenticate, authorize('admin', 'department'), async (req, res) => {
    try {
        const { title, content, expiryDate, visibility, attachments, priority } = req.body;
        
        // Validate required fields
        if (!title || !content) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields (title, content)"
            });
        }
        
        // If department user, use their departmentId
        let departmentId = req.body.departmentId;
        
        if (req.user.role === 'department') {
            departmentId = req.user.departmentId;
        } else if (req.user.role === 'admin' && !departmentId) {
            return res.status(400).json({
                success: false,
                message: "Department ID is required for admin users"
            });
        }
        
        // Validate department exists
        const department = await Department.findById(departmentId);
        if (!department) {
            return res.status(404).json({
                success: false,
                message: "Department not found"
            });
        }
        
        const announcement = new Announcement({
            title,
            content,
            departmentId,
            expiryDate: expiryDate || null,
            visibility: visibility || 'public',
            attachments: attachments || [],
            priority: priority || 'normal'
        });
        
        await announcement.save();
        
        res.status(201).json({
            success: true,
            message: "Announcement created successfully",
            data: announcement
        });
    } catch (error) {
        console.error('Error creating announcement:', error);
        res.status(500).json({
            success: false,
            message: "Error creating announcement",
            error: error.message
        });
    }
});

// Get all announcements (with filters)
router.get('/', async (req, res) => {
    try {
        let query = { status: 'active' }; // Only show active announcements by default
        
        // Filter by department if specified
        if (req.query.departmentId) {
            query.departmentId = req.query.departmentId;
        }
        
        // Handle visibility permissions
        if (!req.user) {
            // Unauthenticated users can only see public announcements
            query.visibility = 'public';
        } else if (req.user.role === 'department') {
            // Department users can see their own announcements, public ones, and department-only ones from their department
            query.$or = [
                { departmentId: req.user.departmentId },
                { visibility: 'public' },
                { visibility: 'department-only', departmentId: req.user.departmentId }
            ];
        } else if (req.user.role === 'citizen') {
            // Citizens can only see public announcements
            query.visibility = 'public';
        }
        // Admins can see all announcements (no additional filter)
        
        // Only show non-expired announcements
        const currentDate = new Date();
        query.$and = [
            {
                $or: [
                    { expiryDate: { $gt: currentDate } },
                    { expiryDate: null }
                ]
            }
        ];
        
        const announcements = await Announcement.find(query)
            .populate('departmentId', 'name')
            .sort({ priority: -1, publishDate: -1 });
        
        res.json({
            success: true,
            data: announcements
        });
    } catch (error) {
        console.error('Error fetching announcements:', error);
        res.status(500).json({
            success: false,
            message: "Error fetching announcements",
            error: error.message
        });
    }
});

// Get announcement by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const announcement = await Announcement.findById(id)
            .populate('departmentId', 'name');
        
        if (!announcement) {
            return res.status(404).json({
                success: false,
                message: "Announcement not found"
            });
        }
        
        // Check if announcement is private and user is authorized
        if (announcement.visibility !== 'public') {
            if (!req.user) {
                return res.status(403).json({
                    success: false,
                    message: "You don't have permission to view this announcement"
                });
            }
            
            if (announcement.visibility === 'department-only' && 
                (req.user.role !== 'admin' && 
                (req.user.role !== 'department' || 
                req.user.departmentId.toString() !== announcement.departmentId.toString()))) {
                return res.status(403).json({
                    success: false,
                    message: "You don't have permission to view this announcement"
                });
            }
            
            if (announcement.visibility === 'admin-only' && 
                req.user.role !== 'admin') {
                return res.status(403).json({
                    success: false,
                    message: "You don't have permission to view this announcement"
                });
            }
        }
        
        res.json({
            success: true,
            data: announcement
        });
    } catch (error) {
        console.error('Error fetching announcement:', error);
        res.status(500).json({
            success: false,
            message: "Error fetching announcement",
            error: error.message
        });
    }
});

// Update announcement (department that created it or admin only)
router.put('/:id', authenticate, authorize('admin', 'department'), async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        
        // Find announcement
        const announcement = await Announcement.findById(id);
        if (!announcement) {
            return res.status(404).json({
                success: false,
                message: "Announcement not found"
            });
        }
        
        // Check if user is authorized to update
        if (req.user.role === 'department' && 
            announcement.departmentId.toString() !== req.user.departmentId.toString()) {
            return res.status(403).json({
                success: false,
                message: "You can only update announcements from your department"
            });
        }
        
        // Remove departmentId from updates if department user
        if (req.user.role === 'department') {
            delete updates.departmentId;
        }
        
        // Update announcement
        const updatedAnnouncement = await Announcement.findByIdAndUpdate(
            id,
            { $set: updates },
            { new: true }
        );
        
        res.json({
            success: true,
            message: "Announcement updated successfully",
            data: updatedAnnouncement
        });
    } catch (error) {
        console.error('Error updating announcement:', error);
        res.status(500).json({
            success: false,
            message: "Error updating announcement",
            error: error.message
        });
    }
});

// Delete announcement (department that created it or admin only)
router.delete('/:id', authenticate, authorize('admin', 'department'), async (req, res) => {
    try {
        const { id } = req.params;
        
        // Find announcement
        const announcement = await Announcement.findById(id);
        if (!announcement) {
            return res.status(404).json({
                success: false,
                message: "Announcement not found"
            });
        }
        
        // Check if user is authorized to delete
        if (req.user.role === 'department' && 
            announcement.departmentId.toString() !== req.user.departmentId.toString()) {
            return res.status(403).json({
                success: false,
                message: "You can only delete announcements from your department"
            });
        }
        
        // Delete announcement
        await Announcement.findByIdAndDelete(id);
        
        res.json({
            success: true,
            message: "Announcement deleted successfully"
        });
    } catch (error) {
        console.error('Error deleting announcement:', error);
        res.status(500).json({
            success: false,
            message: "Error deleting announcement",
            error: error.message
        });
    }
});

module.exports = router;
