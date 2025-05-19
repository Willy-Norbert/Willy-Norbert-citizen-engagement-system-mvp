const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { authenticate, authorize, authorizeDepartment } = require('../middleware/auth');
const { 
    sendComplaintConfirmation, 
    sendComplaintUpdate,
    sendCommentNotification 
} = require('../utils/emailUtils');
const {
    notifyNewComplaint,
    notifyStatusUpdate,
    notifyComment
} = require('../utils/notificationUtils');

// Import models
const Complaint = mongoose.model('Complaints');
const Department = mongoose.model('Department');
const ResolvedComplaint = mongoose.model('resolvedComs');
const User = mongoose.model('User');

// Create a complaint (authenticated users only)
router.post('/', authenticate, async (req, res) => {
    try {
        const complaintData = { 
            ...req.body,
            userId: req.user.id 
        };
        
        // Validate required fields
        if (!complaintData.name || !complaintData.category || !complaintData.description) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields (name, category, description)"
            });
        }
        
        // Find department based on complaint category
        const department = await Department.findOne({
            categories: { $in: [complaintData.category] }
        });
        
        if (department) {
            complaintData.departmentId = department._id;
        }
        
        // Add initial status update
        complaintData.statusUpdates = [{
            status: 'pending',
            message: 'Complaint registered',
            updatedBy: req.user.id
        }];
        
        const complaint = new Complaint(complaintData);
        await complaint.save();
        
        // Send confirmation email asynchronously (don't wait for it)
        sendComplaintConfirmation(complaint, department)
            .then(result => {
                if (!result.success) {
                    console.log("Email notification could not be sent:", result.message || result.error);
                }
            })
            .catch(err => console.error("Email error:", err));
        
        // Send in-app notifications to admins and department (if assigned)
        notifyNewComplaint(complaint)
            .then(result => {
                if (!result.success) {
                    console.log("In-app notification could not be sent:", result.message || result.error);
                }
            })
            .catch(err => console.error("Notification error:", err));
        
        res.status(201).json({
            success: true,
            message: "Complaint submitted successfully",
            data: complaint
        });
    } catch (error) {
        console.error('Error creating complaint:', error);
        res.status(500).json({
            success: false,
            message: "Error submitting complaint",
            error: error.message
        });
    }
});

// Get all complaints (admins see all, departments see their assigned, users see their own)
router.get('/', authenticate, async (req, res) => {
    try {
        let query = {};
        
        // Filter based on role
        if (req.user.role === 'citizen') {
            // Citizens only see their own complaints
            query.userId = req.user.id;
        } else if (req.user.role === 'department') {
            // Department users only see complaints assigned to their department
            query.departmentId = req.user.departmentId;
        }
        // Admins see all complaints (no filter)
        
        // Add status filter if provided
        if (req.query.status && ['pending', 'in-progress', 'resolved', 'rejected'].includes(req.query.status)) {
            query.status = req.query.status;
        }
        
        // Add category filter if provided
        if (req.query.category) {
            query.category = req.query.category;
        }
        
        // Add department filter if admin provides it
        if (req.user.role === 'admin' && req.query.departmentId) {
            query.departmentId = req.query.departmentId;
        }
        
        // Find complaints based on query
        const complaints = await Complaint.find(query)
            .populate('departmentId', 'name')
            .populate('userId', 'name email')
            .sort({ createdAt: -1 });
        
        res.json({
            success: true,
            data: complaints
        });
    } catch (error) {
        console.error('Error fetching complaints:', error);
        res.status(500).json({
            success: false,
            message: "Error fetching complaints",
            error: error.message
        });
    }
});

