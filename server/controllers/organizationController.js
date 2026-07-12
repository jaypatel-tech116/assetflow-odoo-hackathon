const { User, Department, AssetCategory, CustomField } = require('../models');

// --- Departments ---

exports.getDepartments = async (req, res, next) => {
  try {
    const departments = await Department.findAll({
      include: [
        { model: User, as: 'head', attributes: ['id', 'full_name', 'email'] },
        { model: Department, as: 'parent', attributes: ['id', 'name'] }
      ],
      order: [['name', 'ASC']],
    });
    res.json({ success: true, departments });
  } catch (error) {
    next(error);
  }
};

exports.createDepartment = async (req, res, next) => {
  try {
    const { name, parent_id, head_id, status } = req.body;
    const department = await Department.create({ name, parent_id: parent_id || null, head_id: head_id || null, status });
    
    // Fetch it again to get associations
    const newDepartment = await Department.findByPk(department.id, {
      include: [
        { model: User, as: 'head', attributes: ['id', 'full_name', 'email'] },
        { model: Department, as: 'parent', attributes: ['id', 'name'] }
      ]
    });
    
    res.status(201).json({ success: true, department: newDepartment });
  } catch (error) {
    next(error);
  }
};

exports.updateDepartment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, parent_id, head_id, status } = req.body;
    
    const department = await Department.findByPk(id);
    if (!department) return res.status(404).json({ success: false, message: 'Department not found' });
    
    await department.update({ name, parent_id: parent_id || null, head_id: head_id || null, status });
    
    const updatedDepartment = await Department.findByPk(department.id, {
      include: [
        { model: User, as: 'head', attributes: ['id', 'full_name', 'email'] },
        { model: Department, as: 'parent', attributes: ['id', 'name'] }
      ]
    });
    
    res.json({ success: true, department: updatedDepartment });
  } catch (error) {
    next(error);
  }
};

exports.deleteDepartment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const department = await Department.findByPk(id);
    if (!department) return res.status(404).json({ success: false, message: 'Department not found' });
    
    await department.destroy();
    res.json({ success: true, message: 'Department deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// --- Asset Categories ---

exports.getCategories = async (req, res, next) => {
  try {
    const categories = await AssetCategory.findAll({
      include: [
        { model: CustomField, as: 'custom_fields' }
      ],
      order: [['name', 'ASC']],
    });
    res.json({ success: true, categories });
  } catch (error) {
    next(error);
  }
};

exports.createCategory = async (req, res, next) => {
  try {
    const { name, description, custom_fields } = req.body;
    
    // Create Category
    const category = await AssetCategory.create({ name, description });
    
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
    
    res.status(201).json({ success: true, category: newCategory });
  } catch (error) {
    next(error);
  }
};

exports.updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, custom_fields } = req.body;
    
    const category = await AssetCategory.findByPk(id);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    
    await category.update({ name, description });
    
    // Simplest approach for custom fields: delete all existing and recreate
    // For a real prod app, you might want to diff and update to preserve asset data relations
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
    
    res.json({ success: true, category: updatedCategory });
  } catch (error) {
    next(error);
  }
};

exports.deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const category = await AssetCategory.findByPk(id);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    
    await category.destroy(); // Cascade will delete custom_fields
    res.json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// --- Employees ---

exports.getEmployees = async (req, res, next) => {
  try {
    const employees = await User.findAll({
      attributes: ['id', 'full_name', 'email', 'role', 'status', 'created_at'],
      include: [
        { model: Department, as: 'department', attributes: ['id', 'name'] }
      ],
      order: [['created_at', 'DESC']],
    });
    res.json({ success: true, employees });
  } catch (error) {
    next(error);
  }
};

exports.updateEmployeeRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    
    const employee = await User.findByPk(id);
    if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' });
    
    await employee.update({ role });
    
    const updatedEmployee = await User.findByPk(id, {
      attributes: ['id', 'full_name', 'email', 'role', 'status', 'created_at'],
      include: [{ model: Department, as: 'department', attributes: ['id', 'name'] }]
    });
    
    res.json({ success: true, employee: updatedEmployee });
  } catch (error) {
    next(error);
  }
};

exports.updateEmployeeStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const employee = await User.findByPk(id);
    if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' });
    
    await employee.update({ status });
    
    res.json({ success: true, employee: { id: employee.id, status: employee.status } });
  } catch (error) {
    next(error);
  }
};
