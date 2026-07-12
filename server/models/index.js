<<<<<<< HEAD
const sequelize = require('../config/database');
const User = require('./User');
const Department = require('./Department');
const AssetCategory = require('./AssetCategory');
const Asset = require('./Asset');
const Allocation = require('./Allocation');
const TransferRequest = require('./TransferRequest');
const ResourceBooking = require('./ResourceBooking');
const MaintenanceRequest = require('./MaintenanceRequest');
const AuditCycle = require('./AuditCycle');
const AuditCycleAuditor = require('./AuditCycleAuditor');
const AuditVerification = require('./AuditVerification');
const DiscrepancyReport = require('./DiscrepancyReport');
const ActivityLog = require('./ActivityLog');
const Notification = require('./Notification');

// ===================== ASSOCIATIONS =====================

// --- User <-> Department ---
User.belongsTo(Department, { foreignKey: 'department_id', as: 'department' });
Department.hasMany(User, { foreignKey: 'department_id', as: 'members' });

// Department head (User)
Department.belongsTo(User, { foreignKey: 'department_head_id', as: 'head' });

// Department self-referencing (parent/child)
Department.belongsTo(Department, { foreignKey: 'parent_department_id', as: 'parent' });
Department.hasMany(Department, { foreignKey: 'parent_department_id', as: 'children' });

// --- Asset ---
Asset.belongsTo(AssetCategory, { foreignKey: 'category_id', as: 'category' });
AssetCategory.hasMany(Asset, { foreignKey: 'category_id', as: 'assets' });

Asset.belongsTo(Department, { foreignKey: 'department_id', as: 'department' });
Department.hasMany(Asset, { foreignKey: 'department_id', as: 'assets' });

Asset.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

// --- Allocation ---
Allocation.belongsTo(Asset, { foreignKey: 'asset_id', as: 'asset' });
Asset.hasMany(Allocation, { foreignKey: 'asset_id', as: 'allocations' });

Allocation.belongsTo(User, { foreignKey: 'employee_id', as: 'employee' });
Allocation.belongsTo(Department, { foreignKey: 'department_id', as: 'department' });
Allocation.belongsTo(User, { foreignKey: 'allocated_by', as: 'allocator' });

// --- TransferRequest ---
TransferRequest.belongsTo(Asset, { foreignKey: 'asset_id', as: 'asset' });
Asset.hasMany(TransferRequest, { foreignKey: 'asset_id', as: 'transferRequests' });

TransferRequest.belongsTo(User, { foreignKey: 'requested_by', as: 'requester' });
TransferRequest.belongsTo(User, { foreignKey: 'current_holder_id', as: 'currentHolder' });
TransferRequest.belongsTo(User, { foreignKey: 'requested_to_employee_id', as: 'targetEmployee' });
TransferRequest.belongsTo(Department, { foreignKey: 'requested_to_department_id', as: 'targetDepartment' });
TransferRequest.belongsTo(User, { foreignKey: 'approved_by', as: 'approver' });

// --- ResourceBooking ---
ResourceBooking.belongsTo(Asset, { foreignKey: 'resource_asset_id', as: 'resource' });
Asset.hasMany(ResourceBooking, { foreignKey: 'resource_asset_id', as: 'bookings' });

ResourceBooking.belongsTo(User, { foreignKey: 'booked_by', as: 'bookedByUser' });
ResourceBooking.belongsTo(Department, { foreignKey: 'department_id', as: 'department' });

// --- MaintenanceRequest ---
MaintenanceRequest.belongsTo(Asset, { foreignKey: 'asset_id', as: 'asset' });
Asset.hasMany(MaintenanceRequest, { foreignKey: 'asset_id', as: 'maintenanceRequests' });

MaintenanceRequest.belongsTo(User, { foreignKey: 'raised_by', as: 'raisedByUser' });
MaintenanceRequest.belongsTo(User, { foreignKey: 'approved_by', as: 'approver' });
MaintenanceRequest.belongsTo(User, { foreignKey: 'technician_id', as: 'technician' });

// --- AuditCycle ---
AuditCycle.belongsTo(Department, { foreignKey: 'scope_department_id', as: 'scopeDepartment' });
AuditCycle.belongsTo(User, { foreignKey: 'lead_auditor_id', as: 'leadAuditor' });

// AuditCycle <-> User (many-to-many via AuditCycleAuditor)
AuditCycle.belongsToMany(User, { through: AuditCycleAuditor, foreignKey: 'audit_cycle_id', otherKey: 'auditor_id', as: 'auditors' });
User.belongsToMany(AuditCycle, { through: AuditCycleAuditor, foreignKey: 'auditor_id', otherKey: 'audit_cycle_id', as: 'assignedAudits' });

AuditCycleAuditor.belongsTo(AuditCycle, { foreignKey: 'audit_cycle_id' });
AuditCycleAuditor.belongsTo(User, { foreignKey: 'auditor_id' });

// --- AuditVerification ---
AuditVerification.belongsTo(AuditCycle, { foreignKey: 'audit_cycle_id', as: 'auditCycle' });
AuditCycle.hasMany(AuditVerification, { foreignKey: 'audit_cycle_id', as: 'verifications' });

AuditVerification.belongsTo(Asset, { foreignKey: 'asset_id', as: 'asset' });
AuditVerification.belongsTo(User, { foreignKey: 'verified_by', as: 'verifier' });

// --- DiscrepancyReport ---
DiscrepancyReport.belongsTo(AuditCycle, { foreignKey: 'audit_cycle_id', as: 'auditCycle' });
AuditCycle.hasMany(DiscrepancyReport, { foreignKey: 'audit_cycle_id', as: 'discrepancies' });

DiscrepancyReport.belongsTo(Asset, { foreignKey: 'asset_id', as: 'asset' });
DiscrepancyReport.belongsTo(User, { foreignKey: 'verified_by', as: 'verifier' });

// --- ActivityLog ---
ActivityLog.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// --- Notification ---
Notification.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

module.exports = {
  sequelize,
  User,
  Department,
  AssetCategory,
  Asset,
  Allocation,
  TransferRequest,
  ResourceBooking,
  MaintenanceRequest,
  AuditCycle,
  AuditCycleAuditor,
  AuditVerification,
  DiscrepancyReport,
  ActivityLog,
  Notification,
=======
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
>>>>>>> origin/kashyap
};
