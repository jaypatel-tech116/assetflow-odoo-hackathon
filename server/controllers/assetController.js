const { Op } = require('sequelize');
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
      ],
    });
    if (!asset) return errorResponse(res, 404, 'Asset not found');
    return successResponse(res, 200, { asset });
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
