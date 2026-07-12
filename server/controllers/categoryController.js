const { AssetCategory } = require('../models');
const { successResponse, errorResponse } = require('../utils/responseHelper');
const logActivity = require('../utils/activityLogger');

const createCategory = async (req, res, next) => {
  try {
    const { name, description, custom_fields } = req.body;
    if (!name || !name.trim()) return errorResponse(res, 400, 'Category name is required');
    const category = await AssetCategory.create({
      name: name.trim(),
      description: description || null,
      custom_fields: custom_fields || null,
    });
    await logActivity(req.user.id, 'Created Asset Category', 'Organization', `Category: ${name}`);
    return successResponse(res, 201, { message: 'Category created successfully', category });
  } catch (err) { next(err); }
};

const getAllCategories = async (req, res, next) => {
  try {
    const categories = await AssetCategory.findAll({ order: [['name', 'ASC']] });
    return successResponse(res, 200, { categories });
  } catch (err) { next(err); }
};

const getCategoryById = async (req, res, next) => {
  try {
    const category = await AssetCategory.findByPk(req.params.id);
    if (!category) return errorResponse(res, 404, 'Category not found');
    return successResponse(res, 200, { category });
  } catch (err) { next(err); }
};

const updateCategory = async (req, res, next) => {
  try {
    const category = await AssetCategory.findByPk(req.params.id);
    if (!category) return errorResponse(res, 404, 'Category not found');
    const { name, description, custom_fields } = req.body;
    await category.update({
      name: name !== undefined ? name.trim() : category.name,
      description: description !== undefined ? description : category.description,
      custom_fields: custom_fields !== undefined ? custom_fields : category.custom_fields,
    });
    await logActivity(req.user.id, 'Updated Asset Category', 'Organization', `Category: ${category.name}`);
    return successResponse(res, 200, { message: 'Category updated successfully', category });
  } catch (err) { next(err); }
};

module.exports = { createCategory, getAllCategories, getCategoryById, updateCategory };
