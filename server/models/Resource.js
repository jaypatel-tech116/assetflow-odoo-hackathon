const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Resource = sequelize.define('Resource', {
<<<<<<< HEAD
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM('Meeting Room', 'Conference Hall', 'Company Car', 'Equipment'),
    allowNull: false,
  },
  location: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  floor: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  availability_status: {
    type: DataTypes.ENUM('Available', 'Unavailable'),
    allowNull: false,
    defaultValue: 'Available',
  },
=======
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(150), allowNull: false },
  type: {
    type: DataTypes.ENUM('Meeting Room', 'Conference Hall', 'Projector', 'Vehicle', 'Other Equipment'),
    allowNull: false,
    defaultValue: 'Other Equipment',
  },
  capacity: { type: DataTypes.STRING(50), allowNull: true, comment: 'e.g. 8 People, 4 Seater' },
  location: { type: DataTypes.STRING(200), allowNull: true },
  status: {
    type: DataTypes.ENUM('Available', 'Booked', 'Under Maintenance'),
    allowNull: false,
    defaultValue: 'Available',
  },
  description: { type: DataTypes.TEXT, allowNull: true },
>>>>>>> origin/prince
}, {
  tableName: 'resources',
  timestamps: true,
  underscored: true,
});

module.exports = Resource;
