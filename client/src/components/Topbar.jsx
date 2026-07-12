<<<<<<< HEAD
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
=======
import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiGet, apiPatch } from '../services/apiClient';
import './Topbar.css';

const breadcrumbMap = {
  '/dashboard': ['Dashboard'],
  '/organization': ['Organization Setup'],
  '/assets': ['Asset Directory'],
  '/assets/register': ['Asset Directory', 'Register Asset'],
  '/allocations': ['Allocation & Transfer'],
  '/bookings': ['Resource Booking'],
  '/maintenance': ['Maintenance Management'],
  '/audits': ['Asset Audit'],
  '/reports': ['Reports & Analytics'],
  '/activity-logs': ['Activity Logs'],
};

export default function Topbar({ onToggleSidebar }) {
  const { user, logout, updateUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifRef = useRef(null);
  const userMenuRef = useRef(null);

  // Get breadcrumb
  const pathKey = Object.keys(breadcrumbMap).find(key => location.pathname.startsWith(key)) || '/dashboard';
  const crumbs = breadcrumbMap[pathKey] || ['Dashboard'];

  useEffect(() => {
    const fetchUnread = async () => {
      const result = await apiGet('/notifications/unread-count');
      if (result.success) setUnreadCount(result.unreadCount);
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false);
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setShowUserMenu(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleNotificationClick = async () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) {
      const result = await apiGet('/notifications?limit=10');
      if (result.success) setNotifications(result.notifications);
    }
  };

  const handleMarkAllRead = async () => {
    await apiPatch('/notifications/read-all');
    setUnreadCount(0);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleRoleChange = async (newRole) => {
    const result = await apiPatch('/auth/self-role', { role: newRole });
    if (result.success) {
      localStorage.setItem('assetflow_token', result.token);
      updateUser(result.user);
      window.location.reload();
    }
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="topbar-hamburger-btn" onClick={onToggleSidebar} aria-label="Toggle Navigation Menu">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
        <div className="topbar-breadcrumb">
          {crumbs.map((crumb, idx) => (
            <span key={idx}>
              {idx > 0 && <span className="topbar-breadcrumb-sep">/</span>}
              <span className={idx === crumbs.length - 1 ? 'topbar-breadcrumb-active' : 'topbar-breadcrumb-item'}>
                {crumb}
              </span>
            </span>
          ))}
        </div>
      </div>

      <div className="topbar-center">
        <div className="topbar-search">
          <svg className="topbar-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            placeholder="Search assets, users, bookings..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="topbar-search-input"
          />
        </div>
      </div>

      <div className="topbar-right">
        {/* Notification Bell */}
        <div className="topbar-notif-wrapper" ref={notifRef}>
          <button className="topbar-icon-btn" onClick={handleNotificationClick}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>
            </svg>
            {unreadCount > 0 && <span className="topbar-notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
          </button>

          {showNotifications && (
            <div className="topbar-notif-dropdown">
              <div className="topbar-notif-header">
                <h4>Notifications</h4>
                {unreadCount > 0 && (
                  <button className="topbar-notif-mark-all" onClick={handleMarkAllRead}>Mark all read</button>
                )}
              </div>
              <div className="topbar-notif-list">
                {notifications.length === 0 ? (
                  <div className="topbar-notif-empty">No notifications</div>
                ) : (
                  notifications.map((n) => (
                    <div key={n.id} className={`topbar-notif-item ${!n.is_read ? 'topbar-notif-item--unread' : ''}`}>
                      <p className="topbar-notif-message">{n.message}</p>
                      <span className="topbar-notif-time">{new Date(n.created_at).toLocaleString()}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="topbar-user-wrapper" ref={userMenuRef}>
          <button className="topbar-user-btn" onClick={() => setShowUserMenu(!showUserMenu)}>
            <div className="topbar-avatar">{getInitials(user?.full_name)}</div>
            <div className="topbar-user-info">
              <span className="topbar-user-name">{user?.full_name || 'User'}</span>
              <span className="topbar-user-role">{user?.role || 'Employee'}</span>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>

          {showUserMenu && (
            <div className="topbar-user-dropdown">
              <div className="topbar-user-dropdown-section">
                <span className="dropdown-label">Testing Role Switcher</span>
                <select
                  value={user?.role || 'Employee'}
                  onChange={(e) => handleRoleChange(e.target.value)}
                  className="dropdown-role-select"
                >
                  <option>Employee</option>
                  <option>Department Head</option>
                  <option>Asset Manager</option>
                  <option>Admin</option>
                </select>
              </div>
              <div className="dropdown-divider" />
              <button className="topbar-user-dropdown-item" onClick={handleLogout}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
>>>>>>> origin/jay
  );
}
