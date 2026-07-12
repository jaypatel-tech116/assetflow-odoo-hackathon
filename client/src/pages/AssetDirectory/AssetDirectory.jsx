import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAssets, createAsset } from '../../services/assetService';
import { getCategories } from '../../services/categoryService';
import { getDepartments } from '../../services/departmentService';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import DataTable from '../../components/DataTable';
import { useAuth } from '../../context/AuthContext';
import './AssetDirectory.css';

export default function AssetDirectory() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [assets, setAssets] = useState([]);
  const [pagination, setPagination] = useState({});
  const [categories, setCategories] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [filters, setFilters] = useState({ category_id: '', status: '', department_id: '', search: '' });
  const [loading, setLoading] = useState(true);
  const [showRegister, setShowRegister] = useState(false);
  const [form, setForm] = useState({});
  const [error, setError] = useState('');
  const canManage = ['Admin', 'Asset Manager'].includes(user?.role);

  const fetchAssets = async (page = 1) => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: 20 });
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
    const result = await getAssets(`${params}`);
    if (result.success) { setAssets(result.assets); setPagination(result.pagination); }
    setLoading(false);
  };

  useEffect(() => { fetchAssets(); }, [filters]);
  useEffect(() => {
    Promise.all([getCategories(), getDepartments()]).then(([c, d]) => {
      if (c.success) setCategories(c.categories);
      if (d.success) setDepartments(d.departments);
    });
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => { if (v !== '' && v !== null && v !== undefined) fd.append(k, v); });
    const result = await createAsset(fd);
    if (result.success) { setShowRegister(false); setForm({}); fetchAssets(); }
    else setError(result.message || 'Failed to register asset');
  };

  const columns = [
    { label: 'Tag', key: 'asset_tag', render: (r) => <span className="cell-bold">{r.asset_tag}</span> },
    { label: 'Name', key: 'name' },
    { label: 'Category', render: (r) => r.category?.name || '—' },
    { label: 'Department', render: (r) => r.department?.name || '—' },
    { label: 'Condition', key: 'condition' },
    { label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <div className="asset-page">
      <div className="page-header">
        <div><h1 className="page-title">Asset Directory</h1><p className="page-subtitle">Browse, search, and manage all registered assets</p></div>
        {canManage && <button className="btn-primary" onClick={() => setShowRegister(true)}>+ Register Asset</button>}
      </div>

      <div className="filter-bar">
        <input type="text" placeholder="Search by tag, name, serial..." value={filters.search} onChange={e => setFilters({ ...filters, search: e.target.value })} className="filter-input" />
        <select value={filters.category_id} onChange={e => setFilters({ ...filters, category_id: e.target.value })} className="filter-select">
          <option value="">All Categories</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })} className="filter-select">
          <option value="">All Statuses</option>
          {['Available','Allocated','Reserved','Under Maintenance','Lost','Retired','Disposed'].map(s => <option key={s}>{s}</option>)}
        </select>
        <select value={filters.department_id} onChange={e => setFilters({ ...filters, department_id: e.target.value })} className="filter-select">
          <option value="">All Departments</option>{departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
      </div>

      {loading ? <div className="page-loading"><div className="loading-spinner" /></div> : (
        <DataTable columns={columns} data={assets} pagination={pagination} onPageChange={fetchAssets}
          actions={(row) => (
            <button className="btn-sm" onClick={() => navigate(`/assets/${row.id}`)}>View</button>
          )} />
      )}

      <Modal isOpen={showRegister} onClose={() => setShowRegister(false)} title="Register New Asset" size="large">
        <form onSubmit={handleRegister} className="modal-form">
          {error && <div className="form-error">{error}</div>}
          <div className="form-row">
            <div className="form-group"><label>Asset Name *</label><input type="text" value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} required /></div>
            <div className="form-group"><label>Category *</label><select value={form.category_id || ''} onChange={e => setForm({ ...form, category_id: e.target.value })} required>
              <option value="">Select...</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Serial Number</label><input type="text" value={form.serial_number || ''} onChange={e => setForm({ ...form, serial_number: e.target.value })} /></div>
            <div className="form-group"><label>Condition</label><select value={form.condition || 'New'} onChange={e => setForm({ ...form, condition: e.target.value })}>
              <option>New</option><option>Good</option><option>Fair</option><option>Poor</option>
            </select></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Acquisition Date</label><input type="date" value={form.acquisition_date || ''} onChange={e => setForm({ ...form, acquisition_date: e.target.value })} /></div>
            <div className="form-group"><label>Acquisition Cost</label><input type="number" step="0.01" value={form.acquisition_cost || ''} onChange={e => setForm({ ...form, acquisition_cost: e.target.value })} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Location</label><input type="text" value={form.location || ''} onChange={e => setForm({ ...form, location: e.target.value })} /></div>
            <div className="form-group"><label>Department</label><select value={form.department_id || ''} onChange={e => setForm({ ...form, department_id: e.target.value })}>
              <option value="">None</option>{departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Shared / Bookable?</label><select value={form.is_shared_bookable || 'false'} onChange={e => setForm({ ...form, is_shared_bookable: e.target.value })}>
              <option value="false">No</option><option value="true">Yes</option>
            </select></div>
            <div className="form-group"><label>Capacity (if bookable)</label><input type="number" value={form.capacity || ''} onChange={e => setForm({ ...form, capacity: e.target.value })} /></div>
          </div>
          <div className="form-group"><label>Photo</label><input type="file" accept="image/*" onChange={e => setForm({ ...form, photo: e.target.files[0] })} /></div>
          <div className="form-actions"><button type="button" className="btn-secondary" onClick={() => setShowRegister(false)}>Cancel</button><button type="submit" className="btn-primary">Register Asset</button></div>
        </form>
      </Modal>
    </div>
  );
}
