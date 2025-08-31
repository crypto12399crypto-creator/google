const express = require('express');
const paymentController = require('../controllers/paymentController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// All payment routes should be protected
router.use(authMiddleware.protect);

router.post('/request', paymentController.requestPayment);

// Future routes like GET /history could be added here
// router.get('/history', paymentController.getPaymentHistory);

module.exports = router;
