import { useState, useEffect } from 'react';
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

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await getNotifications({ limit: 50 });
      setNotifications(res.notifications || []);
      setUnreadCount(res.unreadCount || 0);
    } catch (err) {
      console.error('Notifications error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotifications(); }, []);

  const handleMarkRead = async (id) => {
    try {
      await markNotificationRead(id);
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
  );
}
