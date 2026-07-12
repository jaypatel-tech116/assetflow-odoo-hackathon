/**
 * Auth service — real API calls to the Express backend.
 * Base URL comes from VITE_API_URL env var, defaults to http://localhost:5000/api
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

/**
 * Login user with email and password.
 * On success, stores JWT in localStorage.
 *
 * @param {{ email: string, password: string }} credentials
 * @returns {{ success: boolean, user?: object, token?: string, message?: string }}
 */
export const loginUser = async ({ email, password }) => {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      // Store JWT in localStorage
      localStorage.setItem('assetflow_token', data.token);
      localStorage.setItem('assetflow_user', JSON.stringify(data.user));

      return {
        success: true,
        user: data.user,
        token: data.token,
        message: data.message,
      };
    }

    // Backend returned an error
    return {
      success: false,
      message: data.message || 'Login failed. Please try again.',
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      message: 'Unable to connect to the server. Please check your connection.',
    };
  }
};

/**
 * Register a new user (always as Employee).
 * Does NOT auto-login — user is redirected to login page.
 *
 * @param {{ fullName: string, email: string, password: string, confirmPassword: string }} userData
 * @returns {{ success: boolean, user?: object, message?: string }}
 */
export const registerUser = async ({ fullName, email, password, confirmPassword }) => {
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: fullName,
        email,
        password,
        confirm_password: confirmPassword,
      }),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      return {
        success: true,
        user: data.user,
        message: data.message || 'Account created successfully',
      };
    }

    // Backend returned an error
    return {
      success: false,
      message: data.message || 'Registration failed. Please try again.',
    };
  } catch (error) {
    console.error('Registration error:', error);
    return {
      success: false,
      message: 'Unable to connect to the server. Please check your connection.',
    };
  }
};

/**
 * Get stored auth token.
 */
export const getToken = () => {
  return localStorage.getItem('assetflow_token');
};

/**
 * Get stored user data.
 */
export const getUser = () => {
  const user = localStorage.getItem('assetflow_user');
  return user ? JSON.parse(user) : null;
};

/**
 * Log out — clear stored auth data.
 */
export const logoutUser = () => {
  localStorage.removeItem('assetflow_token');
  localStorage.removeItem('assetflow_user');
};
