const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AuditCycle = sequelize.define('AuditCycle', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  cycle_code: {
    type: DataTypes.STRING(30),
    allowNull: false,
    unique: true,
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Audit cycle title is required' },
    },
  },
  scope_department_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  scope_location: {
    type: DataTypes.STRING(200),
    allowNull: true,
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
    type: DataTypes.ENUM('Scheduled', 'In Progress', 'In Review', 'Completed', 'Closed', 'Cancelled'),
    allowNull: false,
    defaultValue: 'Scheduled',
  },
  lead_auditor_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  total_assets: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  completed_count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
}, {
  tableName: 'audit_cycles',
  timestamps: true,
  underscored: true,
});

module.exports = AuditCycle;
