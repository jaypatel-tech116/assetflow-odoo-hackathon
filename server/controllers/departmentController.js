const { Department, User } = require('../models');
const { successResponse, errorResponse } = require('../utils/responseHelper');
const logActivity = require('../utils/activityLogger');
const createNotification = require('../utils/notifier');

const createDepartment = async (req, res, next) => {
  try {
    const { name, department_head_id, parent_department_id, status } = req.body;
    if (!name || !name.trim()) {
      return errorResponse(res, 400, 'Department name is required');
    }
    const department = await Department.create({
      name: name.trim(),
      department_head_id: department_head_id || null,
      parent_department_id: parent_department_id || null,
      status: status || 'Active',
    });
    await logActivity(req.user.id, 'Created Department', 'Organization', `Department: ${name}`);
    return successResponse(res, 201, { message: 'Department created successfully', department });
  } catch (err) {
    next(err);
  }
};

const getAllDepartments = async (req, res, next) => {
  try {
    const departments = await Department.findAll({
      include: [
        { model: User, as: 'head', attributes: ['id', 'full_name', 'email'] },
        { model: Department, as: 'parent', attributes: ['id', 'name'] },
      ],
      order: [['name', 'ASC']],
    });
    return successResponse(res, 200, { departments });
  } catch (err) {
    next(err);
  }
};

const getDepartmentById = async (req, res, next) => {
  try {
    const department = await Department.findByPk(req.params.id, {
      include: [
        { model: User, as: 'head', attributes: ['id', 'full_name', 'email'] },
        { model: Department, as: 'parent', attributes: ['id', 'name'] },
        { model: Department, as: 'children', attributes: ['id', 'name', 'status'] },
        { model: User, as: 'members', attributes: ['id', 'full_name', 'email', 'role', 'status'] },
      ],
    });
    if (!department) return errorResponse(res, 404, 'Department not found');
    return successResponse(res, 200, { department });
  } catch (err) {
    next(err);
  }
};

const updateDepartment = async (req, res, next) => {
  try {
    const department = await Department.findByPk(req.params.id);
    if (!department) return errorResponse(res, 404, 'Department not found');
    const { name, department_head_id, parent_department_id, status } = req.body;
    await department.update({
      name: name !== undefined ? name.trim() : department.name,
      department_head_id: department_head_id !== undefined ? department_head_id : department.department_head_id,
      parent_department_id: parent_department_id !== undefined ? parent_department_id : department.parent_department_id,
      status: status !== undefined ? status : department.status,
    });
    await logActivity(req.user.id, 'Updated Department', 'Organization', `Department: ${department.name}`);
    return successResponse(res, 200, { message: 'Department updated successfully', department });
  } catch (err) {
    next(err);
  }
};

module.exports = { createDepartment, getAllDepartments, getDepartmentById, updateDepartment };
