<<<<<<< HEAD
const bcrypt = require('bcryptjs');
const { User, Department } = require('../config/associations');
const { successResponse, errorResponse } = require('../utils/responseHelper');

/**
 * GET /api/users/me
 * Returns the authenticated user's full profile with department.
 */
const getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [{ model: Department, as: 'department' }],
    });
    if (!user) return errorResponse(res, 404, 'User not found');
    return successResponse(res, 200, { user });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

/**
 * PUT /api/users/me
 * Update own profile (full_name, phone, address, etc.)
 */
const updateMe = async (req, res) => {
  try {
    const { full_name, phone, alternate_phone, date_of_birth, gender, address, designation } = req.body;
    const user = await User.findByPk(req.user.id);
    if (!user) return errorResponse(res, 404, 'User not found');

    await user.update({
      full_name: full_name || user.full_name,
      phone: phone !== undefined ? phone : user.phone,
      alternate_phone: alternate_phone !== undefined ? alternate_phone : user.alternate_phone,
      date_of_birth: date_of_birth !== undefined ? date_of_birth : user.date_of_birth,
      gender: gender !== undefined ? gender : user.gender,
      address: address !== undefined ? address : user.address,
      designation: designation !== undefined ? designation : user.designation,
    });

    const updated = await User.findByPk(req.user.id, {
      include: [{ model: Department, as: 'department' }],
    });
    return successResponse(res, 200, { message: 'Profile updated successfully', user: updated });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

/**
 * PUT /api/users/me/password
 * Change own password.
 */
const changePassword = async (req, res) => {
  try {
    const { current_password, new_password, confirm_password } = req.body;

    if (!current_password || !new_password || !confirm_password) {
      return errorResponse(res, 400, 'All password fields are required');
    }
    if (new_password !== confirm_password) {
      return errorResponse(res, 400, 'New passwords do not match');
    }
    if (new_password.length < 8) {
      return errorResponse(res, 400, 'New password must be at least 8 characters');
    }

    const user = await User.scope('withPassword').findByPk(req.user.id);
    if (!user) return errorResponse(res, 404, 'User not found');

    const isMatch = await bcrypt.compare(current_password, user.password_hash);
    if (!isMatch) return errorResponse(res, 401, 'Current password is incorrect');

    const salt = await bcrypt.genSalt(12);
    const password_hash = await bcrypt.hash(new_password, salt);
    await user.update({ password_hash });

    return successResponse(res, 200, { message: 'Password changed successfully' });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

module.exports = { getMe, updateMe, changePassword };
=======
const { User, Department } = require('../models');
const { successResponse, errorResponse } = require('../utils/responseHelper');
const logActivity = require('../utils/activityLogger');
const createNotification = require('../utils/notifier');

const getAllUsers = async (req, res, next) => {
  try {
    const { department_id, role, status, search } = req.query;
    const where = {};
    if (department_id) where.department_id = department_id;
    if (role) where.role = role;
    if (status) where.status = status;
    if (search) {
      const { Op } = require('sequelize');
      where[Op.or] = [
        { full_name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
      ];
    }
    const users = await User.findAll({
      where,
      include: [{ model: Department, as: 'department', attributes: ['id', 'name'] }],
      order: [['full_name', 'ASC']],
    });
    return successResponse(res, 200, { users });
  } catch (err) { next(err); }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id, {
      include: [{ model: Department, as: 'department', attributes: ['id', 'name'] }],
    });
    if (!user) return errorResponse(res, 404, 'User not found');
    return successResponse(res, 200, { user });
  } catch (err) { next(err); }
};

const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const validRoles = ['Employee', 'Department Head', 'Asset Manager', 'Admin'];
    if (!role || !validRoles.includes(role)) {
      return errorResponse(res, 400, `Role must be one of: ${validRoles.join(', ')}`);
    }
    const user = await User.scope('withPassword').findByPk(req.params.id);
    if (!user) return errorResponse(res, 404, 'User not found');
    const oldRole = user.role;
    await user.update({ role });
    await logActivity(req.user.id, 'Updated User Role', 'Organization', `${user.full_name}: ${oldRole} → ${role}`);
    await createNotification(user.id, 'RoleChanged', `Your role has been updated to ${role}`, 'User', user.id);
    return successResponse(res, 200, { message: 'Role updated successfully', user: user.toSafeObject() });
  } catch (err) { next(err); }
};

const updateUserStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!status || !['Active', 'Inactive'].includes(status)) {
      return errorResponse(res, 400, 'Status must be Active or Inactive');
    }
    const user = await User.scope('withPassword').findByPk(req.params.id);
    if (!user) return errorResponse(res, 404, 'User not found');
    await user.update({ status });
    await logActivity(req.user.id, 'Updated User Status', 'Organization', `${user.full_name}: ${status}`);
    return successResponse(res, 200, { message: 'Status updated successfully', user: user.toSafeObject() });
  } catch (err) { next(err); }
};

const updateUserDepartment = async (req, res, next) => {
  try {
    const { department_id } = req.body;
    const user = await User.scope('withPassword').findByPk(req.params.id);
    if (!user) return errorResponse(res, 404, 'User not found');
    if (department_id) {
      const dept = await Department.findByPk(department_id);
      if (!dept) return errorResponse(res, 404, 'Department not found');
    }
    await user.update({ department_id: department_id || null });
    await logActivity(req.user.id, 'Updated User Department', 'Organization', `${user.full_name}`);
    return successResponse(res, 200, { message: 'Department updated successfully', user: user.toSafeObject() });
  } catch (err) { next(err); }
};

module.exports = { getAllUsers, getUserById, updateUserRole, updateUserStatus, updateUserDepartment };
>>>>>>> origin/jay
