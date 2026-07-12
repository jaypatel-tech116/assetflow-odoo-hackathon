const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MaintenanceRequest = sequelize.define('MaintenanceRequest', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  request_code: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
  },
  asset_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  raised_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  issue_description: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Issue description is required' },
    },
  },
  priority: {
    type: DataTypes.ENUM('Low', 'Medium', 'High'),
    allowNull: false,
    defaultValue: 'Medium',
  },
  photo_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('Pending', 'Approved', 'Rejected', 'Technician Assigned', 'In Progress', 'Resolved', 'Closed'),
    allowNull: false,
    defaultValue: 'Pending',
  },
  rejection_reason: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  approved_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  technician_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  started_on: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  eta: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  resolved_on: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  raised_on: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'maintenance_requests',
  timestamps: true,
  underscored: true,
  hooks: {
    beforeValidate: async (mr) => {
      if (!mr.request_code) {
        const last = await MaintenanceRequest.findOne({
          order: [['id', 'DESC']],
          paranoid: false,
        });
        const nextNum = last ? last.id + 1 : 1;
        mr.request_code = `MR-${String(nextNum).padStart(4, '0')}`;
      }
    },
  },
});

module.exports = MaintenanceRequest;
