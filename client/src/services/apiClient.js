/**
 * Centralized API client — wraps fetch with auth headers and error handling.
 * All service files should use this instead of raw fetch.
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('assetflow_token');
  return {
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

const handleResponse = async (response) => {
  const data = await response.json();

  if (response.status === 401) {
    // Token expired or invalid — clear auth and redirect
    localStorage.removeItem('assetflow_token');
    localStorage.removeItem('assetflow_user');
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
    return { success: false, message: data.message || 'Session expired. Please log in again.' };
  }

  return data;
};

export const apiGet = async (endpoint) => {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'GET',
      headers: { ...getAuthHeaders() },
    });
    return await handleResponse(response);
  } catch (error) {
    console.error(`GET ${endpoint} failed:`, error);
    return { success: false, message: 'Unable to connect to the server.' };
  }
};

export const apiPost = async (endpoint, body, isFormData = false) => {
  try {
    const headers = { ...getAuthHeaders() };
    if (!isFormData) headers['Content-Type'] = 'application/json';

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: isFormData ? body : JSON.stringify(body),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error(`POST ${endpoint} failed:`, error);
    return { success: false, message: 'Unable to connect to the server.' };
  }
};

export const apiPut = async (endpoint, body, isFormData = false) => {
  try {
    const headers = { ...getAuthHeaders() };
    if (!isFormData) headers['Content-Type'] = 'application/json';

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'PUT',
      headers,
      body: isFormData ? body : JSON.stringify(body),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error(`PUT ${endpoint} failed:`, error);
    return { success: false, message: 'Unable to connect to the server.' };
  }
};

export const apiPatch = async (endpoint, body = {}) => {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'PATCH',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error(`PATCH ${endpoint} failed:`, error);
    return { success: false, message: 'Unable to connect to the server.' };
  }
};

export const apiDelete = async (endpoint) => {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'DELETE',
      headers: { ...getAuthHeaders() },
    });
    return await handleResponse(response);
  } catch (error) {
    console.error(`DELETE ${endpoint} failed:`, error);
    return { success: false, message: 'Unable to connect to the server.' };
  }
};
