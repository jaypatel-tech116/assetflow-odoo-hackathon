import { apiGet } from './apiClient';
export const getDashboardData = () => apiGet('/dashboard');
