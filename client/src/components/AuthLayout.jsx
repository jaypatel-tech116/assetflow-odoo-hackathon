import './AuthLayout.css';

/**
 * Split-screen authentication layout.
 * Left panel: branding, tagline, feature list.
 * Right panel: form content (children).
 */
export default function AuthLayout({ children }) {
  return (
    <div className="auth-layout">
      {/* Left Panel — Branding */}
      <div className="auth-left">
        <div className="auth-left-content">
          {/* Logo */}
          <div className="auth-logo">
            <div className="auth-logo-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L4 6V12C4 16.42 7.4 20.74 12 22C16.6 20.74 20 16.42 20 12V6L12 2Z" fill="white" opacity="0.3"/>
                <path d="M12 5L7 7.5V12C7 15.04 9.16 18.06 12 19C14.84 18.06 17 15.04 17 12V7.5L12 5Z" fill="white"/>
                <path d="M10 12L11.5 13.5L14.5 10.5" stroke="#1a0e3e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="auth-logo-text">
              <span className="auth-logo-name">Asset<span className="auth-logo-highlight">Flow</span></span>
              <span className="auth-logo-tagline">Enterprise Asset & Resource<br />Management System</span>
            </div>
          </div>

          {/* Headline */}
          <div className="auth-headline">
            <h1>Smart Assets.<br /><span className="auth-headline-accent">Stronger Organization.</span></h1>
            <p className="auth-subtitle">
              Track, manage and optimize your organization's assets and resources in one powerful platform.
            </p>
          </div>

          {/* Feature List */}
          <div className="auth-features">
            <div className="auth-feature">
              <div className="auth-feature-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M8 12l2 2 4-4"/>
                </svg>
              </div>
              <div>
                <strong>Complete Asset Lifecycle Management</strong>
                <span>Track from procurement to retirement</span>
              </div>
            </div>
            <div className="auth-feature">
              <div className="auth-feature-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
              </div>
              <div>
                <strong>Real-time Insights & Analytics</strong>
                <span>Make data-driven decisions</span>
              </div>
            </div>
            <div className="auth-feature">
              <div className="auth-feature-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 00-3-3.87"/>
                  <path d="M16 3.13a4 4 0 010 7.75"/>
                </svg>
              </div>
              <div>
                <strong>Role-based Access Control</strong>
                <span>Secure. Scalable. Reliable.</span>
              </div>
            </div>
            <div className="auth-feature">
              <div className="auth-feature-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 01-3.46 0"/>
                </svg>
              </div>
              <div>
                <strong>Smart Alerts & Notifications</strong>
                <span>Never miss what matters</span>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative gradient overlay at bottom */}
        <div className="auth-left-gradient" />
      </div>

      {/* Right Panel — Form */}
      <div className="auth-right">
        <div className="auth-right-inner">
          {children}
        </div>
      </div>
    </div>
  );
}
