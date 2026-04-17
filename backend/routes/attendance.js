const express = require('express');
const router = express.Router();
const { markAttendance, getEventAttendance, getMyAttendance } = require('../controllers/attendanceController');
const { authenticate, authorize } = require('../middleware/auth');

router.post('/scan', authenticate, authorize('student'), markAttendance);
router.get('/event/:id', authenticate, authorize('coordinator', 'admin'), getEventAttendance);
router.get('/my', authenticate, authorize('student'), getMyAttendance);

module.exports = router;
