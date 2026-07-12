const { Op } = require('sequelize');
const { ResourceBooking, Asset, User, Department } = require('../models');
const { successResponse, errorResponse } = require('../utils/responseHelper');
const logActivity = require('../utils/activityLogger');
const createNotification = require('../utils/notifier');

const createBooking = async (req, res, next) => {
  try {
    const { resource_asset_id, start_time, end_time, purpose, department_id } = req.body;
    if (!resource_asset_id || !start_time || !end_time) {
      return errorResponse(res, 400, 'Resource, start time, and end time are required');
    }
    const asset = await Asset.findByPk(resource_asset_id);
    if (!asset) return errorResponse(res, 404, 'Resource not found');
    if (!asset.is_shared_bookable) return errorResponse(res, 400, 'This asset is not a bookable resource');

    // Overlap validation
    const overlap = await ResourceBooking.findOne({
      where: {
        resource_asset_id,
        status: { [Op.in]: ['Upcoming', 'Ongoing'] },
        start_time: { [Op.lt]: new Date(end_time) },
        end_time: { [Op.gt]: new Date(start_time) },
      },
    });
    if (overlap) {
      return errorResponse(res, 409, 'This time slot overlaps with an existing booking');
    }

    const booking = await ResourceBooking.create({
      resource_asset_id,
      booked_by: req.user.id,
      department_id: department_id || null,
      start_time: new Date(start_time),
      end_time: new Date(end_time),
      purpose: purpose || null,
      status: 'Upcoming',
    });
    await logActivity(req.user.id, 'Resource Booking Created', 'Resources', `Resource ${asset.asset_tag}`);
    await createNotification(req.user.id, 'BookingConfirmed', `Your booking for ${asset.name} has been confirmed`, 'ResourceBooking', booking.id);
    return successResponse(res, 201, { message: 'Booking created successfully', booking });
  } catch (err) { next(err); }
};

const getAllBookings = async (req, res, next) => {
  try {
    const { status, resource_asset_id, page = 1, limit = 20 } = req.query;
    const where = {};
    if (status) where.status = status;
    if (resource_asset_id) where.resource_asset_id = resource_asset_id;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { count, rows: bookings } = await ResourceBooking.findAndCountAll({
      where,
      include: [
        { model: Asset, as: 'resource', attributes: ['id', 'asset_tag', 'name', 'location', 'capacity', 'building_location', 'facilities'] },
        { model: User, as: 'bookedByUser', attributes: ['id', 'full_name'] },
        { model: Department, as: 'department', attributes: ['id', 'name'] },
      ],
      order: [['start_time', 'DESC']],
      limit: parseInt(limit),
      offset,
    });
    return successResponse(res, 200, {
      bookings,
      pagination: { total: count, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(count / parseInt(limit)) },
    });
  } catch (err) { next(err); }
};

const getBookingById = async (req, res, next) => {
  try {
    const booking = await ResourceBooking.findByPk(req.params.id, {
      include: [
        { model: Asset, as: 'resource' },
        { model: User, as: 'bookedByUser', attributes: ['id', 'full_name'] },
        { model: Department, as: 'department', attributes: ['id', 'name'] },
      ],
    });
    if (!booking) return errorResponse(res, 404, 'Booking not found');
    return successResponse(res, 200, { booking });
  } catch (err) { next(err); }
};

const cancelBooking = async (req, res, next) => {
  try {
    const booking = await ResourceBooking.findByPk(req.params.id, {
      include: [{ model: Asset, as: 'resource' }],
    });
    if (!booking) return errorResponse(res, 404, 'Booking not found');
    if (!['Upcoming', 'Ongoing'].includes(booking.status)) {
      return errorResponse(res, 400, 'Only upcoming or ongoing bookings can be cancelled');
    }
    await booking.update({ status: 'Cancelled' });
    await logActivity(req.user.id, 'Cancelled Booking', 'Resources', `Booking #${booking.id}`);
    await createNotification(booking.booked_by, 'BookingCancelled', `Your booking for ${booking.resource.name} has been cancelled`, 'ResourceBooking', booking.id);
    return successResponse(res, 200, { message: 'Booking cancelled', booking });
  } catch (err) { next(err); }
};

const getResourceBookings = async (req, res, next) => {
  try {
    const { assetId } = req.params;
    const { start, end } = req.query;
    const where = { resource_asset_id: assetId, status: { [Op.in]: ['Upcoming', 'Ongoing'] } };
    if (start && end) {
      where.start_time = { [Op.lt]: new Date(end) };
      where.end_time = { [Op.gt]: new Date(start) };
    }
    const bookings = await ResourceBooking.findAll({
      where,
      include: [{ model: User, as: 'bookedByUser', attributes: ['id', 'full_name'] }],
      order: [['start_time', 'ASC']],
    });
    return successResponse(res, 200, { bookings });
  } catch (err) { next(err); }
};

module.exports = { createBooking, getAllBookings, getBookingById, cancelBooking, getResourceBookings };
