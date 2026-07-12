<<<<<<< HEAD
const { Op } = require('sequelize');
const { AuditCycle, AuditCycleAuditor, AuditVerification, DiscrepancyReport, Asset, User, Department } = require('../models');
const { successResponse, errorResponse } = require('../utils/responseHelper');
const logActivity = require('../utils/activityLogger');
const createNotification = require('../utils/notifier');

const createAuditCycle = async (req, res, next) => {
  try {
    const { title, scope_department_id, scope_location, start_date, end_date, lead_auditor_id, auditor_ids } = req.body;
    if (!title || !start_date || !end_date || !lead_auditor_id) {
      return errorResponse(res, 400, 'Title, dates, and lead auditor are required');
    }
    // Count assets in scope
    const assetWhere = {};
    if (scope_department_id) assetWhere.department_id = scope_department_id;
    if (scope_location) assetWhere.location = { [Op.like]: `%${scope_location}%` };
    const totalAssets = await Asset.count({ where: assetWhere });

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const count = await AuditCycle.count() + 1;
    const cycle_code = `AC-${year}-${month}-${String(count).padStart(2, '0')}`;

    const cycle = await AuditCycle.create({
      cycle_code, title, scope_department_id: scope_department_id || null,
      scope_location: scope_location || null, start_date, end_date,
      status: 'Scheduled', lead_auditor_id, total_assets: totalAssets, completed_count: 0,
    });
    // Add auditors
    if (auditor_ids && auditor_ids.length > 0) {
      const auditorRecords = auditor_ids.map(id => ({ audit_cycle_id: cycle.id, auditor_id: id }));
      await AuditCycleAuditor.bulkCreate(auditorRecords);
    }
    await logActivity(req.user.id, 'Created Audit Cycle', 'Audit', `${cycle.cycle_code}: ${title}`);
    return successResponse(res, 201, { message: 'Audit cycle created', auditCycle: cycle });
  } catch (err) { next(err); }
};

const getAllAuditCycles = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const where = {};
    if (status) where.status = status;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { count, rows } = await AuditCycle.findAndCountAll({
      where,
      include: [
        { model: Department, as: 'scopeDepartment', attributes: ['id', 'name'] },
        { model: User, as: 'leadAuditor', attributes: ['id', 'full_name'] },
        { model: User, as: 'auditors', attributes: ['id', 'full_name'], through: { attributes: [] } },
      ],
      order: [['start_date', 'DESC']],
      limit: parseInt(limit), offset,
    });
    return successResponse(res, 200, { auditCycles: rows, pagination: { total: count, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(count / parseInt(limit)) } });
  } catch (err) { next(err); }
};

const getAuditCycleById = async (req, res, next) => {
  try {
    const cycle = await AuditCycle.findByPk(req.params.id, {
      include: [
        { model: Department, as: 'scopeDepartment' },
        { model: User, as: 'leadAuditor', attributes: ['id', 'full_name'] },
        { model: User, as: 'auditors', attributes: ['id', 'full_name'], through: { attributes: [] } },
        { model: AuditVerification, as: 'verifications', include: [
          { model: Asset, as: 'asset', attributes: ['id', 'asset_tag', 'name', 'location', 'status'] },
          { model: User, as: 'verifier', attributes: ['id', 'full_name'] },
        ]},
        { model: DiscrepancyReport, as: 'discrepancies', include: [
          { model: Asset, as: 'asset', attributes: ['id', 'asset_tag', 'name'] },
        ]},
      ],
    });
    if (!cycle) return errorResponse(res, 404, 'Audit cycle not found');
    return successResponse(res, 200, { auditCycle: cycle });
  } catch (err) { next(err); }
};

const updateAuditCycle = async (req, res, next) => {
  try {
    const cycle = await AuditCycle.findByPk(req.params.id);
    if (!cycle) return errorResponse(res, 404, 'Audit cycle not found');
    if (['Closed', 'Cancelled'].includes(cycle.status)) return errorResponse(res, 400, 'Cannot modify a closed/cancelled audit');
    const { title, status, scope_department_id, scope_location, start_date, end_date } = req.body;
    await cycle.update({
      title: title !== undefined ? title : cycle.title,
      status: status !== undefined ? status : cycle.status,
      scope_department_id: scope_department_id !== undefined ? scope_department_id : cycle.scope_department_id,
      scope_location: scope_location !== undefined ? scope_location : cycle.scope_location,
      start_date: start_date !== undefined ? start_date : cycle.start_date,
      end_date: end_date !== undefined ? end_date : cycle.end_date,
    });
    await logActivity(req.user.id, 'Updated Audit Cycle', 'Audit', `${cycle.cycle_code}`);
    return successResponse(res, 200, { message: 'Audit cycle updated', auditCycle: cycle });
  } catch (err) { next(err); }
};

