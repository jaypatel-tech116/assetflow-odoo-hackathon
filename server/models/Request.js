const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Request = sequelize.define('Request', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  request_id: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
    comment: 'Human-readable ID like TR-0007',
  },
  type: {
    type: DataTypes.ENUM('Transfer', 'Return', 'Maintenance', 'Booking', 'New Asset'),
    allowNull: false,
  },
  employee_id: { type: DataTypes.INTEGER, allowNull: false, comment: 'FK users.id' },
  asset_id: { type: DataTypes.INTEGER, allowNull: true, comment: 'FK assets.id' },
  resource_id: { type: DataTypes.INTEGER, allowNull: true, comment: 'FK resources.id' },
  reason: { type: DataTypes.STRING(255), allowNull: false },
  notes: { type: DataTypes.TEXT, allowNull: true },
  status: {
    type: DataTypes.ENUM('Pending', 'Approved', 'Rejected', 'Completed'),
    allowNull: false,
    defaultValue: 'Pending',
  },
  approved_by: { type: DataTypes.INTEGER, allowNull: true, comment: 'FK users.id' },
  approved_at: { type: DataTypes.DATE, allowNull: true },
  department_id: { type: DataTypes.INTEGER, allowNull: true },
}, {
  tableName: 'requests',
  timestamps: true,
  underscored: true,
});

module.exports = Request;
