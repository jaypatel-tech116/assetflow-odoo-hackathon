<<<<<<< HEAD
import { useState, useEffect } from 'react';
import Topbar from '../components/Topbar';
import { getDashboardStats, getDashboardActivity, getRequests, getBookings, approveRequest, rejectRequest } from '../services/apiService';
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
      <Topbar title="Dashboard" subtitle="Welcome back! Here's an overview of your department." searchPlaceholder="Search assets, requests, bookings..." />
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
=======
import DashboardLayout from '../components/DashboardLayout';
import './Dashboard.css';

// SVG components for icons
const IconArrowUp = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"/></svg>
);
const IconArrowDown = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
);

const StatCard = ({ title, value, change, isDown, subtitle, icon, iconColor, iconBg }) => (
  <div className="dash-card stat-card">
    <div className="stat-card-header">
      <div className="stat-card-info">
        <h3 className="stat-card-title">{title}</h3>
        <div className="stat-card-value">{value}</div>
      </div>
      <div className="stat-card-icon" style={{ color: iconColor, backgroundColor: iconBg }}>
        {icon}
      </div>
    </div>
    <div className="stat-card-footer">
      {change && (
        <span className={`stat-card-change ${isDown ? 'negative' : 'positive'}`}>
          {isDown ? <IconArrowDown /> : <IconArrowUp />}
          {change}
        </span>
      )}
      <span className="stat-card-subtitle">{subtitle}</span>
    </div>
  </div>
);

