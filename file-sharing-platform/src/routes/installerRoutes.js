const express = require('express');
const installerController = require('../controllers/installerController');

const router = express.Router();

// Step 1: Mail Configuration
router.get('/step1', installerController.showStep1);
router.post('/step1', installerController.processStep1);

// Step 2: Admin User Creation
router.get('/step2', installerController.showStep2);
router.post('/step2', installerController.processStep2);

// Step 3: Finish
router.get('/finish', installerController.showFinish);

module.exports = router;
