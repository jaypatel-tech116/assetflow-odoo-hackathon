const ActivityLog = require('../models/ActivityLog');

/**
 * Insert an activity log entry.
 *
 * @param {number} userId  - The user who performed the action
 * @param {string} action  - Human-readable action description (e.g. "Registered New Asset")
 * @param {string} module  - Module name (Assets|Allocations|Resources|Maintenance|Audit|Organization|Auth)
 * @param {string} [details] - Optional additional details
 */
const logActivity = async (userId, action, module, details = null) => {
  try {
    await ActivityLog.create({
      user_id: userId,
      action,
      module,
      details,
      timestamp: new Date(),
    });
  } catch (err) {
    // Log but don't throw — activity logging should never break the main flow
    console.error('ActivityLog write failed:', err.message);
  }
};

module.exports = logActivity;
