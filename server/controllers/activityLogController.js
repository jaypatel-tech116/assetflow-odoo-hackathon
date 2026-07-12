const { Op } = require('sequelize');
const { ActivityLog, User } = require('../models');
const { successResponse } = require('../utils/responseHelper');

const getActivityLogs = async (req, res, next) => {
  try {
    const { module, action, search, start_date, end_date, page = 1, limit = 20 } = req.query;
    const where = {};
    if (module) where.module = module;
    if (action) where.action = { [Op.like]: `%${action}%` };
    if (search) {
      where[Op.or] = [
        { action: { [Op.like]: `%${search}%` } },
        { details: { [Op.like]: `%${search}%` } },
      ];
    }
    if (start_date || end_date) {
      where.timestamp = {};
      if (start_date) where.timestamp[Op.gte] = new Date(start_date);
      if (end_date) where.timestamp[Op.lte] = new Date(end_date + 'T23:59:59');
    }
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { count, rows } = await ActivityLog.findAndCountAll({
      where,
      include: [{ model: User, as: 'user', attributes: ['id', 'full_name', 'email', 'role'] }],
      order: [['timestamp', 'DESC']],
      limit: parseInt(limit), offset,
    });
    return successResponse(res, 200, {
      logs: rows,
      pagination: { total: count, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(count / parseInt(limit)) },
    });
  } catch (err) { next(err); }
};

const getActivityLogModules = async (req, res, next) => {
  try {
    return successResponse(res, 200, {
      modules: ['Assets', 'Allocations', 'Resources', 'Maintenance', 'Audit', 'Organization', 'Auth'],
    });
  } catch (err) { next(err); }
};

module.exports = { getActivityLogs, getActivityLogModules };
