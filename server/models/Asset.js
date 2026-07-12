const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Asset = sequelize.define('Asset', {
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> origin/jay
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  asset_tag: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
  },
  name: {
<<<<<<< HEAD
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  category: {
    type: DataTypes.ENUM('Laptop', 'Accessory', 'Monitor', 'Phone', 'Tablet', 'Keyboard', 'Mouse', 'Other'),
    allowNull: false,
    defaultValue: 'Other',
  },
  status: {
    type: DataTypes.ENUM('Available', 'Allocated', 'Under Maintenance', 'Retired'),
    allowNull: false,
    defaultValue: 'Available',
  },
  assigned_to: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  assigned_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  return_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
=======
    type: DataTypes.STRING(150),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Asset name is required' },
    },
  },
  category_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
>>>>>>> origin/jay
  },
  serial_number: {
    type: DataTypes.STRING(100),
    allowNull: true,
<<<<<<< HEAD
  },
=======
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  tag: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
    comment: 'e.g. AF-0012',
  },
  name: { type: DataTypes.STRING(150), allowNull: false },
  category: {
    type: DataTypes.ENUM('Laptop', 'Monitor', 'Printer', 'Projector', 'Furniture', 'Electrical', 'Vehicle', 'Other'),
    allowNull: false,
    defaultValue: 'Other',
  },
  serial_number: { type: DataTypes.STRING(100), allowNull: true },
  status: {
    type: DataTypes.ENUM('Available', 'Allocated', 'Under Maintenance', 'Lost', 'Retired'),
    allowNull: false,
    defaultValue: 'Available',
  },
  department_id: { type: DataTypes.INTEGER, allowNull: true },
  assigned_to: { type: DataTypes.INTEGER, allowNull: true, comment: 'FK to users.id' },
  location: { type: DataTypes.STRING(200), allowNull: true },
  acquired_on: { type: DataTypes.DATEONLY, allowNull: true },
  description: { type: DataTypes.TEXT, allowNull: true },
>>>>>>> origin/prince
=======
    unique: true,
  },
  acquisition_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  acquisition_cost: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true,
  },
  condition: {
    type: DataTypes.ENUM('New', 'Good', 'Fair', 'Poor'),
    allowNull: false,
    defaultValue: 'New',
  },
  location: {
    type: DataTypes.STRING(200),
    allowNull: true,
  },
  department_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: null,
  },
  photo_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  is_shared_bookable: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  capacity: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: null,
  },
  building_location: {
    type: DataTypes.STRING(200),
    allowNull: true,
  },
  facilities: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: null,
  },
  status: {
    type: DataTypes.ENUM('Available', 'Allocated', 'Reserved', 'Under Maintenance', 'Lost', 'Retired', 'Disposed'),
    allowNull: false,
    defaultValue: 'Available',
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
>>>>>>> origin/jay
}, {
  tableName: 'assets',
  timestamps: true,
  underscored: true,
<<<<<<< HEAD
=======
  hooks: {
    beforeValidate: async (asset) => {
      if (!asset.asset_tag) {
        const lastAsset = await Asset.findOne({
          order: [['id', 'DESC']],
          paranoid: false,
        });
        const nextNum = lastAsset ? lastAsset.id + 1 : 1;
        asset.asset_tag = `AF-${String(nextNum).padStart(4, '0')}`;
      }
    },
  },
>>>>>>> origin/jay
});

module.exports = Asset;
