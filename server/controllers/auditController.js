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
