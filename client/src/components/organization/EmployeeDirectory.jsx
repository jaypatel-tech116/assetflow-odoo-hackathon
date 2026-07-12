import { useState, useEffect } from 'react';
import { getEmployees, updateEmployeeRole, updateEmployeeStatus } from '../../services/organizationService';

export default function EmployeeDirectory() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Selected employee for role/status editing
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [roleForm, setRoleForm] = useState('Employee');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getEmployees();
      if (res.success) setEmployees(res.employees);
    } catch (error) {
      console.error('Failed to fetch employees', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectEmployee = (emp) => {
    setSelectedEmployee(emp);
    setRoleForm(emp.role);
  };

  const handleRoleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEmployee) return;
    try {
      await updateEmployeeRole(selectedEmployee.id, roleForm);
      setSelectedEmployee(null);
      fetchData(); // Refresh list
    } catch (error) {
      console.error('Failed to update role', error);
    }
  };

  const handleStatusToggle = async (emp) => {
    const newStatus = emp.status === 'Active' ? 'Inactive' : 'Active';
    try {
      await updateEmployeeStatus(emp.id, newStatus);
      fetchData(); // Refresh list
      
      // Update selected employee state if it's the one being toggled
      if (selectedEmployee && selectedEmployee.id === emp.id) {
        setSelectedEmployee(prev => ({ ...prev, status: newStatus }));
      }
    } catch (error) {
      console.error('Failed to update status', error);
    }
  };

  const handleReset = () => {
    if (selectedEmployee) {
      setRoleForm(selectedEmployee.role);
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const getRoleBadgeColor = (role) => {
    switch(role) {
      case 'Admin': return { bg: '#e0e7ff', color: '#4f46e5' };
      case 'Department Head': return { bg: '#dbeafe', color: '#3b82f6' };
      case 'Asset Manager': return { bg: '#ffedd5', color: '#f97316' };
      default: return { bg: '#f3f4f6', color: '#6b7280' };
    }
  };

  return (
    <div className="org-split-layout">
      {/* Left side: Table */}
      <div className="org-card">
        <div className="org-card-header">
          <h2 className="org-card-title">Employee Directory</h2>
          <button className="org-btn-primary">+ Add Employee</button>
        </div>
        
        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <table className="dash-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Department</th>
                <th>Current Role</th>
                <th>Status</th>
                <th>Joined Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{textAlign: 'center'}}>No employees found.</td>
                </tr>
              ) : (
                employees.map(emp => {
                  const roleStyle = getRoleBadgeColor(emp.role);
                  return (
                    <tr key={emp.id}>
                      <td>
                        <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                          <div style={{width: 28, height: 28, borderRadius: '50%', background: '#f59e0b', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 'bold'}}>
                            {emp.full_name.substring(0, 2).toUpperCase()}
                          </div>
                          <span style={{fontWeight: 500}}>{emp.full_name}</span>
                        </div>
                      </td>
                      <td style={{color: '#6b7280'}}>{emp.email}</td>
                      <td>{emp.department ? emp.department.name : '-'}</td>
                      <td>
                        <span style={{fontSize: '11px', fontWeight: 600, padding: '4px 8px', borderRadius: '12px', background: roleStyle.bg, color: roleStyle.color}}>
                          {emp.role}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${emp.status === 'Active' ? 'status-active' : 'status-inactive'}`}>
                          {emp.status}
                        </span>
                      </td>
                      <td style={{color: '#6b7280'}}>{formatDate(emp.created_at)}</td>
                      <td>
                        <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                          <button 
                            onClick={() => handleSelectEmployee(emp)} 
                            style={{background: 'transparent', border: 'none', cursor: 'pointer', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12.5px', fontWeight: 500}}
                          >
                            Promote
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
                          </button>
                          
                          {/* Toggle switch */}
                          <button 
                            onClick={() => handleStatusToggle(emp)}
                            style={{
                              width: '32px', height: '18px', borderRadius: '10px', 
                              background: emp.status === 'Active' ? '#10b981' : '#d1d5db',
                              border: 'none', cursor: 'pointer', position: 'relative',
                              transition: 'background 0.2s'
                            }}
                          >
                            <span style={{
                              position: 'absolute', top: '2px', left: emp.status === 'Active' ? '16px' : '2px',
                              width: '14px', height: '14px', borderRadius: '50%', background: '#fff',
                              transition: 'left 0.2s'
                            }}></span>
                          </button>
                          
                          <button style={{background: 'transparent', border: 'none', cursor: 'pointer', color: '#9ca3af'}}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
        
        <div style={{marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', color: '#6b7280'}}>
          <span>Showing 1 to {employees.length} of {employees.length} entries</span>
          <div style={{display: 'flex', gap: '4px'}}>
            <button style={{width: 32, height: 32, borderRadius: '6px', border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer'}}>&lt;</button>
            <button style={{width: 32, height: 32, borderRadius: '6px', border: '1px solid #4f46e5', background: '#4f46e5', color: '#fff', cursor: 'pointer'}}>1</button>
            <button style={{width: 32, height: 32, borderRadius: '6px', border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer'}}>&gt;</button>
          </div>
        </div>
      </div>

      {/* Right side: Form (only visible if selected or default empty state) */}
      <div style={{display: 'flex', flexDirection: 'column', gap: '24px'}}>
        <div className="org-card">
          <h3 className="org-card-title" style={{marginBottom: '20px'}}>Promote / Change Role</h3>
          
          {selectedEmployee ? (
            <form onSubmit={handleRoleSubmit}>
              <div className="org-form-group">
                <label className="org-form-label">Employee</label>
                <div style={{display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px'}}>
                  <div style={{width: 24, height: 24, borderRadius: '50%', background: '#f59e0b', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold'}}>
                    {selectedEmployee.full_name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div style={{fontSize: '13px', fontWeight: 600, color: '#111827'}}>{selectedEmployee.full_name}</div>
                    <div style={{fontSize: '11px', color: '#6b7280'}}>{selectedEmployee.email}</div>
                  </div>
                </div>
              </div>

              <div className="org-form-group">
                <label className="org-form-label">Select Role <span className="required">*</span></label>
                <select 
                  className="org-form-select"
                  value={roleForm}
                  onChange={(e) => setRoleForm(e.target.value)}
                  required
                >
                  <option value="Employee">Employee</option>
                  <option value="Department Head">Department Head</option>
                  <option value="Asset Manager">Asset Manager</option>
                  <option value="Admin">Administrator</option>
                </select>
              </div>

              <div style={{background: '#f8f5ff', border: '1px solid #ede9fe', borderRadius: '8px', padding: '12px', display: 'flex', gap: '10px', marginBottom: '24px'}}>
                <div style={{color: '#6d28d9'}}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg></div>
                <div style={{fontSize: '12px', color: '#4b5563', lineHeight: '1.4'}}>
                  Role assignment is allowed only by Administrator. Employees cannot change their own roles.
                </div>
              </div>

              <div className="org-form-actions">
                <button type="button" className="org-btn-outline" onClick={handleReset}>Reset</button>
                <button type="submit" className="org-btn-primary">Update Role</button>
              </div>
            </form>
          ) : (
            <div style={{textAlign: 'center', padding: '40px 0', color: '#6b7280', fontSize: '13.5px'}}>
              Select an employee from the table to promote or change their role.
            </div>
          )}
        </div>

        {selectedEmployee && (
          <div className="org-card">
            <h3 className="org-card-title" style={{marginBottom: '16px'}}>Status Management</h3>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid #f3f4f6', marginBottom: '16px'}}>
              <div>
                <div style={{fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '4px'}}>Current Status</div>
                <span className={`status-badge ${selectedEmployee.status === 'Active' ? 'status-active' : 'status-inactive'}`}>
                  {selectedEmployee.status}
                </span>
              </div>
              <button 
                onClick={() => handleStatusToggle(selectedEmployee)}
                style={{
                  background: '#fff', border: `1px solid ${selectedEmployee.status === 'Active' ? '#ef4444' : '#10b981'}`, 
                  color: selectedEmployee.status === 'Active' ? '#ef4444' : '#10b981',
                  padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
                }}
              >
                {selectedEmployee.status === 'Active' ? 'Deactivate' : 'Activate'}
              </button>
            </div>
            <p style={{fontSize: '12px', color: '#6b7280', margin: 0}}>
              {selectedEmployee.status === 'Active' ? 'Deactivate an employee to restrict system access.' : 'Activate an employee to restore system access.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
