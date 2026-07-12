const { Op, fn, col, literal } = require('sequelize');
const { Asset, Allocation, MaintenanceRequest, ResourceBooking, Department, AssetCategory } = require('../models');
const { successResponse } = require('../utils/responseHelper');

const getOverviewStats = async (req, res, next) => {
  try {
    const totalAssets = await Asset.count();
    const byStatus = await Asset.findAll({ attributes: ['status', [fn('COUNT', col('id')), 'count']], group: ['status'], raw: true });
    const totalMaintenanceThisMonth = await MaintenanceRequest.count({
      where: { raised_on: { [Op.gte]: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } },
    });
    const totalBookingsThisMonth = await ResourceBooking.count({
      where: { created_at: { [Op.gte]: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } },
    });
    return successResponse(res, 200, { totalAssets, byStatus, totalMaintenanceThisMonth, totalBookingsThisMonth });
  } catch (err) { next(err); }
};

const getAssetUtilization = async (req, res, next) => {
  try {
    const assets = await Asset.findAll({
      attributes: ['id', 'asset_tag', 'name', 'status',
        [fn('COUNT', col('allocations.id')), 'allocationCount'],
      ],
      include: [
        { model: Allocation, as: 'allocations', attributes: [] },
        { model: AssetCategory, as: 'category', attributes: ['name'] },
      ],
      group: ['Asset.id'],
      order: [[literal('allocationCount'), 'DESC']],
      limit: 20,
      subQuery: false,
    });
    return successResponse(res, 200, { assets });
  } catch (err) { next(err); }
};

const getMaintenanceFrequency = async (req, res, next) => {
  try {
    const data = await MaintenanceRequest.findAll({
      attributes: [
        [fn('DATE_FORMAT', col('raised_on'), '%Y-%m'), 'month'],
        [fn('COUNT', col('MaintenanceRequest.id')), 'count'],
      ],
      group: [literal("DATE_FORMAT(raised_on, '%Y-%m')")],
      order: [[literal('month'), 'ASC']],
      raw: true,
      limit: 12,
    });
    return successResponse(res, 200, { data });
  } catch (err) { next(err); }
};

const getDepartmentAllocation = async (req, res, next) => {
  try {
    const departments = await Department.findAll({
      attributes: ['id', 'name',
        [fn('COUNT', col('assets.id')), 'assetCount'],
      ],
      include: [{ model: Asset, as: 'assets', attributes: [] }],
      group: ['Department.id'],
      order: [[literal('assetCount'), 'DESC']],
      subQuery: false,
    });
    return successResponse(res, 200, { departments });
  } catch (err) { next(err); }
};

const getBookingHeatmap = async (req, res, next) => {
  try {
    const data = await ResourceBooking.findAll({
      attributes: [
        [fn('DAYOFWEEK', col('start_time')), 'dayOfWeek'],
        [fn('HOUR', col('start_time')), 'hour'],
        [fn('COUNT', col('id')), 'count'],
      ],
      where: { status: { [Op.in]: ['Upcoming', 'Ongoing', 'Completed'] } },
      group: [literal('DAYOFWEEK(start_time)'), literal('HOUR(start_time)')],
      raw: true,
    });
    return successResponse(res, 200, { data });
  } catch (err) { next(err); }
};

module.exports = { getOverviewStats, getAssetUtilization, getMaintenanceFrequency, getDepartmentAllocation, getBookingHeatmap };
