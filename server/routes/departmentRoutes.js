
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { authenticate, authorize } = require('../middleware/auth');

// Import models
const Department = mongoose.model('Department');
const User = mongoose.model('User');

// Get all departments
router.get('/', async (req, res) => {
    try {
        const departments = await Department.find({});
        res.json({
            success: true,
            data: departments
        });
    } catch (error) {
        console.error('Error fetching departments:', error);
        res.status(500).json({
            success: false,
            message: "Error fetching departments",
            error: error.message
        });
    }
});

// Create a department (admin only)
router.post('/', authenticate, authorize('admin'), async (req, res) => {
    try {
        const { name, description, categories, contactEmail, contactPhone } = req.body;
        
        // Validate required fields
        if (!name || !description || !categories || !Array.isArray(categories)) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields (name, description, categories)"
            });
        }
        
        // Check for duplicate department name
        const existingDepartment = await Department.findOne({ name });
        if (existingDepartment) {
            return res.status(400).json({
                success: false,
                message: "Department with this name already exists"
            });
        }
        
        const department = new Department({
            name,
            description,
            categories,
            contactEmail: contactEmail || '',
            contactPhone: contactPhone || '',
        });
        
        await department.save();
        
        res.status(201).json({
            success: true,
            message: "Department created successfully",
            data: department
        });
    } catch (error) {
        console.error('Error creating department:', error);
        res.status(500).json({
            success: false,
            message: "Error creating department",
            error: error.message
        });
    }
});

// Update a department (admin only)
router.put('/:id', authenticate, authorize('admin'), async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        
        const department = await Department.findById(id);
        if (!department) {
            return res.status(404).json({
                success: false,
                message: "Department not found"
            });
        }
        
        // If changing name, check for duplicates
        if (updates.name && updates.name !== department.name) {
            const duplicateName = await Department.findOne({ name: updates.name });
            if (duplicateName) {
                return res.status(400).json({
                    success: false,
                    message: "Department name already exists"
                });
            }
        }
        
        // Update department
        const updatedDepartment = await Department.findByIdAndUpdate(
            id,
            { $set: updates },
            { new: true }
        );
        
        res.json({
            success: true,
            message: "Department updated successfully",
            data: updatedDepartment
        });
    } catch (error) {
        console.error('Error updating department:', error);
        res.status(500).json({
            success: false,
            message: "Error updating department",
            error: error.message
        });
    }
});

// Assign user to department (admin only)
router.post('/:departmentId/assign-staff', authenticate, authorize('admin'), async (req, res) => {
    try {
        const { departmentId } = req.params;
        const { userId } = req.body;
        
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "User ID is required"
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
        
        // Check if user exists and update role to department
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        
        // Update user role and departmentId
        user.role = 'department';
        user.departmentId = departmentId;
        await user.save();
        
        // Add user to department staff if not already there
        if (!department.staffMembers.includes(userId)) {
            department.staffMembers.push(userId);
            await department.save();
        }
        
        res.json({
            success: true,
            message: "User assigned to department successfully"
        });
    } catch (error) {
        console.error('Error assigning user to department:', error);
        res.status(500).json({
            success: false,
            message: "Error assigning user to department",
            error: error.message
        });
    }
});

// Get department staff members
router.get('/:departmentId/staff', authenticate, authorize('admin', 'department'), async (req, res) => {
    try {
        const { departmentId } = req.params;
        
        // Authorization check for department staff
        if (req.user.role === 'department' && req.user.departmentId.toString() !== departmentId) {
            return res.status(403).json({
                success: false,
                message: "You can only view staff members of your own department"
            });
        }
        
        // Find department with populated staff members
        const department = await Department.findById(departmentId);
        if (!department) {
            return res.status(404).json({
                success: false,
                message: "Department not found"
            });
        }
        
        // Get staff members with limited information (no passwords)
        const staffMembers = await User.find({
            _id: { $in: department.staffMembers }
        }).select('_id name email mobile');
        
        res.json({
            success: true,
            data: staffMembers
        });
    } catch (error) {
        console.error('Error fetching department staff:', error);
        res.status(500).json({
            success: false,
            message: "Error fetching department staff",
            error: error.message
        });
    }
});

// Get department by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const department = await Department.findById(id);
        if (!department) {
            return res.status(404).json({
                success: false,
                message: "Department not found"
            });
        }
        
        res.json({
            success: true,
            data: department
        });
    } catch (error) {
        console.error('Error fetching department:', error);
        res.status(500).json({
            success: false,
            message: "Error fetching department",
            error: error.message
        });
    }
});

// Get categories from all departments
router.get('/categories/all', async (req, res) => {
    try {
        const departments = await Department.find({}, 'categories');
        
        // Extract unique categories
        const allCategories = departments.reduce((acc, dept) => {
            return [...acc, ...dept.categories];
        }, []);
        
        // Remove duplicates
        const uniqueCategories = [...new Set(allCategories)];
        
        res.json({
            success: true,
            data: uniqueCategories
        });
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({
            success: false,
            message: "Error fetching categories",
            error: error.message
        });
    }
});

module.exports = router;
