import { apiGet, apiPost, apiPut } from './apiClient';
export const getAssets = (params = '') => apiGet(`/assets${params ? '?' + params : ''}`);
export const getAssetById = (id) => apiGet(`/assets/${id}`);
export const getAssetHistory = (id) => apiGet(`/assets/${id}/history`);
export const createAsset = (formData) => apiPost('/assets', formData, true);
export const updateAsset = (id, formData) => apiPut(`/assets/${id}`, formData, true);
