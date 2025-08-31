const { Ticket } = require('../models');

exports.createTicket = async (req, res) => {
  try {
    const { subject, message } = req.body;
    const userId = req.user.id;

    if (!subject || !message) {
      return res.status(400).json({ message: req.t('tickets.subjectAndMessageRequired', 'Subject and message are required.') });
    }

    const ticket = await Ticket.create({
      user_id: userId,
      subject,
      message,
    });

    res.status(201).json({
      status: 'success',
      message: req.t('tickets.createSuccess'),
      data: {
        ticket,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: req.t('tickets.createFailed'),
      error: error.message,
    });
  }
};

exports.getUserTickets = async (req, res) => {
  try {
    const tickets = await Ticket.findAll({
      where: { user_id: req.user.id },
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({
      status: 'success',
      results: tickets.length,
      data: {
        tickets,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: req.t('tickets.fetchFailed'),
      error: error.message,
    });
  }
};
