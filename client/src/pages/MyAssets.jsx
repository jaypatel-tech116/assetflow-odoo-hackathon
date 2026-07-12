import { useState, useEffect } from 'react';
import { getMyAssets } from '../services/employeeService';
import './MyAssets.css';

export default function MyAssets() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  const fetchAssets = async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (search) params.search = search;
      if (category) params.category = category;
      const data = await getMyAssets(params);
      setAssets(data.assets || []);
      setPagination(data.pagination || { page: 1, totalPages: 1, total: 0 });
    } catch (err) {
      console.error('Error fetching assets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAssets(); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchAssets(1);
  };

  const formatDate = (d) => {
    if (!d) return '–';
    return new Date(d).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const getDaysLeft = (dateStr) => {
    if (!dateStr) return null;
    const diff = Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));
    return diff >= 0 ? `(${diff} days left)` : null;
  };

  return (
    <div className="my-assets-page">
      <div className="page-header">
        <div>
          <h1>My Assets</h1>
          <p>View all assets allocated to you.</p>
        </div>
      </div>

      <div className="assets-toolbar">
        <form onSubmit={handleSearch} className="assets-search">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          <input type="text" placeholder="Search assets..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </form>
        <select className="assets-filter" value={category} onChange={(e) => { setCategory(e.target.value); setTimeout(() => fetchAssets(1), 0); }}>
          <option value="">All Categories</option>
          <option value="Laptop">Laptop</option>
          <option value="Accessory">Accessory</option>
          <option value="Monitor">Monitor</option>
          <option value="Phone">Phone</option>
          <option value="Tablet">Tablet</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div className="assets-card">
        {loading ? (
          <div className="dash-loading" style={{ padding: '60px' }}>
            <div className="dash-spinner" />
          </div>
        ) : (
          <>
            <div className="dash-table-wrap">
              <table className="dash-table assets-table">
                <thead>
                  <tr>
                    <th>Asset Tag</th>
                    <th>Asset Name</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Assigned On</th>
                    <th>Return Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {assets.length > 0 ? assets.map((asset) => (
                    <tr key={asset.id}>
                      <td className="td-tag">{asset.asset_tag}</td>
                      <td className="td-name">{asset.name}</td>
                      <td><span className={`badge-cat cat-${asset.category?.toLowerCase()}`}>{asset.category}</span></td>
                      <td><span className="badge-status status-allocated">{asset.status}</span></td>
                      <td>{formatDate(asset.assigned_date)}</td>
                      <td>
                        <span className={asset.return_date ? 'return-date' : ''}>
                          {formatDate(asset.return_date)}
                          {asset.return_date && <span className="days-left">{getDaysLeft(asset.return_date)}</span>}
                        </span>
                      </td>
                      <td>
                        <button className="action-btn" title="View details">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan="7" className="empty-row">No assets found</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {pagination.totalPages > 1 && (
              <div className="pagination">
                <span className="pagination-info">
                  Showing {((pagination.page - 1) * 10) + 1} to {Math.min(pagination.page * 10, pagination.total)} of {pagination.total} assets
                </span>
                <div className="pagination-btns">
                  <button disabled={pagination.page <= 1} onClick={() => fetchAssets(pagination.page - 1)}>‹</button>
                  {Array.from({ length: pagination.totalPages }, (_, i) => (
                    <button key={i + 1} className={pagination.page === i + 1 ? 'active' : ''} onClick={() => fetchAssets(i + 1)}>{i + 1}</button>
                  ))}
                  <button disabled={pagination.page >= pagination.totalPages} onClick={() => fetchAssets(pagination.page + 1)}>›</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
