const express = require('express');
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Protect all routes in this file and ensure the user is an admin
router.use(authMiddleware.protect, authMiddleware.isAdmin);

// --- Dashboard Stats ---
router.get('/stats', adminController.getDashboardStats);

// --- Payment Management ---
router.get('/payments/pending', adminController.getAllPendingPayments);
router.patch('/payments/approve/:paymentRequestId', adminController.approvePayment);

// --- File Management ---
router.get('/files', adminController.getAllFiles);
router.delete('/files/:id', adminController.deleteAnyFile);

// --- Ticket Management ---
router.get('/tickets', adminController.getAllTickets);
router.patch('/tickets/:ticketId', adminController.updateTicketStatus);

module.exports = router;
