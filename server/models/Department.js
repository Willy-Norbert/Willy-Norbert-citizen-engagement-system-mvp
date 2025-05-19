
const mongoose = require('mongoose');

const departmentSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true
    },
    categories: {
        type: [String],
        required: true
    },
    contactEmail: String,
    contactPhone: String,
    staffMembers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    active: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Create the model
module.exports = mongoose.model('Department', departmentSchema);
