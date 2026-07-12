const { Op } = require('sequelize');
const { Asset, User, Department } = require('../config/associations');
const { successResponse, errorResponse } = require('../utils/responseHelper');

/**
 * GET /api/assets
 * List assets with filters: status, category, search, department, pagination
 */
const listAssets = async (req, res) => {
  try {
    const { search, status, category, department_id, page = 1, limit = 20 } = req.query;
    const user = await User.findByPk(req.user.id);

    const where = {};

    // Dept-scoped for non-admins
    if (req.user.role !== 'Admin' && req.user.role !== 'Asset Manager') {
      if (user?.department_id) where.department_id = user.department_id;
    } else if (department_id) {
      where.department_id = Number(department_id);
    }

    if (status) where.status = status;
    if (category) where.category = category;
    if (search) {
      where[Op.or] = [
        { tag: { [Op.like]: `%${search}%` } },
        { name: { [Op.like]: `%${search}%` } },
        { serial_number: { [Op.like]: `%${search}%` } },
      ];
    }

    const offset = (Number(page) - 1) * Number(limit);

    const { count, rows } = await Asset.findAndCountAll({
      where,
      include: [
        { model: User, as: 'assignedUser', attributes: ['id', 'full_name', 'role'] },
        { model: Department, as: 'department', attributes: ['id', 'name'] },
      ],
      order: [['created_at', 'DESC']],
      limit: Number(limit),
      offset,
    });

    return successResponse(res, 200, {
      assets: rows,
      total: count,
      page: Number(page),
      pages: Math.ceil(count / Number(limit)),
    });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

/**
 * GET /api/assets/:id
 */
const getAsset = async (req, res) => {
  try {
    const asset = await Asset.findByPk(req.params.id, {
      include: [
        { model: User, as: 'assignedUser', attributes: ['id', 'full_name', 'role'] },
        { model: Department, as: 'department', attributes: ['id', 'name'] },
      ],
    });
    if (!asset) return errorResponse(res, 404, 'Asset not found');
    return successResponse(res, 200, { asset });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

/**
 * POST /api/assets
 * Create new asset (Admin / Asset Manager only)
 */
const createAsset = async (req, res) => {
  try {
    const { tag, name, category, serial_number, status, department_id, assigned_to, location, acquired_on, description } = req.body;
    if (!tag || !name || !category) {
      return errorResponse(res, 400, 'tag, name, and category are required');
    }
    const existing = await Asset.findOne({ where: { tag } });
    if (existing) return errorResponse(res, 409, `Asset tag ${tag} already exists`);

    const asset = await Asset.create({ tag, name, category, serial_number, status, department_id, assigned_to, location, acquired_on, description });
    return successResponse(res, 201, { message: 'Asset created', asset });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

/**
 * PUT /api/assets/:id
 */
const updateAsset = async (req, res) => {
  try {
    const asset = await Asset.findByPk(req.params.id);
    if (!asset) return errorResponse(res, 404, 'Asset not found');
    await asset.update(req.body);
    return successResponse(res, 200, { message: 'Asset updated', asset });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

/**
 * DELETE /api/assets/:id
 */
const deleteAsset = async (req, res) => {
  try {
    const asset = await Asset.findByPk(req.params.id);
    if (!asset) return errorResponse(res, 404, 'Asset not found');
    await asset.destroy();
    return successResponse(res, 200, { message: 'Asset deleted' });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

module.exports = { listAssets, getAsset, createAsset, updateAsset, deleteAsset };
