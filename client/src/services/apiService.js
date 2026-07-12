/**
 * Central API service — all HTTP calls to the backend go through here.
 * Automatically attaches JWT from localStorage to every request.
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getHeaders = () => {
  const token = localStorage.getItem('assetflow_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const handleResponse = async (res) => {
  const data = await res.json();
  if (!res.ok) {
    // Token expired — redirect to login
    if (res.status === 401) {
      localStorage.removeItem('assetflow_token');
      localStorage.removeItem('assetflow_user');
      window.location.href = '/login';
    }
    throw new Error(data.message || 'Request failed');
  }
  return data;
};

// ─── Dashboard ───────────────────────────────────────────────────────────────
export const getDashboardStats = () =>
  fetch(`${API_URL}/dashboard/stats`, { headers: getHeaders() }).then(handleResponse);

export const getDashboardActivity = () =>
  fetch(`${API_URL}/dashboard/activity`, { headers: getHeaders() }).then(handleResponse);

// ─── User / Profile ──────────────────────────────────────────────────────────
export const getMyProfile = () =>
  fetch(`${API_URL}/users/me`, { headers: getHeaders() }).then(handleResponse);

export const updateMyProfile = (data) =>
  fetch(`${API_URL}/users/me`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(data) }).then(handleResponse);

export const changePassword = (data) =>
  fetch(`${API_URL}/users/me/password`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(data) }).then(handleResponse);

// ─── Assets ──────────────────────────────────────────────────────────────────
export const getAssets = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return fetch(`${API_URL}/assets${qs ? `?${qs}` : ''}`, { headers: getHeaders() }).then(handleResponse);
};

export const getAsset = (id) =>
  fetch(`${API_URL}/assets/${id}`, { headers: getHeaders() }).then(handleResponse);

export const createAsset = (data) =>
  fetch(`${API_URL}/assets`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) }).then(handleResponse);

export const updateAsset = (id, data) =>
  fetch(`${API_URL}/assets/${id}`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(data) }).then(handleResponse);

export const deleteAsset = (id) =>
  fetch(`${API_URL}/assets/${id}`, { method: 'DELETE', headers: getHeaders() }).then(handleResponse);

// ─── Requests ────────────────────────────────────────────────────────────────
export const getRequests = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return fetch(`${API_URL}/requests${qs ? `?${qs}` : ''}`, { headers: getHeaders() }).then(handleResponse);
};

export const createRequest = (data) =>
  fetch(`${API_URL}/requests`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) }).then(handleResponse);

export const approveRequest = (id, notes = '') =>
  fetch(`${API_URL}/requests/${id}/approve`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify({ notes }) }).then(handleResponse);

export const rejectRequest = (id, notes = '') =>
  fetch(`${API_URL}/requests/${id}/reject`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify({ notes }) }).then(handleResponse);

// ─── Resources ───────────────────────────────────────────────────────────────
export const getResources = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return fetch(`${API_URL}/resources${qs ? `?${qs}` : ''}`, { headers: getHeaders() }).then(handleResponse);
};

export const checkResourceAvailability = (resourceId, date) =>
  fetch(`${API_URL}/resources/${resourceId}/availability?date=${date}`, { headers: getHeaders() }).then(handleResponse);

// ─── Bookings ────────────────────────────────────────────────────────────────
export const getBookings = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return fetch(`${API_URL}/bookings${qs ? `?${qs}` : ''}`, { headers: getHeaders() }).then(handleResponse);
};

export const createBooking = (data) =>
  fetch(`${API_URL}/bookings`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) }).then(handleResponse);

export const cancelBooking = (id) =>
  fetch(`${API_URL}/bookings/${id}`, { method: 'DELETE', headers: getHeaders() }).then(handleResponse);

// ─── Notifications ───────────────────────────────────────────────────────────
export const getNotifications = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return fetch(`${API_URL}/notifications${qs ? `?${qs}` : ''}`, { headers: getHeaders() }).then(handleResponse);
};

export const markNotificationRead = (id) =>
  fetch(`${API_URL}/notifications/${id}/read`, { method: 'PUT', headers: getHeaders() }).then(handleResponse);

export const markAllNotificationsRead = () =>
  fetch(`${API_URL}/notifications/read-all`, { method: 'PUT', headers: getHeaders() }).then(handleResponse);
