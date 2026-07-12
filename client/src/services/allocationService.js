import { apiGet, apiPost, apiPatch } from './apiClient';
export const getAllocations = (params = '') => apiGet(`/allocations${params ? '?' + params : ''}`);
export const getOverdueAllocations = () => apiGet('/allocations/overdue');
export const allocateAsset = (data) => apiPost('/allocations', data);
export const returnAsset = (id, data) => apiPatch(`/allocations/${id}/return`, data);
