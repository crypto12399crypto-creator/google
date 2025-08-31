const express = require('express');
const installerController = require('../controllers/installerController');

const router = express.Router();

// The installer now has only one main step: creating the admin account.
router.get('/step', installerController.showStep2);
router.post('/step', installerController.processStep2);

// The final "finish" page.
router.get('/finish', installerController.showFinish);

module.exports = router;
