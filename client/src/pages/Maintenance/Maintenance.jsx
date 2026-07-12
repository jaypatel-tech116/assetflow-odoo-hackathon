import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getMaintenanceRequests, createMaintenanceRequest, approveMaintenanceRequest, rejectMaintenanceRequest, assignTechnician, startMaintenance, resolveMaintenance, closeMaintenance } from '../../services/maintenanceService';
import { getAssets } from '../../services/assetService';
import { getUsers } from '../../services/userService';
import StatusBadge from '../../components/StatusBadge';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import './Maintenance.css';

const WORKFLOW_STEPS = ['Pending', 'Approved', 'Technician Assigned', 'In Progress', 'Resolved', 'Closed'];

export default function Maintenance() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [pagination, setPagination] = useState({});
  const [assets, setAssets] = useState([]);
  const [users, setUsers] = useState([]);
  const [modal, setModal] = useState({ open: false, type: null, data: null });
  const [form, setForm] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const canManage = ['Admin', 'Asset Manager'].includes(user?.role);

  const fetchRequests = async (page = 1) => {
    const params = `page=${page}&limit=15${filterStatus ? '&status=' + filterStatus : ''}`;
    const r = await getMaintenanceRequests(params);
    if (r.success) { setRequests(r.maintenanceRequests); setPagination(r.pagination); }
  };

  useEffect(() => {
    const init = async () => {
      const [a, u] = await Promise.all([getAssets('limit=500'), getUsers()]);
      if (a.success) setAssets(a.assets);
      if (u.success) setUsers(u.users);
      setLoading(false);
    };
    init(); fetchRequests();
  }, []);

  useEffect(() => { fetchRequests(); }, [filterStatus]);

  const handleCreate = async (e) => {
    e.preventDefault(); setError('');
    const fd = new FormData();
    fd.append('asset_id', form.asset_id);
    fd.append('issue_description', form.issue_description);
    fd.append('priority', form.priority || 'Medium');
    if (form.photo) fd.append('photo', form.photo);
    const r = await createMaintenanceRequest(fd);
    if (r.success) { setModal({ open: false }); setForm({}); fetchRequests(); }
    else setError(r.message);
  };

  const doAction = async (action, id, data = {}) => {
    const actions = { approve: approveMaintenanceRequest, reject: rejectMaintenanceRequest, assign: assignTechnician, start: startMaintenance, resolve: resolveMaintenance, close: closeMaintenance };
    await actions[action](id, data);
    fetchRequests();
  };

  const columns = [
    { label: 'Code', render: r => <span className="cell-bold">{r.request_code}</span> },
    { label: 'Asset', render: r => `${r.asset?.asset_tag} — ${r.asset?.name}` },
    { label: 'Raised By', render: r => r.raisedByUser?.full_name },
    { label: 'Priority', render: r => <StatusBadge status={r.priority} /> },
    { label: 'Status', render: r => <StatusBadge status={r.status} /> },
    { label: 'Date', key: 'raised_on' },
  ];

  if (loading) return <div className="page-loading"><div className="loading-spinner" /></div>;

  return (
    <div className="maint-page">
      <div className="page-header">
        <div><h1 className="page-title">Maintenance Management</h1><p className="page-subtitle">Track maintenance requests through the full workflow</p></div>
        <button className="btn-primary" onClick={() => { setModal({ open: true, type: 'create' }); setForm({}); setError(''); }}>+ Raise Request</button>
      </div>

      {/* Workflow visual */}
      <div className="workflow-bar">
        {WORKFLOW_STEPS.map((step, i) => (
          <div key={step} className="workflow-step">
            <div className="workflow-dot" /><span>{step}</span>
            {i < WORKFLOW_STEPS.length - 1 && <div className="workflow-line" />}
          </div>
        ))}
      </div>

      <div className="filter-bar">
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="filter-select">
          <option value="">All Statuses</option>
          {WORKFLOW_STEPS.concat(['Rejected']).map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      <DataTable columns={columns} data={requests} pagination={pagination} onPageChange={fetchRequests}
        actions={(row) => (
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {row.status === 'Pending' && canManage && <><button className="btn-sm btn-success" onClick={() => doAction('approve', row.id)}>Approve</button><button className="btn-sm btn-danger" onClick={() => doAction('reject', row.id)}>Reject</button></>}
            {row.status === 'Approved' && canManage && <button className="btn-sm" onClick={() => { setModal({ open: true, type: 'assign', data: row }); setForm({}); }}>Assign</button>}
            {row.status === 'Technician Assigned' && canManage && <button className="btn-sm" onClick={() => doAction('start', row.id)}>Start</button>}
            {row.status === 'In Progress' && <button className="btn-sm btn-success" onClick={() => doAction('resolve', row.id)}>Resolve</button>}
            {row.status === 'Resolved' && canManage && <button className="btn-sm" onClick={() => doAction('close', row.id)}>Close</button>}
          </div>
        )} />

      {/* Create modal */}
      <Modal isOpen={modal.open && modal.type === 'create'} onClose={() => setModal({ open: false })} title="Raise Maintenance Request">
        <form onSubmit={handleCreate} className="modal-form">
          {error && <div className="form-error">{error}</div>}
          <div className="form-group"><label>Asset *</label><select value={form.asset_id || ''} onChange={e => setForm({ ...form, asset_id: e.target.value })} required>
            <option value="">Select...</option>{assets.map(a => <option key={a.id} value={a.id}>{a.asset_tag} — {a.name}</option>)}
          </select></div>
          <div className="form-group"><label>Issue Description *</label><textarea value={form.issue_description || ''} onChange={e => setForm({ ...form, issue_description: e.target.value })} rows={4} required /></div>
          <div className="form-group"><label>Priority</label><select value={form.priority || 'Medium'} onChange={e => setForm({ ...form, priority: e.target.value })}>
            <option>Low</option><option>Medium</option><option>High</option>
          </select></div>
          <div className="form-group"><label>Photo</label><input type="file" accept="image/*" onChange={e => setForm({ ...form, photo: e.target.files[0] })} /></div>
          <div className="form-actions"><button type="button" className="btn-secondary" onClick={() => setModal({ open: false })}>Cancel</button><button type="submit" className="btn-primary">Submit</button></div>
        </form>
      </Modal>

      {/* Assign technician modal */}
      <Modal isOpen={modal.open && modal.type === 'assign'} onClose={() => setModal({ open: false })} title="Assign Technician" size="small">
        <form onSubmit={async (e) => { e.preventDefault(); await doAction('assign', modal.data.id, form); setModal({ open: false }); }} className="modal-form">
          <div className="form-group"><label>Technician *</label><select value={form.technician_id || ''} onChange={e => setForm({ ...form, technician_id: e.target.value })} required>
            <option value="">Select...</option>{users.map(u => <option key={u.id} value={u.id}>{u.full_name}</option>)}
          </select></div>
          <div className="form-group"><label>ETA</label><input type="datetime-local" value={form.eta || ''} onChange={e => setForm({ ...form, eta: e.target.value })} /></div>
          <div className="form-actions"><button type="button" className="btn-secondary" onClick={() => setModal({ open: false })}>Cancel</button><button type="submit" className="btn-primary">Assign</button></div>
        </form>
      </Modal>
    </div>
  );
}
