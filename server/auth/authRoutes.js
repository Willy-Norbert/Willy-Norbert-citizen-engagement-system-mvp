
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// Import user model
const User = mongoose.model('User');

// JWT Secret
const JWT_SECRET = 'your-secret-key'; // In production, use environment variables

// Register route
router.post('/register', async (req, res) => {
  try {
    console.log('📝 Registration request received:', req.body);
    const { name, email, password, role, mobile, address, alternate, date } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('❌ Registration failed: Email already exists');
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user with proper role validation
    const userRole = role === 'admin' || role === 'department' ? 'citizen' : role; // Default to citizen unless verified
    
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: userRole,
      mobile: mobile || '',
      address: address || '',
      alternate: alternate || '',
      date: date || '',
      departmentId: null
    });

    await newUser.save();
    console.log('✅ User registered successfully:', { name, email, role: userRole });

    res.status(201).json({
      success: true,
      message: 'User registered successfully'
    });
  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error occurred during registration'
    });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    console.log('🔑 Login request received:', { email: req.body.email });
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      console.log('❌ Login failed: User not found');
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('❌ Login failed: Password incorrect');
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Return user info without password
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      departmentId: user.departmentId
    };

    console.log('✅ Login successful:', { email: user.email, role: user.role });
    res.json({
      success: true,
      token,
      user: userResponse
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error occurred during login'
    });
  }
});

// Get current user route
router.get('/me', async (req, res) => {
  try {
    // Authentication middleware should set req.user
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
