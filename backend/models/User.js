const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: 6,
        select: false
    },
    role: {
        type: String,
        enum: ['admin', 'coordinator', 'student', 'pending'],
        default: 'student'
    },
    // Legacy field kept for backward compat
    studentId: {
        type: String,
        unique: true,
        sparse: true
    },
    // New validated roll number (e.g. 23481A05F8)
    rollNumber: {
        type: String,
        unique: true,
        sparse: true,
        uppercase: true,
        trim: true
    },
    department: {
        type: String
    },
    branch: {
        type: String   // auto-derived from roll number (e.g. "1A05 - CSE")
    },
    year: {
        type: String   // auto-derived from roll number admission year
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);

