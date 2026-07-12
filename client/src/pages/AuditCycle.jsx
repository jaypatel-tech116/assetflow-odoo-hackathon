import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { getCycles, createCycle, getDiscrepancies } from '../services/auditService';
import { getDepartments } from '../services/organizationService'; // to fetch departments for dropdown
import './AuditCycle.css';

export default function AuditCycle() {
  const [activeTab, setActiveTab] = useState(0);
  const [cycles, setCycles] = useState([]);
  const [discrepancies, setDiscrepancies] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    scope_type: 'Department',
    scope_id: '',
    start_date: '2024-05-20',
    end_date: '2024-05-27',
    auditors: [], // Just store a string for mockup or empty array
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [cyclesRes, discRes, deptRes] = await Promise.all([
        getCycles(),
        getDiscrepancies(),
        getDepartments()
      ]);
      if (cyclesRes.success) setCycles(cyclesRes.cycles);
      if (discRes.success) setDiscrepancies(discRes.discrepancies);
      if (deptRes.success) setDepartments(deptRes.departments);
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleScopeTypeChange = (e) => {
    setFormData(prev => ({ ...prev, scope_type: e.target.value, scope_id: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Create cycle
      const dataToSubmit = {
        ...formData,
        // Usually auditors would be array of IDs. We send empty for now to just let seed or null handle it
        auditors: []
      };
      
      const res = await createCycle(dataToSubmit);
      if (res.success) {
        setFormData({
          name: '',
          scope_type: 'Department',
          scope_id: '',
          start_date: '2024-05-20',
          end_date: '2024-05-27',
          auditors: []
        });
        fetchData();
      }
    } catch (error) {
      console.error('Failed to create cycle', error);
    }
  };

  // Helper for status badge
  const getCycleStatusBadge = (status) => {
    if (status === 'Open') return <span className="status-badge status-active" style={{background: '#eff6ff', color: '#3b82f6', border: '1px solid #bfdbfe'}}>{status}</span>;
    return <span className="status-badge" style={{background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0'}}>{status}</span>;
  };

  const getDiscStatusBadge = (status) => {
    if (status === 'Verified') return <span className="status-badge-mini" style={{background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0'}}>{status}</span>;
    if (status === 'Missing') return <span className="status-badge-mini" style={{background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca'}}>{status}</span>;
    if (status === 'Damaged') return <span className="status-badge-mini" style={{background: '#fff7ed', color: '#ea580c', border: '1px solid #fed7aa'}}>{status}</span>;
    return <span className="status-badge-mini">{status}</span>;
  };

  // Compute summary stats
  const totalCycles = cycles.length;
  const openCycles = cycles.filter(c => c.status === 'Open').length;
  const closedCycles = totalCycles - openCycles;

  const totalDisc = discrepancies.length;
  const verifiedDisc = discrepancies.filter(d => d.status === 'Verified').length;
  const missingDisc = discrepancies.filter(d => d.status === 'Missing').length;
  const damagedDisc = discrepancies.filter(d => d.status === 'Damaged').length;

  return (
    <DashboardLayout>
      <div className="reports-header-container">
        <div>
          <h1 className="reports-title">Audit Cycle</h1>
          <p className="reports-subtitle">Create and manage audit cycles to ensure asset accountability and compliance.</p>
        </div>
        <div>
          <button className="reports-btn-primary" onClick={() => setActiveTab(0)}>+ Create Audit Cycle</button>
        </div>
      </div>

      <div className="org-tabs" style={{marginBottom: '24px'}}>
        <button className={`org-tab ${activeTab === 0 ? 'active' : ''}`} onClick={() => setActiveTab(0)}>
          Overview
        </button>
        <button className={`org-tab ${activeTab === 1 ? 'active' : ''}`} onClick={() => setActiveTab(1)}>
          Discrepancy Report
        </button>
        <button className={`org-tab ${activeTab === 2 ? 'active' : ''}`} onClick={() => setActiveTab(2)}>
          Audit History
        </button>
      </div>

      {activeTab === 0 && (
        <div style={{display: 'flex', flexDirection: 'column', gap: '24px'}}>
          {/* Create form */}
          <div className="reports-card">
            <h3 className="org-card-title" style={{marginBottom: '20px'}}>Create New Audit Cycle</h3>
            <form onSubmit={handleSubmit} className="audit-form-grid">
              <div className="org-form-group">
                <label className="org-form-label">Cycle Name <span className="required">*</span></label>
                <input type="text" name="name" className="org-form-input" placeholder="Enter audit cycle name" value={formData.name} onChange={handleInputChange} required />
              </div>
              <div className="org-form-group">
                <label className="org-form-label">Scope <span className="required">*</span></label>
                <div style={{display: 'flex', gap: '16px', alignItems: 'center'}}>
                  <select name="scope_type" className="org-form-select" value={formData.scope_type} onChange={handleScopeTypeChange} required>
                    <option value="Department">Select scope type</option>
                    <option value="Department">Department</option>
                    <option value="Location">Location</option>
                  </select>
                  <div style={{display: 'flex', gap: '12px'}}>
                    <label style={{display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px'}}><input type="radio" name="scope_type_radio" value="Department" checked={formData.scope_type === 'Department'} onChange={handleScopeTypeChange} style={{accentColor: '#4f46e5'}}/> Department</label>
                    <label style={{display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px'}}><input type="radio" name="scope_type_radio" value="Location" checked={formData.scope_type === 'Location'} onChange={handleScopeTypeChange} style={{accentColor: '#4f46e5'}}/> Location</label>
                  </div>
                </div>
              </div>
              <div className="org-form-group">
                <label className="org-form-label">Select {formData.scope_type} <span className="required">*</span></label>
                <select name="scope_id" className="org-form-select" value={formData.scope_id} onChange={handleInputChange} required>
                  <option value="">Select {formData.scope_type.toLowerCase()}</option>
                  {formData.scope_type === 'Department' ? (
                    departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)
                  ) : (
                    <>
                      <option value="Head Office - 1st Floor">Head Office - 1st Floor</option>
                      <option value="Warehouse - East">Warehouse - East</option>
                      <option value="Warehouse - West">Warehouse - West</option>
                    </>
                  )}
                </select>
              </div>
              <div className="org-form-group">
                <label className="org-form-label">Date Range <span className="required">*</span></label>
                <div className="filter-input-with-icon">
                  <input type="text" className="org-form-input" value="May 20, 2024 - May 27, 2024" readOnly />
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                </div>
              </div>
              <div className="org-form-group">
                <label className="org-form-label">Assigned Auditors <span className="required">*</span></label>
                <select className="org-form-select">
                  <option>Select auditors</option>
                </select>
                <div style={{display: 'flex', gap: '8px', marginTop: '8px'}}>
                  <span className="auditor-chip" style={{background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0'}}>Amit Joshi</span>
                  <span className="auditor-chip" style={{background: '#eff6ff', color: '#3b82f6', border: '1px solid #bfdbfe'}}>Neha Shah</span>
                  <span className="auditor-chip" style={{background: '#faf5ff', color: '#a855f7', border: '1px solid #e9d5ff'}}>Vikram Patel</span>
                  <span style={{fontSize: '12px', color: '#4f46e5', fontWeight: 600, display: 'flex', alignItems: 'center'}}>+2 more</span>
                </div>
              </div>
              <div style={{display: 'flex', gap: '12px', alignItems: 'flex-start', paddingTop: '22px'}}>
                <button type="button" className="org-btn-outline" onClick={() => setFormData({...formData, name: ''})}>Reset</button>
                <button type="submit" className="org-btn-primary">Create Cycle</button>
              </div>
            </form>
          </div>

          <div className="org-split-layout">
            <div className="reports-card">
              <div className="reports-card-header">
                <h3 className="org-card-title">Audit Cycles</h3>
                <div className="filter-input-with-icon">
                  <input type="text" className="org-form-input" placeholder="Search cycle..." style={{padding: '6px 12px', minWidth: '150px'}}/>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                </div>
              </div>
              
              <table className="mini-table alt-table">
                <thead>
                  <tr>
                    <th>Cycle Name</th>
                    <th>Scope</th>
                    <th>Scope Details</th>
                    <th>Date Range</th>
                    <th>Assigned Auditors</th>
                    <th>Status</th>
                    <th style={{textAlign: 'center'}}>Discrepancy Count</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {cycles.map(cycle => (
                    <tr key={cycle.id}>
                      <td style={{fontWeight: 500, color: '#4f46e5'}}>{cycle.name}</td>
                      <td>{cycle.scope_type}</td>
                      <td>{cycle.scope_id}</td>
                      <td>{new Date(cycle.start_date).toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'})} - {new Date(cycle.end_date).toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'})}</td>
                      <td>
                        <div style={{display: 'flex', position: 'relative'}}>
                          <div style={{width: 24, height: 24, borderRadius: '50%', background: '#f59e0b', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold', border: '2px solid #fff', position: 'absolute', left: 0}}>PR</div>
                          <div style={{width: 24, height: 24, borderRadius: '50%', background: '#3b82f6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold', border: '2px solid #fff', position: 'absolute', left: 14}}>AJ</div>
                          <div style={{width: 24, height: 24, borderRadius: '50%', background: '#10b981', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold', border: '2px solid #fff', position: 'absolute', left: 28}}>NS</div>
                          <div style={{marginLeft: '56px', fontSize: '11px', color: '#6b7280', display: 'flex', alignItems: 'center'}}>+2</div>
                        </div>
                      </td>
                      <td>{getCycleStatusBadge(cycle.status)}</td>
                      <td style={{textAlign: 'center', fontWeight: 600, color: cycle.discrepancies?.length > 0 ? '#ef4444' : '#10b981'}}>
                        {cycle.discrepancies ? cycle.discrepancies.length : 0}
                      </td>
                      <td>
                        <button style={{background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af'}}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{marginTop: '20px', fontSize: '13px', color: '#6b7280'}}>Showing 1 to {cycles.length} of {cycles.length} entries</div>
            </div>

            <div className="reports-card" style={{height: 'fit-content'}}>
              <div className="reports-card-header">
                <h3 className="org-card-title">Cycle Summary</h3>
              </div>
              
              <div style={{display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '32px'}}>
                <div className="donut-container" style={{width: 100, height: 100, marginBottom: 0}}>
                  <svg width="100" height="100" viewBox="0 0 160 160">
                    <circle cx="80" cy="80" r="60" fill="transparent" stroke="#16a34a" strokeWidth="20" />
                    <circle 
                      cx="80" cy="80" r="60" 
                      fill="transparent" 
                      stroke="#3b82f6" 
                      strokeWidth="20" 
                      strokeDasharray={`${(openCycles / (totalCycles || 1)) * 377} 377`}
                      strokeDashoffset={377 / 4}
                      transform="rotate(-90 80 80)"
                    />
                  </svg>
                  <div className="donut-text">
                    <div className="pct" style={{fontSize: '20px'}}>{totalCycles}</div>
                    <div className="lbl" style={{fontSize: '10px'}}>Total Cycles</div>
                  </div>
                </div>
                <div style={{display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px'}}>
                  <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                    <div style={{width: 10, height: 10, background: '#3b82f6', borderRadius: '50%'}}></div>
                    <div style={{width: '60px'}}>Open</div>
                    <div style={{fontWeight: 600}}>{openCycles} ({Math.round(openCycles/totalCycles*100) || 0}%)</div>
                  </div>
                  <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                    <div style={{width: 10, height: 10, background: '#16a34a', borderRadius: '50%'}}></div>
                    <div style={{width: '60px'}}>Closed</div>
                    <div style={{fontWeight: 600}}>{closedCycles} ({Math.round(closedCycles/totalCycles*100) || 0}%)</div>
                  </div>
                </div>
              </div>

              <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderTop: '1px solid #f3f4f6'}}>
                  <div style={{display: 'flex', gap: '8px', alignItems: 'center', color: '#4b5563', fontSize: '13.5px'}}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                    Total Discrepancies
                  </div>
                  <div style={{fontWeight: 700, fontSize: '16px', color: '#ef4444'}}>{totalDisc}</div>
                </div>
                
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0', fontSize: '13.5px'}}>
                  <div style={{display: 'flex', gap: '8px', alignItems: 'center', color: '#6b7280'}}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                    Verified
                  </div>
                  <div style={{fontWeight: 600, color: '#10b981'}}>{verifiedDisc}</div>
                </div>
                
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0', fontSize: '13.5px'}}>
                  <div style={{display: 'flex', gap: '8px', alignItems: 'center', color: '#6b7280'}}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    Missing
                  </div>
                  <div style={{fontWeight: 600, color: '#ef4444'}}>{missingDisc}</div>
                </div>
                
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0', fontSize: '13.5px'}}>
                  <div style={{display: 'flex', gap: '8px', alignItems: 'center', color: '#6b7280'}}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
                    Damaged
                  </div>
                  <div style={{fontWeight: 600, color: '#f59e0b'}}>{damagedDisc}</div>
                </div>

                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0 0 0', borderTop: '1px solid #f3f4f6', fontSize: '13.5px'}}>
                  <div style={{display: 'flex', gap: '8px', alignItems: 'center', color: '#4b5563'}}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    Avg. Resolution Time
                  </div>
                  <div style={{fontWeight: 700}}>3.6 Days</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 1 && (
        <div className="reports-card">
          <div className="reports-card-header">
            <h3 className="org-card-title" style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
              Discrepancy Report - Quarterly Audit - May 2024
              <span className="status-badge" style={{background: '#eff6ff', color: '#3b82f6', border: '1px solid #bfdbfe', fontSize: '11px', padding: '2px 8px'}}>Open</span>
            </h3>
            <div style={{display: 'flex', gap: '12px'}}>
              <button className="reports-btn-reset" style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Export Report
              </button>
              <button className="reports-btn-reset" style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
                Filters
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
              </button>
            </div>
          </div>

          <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px'}}>
            <div style={{background: '#f9fafb', borderRadius: '8px', padding: '16px'}}>
              <div style={{fontSize: '12px', fontWeight: 600, color: '#6b7280', marginBottom: '8px'}}>Total Assets Audited</div>
              <div style={{fontSize: '24px', fontWeight: 700, color: '#111827'}}>125</div>
            </div>
            <div style={{background: '#f0fdf4', borderRadius: '8px', padding: '16px'}}>
              <div style={{fontSize: '12px', fontWeight: 600, color: '#16a34a', marginBottom: '8px'}}>Verified</div>
              <div style={{fontSize: '24px', fontWeight: 700, color: '#16a34a'}}>98</div>
            </div>
            <div style={{background: '#fef2f2', borderRadius: '8px', padding: '16px'}}>
              <div style={{fontSize: '12px', fontWeight: 600, color: '#dc2626', marginBottom: '8px'}}>Missing</div>
              <div style={{fontSize: '24px', fontWeight: 700, color: '#dc2626'}}>4</div>
            </div>
            <div style={{background: '#fff7ed', borderRadius: '8px', padding: '16px'}}>
              <div style={{fontSize: '12px', fontWeight: 600, color: '#ea580c', marginBottom: '8px'}}>Damaged</div>
              <div style={{fontSize: '24px', fontWeight: 700, color: '#ea580c'}}>3</div>
            </div>
            <div style={{background: '#fff1f2', borderRadius: '8px', padding: '16px', gridColumn: '4 / 5', marginTop: '-100px', zIndex: 1, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}}>
              <div style={{fontSize: '12px', fontWeight: 600, color: '#e11d48', marginBottom: '8px'}}>Discrepancy Rate</div>
              <div style={{fontSize: '24px', fontWeight: 700, color: '#e11d48'}}>5.60%</div>
            </div>
          </div>

          <table className="mini-table alt-table">
            <thead>
              <tr>
                <th>Asset Tag</th>
                <th>Asset Name</th>
                <th>Category</th>
                <th>Location</th>
                <th>Status</th>
                <th>Auditor Notes</th>
                <th>Assigned Auditor</th>
                <th>Reported On</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {discrepancies.map(disc => (
                <tr key={disc.id}>
                  <td style={{fontWeight: 500}}>{disc.asset_tag}</td>
                  <td>{disc.asset_name}</td>
                  <td>Laptops</td> {/* Mocked for now */}
                  <td>{disc.location}</td>
                  <td>{getDiscStatusBadge(disc.status)}</td>
                  <td style={{fontSize: '12px', color: '#4b5563', maxWidth: '200px'}}>{disc.auditor_notes}</td>
                  <td>
                    <div style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
                      <div style={{width: 20, height: 20, borderRadius: '50%', background: '#f59e0b', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 'bold'}}>AJ</div>
                      <span style={{fontSize: '12px'}}>Amit Joshi</span>
                    </div>
                  </td>
                  <td style={{fontSize: '12px'}}>{new Date(disc.reported_on).toLocaleString('en-GB')}</td>
                  <td>
                    <button style={{background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af'}}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', color: '#6b7280'}}>
            <span>Showing 1 to {discrepancies.length} of {discrepancies.length} entries</span>
            <div style={{display: 'flex', gap: '4px'}}>
              <button style={{width: 32, height: 32, borderRadius: '6px', border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer'}}>&lt;</button>
              <button style={{width: 32, height: 32, borderRadius: '6px', border: '1px solid #4f46e5', background: '#4f46e5', color: '#fff', cursor: 'pointer'}}>1</button>
              <button style={{width: 32, height: 32, borderRadius: '6px', border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer'}}>&gt;</button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 2 && (
        <div className="reports-card">
          <p>Audit History implementation coming soon.</p>
        </div>
      )}
    </DashboardLayout>
  );
}
