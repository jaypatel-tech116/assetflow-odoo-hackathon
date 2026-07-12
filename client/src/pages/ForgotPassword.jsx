import { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import Input from '../components/Input';
import Button from '../components/Button';
import { forgotPassword } from '../services/authService';
import { validateEmail } from '../utils/validators';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [devToken, setDevToken] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setDevToken('');

    const emailCheck = validateEmail(email);
    if (!emailCheck.valid) {
      setError(emailCheck.message);
      return;
    }

    setLoading(true);
    const r = await forgotPassword(email);
    setLoading(false);

    if (r.success) {
      setSuccessMsg('A password reset link has been generated.');
      if (r.resetToken) {
        setDevToken(r.resetToken);
      }
    } else {
      setError(r.message || 'Something went wrong. Please try again.');
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

        <h1 className="login-title">Reset Password</h1>
        <p className="login-subtitle">Enter your email and we'll help you reset your password</p>

        {error && <div className="login-server-error">{error}</div>}
        {successMsg && <div className="form-success" style={{ marginBottom: 16 }}>{successMsg}</div>}

        {devToken && (
          <div className="form-success" style={{ wordBreak: 'break-all', fontSize: '11.5px', marginBottom: 16 }}>
            <strong>Dev Mode Reset Link:</strong><br />
            <Link to={`/reset-password?token=${devToken}`}>Click here to reset password</Link>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <Input
            id="forgot-email"
            name="email"
            label="Email Address"
            type="email"
            placeholder="Enter your registered email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2"/>
                <path d="M22 7l-10 6L2 7"/>
              </svg>
            }
          />

          <Button type="submit" loading={loading} disabled={loading}>
            Send Reset Link
          </Button>
        </form>

        <p className="login-switch" style={{ marginTop: 24 }}>
          Remembered password?{' '}
          <Link to="/login" className="login-switch-link">Sign In</Link>
        </p>
      </div>
    </AuthLayout>
  );
}
