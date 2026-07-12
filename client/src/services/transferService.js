import { apiGet, apiPost, apiPatch } from './apiClient';
export const getTransfers = (params = '') => apiGet(`/transfers${params ? '?' + params : ''}`);
export const createTransferRequest = (data) => apiPost('/transfers', data);
export const approveTransfer = (id) => apiPatch(`/transfers/${id}/approve`);
export const rejectTransfer = (id) => apiPatch(`/transfers/${id}/reject`);
