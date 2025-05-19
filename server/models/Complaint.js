
const mongoose = require('mongoose');

const complaintSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    mobile: String,
    category: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now()
    },
    status: {
        type: String,
        default: 'pending',
        enum: ['pending', 'in-progress', 'resolved', 'rejected']
    },
    departmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department'
    },
    statusUpdates: [{
        status: String,
        message: String,
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        timestamp: {
            type: Date,
            default: Date.now
        }
    }],
    priority: {
        type: String,
        default: 'medium',
        enum: ['low', 'medium', 'high', 'urgent']
    },
    location: {
        address: String,
        city: String,
        state: String,
        zipCode: String,
        coordinates: {
            lat: Number,
            lng: Number
        }
    },
    attachments: [{
        filename: String,
        url: String,
        uploadDate: {
            type: Date,
            default: Date.now
        }
    }],
    citizenFeedback: {
        feedback: String,
        rating: {
            type: Number,
            min: 0,
            max: 5
        },
        submittedAt: Date
    },
    comments: [{
        text: String,
        postedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        timestamp: {
            type: Date,
            default: Date.now
        }
    }],
    emailNotificationsSent: {
        created: {
            type: Boolean,
            default: false
        },
        statusUpdates: [{
            updateId: mongoose.Schema.Types.ObjectId,
            sent: Boolean,
            timestamp: Date
        }],
        comments: [{
            commentId: mongoose.Schema.Types.ObjectId,
            sent: Boolean,
            timestamp: Date
        }]
    },
    // New field for notification tracking
    notificationsSent: {
        created: {
            type: Boolean,
            default: false
        },
        statusUpdates: [{
            updateId: mongoose.Schema.Types.ObjectId,
            sent: Boolean,
            timestamp: Date
        }],
        comments: [{
            commentId: mongoose.Schema.Types.ObjectId, 
            sent: Boolean,
            timestamp: Date
        }]
    }
}, {
    timestamps: true
});

// Create model
module.exports = mongoose.model('Complaints', complaintSchema);
