const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Notification = sequelize.define('Notification', {
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> origin/jay
=======
>>>>>>> origin/kashyap
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
<<<<<<< HEAD
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
=======
    allowNull: true, // If null, maybe it's a global notification, though usually linked
  },
  type: {
    type: DataTypes.STRING(50), // e.g. success, warning, info, danger
    allowNull: false,
    defaultValue: 'info',
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
>>>>>>> origin/kashyap
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
<<<<<<< HEAD
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
=======
>>>>>>> origin/kashyap
  is_read: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
<<<<<<< HEAD
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
=======
  is_important: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
}, {
  tableName: 'notifications',
  timestamps: true,
  createdAt: 'timestamp',
  updatedAt: false,
>>>>>>> origin/kashyap
  underscored: true,
});

module.exports = Notification;
