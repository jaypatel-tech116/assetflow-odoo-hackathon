const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Department = sequelize.define('Department', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(100), allowNull: false },
  code: { type: DataTypes.STRING(20), allowNull: true },
  location: { type: DataTypes.STRING(150), allowNull: true },
  head_id: { type: DataTypes.INTEGER, allowNull: true },
}, {
  tableName: 'departments',
  timestamps: true,
  underscored: true,
});

module.exports = Department;
