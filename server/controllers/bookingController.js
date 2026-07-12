const { Op } = require('sequelize');
const Booking = require('../models/Booking');
const Resource = require('../models/Resource');
const Notification = require('../models/Notification');
const { successResponse, errorResponse } = require('../utils/responseHelper');

/**
 * @desc    Get all bookings for the logged-in employee
 * @route   GET /api/employee/bookings
 * @access  Private (Employee)
 */
const getMyBookings = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { status, page = 1, limit = 10 } = req.query;

    const where = { user_id: userId };
    if (status) where.status = status;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows } = await Booking.findAndCountAll({
      where,
      include: [{ model: Resource, as: 'resource', attributes: ['name', 'type', 'location'] }],
      limit: parseInt(limit),
      offset,
      order: [['booking_date', 'DESC']],
    });

    return successResponse(res, 200, {
      bookings: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / parseInt(limit)),
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Create a new booking
 * @route   POST /api/employee/bookings
 * @access  Private (Employee)
 */
const createBooking = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { resource_id, booking_date, start_time, end_time, purpose } = req.body;

    if (!resource_id || !booking_date || !start_time || !end_time || !purpose) {
      return errorResponse(res, 400, 'All fields are required: resource_id, booking_date, start_time, end_time, purpose');
    }

    // Check resource exists
    const resource = await Resource.findByPk(resource_id);
    if (!resource) {
      return errorResponse(res, 404, 'Resource not found');
    }

    // Check for time conflicts
    const conflict = await Booking.findOne({
      where: {
        resource_id,
        booking_date,
        status: 'Upcoming',
        [Op.or]: [
          { start_time: { [Op.between]: [start_time, end_time] } },
          { end_time: { [Op.between]: [start_time, end_time] } },
          {
            [Op.and]: [
              { start_time: { [Op.lte]: start_time } },
              { end_time: { [Op.gte]: end_time } },
            ],
          },
        ],
      },
    });

    if (conflict) {
      return errorResponse(res, 409, 'This time slot is already booked');
    }

    const booking = await Booking.create({
      user_id: userId,
      resource_id,
      booking_date,
      start_time,
      end_time,
      purpose,
    });

    // Create notification
    await Notification.create({
      user_id: userId,
      type: 'success',
      message: `Your booking for ${resource.name} on ${booking_date} is confirmed.`,
    });

    return successResponse(res, 201, {
      message: 'Booking created successfully',
      booking,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Cancel a booking
 * @route   DELETE /api/employee/bookings/:id
 * @access  Private (Employee)
 */
const cancelBooking = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const booking = await Booking.findOne({
      where: { id, user_id: userId },
      include: [{ model: Resource, as: 'resource', attributes: ['name'] }],
    });

    if (!booking) {
      return errorResponse(res, 404, 'Booking not found');
    }

    if (booking.status !== 'Upcoming') {
      return errorResponse(res, 400, 'Only upcoming bookings can be cancelled');
    }

    booking.status = 'Cancelled';
    await booking.save();

    return successResponse(res, 200, {
      message: 'Booking cancelled successfully',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getMyBookings, createBooking, cancelBooking };
