import { apiGet, apiPost, apiPut, apiPatch } from './apiClient';
export const getAuditCycles = (params = '') => apiGet(`/audits${params ? '?' + params : ''}`);
export const getAuditCycleById = (id) => apiGet(`/audits/${id}`);
export const createAuditCycle = (data) => apiPost('/audits', data);
export const updateAuditCycle = (id, data) => apiPut(`/audits/${id}`, data);
export const verifyAuditAsset = (cycleId, data) => apiPost(`/audits/${cycleId}/verify`, data);
export const closeAuditCycle = (id) => apiPatch(`/audits/${id}/close`);
export const getDiscrepancyReport = (id) => apiGet(`/audits/${id}/discrepancies`);
