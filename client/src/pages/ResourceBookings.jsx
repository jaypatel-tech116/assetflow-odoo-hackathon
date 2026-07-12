import { useState, useEffect, useCallback } from 'react';
import Topbar from '../components/Topbar';
import { getResources, getBookings, createBooking, cancelBooking, getDashboardStats } from '../services/apiService';
import './ResourceBookings.css';
import './Dashboard.css';

function Skeleton({ h = 16, w = '100%', style = {} }) {
  return <div style={{ height: h, width: w, borderRadius: 6, background: 'linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite', ...style }} />;
}

const resourceIcon = { 'Meeting Room': '🏢', 'Conference Hall': '🏛️', Projector: '📽️', Vehicle: '🚗', 'Other Equipment': '📦' };
const TIME_SLOTS = ['09:00 - 10:00', '10:00 - 11:00', '11:00 - 12:00', '12:00 - 13:00', '13:00 - 14:00', '14:00 - 15:00', '15:00 - 16:00', '16:00 - 17:00'];

const calDays = [
  [null,null,null,1,2,3,4], [5,6,7,8,9,10,11], [12,13,14,15,16,17,18],
  [19,20,21,22,23,24,25], [26,27,28,29,30,31,null],
];

export default function ResourceBookings() {
  const [resources, setResources] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [bookingTab, setBookingTab] = useState('Upcoming');
  const [resourceTypeFilter, setResourceTypeFilter] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [selectedResource, setSelectedResource] = useState('');
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);
  const [purpose, setPurpose] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState('');
  const [bookingError, setBookingError] = useState('');
  const [cancellingId, setCancellingId] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [resRes, bkRes, statsRes] = await Promise.all([
        getResources(resourceTypeFilter ? { type: resourceTypeFilter } : {}),
        getBookings({ status: bookingTab, limit: 10 }),
        getDashboardStats(),
      ]);
      setResources(resRes.resources || []);
      setBookings(bkRes.bookings || []);
      setStats(statsRes.stats || {});
    } catch (err) {
      console.error('Bookings error:', err.message);
    } finally {
      setLoading(false);
    }
  }, [bookingTab, resourceTypeFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleBook = async () => {
    if (!selectedResource || !bookingDate || !selectedSlot || !purpose.trim()) {
      setBookingError('Please fill in all booking fields.'); return;
    }
    setBookingError('');
    setSubmitting(true);
    try {
      const [start, end] = selectedSlot.split(' - ');
      await createBooking({
        resource_id: Number(selectedResource),
        booking_date: bookingDate,
        start_time: `${start}:00`,
        end_time: `${end}:00`,
        purpose: purpose.trim(),
      });
      setBookingSuccess('✅ Booking confirmed!');
      setPurpose(''); setSelectedSlot(''); setSelectedResource('');
      setTimeout(() => setBookingSuccess(''), 3000);
      fetchData();
    } catch (err) {
      setBookingError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (id) => {
    if (!confirm('Cancel this booking?')) return;
    setCancellingId(id);
    try { await cancelBooking(id); fetchData(); }
    catch (err) { alert(err.message); }
    setCancellingId(null);
  };

  const statCards = [
    { label: 'Upcoming Bookings', sub: 'Scheduled', value: stats.upcomingBookings ?? '—', icon: '📅', color: '#eff6ff' },
    { label: 'Total Resources', sub: 'Available to book', value: resources.length || '—', icon: '🏢', color: '#faf5ff' },
    { label: 'Under Maintenance', sub: 'Not available', value: stats.underMaintenance ?? '—', icon: '🔧', color: '#fff7ed' },
    { label: 'Total Assets', sub: 'In department', value: stats.totalAssets ?? '—', icon: '📦', color: '#f0fdf4' },
  ];

  return (
    <>
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
      <Topbar title="Resource Bookings" subtitle="Book and manage shared resources for your department." searchPlaceholder="Search resources..." />
      <div className="page-content">
        <div className="bookings-page">

          {/* Stats */}
          <div className="bookings-stats">
            {statCards.map((s, i) => (
              <div className="stat-card" key={i}>
                <div className="stat-card-top">
                  <div>
                    <div className="stat-card-label">{s.label}</div>
                    <div className="stat-card-sub">{s.sub}</div>
                  </div>
                  <div className="stat-card-icon blue" style={{background: s.color, fontSize: 20}}>{s.icon}</div>
                </div>
                <div className="stat-card-value">{loading ? <Skeleton h={28} w={50} /> : s.value}</div>
              </div>
            ))}
          </div>

          {/* Main layout */}
          <div className="bookings-layout">
            <div className="bookings-left">

              {/* Book a Resource */}
              <div className="book-card">
                <div className="book-card-header">
                  <h3>1. Book a Resource</h3>
                </div>

                {bookingSuccess && (
                  <div style={{margin:'0 18px',padding:'10px 14px',background:'#f0fdf4',border:'1px solid #86efac',borderRadius:8,color:'#16a34a',fontSize:'13px',fontWeight:500}}>
                    {bookingSuccess}
                  </div>
                )}
                {bookingError && (
                  <div style={{margin:'0 18px',padding:'10px 14px',background:'#fef2f2',border:'1px solid #fca5a5',borderRadius:8,color:'#dc2626',fontSize:'13px'}}>
                    {bookingError}
                  </div>
                )}

                <div className="book-form-row">
                  <div className="book-form-group">
                    <label className="book-form-label">Resource Type</label>
                    <select className="book-form-select" value={resourceTypeFilter} onChange={e => setResourceTypeFilter(e.target.value)}>
                      <option value="">All Types</option>
                      <option>Meeting Room</option><option>Conference Hall</option>
                      <option>Projector</option><option>Vehicle</option><option>Other Equipment</option>
                    </select>
                  </div>
                  <div className="book-form-group">
                    <label className="book-form-label">Select Resource</label>
                    <select className="book-form-select" value={selectedResource} onChange={e => setSelectedResource(e.target.value)}>
                      <option value="">Choose a resource</option>
                      {resources.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>
                  </div>
                  <div className="book-form-group">
                    <label className="book-form-label">Date</label>
                    <input type="date" className="book-form-date" value={bookingDate} onChange={e => setBookingDate(e.target.value)} min={new Date().toISOString().split('T')[0]} />
                  </div>
                  <div className="book-form-group">
                    <label className="book-form-label">Purpose</label>
                    <input className="book-form-select" placeholder="Meeting purpose..." value={purpose} onChange={e => setPurpose(e.target.value)} style={{fontFamily:'inherit'}} />
                  </div>
                </div>

                {/* Resource Cards Grid */}
                <div style={{padding:'0 18px 16px'}}>
                  <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:12}}>
                    {['All Resources','Meeting Rooms','Conference Halls','Projectors','Vehicles','Other Equipment'].map((t,i) => (
                      <button key={i} onClick={() => setResourceTypeFilter(i===0?'':['','Meeting Room','Conference Hall','Projector','Vehicle','Other Equipment'][i])}
                        style={{padding:'6px 12px',borderRadius:20,border:`1px solid ${resourceTypeFilter===['','Meeting Room','Conference Hall','Projector','Vehicle','Other Equipment'][i]&&(i===0?resourceTypeFilter===''?true:false:true)?'#4f46e5':'#e5e7eb'}`,background:resourceTypeFilter===['','Meeting Room','Conference Hall','Projector','Vehicle','Other Equipment'][i]&&(i===0?resourceTypeFilter===''?true:false:true)?'#eef2ff':'#fff',color:resourceTypeFilter===['','Meeting Room','Conference Hall','Projector','Vehicle','Other Equipment'][i]&&(i===0?resourceTypeFilter===''?true:false:true)?'#4f46e5':'#6b7280',fontSize:'12px',fontWeight:500,cursor:'pointer'}}>
                        {t}
                      </button>
                    ))}
                  </div>
                  <div className="resource-grid">
                    {loading ? [1,2,3,4].map(i=>(
                      <div className="resource-card" key={i}>
                        <Skeleton h={90} w="100%" style={{borderRadius:0}} />
                        <div style={{padding:'10px 12px',display:'flex',flexDirection:'column',gap:6}}>
                          <Skeleton h={13} w="80%" /><Skeleton h={11} w="60%" />
                        </div>
                      </div>
                    )) : resources.slice(0,4).map((r) => (
                      <div className="resource-card" key={r.id} onClick={() => setSelectedResource(String(r.id))}
                        style={{border: selectedResource===String(r.id)?'2px solid #4f46e5':'1px solid #f0f1f5'}}>
                        <div className="resource-card-img">
                          {resourceIcon[r.type] || '🏢'}
                          <span className="resource-avail-badge">{r.status}</span>
                        </div>
                        <div className="resource-card-body">
                          <h4>{r.name}</h4>
                          <div className="resource-card-meta">
                            <div className="resource-meta-row"><span>🏷️</span>{r.type}</div>
                            {r.capacity && <div className="resource-meta-row"><span>👥</span>{r.capacity}</div>}
                            {r.location && <div className="resource-meta-row"><span>📍</span>{r.location}</div>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* My Bookings */}
              <div className="book-card">
                <div className="book-card-header"><h3>3. My Bookings</h3></div>
                <div className="my-bookings-tabs">
                  {['Upcoming', 'Completed', 'Cancelled'].map(t => (
                    <div key={t} className={`my-booking-tab${bookingTab===t?' active':''}`} onClick={() => setBookingTab(t)}>{t}</div>
                  ))}
                </div>
                <table className="bookings-table">
                  <thead>
                    <tr>
                      <th>Booking ID</th><th>Resource</th><th>Date &amp; Time</th>
                      <th>Purpose</th><th>Status</th><th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? [1,2,3].map(i=>(
                      <tr key={i}>{[1,2,3,4,5,6].map(j=><td key={j}><Skeleton h={13} w="80%" /></td>)}</tr>
                    )) : bookings.length===0 ? (
                      <tr><td colSpan={6} style={{textAlign:'center',padding:'24px',color:'#9ca3af',fontSize:'13px'}}>No {bookingTab.toLowerCase()} bookings</td></tr>
                    ) : bookings.map(b => (
                      <tr key={b.id}>
                        <td style={{fontWeight:600,color:'#4f46e5'}}>{b.booking_id}</td>
                        <td>{b.resource?.name || '—'}</td>
                        <td>
                          <div style={{fontSize:'12px',color:'#111827'}}>{new Date(b.booking_date).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</div>
                          <div style={{fontSize:'11px',color:'#9ca3af'}}>{b.start_time?.slice(0,5)} - {b.end_time?.slice(0,5)}</div>
                        </td>
                        <td style={{fontSize:'12px'}}>{b.purpose}</td>
                        <td><span className={`request-type-badge badge-${b.status.toLowerCase()}`}>{b.status}</span></td>
                        <td>
                          <div style={{display:'flex',gap:'6px'}}>
                            <button className="action-view-btn">
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                            </button>
                            {b.status === 'Upcoming' && (
                              <button className="action-view-btn" style={{color:'#ef4444',borderColor:'#fecaca',fontSize:13}}
                                disabled={cancellingId===b.id} onClick={() => handleCancel(b.id)}>
                                {cancellingId===b.id ? '...' : '🗑️'}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right Column */}
            <div className="bookings-right">
              {/* Time Slot Picker */}
              <div className="time-slots-card">
                <div className="slots-label" style={{fontWeight:700,color:'#111827',fontSize:'13px',marginBottom:12}}>2. Select Time Slot</div>
                <div className="slots-label">Date: {bookingDate}</div>
                <div className="time-slots-grid">
                  {TIME_SLOTS.map(slot => (
                    <button key={slot} className={`time-slot-btn${selectedSlot===slot?' selected':''}`} onClick={() => setSelectedSlot(slot)}>
                      {slot}
                    </button>
                  ))}
                </div>
                {selectedSlot && <div style={{fontSize:'12px',color:'#4f46e5',fontWeight:500,marginBottom:10}}>Selected: {selectedSlot}</div>}
                <button className="btn-book-now" onClick={handleBook} disabled={submitting}>
                  {submitting ? 'Booking...' : 'Book Now'}
                </button>
              </div>

              {/* Booking Guidelines */}
              <div className="guidelines-card">
                <h4>Booking Guidelines</h4>
                {[
                  { icon: '🕐', text: 'Book resources at least 2 hours in advance.' },
                  { icon: '✕', text: 'Cancel your booking if not required.' },
                  { icon: 'ℹ️', text: 'Be on time and follow company policies.' },
                  { icon: '🎧', text: 'For any issues, contact the Admin.' },
                ].map((g, i) => (
                  <div className="guideline-item" key={i}>
                    <div className="guideline-icon">{g.icon}</div>
                    <div className="guideline-text">{g.text}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
