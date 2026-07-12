const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Department = sequelize.define('Department', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: { msg: 'A department with this name already exists' },
    validate: {
      notEmpty: { msg: 'Department name is required' },
    },
  },
  department_head_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: null,
  },
  parent_department_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: null,
  },
  status: {
    type: DataTypes.ENUM('Active', 'Inactive'),
    allowNull: false,
    defaultValue: 'Active',
  },
}, {
  tableName: 'departments',
  timestamps: true,
  underscored: true,
});

module.exports = Department;
