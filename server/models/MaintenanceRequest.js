const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MaintenanceRequest = sequelize.define('MaintenanceRequest', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
<<<<<<< HEAD
  request_id: {
=======
  request_code: {
>>>>>>> origin/jay
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
  },
<<<<<<< HEAD
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
=======
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
>>>>>>> origin/jay
  },
  priority: {
    type: DataTypes.ENUM('Low', 'Medium', 'High'),
    allowNull: false,
    defaultValue: 'Medium',
  },
<<<<<<< HEAD
  status: {
    type: DataTypes.ENUM('Pending', 'Approved', 'In Progress', 'Resolved', 'Rejected'),
    allowNull: false,
    defaultValue: 'Pending',
  },
  requested_on: {
=======
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
>>>>>>> origin/jay
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'maintenance_requests',
  timestamps: true,
  underscored: true,
  hooks: {
<<<<<<< HEAD
    beforeCreate: async (request) => {
      if (!request.request_id) {
        const count = await MaintenanceRequest.count();
        request.request_id = `MR-${String(count + 1).padStart(4, '0')}`;
=======
    beforeValidate: async (mr) => {
      if (!mr.request_code) {
        const last = await MaintenanceRequest.findOne({
          order: [['id', 'DESC']],
          paranoid: false,
        });
        const nextNum = last ? last.id + 1 : 1;
        mr.request_code = `MR-${String(nextNum).padStart(4, '0')}`;
>>>>>>> origin/jay
      }
    },
  },
});

module.exports = MaintenanceRequest;
