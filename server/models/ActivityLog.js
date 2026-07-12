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
<<<<<<< HEAD
    allowNull: false,
  },
  action: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  module: {
    type: DataTypes.ENUM('Assets', 'Allocations', 'Resources', 'Maintenance', 'Audit', 'Organization', 'Auth'),
    allowNull: false,
  },
  details: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  timestamp: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
=======
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
>>>>>>> origin/kashyap
  },
}, {
  tableName: 'activity_logs',
  timestamps: true,
<<<<<<< HEAD
=======
  createdAt: 'timestamp',
  updatedAt: false,
>>>>>>> origin/kashyap
  underscored: true,
});

module.exports = ActivityLog;
