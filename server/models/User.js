
const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        default: 'citizen',
        enum: ['citizen', 'admin', 'department']
    },
    mobile: String,
    address: String,
    alternate: String,
    departmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
        default: null
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    otp: {
        code: String,
        expiresAt: Date
    },
    emailNotifications: {
        type: Boolean,
        default: true
    },
    // Add new notification preferences
    notificationPreferences: {
        inApp: {
            enabled: {
                type: Boolean,
                default: true
            },
            statusUpdates: {
                type: Boolean,
                default: true
            },
            announcements: {
                type: Boolean,
                default: true
            },
            comments: {
                type: Boolean,
                default: true
            }
        },
        email: {
            enabled: {
                type: Boolean,
                default: true
            },
            statusUpdates: {
                type: Boolean,
                default: true
            },
            announcements: {
                type: Boolean,
                default: true
            },
            comments: {
                type: Boolean,
                default: true
            }
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);
