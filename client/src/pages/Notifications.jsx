import { useState, useEffect } from 'react';
import { getMyNotifications, markNotificationRead, markAllNotificationsRead } from '../services/employeeService';
import './Notifications.css';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  const fetchNotifications = async (page = 1) => {
    setLoading(true);
    try {
      const data = await getMyNotifications({ page, limit: 20 });
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
      setPagination(data.pagination || { page: 1, totalPages: 1, total: 0 });
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotifications(); }, []);

  const handleMarkRead = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return (
          <div className="notif-page-icon notif-page-icon--success">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>
          </div>
        );
      case 'warning':
        return (
          <div className="notif-page-icon notif-page-icon--warning">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
          </div>
        );
      default:
        return (
          <div className="notif-page-icon notif-page-icon--info">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" /></svg>
          </div>
        );
    }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleString('en-US', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true,
    });
  };

  return (
    <div className="notifications-page">
      <div className="page-header">
        <div>
          <h1>Notifications</h1>
          <p>You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}</p>
        </div>
        {unreadCount > 0 && (
          <button className="btn-outline" onClick={handleMarkAllRead}>Mark All as Read</button>
        )}
      </div>

      <div className="notif-page-card">
        {loading ? (
          <div className="dash-loading" style={{ padding: '60px' }}><div className="dash-spinner" /></div>
        ) : notifications.length > 0 ? (
          <div className="notif-page-list">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className={`notif-page-item ${!notif.is_read ? 'notif-page-item--unread' : ''}`}
                onClick={() => !notif.is_read && handleMarkRead(notif.id)}
              >
                {getIcon(notif.type)}
                <div className="notif-page-content">
                  <p className="notif-page-message">{notif.message}</p>
                  <span className="notif-page-time">{formatTime(notif.created_at)}</span>
                </div>
                {!notif.is_read && <span className="notif-unread-dot" />}
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-row" style={{ padding: '60px', textAlign: 'center' }}>No notifications yet</div>
        )}

        {pagination.totalPages > 1 && (
          <div className="pagination">
            <span className="pagination-info">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <div className="pagination-btns">
              <button disabled={pagination.page <= 1} onClick={() => fetchNotifications(pagination.page - 1)}>‹</button>
              <button disabled={pagination.page >= pagination.totalPages} onClick={() => fetchNotifications(pagination.page + 1)}>›</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
