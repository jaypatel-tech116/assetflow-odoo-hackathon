import { useState, useEffect } from 'react';
import { getMyTransferRequests, createTransferRequest, createReturnRequest, getMyAssets } from '../../services/employeeService';
import './TransferRequests.css';

const TABS = ['All', 'Transfer Requests', 'Return Requests'];

export default function TransferRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('Transfer');
  const [assets, setAssets] = useState([]);
  const [formData, setFormData] = useState({ asset_id: '', to_from: '' });
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const fetchRequests = async (page = 1, tab = activeTab) => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (tab === 'Transfer Requests') params.type = 'Transfer';
      if (tab === 'Return Requests') params.type = 'Return';
      const data = await getMyTransferRequests(params);
      setRequests(data.transferRequests || []);
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

  const openModal = async (type) => {
    setModalType(type);
    try {
      const data = await getMyAssets({ limit: 100 });
      setAssets(data.assets || []);
    } catch (err) {
      console.error('Error:', err);
    }
    setShowModal(true);
    setFormData({ asset_id: '', to_from: type === 'Return' ? 'IT Department' : '' });
    setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.asset_id) {
      setFormError('Please select an asset');
      return;
    }
    if (modalType === 'Transfer' && !formData.to_from.trim()) {
      setFormError('Please enter transfer destination');
      return;
    }

    setFormLoading(true);
    setFormError('');
    try {
      if (modalType === 'Transfer') {
        await createTransferRequest({ asset_id: parseInt(formData.asset_id), to_from: formData.to_from.trim() });
      } else {
        await createReturnRequest({ asset_id: parseInt(formData.asset_id) });
      }
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
    <div className="transfer-page">
      <div className="page-header">
        <div>
          <h1>Transfer / Return Requests</h1>
          <p>View status of your transfer and return requests.</p>
        </div>
        <div className="page-header-actions">
          <button className="btn-outline" onClick={() => openModal('Return')}>Request Return</button>
          <button className="btn-primary" onClick={() => openModal('Transfer')}>Request Transfer</button>
        </div>
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
                    <th>Type</th>
                    <th>Asset</th>
                    <th>To / From</th>
                    <th>Status</th>
                    <th>Requested On</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.length > 0 ? requests.map((req) => (
                    <tr key={req.id}>
                      <td className="td-tag">{req.request_id}</td>
                      <td><span className={`badge-type type-${req.type?.toLowerCase()}`}>{req.type}</span></td>
                      <td>{req.asset?.name || '–'}</td>
                      <td>{req.to_from}</td>
                      <td><span className={`badge-status status-${req.status?.toLowerCase()}`}>{req.status}</span></td>
                      <td>{formatDate(req.requested_on)}</td>
                      <td>
                        <button className="action-btn" title="View">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan="7" className="empty-row">No transfer/return requests found</td></tr>
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

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{modalType === 'Transfer' ? 'Request Transfer' : 'Request Return'}</h2>
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
              {modalType === 'Transfer' && (
                <div className="form-group">
                  <label>Transfer To *</label>
                  <input type="text" placeholder="e.g., Rahul Mehta, IT Department" value={formData.to_from} onChange={(e) => setFormData({ ...formData, to_from: e.target.value })} />
                </div>
              )}
              <div className="modal-actions">
                <button type="button" className="btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={formLoading}>
                  {formLoading ? 'Submitting...' : `Submit ${modalType} Request`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

