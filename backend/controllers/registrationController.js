const Event = require('../models/Event');
const Registration = require('../models/Registration');

// POST /api/registrations/register
const registerForEvent = async (req, res) => {
    try {
        const { event_id } = req.body;
        const student_id = req.user.id;

        if (!event_id) return res.status(400).json({ message: 'Event ID is required.' });

        const event = await Event.findById(event_id);
        if (!event) return res.status(404).json({ message: 'Event not found.' });

        if (new Date(event.date) < new Date()) {
            return res.status(400).json({ message: 'Cannot register for past events.' });
        }

        const count = await Registration.countDocuments({ event: event_id });
        if (count >= event.max_participants) {
            return res.status(400).json({ message: 'Event is fully booked.' });
        }

        // Will throw duplicate key error if already registered (index on event+student)
        await Registration.create({ event: event_id, student: student_id });
        res.status(201).json({ message: 'Registered successfully.' });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({ message: 'Already registered for this event.' });
        }
        console.error(err);
        res.status(500).json({ message: 'Server error.' });
    }
};

// POST /api/registrations/cancel
const cancelRegistration = async (req, res) => {
    try {
        const { event_id } = req.body;
        const result = await Registration.findOneAndDelete({ event: event_id, student: req.user.id });
        if (!result) return res.status(404).json({ message: 'Registration not found.' });
        res.json({ message: 'Registration cancelled.' });
    } catch (err) {
        res.status(500).json({ message: 'Server error.' });
    }
};

// GET /api/registrations/my - student's registrations
const getMyRegistrations = async (req, res) => {
    try {
        const registrations = await Registration.find({ student: req.user.id })
            .populate({
                path: 'event',
                populate: { path: 'club', select: 'name' }
            })
            .sort({ createdAt: -1 });
        res.json(registrations);
    } catch (err) {
        res.status(500).json({ message: 'Server error.' });
    }
};

// GET /api/registrations/all - Admin
const getAllRegistrations = async (req, res) => {
    try {
        const registrations = await Registration.find()
            .populate('event', 'title date')
            .populate('student', 'name email')
            .sort({ createdAt: -1 });
        res.json(registrations);
    } catch (err) {
        res.status(500).json({ message: 'Server error.' });
    }
};

module.exports = { registerForEvent, cancelRegistration, getMyRegistrations, getAllRegistrations };
