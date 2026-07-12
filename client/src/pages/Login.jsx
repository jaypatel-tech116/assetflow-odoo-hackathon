import { useState } from 'react';
<<<<<<< HEAD
<<<<<<< HEAD
import { Link, useNavigate } from 'react-router-dom';
=======
import { Link } from 'react-router-dom';
>>>>>>> origin/prince
=======
import { Link } from 'react-router-dom';
>>>>>>> origin/jay
import AuthLayout from '../components/AuthLayout';
import Input from '../components/Input';
import Button from '../components/Button';
import { loginUser } from '../services/authService';
<<<<<<< HEAD
<<<<<<< HEAD
import { useAuth } from '../context/AuthContext';
=======
>>>>>>> origin/prince
=======
>>>>>>> origin/jay
import { validateEmail, validateRequired } from '../utils/validators';
import './Login.css';

export default function Login() {
<<<<<<< HEAD
<<<<<<< HEAD
  const { login } = useAuth();
  const navigate = useNavigate();
=======
>>>>>>> origin/prince
=======
>>>>>>> origin/jay
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear field error on change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (serverError) setServerError('');
  };

  const validateForm = () => {
    const newErrors = {};

    const emailCheck = validateEmail(formData.email);
    if (!emailCheck.valid) newErrors.email = emailCheck.message;

    const passwordCheck = validateRequired(formData.password, 'Password');
    if (!passwordCheck.valid) newErrors.password = passwordCheck.message;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validateForm()) return;

    setLoading(true);
    try {
      const result = await loginUser({
        email: formData.email,
        password: formData.password,
      });

      if (result.success) {
        // JWT stored in localStorage by authService
<<<<<<< HEAD
<<<<<<< HEAD
        login(result.user, result.token);
        navigate('/dashboard');
=======
        window.location.href = '/dashboard';

>>>>>>> origin/prince
=======
        // Future: redirect to dashboard
        window.location.href = '/';
>>>>>>> origin/jay
      } else {
        setServerError(result.message || 'Login failed. Please try again.');
      }
    } catch {
      setServerError('Something went wrong. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="login-card">
        {/* Logo Icon */}
        <div className="login-logo-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L4 6V12C4 16.42 7.4 20.74 12 22C16.6 20.74 20 16.42 20 12V6L12 2Z" fill="#6c3ce0" opacity="0.2"/>
            <path d="M12 5L7 7.5V12C7 15.04 9.16 18.06 12 19C14.84 18.06 17 15.04 17 12V7.5L12 5Z" fill="#6c3ce0"/>
            <path d="M10 12L11.5 13.5L14.5 10.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        <h1 className="login-title">Welcome Back!</h1>
        <p className="login-subtitle">Sign in to continue to AssetFlow</p>

        {/* Server Error */}
        {serverError && (
          <div className="login-server-error">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <Input
            id="login-email"
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
            id="login-password"
            name="password"
            label="Password"
            type="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            required
            autoComplete="current-password"
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0110 0v4"/>
              </svg>
            }
          />

          <div className="login-options">
            <label className="login-remember" htmlFor="remember-me">
              <input
                type="checkbox"
                id="remember-me"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span className="login-checkbox-custom" />
              Remember me
            </label>
            <Link to="/forgot-password" className="login-forgot">Forgot Password?</Link>
          </div>

          <Button
            id="login-submit"
            type="submit"
            loading={loading}
            disabled={loading}
          >
            Sign In
          </Button>
        </form>

        <div className="login-divider">
          <span>or</span>
        </div>

        <p className="login-switch">
          Don't have an account?{' '}
          <Link to="/register" className="login-switch-link">Sign Up</Link>
        </p>

        <p className="login-footer">© 2024 AssetFlow. All rights reserved.</p>
      </div>
    </AuthLayout>
  );
}