// Basic SVG Donut Chart
const DonutChart = ({ data, size = 140, strokeWidth = 25 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  let cumulativePercent = 0;

  return (
    <div className="donut-chart-container" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        {data.map((slice, i) => {
          const strokeDasharray = `${(slice.percent / 100) * circumference} ${circumference}`;
          const strokeDashoffset = -1 * (cumulativePercent / 100) * circumference;
          cumulativePercent += slice.percent;
          return (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke={slice.color}
              strokeWidth={strokeWidth}
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
            />
          );
        })}
      </svg>
    </div>
  );
};

export default function Dashboard() {
  return (
    <DashboardLayout>
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Welcome back, Prince 👋</h1>
          <p className="dashboard-subtitle">Here's what's happening in your organization today.</p>
        </div>
        <div className="dashboard-date-picker">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          May 20, 2024
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
      </div>

      <div className="dash-grid-row-1">
        <StatCard
          title="Total Assets" value="210" change="8.2%" subtitle="vs last month"
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 7l10 5 10-5-10-5zm0 13l-10-5v5l10 5 10-5v-5l-10 5z"/></svg>}
          iconColor="#6366f1" iconBg="#e0e7ff"
        />
        <StatCard
          title="Assets Available" value="120" change="5.4%" subtitle="vs last month"
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>}
          iconColor="#10b981" iconBg="#d1fae5"
        />
        <StatCard
          title="Assets Allocated" value="65" change="3.1%" subtitle="vs last month"
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>}
          iconColor="#3b82f6" iconBg="#dbeafe"
        />
        <StatCard
          title="Maintenance Today" value="4" change="12.5%" isDown subtitle="vs yesterday"
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>}
          iconColor="#f59e0b" iconBg="#fef3c7"
        />
        <StatCard
          title="Active Bookings" value="10" change="11.1%" subtitle="vs last month"
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/></svg>}
          iconColor="#8b5cf6" iconBg="#ede9fe"
        />
      </div>

      <div className="dash-grid-row-2">
        <StatCard
          title="Pending Transfers" value="6" change="14.3%" isDown subtitle="vs last month"
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/></svg>}
          iconColor="#06b6d4" iconBg="#cffafe"
        />
        <StatCard
          title="Upcoming Returns" value="8" subtitle="Due this week"
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
          iconColor="#ef4444" iconBg="#fee2e2"
        />
        <StatCard
          title="Total Departments" value="12" change="9.1%" subtitle="vs last month"
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"/><rect x="9" y="9" width="6" height="6"/></svg>}
          iconColor="#3b82f6" iconBg="#dbeafe"
        />
        <StatCard
          title="Total Employees" value="358" change="6.3%" subtitle="vs last month"
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
          iconColor="#10b981" iconBg="#d1fae5"
        />
      </div>

      <div className="dash-grid-col-3">
        {/* Assets by Status */}
        <div className="dash-card">
          <div className="dash-card-header">
            <h3 className="dash-card-title">Assets by Status</h3>
            <a href="#" className="dash-link">View Report</a>
          </div>
          <div className="donut-widget">
            <DonutChart data={[
              { percent: 57.1, color: '#10b981' },
              { percent: 31.0, color: '#3b82f6' },
              { percent: 4.8, color: '#8b5cf6' },
              { percent: 1.9, color: '#f59e0b' },
              { percent: 1.4, color: '#ef4444' },
              { percent: 2.4, color: '#6b7280' },
              { percent: 1.4, color: '#9ca3af' }
            ]} />
            <div className="donut-legend">
              <div className="legend-item"><span className="dot" style={{background: '#10b981'}}></span>Available <span className="legend-val">120 (57.1%)</span></div>
              <div className="legend-item"><span className="dot" style={{background: '#3b82f6'}}></span>Allocated <span className="legend-val">65 (31.0%)</span></div>
              <div className="legend-item"><span className="dot" style={{background: '#8b5cf6'}}></span>Reserved <span className="legend-val">10 (4.8%)</span></div>
              <div className="legend-item"><span className="dot" style={{background: '#f59e0b'}}></span>Under Maintenance <span className="legend-val">4 (1.9%)</span></div>
              <div className="legend-item"><span className="dot" style={{background: '#ef4444'}}></span>Lost <span className="legend-val">3 (1.4%)</span></div>
              <div className="legend-item"><span className="dot" style={{background: '#6b7280'}}></span>Retired <span className="legend-val">5 (2.4%)</span></div>
              <div className="legend-item"><span className="dot" style={{background: '#9ca3af'}}></span>Disposed <span className="legend-val">3 (1.4%)</span></div>
            </div>
          </div>
        </div>

        {/* Assets by Category */}
        <div className="dash-card">
          <div className="dash-card-header">
            <h3 className="dash-card-title">Assets by Category</h3>
            <a href="#" className="dash-link">View Report</a>
          </div>
          <div className="donut-widget">
            <DonutChart data={[
              { percent: 40, color: '#3b82f6' },
              { percent: 20, color: '#8b5cf6' },
              { percent: 10, color: '#10b981' },
              { percent: 12, color: '#f59e0b' },
              { percent: 18, color: '#6b7280' }
            ]} />
            <div className="donut-legend">
              <div className="legend-item"><span className="dot" style={{background: '#3b82f6'}}></span>Electronics <span className="legend-val">85 (40%)</span></div>
              <div className="legend-item"><span className="dot" style={{background: '#8b5cf6'}}></span>Furniture <span className="legend-val">42 (20%)</span></div>
              <div className="legend-item"><span className="dot" style={{background: '#10b981'}}></span>Vehicles <span className="legend-val">21 (10%)</span></div>
              <div className="legend-item"><span className="dot" style={{background: '#f59e0b'}}></span>Machinery <span className="legend-val">25 (12%)</span></div>
              <div className="legend-item"><span className="dot" style={{background: '#6b7280'}}></span>Others <span className="legend-val">37 (18%)</span></div>
            </div>
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="dash-card">
          <div className="dash-card-header">
            <h3 className="dash-card-title">Pending Approvals</h3>
          </div>
          <div className="approvals-list">
            <div className="approval-item">
              <div className="approval-icon" style={{color: '#f59e0b', background: '#fef3c7'}}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
              </div>
              <span className="approval-name">Maintenance Requests</span>
              <span className="approval-badge" style={{color: '#f59e0b'}}>4</span>
            </div>
            <div className="approval-item">
              <div className="approval-icon" style={{color: '#06b6d4', background: '#cffafe'}}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/></svg>
              </div>
              <span className="approval-name">Transfer Requests</span>
              <span className="approval-badge" style={{color: '#06b6d4'}}>6</span>
            </div>
            <div className="approval-item">
              <div className="approval-icon" style={{color: '#10b981', background: '#d1fae5'}}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              </div>
              <span className="approval-name">Return Approvals</span>
              <span className="approval-badge" style={{color: '#10b981'}}>3</span>
            </div>
            <div className="approval-item">
              <div className="approval-icon" style={{color: '#ef4444', background: '#fee2e2'}}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              </div>
              <span className="approval-name">Audit Discrepancies</span>
              <span className="approval-badge" style={{color: '#ef4444'}}>5</span>
            </div>
          </div>
          <div className="dash-card-footer-link">
            <a href="#" className="dash-link">View All Approvals &rarr;</a>
          </div>
        </div>
      </div>

      <div className="dash-grid-col-3-bottom">
        {/* Department Overview */}
        <div className="dash-card">
          <div className="dash-card-header">
            <h3 className="dash-card-title">Department Overview</h3>
          </div>
          <table className="dash-table">
            <thead>
              <tr>
                <th>Department</th>
                <th>Allocated</th>
                <th>Head</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Information Technology</td>
                <td>30</td>
                <td>Prince Roy</td>
                <td><span className="status-badge status-active">Active</span></td>
              </tr>
              <tr>
                <td>Human Resources</td>
                <td>18</td>
                <td>Neha Shah</td>
                <td><span className="status-badge status-active">Active</span></td>
              </tr>
              <tr>
                <td>Sales</td>
                <td>20</td>
                <td>Rahul Mehta</td>
                <td><span className="status-badge status-active">Active</span></td>
              </tr>
              <tr>
                <td>Finance</td>
                <td>16</td>
                <td>Amit Joshi</td>
                <td><span className="status-badge status-active">Active</span></td>
              </tr>
              <tr>
                <td>Operations</td>
                <td>28</td>
                <td>Vikram Patel</td>
                <td><span className="status-badge status-active">Active</span></td>
              </tr>
              <tr>
                <td>Marketing</td>
                <td>12</td>
                <td>Pooja Verma</td>
                <td><span className="status-badge status-inactive">Inactive</span></td>
              </tr>
            </tbody>
          </table>
          <div className="dash-card-footer-link">
            <a href="#" className="dash-link">View All Departments &rarr;</a>
          </div>
        </div>

        {/* Upcoming Returns */}
        <div className="dash-card">
          <div className="dash-card-header">
            <h3 className="dash-card-title">Upcoming Returns</h3>
            <a href="#" className="dash-link">View All</a>
          </div>
          <div className="returns-list">
            <div className="return-item">
              <div className="return-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"/><rect x="9" y="9" width="6" height="6"/></svg></div>
              <div className="return-details">
                <div className="return-name"><b>AF-0012</b> Dell Latitude 7450</div>
                <div className="return-assignee">Assigned to Rahul Mehta</div>
              </div>
              <div className="return-meta">
                <div className="return-date">22 May 2024</div>
                <div className="return-due">In 2 days</div>
              </div>
            </div>
            <div className="return-item">
              <div className="return-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"/><rect x="9" y="9" width="6" height="6"/></svg></div>
              <div className="return-details">
                <div className="return-name"><b>AF-0034</b> HP LaserJet P1106</div>
                <div className="return-assignee">Assigned to Neha Shah</div>
              </div>
              <div className="return-meta">
                <div className="return-date">24 May 2024</div>
                <div className="return-due">In 4 days</div>
              </div>
            </div>
            <div className="return-item">
              <div className="return-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"/><rect x="9" y="9" width="6" height="6"/></svg></div>
              <div className="return-details">
                <div className="return-name"><b>AF-0077</b> Logitech Mouse</div>
                <div className="return-assignee">Assigned to Amit Joshi</div>
              </div>
              <div className="return-meta">
                <div className="return-date">25 May 2024</div>
                <div className="return-due">In 5 days</div>
              </div>
            </div>
            <div className="return-item">
              <div className="return-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"/><rect x="9" y="9" width="6" height="6"/></svg></div>
              <div className="return-details">
                <div className="return-name"><b>AF-0099</b> Meeting Room B2</div>
                <div className="return-assignee">Booked by Sales Team</div>
              </div>
              <div className="return-meta">
                <div className="return-date">27 May 2024</div>
                <div className="return-due">In 7 days</div>
              </div>
            </div>
          </div>
        </div>

        {/* Overdue Returns */}
        <div className="dash-card">
          <div className="dash-card-header">
            <h3 className="dash-card-title">Overdue Returns</h3>
            <a href="#" className="dash-link">View All</a>
          </div>
          <table className="dash-table overdue-table">
            <thead>
              <tr>
                <th>Asset Tag</th>
                <th>Employee</th>
                <th>Days Overdue</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><span className="overdue-tag"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/></svg> AF-0008</span></td>
                <td>Priya Sharma</td>
                <td className="overdue-days">5 Days</td>
              </tr>
              <tr>
                <td><span className="overdue-tag"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/></svg> AF-0015</span></td>
                <td>Karan Patel</td>
                <td className="overdue-days">4 Days</td>
              </tr>
              <tr>
                <td><span className="overdue-tag"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/></svg> AF-0022</span></td>
                <td>Neha Verma</td>
                <td className="overdue-days">3 Days</td>
              </tr>
              <tr>
                <td><span className="overdue-tag"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/></svg> AF-0044</span></td>
                <td>Amit Joshi</td>
                <td className="overdue-days">2 Days</td>
              </tr>
              <tr>
                <td><span className="overdue-tag"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/></svg> AF-0051</span></td>
                <td>Rahul Mehta</td>
                <td className="overdue-days">1 Day</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="dash-grid-col-3-bottom">
        {/* Asset Activity Chart */}
        <div className="dash-card">
          <div className="dash-card-header">
            <h3 className="dash-card-title">Asset Activity (Last 30 Days)</h3>
          </div>
          <div className="chart-legend-top">
             <div className="legend-item"><span className="line-dot" style={{background: '#3b82f6'}}></span>Allocated</div>
             <div className="legend-item"><span className="line-dot" style={{background: '#10b981'}}></span>Returned</div>
             <div className="legend-item"><span className="line-dot" style={{background: '#f59e0b'}}></span>Maintenance</div>
             <div className="legend-item"><span className="line-dot" style={{background: '#8b5cf6'}}></span>Registered</div>
          </div>
          <div className="chart-placeholder">
            {/* Simple SVG representation of lines */}
            <svg width="100%" height="150" viewBox="0 0 400 150" preserveAspectRatio="none">
              <path d="M0,100 L40,90 L80,70 L120,80 L160,75 L200,95 L240,65 L280,85 L320,60 L360,75 L400,30" fill="none" stroke="#3b82f6" strokeWidth="2" markerEnd="url(#dot)" />
              <path d="M0,130 L40,120 L80,125 L120,110 L160,115 L200,105 L240,110 L280,95 L320,105 L360,90 L400,80" fill="none" stroke="#10b981" strokeWidth="2" />
              <path d="M0,140 L40,145 L80,135 L120,140 L160,135 L200,140 L240,130 L280,135 L320,125 L360,130 L400,120" fill="none" stroke="#f59e0b" strokeWidth="2" />
              <path d="M0,145 L40,140 L80,145 L120,145 L160,140 L200,145 L240,140 L280,145 L320,145 L360,140 L400,140" fill="none" stroke="#8b5cf6" strokeWidth="2" />
              {/* Dots on the blue line */}
              <circle cx="40" cy="90" r="3" fill="#3b82f6"/><circle cx="80" cy="70" r="3" fill="#3b82f6"/><circle cx="120" cy="80" r="3" fill="#3b82f6"/>
              <circle cx="160" cy="75" r="3" fill="#3b82f6"/><circle cx="200" cy="95" r="3" fill="#3b82f6"/><circle cx="240" cy="65" r="3" fill="#3b82f6"/>
              <circle cx="280" cy="85" r="3" fill="#3b82f6"/><circle cx="320" cy="60" r="3" fill="#3b82f6"/><circle cx="360" cy="75" r="3" fill="#3b82f6"/>
              <circle cx="400" cy="30" r="3" fill="#3b82f6"/>
              
              {/* Grid lines */}
              <line x1="0" y1="30" x2="400" y2="30" stroke="#f3f4f6" strokeWidth="1" />
              <line x1="0" y1="70" x2="400" y2="70" stroke="#f3f4f6" strokeWidth="1" />
              <line x1="0" y1="110" x2="400" y2="110" stroke="#f3f4f6" strokeWidth="1" />
              <line x1="0" y1="150" x2="400" y2="150" stroke="#f3f4f6" strokeWidth="1" />
            </svg>
            <div className="chart-x-axis">
              <span>Apr 21</span><span>Apr 25</span><span>Apr 29</span><span>May 03</span><span>May 07</span><span>May 11</span><span>May 15</span><span>May 20</span>
            </div>
            <div className="chart-y-axis">
              <span>40</span><span>30</span><span>20</span><span>10</span><span>0</span>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="dash-card">
          <div className="dash-card-header">
            <h3 className="dash-card-title">Recent Activity</h3>
            <a href="#" className="dash-link">View All</a>
          </div>
          <div className="activity-list">
            <div className="activity-item">
              <div className="activity-icon" style={{color: '#10b981'}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg></div>
              <div className="activity-details">
                <div className="activity-text">New asset <b>AF-0102</b> (MacBook Air) registered</div>
                <div className="activity-subtext">by Prince Roy</div>
              </div>
              <div className="activity-time">10:30 AM</div>
            </div>
            <div className="activity-item">
              <div className="activity-icon" style={{color: '#f59e0b'}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg></div>
              <div className="activity-details">
                <div className="activity-text">Maintenance request approved for <b>AF-0045</b></div>
                <div className="activity-subtext">by Amit Joshi</div>
              </div>
              <div className="activity-time">09:45 AM</div>
            </div>
            <div className="activity-item">
              <div className="activity-icon" style={{color: '#3b82f6'}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"/><rect x="9" y="9" width="6" height="6"/></svg></div>
              <div className="activity-details">
                <div className="activity-text">Asset <b>AF-0008</b> allocated to Rahul Mehta</div>
                <div className="activity-subtext">by Neha Shah</div>
              </div>
              <div className="activity-time">Yesterday</div>
            </div>
            <div className="activity-item">
              <div className="activity-icon" style={{color: '#8b5cf6'}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/></svg></div>
              <div className="activity-details">
                <div className="activity-text">Transfer request created for <b>AF-0033</b></div>
                <div className="activity-subtext">by Pooja Verma</div>
              </div>
              <div className="activity-time">19 May 2024</div>
            </div>
            <div className="activity-item">
              <div className="activity-icon" style={{color: '#6b7280'}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg></div>
              <div className="activity-details">
                <div className="activity-text">Audit cycle May 2024 completed</div>
                <div className="activity-subtext">by System</div>
              </div>
              <div className="activity-time">18 May 2024</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="dash-card">
          <div className="dash-card-header">
            <h3 className="dash-card-title">Quick Actions</h3>
          </div>
          <div className="quick-actions-list">
            <div className="quick-action-item">
              <div className="quick-action-icon" style={{color: '#6366f1', background: '#e0e7ff'}}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 21h18"/><path d="M5 21V7l7-4 7 4v14"/><path d="M9 21v-4h6v4"/><path d="M9 10h1"/><path d="M14 10h1"/><path d="M9 14h1"/><path d="M14 14h1"/></svg>
              </div>
              <div className="quick-action-text">
                <b>Add Department</b>
                <span>Create new department</span>
              </div>
              <div className="quick-action-arrow">&rarr;</div>
            </div>
            <div className="quick-action-item">
              <div className="quick-action-icon" style={{color: '#10b981', background: '#d1fae5'}}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
              </div>
              <div className="quick-action-text">
                <b>Promote Employee</b>
                <span>Assign role & permissions</span>
              </div>
              <div className="quick-action-arrow">&rarr;</div>
            </div>
            <div className="quick-action-item">
              <div className="quick-action-icon" style={{color: '#3b82f6', background: '#dbeafe'}}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
              </div>
              <div className="quick-action-text">
                <b>View Reports</b>
                <span>Access analytics & reports</span>
              </div>
              <div className="quick-action-arrow">&rarr;</div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
>>>>>>> origin/kashyap
  );
}
