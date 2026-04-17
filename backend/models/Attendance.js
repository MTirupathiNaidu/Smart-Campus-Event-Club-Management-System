const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['present', 'absent'],
        default: 'present'
    }
}, { timestamps: true });

// Prevent duplicate attendance entries
attendanceSchema.index({ event: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
