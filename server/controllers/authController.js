const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const { successResponse, errorResponse } = require("../utils/responseHelper");
const logActivity = require("../utils/activityLogger");

/**
 * @desc    Register a new user (always as Employee)
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    const { full_name, email, password, confirm_password } = req.body;

    // --- Server-side validation ---

    // Required fields
    if (!full_name || !email || !password || !confirm_password) {
      return errorResponse(
        res,
        400,
        "All fields are required: full_name, email, password, confirm_password",
      );
    }

    // Full name length
    if (full_name.trim().length < 2) {
      return errorResponse(res, 400, "Full name must be at least 2 characters");
    }

    // Valid email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return errorResponse(res, 400, "Please enter a valid email address");
    }

    // Password strength: min 8 chars, uppercase, number, special char
    if (password.length < 8) {
      return errorResponse(
        res,
        400,
        "Password must be at least 8 characters long",
      );
    }
    if (!/[A-Z]/.test(password)) {
      return errorResponse(
        res,
        400,
        "Password must contain at least one uppercase letter",
      );
    }
    if (!/[0-9]/.test(password)) {
      return errorResponse(
        res,
        400,
        "Password must contain at least one number",
      );
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      return errorResponse(
        res,
        400,
        "Password must contain at least one special character",
      );
    }

    // Password match
    if (password !== confirm_password) {
      return errorResponse(res, 400, "Passwords do not match");
    }

    // Check email uniqueness
    const existingUser = await User.scope("withPassword").findOne({
      where: { email: email.toLowerCase() },
    });
    if (existingUser) {
      return errorResponse(
        res,
        409,
        "An account with this email already exists",
      );
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const password_hash = await bcrypt.hash(password, salt);

    // Create user — role is ALWAYS 'Employee', ignore any role from client
    const user = await User.create({
      full_name: full_name.trim(),
      email: email.toLowerCase().trim(),
      password_hash,
      role: "Employee", // Hardcoded — never from client
    });

    // Return sanitized user (no password_hash due to default scope)
    const safeUser = user.toSafeObject();

    await logActivity(user.id, 'Account Registered', 'Auth', `New employee account: ${user.email}`);

    return successResponse(res, 201, {
      message: "Account created successfully",
      user: safeUser,
    });
  } catch (err) {
    console.error("ERROR:", err);
    console.error("MESSAGE:", err.message);

    if (err.parent) {
      console.error("MYSQL:", err.parent.sqlMessage);
      console.error("CODE:", err.parent.code);
    }

    return res.status(500).json(err);
  }
};

/**
 * @desc    Log in user and return JWT
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Required fields
    if (!email || !password) {
      return errorResponse(res, 400, "Email and password are required");
    }

    // Find user WITH password_hash for comparison
    const user = await User.scope("withPassword").findOne({
      where: { email: email.toLowerCase().trim() },
    });

    // Generic error — don't reveal if email or password was wrong
    if (!user) {
      return errorResponse(res, 401, "Invalid email or password");
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return errorResponse(res, 401, "Invalid email or password");
    }

    // Check if account is active
    if (user.status === "Inactive") {
      return errorResponse(
        res,
        403,
        "Account is inactive. Please contact your administrator.",
      );
    }

    // Generate JWT
    const token = generateToken(user);

    // Return token and sanitized user
    return successResponse(res, 200, {
      message: "Login successful",
      token,
      user: user.toSafeObject(),
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get current authenticated user
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [{
        model: require('../models/Department'),
        as: 'department',
        attributes: ['id', 'name'],
      }],
    });
    if (!user) {
      return errorResponse(res, 404, 'User not found');
    }
    return successResponse(res, 200, { user });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Request password reset
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return errorResponse(res, 400, 'Email is required');

    const user = await User.scope('withPassword').findOne({
      where: { email: email.toLowerCase().trim() },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return successResponse(res, 200, { message: 'If an account exists, a reset link has been sent' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await user.update({
      reset_token: resetToken,
      reset_token_expires: resetExpires,
    });

    // In production, send email here. For now, return token in response for demo.
    return successResponse(res, 200, {
      message: 'If an account exists, a reset link has been sent',
      // DEV ONLY — remove in production
      resetToken,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Reset password using token
 * @route   POST /api/auth/reset-password
 * @access  Public
 */
const resetPassword = async (req, res, next) => {
  try {
    const { token, password, confirm_password } = req.body;
    if (!token || !password || !confirm_password) {
      return errorResponse(res, 400, 'Token, password, and confirm_password are required');
    }
    if (password !== confirm_password) {
      return errorResponse(res, 400, 'Passwords do not match');
    }
    if (password.length < 8) {
      return errorResponse(res, 400, 'Password must be at least 8 characters');
    }

    const user = await User.scope('withPassword').findOne({
      where: {
        reset_token: token,
        reset_token_expires: { [require('sequelize').Op.gt]: new Date() },
      },
    });

    if (!user) {
      return errorResponse(res, 400, 'Invalid or expired reset token');
    }

    const salt = await bcrypt.genSalt(12);
    const password_hash = await bcrypt.hash(password, salt);

    await user.update({
      password_hash,
      reset_token: null,
      reset_token_expires: null,
    });

    return successResponse(res, 200, { message: 'Password reset successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, getMe, forgotPassword, resetPassword };
