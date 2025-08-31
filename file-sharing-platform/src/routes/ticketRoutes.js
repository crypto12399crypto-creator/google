const express = require('express');
const ticketController = require('../controllers/ticketController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Protect all routes in this file, as tickets are user-specific.
router.use(authMiddleware.protect);

router.route('/')
  .post(ticketController.createTicket)
  .get(ticketController.getUserTickets);

// A potential future route could be to get a single ticket with its conversation history
// router.get('/:id', ticketController.getTicketById);

module.exports = router;
