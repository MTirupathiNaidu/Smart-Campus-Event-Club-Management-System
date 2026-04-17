const mongoose = require('mongoose');

const clubSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Club name is required'],
        trim: true,
        unique: true
    },
    description: {
        type: String,
        default: ''
    },
    coordinator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    }
}, { timestamps: true });

module.exports = mongoose.model('Club', clubSchema);
