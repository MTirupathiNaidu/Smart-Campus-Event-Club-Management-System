const mongoose = require('mongoose');
const crypto = require('crypto');

const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Event title is required'],
        trim: true
    },
    description: {
        type: String,
        default: ''
    },
    date: {
        type: Date,
        required: [true, 'Event date is required']
    },
    venue: {
        type: String,
        default: ''
    },
    startTime: {
        type: Date
    },
    endTime: {
        type: Date
    },
    prizeTime: {
        type: Date
    },
    organizers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    max_participants: {
        type: Number,
        default: 100
    },
    club: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Club',
        default: null
    },
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    qr_token: {
        type: String,
        default: () => crypto.randomBytes(32).toString('hex'),
        unique: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
