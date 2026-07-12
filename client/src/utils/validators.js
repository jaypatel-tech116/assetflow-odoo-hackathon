/**
 * Client-side validation utilities for AssetFlow auth forms.
 * Each function returns { valid: boolean, message: string }
 */

/**
 * Validate that a field is not empty.
 */
export const validateRequired = (value, fieldName = 'This field') => {
  if (!value || value.toString().trim() === '') {
    return { valid: false, message: `${fieldName} is required` };
  }
  return { valid: true, message: '' };
};

/**
 * Validate email format.
 */
export const validateEmail = (email) => {
  if (!email || email.trim() === '') {
    return { valid: false, message: 'Email is required' };
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return { valid: false, message: 'Please enter a valid email address' };
  }
  return { valid: true, message: '' };
};

/**
 * Validate password strength.
 * Returns an object with overall validity and individual check results.
 */
export const validatePassword = (password) => {
  const checks = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  };

  const allPassed = Object.values(checks).every(Boolean);

  let message = '';
  if (!allPassed) {
    if (!checks.minLength) message = 'Password must be at least 8 characters';
    else if (!checks.hasUppercase) message = 'Password must contain an uppercase letter';
    else if (!checks.hasNumber) message = 'Password must contain a number';
    else if (!checks.hasSpecialChar) message = 'Password must contain a special character';
  }

  return { valid: allPassed, message, checks };
};

/**
 * Validate that password and confirm password match.
 */
export const validatePasswordMatch = (password, confirmPassword) => {
  if (!confirmPassword) {
    return { valid: false, message: 'Please confirm your password' };
  }
  if (password !== confirmPassword) {
    return { valid: false, message: 'Passwords do not match' };
  }
  return { valid: true, message: '' };
};
