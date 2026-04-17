const Event = require('../models/Event');
const Registration = require('../models/Registration');
const Attendance = require('../models/Attendance');

// POST /api/attendance/scan - Student scans QR
const markAttendance = async (req, res) => {
    try {
        const { qr_token } = req.body;
        const student_id = req.user.id;

        if (!qr_token) return res.status(400).json({ message: 'QR token is required.' });

        const event = await Event.findOne({ qr_token });
        if (!event) return res.status(404).json({ message: 'Invalid QR code.' });

        const isRegistered = await Registration.exists({ event: event._id, student: student_id });
        if (!isRegistered) {
            return res.status(403).json({ message: 'You are not registered for this event.' });
        }

        await Attendance.create({ event: event._id, student: student_id, status: 'present' });
        res.json({ message: `Attendance marked for "${event.title}".`, event_id: event._id, event_title: event.title });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({ message: 'Attendance already marked for this event.' });
        }
        console.error(err);
        res.status(500).json({ message: 'Server error.' });
    }
};

// GET /api/attendance/event/:id - coordinator/admin
const getEventAttendance = async (req, res) => {
    try {
        const records = await Attendance.find({ event: req.params.id })
            .populate('student', 'name email')
            .sort({ createdAt: -1 });
        res.json(records);
    } catch (err) {
        res.status(500).json({ message: 'Server error.' });
    }
};

// GET /api/attendance/my - student's own attendance
const getMyAttendance = async (req, res) => {
    try {
        const records = await Attendance.find({ student: req.user.id })
            .populate({ path: 'event', populate: { path: 'club', select: 'name' } })
            .sort({ createdAt: -1 });
        res.json(records);
    } catch (err) {
        res.status(500).json({ message: 'Server error.' });
    }
};

module.exports = { markAttendance, getEventAttendance, getMyAttendance };
