import { apiGet, apiPost, apiPatch } from './apiClient';
export const getBookings = (params = '') => apiGet(`/bookings${params ? '?' + params : ''}`);
export const getBookingById = (id) => apiGet(`/bookings/${id}`);
export const getResourceBookings = (assetId, start, end) => apiGet(`/bookings/resource/${assetId}?start=${start}&end=${end}`);
export const createBooking = (data) => apiPost('/bookings', data);
export const cancelBooking = (id) => apiPatch(`/bookings/${id}/cancel`);
