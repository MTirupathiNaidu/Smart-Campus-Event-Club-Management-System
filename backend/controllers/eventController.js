const Event = require('../models/Event');
const Registration = require('../models/Registration');
const Attendance = require('../models/Attendance');

// GET /api/events
const getAllEvents = async (req, res) => {
    try {
        const eventsWithCounts = await Event.aggregate([
            { $sort: { date: -1 } },
            { $lookup: { from: 'clubs', localField: 'club', foreignField: '_id', as: 'club' } },
            { $unwind: { path: '$club', preserveNullAndEmptyArrays: true } },
            { $lookup: { from: 'users', localField: 'created_by', foreignField: '_id', as: 'created_by' } },
            { $unwind: { path: '$created_by', preserveNullAndEmptyArrays: true } },
            { $lookup: { from: 'registrations', localField: '_id', foreignField: 'event', as: 'registrations' } },
            { $addFields: { registration_count: { $size: '$registrations' } } },
            { $project: { registrations: 0, 'created_by.password': 0 } }
        ]);
        res.json(eventsWithCounts);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error.' });
    }
};

// GET /api/events/upcoming
const getUpcomingEvents = async (req, res) => {
    try {
        const eventsWithCounts = await Event.aggregate([
            { $match: { date: { $gte: new Date() } } },
            { $sort: { date: 1 } },
            { $lookup: { from: 'clubs', localField: 'club', foreignField: '_id', as: 'club' } },
            { $unwind: { path: '$club', preserveNullAndEmptyArrays: true } },
            { $lookup: { from: 'users', localField: 'created_by', foreignField: '_id', as: 'created_by' } },
            { $unwind: { path: '$created_by', preserveNullAndEmptyArrays: true } },
            { $lookup: { from: 'registrations', localField: '_id', foreignField: 'event', as: 'registrations' } },
            { $addFields: { registration_count: { $size: '$registrations' } } },
            { $project: { registrations: 0, 'created_by.password': 0 } }
        ]);
        res.json(eventsWithCounts);
    } catch (err) {
        res.status(500).json({ message: 'Server error.' });
    }
};

// GET /api/events/my - coordinator's own events
const getMyEvents = async (req, res) => {
    try {
        const eventsWithCounts = await Event.aggregate([
            { $match: { created_by: new (require('mongoose').Types.ObjectId)(req.user.id) } },
            { $sort: { date: -1 } },
            { $lookup: { from: 'clubs', localField: 'club', foreignField: '_id', as: 'club' } },
            { $unwind: { path: '$club', preserveNullAndEmptyArrays: true } },
            { $lookup: { from: 'registrations', localField: '_id', foreignField: 'event', as: 'registrations' } },
            { $lookup: { from: 'attendances', localField: '_id', foreignField: 'event', as: 'attendances' } },
            { $addFields: { registration_count: { $size: '$registrations' }, attendance_count: { $size: '$attendances' } } },
            { $project: { registrations: 0, attendances: 0 } }
        ]);
        res.json(eventsWithCounts);
    } catch (err) {
        res.status(500).json({ message: 'Server error.' });
    }
};

// GET /api/events/analytics - Admin: registrations vs attendance per event
const getAttendanceAnalytics = async (req, res) => {
    try {
        const analytics = await Event.aggregate([
            { $sort: { date: -1 } },
            { $limit: 10 },
            { $lookup: { from: 'registrations', localField: '_id', foreignField: 'event', as: 'registrations' } },
            { $lookup: { from: 'attendances', localField: '_id', foreignField: 'event', as: 'attendances' } },
            { $project: { title: 1, registrations: { $size: '$registrations' }, attendance: { $size: '$attendances' } } }
        ]);
        res.json(analytics);
    } catch (err) {
        res.status(500).json({ message: 'Server error.' });
    }
};

// GET /api/events/:id
const getEventById = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id)
            .populate('club', 'name')
            .populate('created_by', 'name');
        if (!event) return res.status(404).json({ message: 'Event not found.' });
        res.json(event);
    } catch (err) {
        res.status(500).json({ message: 'Server error.' });
    }
};

