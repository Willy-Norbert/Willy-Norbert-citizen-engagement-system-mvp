
const mongoose = require('mongoose');

const resolvedComplaintSchema = mongoose.Schema({
    complaintId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Complaints',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true
    },
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
        default: Date.now
    },
    resolutionDetails: {
        resolvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        resolvedAt: {
            type: Date,
            default: Date.now
        },
        comments: String
    },
    departmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department'
    },
    attachments: [{
        filename: String,
        url: String,
        uploadDate: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

// Make sure to export with the EXACT name expected by other files
module.exports = mongoose.model('resolvedComs', resolvedComplaintSchema);
