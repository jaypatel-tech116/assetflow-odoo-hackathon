import { useState, useEffect, useCallback } from 'react';
import { getAssets } from '../../services/apiService';
import './DepartmentAssets.css';

const statusColors = {
  'Allocated': 'badge-allocated',
  'Available': 'badge-available',
  'Under Maintenance': 'badge-under-maintenance',
  'Lost': 'badge-lost',
  'Retired': 'badge-retired',
};
const categoryColors = {
  Laptop: 'badge-laptop', Monitor: 'badge-monitor', Printer: 'badge-printer',
  Projector: 'badge-projector', Furniture: 'badge-furniture', Electrical: 'badge-electrical',
  Vehicle: 'badge-pending', Other: 'badge-new',
};
const categoryIcon = {
  Laptop: '💻', Monitor: '🖥️', Printer: '🖨️', Projector: '📽️',
  Furniture: '🪑', Electrical: '🔌', Vehicle: '🚗', Other: '📦',
};

function Skeleton({ height = 16, width = '100%', style = {} }) {
  return <div style={{ height, width, borderRadius: 6, background: 'linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite', ...style }} />;
}

export default function DepartmentAssets() {
  const [assets, setAssets] = useState([]);
  const [summary, setSummary] = useState({ total: 0, allocated: 0, available: 0, maintenance: 0, lost: 0, retired: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const fetchAssets = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (debouncedSearch) params.search = debouncedSearch;
      if (status) params.status = status;
      if (category) params.category = category;

      const res = await getAssets(params);
      setAssets(res.assets || []);
      setTotalCount(res.total || 0);
      setTotalPages(res.pages || 1);

      // Compute summary from full unfiltered count (use separate call or from stats)
      const all = await getAssets({ limit: 200 });
      const all_assets = all.assets || [];
      setSummary({
        total: all.total || 0,
        allocated: all_assets.filter(a => a.status === 'Allocated').length,
        available: all_assets.filter(a => a.status === 'Available').length,
        maintenance: all_assets.filter(a => a.status === 'Under Maintenance').length,
        lost: all_assets.filter(a => a.status === 'Lost').length,
        retired: all_assets.filter(a => a.status === 'Retired').length,
      });
    } catch (err) {
      console.error('Assets error:', err.message);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, status, category]);

  useEffect(() => { fetchAssets(); }, [fetchAssets]);
  useEffect(() => { setPage(1); }, [debouncedSearch, status, category]);

  const assetStats = [
    { label: 'Total Assets', sub: 'All assets', value: summary.total, color: 'blue', icon: '📦' },
    { label: 'Allocated', sub: 'Currently allocated', value: summary.allocated, color: 'green', icon: '✅' },
    { label: 'Available', sub: 'Ready to allocate', value: summary.available, color: 'orange', icon: '📤' },
    { label: 'Under Maintenance', sub: 'Not available', value: summary.maintenance, color: 'red', icon: '🔧' },
    { label: 'Lost Assets', sub: 'Reported missing', value: summary.lost, color: 'red', icon: '❗' },
    { label: 'Retired Assets', sub: 'Not in use', value: summary.retired, color: 'purple', icon: '🗑️' },
  ];

  return (
    <>
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
      
      <div className="page-content">
        <div className="assets-page">

          {/* Stat Cards */}
          <div className="assets-stats">
            {assetStats.map((s, i) => (
              <div className="stat-card" key={i}>
                <div className="stat-card-top">
                  <div>
                    <div className="stat-card-label">{s.label}</div>
                    <div className="stat-card-sub">{s.sub}</div>
                  </div>
                  <div className={`stat-card-icon ${s.color}`} style={{fontSize:18}}>{s.icon}</div>
                </div>
                <div className="stat-card-value">{loading ? <Skeleton height={28} width={50} /> : s.value}</div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="assets-filters">
            <div className="filter-group">
              <div className="filter-label">Search Assets</div>
              <div className="filter-input">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, tag or serial no..." />
              </div>
            </div>
            <div className="filter-group">
              <div className="filter-label">Status</div>
              <select className="filter-select" value={status} onChange={e => setStatus(e.target.value)}>
                <option value="">All Status</option>
                <option>Available</option><option>Allocated</option>
                <option>Under Maintenance</option><option>Lost</option><option>Retired</option>
              </select>
            </div>
            <div className="filter-group">
              <div className="filter-label">Category</div>
              <select className="filter-select" value={category} onChange={e => setCategory(e.target.value)}>
                <option value="">All Categories</option>
                <option>Laptop</option><option>Monitor</option><option>Printer</option>
                <option>Projector</option><option>Furniture</option><option>Electrical</option>
                <option>Vehicle</option><option>Other</option>
              </select>
            </div>
            <div className="filter-group">
              <div className="filter-label">Location</div>
              <select className="filter-select"><option>All Locations</option></select>
            </div>
            <div className="filter-group">
              <div className="filter-label">Assigned To</div>
              <select className="filter-select"><option>All</option></select>
            </div>
            <button className="btn-clear-filters" onClick={() => { setSearch(''); setStatus(''); setCategory(''); }}>
              ↺ Clear Filters
            </button>
          </div>

          {/* Table */}
          <div className="assets-table-card">
            <div className="table-header">
              <h3>Assets List ({loading ? '...' : totalCount})</h3>
              <div className="table-header-actions">
                <button className="btn-export">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  Export
                </button>
                <button className="btn-view-report">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                  View Report
                </button>
              </div>
            </div>

            <table className="assets-table">
              <thead>
                <tr>
                  <th><input type="checkbox" /></th>
                  <th>Asset Tag</th><th>Asset Name</th><th>Category</th>
                  <th>Serial Number</th><th>Status</th><th>Assigned To</th>
                  <th>Location</th><th>Acquired On</th><th>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [1,2,3,4,5,6,7].map(i => (
                    <tr key={i}>
                      {[1,2,3,4,5,6,7,8,9,10].map(j => (
                        <td key={j}><Skeleton height={13} width={j===3?80:j===6?90:'90%'} /></td>
                      ))}
                    </tr>
                  ))
                ) : assets.length === 0 ? (
                  <tr><td colSpan={10} style={{textAlign:'center',padding:'32px',color:'#9ca3af',fontSize:'13px'}}>
                    No assets found. Try adjusting your filters.
                  </td></tr>
                ) : (
                  assets.map((a) => (
                    <tr key={a.id}>
                      <td><input type="checkbox" /></td>
                      <td><a className="asset-tag-link" href="#">{a.tag}</a></td>
                      <td>
                        <div className="asset-name-cell">
                          <div className="asset-thumb">{categoryIcon[a.category] || '📦'}</div>
                          {a.name}
                        </div>
                      </td>
                      <td><span className={`request-type-badge ${categoryColors[a.category] || 'badge-new'}`}>{a.category}</span></td>
                      <td style={{fontFamily:'monospace',fontSize:'12px'}}>{a.serial_number || '—'}</td>
                      <td><span className={`request-type-badge ${statusColors[a.status]}`}>{a.status}</span></td>
                      <td>
                        {a.assignedUser ? (
                          <div className="assigned-cell">
                            <h4>{a.assignedUser.full_name}</h4>
                            <span>{a.assignedUser.role}</span>
                          </div>
                        ) : '—'}
                      </td>
                      <td style={{fontSize:'12px'}}>{a.location || '—'}</td>
                      <td style={{fontSize:'12px'}}>{a.acquired_on ? new Date(a.acquired_on).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}) : '—'}</td>
                      <td>
                        <button className="action-view-btn">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            <div className="table-footer">
              <span className="table-footer-info">
                Showing {Math.min((page-1)*10+1, totalCount)}–{Math.min(page*10, totalCount)} of {totalCount} assets
              </span>
              <div className="pagination">
                <button className="page-btn" disabled={page===1} onClick={() => setPage(p=>p-1)}>‹</button>
                {Array.from({length: Math.min(totalPages, 5)}, (_, i) => i+1).map(n => (
                  <button key={n} className={`page-btn${n===page?' active':''}`} onClick={() => setPage(n)}>{n}</button>
                ))}
                {totalPages > 5 && <><button className="page-btn dots">…</button><button className="page-btn" onClick={() => setPage(totalPages)}>{totalPages}</button></>}
                <button className="page-btn" disabled={page===totalPages} onClick={() => setPage(p=>p+1)}>›</button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}

