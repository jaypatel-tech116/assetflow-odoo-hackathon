import { useState, useEffect } from 'react';
import Tabs from '../../components/Tabs';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import DataTable from '../../components/DataTable';
import { useAuth } from '../../context/AuthContext';
import { getAllocations, allocateAsset, returnAsset } from '../../services/allocationService';
import { getTransfers, createTransferRequest, approveTransfer, rejectTransfer } from '../../services/transferService';
import { getAssets } from '../../services/assetService';
import { getUsers } from '../../services/userService';
import { getDepartments } from '../../services/departmentService';
import './AllocationTransfer.css';

export default function AllocationTransfer() {
  const { user } = useAuth();
  const [tab, setTab] = useState('allocations');
  const [allocations, setAllocations] = useState([]);
  const [allocPagination, setAllocPagination] = useState({});
  const [transfers, setTransfers] = useState([]);
  const [transPagination, setTransPagination] = useState({});
  const [assets, setAssets] = useState([]);
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [modal, setModal] = useState({ open: false, type: null });
  const [form, setForm] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const canAllocate = ['Admin', 'Asset Manager', 'Department Head'].includes(user?.role);

  const fetchAllocations = async (page = 1) => {
    const r = await getAllocations(`page=${page}&limit=15`);
    if (r.success) { setAllocations(r.allocations); setAllocPagination(r.pagination); }
  };
  const fetchTransfers = async (page = 1) => {
    const r = await getTransfers(`page=${page}&limit=15`);
    if (r.success) { setTransfers(r.transfers); setTransPagination(r.pagination); }
  };
  const fetchMeta = async () => {
    const [a, u, d] = await Promise.all([getAssets('limit=500'), getUsers(), getDepartments()]);
    if (a.success) setAssets(a.assets);
    if (u.success) setUsers(u.users);
    if (d.success) setDepartments(d.departments);
  };

  useEffect(() => { Promise.all([fetchAllocations(), fetchTransfers(), fetchMeta()]).then(() => setLoading(false)); }, []);

  const handleAllocate = async (e) => {
    e.preventDefault(); setError('');
    const r = await allocateAsset(form);
    if (r.success) { setModal({ open: false, type: null }); setForm({}); fetchAllocations(); fetchTransfers(); }
    else setError(r.message);
  };
  const handleReturn = async (id) => { await returnAsset(id, {}); fetchAllocations(); };
  const handleTransfer = async (e) => {
    e.preventDefault(); setError('');
    const r = await createTransferRequest(form);
    if (r.success) { setModal({ open: false, type: null }); setForm({}); fetchTransfers(); }
    else setError(r.message);
  };
  const handleApprove = async (id) => { await approveTransfer(id); fetchTransfers(); fetchAllocations(); };
  const handleReject = async (id) => { await rejectTransfer(id); fetchTransfers(); };

  if (loading) return <div className="page-loading"><div className="loading-spinner" /></div>;

  const tabs = [
    { key: 'allocations', label: 'Allocations', count: allocPagination.total },
    { key: 'transfers', label: 'Transfer Requests', count: transPagination.total },
  ];

  const allocColumns = [
    { label: 'Asset', render: r => <span className="cell-bold">{r.asset?.asset_tag} — {r.asset?.name}</span> },
    { label: 'Assigned To', render: r => r.employee?.full_name || r.department?.name || '—' },
    { label: 'Allocated On', key: 'allocated_on' },
    { label: 'Expected Return', render: r => r.expected_return_date || '—' },
    { label: 'Status', render: r => <StatusBadge status={r.status} /> },
  ];

  const transColumns = [
    { label: 'Asset', render: r => <span className="cell-bold">{r.asset?.asset_tag}</span> },
    { label: 'From', render: r => r.currentHolder?.full_name || '—' },
    { label: 'To', render: r => r.targetEmployee?.full_name || r.targetDepartment?.name || '—' },
    { label: 'Requested By', render: r => r.requester?.full_name },
    { label: 'Date', key: 'requested_on' },
    { label: 'Status', render: r => <StatusBadge status={r.status} /> },
  ];

  return (
    <div className="alloc-page">
      <div className="page-header">
        <div><h1 className="page-title">Allocation & Transfer</h1><p className="page-subtitle">Manage asset assignments and transfer requests</p></div>
        <div className="page-actions">
          {canAllocate && <button className="btn-primary" onClick={() => { setModal({ open: true, type: 'allocate' }); setForm({}); setError(''); }}>+ Allocate Asset</button>}
          <button className="btn-secondary" onClick={() => { setModal({ open: true, type: 'transfer' }); setForm({}); setError(''); }}>Request Transfer</button>
        </div>
      </div>
      <Tabs tabs={tabs} activeTab={tab} onTabChange={setTab} />

      {tab === 'allocations' && (
        <DataTable columns={allocColumns} data={allocations} pagination={allocPagination} onPageChange={fetchAllocations}
          actions={(row) => row.status === 'Active' || row.status === 'Overdue' ? <button className="btn-sm" onClick={() => handleReturn(row.id)}>Return</button> : null} />
      )}

      {tab === 'transfers' && (
        <DataTable columns={transColumns} data={transfers} pagination={transPagination} onPageChange={fetchTransfers}
          actions={(row) => row.status === 'Requested' && canAllocate ? (
            <><button className="btn-sm btn-success" onClick={() => handleApprove(row.id)}>Approve</button><button className="btn-sm btn-danger" onClick={() => handleReject(row.id)}>Reject</button></>
          ) : null} />
      )}

      <Modal isOpen={modal.open && modal.type === 'allocate'} onClose={() => setModal({ open: false })} title="Allocate Asset">
        <form onSubmit={handleAllocate} className="modal-form">
          {error && <div className="form-error">{error}</div>}
          <div className="form-group"><label>Asset *</label><select value={form.asset_id || ''} onChange={e => setForm({ ...form, asset_id: e.target.value })} required>
            <option value="">Select...</option>{assets.filter(a => a.status === 'Available').map(a => <option key={a.id} value={a.id}>{a.asset_tag} — {a.name}</option>)}
          </select></div>
          <div className="form-group"><label>Employee</label><select value={form.employee_id || ''} onChange={e => setForm({ ...form, employee_id: e.target.value })}>
            <option value="">Select...</option>{users.map(u => <option key={u.id} value={u.id}>{u.full_name}</option>)}
          </select></div>
          <div className="form-group"><label>Department</label><select value={form.department_id || ''} onChange={e => setForm({ ...form, department_id: e.target.value })}>
            <option value="">Select...</option>{departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select></div>
          <div className="form-group"><label>Expected Return Date</label><input type="date" value={form.expected_return_date || ''} onChange={e => setForm({ ...form, expected_return_date: e.target.value })} /></div>
          <div className="form-actions"><button type="button" className="btn-secondary" onClick={() => setModal({ open: false })}>Cancel</button><button type="submit" className="btn-primary">Allocate</button></div>
        </form>
      </Modal>

      <Modal isOpen={modal.open && modal.type === 'transfer'} onClose={() => setModal({ open: false })} title="Request Transfer">
        <form onSubmit={handleTransfer} className="modal-form">
          {error && <div className="form-error">{error}</div>}
          <div className="form-group"><label>Asset *</label><select value={form.asset_id || ''} onChange={e => setForm({ ...form, asset_id: e.target.value })} required>
            <option value="">Select...</option>{assets.filter(a => a.status === 'Allocated').map(a => <option key={a.id} value={a.id}>{a.asset_tag} — {a.name}</option>)}
          </select></div>
          <div className="form-group"><label>Transfer To Employee</label><select value={form.requested_to_employee_id || ''} onChange={e => setForm({ ...form, requested_to_employee_id: e.target.value })}>
            <option value="">Select...</option>{users.map(u => <option key={u.id} value={u.id}>{u.full_name}</option>)}
          </select></div>
          <div className="form-group"><label>Transfer To Department</label><select value={form.requested_to_department_id || ''} onChange={e => setForm({ ...form, requested_to_department_id: e.target.value })}>
            <option value="">Select...</option>{departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select></div>
          <div className="form-actions"><button type="button" className="btn-secondary" onClick={() => setModal({ open: false })}>Cancel</button><button type="submit" className="btn-primary">Submit Request</button></div>
        </form>
      </Modal>
    </div>
  );
}
