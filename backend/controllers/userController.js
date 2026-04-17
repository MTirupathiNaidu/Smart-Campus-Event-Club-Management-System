const User = require('../models/User');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const Club = require('../models/Club');

// GET /api/users - Admin only
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error.' });
    }
};

// GET /api/users/coordinators/pending - Admin
const getPendingCoordinators = async (req, res) => {
    try {
        const pending = await User.find({ role: 'pending' }).select('-password').sort({ createdAt: -1 });
        res.json(pending);
    } catch (err) {
        res.status(500).json({ message: 'Server error.' });
    }
};

// PUT /api/users/:id/approve - Admin
const approveCoordinator = async (req, res) => {
    try {
        const user = await User.findOneAndUpdate(
            { _id: req.params.id, role: 'pending' },
            { role: 'coordinator' },
            { new: true }
        );
        if (!user) return res.status(404).json({ message: 'Pending coordinator not found.' });
        res.json({ message: 'Coordinator approved successfully.' });
    } catch (err) {
        res.status(500).json({ message: 'Server error.' });
    }
};

// PUT /api/users/:id/reject - Admin
const rejectCoordinator = async (req, res) => {
    try {
        const user = await User.findOneAndUpdate(
            { _id: req.params.id, role: 'pending' },
            { role: 'student' },
            { new: true }
        );
        if (!user) return res.status(404).json({ message: 'Pending coordinator not found.' });
        res.json({ message: 'Coordinator rejected (moved to student role).' });
    } catch (err) {
        res.status(500).json({ message: 'Server error.' });
    }
};

// DELETE /api/users/:id - Admin
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        if (id === req.user.id.toString())
            return res.status(400).json({ message: 'Cannot delete your own account.' });
        const deleted = await User.findByIdAndDelete(id);
        if (!deleted) return res.status(404).json({ message: 'User not found.' });
        res.json({ message: 'User deleted.' });
    } catch (err) {
        if (err.name === 'CastError')
            return res.status(400).json({ message: 'Invalid user ID.' });
        res.status(500).json({ message: 'Server error.' });
    }
};

// GET /api/users/stats - Admin: dashboard stats
const getDashboardStats = async (req, res) => {
    try {
        const [totalStudents, totalEvents, totalRegistrations, totalClubs, upcomingEvents] = await Promise.all([
            User.countDocuments({ role: 'student' }),
            Event.countDocuments(),
            Registration.countDocuments(),
            Club.countDocuments(),
            Event.find({ date: { $gte: new Date() } })
                .populate('club', 'name')
                .sort({ date: 1 })
                .limit(5)
                .lean()
        ]);

        // Attach registration counts to upcoming events
        const upcomingWithCounts = await Promise.all(
            upcomingEvents.map(async (ev) => {
                const registrations = await Registration.countDocuments({ event: ev._id });
                return { ...ev, registrations };
            })
        );

        res.json({
            totalStudents,
            totalEvents,
            totalRegistrations,
            totalClubs,
            upcomingEvents: upcomingWithCounts
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error.' });
    }
};

module.exports = { getAllUsers, getPendingCoordinators, approveCoordinator, rejectCoordinator, deleteUser, getDashboardStats };
