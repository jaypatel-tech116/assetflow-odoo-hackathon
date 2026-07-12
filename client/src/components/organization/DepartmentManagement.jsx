import { useState, useEffect } from 'react';
import { getDepartments, createDepartment, updateDepartment, deleteDepartment, getEmployees } from '../../services/organizationService';

export default function DepartmentManagement() {
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [formData, setFormData] = useState({
    id: null,
    name: '',
    parent_id: '',
    head_id: '',
    status: 'Active',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [depRes, empRes] = await Promise.all([
        getDepartments(),
        getEmployees(),
      ]);
      if (depRes.success) setDepartments(depRes.departments);
      if (empRes.success) setEmployees(empRes.employees);
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSubmit = {
        name: formData.name,
        parent_id: formData.parent_id || null,
        head_id: formData.head_id || null,
        status: formData.status,
      };

      if (formData.id) {
        await updateDepartment(formData.id, dataToSubmit);
      } else {
        await createDepartment(dataToSubmit);
      }
      
      handleReset();
      fetchData(); // Refresh list
    } catch (error) {
      console.error('Failed to save department', error);
    }
  };

  const handleEdit = (dept) => {
    setFormData({
      id: dept.id,
      name: dept.name,
      parent_id: dept.parent_id || '',
      head_id: dept.head_id || '',
      status: dept.status,
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this department?')) return;
    try {
      await deleteDepartment(id);
      fetchData();
    } catch (error) {
      console.error('Failed to delete department', error);
    }
  };

  const handleReset = () => {
    setFormData({
      id: null,
      name: '',
      parent_id: '',
      head_id: '',
      status: 'Active',
    });
  };

  return (
    <div className="org-split-layout">
      {/* Left side: Table */}
      <div className="org-card">
        <div className="org-card-header">
          <h2 className="org-card-title">Department Management</h2>
          <button className="org-btn-primary" onClick={handleReset}>+ Add Department</button>
        </div>
        
        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <table className="dash-table">
            <thead>
              <tr>
                <th>Department Name</th>
                <th>Department Head</th>
                <th>Parent Department</th>
                <th>Status</th>
                <th>Employee Count</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {departments.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{textAlign: 'center'}}>No departments found.</td>
                </tr>
              ) : (
                departments.map(dept => (
                  <tr key={dept.id}>
                    <td style={{fontWeight: 500}}>{dept.name}</td>
                    <td>
                      {dept.head ? (
                        <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                          <div style={{width: 24, height: 24, borderRadius: '50%', background: '#e0e7ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold'}}>
                            {dept.head.full_name.substring(0, 2).toUpperCase()}
                          </div>
                          <span>{dept.head.full_name}</span>
                        </div>
                      ) : '-'}
                    </td>
                    <td>{dept.parent ? dept.parent.name : '-'}</td>
                    <td>
                      <span className={`status-badge ${dept.status === 'Active' ? 'status-active' : 'status-inactive'}`}>
                        {dept.status}
                      </span>
                    </td>
                    <td>{dept.employee_count}</td>
                    <td>
                      <div style={{display: 'flex', gap: '10px'}}>
                        <button onClick={() => handleEdit(dept)} style={{background: 'transparent', border: 'none', cursor: 'pointer', color: '#6b7280'}}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                        <button onClick={() => handleDelete(dept.id)} style={{background: 'transparent', border: 'none', cursor: 'pointer', color: '#ef4444'}}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
        
        <div style={{marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', color: '#6b7280'}}>
          <span>Showing 1 to {departments.length} of {departments.length} entries</span>
          <div style={{display: 'flex', gap: '4px'}}>
            <button style={{width: 32, height: 32, borderRadius: '6px', border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer'}}>&lt;</button>
            <button style={{width: 32, height: 32, borderRadius: '6px', border: '1px solid #4f46e5', background: '#4f46e5', color: '#fff', cursor: 'pointer'}}>1</button>
            <button style={{width: 32, height: 32, borderRadius: '6px', border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer'}}>&gt;</button>
          </div>
        </div>
      </div>

      {/* Right side: Form */}
      <div className="org-card">
        <h3 className="org-card-title" style={{marginBottom: '20px'}}>
          {formData.id ? 'Edit Department' : 'Add Department'}
        </h3>
        <form onSubmit={handleSubmit}>
          <div className="org-form-group">
            <label className="org-form-label">Department Name <span className="required">*</span></label>
            <input 
              type="text" 
              name="name" 
              className="org-form-input" 
              placeholder="Enter department name"
              value={formData.name}
              onChange={handleChange}
              required 
            />
          </div>

          <div className="org-form-group">
            <label className="org-form-label">Parent Department (Optional)</label>
            <select 
              name="parent_id" 
              className="org-form-select"
              value={formData.parent_id}
              onChange={handleChange}
            >
              <option value="">Select parent department</option>
              {departments.filter(d => d.id !== formData.id).map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div className="org-form-group">
            <label className="org-form-label">Assign Department Head <span className="required">*</span></label>
            <select 
              name="head_id" 
              className="org-form-select"
              value={formData.head_id}
              onChange={handleChange}
              required
            >
              <option value="">Select employee</option>
              {employees.map(e => (
                <option key={e.id} value={e.id}>{e.full_name} ({e.email})</option>
              ))}
            </select>
          </div>

          <div className="org-form-group">
            <label className="org-form-label">Status <span className="required">*</span></label>
            <div style={{display: 'flex', gap: '16px', marginTop: '8px'}}>
              <label style={{display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13.5px', cursor: 'pointer'}}>
                <input 
                  type="radio" 
                  name="status" 
                  value="Active" 
                  checked={formData.status === 'Active'}
                  onChange={handleChange}
                  style={{accentColor: '#4f46e5'}}
                /> Active
              </label>
              <label style={{display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13.5px', cursor: 'pointer'}}>
                <input 
                  type="radio" 
                  name="status" 
                  value="Inactive" 
                  checked={formData.status === 'Inactive'}
                  onChange={handleChange}
                  style={{accentColor: '#4f46e5'}}
                /> Inactive
              </label>
            </div>
          </div>

          <div className="org-form-actions">
            <button type="button" className="org-btn-outline" onClick={handleReset}>Reset</button>
            <button type="submit" className="org-btn-primary">Save Department</button>
          </div>
        </form>
      </div>
    </div>
  );
}
