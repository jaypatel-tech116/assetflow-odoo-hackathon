const { AssetCategory, CustomField } = require('../models');
const { successResponse, errorResponse } = require('../utils/responseHelper');
const logActivity = require('../utils/activityLogger');

const createCategory = async (req, res, next) => {
  try {
    const { name, description, custom_fields } = req.body;
    if (!name || !name.trim()) return errorResponse(res, 400, 'Category name is required');
    const category = await AssetCategory.create({
      name: name.trim(),
      description: description || null,
    });
    
    // Create Custom Fields if any
    if (custom_fields && custom_fields.length > 0) {
      const fieldsToCreate = custom_fields.map(cf => ({
        ...cf,
        category_id: category.id
      }));
      await CustomField.bulkCreate(fieldsToCreate);
    }
    
    const newCategory = await AssetCategory.findByPk(category.id, {
      include: [{ model: CustomField, as: 'custom_fields' }]
    });

    await logActivity(req.user.id, 'Created Asset Category', 'Organization', `Category: ${name}`);
    return successResponse(res, 201, { message: 'Category created successfully', category: newCategory });
  } catch (err) { next(err); }
};

const getAllCategories = async (req, res, next) => {
  try {
    const categories = await AssetCategory.findAll({ 
      include: [{ model: CustomField, as: 'custom_fields' }],
      order: [['name', 'ASC']] 
    });
    return successResponse(res, 200, { categories });
  } catch (err) { next(err); }
};

const getCategoryById = async (req, res, next) => {
  try {
    const category = await AssetCategory.findByPk(req.params.id, {
      include: [{ model: CustomField, as: 'custom_fields' }]
    });
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
    });

    if (custom_fields) {
      await CustomField.destroy({ where: { category_id: category.id } });
      const fieldsToCreate = custom_fields.map(cf => ({
        ...cf,
        category_id: category.id
      }));
      await CustomField.bulkCreate(fieldsToCreate);
    }

    const updatedCategory = await AssetCategory.findByPk(category.id, {
      include: [{ model: CustomField, as: 'custom_fields' }]
    });

    await logActivity(req.user.id, 'Updated Asset Category', 'Organization', `Category: ${updatedCategory.name}`);
    return successResponse(res, 200, { message: 'Category updated successfully', category: updatedCategory });
  } catch (err) { next(err); }
};

module.exports = { createCategory, getAllCategories, getCategoryById, updateCategory };
