import { useState, useEffect, useCallback } from 'react';
import { getRequests, approveRequest, rejectRequest } from '../../services/apiService';
import './ApprovalRequests.css';

function Skeleton({ height = 16, width = '100%', style = {} }) {
  return <div style={{ height, width, borderRadius: 6, background: 'linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite', ...style }} />;
}

const typeConfig = {
  Transfer:    { icon: '🔄', bg: '#eff6ff', label: 'Transfer' },
  Return:      { icon: '↩️', bg: '#f0fdf4', label: 'Return' },
  Maintenance: { icon: '🔧', bg: 'var(--text-primary)7ed', label: 'Maintenance' },
  Booking:     { icon: '📅', bg: '#faf5ff', label: 'Booking' },
  'New Asset': { icon: '📦', bg: '#fefce8', label: 'New Asset' },
};

const assetIcon = { Laptop: '💻', Monitor: '🖥️', Printer: '🖨️', Projector: '📽️', Furniture: '🪑', Electrical: '🔌', Other: '📦' };

const TABS = [
  { label: 'All Requests', type: '' },
  { label: 'Transfer Requests', type: 'Transfer' },
  { label: 'Return Requests', type: 'Return' },
  { label: 'Maintenance Requests', type: 'Maintenance' },
  { label: 'Booking Requests', type: 'Booking' },
];

