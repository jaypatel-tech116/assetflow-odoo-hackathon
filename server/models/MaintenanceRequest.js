const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MaintenanceRequest = sequelize.define('MaintenanceRequest', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  request_id: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  asset_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'assets',
      key: 'id',
    },
  },
  issue: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  priority: {
    type: DataTypes.ENUM('Low', 'Medium', 'High'),
    allowNull: false,
    defaultValue: 'Medium',
  },
  status: {
    type: DataTypes.ENUM('Pending', 'Approved', 'In Progress', 'Resolved', 'Rejected'),
    allowNull: false,
    defaultValue: 'Pending',
  },
  requested_on: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'maintenance_requests',
  timestamps: true,
  underscored: true,
  hooks: {
    beforeCreate: async (request) => {
      if (!request.request_id) {
        const count = await MaintenanceRequest.count();
        request.request_id = `MR-${String(count + 1).padStart(4, '0')}`;
      }
    },
  },
});

module.exports = MaintenanceRequest;
