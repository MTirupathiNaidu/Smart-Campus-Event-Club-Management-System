const express = require('express');
const router = express.Router();
const { getAllUsers, getPendingCoordinators, approveCoordinator, rejectCoordinator, deleteUser, getDashboardStats } = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, authorize('admin'), getAllUsers);
router.get('/stats', authenticate, authorize('admin'), getDashboardStats);
router.get('/coordinators/pending', authenticate, authorize('admin'), getPendingCoordinators);
router.put('/:id/approve', authenticate, authorize('admin'), approveCoordinator);
router.put('/:id/reject', authenticate, authorize('admin'), rejectCoordinator);
router.delete('/:id', authenticate, authorize('admin'), deleteUser);

module.exports = router;