// GET /api/events/:id/participants
const getEventParticipants = async (req, res) => {
    try {
        const eventId = new (require('mongoose').Types.ObjectId)(req.params.id);
        const participants = await Registration.aggregate([
            { $match: { event: eventId } },
            { $sort: { createdAt: -1 } },
            { $lookup: { from: 'users', localField: 'student', foreignField: '_id', as: 'student_info' } },
            { $unwind: '$student_info' },
            { $lookup: {
                from: 'attendances',
                let: { studentId: '$student', eventId: '$event' },
                pipeline: [
                    { $match: { $expr: { $and: [{ $eq: ['$student', '$$studentId'] }, { $eq: ['$event', '$$eventId'] }] } } }
                ],
                as: 'attendance_info'
            }},
            { $project: {
                id: '$student_info._id',
                name: '$student_info.name',
                email: '$student_info.email',
                registered_at: '$createdAt',
                attendance_status: { $let: { vars: { att: { $arrayElemAt: ['$attendance_info', 0] } }, in: { $ifNull: ['$$att.status', null] } } }
            }}
        ]);
        res.json(participants);
    } catch (err) {
        res.status(500).json({ message: 'Server error.' });
    }
};

// POST /api/events
const createEvent = async (req, res) => {
    try {
        const { title, description, date, venue, max_participants, club_id, startTime, endTime, prizeTime } = req.body;
        if (!title || !date) return res.status(400).json({ message: 'Title and date are required.' });

        const event = await Event.create({
            title,
            description: description || '',
            date,
            venue: venue || '',
            startTime: startTime || undefined,
            endTime: endTime || undefined,
            prizeTime: prizeTime || undefined,
            max_participants: max_participants || 100,
            club: club_id || null,
            created_by: req.user.id
        });
        res.status(201).json({ message: 'Event created.', event });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error.' });
    }
};

// PUT /api/events/:id
const updateEvent = async (req, res) => {
    try {
        const { title, description, date, venue, max_participants, club_id, startTime, endTime, prizeTime } = req.body;
        const { id } = req.params;

        const event = await Event.findById(id);
        if (!event) return res.status(404).json({ message: 'Event not found.' });

        if (req.user.role !== 'admin' && event.created_by.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to edit this event.' });
        }

        Object.assign(event, {
            title: title ?? event.title,
            description: description ?? event.description,
            date: date ?? event.date,
            venue: venue ?? event.venue,
            startTime: startTime ?? event.startTime,
            endTime: endTime ?? event.endTime,
            prizeTime: prizeTime ?? event.prizeTime,
            max_participants: max_participants ?? event.max_participants,
            club: club_id ?? event.club
        });
        await event.save();
        res.json({ message: 'Event updated.', event });
    } catch (err) {
        res.status(500).json({ message: 'Server error.' });
    }
};

// DELETE /api/events/:id
const deleteEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const event = await Event.findById(id);
        if (!event) return res.status(404).json({ message: 'Event not found.' });

        if (req.user.role !== 'admin' && event.created_by.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to delete this event.' });
        }

        await event.deleteOne();
        res.json({ message: 'Event deleted.' });
    } catch (err) {
        res.status(500).json({ message: 'Server error.' });
    }
};

// GET /api/events/public
const getPublicEvents = async (req, res) => {
    try {
        const eventsWithCounts = await Event.aggregate([
            { $sort: { date: 1 } },
            { $lookup: { from: 'clubs', localField: 'club', foreignField: '_id', as: 'club' } },
            { $unwind: { path: '$club', preserveNullAndEmptyArrays: true } },
            { $lookup: { from: 'users', localField: 'created_by', foreignField: '_id', as: 'created_by' } },
            { $unwind: { path: '$created_by', preserveNullAndEmptyArrays: true } },
            { $lookup: { from: 'users', localField: 'organizers', foreignField: '_id', as: 'organizer_details' } },
            { $lookup: { from: 'registrations', localField: '_id', foreignField: 'event', as: 'registrations' } },
            { $addFields: { registration_count: { $size: '$registrations' } } },
            { $project: { registrations: 0, 'created_by.password': 0, 'organizer_details.password': 0 } }
        ]);
        res.json(eventsWithCounts);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error.' });
    }
};

// POST /api/events/:id/organizers
const becomeOrganizer = async (req, res) => {
    try {
        const { id } = req.params;
        const studentId = req.user.id;

        const event = await Event.findById(id);
        if (!event) return res.status(404).json({ message: 'Event not found.' });

        if (event.organizers.includes(studentId)) {
            return res.status(400).json({ message: 'You are already an organizer for this event.' });
        }

        event.organizers.push(studentId);
        await event.save();

        res.json({ message: 'Successfully became an organizer for the event.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error.' });
    }
};

module.exports = {
    getAllEvents, getUpcomingEvents, getMyEvents, getAttendanceAnalytics,
    getEventById, getEventParticipants, createEvent, updateEvent, deleteEvent,
    getPublicEvents, becomeOrganizer
};
