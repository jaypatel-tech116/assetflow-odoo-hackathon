const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DiscrepancyReport = sequelize.define('DiscrepancyReport', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  audit_cycle_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  asset_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  issue: {
    type: DataTypes.ENUM('Missing', 'Damaged'),
    allowNull: false,
  },
  expected_location: {
    type: DataTypes.STRING(200),
    allowNull: true,
  },
  verified_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  generated_on: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'discrepancy_reports',
  timestamps: true,
  underscored: true,
});

module.exports = DiscrepancyReport;
