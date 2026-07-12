const User = require('./User');
const Department = require('./Department');
const AssetCategory = require('./AssetCategory');
const CustomField = require('./CustomField');
const ActivityLog = require('./ActivityLog');
const Notification = require('./Notification');
const AuditCycle = require('./AuditCycle');
const Discrepancy = require('./Discrepancy');

// --- Associations ---

// Department Hierarchy
Department.belongsTo(Department, { as: 'parent', foreignKey: 'parent_id' });
Department.hasMany(Department, { as: 'children', foreignKey: 'parent_id' });

// Department Head (User)
Department.belongsTo(User, { as: 'head', foreignKey: 'head_id' });
// A user can be head of multiple departments, though typically one
User.hasMany(Department, { as: 'managed_departments', foreignKey: 'head_id' });

// Employee in Department
User.belongsTo(Department, { as: 'department', foreignKey: 'department_id' });
Department.hasMany(User, { as: 'employees', foreignKey: 'department_id' });

// AssetCategory -> CustomFields
AssetCategory.hasMany(CustomField, { as: 'custom_fields', foreignKey: 'category_id', onDelete: 'CASCADE' });
CustomField.belongsTo(AssetCategory, { as: 'category', foreignKey: 'category_id' });

// Activity Logs
ActivityLog.belongsTo(User, { as: 'user', foreignKey: 'user_id' });
User.hasMany(ActivityLog, { as: 'activity_logs', foreignKey: 'user_id' });

// Notifications
Notification.belongsTo(User, { as: 'user', foreignKey: 'user_id' });
User.hasMany(Notification, { as: 'notifications', foreignKey: 'user_id' });

// Audit Cycles & Discrepancies
AuditCycle.belongsToMany(User, { as: 'auditors', through: 'audit_cycle_auditors', foreignKey: 'audit_cycle_id' });
User.belongsToMany(AuditCycle, { as: 'audit_cycles', through: 'audit_cycle_auditors', foreignKey: 'user_id' });

AuditCycle.hasMany(Discrepancy, { as: 'discrepancies', foreignKey: 'audit_cycle_id', onDelete: 'CASCADE' });
Discrepancy.belongsTo(AuditCycle, { as: 'audit_cycle', foreignKey: 'audit_cycle_id' });

Discrepancy.belongsTo(User, { as: 'auditor', foreignKey: 'auditor_id' });
Discrepancy.belongsTo(AssetCategory, { as: 'category', foreignKey: 'category_id' });

module.exports = {
  User,
  Department,
  AssetCategory,
  CustomField,
  ActivityLog,
  Notification,
  AuditCycle,
  Discrepancy,
};
