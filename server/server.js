
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

// Enable CORS and JSON parsing
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' })); // Increased limit for larger payloads
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Simple ping endpoint for connection testing
app.get('/api/ping', (req, res) => {
  console.log('Ping received from client');
  res.json({ message: 'pong', status: 'Backend is running', timestamp: new Date().toISOString() });
});

// Connect to MongoDB with better error handling
require('dotenv').config();  // Load .env variables at the very top
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Connect using SRV URI from .env
    await mongoose.connect(process.env.MONGO_URI_SRV, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ MongoDB connected successfully');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    console.log('Trying alternative connection method...');

    try {
      await mongoose.connect(process.env.MONGO_URI_ALT, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
      console.log('✅ MongoDB connected successfully using alternative method');
    } catch (altErr) {
      console.error('❌ Alternative MongoDB connection also failed:', altErr.message);
      console.log('Starting server anyway, but database functionality will not work.');
    }
  }
};

module.exports = connectDB;


// Call the connect function
connectDB();

// Configure mongoose to suppress deprecation warnings
mongoose.set('strictQuery', false);

// Register models FIRST - before routes import them
require('./models/User');
require('./models/Department');
require('./models/Complaint');
require('./models/ResolvedComplaint');
require('./models/Announcement');
require('./models/Notification');
require('./models/Enquiry'); // Register the new Enquiry model

// Import routes AFTER models are registered
const authRoutes = require('./auth/authRoutes');
const userRoutes = require('./routes/userRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const announcementRoutes = require('./routes/announcementRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const seedRoutes = require('./routes/seedRoutes');
const enquiryRoutes = require('./routes/enquiryRoutes'); // Import the new enquiry routes

// Use routes
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/departments', departmentRoutes);
app.use('/complaints', complaintRoutes);
app.use('/announcements', announcementRoutes);
app.use('/notifications', notificationRoutes);
app.use('/seed', seedRoutes);
app.use('/enquiries', enquiryRoutes); // Use the enquiry routes



// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Print out all registered routes for debugging
console.log('✅ Routes registered:');
app._router.stack.forEach((middleware) => {
  if(middleware.route) { // routes registered directly on the app
    console.log(`Route: ${middleware.route.path}`);
  } else if(middleware.name === 'router') { // router middleware
    middleware.handle.stack.forEach((handler) => {
      if (handler.route) {
        const path = handler.route.path;
        const methods = Object.keys(handler.route.methods).join(', ').toUpperCase();
        console.log(`${methods}: ${path}`);
      }
    });
  }
});
// Special route for the EnquiryPage.js form
app.post('/engCreate', async (req, res) => {
  try {
    const Enquiry = mongoose.model('Enquiry');
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
    const User = mongoose.model('User');
    const Notification = mongoose.model('Notification');
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

console.log('✅ Server ready to accept connections.');

// Define port
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Test connection at: http://localhost:${PORT}/api/ping`);
});
