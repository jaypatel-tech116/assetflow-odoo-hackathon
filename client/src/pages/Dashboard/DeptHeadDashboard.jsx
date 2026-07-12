import { useState, useEffect } from 'react';
import { getDashboardStats, getDashboardActivity, getRequests, getBookings, approveRequest, rejectRequest } from '../../services/apiService';
import './Dashboard.css';

function DonutChart({ data, total }) {
  if (!data || data.length === 0) return <div style={{width:140,height:140,borderRadius:'50%',background:'#f3f4f6',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,color:'#9ca3af'}}>No data</div>;
  const colors = ['#4f46e5','#22c55e','#f97316','#a855f7','#6b7280','#ef4444','#3b82f6'];
  const r = 54; const cx = 70; const cy = 70;
  const circumference = 2 * Math.PI * r;
  let offset = 0;
  const segments = data.map((d, i) => {
    const pct = d.count / total;
    const dash = pct * circumference;
    const seg = { ...d, dash, gap: circumference - dash, offset, color: colors[i % colors.length] };
    offset += dash;
    return seg;
  });
  return (
    <svg width="140" height="140" viewBox="0 0 140 140">
      {segments.map((s, i) => (
        <circle key={i} cx={cx} cy={cy} r={r} fill="transparent" stroke={s.color} strokeWidth="18"
          strokeDasharray={`${s.dash} ${s.gap}`} strokeDashoffset={-s.offset}
          transform={`rotate(-90 ${cx} ${cy})`} strokeLinecap="butt" />
      ))}
      <circle cx={cx} cy={cy} r={r - 12} fill="white" />
    </svg>
  );
}

function Skeleton({ height = 16, width = '100%', style = {} }) {
  return <div style={{ height, width, borderRadius: 6, background: 'linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite', ...style }} />;
}

const COLORS = ['#4f46e5','#22c55e','#f97316','#a855f7','#6b7280'];

const quickActions = [
  { label: 'View All Assets', iconClass: 'qa-blue', icon: '📦', badge: null },
  { label: 'Approve Requests', iconClass: 'qa-green', icon: '✅', badge: null },
  { label: 'Book a Resource', iconClass: 'qa-purple', icon: '📅', badge: null },
  { label: 'Raise Maintenance Request', iconClass: 'qa-red', icon: '🔧', badge: null },
  { label: 'Transfer / Return Asset', iconClass: 'qa-orange', icon: '🔄', badge: null },
  { label: 'Generate Reports', iconClass: 'qa-indigo', icon: '📊', badge: null },
];

