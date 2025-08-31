const { User } = require('../models');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const mailService = require('../services/mailService');
const { Op } = require('sequelize');

const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, req, res) => {
  const token = signToken(user.id);
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    message: req.t('auth.loginSuccess', 'Login successful.'),
    token,
    data: { user },
  });
};

exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: req.t('auth.provideAllFields', 'Please provide username, email, and password.') });
    }

    const existingUser = await User.findOne({ where: { [Op.or]: [{ email }, { username }] } });
    if (existingUser) {
      return res.status(400).json({ message: req.t('auth.userExists') });
    }

    // Since email verification is disabled, we don't need to generate or send a token.
    // We will set the user as verified by default.
    const newUser = await User.create({
      username, email, password,
      email_verified: true,
    });

    // The user can now log in immediately.
    createSendToken(newUser, 201, req, res);

  } catch (error) {
    res.status(500).json({ message: 'Server error during registration.', error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: req.t('auth.provideEmailPassword') });
    }

    const user = await User.findOne({ where: { email } });
    if (!user || !(await user.validPassword(password))) {
      return res.status(401).json({ message: req.t('auth.incorrectCredentials') });
    }

    // Email verification check is now removed.

    createSendToken(user, 200, req, res);
  } catch (error) {
    res.status(500).json({ message: 'Server error during login.', error: error.message });
  }
};

// ... (The rest of the file can be simplified as email/password reset is not needed)

// Since email verification is disabled, this function is no longer needed.
exports.verifyEmail = async (req, res) => {
    res.status(404).json({ message: 'This feature is disabled.' });
};

// Since mail server is disabled, this function is no longer needed.
exports.forgotPassword = async (req, res) => {
    res.status(404).json({ message: 'This feature is disabled.' });
};

exports.resetPassword = async (req, res) => {
    res.status(404).json({ message: 'This feature is disabled.' });
};

exports.getMe = (req, res) => {
    res.status(200).json({
        status: 'success',
        data: { user: req.user }
    });
};
