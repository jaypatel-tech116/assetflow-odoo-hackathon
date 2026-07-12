import { apiGet } from './apiClient';
export const getOverviewStats = () => apiGet('/reports/overview');
export const getAssetUtilization = () => apiGet('/reports/asset-utilization');
export const getMaintenanceFrequency = () => apiGet('/reports/maintenance-frequency');
export const getDepartmentAllocation = () => apiGet('/reports/department-allocation');
export const getBookingHeatmap = () => apiGet('/reports/booking-heatmap');
