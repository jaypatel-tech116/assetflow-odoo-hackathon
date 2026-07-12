import { getUser } from '../services/authService';
import './DashboardLayout.css';

export default function Topbar({ title, subtitle, searchPlaceholder = 'Search...' }) {
  const user = getUser();
  const initials = user?.full_name
    ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'RS';
  const displayName = user?.full_name || 'Rahul Sharma';
  const displayRole = user?.role || 'Department Head';

  return (
    <div className="topbar">
      <div className="topbar-title">
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      <div className="topbar-spacer" />
      <div className="topbar-search">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input type="text" placeholder={searchPlaceholder} />
      </div>
      <div className="topbar-icon-btn">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 01-3.46 0" />
        </svg>
        <span className="topbar-notif-badge">6</span>
      </div>
      <div className="topbar-user">
        <div className="topbar-user-avatar">{initials}</div>
        <div className="topbar-user-info">
          <h4>{displayName}</h4>
          <span>{displayRole}</span>
        </div>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{color:'#9ca3af'}}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
    </div>
  );
}
