const express = require('express');
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Protect all routes in this file, as they pertain to the logged-in user.
router.use(authMiddleware.protect);

router.get('/dashboard', userController.getDashboardData);

// Future routes for user profile management could be added here, for example:
// router.patch('/profile', userController.updateProfile);
// router.patch('/change-password', authController.changePassword);

module.exports = router;
