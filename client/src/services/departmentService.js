import { apiGet, apiPost, apiPut } from './apiClient';
export const getDepartments = () => apiGet('/departments');
export const getDepartmentById = (id) => apiGet(`/departments/${id}`);
export const createDepartment = (data) => apiPost('/departments', data);
export const updateDepartment = (id, data) => apiPut(`/departments/${id}`, data);
