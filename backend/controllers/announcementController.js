const Announcement = require('../models/Announcement');

// POST /api/announcements - Admin only
const createAnnouncement = async (req, res) => {
    try {
        const { title, message, events } = req.body;
        if (!title || !message) return res.status(400).json({ message: 'Title and message are required.' });

        const announcement = await Announcement.create({
            title,
            message,
            created_by: req.user.id,
            events: Array.isArray(events) ? events : []
        });
        await announcement.populate('created_by', 'name');
        await announcement.populate('events', 'title date venue');
        res.status(201).json(announcement);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error.' });
    }
};

// GET /api/announcements - All authenticated users
const getAnnouncements = async (req, res) => {
    try {
        const announcements = await Announcement.find()
            .populate('created_by', 'name')
            .populate('events', 'title date venue')
            .sort({ createdAt: -1 });
        res.json(announcements);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error.' });
    }
};

// DELETE /api/announcements/:id - Admin only
const deleteAnnouncement = async (req, res) => {
    try {
        await Announcement.findByIdAndDelete(req.params.id);
        res.json({ message: 'Announcement deleted.' });
    } catch (err) {
        res.status(500).json({ message: 'Server error.' });
    }
};

module.exports = { createAnnouncement, getAnnouncements, deleteAnnouncement };
