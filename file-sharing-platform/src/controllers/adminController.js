const { CryptoPaymentRequest, User, Plan, File, Ticket, sequelize } = require('../models');
const fs = require('fs');

// --- New Stats Method ---
exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.count();
    const totalFiles = await File.count();
    const totalStorageUsed = await File.sum('file_size');
    const pendingPayments = await CryptoPaymentRequest.count({ where: { status: 'pending' } });

    res.status(200).json({
      status: 'success',
      data: {
        stats: {
          totalUsers,
          totalFiles,
          totalStorageUsed: totalStorageUsed || 0,
          pendingPayments,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Failed to fetch dashboard stats.', error: error.message });
  }
};


// --- Payment Management ---
exports.getAllPendingPayments = async (req, res) => {
  try {
    const pendingPayments = await CryptoPaymentRequest.findAll({ where: { status: 'pending' }, include: [{ model: User, as: 'user' }, { model: Plan, as: 'plan' }], order: [['createdAt', 'ASC']] });
    res.status(200).json({ status: 'success', results: pendingPayments.length, data: { pendingPayments } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Failed to fetch pending payments.', error: error.message });
  }
};
exports.approvePayment = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { paymentRequestId } = req.params;
    const paymentRequest = await CryptoPaymentRequest.findByPk(paymentRequestId, { transaction: t });
    if (!paymentRequest || paymentRequest.status !== 'pending') {
      await t.rollback();
      return res.status(404).json({ message: req.t('admin.paymentNotFound', 'Pending payment request not found or already processed.') });
    }
    const user = await User.findByPk(paymentRequest.user_id, { transaction: t });
    const plan = await Plan.findByPk(paymentRequest.plan_id, { transaction: t });
    if (!user || !plan) {
      await t.rollback();
      return res.status(404).json({ message: req.t('admin.userOrPlanNotFound', 'User or Plan associated with this request not found.') });
    }
    paymentRequest.status = 'confirmed';
    if(req.body.admin_notes) {
        paymentRequest.admin_notes = req.body.admin_notes;
    }
    await paymentRequest.save({ transaction: t });
    const currentEndDate = user.subscription_end_date > new Date() ? user.subscription_end_date : new Date();
    const newEndDate = new Date(currentEndDate);
    newEndDate.setMonth(newEndDate.getMonth() + plan.duration_months);
    user.subscription_plan_id = plan.id;
    user.subscription_end_date = newEndDate;
    user.total_storage = plan.storage_limit;
    await user.save({ transaction: t });
    await t.commit();
    res.status(200).json({ status: 'success', message: req.t('admin.paymentApproved', { user: user.username, plan: plan.name }, `Payment approved. User ${user.username}'s subscription to ${plan.name} has been activated.`) });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ status: 'error', message: req.t('admin.paymentApprovalFailed', 'Failed to approve payment.'), error: error.message });
  }
};

// --- File Management ---
exports.getAllFiles = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const offset = (page - 1) * limit;
    const { count, rows } = await File.findAndCountAll({ limit, offset, include: [{ model: User, as: 'owner' }], order: [['createdAt', 'DESC']] });
    res.status(200).json({ status: 'success', totalFiles: count, totalPages: Math.ceil(count / limit), currentPage: page, data: { files: rows } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Failed to fetch files.', error: error.message });
  }
};
exports.deleteAnyFile = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const file = await File.findByPk(req.params.id, { transaction: t });
    if (!file) {
      await t.rollback();
      return res.status(404).json({ message: req.t('files.notFound') });
    }
    const fileSize = file.file_size;
    const userId = file.user_id;
    fs.unlink(file.stored_path, async (err) => {
      if (err) console.error("Could not delete physical file, but proceeding with DB record deletion:", err);
    });
    await User.decrement('used_storage', { by: fileSize, where: { id: userId }, transaction: t });
    await file.destroy({ transaction: t });
    await t.commit();
    res.status(204).json({ status: 'success', data: null });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ status: 'error', message: req.t('files.deleteFailed'), error: error.message });
  }
};

// --- Ticket Management ---
exports.getAllTickets = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const offset = (page - 1) * limit;
    let where = {};
    if (req.query.status) {
        where.status = req.query.status;
    }
    const { count, rows } = await Ticket.findAndCountAll({ where, limit, offset, include: [{ model: User, as: 'user' }], order: [['updatedAt', 'DESC']] });
    res.status(200).json({ status: 'success', totalTickets: count, totalPages: Math.ceil(count / limit), currentPage: page, data: { tickets: rows } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Failed to fetch tickets.', error: error.message });
  }
};
exports.updateTicketStatus = async (req, res) => {
    try {
        const { ticketId } = req.params;
        const { status } = req.body;
        if (!status || !['open', 'in_progress', 'closed'].includes(status)) {
            return res.status(400).json({ message: req.t('tickets.invalidStatus') });
        }
        const ticket = await Ticket.findByPk(ticketId);
        if (!ticket) {
            return res.status(404).json({ message: req.t('tickets.notFound') });
        }
        ticket.status = status;
        await ticket.save();
        res.status(200).json({ status: 'success', message: req.t('tickets.updateSuccess', { status }), data: { ticket } });
    } catch (error) {
        res.status(500).json({ status: 'error', message: req.t('tickets.updateFailed'), error: error.message });
    }
};
