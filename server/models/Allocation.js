const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Allocation = sequelize.define('Allocation', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  asset_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  employee_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  department_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  allocated_on: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  expected_return_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  returned_on: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  condition_on_return: {
    type: DataTypes.ENUM('New', 'Good', 'Fair', 'Poor'),
    allowNull: true,
  },
  condition_check_in_notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('Active', 'Returned', 'Overdue'),
    allowNull: false,
    defaultValue: 'Active',
  },
  allocated_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'allocations',
  timestamps: true,
  underscored: true,
});

module.exports = Allocation;
