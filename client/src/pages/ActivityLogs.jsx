import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { getLogs, getNotifications, markNotificationsRead } from '../services/activityService';
import './ActivityLogs.css';

export default function ActivityLogs() {
  const [logs, setLogs] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [userFilter, setUserFilter] = useState('All Users');
  const [roleFilter, setRoleFilter] = useState('All Roles');
  const [moduleFilter, setModuleFilter] = useState('All Modules');
  const [dateRange, setDateRange] = useState('May 1, 2024 - May 20, 2024');
  
  // Notification Tabs
  const [notifTab, setNotifTab] = useState('All');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [logsRes, notifsRes] = await Promise.all([
        getLogs({ user: userFilter, role: roleFilter, module: moduleFilter, dateRange }),
        getNotifications()
      ]);
      if (logsRes.success) setLogs(logsRes.logs);
      if (notifsRes.success) setNotifications(notifsRes.notifications);
    } catch (error) {
      console.error('Failed to fetch activity data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = () => {
    fetchData();
  };

  const handleResetFilters = () => {
    setUserFilter('All Users');
    setRoleFilter('All Roles');
    setModuleFilter('All Modules');
    setDateRange('May 1, 2024 - May 20, 2024');
    setTimeout(fetchData, 0);
  };

  const handleMarkAllRead = async () => {
    try {
      await markNotificationsRead();
      // Optimistically update UI
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
    } catch (error) {
      console.error('Failed to mark read', error);
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ', ' + 
           d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const getActionStyle = (action) => {
    switch (action) {
      case 'Created': return { color: '#10b981', bg: '#d1fae5' };
      case 'Updated': return { color: '#3b82f6', bg: '#dbeafe' };
      case 'Deactivated':
      case 'Deleted': return { color: '#ef4444', bg: '#fee2e2' };
      case 'Approved': return { color: '#10b981', bg: '#d1fae5' };
      case 'Requested': return { color: '#f59e0b', bg: '#fef3c7' };
      case 'Allocated':
      case 'Booked': return { color: '#4f46e5', bg: '#e0e7ff' };
      default: return { color: '#6b7280', bg: '#f3f4f6' };
    }
  };

  const getNotifIcon = (type) => {
    switch (type) {
      case 'success':
        return <div className="notif-icon" style={{background: '#dbeafe', color: '#3b82f6'}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg></div>;
      case 'warning':
        return <div className="notif-icon" style={{background: '#ffedd5', color: '#f97316'}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div>;
      case 'danger':
        return <div className="notif-icon" style={{background: '#fee2e2', color: '#ef4444'}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg></div>;
      case 'info':
      default:
        return <div className="notif-icon" style={{background: '#e0e7ff', color: '#4f46e5'}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg></div>;
    }
  };

  const filteredNotifs = notifications.filter(n => {
    if (notifTab === 'Unread') return !n.is_read;
    if (notifTab === 'Important') return n.is_important;
    return true; // All
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const importantCount = notifications.filter(n => n.is_important).length;

  return (
    <DashboardLayout>
      <div className="reports-header-container">
        <div>
          <h1 className="reports-title">Activity Logs & Notifications</h1>
          <p className="reports-subtitle">Track system activities and stay updated with important alerts.</p>
        </div>
        <div style={{display: 'flex', gap: '20px', alignItems: 'center'}}>
          <button className="reports-btn-reset" style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12H3"/><path d="M21 6H3"/><path d="M21 18H3"/></svg>
            Activity Logs
          </button>
          <button style={{background: 'transparent', border: 'none', display: 'flex', gap: '8px', alignItems: 'center', color: '#6b7280', fontSize: '13.5px', fontWeight: 600, cursor: 'pointer'}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            Notifications <span style={{background: '#e0e7ff', color: '#4f46e5', padding: '2px 6px', borderRadius: '10px', fontSize: '11px'}}>{unreadCount}</span>
          </button>
        </div>
      </div>

      <div className="reports-filters">
        <div className="filter-group">
          <label>User</label>
          <select value={userFilter} onChange={e => setUserFilter(e.target.value)}>
            <option>All Users</option>
            <option>Prince Roy</option>
            <option>Amit Joshi</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Role</label>
          <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
            <option>All Roles</option>
            <option>Administrator</option>
            <option>Asset Manager</option>
            <option>Employee</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Module</label>
          <select value={moduleFilter} onChange={e => setModuleFilter(e.target.value)}>
            <option>All Modules</option>
            <option>Department</option>
            <option>Employee</option>
            <option>Maintenance</option>
            <option>Asset</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Date Range</label>
          <div className="filter-input-with-icon">
            <input type="text" value={dateRange} onChange={e => setDateRange(e.target.value)} />
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          </div>
        </div>
        <div className="filter-actions">
          <button className="reports-btn-primary" onClick={handleApplyFilters}>Apply Filters</button>
          <button className="reports-btn-reset" onClick={handleResetFilters}>Reset</button>
          <button className="reports-btn-reset" style={{marginLeft: '16px', display: 'flex', alignItems: 'center', gap: '8px'}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export Logs
          </button>
        </div>
      </div>

      <div className="org-split-layout">
        {/* Left Side: Activity Logs Table */}
        <div className="reports-card" style={{padding: '0'}}>
          <div className="reports-card-header" style={{padding: '24px 24px 0 24px'}}>
            <h3>Activity Logs</h3>
          </div>
          
          {loading ? (
            <div className="loading" style={{padding: '40px'}}>Loading...</div>
          ) : (
            <div style={{overflowX: 'auto'}}>
              <table className="mini-table alt-table" style={{width: '100%', borderCollapse: 'collapse', marginTop: '16px'}}>
                <thead>
                  <tr>
                    <th style={{paddingLeft: '24px'}}>Timestamp</th>
                    <th>User</th>
                    <th>Role</th>
                    <th>Action</th>
                    <th>Module</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log, idx) => {
                    const actionStyle = getActionStyle(log.action);
                    return (
                      <tr key={idx}>
                        <td style={{paddingLeft: '24px', whiteSpace: 'nowrap'}}>{formatDate(log.timestamp)}</td>
                        <td>
                          <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                            <div style={{width: 24, height: 24, borderRadius: '50%', background: '#4f46e5', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold'}}>
                              {log.user ? log.user.full_name.substring(0, 2).toUpperCase() : 'SU'}
                            </div>
                            <span style={{fontWeight: 500, color: '#111827'}}>{log.user ? log.user.full_name : 'System User'}</span>
                          </div>
                        </td>
                        <td>{log.role}</td>
                        <td>
                          <span style={{
                            color: actionStyle.color, 
                            backgroundColor: actionStyle.bg,
                            padding: '4px 8px', 
                            borderRadius: '12px', 
                            fontSize: '11px', 
                            fontWeight: 600
                          }}>
                            {log.action}
                          </span>
                        </td>
                        <td>{log.module}</td>
                        <td style={{color: '#4b5563'}}>{log.details}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
          
          <div style={{padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', color: '#6b7280', borderTop: '1px solid #f3f4f6'}}>
            <span>Showing 1 to {logs.length} of 50 entries</span>
            <div style={{display: 'flex', gap: '4px'}}>
              <button style={{width: 32, height: 32, borderRadius: '6px', border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer'}}>&lt;</button>
              <button style={{width: 32, height: 32, borderRadius: '6px', border: '1px solid #4f46e5', background: '#4f46e5', color: '#fff', cursor: 'pointer'}}>1</button>
              <button style={{width: 32, height: 32, borderRadius: '6px', border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer'}}>2</button>
              <button style={{width: 32, height: 32, borderRadius: '6px', border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer'}}>3</button>
              <button style={{width: 32, height: 32, borderRadius: '6px', border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer'}}>4</button>
              <button style={{width: 32, height: 32, borderRadius: '6px', border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer'}}>5</button>
              <button style={{width: 32, height: 32, borderRadius: '6px', border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer'}}>&gt;</button>
            </div>
          </div>

          {/* Action types legend */}
          <div style={{padding: '16px 24px', borderTop: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: '12px'}}>
            <span style={{fontSize: '13px', fontWeight: 600, color: '#374151'}}>Action Types:</span>
            {['Created', 'Updated', 'Deleted/Deactivated', 'Approved', 'Requested', 'Allocated/Booked'].map(action => {
              const style = getActionStyle(action.split('/')[0]);
              return (
                <span key={action} style={{color: style.color, backgroundColor: style.bg, padding: '4px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600}}>
                  {action}
                </span>
              )
            })}
          </div>
        </div>

        {/* Right Side: Notifications */}
        <div className="reports-card" style={{padding: '24px 0'}}>
          <div style={{padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
            <h3 style={{margin: 0, fontSize: '16px', fontWeight: 600, color: '#111827'}}>Notifications</h3>
            <button onClick={handleMarkAllRead} style={{background: 'none', border: 'none', color: '#4f46e5', fontSize: '13px', fontWeight: 500, cursor: 'pointer'}}>Mark all as read</button>
          </div>

          <div style={{display: 'flex', gap: '20px', padding: '0 24px', borderBottom: '1px solid #e5e7eb', marginBottom: '16px'}}>
            <button 
              className={`notif-tab ${notifTab === 'All' ? 'active' : ''}`}
              onClick={() => setNotifTab('All')}
            >
              All ({notifications.length})
            </button>
            <button 
              className={`notif-tab ${notifTab === 'Unread' ? 'active' : ''}`}
              onClick={() => setNotifTab('Unread')}
            >
              Unread ({unreadCount})
            </button>
            <button 
              className={`notif-tab ${notifTab === 'Important' ? 'active' : ''}`}
              onClick={() => setNotifTab('Important')}
            >
              Important ({importantCount})
            </button>
          </div>

          <div className="notif-list">
            {filteredNotifs.length === 0 ? (
              <div style={{padding: '24px', textAlign: 'center', color: '#6b7280'}}>No notifications.</div>
            ) : (
              filteredNotifs.map((n, idx) => (
                <div key={idx} className={`notif-item ${!n.is_read ? 'unread' : ''}`}>
                  {getNotifIcon(n.type)}
                  <div className="notif-content">
                    <div className="notif-title-row">
                      <h4>{n.title}</h4>
                      <span className="notif-time">
                        {new Date(n.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        {!n.is_read && <div className="unread-dot"></div>}
                      </span>
                    </div>
                    <p>{n.message}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="view-all-link" style={{padding: '16px 24px 0 24px', borderTop: '1px solid #f3f4f6'}}>
            <a href="#">View All Notifications &rarr;</a>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