const verifyAsset = async (req, res, next) => {
  try {
    const cycle = await AuditCycle.findByPk(req.params.id);
    if (!cycle) return errorResponse(res, 404, 'Audit cycle not found');
    if (['Closed', 'Cancelled'].includes(cycle.status)) return errorResponse(res, 400, 'Audit cycle is closed — no further verifications allowed');

    const { asset_id, verification_status, notes } = req.body;
    if (!asset_id || !verification_status) return errorResponse(res, 400, 'Asset ID and verification status are required');

    // Upsert verification
    const [verification, created] = await AuditVerification.findOrCreate({
      where: { audit_cycle_id: cycle.id, asset_id },
      defaults: { verification_status, notes: notes || null, verified_by: req.user.id, verified_on: new Date() },
    });
    if (!created) {
      await verification.update({ verification_status, notes: notes || null, verified_by: req.user.id, verified_on: new Date() });
    }

    // Update completed count
    const completedCount = await AuditVerification.count({ where: { audit_cycle_id: cycle.id } });
    await cycle.update({ completed_count: completedCount });

    // Auto-generate discrepancy if not Verified
    if (verification_status !== 'Verified') {
      const asset = await Asset.findByPk(asset_id);
      await DiscrepancyReport.findOrCreate({
        where: { audit_cycle_id: cycle.id, asset_id },
        defaults: {
          issue: verification_status, expected_location: asset?.location || null,
          verified_by: req.user.id, notes: notes || null, generated_on: new Date(),
        },
      });
    } else {
      // Remove discrepancy if asset is now Verified
      await DiscrepancyReport.destroy({ where: { audit_cycle_id: cycle.id, asset_id } });
    }

    await logActivity(req.user.id, 'Verified Asset in Audit', 'Audit', `${cycle.cycle_code}: Asset #${asset_id} → ${verification_status}`);
    return successResponse(res, 200, { message: 'Asset verification recorded', verification });
  } catch (err) { next(err); }
};

const closeAuditCycle = async (req, res, next) => {
  try {
    const cycle = await AuditCycle.findByPk(req.params.id);
    if (!cycle) return errorResponse(res, 404, 'Audit cycle not found');
    if (cycle.status === 'Closed') return errorResponse(res, 400, 'Audit cycle is already closed');

    // Mark confirmed-missing assets as Lost
    const missingVerifications = await AuditVerification.findAll({
      where: { audit_cycle_id: cycle.id, verification_status: 'Missing' },
    });
    for (const v of missingVerifications) {
      await Asset.update({ status: 'Lost' }, { where: { id: v.asset_id } });
      await createNotification(cycle.lead_auditor_id, 'AuditDiscrepancy', `Asset #${v.asset_id} confirmed missing and marked as Lost`, 'Asset', v.asset_id);
    }

    await cycle.update({ status: 'Closed' });
    await logActivity(req.user.id, 'Closed Audit Cycle', 'Audit', `${cycle.cycle_code} — ${missingVerifications.length} assets marked Lost`);
    return successResponse(res, 200, { message: 'Audit cycle closed', auditCycle: cycle });
  } catch (err) { next(err); }
};

const getDiscrepancyReport = async (req, res, next) => {
  try {
    const discrepancies = await DiscrepancyReport.findAll({
      where: { audit_cycle_id: req.params.id },
      include: [
        { model: Asset, as: 'asset', attributes: ['id', 'asset_tag', 'name', 'location'] },
        { model: User, as: 'verifier', attributes: ['id', 'full_name'] },
      ],
      order: [['generated_on', 'DESC']],
    });
    return successResponse(res, 200, { discrepancies });
  } catch (err) { next(err); }
};

module.exports = { createAuditCycle, getAllAuditCycles, getAuditCycleById, updateAuditCycle, verifyAsset, closeAuditCycle, getDiscrepancyReport };
=======
const { AuditCycle, Discrepancy, User } = require('../models');

