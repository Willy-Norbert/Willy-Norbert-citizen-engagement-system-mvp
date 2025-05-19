
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// Import models - only after they've been registered in server.js
const User = mongoose.model('User');

// JWT Secret
const JWT_SECRET = 'your-secret-key'; // In production, use environment variables

// Authentication middleware
exports.authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      req.user = null; // Allow unauthenticated access for some endpoints
      return next();
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Find user by id
    const user = await User.findById(decoded.id);
    if (!user) {
      req.user = null;
      return next();
    }

    // Set user in request
    req.user = {
      id: user._id,
      role: user.role,
      departmentId: user.departmentId
    };
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    req.user = null; // Set user to null on error
    next();
  }
};

// Role-based authorization middleware
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You do not have permission to perform this action'
      });
    }
    
    next();
  };
};

// Department specific authorization middleware
exports.authorizeDepartment = async (req, res, next) => {
  try {
    // Skip check for admins
    if (req.user.role === 'admin') {
      return next();
    }
    
    // Check if user is department staff and check departmentId
    if (req.user.role === 'department') {
      const complaintId = req.params.id || req.body.complaintId;
      
      if (!complaintId) {
        return next();
      }
      
      // Check if complaint belongs to user's department
      const Complaint = mongoose.model('Complaints');
      const complaint = await Complaint.findById(complaintId);
      
      if (!complaint) {
        return next(); // Let the route handler handle non-existent complaints
      }
      
      // If complaint has no departmentId yet, allow access
      if (!complaint.departmentId) {
        return next();
      }
      
      if (complaint.departmentId.toString() !== req.user.departmentId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: This complaint is not assigned to your department'
        });
      }
    }
    
    next();
  } catch (error) {
    console.error('Department authorization error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during authorization check'
    });
  }
};
