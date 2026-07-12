const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CustomField = sequelize.define('CustomField', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  field_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Field name is required' },
    },
  },
  field_type: {
    type: DataTypes.ENUM('Text', 'Number', 'Date', 'Boolean', 'Select'),
    allowNull: false,
    defaultValue: 'Text',
  },
  category_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'custom_fields',
  timestamps: true,
  underscored: true,
});

module.exports = CustomField;
