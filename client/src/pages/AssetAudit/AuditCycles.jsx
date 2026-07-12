import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuditCycles, createAuditCycle } from '../../services/auditService';
import { getDepartments } from '../../services/departmentService';
import { getUsers } from '../../services/userService';
import StatusBadge from '../../components/StatusBadge';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import './AuditCycles.css';

export default function AuditCycles() {
  const navigate = useNavigate();
  const [cycles, setCycles] = useState([]);
  const [pagination, setPagination] = useState({});
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({});
  const [error, setError] = useState('');

  const fetchCycles = async (page = 1) => {
    const r = await getAuditCycles(`page=${page}&limit=15`);
    if (r.success) {
      setCycles(r.auditCycles);
      setPagination(r.pagination);
    }
  };

  useEffect(() => {
    const init = async () => {
      const [deptRes, userRes] = await Promise.all([getDepartments(), getUsers()]);
      if (deptRes.success) setDepartments(deptRes.departments);
      if (userRes.success) setUsers(userRes.users);
      await fetchCycles();
      setLoading(false);
    };
    init();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    const auditorIds = form.auditor_ids ? form.auditor_ids.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id)) : [];
    const r = await createAuditCycle({
      title: form.title,
      scope_department_id: form.scope_department_id || null,
      scope_location: form.scope_location || null,
      start_date: form.start_date,
      end_date: form.end_date,
      lead_auditor_id: parseInt(form.lead_auditor_id),
      auditor_ids: auditorIds,
    });
    if (r.success) {
      setShowCreate(false);
      setForm({});
      fetchCycles();
    } else {
      setError(r.message || 'Failed to create audit cycle');
    }
  };

  const columns = [
    { label: 'Code', render: r => <span className="cell-bold">{r.cycle_code}</span> },
    { label: 'Title', key: 'title' },
    { label: 'Scope Dept', render: r => r.scopeDepartment?.name || 'All' },
    { label: 'Lead Auditor', render: r => r.leadAuditor?.full_name || '—' },
    { label: 'Progress', render: r => `${r.completed_count} / ${r.total_assets} (${r.total_assets > 0 ? Math.round((r.completed_count / r.total_assets) * 100) : 0}%)` },
    { label: 'Status', render: r => <StatusBadge status={r.status} /> },
  ];

  if (loading) return <div className="page-loading"><div className="loading-spinner" /></div>;

  return (
    <div className="audit-cycles-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Asset Auditing</h1>
          <p className="page-subtitle">Schedule and run periodic physical asset audits</p>
        </div>
        <button className="btn-primary" onClick={() => { setShowCreate(true); setForm({}); setError(''); }}>+ Create Audit Cycle</button>
      </div>

      <DataTable columns={columns} data={cycles} pagination={pagination} onPageChange={fetchCycles}
        actions={(row) => <button className="btn-sm" onClick={() => navigate(`/audits/${row.id}`)}>Details / Perform</button>} />

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create Audit Cycle">
        <form onSubmit={handleCreate} className="modal-form">
          {error && <div className="form-error">{error}</div>}
          <div className="form-group">
            <label>Audit Title *</label>
            <input type="text" value={form.title || ''} onChange={e => setForm({ ...form, title: e.target.value })} required placeholder="e.g. Q3 IT Hardware Audit" />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Scope Department</label>
              <select value={form.scope_department_id || ''} onChange={e => setForm({ ...form, scope_department_id: e.target.value })}>
                <option value="">All Departments</option>
                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Scope Location</label>
              <input type="text" value={form.scope_location || ''} onChange={e => setForm({ ...form, scope_location: e.target.value })} placeholder="e.g. Building A" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Start Date *</label>
              <input type="date" value={form.start_date || ''} onChange={e => setForm({ ...form, start_date: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>End Date *</label>
              <input type="date" value={form.end_date || ''} onChange={e => setForm({ ...form, end_date: e.target.value })} required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Lead Auditor *</label>
              <select value={form.lead_auditor_id || ''} onChange={e => setForm({ ...form, lead_auditor_id: e.target.value })} required>
                <option value="">Select...</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.full_name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Auditor IDs (Comma separated)</label>
              <input type="text" value={form.auditor_ids || ''} onChange={e => setForm({ ...form, auditor_ids: e.target.value })} placeholder="e.g. 2, 3" />
            </div>
          </div>
          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
            <button type="submit" className="btn-primary">Create</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
