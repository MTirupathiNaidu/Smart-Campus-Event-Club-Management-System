const express = require('express');
const router = express.Router();
const { createAnnouncement, getAnnouncements, deleteAnnouncement } = require('../controllers/announcementController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, getAnnouncements);
router.post('/', authenticate, authorize('admin'), createAnnouncement);
router.delete('/:id', authenticate, authorize('admin'), deleteAnnouncement);

module.exports = router;
