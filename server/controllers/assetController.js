const { Op } = require('sequelize');
<<<<<<< HEAD
<<<<<<< HEAD
const Asset = require('../models/Asset');
const { successResponse, errorResponse } = require('../utils/responseHelper');

/**
 * @desc    Get all assets assigned to the logged-in employee
 * @route   GET /api/employee/assets
 * @access  Private (Employee)
 */
const getMyAssets = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { search, category, page = 1, limit = 10 } = req.query;

    const where = { assigned_to: userId, status: 'Allocated' };

    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { asset_tag: { [Op.like]: `%${search}%` } },
=======
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
>>>>>>> origin/prince
        { serial_number: { [Op.like]: `%${search}%` } },
      ];
    }

<<<<<<< HEAD
    if (category) {
      where.category = category;
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows } = await Asset.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order: [['assigned_date', 'DESC']],
=======
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
>>>>>>> origin/prince
    });

    return successResponse(res, 200, {
      assets: rows,
<<<<<<< HEAD
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / parseInt(limit)),
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getMyAssets };
=======
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
=======
const { Asset, AssetCategory, Department, User, Allocation, MaintenanceRequest } = require('../models');
const { successResponse, errorResponse } = require('../utils/responseHelper');
const logActivity = require('../utils/activityLogger');

const createAsset = async (req, res, next) => {
  try {
    const { name, category_id, serial_number, acquisition_date, acquisition_cost, condition, location, department_id, is_shared_bookable, capacity, building_location, facilities } = req.body;
    if (!name || !category_id) return errorResponse(res, 400, 'Name and category are required');
    const category = await AssetCategory.findByPk(category_id);
    if (!category) return errorResponse(res, 404, 'Category not found');
    const photo_url = req.file ? `/uploads/${req.file.filename}` : null;
    const asset = await Asset.create({
      name: name.trim(),
      category_id,
      serial_number: serial_number || null,
      acquisition_date: acquisition_date || null,
      acquisition_cost: acquisition_cost || null,
      condition: condition || 'New',
      location: location || null,
      department_id: department_id || null,
      photo_url,
      is_shared_bookable: is_shared_bookable === 'true' || is_shared_bookable === true,
      capacity: capacity || null,
      building_location: building_location || null,
      facilities: facilities ? (typeof facilities === 'string' ? JSON.parse(facilities) : facilities) : null,
      status: 'Available',
      created_by: req.user.id,
    });
    await logActivity(req.user.id, 'Registered New Asset', 'Assets', `${asset.asset_tag} - ${asset.name}`);
    return successResponse(res, 201, { message: 'Asset registered successfully', asset });
  } catch (err) { next(err); }
};

const getAllAssets = async (req, res, next) => {
  try {
    const { category_id, status, department_id, location, search, is_shared_bookable, page = 1, limit = 20 } = req.query;
    const where = {};
    if (category_id) where.category_id = category_id;
    if (status) where.status = status;
    if (department_id) where.department_id = department_id;
    if (location) where.location = { [Op.like]: `%${location}%` };
    if (is_shared_bookable !== undefined) where.is_shared_bookable = is_shared_bookable === 'true';
    if (search) {
      where[Op.or] = [
        { asset_tag: { [Op.like]: `%${search}%` } },
        { name: { [Op.like]: `%${search}%` } },
        { serial_number: { [Op.like]: `%${search}%` } },
      ];
    }
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { count, rows: assets } = await Asset.findAndCountAll({
      where,
      include: [
        { model: AssetCategory, as: 'category', attributes: ['id', 'name'] },
        { model: Department, as: 'department', attributes: ['id', 'name'] },
        { model: User, as: 'creator', attributes: ['id', 'full_name'] },
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset,
    });
    return successResponse(res, 200, {
      assets,
      pagination: { total: count, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(count / parseInt(limit)) },
    });
  } catch (err) { next(err); }
};

const getAssetById = async (req, res, next) => {
  try {
    const asset = await Asset.findByPk(req.params.id, {
      include: [
        { model: AssetCategory, as: 'category' },
        { model: Department, as: 'department' },
        { model: User, as: 'creator', attributes: ['id', 'full_name'] },
>>>>>>> origin/jay
      ],
    });
    if (!asset) return errorResponse(res, 404, 'Asset not found');
    return successResponse(res, 200, { asset });
<<<<<<< HEAD
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
>>>>>>> origin/prince
=======
  } catch (err) { next(err); }
};

const updateAsset = async (req, res, next) => {
  try {
    const asset = await Asset.findByPk(req.params.id);
    if (!asset) return errorResponse(res, 404, 'Asset not found');
    const updates = { ...req.body };
    if (req.file) updates.photo_url = `/uploads/${req.file.filename}`;
    if (updates.is_shared_bookable !== undefined) updates.is_shared_bookable = updates.is_shared_bookable === 'true' || updates.is_shared_bookable === true;
    if (updates.facilities && typeof updates.facilities === 'string') updates.facilities = JSON.parse(updates.facilities);
    delete updates.asset_tag;
    delete updates.created_by;
    await asset.update(updates);
    await logActivity(req.user.id, 'Updated Asset', 'Assets', `${asset.asset_tag} - ${asset.name}`);
    return successResponse(res, 200, { message: 'Asset updated successfully', asset });
  } catch (err) { next(err); }
};

const getAssetHistory = async (req, res, next) => {
  try {
    const asset = await Asset.findByPk(req.params.id);
    if (!asset) return errorResponse(res, 404, 'Asset not found');
    const allocations = await Allocation.findAll({
      where: { asset_id: asset.id },
      include: [
        { model: User, as: 'employee', attributes: ['id', 'full_name'] },
        { model: Department, as: 'department', attributes: ['id', 'name'] },
        { model: User, as: 'allocator', attributes: ['id', 'full_name'] },
      ],
      order: [['allocated_on', 'DESC']],
    });
    const maintenanceHistory = await MaintenanceRequest.findAll({
      where: { asset_id: asset.id },
      include: [
        { model: User, as: 'raisedByUser', attributes: ['id', 'full_name'] },
        { model: User, as: 'technician', attributes: ['id', 'full_name'] },
      ],
      order: [['raised_on', 'DESC']],
    });
    return successResponse(res, 200, { allocations, maintenanceHistory });
  } catch (err) { next(err); }
};

module.exports = { createAsset, getAllAssets, getAssetById, updateAsset, getAssetHistory };
>>>>>>> origin/jay