// Get a complaint by ID
// Get a complaint by ID
router.get('/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params;

        const complaint = await Complaint.findById(id)
            .populate('departmentId', 'name description contactEmail contactPhone')
            .populate('userId', 'name email mobile')
            .populate('statusUpdates.updatedBy', 'name role')
            .populate('comments.postedBy', 'name role');

        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: "Complaint not found"
            });
        }

        // Check permissions
        // === Temporarily comment out or modify these checks to allow access ===
        // if (req.user.role === 'citizen' && complaint.userId.toString() !== req.user.id) {
        //     return res.status(403).json({
        //         success: false,
        //         message: "You don't have permission to view this complaint"
        //     });
        // }

        // if (req.user.role === 'department' && complaint.departmentId &&
        //     complaint.departmentId._id.toString() !== req.user.departmentId.toString()) {
        //     return res.status(403).json({
        //         success: false,
        //         message: "This complaint is not assigned to your department"
        //      trồng });
        // }
        // =====================================================================

        res.json({
            success: true,
            data: complaint
        });
    } catch (error) {
        console.error('Error fetching complaint:', error);
        res.status(500).json({
            success: false,
            message: "Error fetching complaint",
            error: error.message
        });
    }
});
// Update complaint status (admin or department)
router.put('/:id/status', authenticate, authorize('admin', 'department'), authorizeDepartment, async (req, res) => {
    try {
        const { id } = req.params;
        const { status, message } = req.body;
        
        if (!status || !['pending', 'in-progress', 'resolved', 'rejected'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid status provided"
            });
        }
        
        // Find complaint
        const complaint = await Complaint.findById(id);
        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: "Complaint not found"
            });
        }
        
        // Update status
        complaint.status = status;
        
        // Add status update record
        const statusUpdate = {
            status: status,
            message: message || `Status changed to ${status}`,
            updatedBy: req.user.id,
            timestamp: new Date()
        };
        
        complaint.statusUpdates.push(statusUpdate);
        
        await complaint.save();
        
        // If status is resolved, also save to resolved complaints collection
        if (status === 'resolved') {
            const resolvedComplaint = new ResolvedComplaint({
                complaintId: complaint._id,
                userId: complaint.userId,
                name: complaint.name,
                category: complaint.category,
                description: complaint.description,
                date: complaint.date,
                departmentId: complaint.departmentId,
                attachments: complaint.attachments,
                resolutionDetails: {
                    resolvedBy: req.user.id,
                    comments: message || 'Issue resolved'
                }
            });
            await resolvedComplaint.save();
        }
        
        // Get department for email notification
        let department = null;
        if (complaint.departmentId) {
            department = await Department.findById(complaint.departmentId);
        }
        
        // Send status update email asynchronously
        sendComplaintUpdate(complaint, statusUpdate, department)
            .then(result => {
                if (!result.success) {
                    console.log("Status update email could not be sent:", result.message || result.error);
                }
            })
            .catch(err => console.error("Email error:", err));
        
        // Send in-app notification to citizen
        notifyStatusUpdate(complaint, statusUpdate)
            .then(result => {
                if (!result.success) {
                    console.log("Status update notification could not be sent:", result.message || result.error);
                }
            })
            .catch(err => console.error("Notification error:", err));
        
        res.json({
            success: true,
            message: `Complaint status updated to ${status}`
        });
    } catch (error) {
        console.error('Error updating complaint status:', error);
        res.status(500).json({
            success: false,
            message: "Error updating complaint status",
            error: error.message
        });
    }
});

// Assign complaint to department (admin only)
router.put('/:id/assign', authenticate, authorize('admin'), async (req, res) => {
    try {
        const { id } = req.params;
        const { departmentId } = req.body;
        
        if (!departmentId) {
            return res.status(400).json({
                success: false,
                message: "Department ID is required"
            });
        }
        
        // Check if department exists
        const department = await Department.findById(departmentId);
        if (!department) {
            return res.status(404).json({
                success: false,
                message: "Department not found"
            });
        }
        
        // Find complaint
        const complaint = await Complaint.findById(id);
        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: "Complaint not found"
            });
        }
        
        // Update department assignment
        complaint.departmentId = departmentId;
        
        // Add status update for assignment
        const statusUpdate = {
            status: complaint.status,
            message: `Complaint assigned to ${department.name} department`,
            updatedBy: req.user.id,
            timestamp: new Date()
        };
        
        complaint.statusUpdates.push(statusUpdate);
        
        await complaint.save();
        
        // Send status update email asynchronously
        sendComplaintUpdate(complaint, statusUpdate, department)
            .then(result => {
                if (!result.success) {
                    console.log("Department assignment email could not be sent:", result.message || result.error);
                }
            })
            .catch(err => console.error("Email error:", err));
        
        res.json({
            success: true,
            message: `Complaint assigned to ${department.name} department`
        });
    } catch (error) {
        console.error('Error assigning complaint:', error);
        res.status(500).json({
            success: false,
            message: "Error assigning complaint",
            error: error.message
        });
    }
});

