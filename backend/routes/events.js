const express = require('express');
const router = express.Router();
const {
    getAllEvents, getUpcomingEvents, getMyEvents, getAttendanceAnalytics,
    getEventById, getEventParticipants, createEvent, updateEvent, deleteEvent,
    getPublicEvents, becomeOrganizer
} = require('../controllers/eventController');
const { authenticate, authorize } = require('../middleware/auth');

// IMPORTANT: Static routes MUST come before /:id
router.get('/public', getPublicEvents);
router.get('/', authenticate, getAllEvents);
router.get('/upcoming', authenticate, getUpcomingEvents);
router.get('/my', authenticate, authorize('coordinator', 'admin'), getMyEvents);
router.get('/analytics', authenticate, authorize('admin'), getAttendanceAnalytics);
router.post('/', authenticate, authorize('admin', 'coordinator'), createEvent);

// Parameterized routes after static ones
router.get('/:id', authenticate, getEventById);
router.get('/:id/participants', authenticate, authorize('coordinator', 'admin'), getEventParticipants);
router.post('/:id/organizers', authenticate, authorize('student'), becomeOrganizer);
router.put('/:id', authenticate, authorize('admin', 'coordinator'), updateEvent);
router.delete('/:id', authenticate, authorize('admin', 'coordinator'), deleteEvent);

module.exports = router;