export default function ApprovalRequests() {
  const [activeTab, setActiveTab] = useState(0);
  const [requests, setRequests] = useState([]);
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const params = { status: 'Pending', limit: 20, page };
      if (TABS[activeTab].type) params.type = TABS[activeTab].type;
      const res = await getRequests(params);
      setRequests(res.requests || []);
      setTotal(res.total || 0);

      // Fetch counts for all tabs
      const [all, tr, rr, mr, bk] = await Promise.all([
        getRequests({ status: 'Pending', limit: 1 }),
        getRequests({ status: 'Pending', type: 'Transfer', limit: 1 }),
        getRequests({ status: 'Pending', type: 'Return', limit: 1 }),
        getRequests({ status: 'Pending', type: 'Maintenance', limit: 1 }),
        getRequests({ status: 'Pending', type: 'Booking', limit: 1 }),
      ]);
      setCounts({ 0: all.total, 1: tr.total, 2: rr.total, 3: mr.total, 4: bk.total });
    } catch (err) {
      console.error('Requests error:', err.message);
    } finally {
      setLoading(false);
    }
  }, [activeTab, page]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);
  useEffect(() => { setPage(1); }, [activeTab]);

  const handleApprove = async (id) => {
    setActionLoading(p => ({ ...p, [id]: 'approve' }));
    try { await approveRequest(id); fetchRequests(); }
    catch (e) { alert(e.message); }
    setActionLoading(p => ({ ...p, [id]: false }));
  };

  const handleReject = async (id) => {
    const notes = prompt('Reason for rejection (optional):');
    if (notes === null) return; // cancelled
    setActionLoading(p => ({ ...p, [id]: 'reject' }));
    try { await rejectRequest(id, notes); fetchRequests(); }
    catch (e) { alert(e.message); }
    setActionLoading(p => ({ ...p, [id]: false }));
  };

  const approvalStats = [
    { label: 'Transfer Requests', value: counts[1] ?? 0, icon: '🔄', color: '#eff6ff' },
    { label: 'Return Requests', value: counts[2] ?? 0, icon: '↩️', color: '#f0fdf4' },
    { label: 'Maintenance Requests', value: counts[3] ?? 0, icon: '🔧', color: 'var(--text-primary)7ed' },
    { label: 'Booking Requests', value: counts[4] ?? 0, icon: '📅', color: '#faf5ff' },
  ];

  return (
    <>
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
      
      <div className="page-content">
        <div className="approvals-page">

          {/* Stat Cards */}
          <div className="approval-stats">
            {approvalStats.map((s, i) => (
              <div className="approval-stat-card" key={i}>
                <div className="approval-stat-icon" style={{background: s.color, fontSize: 22}}>{s.icon}</div>
                <div className="approval-stat-info">
                  <h3>{loading ? '—' : s.value}</h3>
                  <p>{s.label}</p>
                  <div className="stat-sub">Pending</div>
                </div>
              </div>
            ))}
          </div>

          {/* Table Card */}
          <div style={{background:'var(--text-primary)',borderRadius:'12px',border:'1px solid #f0f1f5',boxShadow:'0 1px 4px rgba(0,0,0,0.04)',overflow:'hidden'}}>
            {/* Tabs */}
            <div className="approvals-tabs-bar">
              <div className="approvals-tabs">
                {TABS.map((t, i) => (
                  <div key={i} className={`approval-tab${activeTab===i?' active':''}`} onClick={() => setActiveTab(i)}>
                    {t.label}
                    <span className="tab-count">{counts[i] ?? '...'}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Controls */}
            <div className="approvals-controls">
              <button className="btn-filter">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
                Filters
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
              </button>
              <select className="sort-select">
                <option>Sort by: Newest First</option>
                <option>Sort by: Oldest First</option>
              </select>
            </div>

            {/* Table */}
            <table className="approvals-table">
              <thead>
                <tr>
                  <th>Request ID</th><th>Type</th><th>Employee</th>
                  <th>Asset / Resource</th><th>Request Date</th>
                  <th>Reason / Purpose</th><th>Status</th><th>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [1,2,3,4,5].map(i => (
                    <tr key={i}>
                      {[1,2,3,4,5,6,7,8].map(j => (
                        <td key={j}><Skeleton height={13} width="80%" /></td>
                      ))}
                    </tr>
                  ))
                ) : requests.length === 0 ? (
                  <tr><td colSpan={8} style={{textAlign:'center',padding:'40px',color:'#9ca3af',fontSize:'13px'}}>
                    ✅ No pending {TABS[activeTab].type || ''} requests
                  </td></tr>
                ) : (
                  requests.map((r) => {
                    const cfg = typeConfig[r.type] || { icon: '📋', bg: '#f3f4f6', label: r.type };
                    const initials = r.employee?.full_name?.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2) || 'U';
                    return (
                      <tr key={r.id}>
                        <td><a className="req-id-link" href="#">{r.request_id}</a></td>
                        <td>
                          <div className="req-type-cell">
                            <div className="req-type-icon" style={{background:cfg.bg,fontSize:14}}>{cfg.icon}</div>
                            <div>
                              <div style={{fontSize:'12px',fontWeight:500,color:'#111827'}}>{cfg.label}</div>
                              <div style={{fontSize:'11px',color:'#9ca3af'}}>Request</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="employee-cell">
                            <div className="employee-avatar">{initials}</div>
                            <div className="employee-info">
                              <h4>{r.employee?.full_name || '—'}</h4>
                              <span>{r.employee?.role || '—'}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          {r.asset ? (
                            <div className="asset-cell">
                              <div className="asset-mini-thumb">{assetIcon[r.asset.category] || '📦'}</div>
                              <div className="asset-cell-info">
                                <h4>{r.asset.name}</h4>
                                <span>{r.asset.tag}</span>
                              </div>
                            </div>
                          ) : <span style={{color:'#9ca3af',fontSize:'12px'}}>—</span>}
                        </td>
                        <td>
                          <div className="date-cell">
                            <h4>{new Date(r.created_at).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</h4>
                            <span>{new Date(r.created_at).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})}</span>
                          </div>
                        </td>
                        <td>
                          <div className="reason-cell">
                            <h4>{r.reason}</h4>
                            {r.notes && <p>{r.notes}</p>}
                          </div>
                        </td>
                        <td><span className="request-type-badge badge-pending">{r.status}</span></td>
                        <td>
                          <div className="approval-action-btns">
                            <button
                              className="btn-approve"
                              disabled={!!actionLoading[r.id]}
                              onClick={() => handleApprove(r.id)}
                              style={{opacity: actionLoading[r.id] ? 0.6 : 1}}
                            >
                              {actionLoading[r.id]==='approve' ? '...' : 'Approve'}
                            </button>
                            <button
                              className="btn-reject"
                              disabled={!!actionLoading[r.id]}
                              onClick={() => handleReject(r.id)}
                              style={{opacity: actionLoading[r.id] ? 0.6 : 1}}
                            >
                              {actionLoading[r.id]==='reject' ? '...' : 'Reject'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>

            <div className="table-footer" style={{padding:'12px 18px',borderTop:'1px solid #f3f4f6',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <span style={{fontSize:'11.5px',color:'#6b7280'}}>Showing {requests.length} of {total} requests</span>
              <div className="pagination">
                <button className="page-btn" disabled={page===1} onClick={() => setPage(p=>p-1)}>‹</button>
                <button className="page-btn active">{page}</button>
                <button className="page-btn" disabled={page*20>=total} onClick={() => setPage(p=>p+1)}>›</button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}

