import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import Input from '../components/Input';
import Button from '../components/Button';
import { resetPassword } from '../services/authService';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!token) {
      setError('Invalid reset session: token is missing.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    const r = await resetPassword(token, password, confirmPassword);
    setLoading(false);

    if (r.success) {
      setSuccessMsg('Your password has been successfully reset! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } else {
      setError(r.message || 'Token is invalid or expired.');
    }
  };

  return (
    <AuthLayout>
      <div className="login-card">
        <div className="login-logo-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L4 6V12C4 16.42 7.4 20.74 12 22C16.6 20.74 20 16.42 20 12V6L12 2Z" fill="#6c3ce0" opacity="0.2"/>
            <path d="M12 5L7 7.5V12C7 15.04 9.16 18.06 12 19C14.84 18.06 17 15.04 17 12V7.5L12 5Z" fill="#6c3ce0"/>
            <path d="M10 12L11.5 13.5L14.5 10.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        <h1 className="login-title">Set New Password</h1>
        <p className="login-subtitle">Create a secure password for your AssetFlow account</p>

        {error && <div className="login-server-error">{error}</div>}
        {successMsg && <div className="form-success" style={{ marginBottom: 16 }}>{successMsg}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <Input
            id="reset-pass"
            name="password"
            label="New Password"
            type="password"
            placeholder="Enter at least 8 characters"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0110 0v4"/>
              </svg>
            }
          />

          <Input
            id="reset-confirm"
            name="confirmPassword"
            label="Confirm New Password"
            type="password"
            placeholder="Re-enter password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            required
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0110 0v4"/>
              </svg>
            }
          />

          <Button type="submit" loading={loading} disabled={loading}>
            Reset Password
          </Button>
        </form>
      </div>
    </AuthLayout>
  );
}
