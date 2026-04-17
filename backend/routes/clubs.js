const express = require('express');
const router = express.Router();
const { getAllClubs, getClubById, createClub, updateClub, deleteClub } = require('../controllers/clubController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, getAllClubs);
router.get('/:id', authenticate, getClubById);
router.post('/', authenticate, authorize('admin'), createClub);
router.put('/:id', authenticate, authorize('admin'), updateClub);
router.delete('/:id', authenticate, authorize('admin'), deleteClub);

module.exports = router;
