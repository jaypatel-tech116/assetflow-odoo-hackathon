/**
 * Employee service — API calls to /api/employee/* endpoints.
 * All requests include JWT from localStorage.
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getHeaders = () => {
  const token = localStorage.getItem('assetflow_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

const handleResponse = async (response) => {
  const data = await response.json();
  if (response.ok && data.success) {
    return data;
  }
  throw new Error(data.message || 'Request failed');
};

// --- Dashboard ---
export const getDashboardStats = async () => {
  const res = await fetch(`${API_URL}/employee/dashboard`, { headers: getHeaders() });
  return handleResponse(res);
};

// --- Assets ---
export const getMyAssets = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_URL}/employee/assets?${query}`, { headers: getHeaders() });
  return handleResponse(res);
};

// --- Bookings ---
export const getMyBookings = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_URL}/employee/bookings?${query}`, { headers: getHeaders() });
  return handleResponse(res);
};

export const createBooking = async (bookingData) => {
  const res = await fetch(`${API_URL}/employee/bookings`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(bookingData),
  });
  return handleResponse(res);
};

export const cancelBooking = async (id) => {
  const res = await fetch(`${API_URL}/employee/bookings/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  return handleResponse(res);
};

// --- Maintenance Requests ---
export const getMyMaintenanceRequests = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_URL}/employee/maintenance?${query}`, { headers: getHeaders() });
  return handleResponse(res);
};

export const createMaintenanceRequest = async (data) => {
  const res = await fetch(`${API_URL}/employee/maintenance`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
};

// --- Transfer / Return Requests ---
export const getMyTransferRequests = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_URL}/employee/transfers?${query}`, { headers: getHeaders() });
  return handleResponse(res);
};

export const createTransferRequest = async (data) => {
  const res = await fetch(`${API_URL}/employee/transfers`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
};

export const createReturnRequest = async (data) => {
  const res = await fetch(`${API_URL}/employee/returns`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
};

// --- Notifications ---
export const getMyNotifications = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_URL}/employee/notifications?${query}`, { headers: getHeaders() });
  return handleResponse(res);
};

export const markNotificationRead = async (id) => {
  const res = await fetch(`${API_URL}/employee/notifications/${id}/read`, {
    method: 'PATCH',
    headers: getHeaders(),
  });
  return handleResponse(res);
};

export const markAllNotificationsRead = async () => {
  const res = await fetch(`${API_URL}/employee/notifications/read-all`, {
    method: 'PATCH',
    headers: getHeaders(),
  });
  return handleResponse(res);
};

// --- Resources ---
export const getAvailableResources = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_URL}/employee/resources?${query}`, { headers: getHeaders() });
  return handleResponse(res);
};

// --- Profile ---
export const getProfile = async () => {
  const res = await fetch(`${API_URL}/employee/profile`, { headers: getHeaders() });
  return handleResponse(res);
};

export const updateProfile = async (data) => {
  const res = await fetch(`${API_URL}/employee/profile`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
};

export const changePassword = async (data) => {
  const res = await fetch(`${API_URL}/employee/profile/password`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
};