// Helper to seed data
const seedAuditDataIfEmpty = async () => {
  const count = await AuditCycle.count();
  if (count === 0) {
    const cycles = [
      { name: 'Quarterly Audit - May 2024', scope_type: 'Department', scope_id: 'Information Technology', start_date: '2024-05-20', end_date: '2024-05-27', status: 'Open' },
      { name: 'Quarterly Audit - May 2024', scope_type: 'Department', scope_id: 'Human Resources', start_date: '2024-05-18', end_date: '2024-05-25', status: 'Open' },
      { name: 'Monthly Audit - April 2024', scope_type: 'Location', scope_id: 'Head Office - 1st Floor', start_date: '2024-04-25', end_date: '2024-04-30', status: 'Closed' },
      { name: 'Quarterly Audit - Apr 2024', scope_type: 'Department', scope_id: 'Finance', start_date: '2024-04-15', end_date: '2024-04-22', status: 'Closed' },
      { name: 'Monthly Audit - March 2024', scope_type: 'Location', scope_id: 'Warehouse - East', start_date: '2024-03-25', end_date: '2024-03-30', status: 'Closed' },
      { name: 'Quarterly Audit - Mar 2024', scope_type: 'Department', scope_id: 'Operations', start_date: '2024-03-18', end_date: '2024-03-25', status: 'Closed' },
      { name: 'Monthly Audit - Feb 2024', scope_type: 'Location', scope_id: 'Warehouse - West', start_date: '2024-02-25', end_date: '2024-03-01', status: 'Closed' },
    ];
    
    await AuditCycle.bulkCreate(cycles);
    
    const discrepancies = [
      { audit_cycle_id: 1, asset_tag: 'AF-0008', asset_name: 'Dell Latitude 7450', location: 'IT Department', status: 'Verified', auditor_notes: 'Asset is in good condition and functional.', reported_on: new Date('2024-05-20T10:15:00') },
      { audit_cycle_id: 1, asset_tag: 'AF-0015', asset_name: 'HP LaserJet P1108', location: 'HR Department', status: 'Missing', auditor_notes: 'Asset not found at the assigned location.', reported_on: new Date('2024-05-20T10:20:00') },
      { audit_cycle_id: 1, asset_tag: 'AF-0044', asset_name: 'Toyota Innova G', location: 'Transport', status: 'Damaged', auditor_notes: 'Left side mirror broken, needs replacement.', reported_on: new Date('2024-05-20T10:35:00') },
      { audit_cycle_id: 1, asset_tag: 'AF-0031', asset_name: 'Conference Table', location: 'Meeting Room 2', status: 'Verified', auditor_notes: 'No issues found.', reported_on: new Date('2024-05-20T10:40:00') },
      { audit_cycle_id: 1, asset_tag: 'AF-0050', asset_name: 'Logitech Projector', location: 'Training Room', status: 'Damaged', auditor_notes: 'Lamp not working properly.', reported_on: new Date('2024-05-20T11:00:00') },
    ];
    await Discrepancy.bulkCreate(discrepancies);
  }
};

exports.getCycles = async (req, res, next) => {
  try {
    await seedAuditDataIfEmpty();
    
    // We include discrepancies to calculate counts for the dashboard list
    const cycles = await AuditCycle.findAll({
      include: [
        { model: Discrepancy, as: 'discrepancies', attributes: ['id', 'status'] },
        { model: User, as: 'auditors', attributes: ['id', 'full_name'] } // Junction table
      ],
      order: [['start_date', 'DESC']]
    });
    
    res.json({ success: true, cycles });
  } catch (error) {
    next(error);
  }
};

exports.createCycle = async (req, res, next) => {
  try {
    const { name, scope_type, scope_id, start_date, end_date, auditors } = req.body;
    
    const cycle = await AuditCycle.create({
      name, scope_type, scope_id, start_date, end_date, status: 'Open'
    });
    
    if (auditors && auditors.length > 0) {
      await cycle.setAuditors(auditors);
    }
    
    // fetch again with relations
    const newCycle = await AuditCycle.findByPk(cycle.id, {
      include: [
        { model: Discrepancy, as: 'discrepancies', attributes: ['id', 'status'] },
        { model: User, as: 'auditors', attributes: ['id', 'full_name'] }
      ]
    });
    
    res.status(201).json({ success: true, cycle: newCycle });
  } catch (error) {
    next(error);
  }
};

exports.getDiscrepancies = async (req, res, next) => {
  try {
    // If cycleId is not provided, return all or mock
    const { cycleId } = req.query;
    
    const whereClause = cycleId ? { audit_cycle_id: cycleId } : {};
    
    const discrepancies = await Discrepancy.findAll({
      where: whereClause,
      order: [['reported_on', 'ASC']]
    });
    
    res.json({ success: true, discrepancies });
  } catch (error) {
    next(error);
  }
};
>>>>>>> origin/kashyap
