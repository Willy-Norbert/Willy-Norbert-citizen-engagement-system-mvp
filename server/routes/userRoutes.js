
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { authenticate, authorize } = require('../middleware/auth');

// Import models
const User = mongoose.model('User');
const Department = mongoose.model('Department');

// Get all users (admin only)
router.get('/', authenticate, authorize('admin'), async (req, res) => {
    try {
        const users = await User.find()
            .select('-password')
            .populate('departmentId', 'name');
            
        res.json({
            success: true,
            data: users
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({
            success: false,
            message: "Error fetching users",
            error: error.message
        });
    }
});

// Get user by ID (admin only or user themselves)
router.get('/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check permissions - only admin or the user themselves can view user details
        if (req.user.role !== 'admin' && req.user.id !== id) {
            return res.status(403).json({
                success: false,
                message: "Access denied: You don't have permission to view this user"
            });
        }
        
        const user = await User.findById(id)
            .select('-password')
            .populate('departmentId', 'name');
            
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        
        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({
            success: false,
            message: "Error fetching user",
            error: error.message
        });
    }
});

// Create a new user (admin only)
router.post('/', authenticate, authorize('admin'), async (req, res) => {
    try {
        const { name, email, password, role, mobile, address, alternate, departmentId } = req.body;
        
        // Validate required fields
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields (name, email, password)"
            });
        }
        
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User with this email already exists"
            });
        }
        
        // Check if department exists if assigning to one
        if (departmentId) {
            const department = await Department.findById(departmentId);
            if (!department) {
                return res.status(404).json({
                    success: false,
                    message: "Department not found"
                });
            }
        }
        
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        // Create new user
        const user = new User({
            name,
            email,
            password: hashedPassword,
            role: role || 'citizen',
            mobile: mobile || '',
            address: address || '',
            alternate: alternate || '',
            departmentId: departmentId || null
        });
        
        await user.save();
        
        // If user is department staff, add to department's staff members
        if (role === 'department' && departmentId) {
            await Department.findByIdAndUpdate(
                departmentId,
                { $addToSet: { staffMembers: user._id } }
            );
        }
        
        res.status(201).json({
            success: true,
            message: "User created successfully",
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({
            success: false,
            message: "Error creating user",
            error: error.message
        });
    }
});

// Update a user (admin only or user themselves)
router.put('/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        
        // Check permissions - only admin or the user themselves can update user details
        if (req.user.role !== 'admin' && req.user.id !== id) {
            return res.status(403).json({
                success: false,
                message: "Access denied: You don't have permission to update this user"
            });
        }
        
        // Find user
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        
        // Only admin can change roles or department assignments
        if (req.user.role !== 'admin') {
            delete updates.role;
            delete updates.departmentId;
        }
        
        // Don't allow email changes if already taken
        if (updates.email && updates.email !== user.email) {
            const emailExists = await User.findOne({ email: updates.email });
            if (emailExists) {
                return res.status(400).json({
                    success: false,
                    message: "Email already in use"
                });
            }
        }
        
        // Hash password if provided
        if (updates.password) {
            const salt = await bcrypt.genSalt(10);
            updates.password = await bcrypt.hash(updates.password, salt);
        }
        
        // Track department changes
        const oldDepartmentId = user.departmentId ? user.departmentId.toString() : null;
        const newDepartmentId = updates.departmentId || null;
        
        // Update user
        const updatedUser = await User.findByIdAndUpdate(
            id,
            { $set: updates },
            { new: true }
        ).select('-password');
        
        // Handle department staff changes if role or department changed
        if (req.user.role === 'admin' && 
            ((updates.role && updates.role !== user.role) || 
             (newDepartmentId !== oldDepartmentId))) {
            
            // Remove from old department if existed
            if (oldDepartmentId) {
                await Department.findByIdAndUpdate(
                    oldDepartmentId,
                    { $pull: { staffMembers: user._id } }
                );
            }
            
            // Add to new department if department role
            if (newDepartmentId && (updates.role === 'department' || (!updates.role && user.role === 'department'))) {
                await Department.findByIdAndUpdate(
                    newDepartmentId,
                    { $addToSet: { staffMembers: user._id } }
                );
            }
        }
        
        res.json({
            success: true,
            message: "User updated successfully",
            data: updatedUser
        });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({
            success: false,
            message: "Error updating user",
            error: error.message
        });
    }
});

// Delete a user (admin only)
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
    try {
        const { id } = req.params;
        
        // Don't allow deleting self
        if (req.user.id === id) {
            return res.status(400).json({
                success: false,
                message: "Cannot delete your own account"
            });
        }
        
        // Find user before deleting
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        
        // If department staff, remove from department
        if (user.role === 'department' && user.departmentId) {
            await Department.findByIdAndUpdate(
                user.departmentId,
                { $pull: { staffMembers: user._id } }
            );
        }
        
        // Delete user
        await User.findByIdAndDelete(id);
        
        res.json({
            success: true,
            message: "User deleted successfully"
        });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({
            success: false,
            message: "Error deleting user",
            error: error.message
        });
    }
});

module.exports = router;
