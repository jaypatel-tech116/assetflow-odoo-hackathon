import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAuditCycleById, verifyAuditAsset, closeAuditCycle } from '../../services/auditService';
import { getAssets } from '../../services/assetService';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import './AuditCycleDetail.css';

export default function AuditCycleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cycle, setCycle] = useState(null);
  const [scopedAssets, setScopedAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [form, setForm] = useState({ verification_status: 'Verified', notes: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchDetail = async () => {
    const r = await getAuditCycleById(id);
    if (r.success) {
      setCycle(r.auditCycle);
      // Fetch assets matching the scope to show in a checklist
      const deptId = r.auditCycle.scope_department_id;
      const loc = r.auditCycle.scope_location;
      const params = new URLSearchParams({ limit: 500 });
      if (deptId) params.set('department_id', deptId);
      if (loc) params.set('location', loc);
      const assetsRes = await getAssets(`${params}`);
      if (assetsRes.success) {
        setScopedAssets(assetsRes.assets);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const result = await verifyAuditAsset(id, {
      asset_id: selectedAsset.id,
      verification_status: form.verification_status,
      notes: form.notes,
    });
    if (result.success) {
      setSuccess('Verification recorded!');
      await fetchDetail();
      setTimeout(() => {
        setShowVerifyModal(false);
        setSelectedAsset(null);
        setForm({ verification_status: 'Verified', notes: '' });
      }, 500);
    } else {
      setError(result.message || 'Failed to verify asset');
    }
  };

  const handleCloseCycle = async () => {
    if (window.confirm('Are you sure you want to CLOSE this audit cycle? This will lock verifications and automatically mark missing assets as "Lost". This action is irreversible.')) {
      const r = await closeAuditCycle(id);
      if (r.success) {
        fetchDetail();
      }
    }
  };

  if (loading) return <div className="page-loading"><div className="loading-spinner" /></div>;
  if (!cycle) return <div className="page-loading"><p>Audit cycle not found</p></div>;

  // Map of asset_id to verification details
  const verificationsMap = (cycle.verifications || []).reduce((acc, v) => {
    acc[v.asset_id] = v;
    return acc;
  }, {});

  const percentComplete = cycle.total_assets > 0 ? Math.round((cycle.completed_count / cycle.total_assets) * 100) : 0;

  return (
    <div className="audit-detail-page">
      <button className="btn-back" onClick={() => navigate('/audits')}>← Back to Audits</button>

      <div className="audit-detail-header">
        <div>
          <div className="audit-code-badge">{cycle.cycle_code}</div>
          <h1>{cycle.title}</h1>
          <p className="text-muted">
            Scope: {cycle.scopeDepartment?.name || 'All Departments'}
            {cycle.scope_location && ` @ ${cycle.scope_location}`} | Lead: {cycle.leadAuditor?.full_name}
          </p>
        </div>
        <div className="audit-actions">
          <StatusBadge status={cycle.status} />
          {cycle.status !== 'Closed' && cycle.status !== 'Cancelled' && (
            <button className="btn-primary btn-danger" onClick={handleCloseCycle}>Close & Finalize Audit</button>
          )}
        </div>
      </div>

      {/* Progress Bar Card */}
      <div className="audit-progress-card">
        <div className="progress-info">
          <h3>Verification Progress</h3>
          <span className="progress-percentage">{percentComplete}% Complete</span>
        </div>
        <div className="progress-bar-container">
          <div className="progress-bar-fill" style={{ width: `${percentComplete}%` }} />
        </div>
        <p className="progress-counts">
          Verified {cycle.completed_count} of {cycle.total_assets} assets
        </p>
      </div>

      <div className="audit-content-layout">
        {/* Left Side: Scoped Assets list to perform verification */}
        <div className="audit-assets-section">
          <h3>Assets in Scope</h3>
          <div className="audit-assets-list">
            {scopedAssets.map(a => {
              const verified = verificationsMap[a.id];
              return (
                <div key={a.id} className="audit-asset-item">
                  <div className="audit-asset-info">
                    <span className="asset-tag">{a.asset_tag}</span>
                    <span className="asset-name">{a.name}</span>
                    {a.location && <span className="asset-loc">📍 {a.location}</span>}
                  </div>
                  <div className="audit-asset-action">
                    {verified ? (
                      <div className="verified-status-info">
                        <StatusBadge status={verified.verification_status} />
                        {cycle.status !== 'Closed' && (
                          <button className="btn-sm" onClick={() => { setSelectedAsset(a); setForm({ verification_status: verified.verification_status, notes: verified.notes || '' }); setShowVerifyModal(true); }}>Edit</button>
                        )}
                      </div>
                    ) : (
                      cycle.status !== 'Closed' ? (
                        <button className="btn-primary btn-sm" onClick={() => { setSelectedAsset(a); setForm({ verification_status: 'Verified', notes: '' }); setShowVerifyModal(true); }}>Verify</button>
                      ) : (
                        <span className="text-muted">Unverified</span>
                      )
                    )}
                  </div>
                </div>
              );
            })}
            {scopedAssets.length === 0 && <p className="text-muted">No assets match this audit scope</p>}
          </div>
        </div>

        {/* Right Side: Discrepancy Reports list */}
        <div className="audit-discrepancies-section">
          <h3>Generated Discrepancies ({cycle.discrepancies?.length || 0})</h3>
          <div className="discrepancy-list">
            {(cycle.discrepancies || []).map(d => (
              <div key={d.id} className="discrepancy-card">
                <div className="discrepancy-header">
                  <span className="cell-bold">{d.asset?.asset_tag} — {d.asset?.name}</span>
                  <StatusBadge status={d.issue} />
                </div>
                {d.notes && <p className="discrepancy-notes">Notes: {d.notes}</p>}
                <span className="discrepancy-time">Reported on {new Date(d.generated_on).toLocaleDateString()}</span>
              </div>
            ))}
            {(cycle.discrepancies || []).length === 0 && (
              <div className="empty-state">
                <p>No discrepancies reported. All verified assets match records.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Verification Dialog */}
      <Modal isOpen={showVerifyModal} onClose={() => setShowVerifyModal(false)} title={`Verify Asset: ${selectedAsset?.asset_tag}`}>
        <form onSubmit={handleVerifySubmit} className="modal-form">
          {error && <div className="form-error">{error}</div>}
          {success && <div className="form-success">{success}</div>}
          <div className="form-group">
            <label>Asset Name</label>
            <input type="text" value={selectedAsset?.name || ''} disabled />
          </div>
          <div className="form-group">
            <label>Verification Status *</label>
            <select value={form.verification_status} onChange={e => setForm({ ...form, verification_status: e.target.value })} required>
              <option value="Verified">Verified (Healthy & Match)</option>
              <option value="Missing">Missing</option>
              <option value="Damaged">Damaged / Poor Condition</option>
            </select>
          </div>
          <div className="form-group">
            <label>Verification Notes / Observations</label>
            <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Enter details about condition, location, or mismatch observations..." rows={3} />
          </div>
          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={() => setShowVerifyModal(false)}>Cancel</button>
            <button type="submit" className="btn-primary">Save Verification</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
