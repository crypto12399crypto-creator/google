const { Plan } = require('../models');

exports.getAllPlans = async (req, res) => {
  try {
    const plans = await Plan.findAll({
      order: [['price_usd', 'ASC']],
    });

    res.status(200).json({
      status: 'success',
      results: plans.length,
      data: {
        plans,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch plans.',
      error: error.message,
    });
  }
};
