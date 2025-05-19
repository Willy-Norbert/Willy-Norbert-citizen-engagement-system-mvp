
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Enquiry = mongoose.model('Enquiry');
const User = mongoose.model('User');
const Notification = mongoose.model('Notification');
const {authenticate} = require('../middleware/auth');

// Create a new enquiry
router.post('/create', async (req, res) => {
    try {
        const { name, mobile, address, email, description, category, date } = req.body;
        
        if (!name || !mobile || !address || !email || !description || !category || !date) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }

        // Create a new enquiry
        const enquiry = new Enquiry({
            name,
            mobile,
            address,
            email,
            description,
            category,
            date: new Date(date)
        });

        await enquiry.save();

        // Create notifications for all admin users
        const adminUsers = await User.find({ role: 'admin' });
        
        for (const admin of adminUsers) {
            const notification = new Notification({
                userId: admin._id,
                title: 'New Enquiry Received',
                message: `New ${category} enquiry from ${name}`,
                type: 'system',
                isRead: false
            });
            
            await notification.save();
        }

        res.status(201).json({
            success: true,
            message: 'Enquiry submitted successfully',
            data: enquiry
        });
    } catch (error) {
        console.error('Error creating enquiry:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to submit enquiry',
            error: error.message
        });
    }
});

// Get all enquiries (admin only)
router.get('/all', authenticate, async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin' && req.user.role !== 'department') {
            return res.status(403).json({ 
                success: false, 
                message: 'Access denied: Only admins and departments can view all enquiries' 
            });
        }

        const enquiries = await Enquiry.find().sort({ createdAt: -1 });
        
        res.status(200).json({
            success: true,
            count: enquiries.length,
            data: enquiries
        });
    } catch (error) {
        console.error('Error fetching enquiries:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch enquiries',
            error: error.message
        });
    }
});

// Get enquiry by ID
router.get('/:id', authenticate, async (req, res) => {
    try {
        const enquiry = await Enquiry.findById(req.params.id);
        
        if (!enquiry) {
            return res.status(404).json({
                success: false,
                message: 'Enquiry not found'
            });
        }

        res.status(200).json({
            success: true,
            data: enquiry
        });
    } catch (error) {
        console.error('Error fetching enquiry:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch enquiry',
            error: error.message
        });
    }
});

// Update enquiry status (admin only)
router.put('/:id', authenticate, async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin' && req.user.role !== 'department') {
            return res.status(403).json({ 
                success: false, 
                message: 'Access denied: Only admins and departments can update enquiries' 
            });
        }

        const { status } = req.body;
        
        if (!status) {
            return res.status(400).json({
                success: false,
                message: 'Status is required'
            });
        }

        const enquiry = await Enquiry.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true, runValidators: true }
        );
        
        if (!enquiry) {
            return res.status(404).json({
                success: false,
                message: 'Enquiry not found'
            });
        }

        res.status(200).json({
            success: true,
            data: enquiry,
            message: 'Enquiry status updated successfully'
        });
    } catch (error) {
        console.error('Error updating enquiry:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update enquiry',
            error: error.message
        });
    }
});

// Get enquiries by email or mobile
router.post('/search', async (req, res) => {
    try {
        const { email, mobile } = req.body;
        
        if (!email && !mobile) {
            return res.status(400).json({
                success: false,
                message: 'Email or mobile is required for search'
            });
        }

        const query = {};
        if (email) query.email = email;
        if (mobile) query.mobile = mobile;

        const enquiries = await Enquiry.find(query).sort({ createdAt: -1 });
        
        res.status(200).json({
            success: true,
            count: enquiries.length,
            data: enquiries
        });
    } catch (error) {
        console.error('Error searching enquiries:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to search enquiries',
            error: error.message
        });
    }
});

module.exports = router;
