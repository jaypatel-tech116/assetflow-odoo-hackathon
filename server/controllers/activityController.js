const { ActivityLog, Notification, User } = require('../models');

// Helper to seed initial data if empty
const seedActivityDataIfEmpty = async () => {
  const logCount = await ActivityLog.count();
  if (logCount === 0) {
    const logs = [
      { action: 'Created', module: 'Department', details: 'Created new department "Information Technology"', role: 'Administrator', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2) },
      { action: 'Updated', module: 'Employee', details: 'Updated role for Amit Joshi to Asset Manager', role: 'Administrator', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4) },
      { action: 'Approved', module: 'Maintenance', details: 'Approved maintenance request for asset AF-0045', role: 'Asset Manager', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5) },
      { action: 'Allocated', module: 'Asset Allocation', details: 'Allocated asset AF-0008 to Rahul Mehta', role: 'Asset Manager', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6) },
      { action: 'Requested', module: 'Transfer', details: 'Requested transfer for asset AF-0033', role: 'Department Head', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 7) },
      { action: 'Booked', module: 'Resource Booking', details: 'Booked resource "Meeting Room B2" on 22 May 2024', role: 'Employee', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8) },
      { action: 'Created', module: 'Maintenance', details: 'Raised maintenance request for asset AF-0012', role: 'Employee', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 10) },
      { action: 'Updated', module: 'Asset', details: 'Updated asset details for AF-0050', role: 'Asset Manager', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12) },
      { action: 'Deactivated', module: 'Employee', details: 'Deactivated employee account: john.doe@assetflow.com', role: 'Administrator', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24) },
      { action: 'Created', module: 'Asset Category', details: 'Created new asset category "Office Equipment"', role: 'Administrator', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 36) },
    ];
    
    // Attempt to link to a random user if available
    const adminUser = await User.findOne({ where: { role: 'Admin' } });
    if (adminUser) {
      logs.forEach(l => l.user_id = adminUser.id);
    }
    
    await ActivityLog.bulkCreate(logs);
  }

  const notifCount = await Notification.count();
  if (notifCount === 0) {
    const notifications = [
      { type: 'success', title: 'Maintenance request approved', message: 'Your maintenance request for asset AF-0045 has been approved.', is_important: false, is_read: false, timestamp: new Date(Date.now() - 1000 * 60 * 30) },
      { type: 'success', title: 'Asset transferred', message: 'Asset AF-0033 has been transferred to Vikram Patel.', is_important: false, is_read: false, timestamp: new Date(Date.now() - 1000 * 60 * 90) },
      { type: 'warning', title: 'Resource booking confirmed', message: 'Your booking for Meeting Room B2 on 22 May 2024 is confirmed.', is_important: false, is_read: false, timestamp: new Date(Date.now() - 1000 * 60 * 120) },
      { type: 'danger', title: 'Overdue return alert', message: 'Asset AF-0012 is overdue by 3 days.', is_important: true, is_read: false, timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24) },
      { type: 'info', title: 'Role updated', message: 'You have been assigned the role of Asset Manager.', is_important: true, is_read: false, timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48) },
      { type: 'warning', title: 'Audit scheduled', message: 'Audit cycle "May 2024" has been scheduled for 25 May 2024.', is_important: true, is_read: true, timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72) },
      { type: 'info', title: 'New asset added', message: 'New asset AF-0051 (Logitech Keyboard) has been added to the system.', is_important: false, is_read: true, timestamp: new Date(Date.now() - 1000 * 60 * 60 * 96) },
    ];
    await Notification.bulkCreate(notifications);
  }
};

exports.getLogs = async (req, res, next) => {
  try {
    await seedActivityDataIfEmpty();
    
    // In a real app, apply filters from req.query
    const logs = await ActivityLog.findAll({
      include: [{ model: User, as: 'user', attributes: ['id', 'full_name'] }],
      order: [['timestamp', 'DESC']],
      limit: 50
    });
    
    // For mockup, if user is null we'll attach a fake user object
    const finalLogs = logs.map(l => {
      const logData = l.toJSON();
      if (!logData.user) {
        // Fallback names based on roles to match screenshot if real users aren't linked
        const names = {
          'Administrator': 'Prince Roy',
          'Asset Manager': 'Amit Joshi',
          'Department Head': 'Rahul Mehta',
          'Employee': 'Pooja Verma'
        };
        logData.user = { full_name: names[logData.role] || 'System User' };
      }
      return logData;
    });

    res.json({ success: true, logs: finalLogs });
  } catch (error) {
    next(error);
  }
};

exports.getNotifications = async (req, res, next) => {
  try {
    await seedActivityDataIfEmpty();
    
    const notifications = await Notification.findAll({
      order: [['timestamp', 'DESC']]
    });
    
    res.json({ success: true, notifications });
  } catch (error) {
    next(error);
  }
};

exports.markNotificationsRead = async (req, res, next) => {
  try {
    await Notification.update({ is_read: true }, { where: { is_read: false } });
    res.json({ success: true, message: 'Notifications marked as read' });
  } catch (error) {
    next(error);
  }
};
