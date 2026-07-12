import { useState, useEffect } from 'react';
import Tabs from '../../components/Tabs';
import Modal from '../../components/Modal';
import StatusBadge from '../../components/StatusBadge';
import { getDepartments, createDepartment, updateDepartment } from '../../services/departmentService';
import { getCategories, createCategory, updateCategory } from '../../services/categoryService';
import { getUsers, updateUserRole, updateUserStatus, updateUserDepartment } from '../../services/userService';
import './OrganizationSetup.css';

export default function OrganizationSetup() {
  const [activeTab, setActiveTab] = useState('departments');
  const [departments, setDepartments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [modal, setModal] = useState({ open: false, type: null, data: null });
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchAll = async () => {
    setLoading(true);
    const [deptRes, catRes, userRes] = await Promise.all([getDepartments(), getCategories(), getUsers()]);
    if (deptRes.success) setDepartments(deptRes.departments);
    if (catRes.success) setCategories(catRes.categories);
    if (userRes.success) setUsers(userRes.users);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const tabs = [
    { key: 'departments', label: 'Departments', count: departments.length },
    { key: 'categories', label: 'Asset Categories', count: categories.length },
    { key: 'employees', label: 'Employee Directory', count: users.length },
  ];

  const openModal = (type, data = null) => {
    setModal({ open: true, type, data });
    setError('');
    setSuccess('');
    if (type === 'editDept' && data) setForm({ name: data.name, department_head_id: data.department_head_id || '', parent_department_id: data.parent_department_id || '', status: data.status });
    else if (type === 'editCat' && data) setForm({ name: data.name, description: data.description || '' });
    else if (type === 'editUser' && data) setForm({ role: data.role, status: data.status, department_id: data.department_id || '' });
    else setForm({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    let result;
    if (modal.type === 'addDept') result = await createDepartment(form);
    else if (modal.type === 'editDept') result = await updateDepartment(modal.data.id, form);
    else if (modal.type === 'addCat') result = await createCategory(form);
    else if (modal.type === 'editCat') result = await updateCategory(modal.data.id, form);
    else if (modal.type === 'editUser') {
      const uid = modal.data.id;
      if (form.role !== modal.data.role) await updateUserRole(uid, form.role);
      if (form.status !== modal.data.status) await updateUserStatus(uid, form.status);
      if (form.department_id !== (modal.data.department_id || '')) await updateUserDepartment(uid, form.department_id || null);
      result = { success: true };
    }
    if (result?.success) {
      setSuccess('Saved successfully');
      await fetchAll();
      setTimeout(() => setModal({ open: false, type: null, data: null }), 500);
    } else setError(result?.message || 'Something went wrong');
  };

  if (loading) return <div className="page-loading"><div className="loading-spinner" /></div>;

  return (
    <div className="org-page">
      <div className="page-header">
        <h1 className="page-title">Organization Setup</h1>
        <div className="page-actions">
          {activeTab === 'departments' && <button className="btn-primary" onClick={() => openModal('addDept')}>+ Add Department</button>}
          {activeTab === 'categories' && <button className="btn-primary" onClick={() => openModal('addCat')}>+ Add Category</button>}
        </div>
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === 'departments' && (
        <div className="org-card"><table className="data-table"><thead><tr><th>Name</th><th>Head</th><th>Parent</th><th>Status</th><th>Actions</th></tr></thead><tbody>
          {departments.map(d => (
            <tr key={d.id}>
              <td className="cell-bold">{d.name}</td>
              <td>{d.head?.full_name || '—'}</td>
              <td>{d.parent?.name || '—'}</td>
              <td><StatusBadge status={d.status} /></td>
              <td><button className="btn-sm" onClick={() => openModal('editDept', d)}>Edit</button></td>
            </tr>
          ))}
          {departments.length === 0 && <tr><td colSpan={5} className="data-table-empty">No departments yet</td></tr>}
        </tbody></table></div>
      )}

      {activeTab === 'categories' && (
        <div className="org-card"><table className="data-table"><thead><tr><th>Name</th><th>Description</th><th>Actions</th></tr></thead><tbody>
          {categories.map(c => (
            <tr key={c.id}>
              <td className="cell-bold">{c.name}</td>
              <td>{c.description || '—'}</td>
              <td><button className="btn-sm" onClick={() => openModal('editCat', c)}>Edit</button></td>
            </tr>
          ))}
          {categories.length === 0 && <tr><td colSpan={3} className="data-table-empty">No categories yet</td></tr>}
        </tbody></table></div>
      )}

      {activeTab === 'employees' && (
        <div className="org-card"><table className="data-table"><thead><tr><th>Name</th><th>Email</th><th>Department</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead><tbody>
          {users.map(u => (
            <tr key={u.id}>
              <td className="cell-bold">{u.full_name}</td>
              <td>{u.email}</td>
              <td>{u.department?.name || '—'}</td>
              <td><StatusBadge status={u.role} /></td>
              <td><StatusBadge status={u.status} /></td>
              <td><button className="btn-sm" onClick={() => openModal('editUser', u)}>Edit</button></td>
            </tr>
          ))}
          {users.length === 0 && <tr><td colSpan={6} className="data-table-empty">No users yet</td></tr>}
        </tbody></table></div>
      )}

      {/* Modal */}
      <Modal isOpen={modal.open} onClose={() => setModal({ open: false, type: null, data: null })} title={
        modal.type === 'addDept' ? 'Add Department' : modal.type === 'editDept' ? 'Edit Department' :
        modal.type === 'addCat' ? 'Add Category' : modal.type === 'editCat' ? 'Edit Category' :
        modal.type === 'editUser' ? 'Edit Employee' : ''
      }>
        <form onSubmit={handleSubmit} className="modal-form">
          {error && <div className="form-error">{error}</div>}
          {success && <div className="form-success">{success}</div>}

          {(modal.type === 'addDept' || modal.type === 'editDept') && (
            <>
              <div className="form-group"><label>Department Name *</label><input type="text" value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} required /></div>
              <div className="form-group"><label>Department Head</label><select value={form.department_head_id || ''} onChange={e => setForm({ ...form, department_head_id: e.target.value })}>
                <option value="">None</option>{users.map(u => <option key={u.id} value={u.id}>{u.full_name}</option>)}
              </select></div>
              <div className="form-group"><label>Parent Department</label><select value={form.parent_department_id || ''} onChange={e => setForm({ ...form, parent_department_id: e.target.value })}>
                <option value="">None</option>{departments.filter(d => d.id !== modal.data?.id).map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select></div>
              {modal.type === 'editDept' && <div className="form-group"><label>Status</label><select value={form.status || 'Active'} onChange={e => setForm({ ...form, status: e.target.value })}>
                <option>Active</option><option>Inactive</option>
              </select></div>}
            </>
          )}

          {(modal.type === 'addCat' || modal.type === 'editCat') && (
            <>
              <div className="form-group"><label>Category Name *</label><input type="text" value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} required /></div>
              <div className="form-group"><label>Description</label><textarea value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} /></div>
            </>
          )}

          {modal.type === 'editUser' && (
            <>
              <div className="form-group"><label>Role</label><select value={form.role || ''} onChange={e => setForm({ ...form, role: e.target.value })}>
                <option>Employee</option><option>Department Head</option><option>Asset Manager</option><option>Admin</option>
              </select></div>
              <div className="form-group"><label>Status</label><select value={form.status || ''} onChange={e => setForm({ ...form, status: e.target.value })}>
                <option>Active</option><option>Inactive</option>
              </select></div>
              <div className="form-group"><label>Department</label><select value={form.department_id || ''} onChange={e => setForm({ ...form, department_id: e.target.value })}>
                <option value="">None</option>{departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select></div>
            </>
          )}

          <div className="form-actions"><button type="button" className="btn-secondary" onClick={() => setModal({ open: false, type: null, data: null })}>Cancel</button><button type="submit" className="btn-primary">Save</button></div>
        </form>
      </Modal>
    </div>
  );
}
