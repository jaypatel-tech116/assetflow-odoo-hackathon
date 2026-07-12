import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAssetById, getAssetHistory } from '../../services/assetService';
import StatusBadge from '../../components/StatusBadge';
import './AssetDetails.css';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

export default function AssetDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [asset, setAsset] = useState(null);
  const [history, setHistory] = useState({ allocations: [], maintenanceHistory: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const [assetRes, histRes] = await Promise.all([getAssetById(id), getAssetHistory(id)]);
      if (assetRes.success) setAsset(assetRes.asset);
      if (histRes.success) setHistory(histRes);
      setLoading(false);
    };
    fetch();
  }, [id]);

  if (loading) return <div className="page-loading"><div className="loading-spinner" /></div>;
  if (!asset) return <div className="page-loading"><p>Asset not found</p></div>;

  return (
    <div className="asset-details-page">
      <button className="btn-back" onClick={() => navigate('/assets')}>← Back to Directory</button>
      <div className="asset-details-header">
        <div className="asset-details-info">
          <div className="asset-tag-badge">{asset.asset_tag}</div>
          <h1>{asset.name}</h1>
          <StatusBadge status={asset.status} />
        </div>
        {asset.photo_url && <img src={`${API_BASE}${asset.photo_url}`} alt={asset.name} className="asset-photo" />}
      </div>

      <div className="detail-grid">
        <div className="detail-card">
          <h3>General Information</h3>
          <div className="detail-rows">
            <div className="detail-row"><span>Category</span><span>{asset.category?.name}</span></div>
            <div className="detail-row"><span>Serial Number</span><span>{asset.serial_number || '—'}</span></div>
            <div className="detail-row"><span>Condition</span><span>{asset.condition}</span></div>
            <div className="detail-row"><span>Location</span><span>{asset.location || '—'}</span></div>
            <div className="detail-row"><span>Department</span><span>{asset.department?.name || '—'}</span></div>
          </div>
        </div>
        <div className="detail-card">
          <h3>Financial & Ownership</h3>
          <div className="detail-rows">
            <div className="detail-row"><span>Acquisition Date</span><span>{asset.acquisition_date || '—'}</span></div>
            <div className="detail-row"><span>Acquisition Cost</span><span>{asset.acquisition_cost ? `$${Number(asset.acquisition_cost).toLocaleString()}` : '—'}</span></div>
            <div className="detail-row"><span>Created By</span><span>{asset.creator?.full_name || '—'}</span></div>
            <div className="detail-row"><span>Bookable</span><span>{asset.is_shared_bookable ? 'Yes' : 'No'}</span></div>
            {asset.is_shared_bookable && <div className="detail-row"><span>Capacity</span><span>{asset.capacity || '—'}</span></div>}
          </div>
        </div>
      </div>

      <div className="detail-card" style={{ marginTop: 20 }}>
        <h3>Allocation History</h3>
        <table className="data-table"><thead><tr><th>Assigned To</th><th>Department</th><th>From</th><th>To</th><th>Status</th></tr></thead><tbody>
          {history.allocations.length === 0 ? <tr><td colSpan={5} className="data-table-empty">No allocation history</td></tr> :
            history.allocations.map(a => <tr key={a.id}><td>{a.employee?.full_name || '—'}</td><td>{a.department?.name || '—'}</td><td>{a.allocated_on}</td><td>{a.returned_on || '—'}</td><td><StatusBadge status={a.status} /></td></tr>)}
        </tbody></table>
      </div>

      <div className="detail-card" style={{ marginTop: 20 }}>
        <h3>Maintenance History</h3>
        <table className="data-table"><thead><tr><th>Code</th><th>Issue</th><th>Priority</th><th>Date</th><th>Status</th></tr></thead><tbody>
          {history.maintenanceHistory.length === 0 ? <tr><td colSpan={5} className="data-table-empty">No maintenance history</td></tr> :
            history.maintenanceHistory.map(m => <tr key={m.id}><td className="cell-bold">{m.request_code}</td><td>{m.issue_description?.substring(0, 60)}</td><td><StatusBadge status={m.priority} /></td><td>{m.raised_on}</td><td><StatusBadge status={m.status} /></td></tr>)}
        </tbody></table>
      </div>
    </div>
  );
}
