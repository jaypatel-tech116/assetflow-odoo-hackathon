const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ActivityLog = sequelize.define('ActivityLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  role: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  action: {
    type: DataTypes.STRING(50), // Created, Updated, Deleted/Deactivated, Approved, Requested, Allocated/Booked
    allowNull: false,
  },
  module: {
    type: DataTypes.STRING(50), // Department, Employee, Maintenance, Asset Allocation, Resource Booking, Asset Category
    allowNull: false,
  },
  details: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
}, {
  tableName: 'activity_logs',
  timestamps: true,
  createdAt: 'timestamp',
  updatedAt: false,
  underscored: true,
});

module.exports = ActivityLog;
