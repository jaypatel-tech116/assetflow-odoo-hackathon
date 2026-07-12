const Notification = require('../models/Notification');

/**
 * Create a notification for a user.
 *
 * @param {number} userId             - Recipient user ID
 * @param {string} type               - Notification type (e.g. "AssetAssigned", "MaintenanceApproved")
 * @param {string} message            - Human-readable notification message
 * @param {string} [relatedEntityType] - Entity type (e.g. "Asset", "MaintenanceRequest")
 * @param {number} [relatedEntityId]   - Entity ID
 */
const createNotification = async (userId, type, message, relatedEntityType = null, relatedEntityId = null) => {
  try {
    await Notification.create({
      user_id: userId,
      type,
      message,
      related_entity_type: relatedEntityType,
      related_entity_id: relatedEntityId,
      is_read: false,
    });
  } catch (err) {
    // Log but don't throw — notification creation should never break the main flow
    console.error('Notification write failed:', err.message);
  }
};

module.exports = createNotification;
