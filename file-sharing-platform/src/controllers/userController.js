const { User, File, Plan } = require('../models');

exports.getDashboardData = async (req, res) => {
  try {
    // The user object is attached to the request by our `protect` middleware.
    // We can use its ID to fetch the full, related data for the dashboard.
    const user = await User.findByPk(req.user.id, {
      attributes: {
        // Exclude sensitive fields from the query itself
        exclude: ['password', 'password_reset_token', 'password_reset_expires', 'email_verification_token']
      },
      include: [
        {
          model: Plan,
          as: 'plan' // Get the user's current subscription plan
        },
        {
          model: File,
          as: 'files',
          attributes: ['id', 'original_name', 'file_size', 'createdAt', 'link_token', 'download_count'],
          limit: 10, // Include the 10 most recent files for a dashboard preview
          order: [['createdAt', 'DESC']]
        }
      ]
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json({
      status: 'success',
      data: {
        dashboard: user,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch dashboard data.',
      error: error.message,
    });
  }
};
