const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ResourceBooking = sequelize.define('ResourceBooking', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  resource_asset_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  booked_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  department_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  start_time: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  end_time: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  purpose: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('Upcoming', 'Ongoing', 'Completed', 'Cancelled'),
    allowNull: false,
    defaultValue: 'Upcoming',
  },
}, {
  tableName: 'resource_bookings',
  timestamps: true,
  underscored: true,
});

module.exports = ResourceBooking;
