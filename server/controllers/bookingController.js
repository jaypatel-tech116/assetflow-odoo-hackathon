const { Op } = require('sequelize');
const { Resource, Booking, User, Notification } = require('../config/associations');
const { successResponse, errorResponse } = require('../utils/responseHelper');

/**
 * GET /api/resources
 */
const listResources = async (req, res) => {
  try {
    const { type } = req.query;
    const where = {};
    if (type) where.type = type;

    const resources = await Resource.findAll({ where, order: [['name', 'ASC']] });
    return successResponse(res, 200, { resources });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

/**
 * GET /api/resources/:id/availability?date=YYYY-MM-DD
 * Returns booked time slots for a resource on a given date.
 */
const checkAvailability = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return errorResponse(res, 400, 'date query param required (YYYY-MM-DD)');

    const bookings = await Booking.findAll({
      where: {
        resource_id: req.params.id,
        booking_date: date,
        status: { [Op.ne]: 'Cancelled' },
      },
      attributes: ['start_time', 'end_time', 'purpose', 'user_id'],
    });

    return successResponse(res, 200, { bookedSlots: bookings });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// ─── Bookings ────────────────────────────────────────────────────────────────

// Generate booking ID BK-0001
const genBookingId = async () => {
  const count = await Booking.count();
  return `BK-${String(count + 1).padStart(4, '0')}`;
};

/**
 * GET /api/bookings
 */
const listBookings = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const where = { user_id: req.user.id };
    if (status) where.status = status;

    const offset = (Number(page) - 1) * Number(limit);
    const { count, rows } = await Booking.findAndCountAll({
      where,
      include: [{ model: Resource, as: 'resource', attributes: ['id', 'name', 'type', 'location'] }],
      order: [['booking_date', 'DESC'], ['start_time', 'DESC']],
      limit: Number(limit),
      offset,
    });

    return successResponse(res, 200, { bookings: rows, total: count, page: Number(page), pages: Math.ceil(count / Number(limit)) });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

/**
 * POST /api/bookings
 */
const createBooking = async (req, res) => {
  try {
    const { resource_id, booking_date, start_time, end_time, purpose, notes } = req.body;
    if (!resource_id || !booking_date || !start_time || !end_time || !purpose) {
      return errorResponse(res, 400, 'resource_id, booking_date, start_time, end_time, purpose are required');
    }

    const resource = await Resource.findByPk(resource_id);
    if (!resource) return errorResponse(res, 404, 'Resource not found');

    // Check for conflicts
    const conflict = await Booking.findOne({
      where: {
        resource_id,
        booking_date,
        status: { [Op.ne]: 'Cancelled' },
        [Op.or]: [
          { start_time: { [Op.between]: [start_time, end_time] } },
          { end_time: { [Op.between]: [start_time, end_time] } },
          { [Op.and]: [{ start_time: { [Op.lte]: start_time } }, { end_time: { [Op.gte]: end_time } }] },
        ],
      },
    });
    if (conflict) return errorResponse(res, 409, 'This time slot is already booked for the selected resource');

    const booking_id = await genBookingId();
    const booking = await Booking.create({
      booking_id, resource_id, user_id: req.user.id,
      booking_date, start_time, end_time, purpose,
      notes: notes || null, status: 'Upcoming',
    });

    await Notification.create({
      user_id: req.user.id,
      title: 'Booking Confirmed',
      body: `${resource.name} booked for ${booking_date} ${start_time} - ${end_time}`,
      type: 'success',
      entity_type: 'booking',
      entity_id: booking.id,
    });

    return successResponse(res, 201, { message: 'Booking created', booking });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

/**
 * DELETE /api/bookings/:id (cancel)
 */
const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id);
    if (!booking) return errorResponse(res, 404, 'Booking not found');
    if (booking.user_id !== req.user.id) return errorResponse(res, 403, 'Not authorized');
    if (booking.status !== 'Upcoming') return errorResponse(res, 400, 'Only upcoming bookings can be cancelled');

    await booking.update({ status: 'Cancelled' });
    return successResponse(res, 200, { message: 'Booking cancelled' });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

module.exports = { listResources, checkAvailability, listBookings, createBooking, cancelBooking };
