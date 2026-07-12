import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import Input from '../components/Input';
import Button from '../components/Button';
import { registerUser } from '../services/authService';
import { validateEmail, validatePassword, validatePasswordMatch, validateRequired } from '../utils/validators';
import './Register.css';

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Live password strength checks
  const passwordChecks = formData.password
    ? validatePassword(formData.password).checks
    : { minLength: false, hasUppercase: false, hasNumber: false, hasSpecialChar: false };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear field error on change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (serverError) setServerError('');
    if (successMessage) setSuccessMessage('');
  };

  const validateForm = () => {
    const newErrors = {};

    const nameCheck = validateRequired(formData.fullName, 'Full Name');
    if (!nameCheck.valid) newErrors.fullName = nameCheck.message;

    const emailCheck = validateEmail(formData.email);
    if (!emailCheck.valid) newErrors.email = emailCheck.message;

    const passwordCheck = validatePassword(formData.password);
    if (!passwordCheck.valid) newErrors.password = passwordCheck.message;

    const matchCheck = validatePasswordMatch(formData.password, formData.confirmPassword);
    if (!matchCheck.valid) newErrors.confirmPassword = matchCheck.message;

    if (!agreedToTerms) {
      newErrors.terms = 'You must agree to the Terms of Service and Privacy Policy';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setSuccessMessage('');

    if (!validateForm()) return;

    setLoading(true);
    try {
      const result = await registerUser({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });

      if (result.success) {
        // Redirect to login with success message
        navigate('/login', {
          state: { message: 'Account created successfully! Please sign in.' },
        });
      } else {
        setServerError(result.message || 'Registration failed. Please try again.');
      }
    } catch {
      setServerError('Something went wrong. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="register-card">
        {/* Logo Icon */}
        <div className="register-logo-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2"/>
            <circle cx="8.5" cy="7" r="4"/>
            <line x1="20" y1="8" x2="20" y2="14"/>
            <line x1="23" y1="11" x2="17" y2="11"/>
          </svg>
        </div>

        <h1 className="register-title">Create Your Account</h1>
        <p className="register-subtitle">Join AssetFlow and simplify asset management</p>

        {/* Server Error */}
        {serverError && (
          <div className="register-server-error">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {serverError}
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="register-success">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <path d="M8 12l2 2 4-4"/>
            </svg>
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <Input
            id="register-fullname"
            name="fullName"
            label="Full Name"
            type="text"
            placeholder="Enter your full name"
            value={formData.fullName}
            onChange={handleChange}
            error={errors.fullName}
            required
            autoComplete="name"
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4-4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            }
          />

          <Input
            id="register-email"
            name="email"
            label="Email Address"
            type="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            required
            autoComplete="email"
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2"/>
                <path d="M22 7l-10 6L2 7"/>
              </svg>
            }
          />

          <Input
            id="register-password"
            name="password"
            label="Password"
            type="password"
            placeholder="Create a strong password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            required
            autoComplete="new-password"
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0110 0v4"/>
              </svg>
            }
          />

          <Input
            id="register-confirm-password"
            name="confirmPassword"
            label="Confirm Password"
            type="password"
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            required
            autoComplete="new-password"
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0110 0v4"/>
              </svg>
            }
          />

          {/* Password Strength Checklist */}
          {formData.password && (
            <div className="register-password-checks">
              <p className="register-password-checks-title">Password must contain:</p>
              <div className="register-password-checks-grid">
                <span className={`register-check ${passwordChecks.minLength ? 'register-check--pass' : ''}`}>
                  {passwordChecks.minLength ? '✓' : '○'} At least 8 characters
                </span>
                <span className={`register-check ${passwordChecks.hasUppercase ? 'register-check--pass' : ''}`}>
                  {passwordChecks.hasUppercase ? '✓' : '○'} One uppercase letter (A–Z)
                </span>
                <span className={`register-check ${passwordChecks.hasNumber ? 'register-check--pass' : ''}`}>
                  {passwordChecks.hasNumber ? '✓' : '○'} One number (0–9)
                </span>
                <span className={`register-check ${passwordChecks.hasSpecialChar ? 'register-check--pass' : ''}`}>
                  {passwordChecks.hasSpecialChar ? '✓' : '○'} One special character (!@#...)
                </span>
              </div>
            </div>
          )}

          {/* Terms Checkbox */}
          <div className={`register-terms ${errors.terms ? 'register-terms--error' : ''}`}>
            <label className="register-terms-label" htmlFor="agree-terms">
              <input
                type="checkbox"
                id="agree-terms"
                checked={agreedToTerms}
                onChange={(e) => {
                  setAgreedToTerms(e.target.checked);
                  if (errors.terms) setErrors((prev) => ({ ...prev, terms: '' }));
                }}
              />
              <span className="register-checkbox-custom" />
              I agree to the{' '}
              <a href="#terms" className="register-terms-link">Terms of Service</a>
              {' '}and{' '}
              <a href="#privacy" className="register-terms-link">Privacy Policy</a>
            </label>
            {errors.terms && <span className="register-terms-error">{errors.terms}</span>}
          </div>

          <Button
            id="register-submit"
            type="submit"
            loading={loading}
            disabled={loading}
          >
            Create Account
          </Button>
        </form>

        <p className="register-switch">
          Already have an account?{' '}
          <Link to="/login" className="register-switch-link">Sign in</Link>
        </p>
      </div>
    </AuthLayout>
  );
}


