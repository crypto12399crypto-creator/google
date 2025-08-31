const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const { User } = require('../models');

exports.protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: req.t('errors.notLoggedIn') });
    }

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    const currentUser = await User.findByPk(decoded.id);
    if (!currentUser) {
      return res.status(401).json({ message: req.t('errors.userNotFoundForToken') });
    }

    req.user = currentUser;
    next();
  } catch (error) {
    res.status(401).json({ message: req.t('errors.invalidToken') });
  }
};

exports.isAdmin = (req, res, next) => {
  if (req.user && req.user.is_admin) {
    next();
  } else {
    res.status(403).json({ message: req.t('errors.noPermission') });
  }
};
