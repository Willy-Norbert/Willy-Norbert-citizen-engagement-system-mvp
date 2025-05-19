
const mongoose = require('mongoose');

const announcementSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    departmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
        required: true
    },
    publishDate: {
        type: Date,
        default: Date.now
    },
    expiryDate: {
        type: Date
    },
    attachments: [{
        filename: String,
        url: String,
        uploadDate: {
            type: Date,
            default: Date.now
        }
    }],
    visibility: {
        type: String,
        default: 'public',
        enum: ['public', 'department-only', 'admin-only']
    },
    status: {
        type: String,
        default: 'active',
        enum: ['active', 'archived']
    },
    priority: {
        type: String,
        default: 'normal',
        enum: ['low', 'normal', 'high', 'urgent']
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Announcement', announcementSchema);
