import { apiGet, apiPost, apiPut } from './apiClient';
export const getCategories = () => apiGet('/categories');
export const getCategoryById = (id) => apiGet(`/categories/${id}`);
export const createCategory = (data) => apiPost('/categories', data);
export const updateCategory = (id, data) => apiPut(`/categories/${id}`, data);
