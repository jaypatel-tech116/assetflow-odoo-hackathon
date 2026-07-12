import axios from 'axios';

// Base API configuration
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const orgApi = axios.create({
  baseURL: `${API_URL}/organization`,
  withCredentials: true,
});

// Request interceptor to add JWT token if auth is implemented
orgApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- Departments ---
export const getDepartments = async () => {
  const res = await orgApi.get('/departments');
  return res.data;
};

export const createDepartment = async (data) => {
  const res = await orgApi.post('/departments', data);
  return res.data;
};

export const updateDepartment = async (id, data) => {
  const res = await orgApi.put(`/departments/${id}`, data);
  return res.data;
};

export const deleteDepartment = async (id) => {
  const res = await orgApi.delete(`/departments/${id}`);
  return res.data;
};

// --- Asset Categories ---
export const getCategories = async () => {
  const res = await orgApi.get('/categories');
  return res.data;
};

export const createCategory = async (data) => {
  const res = await orgApi.post('/categories', data);
  return res.data;
};

export const updateCategory = async (id, data) => {
  const res = await orgApi.put(`/categories/${id}`, data);
  return res.data;
};

export const deleteCategory = async (id) => {
  const res = await orgApi.delete(`/categories/${id}`);
  return res.data;
};

// --- Employees ---
export const getEmployees = async () => {
  const res = await orgApi.get('/employees');
  return res.data;
};

export const updateEmployeeRole = async (id, role) => {
  const res = await orgApi.put(`/employees/${id}/role`, { role });
  return res.data;
};

export const updateEmployeeStatus = async (id, status) => {
  const res = await orgApi.put(`/employees/${id}/status`, { status });
  return res.data;
};
