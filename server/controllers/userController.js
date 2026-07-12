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
