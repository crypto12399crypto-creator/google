const express = require('express');
const planController = require('../controllers/planController');

const router = express.Router();

// Anyone, including non-logged-in users, should be able to see the plans.
router.route('/').get(planController.getAllPlans);

module.exports = router;
