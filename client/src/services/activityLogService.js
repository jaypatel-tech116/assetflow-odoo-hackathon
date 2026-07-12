import { apiGet } from './apiClient';
export const getActivityLogs = (params = '') => apiGet(`/activity-logs${params ? '?' + params : ''}`);
export const getActivityLogModules = () => apiGet('/activity-logs/modules');
