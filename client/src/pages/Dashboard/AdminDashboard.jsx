import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboardData } from '../../services/dashboardService';
import KpiCard from '../../components/KpiCard';
import StatusBadge from '../../components/StatusBadge';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      const result = await getDashboardData();
      if (result.success) setData(result);
      setLoading(false);
    };
    fetch();
  }, []);

  if (loading) return <div className="page-loading"><div className="loading-spinner" /></div>;

  const kpi = data?.kpi || {};

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Overview of your asset management system</p>
      </div>

      <div className="kpi-grid">
        <KpiCard title="Assets Available" value={kpi.assetsAvailable || 0} color="#16a34a"
          icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg>} />
        <KpiCard title="Assets Allocated" value={kpi.assetsAllocated || 0} color="#2563eb"
          icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>} />
        <KpiCard title="Maintenance Active" value={kpi.maintenanceToday || 0} color="#ea580c"
          icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg>} />
        <KpiCard title="Active Bookings" value={kpi.activeBookings || 0} color="#7c3aed"
          icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>} />
        <KpiCard title="Pending Approvals" value={kpi.pendingApprovals || 0} color="#dc2626"
          icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>} />
        <KpiCard title="Upcoming Returns" value={kpi.upcomingReturns || 0} color="#0891b2"
          icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg>} />
      </div>

      {/* Overdue Allocations */}
      <div className="dashboard-section">
        <div className="dashboard-section-header">
          <h2>Overdue Allocations</h2>
          <button className="btn-link" onClick={() => navigate('/allocations')}>View All</button>
        </div>
        <div className="dashboard-table-card">
          <table className="data-table">
            <thead><tr><th>Asset</th><th>Assigned To</th><th>Expected Return</th><th>Status</th></tr></thead>
            <tbody>
              {(data?.overdueAllocations || []).length === 0 ? (
                <tr><td colSpan={4} className="data-table-empty">No overdue allocations 🎉</td></tr>
              ) : data.overdueAllocations.map(a => (
                <tr key={a.id}>
                  <td className="cell-bold">{a.asset?.asset_tag} — {a.asset?.name}</td>
                  <td>{a.employee?.full_name || a.department?.name || '—'}</td>
                  <td>{a.expected_return_date}</td>
                  <td><StatusBadge status="Overdue" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pending Transfers + Maintenance side by side */}
      <div className="dashboard-cols">
        <div className="dashboard-section">
          <div className="dashboard-section-header">
            <h2>Pending Transfers</h2>
            <button className="btn-link" onClick={() => navigate('/allocations')}>View All</button>
          </div>
          <div className="dashboard-table-card">
            <table className="data-table">
              <thead><tr><th>Asset</th><th>Requested By</th><th>Date</th></tr></thead>
              <tbody>
                {(data?.pendingTransfers || []).length === 0 ? (
                  <tr><td colSpan={3} className="data-table-empty">No pending transfers</td></tr>
                ) : data.pendingTransfers.map(t => (
                  <tr key={t.id}>
                    <td className="cell-bold">{t.asset?.asset_tag}</td>
                    <td>{t.requester?.full_name}</td>
                    <td>{t.requested_on}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="dashboard-section">
          <div className="dashboard-section-header">
            <h2>Pending Maintenance</h2>
            <button className="btn-link" onClick={() => navigate('/maintenance')}>View All</button>
          </div>
          <div className="dashboard-table-card">
            <table className="data-table">
              <thead><tr><th>Code</th><th>Asset</th><th>Raised By</th></tr></thead>
              <tbody>
                {(data?.pendingMaintenance || []).length === 0 ? (
                  <tr><td colSpan={3} className="data-table-empty">No pending requests</td></tr>
                ) : data.pendingMaintenance.map(m => (
                  <tr key={m.id}>
                    <td className="cell-bold">{m.request_code}</td>
                    <td>{m.asset?.asset_tag} — {m.asset?.name}</td>
                    <td>{m.raisedByUser?.full_name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
