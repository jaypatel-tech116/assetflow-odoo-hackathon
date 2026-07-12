const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AssetCategory = sequelize.define('AssetCategory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: { msg: 'A category with this name already exists' },
    validate: {
      notEmpty: { msg: 'Category name is required' },
    },
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },

}, {
  tableName: 'asset_categories',
  timestamps: true,
  underscored: true,
});

module.exports = AssetCategory;
