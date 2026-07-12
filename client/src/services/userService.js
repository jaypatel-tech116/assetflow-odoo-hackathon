import { apiGet, apiPatch } from './apiClient';
export const getUsers = (params = '') => apiGet(`/users${params ? '?' + params : ''}`);
export const getUserById = (id) => apiGet(`/users/${id}`);
export const updateUserRole = (id, role) => apiPatch(`/users/${id}/role`, { role });
export const updateUserStatus = (id, status) => apiPatch(`/users/${id}/status`, { status });
export const updateUserDepartment = (id, department_id) => apiPatch(`/users/${id}/department`, { department_id });
