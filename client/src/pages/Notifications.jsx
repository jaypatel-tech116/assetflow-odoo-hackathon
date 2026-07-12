import { useState, useEffect } from 'react';
<<<<<<< HEAD
import { getMyNotifications, markNotificationRead, markAllNotificationsRead } from '../services/employeeService';
import './Notifications.css';
=======
import Topbar from '../components/Topbar';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../services/apiService';
import './Dashboard.css';

function Skeleton({ h = 16, w = '100%', style = {} }) {
  return <div style={{ height: h, width: w, borderRadius: 6, background: 'linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite', ...style }} />;
}

const typeConfig = {
  success: { bg: '#f0fdf4', icon: '✅' },
  info:    { bg: '#eff6ff', icon: 'ℹ️' },
  warning: { bg: '#fefce8', icon: '⚠️' },
  error:   { bg: '#fef2f2', icon: '❌' },
};
>>>>>>> origin/prince

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
<<<<<<< HEAD
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
=======
  const [markingAll, setMarkingAll] = useState(false);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await getNotifications({ limit: 50 });
      setNotifications(res.notifications || []);
      setUnreadCount(res.unreadCount || 0);
    } catch (err) {
      console.error('Notifications error:', err.message);
>>>>>>> origin/prince
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotifications(); }, []);

  const handleMarkRead = async (id) => {
    try {
      await markNotificationRead(id);
<<<<<<< HEAD
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
=======
      setNotifications(ns => ns.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount(c => Math.max(0, c - 1));
    } catch (err) { console.error(err.message); }
  };

  const handleMarkAll = async () => {
    setMarkingAll(true);
    try {
      await markAllNotificationsRead();
      setNotifications(ns => ns.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) { alert(err.message); }
    setMarkingAll(false);
  };

  return (
    <>
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
      <Topbar title="Notifications" subtitle="Stay updated with all your department activity." searchPlaceholder="Search notifications..." />
      <div className="page-content">
        <div style={{display:'flex',flexDirection:'column',gap:'14px'}}>

          {/* Header row */}
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <span style={{fontSize:'13px',color:'#6b7280'}}>
              You have <strong style={{color:'#4f46e5'}}>{unreadCount} unread</strong> notifications
            </span>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAll}
                disabled={markingAll}
                style={{border:'none',background:'transparent',color:'#4f46e5',fontSize:'12.5px',fontWeight:600,cursor:'pointer',opacity:markingAll?0.6:1}}
              >
                {markingAll ? 'Marking...' : 'Mark All as Read'}
              </button>
            )}
          </div>

          {/* Notification list */}
          <div style={{background:'#fff',borderRadius:'12px',border:'1px solid #f0f1f5',boxShadow:'0 1px 4px rgba(0,0,0,0.04)',overflow:'hidden'}}>
            {loading ? (
              [1,2,3,4,5,6].map(i => (
                <div key={i} style={{display:'flex',alignItems:'flex-start',gap:14,padding:'16px 20px',borderBottom:'1px solid #f9fafb'}}>
                  <Skeleton h={40} w={40} style={{borderRadius:'50%',flexShrink:0}} />
                  <div style={{flex:1,display:'flex',flexDirection:'column',gap:6}}>
                    <Skeleton h={13} w="70%" />
                    <Skeleton h={11} w="90%" />
                    <Skeleton h={10} w="40%" />
                  </div>
                </div>
              ))
            ) : notifications.length === 0 ? (
              <div style={{padding:'48px',textAlign:'center',color:'#9ca3af'}}>
                <div style={{fontSize:40,marginBottom:12}}>🔔</div>
                <p style={{fontSize:'13px'}}>No notifications yet</p>
              </div>
            ) : (
              notifications.map((n, i) => {
                const cfg = typeConfig[n.type] || typeConfig.info;
                return (
                  <div
                    key={n.id}
                    style={{
                      display:'flex', alignItems:'flex-start', gap:14,
                      padding:'16px 20px',
                      borderBottom: i < notifications.length-1 ? '1px solid #f9fafb' : 'none',
                      background: !n.is_read ? '#fafbff' : '#fff',
                      cursor: !n.is_read ? 'pointer' : 'default',
                      transition:'background 0.15s',
                    }}
                    onClick={() => !n.is_read && handleMarkRead(n.id)}
                  >
                    <div style={{width:40,height:40,borderRadius:'50%',background:cfg.bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}}>
                      {cfg.icon}
                    </div>
                    <div style={{flex:1}}>
                      <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4}}>
                        <span style={{fontSize:'13px',fontWeight:600,color:'#111827'}}>{n.title}</span>
                        {!n.is_read && <span style={{width:8,height:8,borderRadius:'50%',background:'#4f46e5',display:'inline-block',flexShrink:0}} />}
                      </div>
                      <p style={{fontSize:'12px',color:'#6b7280',lineHeight:1.5,margin:0,marginBottom:4}}>{n.body}</p>
                      <span style={{fontSize:'11px',color:'#9ca3af'}}>
                        {new Date(n.created_at).toLocaleString('en-IN',{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'})}
                      </span>
                    </div>
                    {!n.is_read && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleMarkRead(n.id); }}
                        style={{border:'1px solid #e5e7eb',borderRadius:6,padding:'4px 10px',background:'#fff',fontSize:'11px',color:'#6b7280',cursor:'pointer',flexShrink:0,whiteSpace:'nowrap'}}
                      >
                        Mark read
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>

        </div>
      </div>
    </>
>>>>>>> origin/prince
  );
}
