import { useState, useEffect } from 'react';
import { getActivityLogs, getActivityLogModules } from '../../services/activityLogService';
import DataTable from '../../components/DataTable';
import './ActivityLogs.css';

export default function ActivityLogs() {
  const [logs, setLogs] = useState([]);
  const [modules, setModules] = useState([]);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({ module: '', search: '', start_date: '', end_date: '' });
  const [loading, setLoading] = useState(true);

  const fetchLogs = async (page = 1) => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: 20 });
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
    const result = await getActivityLogs(`${params}`);
    if (result.success) {
      setLogs(result.logs);
      setPagination(result.pagination);
    }
    setLoading(false);
  };

  useEffect(() => {
    getActivityLogModules().then(res => {
      if (res.success) setModules(res.modules);
    });
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [filters]);

  const columns = [
    { label: 'Timestamp', render: r => new Date(r.timestamp).toLocaleString() },
    { label: 'User', render: r => <span className="cell-bold">{r.user?.full_name} ({r.user?.role})</span> },
    { label: 'Module', key: 'module' },
    { label: 'Action', key: 'action' },
    { label: 'Details', render: r => <span className="log-details-text">{r.details || '—'}</span> },
  ];

  return (
    <div className="activity-logs-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Activity Logs</h1>
          <p className="page-subtitle">Audit trail of all actions and modifications across modules</p>
        </div>
      </div>

      <div className="filter-bar">
        <input type="text" placeholder="Search action or details..." value={filters.search} onChange={e => setFilters({ ...filters, search: e.target.value })} className="filter-input" />
        <select value={filters.module} onChange={e => setFilters({ ...filters, module: e.target.value })} className="filter-select">
          <option value="">All Modules</option>
          {modules.map(m => <option key={m}>{m}</option>)}
        </select>
        <div className="date-filter-group">
          <input type="date" value={filters.start_date} onChange={e => setFilters({ ...filters, start_date: e.target.value })} className="filter-select" />
          <span className="date-sep">to</span>
          <input type="date" value={filters.end_date} onChange={e => setFilters({ ...filters, end_date: e.target.value })} className="filter-select" />
        </div>
      </div>

      {loading ? <div className="page-loading"><div className="loading-spinner" /></div> : (
        <DataTable columns={columns} data={logs} pagination={pagination} onPageChange={fetchLogs} />
      )}
    </div>
  );
}
