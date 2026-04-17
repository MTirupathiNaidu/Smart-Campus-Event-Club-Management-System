const Club = require('../models/Club');

// GET /api/clubs
const getAllClubs = async (req, res) => {
    try {
        const clubs = await Club.find()
            .populate('coordinator', 'name email')
            .sort({ createdAt: -1 });
        res.json(clubs);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error.' });
    }
};

// GET /api/clubs/:id
const getClubById = async (req, res) => {
    try {
        const club = await Club.findById(req.params.id).populate('coordinator', 'name email');
        if (!club) return res.status(404).json({ message: 'Club not found.' });
        res.json(club);
    } catch (err) {
        res.status(500).json({ message: 'Server error.' });
    }
};

// POST /api/clubs - Admin only
const createClub = async (req, res) => {
    try {
        const { name, description, coordinator_id } = req.body;
        if (!name) return res.status(400).json({ message: 'Club name is required.' });

        const club = await Club.create({
            name,
            description: description || '',
            coordinator: coordinator_id || null
        });
        await club.populate('coordinator', 'name email');
        res.status(201).json({ message: 'Club created.', club });
    } catch (err) {
        console.error(err);
        if (err.code === 11000) return res.status(409).json({ message: 'A club with this name already exists.' });
        res.status(500).json({ message: 'Server error.' });
    }
};

// PUT /api/clubs/:id - Admin only
const updateClub = async (req, res) => {
    try {
        const { name, description, coordinator_id } = req.body;
        
        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (description !== undefined) updateData.description = description;
        if (coordinator_id !== undefined) updateData.coordinator = coordinator_id || null;

        const club = await Club.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        ).populate('coordinator', 'name email');
        if (!club) return res.status(404).json({ message: 'Club not found.' });
        res.json({ message: 'Club updated.', club });
    } catch (err) {
        res.status(500).json({ message: 'Server error.' });
    }
};

// DELETE /api/clubs/:id - Admin only
const deleteClub = async (req, res) => {
    try {
        const club = await Club.findByIdAndDelete(req.params.id);
        if (!club) return res.status(404).json({ message: 'Club not found.' });
        res.json({ message: 'Club deleted.' });
    } catch (err) {
        res.status(500).json({ message: 'Server error.' });
    }
};

module.exports = { getAllClubs, getClubById, createClub, updateClub, deleteClub };
