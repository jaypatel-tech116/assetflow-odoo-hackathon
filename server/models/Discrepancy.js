const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Discrepancy = sequelize.define('Discrepancy', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  audit_cycle_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  asset_tag: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  asset_name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  category_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  location: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('Verified', 'Missing', 'Damaged'),
    allowNull: false,
  },
  auditor_notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  auditor_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  reported_on: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'discrepancies',
  timestamps: true,
  underscored: true,
});

module.exports = Discrepancy;
