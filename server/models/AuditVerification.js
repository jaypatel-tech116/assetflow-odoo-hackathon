const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AuditVerification = sequelize.define('AuditVerification', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  audit_cycle_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  asset_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  verification_status: {
    type: DataTypes.ENUM('Verified', 'Missing', 'Damaged'),
    allowNull: false,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  verified_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  verified_on: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'audit_verifications',
  timestamps: true,
  underscored: true,
});

module.exports = AuditVerification;
