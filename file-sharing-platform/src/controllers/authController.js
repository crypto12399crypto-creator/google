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

    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    const newUser = await User.create({
      username, email, password,
      email_verification_token: crypto.createHash('sha256').update(emailVerificationToken).digest('hex'),
    });

    const verificationURL = `${req.protocol}://${req.get('host')}/api/v1/auth/verify-email/${emailVerificationToken}`;
    const message = `Welcome! To finish signing up, please verify your email by clicking here: ${verificationURL}`;

    try {
      await mailService.sendMail({ to: newUser.email, subject: 'Verify Your Email Address', text: message });
      res.status(201).json({ status: 'success', message: req.t('auth.registrationSuccess') });
    } catch (err) {
      console.error('EMAIL SENDING ERROR:', err);
      res.status(201).json({ status: 'success_email_failed', message: req.t('auth.registrationEmailFailed') });
    }
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

    if (!user.email_verified) {
        return res.status(401).json({ message: req.t('auth.verifyEmailPrompt') });
    }

    createSendToken(user, 200, req, res);
  } catch (error) {
    res.status(500).json({ message: 'Server error during login.', error: error.message });
  }
};

exports.verifyEmail = async (req, res) => {
    try {
        const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
        const user = await User.findOne({ where: { email_verification_token: hashedToken } });

        if (!user) {
            // Token is invalid, redirect to login with an error message
            return res.redirect('/login.html?error=verification_failed');
        }

        user.email_verified = true;
        user.email_verification_token = null;
        await user.save({ validate: false });

        // Redirect to the new, well-designed success page
        res.redirect('/email-verified.html');
    } catch (error) {
        console.error("Verification Error:", error);
        res.redirect('/login.html?error=verification_failed');
    }
};

exports.forgotPassword = async (req, res) => {
    try {
        const user = await User.findOne({ where: { email: req.body.email } });
        if (user) {
            const resetToken = crypto.randomBytes(32).toString('hex');
            user.password_reset_token = crypto.createHash('sha256').update(resetToken).digest('hex');
            user.password_reset_expires = Date.now() + 10 * 60 * 1000; // 10 minutes
            await user.save({ validate: false });

            const resetURL = `${req.protocol}://${req.get('host')}/reset-password.html?token=${resetToken}`;
            const message = `Forgot your password? Click here to reset it: ${resetURL}\nThis link is valid for 10 minutes.`;

            await mailService.sendMail({ to: user.email, subject: 'Your Password Reset Token', text: message });
        }
        res.status(200).json({ status: 'success', message: req.t('auth.passwordResetSent') });
    } catch (error) {
        console.error('FORGOT PASSWORD ERROR:', error);
        res.status(500).json({ message: 'There was an error sending the password reset email.' });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const hashedToken = crypto.createHash('sha256').update(req.body.token).digest('hex');
        const user = await User.findOne({
            where: { password_reset_token: hashedToken, password_reset_expires: { [Op.gt]: Date.now() } }
        });

        if (!user) {
            return res.status(400).json({ message: req.t('auth.tokenInvalidOrExpired') });
        }

        user.password = req.body.password;
        user.password_reset_token = null;
        user.password_reset_expires = null;
        await user.save();

        res.status(200).json({ status: 'success', message: 'Password has been reset successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Server error during password reset.', error: error.message });
    }
};

exports.getMe = (req, res) => {
    res.status(200).json({
        status: 'success',
        data: { user: req.user }
    });
};
