const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TransferRequest = sequelize.define('TransferRequest', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  request_id: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  asset_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'assets',
      key: 'id',
    },
  },
  type: {
    type: DataTypes.ENUM('Transfer', 'Return'),
    allowNull: false,
  },
  to_from: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('Pending', 'Approved', 'Completed', 'Rejected'),
    allowNull: false,
    defaultValue: 'Pending',
  },
  requested_on: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'transfer_requests',
  timestamps: true,
  underscored: true,
  hooks: {
    beforeCreate: async (request) => {
      if (!request.request_id) {
        const count = await TransferRequest.count();
        request.request_id = `TR-${String(count + 1).padStart(4, '0')}`;
      }
    },
  },
});

module.exports = TransferRequest;
