const User = require('../models/User');
const { isCommonPassword } = require('../data/commonPasswords');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { validationResult } = require('express-validator');
const { OAuth2Client } = require('google-auth-library');
const { sendPasswordResetEmail } = require('../services/emailService');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Generate JWT
const generateToken = (id, tokenVersion = 0) => {
  return jwt.sign({ id, tokenVersion }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { name, email, password, preferences } = req.body;

    if (!password || typeof password !== 'string' || password.length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 10 characters',
      });
    }

    if (isCommonPassword(password)) {
      return res.status(400).json({
        success: false,
        message: 'This password is too common. Choose a stronger one.',
      });
    }

    if (!email || typeof email !== 'string' || !email.trim() || email.length > 254) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if user exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email',
      });
    }

    // Create user
    const user = await User.create({
      name,
      email: normalizedEmail,
      password,
      preferences: preferences || {
        dietaryRestrictions: [],
        allergies: [],
        healthGoals: [],
      },
    });

    // Generate token
    const token = generateToken(user._id, user.tokenVersion || 0);

    // Return user data (excluding password)
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      preferences: user.preferences,
      createdAt: user.createdAt,
    };

    res.status(201).json({
      success: true,
      token,
      user: userData,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { email, password } = req.body;

    if (!email || typeof email !== 'string' || !email.trim() || email.length > 254) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email',
      });
    }

    if (!password || typeof password !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Password is required',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if user exists
    const user = await User.findOne({ email: normalizedEmail }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Generate token
    const token = generateToken(user._id, user.tokenVersion || 0);

    // Return user data (excluding password)
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      preferences: user.preferences,
    };

    res.status(200).json({
      success: true,
      token,
      user: userData,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Sign in or sign up using a Google ID token
// @route   POST /api/auth/google
// @access  Public
exports.googleAuth = async (req, res, next) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        success: false,
        message: 'No Google credential provided',
      });
    }

    if (!process.env.GOOGLE_CLIENT_ID) {
      return res.status(500).json({
        success: false,
        message: 'Google sign-in is not configured on the server (missing GOOGLE_CLIENT_ID).',
      });
    }

    let payload;
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } catch (verifyError) {
      console.error('Google token verification failed:', verifyError.message);
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired Google sign-in. Please try again.',
      });
    }

    if (!payload?.email_verified) {
      return res.status(401).json({
        success: false,
        message: 'Your Google email is not verified.',
      });
    }

    const googleId = typeof payload.sub === 'string' ? payload.sub.trim() : null;
    const googleEmail = typeof payload.email === 'string' && payload.email.length <= 254 ? payload.email.trim().toLowerCase() : null;

    if (!googleId || !googleEmail) {
      return res.status(401).json({
        success: false,
        message: 'Invalid Google profile payload.',
      });
    }

    // Look up by googleId first, then fall back to email — this lets
    // someone who already registered with email/password link their
    // existing account the first time they use "Sign in with Google"
    // with the same email address, instead of creating a duplicate.
    let user = await User.findOne({ googleId }).select('+googleId');

    if (!user) {
      user = await User.findOne({ email: googleEmail });
      if (user) {
        user.googleId = googleId;
        await user.save();
      }
    }

    if (!user) {
      user = await User.create({
        name: payload.name || googleEmail.split('@')[0],
        email: googleEmail,
        googleId,
        preferences: {
          dietaryRestrictions: [],
          allergies: [],
          healthGoals: [],
          medications: [],
        },
      });
    }

    const token = generateToken(user._id, user.tokenVersion || 0);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        preferences: user.preferences,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Request a password reset email
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email || typeof email !== 'string' || !email.trim() || email.length > 254) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    // Always return the same generic response whether or not the email
    // exists — this prevents someone from using this endpoint to figure
    // out which email addresses have accounts on your app.
    const genericResponse = {
      success: true,
      message: 'If an account exists with that email, a password reset link has been sent.',
    };

    if (!user) {
      return res.status(200).json(genericResponse);
    }

    // Google-only accounts have no password to reset
    if (user.googleId && !user.password) {
      return res.status(200).json(genericResponse);
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${rawToken}`;

    try {
      await sendPasswordResetEmail(user.email, resetUrl);
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError.message);
      // Roll back the token so a broken email service doesn't leave a
      // dangling, unusable reset token on the account
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
      return res.status(500).json({
        success: false,
        message: 'Could not send reset email right now. Please try again later.',
      });
    }

    res.status(200).json(genericResponse);
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password using the token from the emailed link
// @route   POST /api/auth/reset-password/:token
// @access  Public
exports.resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!token || typeof token !== 'string' || token.length > 254) {
      return res.status(400).json({
        success: false,
        message: 'Invalid reset token',
      });
    }

    if (!password || typeof password !== 'string' || password.length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 10 characters',
      });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    }).select('+resetPasswordToken +resetPasswordExpire');

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'This reset link is invalid or has expired. Please request a new one.',
      });
    }

    user.password = password; // pre-save hook hashes this automatically
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    // Log them straight in after a successful reset
    const authToken = generateToken(user._id, user.tokenVersion || 0);

    res.status(200).json({
      success: true,
      message: 'Password reset successfully.',
      token: authToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        preferences: user.preferences,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        preferences: user.preferences,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user preferences
// @route   PUT /api/auth/preferences
// @access  Private
exports.updatePreferences = async (req, res, next) => {
  try {
    const { dietaryRestrictions, allergies, healthGoals, medications } = req.body;

    // Load existing preferences first so a partial update (e.g. from a
    // page that doesn't know about "medications" yet) never wipes out
    // fields the caller didn't send.
    const existingUser = await User.findById(req.user.id);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        preferences: {
          dietaryRestrictions: dietaryRestrictions ?? existingUser.preferences?.dietaryRestrictions ?? [],
          allergies: allergies ?? existingUser.preferences?.allergies ?? [],
          healthGoals: healthGoals ?? existingUser.preferences?.healthGoals ?? [],
          medications: medications ?? existingUser.preferences?.medications ?? [],
        },
      },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        preferences: user.preferences,
      },
    });
  } catch (error) {
    next(error);
  }
};
// @desc    Invalidate all JWTs for this user (increment tokenVersion)
// @route   POST /api/auth/logout-all
// @access  Private
exports.logoutAll = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }
    user.tokenVersion = (user.tokenVersion || 0) + 1;
    await user.save();
    res.status(200).json({
      success: true,
      message: 'All sessions revoked. Please sign in again.',
    });
  } catch (error) {
    next(error);
  }
};
