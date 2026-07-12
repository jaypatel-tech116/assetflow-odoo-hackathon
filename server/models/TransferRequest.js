const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TransferRequest = sequelize.define('TransferRequest', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  asset_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  requested_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  current_holder_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  requested_to_employee_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  requested_to_department_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('Requested', 'Approved', 'Rejected', 'Re-allocated'),
    allowNull: false,
    defaultValue: 'Requested',
  },
  approved_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  requested_on: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  resolved_on: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
}, {
  tableName: 'transfer_requests',
  timestamps: true,
  underscored: true,
});

module.exports = TransferRequest;
