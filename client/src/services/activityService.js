import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: `${API_URL}/activity`,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getLogs = async (params) => {
  const res = await api.get('/logs', { params });
  return res.data;
};

export const getNotifications = async () => {
  const res = await api.get('/notifications');
  return res.data;
};

export const markNotificationsRead = async () => {
  const res = await api.put('/notifications/read-all');
  return res.data;
};
