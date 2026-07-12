/**
 * Central model registry — imports all models and defines associations.
 * Import this file ONCE in index.js before sequelize.sync().
 */

const sequelize = require('./database');
const User = require('../models/User');
const Department = require('../models/Department');
const Asset = require('../models/Asset');
const Request = require('../models/Request');
const Resource = require('../models/Resource');
const Booking = require('../models/Booking');
const Notification = require('../models/Notification');

// ─── Associations ────────────────────────────────────────────────────────────

// User ↔ Department
Department.hasMany(User, { foreignKey: 'department_id', as: 'members' });
User.belongsTo(Department, { foreignKey: 'department_id', as: 'department' });

// Asset ↔ Department
Department.hasMany(Asset, { foreignKey: 'department_id', as: 'assets' });
Asset.belongsTo(Department, { foreignKey: 'department_id', as: 'department' });

// Asset ↔ User (assigned_to)
User.hasMany(Asset, { foreignKey: 'assigned_to', as: 'assignedAssets' });
Asset.belongsTo(User, { foreignKey: 'assigned_to', as: 'assignedUser' });

// Request ↔ User (employee)
User.hasMany(Request, { foreignKey: 'employee_id', as: 'submittedRequests' });
Request.belongsTo(User, { foreignKey: 'employee_id', as: 'employee' });

// Request ↔ User (approved_by)
User.hasMany(Request, { foreignKey: 'approved_by', as: 'approvedRequests' });
Request.belongsTo(User, { foreignKey: 'approved_by', as: 'approver' });

// Request ↔ Asset
Asset.hasMany(Request, { foreignKey: 'asset_id', as: 'requests' });
Request.belongsTo(Asset, { foreignKey: 'asset_id', as: 'asset' });

// Booking ↔ Resource
Resource.hasMany(Booking, { foreignKey: 'resource_id', as: 'bookings' });
Booking.belongsTo(Resource, { foreignKey: 'resource_id', as: 'resource' });

// Booking ↔ User
User.hasMany(Booking, { foreignKey: 'user_id', as: 'bookings' });
Booking.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Notification ↔ User
User.hasMany(Notification, { foreignKey: 'user_id', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

module.exports = { sequelize, User, Department, Asset, Request, Resource, Booking, Notification };
