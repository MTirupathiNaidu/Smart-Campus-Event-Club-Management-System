const express = require('express');
const router = express.Router();
const { registerForEvent, cancelRegistration, getMyRegistrations, getAllRegistrations } = require('../controllers/registrationController');
const { authenticate, authorize } = require('../middleware/auth');

router.post('/register', authenticate, authorize('student'), registerForEvent);
router.post('/cancel', authenticate, authorize('student'), cancelRegistration);
router.get('/my', authenticate, authorize('student'), getMyRegistrations);
router.get('/all', authenticate, authorize('admin'), getAllRegistrations);

module.exports = router;
