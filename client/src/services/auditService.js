<<<<<<< HEAD
import { apiGet, apiPost, apiPut, apiPatch } from './apiClient';
export const getAuditCycles = (params = '') => apiGet(`/audits${params ? '?' + params : ''}`);
export const getAuditCycleById = (id) => apiGet(`/audits/${id}`);
export const createAuditCycle = (data) => apiPost('/audits', data);
export const updateAuditCycle = (id, data) => apiPut(`/audits/${id}`, data);
export const verifyAuditAsset = (cycleId, data) => apiPost(`/audits/${cycleId}/verify`, data);
export const closeAuditCycle = (id) => apiPatch(`/audits/${id}/close`);
export const getDiscrepancyReport = (id) => apiGet(`/audits/${id}/discrepancies`);
=======
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: `${API_URL}/audit`,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getCycles = async () => {
  const res = await api.get('/cycles');
  return res.data;
};

export const createCycle = async (data) => {
  const res = await api.post('/cycles', data);
  return res.data;
};

export const getDiscrepancies = async (cycleId) => {
  const params = cycleId ? { cycleId } : {};
  const res = await api.get('/discrepancies', { params });
  return res.data;
};
>>>>>>> origin/kashyap
