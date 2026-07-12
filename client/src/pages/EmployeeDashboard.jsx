import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getDashboardStats } from '../services/employeeService';
import './EmployeeDashboard.css';

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentAssets, setRecentAssets] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [recentMaintenance, setRecentMaintenance] = useState([]);
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const data = await getDashboardStats();
        setStats(data.stats);
        setRecentAssets(data.recentAssets || []);
        setRecentBookings(data.recentBookings || []);
        setRecentMaintenance(data.recentMaintenance || []);
        setRecentNotifications(data.recentNotifications || []);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const statCards = [
    {
      label: 'My Assets',
      count: stats?.myAssets ?? 0,
      sub: 'View all assigned assets',
      color: '#3b82f6',
      bg: 'rgba(59, 130, 246, 0.1)',
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
        </svg>
      ),
    },
    {
      label: 'Upcoming Returns',
      count: stats?.upcomingReturns ?? 0,
      sub: 'Due within 7 days',
      color: '#10b981',
      bg: 'rgba(16, 185, 129, 0.1)',
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
          <polyline points="1 4 1 10 7 10" />
          <path d="M3.51 15a9 9 0 102.13-9.36L1 10" />
        </svg>
      ),
    },
    {
      label: 'Active Bookings',
      count: stats?.activeBookings ?? 0,
      sub: 'View your bookings',
      color: '#8b5cf6',
      bg: 'rgba(139, 92, 246, 0.1)',
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      ),
    },
    {
      label: 'Maintenance Requests',
      count: stats?.maintenanceRequests ?? 0,
      sub: 'View request status',
      color: '#f59e0b',
      bg: 'rgba(245, 158, 11, 0.1)',
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
          <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
        </svg>
      ),
    },
    {
      label: 'Pending Transfers',
      count: stats?.pendingTransfers ?? 0,
      sub: 'No pending requests',
      color: '#ef4444',
      bg: 'rgba(239, 68, 68, 0.1)',
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
          <polyline points="17 1 21 5 17 9" />
          <path d="M3 11V9a4 4 0 014-4h14" />
          <polyline points="7 23 3 19 7 15" />
          <path d="M21 13v2a4 4 0 01-4 4H3" />
        </svg>
      ),
    },
  ];

  const formatDate = (dateStr) => {
    if (!dateStr) return '–';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const getDaysLeft = (dateStr) => {
    if (!dateStr) return null;
    const diff = Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return null;
    return `(${diff} days left)`;
  };

  const getStatusClass = (status) => {
    const map = {
      'Allocated': 'status-allocated',
      'Upcoming': 'status-upcoming',
      'Pending': 'status-pending',
      'Approved': 'status-approved',
      'Completed': 'status-completed',
      'In Progress': 'status-progress',
      'Resolved': 'status-resolved',
      'Rejected': 'status-rejected',
    };
    return map[status] || '';
  };

  const getCategoryClass = (category) => {
    const map = {
      'Laptop': 'cat-laptop',
      'Accessory': 'cat-accessory',
      'Monitor': 'cat-monitor',
      'Phone': 'cat-phone',
    };
    return map[category] || 'cat-other';
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return (
          <div className="notif-icon notif-icon--success">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>
          </div>
        );
      case 'warning':
        return (
          <div className="notif-icon notif-icon--warning">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
          </div>
        );
      default:
        return (
          <div className="notif-icon notif-icon--info">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" /></svg>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="dash-loading">
        <div className="dash-spinner" />
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="employee-dashboard">
      {/* Welcome Banner */}
      <div className="dash-welcome">
        <div>
          <h1 className="dash-welcome-title">
            Welcome back, {user?.full_name?.split(' ')[0] || 'User'}! 👋
          </h1>
          <p className="dash-welcome-sub">Here's what's happening with your assets today.</p>
        </div>
      </div>

      {/* Stat Cards Row */}
      <div className="dash-stats-row">
        {statCards.map((card, i) => (
          <div key={i} className="dash-stat-card" style={{ '--card-color': card.color, '--card-bg': card.bg }}>
            <div className="dash-stat-icon-wrap" style={{ background: card.bg }}>
              {card.icon}
            </div>
            <div className="dash-stat-info">
              <span className="dash-stat-label">{card.label}</span>
              <span className="dash-stat-count">{card.count}</span>
              <span className="dash-stat-sub">{card.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Two-column layout */}
      <div className="dash-grid">
        {/* My Assets */}
        <div className="dash-card">
          <div className="dash-card-header">
            <h2>My Assets</h2>
            <button className="dash-view-all" onClick={() => navigate('/my-assets')}>View All</button>
          </div>
          <div className="dash-table-wrap">
            <table className="dash-table">
              <thead>
                <tr>
                  <th>Asset Tag</th>
                  <th>Asset Name</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Return Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentAssets.length > 0 ? recentAssets.map((asset) => (
                  <tr key={asset.id}>
                    <td className="td-tag">{asset.asset_tag}</td>
                    <td>{asset.name}</td>
                    <td><span className={`badge-cat ${getCategoryClass(asset.category)}`}>{asset.category}</span></td>
                    <td><span className={`badge-status ${getStatusClass(asset.status)}`}>{asset.status}</span></td>
                    <td>
                      <span className={asset.return_date ? 'return-date' : ''}>
                        {formatDate(asset.return_date)}
                        {asset.return_date && <span className="days-left">{getDaysLeft(asset.return_date)}</span>}
                      </span>
                    </td>
                    <td>
                      <button className="action-btn" title="View">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="6" className="empty-row">No assets assigned yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <button className="dash-card-footer-link" onClick={() => navigate('/my-assets')}>
            View All My Assets →
          </button>
        </div>

        {/* My Bookings */}
        <div className="dash-card">
          <div className="dash-card-header">
            <h2>My Bookings</h2>
            <button className="dash-view-all" onClick={() => navigate('/book-resource')}>View Calendar</button>
          </div>
          <div className="dash-table-wrap">
            <table className="dash-table">
              <thead>
                <tr>
                  <th>Resource</th>
                  <th>Date & Time</th>
                  <th>Purpose</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.length > 0 ? recentBookings.map((booking) => (
                  <tr key={booking.id}>
                    <td>
                      <div className="resource-cell">
                        <span className="resource-icon">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6c3ce0" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /></svg>
                        </span>
                        {booking.resource?.name || 'Resource'}
                      </div>
                    </td>
                    <td>
                      <div>{formatDate(booking.booking_date)}</div>
                      <div className="time-sub">{booking.start_time} - {booking.end_time}</div>
                    </td>
                    <td>{booking.purpose}</td>
                    <td><span className={`badge-status ${getStatusClass(booking.status)}`}>{booking.status}</span></td>
                  </tr>
                )) : (
                  <tr><td colSpan="4" className="empty-row">No upcoming bookings</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <button className="dash-card-footer-link" onClick={() => navigate('/book-resource')}>
            View All Bookings →
          </button>
        </div>

        {/* Maintenance Requests */}
        <div className="dash-card">
          <div className="dash-card-header">
            <h2>Maintenance Requests</h2>
            <button className="dash-view-all" onClick={() => navigate('/maintenance-requests')}>View All</button>
          </div>
          <div className="dash-table-wrap">
            <table className="dash-table">
              <thead>
                <tr>
                  <th>Request ID</th>
                  <th>Asset</th>
                  <th>Issue</th>
                  <th>Status</th>
                  <th>Requested On</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentMaintenance.length > 0 ? recentMaintenance.map((req) => (
                  <tr key={req.id}>
                    <td className="td-tag">{req.request_id}</td>
                    <td>
                      <div>{req.asset?.name || '–'}</div>
                      <div className="time-sub">{req.asset?.asset_tag || ''}</div>
                    </td>
                    <td>{req.issue}</td>
                    <td><span className={`badge-status ${getStatusClass(req.status)}`}>{req.status}</span></td>
                    <td>{formatDate(req.requested_on)}</td>
                    <td>
                      <button className="action-btn" title="View">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="6" className="empty-row">No maintenance requests</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <button className="dash-card-footer-link" onClick={() => navigate('/maintenance-requests')}>
            Raise New Maintenance Request →
          </button>
        </div>

        {/* Recent Notifications */}
        <div className="dash-card">
          <div className="dash-card-header">
            <h2>Recent Notifications</h2>
            <button className="dash-view-all" onClick={() => navigate('/notifications')}>View All</button>
          </div>
          <div className="notif-list">
            {recentNotifications.length > 0 ? recentNotifications.map((notif) => (
              <div key={notif.id} className={`notif-item ${notif.is_read ? '' : 'notif-item--unread'}`}>
                {getNotificationIcon(notif.type)}
                <div className="notif-content">
                  <p className="notif-message">{notif.message}</p>
                  <span className="notif-time">{formatDate(notif.created_at)}</span>
                </div>
              </div>
            )) : (
              <div className="empty-row" style={{ padding: '24px', textAlign: 'center' }}>No notifications yet</div>
            )}
          </div>
          <button className="dash-card-footer-link" onClick={() => navigate('/notifications')}>
            View All Notifications →
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="dash-quick-actions">
        <h2>Quick Actions</h2>
        <div className="quick-actions-grid">
          <button className="quick-action-card" onClick={() => navigate('/book-resource')}>
            <div className="quick-action-icon" style={{ background: 'rgba(59, 130, 246, 0.1)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
            </div>
            <div>
              <strong>Book a Resource</strong>
              <span>Reserve rooms, vehicles, equipment</span>
            </div>
          </button>
          <button className="quick-action-card" onClick={() => navigate('/maintenance-requests')}>
            <div className="quick-action-icon" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" /></svg>
            </div>
            <div>
              <strong>Raise Maintenance</strong>
              <span>Report an issue with an asset</span>
            </div>
          </button>
          <button className="quick-action-card" onClick={() => navigate('/transfer-requests')}>
            <div className="quick-action-icon" style={{ background: 'rgba(139, 92, 246, 0.1)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2"><polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 014-4h14" /><polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 01-4 4H3" /></svg>
            </div>
            <div>
              <strong>Request Transfer</strong>
              <span>Request asset transfer</span>
            </div>
          </button>
          <button className="quick-action-card" onClick={() => navigate('/transfer-requests')}>
            <div className="quick-action-icon" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 102.13-9.36L1 10" /></svg>
            </div>
            <div>
              <strong>Request Return</strong>
              <span>Initiate asset return</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
