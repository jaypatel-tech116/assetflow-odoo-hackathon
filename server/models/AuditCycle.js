const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AuditCycle = sequelize.define('AuditCycle', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  scope_type: {
    type: DataTypes.ENUM('Department', 'Location'),
    allowNull: false,
  },
  scope_id: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  start_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  end_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('Open', 'Closed'),
    allowNull: false,
    defaultValue: 'Open',
  },
}, {
  tableName: 'audit_cycles',
  timestamps: true,
  underscored: true,
});

module.exports = AuditCycle;
