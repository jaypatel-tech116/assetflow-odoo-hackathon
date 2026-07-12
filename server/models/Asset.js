const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Asset = sequelize.define('Asset', {
<<<<<<< HEAD
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  asset_tag: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  category: {
    type: DataTypes.ENUM('Laptop', 'Accessory', 'Monitor', 'Phone', 'Tablet', 'Keyboard', 'Mouse', 'Other'),
    allowNull: false,
    defaultValue: 'Other',
  },
  status: {
    type: DataTypes.ENUM('Available', 'Allocated', 'Under Maintenance', 'Retired'),
    allowNull: false,
    defaultValue: 'Available',
  },
  assigned_to: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  assigned_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  return_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  serial_number: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
=======
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  tag: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
    comment: 'e.g. AF-0012',
  },
  name: { type: DataTypes.STRING(150), allowNull: false },
  category: {
    type: DataTypes.ENUM('Laptop', 'Monitor', 'Printer', 'Projector', 'Furniture', 'Electrical', 'Vehicle', 'Other'),
    allowNull: false,
    defaultValue: 'Other',
  },
  serial_number: { type: DataTypes.STRING(100), allowNull: true },
  status: {
    type: DataTypes.ENUM('Available', 'Allocated', 'Under Maintenance', 'Lost', 'Retired'),
    allowNull: false,
    defaultValue: 'Available',
  },
  department_id: { type: DataTypes.INTEGER, allowNull: true },
  assigned_to: { type: DataTypes.INTEGER, allowNull: true, comment: 'FK to users.id' },
  location: { type: DataTypes.STRING(200), allowNull: true },
  acquired_on: { type: DataTypes.DATEONLY, allowNull: true },
  description: { type: DataTypes.TEXT, allowNull: true },
>>>>>>> origin/prince
}, {
  tableName: 'assets',
  timestamps: true,
  underscored: true,
});

module.exports = Asset;
