const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Resource = sequelize.define('Resource', {
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
}, {
  tableName: 'resources',
  timestamps: true,
  underscored: true,
});

module.exports = Resource;
