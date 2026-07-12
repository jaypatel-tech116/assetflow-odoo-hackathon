import { useState, useEffect } from 'react';
import { getMyMaintenanceRequests, createMaintenanceRequest, getMyAssets } from '../services/employeeService';
import './MaintenanceRequests.css';

const TABS = ['All', 'Pending', 'Approved', 'In Progress', 'Resolved', 'Rejected'];

export default function MaintenanceRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [showModal, setShowModal] = useState(false);
  const [assets, setAssets] = useState([]);
  const [formData, setFormData] = useState({ asset_id: '', issue: '', priority: 'Medium' });
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const fetchRequests = async (page = 1, status = activeTab) => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (status !== 'All') params.status = status;
      const data = await getMyMaintenanceRequests(params);
      setRequests(data.maintenanceRequests || []);
      setPagination(data.pagination || { page: 1, totalPages: 1, total: 0 });
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    fetchRequests(1, tab);
  };

  const openModal = async () => {
    try {
      const data = await getMyAssets({ limit: 100 });
      setAssets(data.assets || []);
    } catch (err) {
      console.error('Error:', err);
    }
    setShowModal(true);
    setFormData({ asset_id: '', issue: '', priority: 'Medium' });
    setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.asset_id || !formData.issue.trim()) {
      setFormError('Please select an asset and describe the issue');
      return;
    }
    setFormLoading(true);
    setFormError('');
    try {
      await createMaintenanceRequest({
        asset_id: parseInt(formData.asset_id),
        issue: formData.issue.trim(),
        priority: formData.priority,
      });
      setShowModal(false);
      fetchRequests(1, activeTab);
    } catch (err) {
      setFormError(err.message || 'Failed to submit request');
    } finally {
      setFormLoading(false);
    }
  };

  const formatDate = (d) => {
    if (!d) return '–';
    return new Date(d).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="maintenance-page">
      <div className="page-header">
        <div>
          <h1>Maintenance Requests</h1>
          <p>Track all your maintenance requests.</p>
        </div>
        <button className="btn-primary" onClick={openModal}>+ Raise New Request</button>
      </div>

      <div className="tabs-bar">
        {TABS.map((tab) => (
          <button key={tab} className={`tab-btn ${activeTab === tab ? 'tab-btn--active' : ''}`} onClick={() => handleTabChange(tab)}>
            {tab}
          </button>
        ))}
      </div>

      <div className="assets-card">
        {loading ? (
          <div className="dash-loading" style={{ padding: '60px' }}><div className="dash-spinner" /></div>
        ) : (
          <>
            <div className="dash-table-wrap">
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>Request ID</th>
                    <th>Asset</th>
                    <th>Issue</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Requested On</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.length > 0 ? requests.map((req) => (
                    <tr key={req.id}>
                      <td className="td-tag">{req.request_id}</td>
                      <td>
                        <div>{req.asset?.name || '–'}</div>
                        <div className="time-sub">{req.asset?.asset_tag || ''}</div>
                      </td>
                      <td className="td-issue">{req.issue}</td>
                      <td><span className={`badge-priority priority-${req.priority?.toLowerCase()}`}>{req.priority}</span></td>
                      <td><span className={`badge-status status-${req.status?.toLowerCase().replace(' ', '-')}`}>{req.status}</span></td>
                      <td>{formatDate(req.requested_on)}</td>
                      <td>
                        <button className="action-btn" title="View">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan="7" className="empty-row">No maintenance requests found</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {pagination.totalPages > 1 && (
              <div className="pagination">
                <span className="pagination-info">
                  Showing {((pagination.page - 1) * 10) + 1} to {Math.min(pagination.page * 10, pagination.total)} of {pagination.total} requests
                </span>
                <div className="pagination-btns">
                  <button disabled={pagination.page <= 1} onClick={() => fetchRequests(pagination.page - 1, activeTab)}>‹</button>
                  {Array.from({ length: pagination.totalPages }, (_, i) => (
                    <button key={i + 1} className={pagination.page === i + 1 ? 'active' : ''} onClick={() => fetchRequests(i + 1, activeTab)}>{i + 1}</button>
                  ))}
                  <button disabled={pagination.page >= pagination.totalPages} onClick={() => fetchRequests(pagination.page + 1, activeTab)}>›</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Raise New Request Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Raise New Maintenance Request</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              {formError && <div className="book-error">{formError}</div>}
              <div className="form-group">
                <label>Select Asset *</label>
                <select value={formData.asset_id} onChange={(e) => setFormData({ ...formData, asset_id: e.target.value })}>
                  <option value="">-- Select Asset --</option>
                  {assets.map((a) => (
                    <option key={a.id} value={a.id}>{a.name} ({a.asset_tag})</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Issue Description *</label>
                <textarea rows="3" placeholder="Describe the issue..." value={formData.issue} onChange={(e) => setFormData({ ...formData, issue: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Priority</label>
                <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })}>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={formLoading}>
                  {formLoading ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
