const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Notification = sequelize.define('Notification', {
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> origin/jay
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
<<<<<<< HEAD
    references: {
      model: 'users',
      key: 'id',
    },
  },
  type: {
    type: DataTypes.ENUM('info', 'success', 'warning'),
    allowNull: false,
    defaultValue: 'info',
=======
  },
  type: {
    type: DataTypes.STRING(50),
    allowNull: false,
>>>>>>> origin/jay
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
<<<<<<< HEAD
=======
  related_entity_type: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  related_entity_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
>>>>>>> origin/jay
  is_read: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
<<<<<<< HEAD
=======
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false, comment: 'FK users.id' },
  title: { type: DataTypes.STRING(200), allowNull: false },
  body: { type: DataTypes.TEXT, allowNull: false },
  type: {
    type: DataTypes.ENUM('info', 'success', 'warning', 'error'),
    allowNull: false,
    defaultValue: 'info',
  },
  is_read: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  entity_type: { type: DataTypes.STRING(50), allowNull: true, comment: 'e.g. request, booking, asset' },
  entity_id: { type: DataTypes.INTEGER, allowNull: true },
>>>>>>> origin/prince
=======
>>>>>>> origin/jay
}, {
  tableName: 'notifications',
  timestamps: true,
  underscored: true,
});

module.exports = Notification;
