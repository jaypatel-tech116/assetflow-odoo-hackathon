const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/responseHelper');

/**
 * @desc    Get logged-in user's profile
 * @route   GET /api/employee/profile
 * @access  Private (Employee)
 */
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return errorResponse(res, 404, 'User not found');
    }
    return successResponse(res, 200, { user });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update profile info
 * @route   PUT /api/employee/profile
 * @access  Private (Employee)
 */
const updateProfile = async (req, res, next) => {
  try {
    const { full_name, phone, department } = req.body;

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return errorResponse(res, 404, 'User not found');
    }

    if (full_name) user.full_name = full_name.trim();
    if (phone !== undefined) user.phone = phone;
    if (department !== undefined) user.department = department;

    await user.save();

    return successResponse(res, 200, {
      message: 'Profile updated successfully',
      user,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Change password
 * @route   PUT /api/employee/profile/password
 * @access  Private (Employee)
 */
const changePassword = async (req, res, next) => {
  try {
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
      return errorResponse(res, 400, 'Current password and new password are required');
    }

    if (new_password.length < 8) {
      return errorResponse(res, 400, 'New password must be at least 8 characters');
    }

    const user = await User.scope('withPassword').findByPk(req.user.id);
    if (!user) {
      return errorResponse(res, 404, 'User not found');
    }

    const isMatch = await bcrypt.compare(current_password, user.password_hash);
    if (!isMatch) {
      return errorResponse(res, 401, 'Current password is incorrect');
    }

    const salt = await bcrypt.genSalt(12);
    user.password_hash = await bcrypt.hash(new_password, salt);
    await user.save();

    return successResponse(res, 200, { message: 'Password changed successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getProfile, updateProfile, changePassword };
