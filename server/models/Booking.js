const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Booking = sequelize.define('Booking', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  booking_id: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
    comment: 'Human-readable ID like BK-0001',
  },
  resource_id: { type: DataTypes.INTEGER, allowNull: false, comment: 'FK resources.id' },
  user_id: { type: DataTypes.INTEGER, allowNull: false, comment: 'FK users.id' },
  booking_date: { type: DataTypes.DATEONLY, allowNull: false },
  start_time: { type: DataTypes.TIME, allowNull: false },
  end_time: { type: DataTypes.TIME, allowNull: false },
  purpose: { type: DataTypes.STRING(255), allowNull: false },
  status: {
    type: DataTypes.ENUM('Upcoming', 'Completed', 'Cancelled'),
    allowNull: false,
    defaultValue: 'Upcoming',
  },
  notes: { type: DataTypes.TEXT, allowNull: true },
}, {
  tableName: 'bookings',
  timestamps: true,
  underscored: true,
});

module.exports = Booking;