// Delete a complaint (admin only)
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
    try {
        const { id } = req.params;
        
        const deleted = await Complaint.findByIdAndDelete(id);
        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: "Complaint not found"
            });
        }
        
        res.json({
            success: true,
            message: "Complaint deleted successfully"
        });
    } catch (error) {
        console.error('Error deleting complaint:', error);
        res.status(500).json({
            success: false,
            message: "Error deleting complaint",
            error: error.message
        });
    }
});

// Add comment to complaint (all authenticated users)
router.post('/:id/comment', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const { message } = req.body;
        
        if (!message) {
            return res.status(400).json({
                success: false,
                message: "Comment message is required"
            });
        }
        
        // Find complaint
        const complaint = await Complaint.findById(id);
        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: "Complaint not found"
            });
        }
        
        // Check permissions - modified to be less restrictive
        if (req.user.role === 'citizen') {
            // Citizens can only comment on their own complaints
            if (complaint.userId.toString() !== req.user.id) {
                return res.status(403).json({
                    success: false,
                    message: "You don't have permission to comment on this complaint"
                });
            }
        }
        
        // Department users can comment on complaints assigned to them
        if (req.user.role === 'department') {
            // Allow department to comment on complaints assigned to them
            if (complaint.departmentId && complaint.departmentId.toString() !== req.user.departmentId.toString()) {
                return res.status(403).json({
                    success: false,
                    message: "This complaint is not assigned to your department"
                });
            }
        }
        
        // Create comment object
        const comment = {
            text: message,
            postedBy: req.user.id,
            timestamp: new Date()
        };
        
        // Add comment
        complaint.comments.push(comment);
        
        // Also add to status updates for backward compatibility
        complaint.statusUpdates.push({
            status: complaint.status, // Status remains unchanged
            message: message,
            updatedBy: req.user.id,
            timestamp: new Date()
        });
        
        await complaint.save();
        
        // If comment is from admin or department, send notification to citizen
        if (req.user.role === 'admin' || req.user.role === 'department') {
            // Get department info for email
            let department = null;
            if (complaint.departmentId) {
                department = await Department.findById(complaint.departmentId);
            }
            
            // Send comment notification email asynchronously
            sendCommentNotification(complaint, comment, department || { name: 'Admin' })
                .then(result => {
                    if (!result.success) {
                        console.log("Comment notification email could not be sent:", result.message || result.error);
                    }
                })
                .catch(err => console.error("Email error:", err));
        }
        
        // Send in-app notification
        notifyComment(complaint, comment)
            .then(result => {
                if (!result.success) {
                    console.log("Comment notification could not be sent:", result.message || result.error);
                }
            })
            .catch(err => console.error("Notification error:", err));
        
        res.json({
            success: true,
            message: "Comment added successfully"
        });
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({
            success: false,
            message: "Error adding comment",
            error: error.message
        });
    }
});

