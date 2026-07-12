import { apiGet, apiPatch } from './apiClient';
export const getNotifications = (params = '') => apiGet(`/notifications${params ? '?' + params : ''}`);
export const getUnreadCount = () => apiGet('/notifications/unread-count');
export const markAsRead = (id) => apiPatch(`/notifications/${id}/read`);
export const markAllAsRead = () => apiPatch('/notifications/read-all');
