const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Department = sequelize.define('Department', {
<<<<<<< HEAD
<<<<<<< HEAD
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(100), allowNull: false },
  code: { type: DataTypes.STRING(20), allowNull: true },
  location: { type: DataTypes.STRING(150), allowNull: true },
  head_id: { type: DataTypes.INTEGER, allowNull: true },
=======
=======
>>>>>>> origin/kashyap
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
<<<<<<< HEAD
    unique: { msg: 'A department with this name already exists' },
=======
>>>>>>> origin/kashyap
    validate: {
      notEmpty: { msg: 'Department name is required' },
    },
  },
<<<<<<< HEAD
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
=======
>>>>>>> origin/kashyap
  status: {
    type: DataTypes.ENUM('Active', 'Inactive'),
    allowNull: false,
    defaultValue: 'Active',
  },
<<<<<<< HEAD
>>>>>>> origin/jay
=======
  parent_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  head_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  employee_count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  }
>>>>>>> origin/kashyap
}, {
  tableName: 'departments',
  timestamps: true,
  underscored: true,
});

module.exports = Department;
