const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  full_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Full name is required' },
      len: {
        args: [2, 100],
        msg: 'Full name must be between 2 and 100 characters',
      },
    },
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: { msg: 'An account with this email already exists' },
    validate: {
      notEmpty: { msg: 'Email is required' },
      isEmail: { msg: 'Please enter a valid email address' },
    },
  },
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('Employee', 'Department Head', 'Asset Manager', 'Admin'),
    allowNull: false,
    defaultValue: 'Employee',
  },
  department_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: null,
  },
  status: {
    type: DataTypes.ENUM('Active', 'Inactive'),
    allowNull: false,
    defaultValue: 'Active',
  },
  reset_token: {
    type: DataTypes.STRING(255),
    allowNull: true,
    defaultValue: null,
  },
  reset_token_expires: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: null,
  },
}, {
  tableName: 'users',
  timestamps: true,
  underscored: true, // created_at, updated_at
  defaultScope: {
    attributes: { exclude: ['password_hash'] },
  },
  scopes: {
    withPassword: {
      attributes: {},  // include all fields, including password_hash
    },
  },
});

/**
 * Returns a sanitized user object (without password_hash).
 * Useful when we have a full user instance from withPassword scope.
 */
User.prototype.toSafeObject = function () {
  const { password_hash, ...safeUser } = this.toJSON();
  return safeUser;
};

module.exports = User;