const typeIcon = { Transfer: '🔄', Return: '↩️', Maintenance: '🔧', Booking: '📅', 'New Asset': '📦' };
const typeBadgeClass = { Transfer: 'badge-transfer', Return: 'badge-return', Maintenance: 'badge-maintenance', Booking: 'badge-pending', 'New Asset': 'badge-new' };
const resourceIcon = { 'Meeting Room': '🏢', 'Conference Hall': '🏛️', Projector: '📽️', Vehicle: '🚗', 'Other Equipment': '📦' };

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState({ recentRequests: [], recentBookings: [] });
  const [requests, setRequests] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [statsRes, activityRes, requestsRes, bookingsRes] = await Promise.all([
        getDashboardStats(),
        getDashboardActivity(),
        getRequests({ status: 'Pending', limit: 4 }),
        getBookings({ status: 'Upcoming', limit: 3 }),
      ]);
      setStats(statsRes.stats);
      setActivity(activityRes);
      setRequests(requestsRes.requests || []);
      setBookings(bookingsRes.bookings || []);
    } catch (err) {
      console.error('Dashboard load error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleApprove = async (id) => {
    setActionLoading(p => ({ ...p, [id]: true }));
    try { await approveRequest(id); fetchAll(); } catch (e) { alert(e.message); }
    setActionLoading(p => ({ ...p, [id]: false }));
  };

  const handleReject = async (id) => {
    setActionLoading(p => ({ ...p, [id]: true }));
    try { await rejectRequest(id); fetchAll(); } catch (e) { alert(e.message); }
    setActionLoading(p => ({ ...p, [id]: false }));
  };

  const s = stats || {};
  const catData = stats ? [] : [];
  const breakdown = activity.categoryBreakdown || [];
  const totalAssets = s.totalAssets || 0;

  const statCards = [
    { label: 'Total Assets', sub: 'In Department', value: s.totalAssets ?? '—', link: 'View Assets', color: 'blue', icon: '📦' },
    { label: 'Approval Requests', sub: 'Pending', value: s.pendingRequests ?? '—', link: 'View Requests', color: 'green', icon: '✅' },
    { label: 'Upcoming Bookings', sub: 'Scheduled', value: s.upcomingBookings ?? '—', link: 'View Bookings', color: 'orange', icon: '📅' },
    { label: 'Under Maintenance', sub: 'Not available', value: s.underMaintenance ?? '—', link: 'View Assets', color: 'purple', icon: '🔧' },
    { label: 'Notifications', sub: 'Unread', value: s.unreadNotifications ?? '—', link: 'View All', color: 'red', icon: '🔔' },
  ];

  return (
    <>
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
      
      <div className="page-content">
        <div className="dash-page">

          {/* Stat Cards */}
          <div className="stat-cards">
            {statCards.map((s, i) => (
              <div className="stat-card" key={i}>
                <div className="stat-card-top">
                  <div>
                    <div className="stat-card-label">{s.label}</div>
                    <div className="stat-card-sub">{s.sub}</div>
                  </div>
                  <div className={`stat-card-icon ${s.color}`} style={{fontSize:20}}>{s.icon}</div>
                </div>
                <div className="stat-card-value">{loading ? <Skeleton height={28} width={60} /> : s.value}</div>
                <a className="stat-card-link" href="#">{s.link} →</a>
              </div>
            ))}
          </div>

          {/* Middle Grid */}
          <div className="dash-grid">
            {/* Requests */}
            <div className="dash-card">
              <div className="dash-card-header">
                <h3>Requests Awaiting Your Approval</h3>
                <a className="view-all-link" href="#">View All</a>
              </div>
              <div className="request-list">
                {loading ? (
                  [1,2,3].map(i => (
                    <div className="request-item" key={i} style={{gridTemplateColumns:'44px 1fr auto'}}>
                      <Skeleton height={40} width={40} style={{borderRadius:8}} />
                      <div style={{display:'flex',flexDirection:'column',gap:6}}>
                        <Skeleton height={14} width="70%" />
                        <Skeleton height={11} width="50%" />
                      </div>
                      <Skeleton height={28} width={80} />
                    </div>
                  ))
                ) : requests.length === 0 ? (
                  <div style={{padding:'24px',textAlign:'center',color:'#9ca3af',fontSize:'13px'}}>
                    ✅ No pending requests
                  </div>
                ) : (
                  requests.map((r) => (
                    <div className="request-item" key={r.id}>
                      <div className="request-img" style={{fontSize:20}}>{typeIcon[r.type] || '📋'}</div>
                      <div className="request-info">
                        <h4>{r.type} Request — {r.request_id}</h4>
                        <p>{r.employee?.full_name} • {r.reason}</p>
                        {r.asset && <p style={{fontSize:'11px',color:'#9ca3af'}}>{r.asset.name} ({r.asset.tag})</p>}
                      </div>
                      <span className={`request-type-badge ${typeBadgeClass[r.type]}`}>{r.type}</span>
                      <span className="request-date">{new Date(r.created_at).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</span>
                      <div className="action-btns">
                        <button className="action-btn approve" disabled={actionLoading[r.id]} onClick={() => handleApprove(r.id)}>✓</button>
                        <button className="action-btn reject" disabled={actionLoading[r.id]} onClick={() => handleReject(r.id)}>✕</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {!loading && requests.length > 0 && (
                <div style={{padding:'10px 18px',fontSize:'11px',color:'#9ca3af',borderTop:'1px solid #f3f4f6'}}>
                  Showing {requests.length} of {s.pendingRequests || requests.length} pending requests
                </div>
              )}
            </div>

            {/* Asset Breakdown Donut */}
            <div className="dash-card">
              <div className="dash-card-header">
                <h3>Department Assets Overview</h3>
                <a className="view-all-link" href="#">View Report</a>
              </div>
              <div className="donut-section">
                <div className="donut-wrapper">
                  <div className="donut-svg-wrap">
                    {loading ? (
                      <Skeleton height={140} width={140} style={{borderRadius:'50%'}} />
                    ) : (
                      <DonutChart data={breakdown} total={totalAssets} />
                    )}
                    {!loading && (
                      <div className="donut-center">
                        <div className="donut-center-num">{totalAssets}</div>
                        <div className="donut-center-label">Total Assets</div>
                      </div>
                    )}
                  </div>
                  <div className="donut-legend">
                    {loading ? [1,2,3,4,5].map(i=><Skeleton key={i} height={14} width={160} style={{marginBottom:6}} />) :
                      breakdown.map((d, i) => (
                        <div className="legend-item" key={i}>
                          <span className="legend-dot" style={{background: COLORS[i % COLORS.length]}} />
                          <span className="legend-name">{d.category}</span>
                          <span className="legend-count">{d.count}</span>
                          <span className="legend-pct">({Math.round(d.count / totalAssets * 100)}%)</span>
                        </div>
                      ))
                    }
                  </div>
                </div>
              </div>
              <div className="asset-status-row">
                {[
                  { label: 'Allocated', value: s.allocatedAssets, cls: 'in-use' },
                  { label: 'Maintenance', value: s.underMaintenance, cls: 'maintenance' },
                  { label: 'Available', value: s.availableAssets, cls: 'not-in-use' },
                  { label: 'Lost', value: s.lostAssets, cls: 'due-return' },
                ].map((a, i) => (
                  <div className={`asset-chip ${a.cls}`} key={i}>
                    <span className="asset-chip-num">{loading ? '—' : (a.value ?? 0)}</span>
                    <span className="asset-chip-label">{a.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="dash-card">
              <div className="dash-card-header"><h3>Quick Actions</h3></div>
              <div className="quick-actions-list">
                {quickActions.map((qa, i) => (
                  <div className="quick-action-item" key={i}>
                    <div className={`quick-action-icon ${qa.iconClass}`} style={{fontSize:15}}>{qa.icon}</div>
                    <span className="quick-action-label">{qa.label}</span>
                    {s.pendingRequests && qa.label === 'Approve Requests' && (
                      <span className="quick-action-badge">{s.pendingRequests}</span>
                    )}
                    <svg className="quick-action-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Row */}
          <div className="dash-bottom">
            {/* Upcoming Bookings */}
            <div className="dash-card">
              <div className="dash-card-header">
                <h3>Upcoming Bookings</h3>
                <a className="view-all-link" href="#">View All</a>
              </div>
              {loading ? [1,2,3].map(i=>(
                <div className="booking-item" key={i}>
                  <Skeleton height={40} width={56} style={{borderRadius:8}} />
                  <div style={{display:'flex',flexDirection:'column',gap:5}}>
                    <Skeleton height={13} width="60%" />
                    <Skeleton height={11} width="40%" />
                  </div>
                </div>
              )) : bookings.length === 0 ? (
                <div style={{padding:'24px',textAlign:'center',color:'#9ca3af',fontSize:'13px'}}>No upcoming bookings</div>
              ) : bookings.map((b, i) => (
                <div className="booking-item" key={i}>
                  <div className="booking-thumb" style={{fontSize:22}}>
                    {resourceIcon[b.resource?.type] || '🏢'}
                  </div>
                  <div className="booking-info">
                    <h4>{b.resource?.name || 'Resource'}</h4>
                    <div className="booking-meta">
                      <span>{b.purpose}</span>
                      <span>📅 {new Date(b.booking_date).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})} &nbsp; {b.start_time?.slice(0,5)} - {b.end_time?.slice(0,5)}</span>
                    </div>
                  </div>
                  <span className="request-type-badge badge-upcoming">{b.status}</span>
                </div>
              ))}
            </div>

            {/* Recent Activity */}
            <div className="dash-card">
              <div className="dash-card-header">
                <h3>Recent Activity</h3>
                <a className="view-all-link" href="#">View All</a>
              </div>
              {loading ? [1,2,3,4,5].map(i=>(
                <div className="activity-item" key={i}>
                  <Skeleton height={28} width={28} style={{borderRadius:'50%',flexShrink:0}} />
                  <div style={{flex:1,display:'flex',flexDirection:'column',gap:5}}>
                    <Skeleton height={12} width="80%" />
                    <Skeleton height={10} width="40%" />
                  </div>
                </div>
              )) : activity.recentRequests?.length === 0 ? (
                <div style={{padding:'24px',textAlign:'center',color:'#9ca3af',fontSize:'13px'}}>No recent activity</div>
              ) : activity.recentRequests?.map((r, i) => (
                <div className="activity-item" key={i}>
                  <div className="activity-dot blue" style={{fontSize:13}}>{typeIcon[r.type] || '📋'}</div>
                  <div className="activity-info">
                    <p>{r.employee?.full_name} submitted {r.type} request {r.request_id}</p>
                    <div className="activity-time">{new Date(r.created_at).toLocaleString('en-IN',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Department Summary */}
            <div className="dash-card">
              <div className="dash-card-header">
                <h3>Department Summary</h3>
                <span style={{fontSize:'11px',color:'#6b7280'}}>All Time</span>
              </div>
              {[
                { icon: '📦', label: 'Total Assets', value: s.totalAssets ?? '—', cls: '' },
                { icon: '✅', label: 'Allocated', value: s.allocatedAssets ?? '—', cls: 'green' },
                { icon: '📤', label: 'Available', value: s.availableAssets ?? '—', cls: '' },
                { icon: '🔧', label: 'Under Maintenance', value: s.underMaintenance ?? '—', cls: '' },
                { icon: '❌', label: 'Lost', value: s.lostAssets ?? '—', cls: 'red' },
                { icon: '🗑️', label: 'Retired', value: s.retiredAssets ?? '—', cls: '' },
              ].map((row, i) => (
                <div className="summary-row" key={i}>
                  <span className="summary-label"><span style={{fontSize:13}}>{row.icon}</span>{row.label}</span>
                  <span className={`summary-value ${row.cls}`}>{loading ? '—' : row.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Banner */}
          <div className="dept-banner">
            <div className="dept-banner-left">
              <div className="dept-banner-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <div className="dept-banner-text">
                <h3>Keep Your Department Secure &amp; Organized</h3>
                <p>Ensure timely approvals, regular maintenance and optimal utilization of department resources.</p>
              </div>
            </div>
            <button className="dept-banner-btn">View Department Policy →</button>
          </div>

        </div>
      </div>
    </>
  );
}

