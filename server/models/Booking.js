const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Booking = sequelize.define('Booking', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  resource_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'resources',
      key: 'id',
    },
  },
  booking_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  start_time: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  end_time: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  purpose: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('Upcoming', 'Completed', 'Cancelled'),
    allowNull: false,
    defaultValue: 'Upcoming',
  },
}, {
  tableName: 'bookings',
  timestamps: true,
  underscored: true,
});

module.exports = Booking;
