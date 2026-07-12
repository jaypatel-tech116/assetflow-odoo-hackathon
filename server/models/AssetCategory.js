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
<<<<<<< HEAD
    unique: { msg: 'A category with this name already exists' },
=======
>>>>>>> origin/kashyap
    validate: {
      notEmpty: { msg: 'Category name is required' },
    },
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
<<<<<<< HEAD
  custom_fields: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: null,
  },
=======
  asset_count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  }
>>>>>>> origin/kashyap
}, {
  tableName: 'asset_categories',
  timestamps: true,
  underscored: true,
});

module.exports = AssetCategory;
