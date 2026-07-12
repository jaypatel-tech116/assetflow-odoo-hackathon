const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AuditCycleAuditor = sequelize.define('AuditCycleAuditor', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  audit_cycle_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  auditor_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'audit_cycle_auditors',
  timestamps: true,
  underscored: true,
});

module.exports = AuditCycleAuditor;