// Fixed endpoint: Add feedback to a resolved complaint (citizen only)
router.post('/:id/feedback', authenticate, authorize('citizen'), async (req, res) => {
    try {
        const { id } = req.params;
        const { feedback, rating } = req.body;
        
        if (!feedback) {
            return res.status(400).json({
                success: false,
                message: "Feedback message is required"
            });
        }
        
        // Find complaint
        const complaint = await Complaint.findById(id);
        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: "Complaint not found"
            });
        }
        
        // Check if this is the user's complaint
        if (complaint.userId.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "You can only provide feedback on your own complaints"
            });
        }
        
        // Check if complaint is resolved - removed this restriction
        /*
        if (complaint.status !== 'resolved') {
            return res.status(400).json({
                success: false,
                message: "You can only provide feedback on resolved complaints"
            });
        }
        */
        
        // Add feedback as status update
        complaint.statusUpdates.push({
            status: complaint.status,
            message: `Citizen Feedback: ${feedback}${rating ? ` (Rating: ${rating}/5)` : ''}`,
            updatedBy: req.user.id
        });
        
        // Add feedback to the complaint model directly
        complaint.citizenFeedback = {
            feedback,
            rating: rating || 0,
            submittedAt: new Date()
        };
        
        await complaint.save();
        
        // Also update the resolved complaint record if it exists
        if (complaint.status === 'resolved') {
            const resolvedComplaint = await ResolvedComplaint.findOne({ complaintId: complaint._id });
            if (resolvedComplaint) {
                resolvedComplaint.citizenFeedback = {
                    feedback,
                    rating: rating || 0,
                    submittedAt: new Date()
                };
                await resolvedComplaint.save();
            }
        }
        
        res.json({
            success: true,
            message: "Feedback submitted successfully"
        });
    } catch (error) {
        console.error('Error submitting feedback:', error);
        res.status(500).json({
            success: false,
            message: "Error submitting feedback",
            error: error.message
        });
    }
});

// New endpoint: Toggle notification preferences
router.put('/notifications/toggle', authenticate, async (req, res) => {
    try {
        // Find user and update notification preferences
        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        
        // Toggle email notifications
        user.emailNotifications = !user.emailNotifications;
        await user.save();
        
        res.json({
            success: true,
            message: `Email notifications ${user.emailNotifications ? 'enabled' : 'disabled'}`,
            emailNotifications: user.emailNotifications
        });
    } catch (error) {
        console.error('Error toggling notifications:', error);
        res.status(500).json({
            success: false,
            message: "Error updating notification preferences",
            error: error.message
        });
    }
});

// Get notification preferences
router.get('/notifications/preferences', authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        
        res.json({
            success: true,
            emailNotifications: user.emailNotifications
        });
    } catch (error) {
        console.error('Error fetching notification preferences:', error);
        res.status(500).json({
            success: false,
            message: "Error fetching notification preferences",
            error: error.message
        });
    }
});

// New endpoint: Update notification preferences
router.put('/notifications/preferences', authenticate, async (req, res) => {
    try {
        const { preferences } = req.body;
        
        if (!preferences) {
            return res.status(400).json({
                success: false,
                message: "Notification preferences are required"
            });
        }
        
        // Find user and update preferences
        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        
        // Update preferences
        if (preferences.inApp !== undefined) {
            user.notificationPreferences.inApp = {
                ...user.notificationPreferences.inApp,
                ...preferences.inApp
            };
        }
        
        if (preferences.email !== undefined) {
            user.notificationPreferences.email = {
                ...user.notificationPreferences.email,
                ...preferences.email
            };
            
            // For backward compatibility
            user.emailNotifications = preferences.email.enabled;
        }
        
        await user.save();
        
        res.json({
            success: true,
            message: "Notification preferences updated",
            preferences: user.notificationPreferences
        });
    } catch (error) {
        console.error('Error updating notification preferences:', error);
        res.status(500).json({
            success: false,
            message: "Error updating notification preferences",
            error: error.message
        });
    }
});

// Get notification preferences (detailed)
router.get('/notifications/detailed-preferences', authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        
        res.json({
            success: true,
            preferences: user.notificationPreferences || {
                inApp: { enabled: true, statusUpdates: true, announcements: true, comments: true },
                email: { enabled: user.emailNotifications, statusUpdates: true, announcements: true, comments: true }
            }
        });
    } catch (error) {
        console.error('Error fetching notification preferences:', error);
        res.status(500).json({
            success: false,
            message: "Error fetching notification preferences",
            error: error.message
        });
    }
});

module.exports = router;
