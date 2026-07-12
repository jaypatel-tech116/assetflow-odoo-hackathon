const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Asset = sequelize.define('Asset', {
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
}, {
  tableName: 'assets',
  timestamps: true,
  underscored: true,
});

module.exports = Asset;
