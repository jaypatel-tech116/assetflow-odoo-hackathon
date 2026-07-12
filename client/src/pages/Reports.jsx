import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { getAnalytics } from '../services/reportsService';
import './Reports.css';

export default function Reports() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [dateRange, setDateRange] = useState('May 1, 2024 - May 20, 2024');
  const [department, setDepartment] = useState('All Departments');
  const [category, setCategory] = useState('All Categories');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getAnalytics({ dateRange, department, category });
      if (res.success) {
        setData(res.data);
      }
    } catch (error) {
      console.error('Failed to fetch analytics', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = () => {
    fetchData();
  };

  const handleResetFilters = () => {
    setDateRange('May 1, 2024 - May 20, 2024');
    setDepartment('All Departments');
    setCategory('All Categories');
    // will re-fetch automatically via a separate effect or manually, let's do it manually for now
    setTimeout(fetchData, 0);
  };

  const handleExport = (format) => {
    if (format === 'csv') {
      if (!data) return;
      
      // Simple CSV export of department allocation
      const headers = ['Department', 'Total Assets', 'Allocated', 'Available', 'Utilization %', 'Employees'];
      const rows = data.departmentAllocation.map(d => [
        d.department, d.totalAssets, d.allocatedAssets, d.availableAssets, d.utilization, d.employees
      ]);
      
      const csvContent = "data:text/csv;charset=utf-8," 
        + [headers, ...rows].map(e => e.join(",")).join("\n");
        
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "department_allocation.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert(`${format.toUpperCase()} export coming soon!`);
    }
  };

  if (loading || !data) {
    return (
      <DashboardLayout>
        <div className="loading">Loading Analytics...</div>
      </DashboardLayout>
    );
  }

  // Calculate SVG paths for Donut chart
  const calculateStrokeDasharray = (value, total, circumference) => {
    return `${(value / total) * circumference} ${circumference}`;
  };
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const utilizedPct = Math.round((data.utilization.used / data.utilization.total) * 100);

  return (
    <DashboardLayout>
      <div className="reports-header-container">
        <div>
          <h1 className="reports-title">Reports & Analytics</h1>
          <p className="reports-subtitle">Get insights into asset performance, usage, maintenance, and resource bookings.</p>
        </div>
        <div className="reports-export-group">
          <button className="reports-btn-export" onClick={() => handleExport('pdf')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export Report
          </button>
        </div>
      </div>

      <div className="reports-filters">
        <div className="filter-group">
          <label>Date Range</label>
          <div className="filter-input-with-icon">
            <input type="text" value={dateRange} onChange={e => setDateRange(e.target.value)} />
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          </div>
        </div>
        <div className="filter-group">
          <label>Department</label>
          <select value={department} onChange={e => setDepartment(e.target.value)}>
            <option>All Departments</option>
            <option>Information Technology</option>
            <option>Human Resources</option>
            <option>Sales</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Category</label>
          <select value={category} onChange={e => setCategory(e.target.value)}>
            <option>All Categories</option>
            <option>Electronics</option>
            <option>Vehicles</option>
          </select>
        </div>
        <div className="filter-actions">
          <button className="reports-btn-primary" onClick={handleApplyFilters}>Apply Filters</button>
          <button className="reports-btn-reset" onClick={handleResetFilters}>Reset</button>
        </div>
      </div>

      {/* Row 1: Charts */}
      <div className="reports-grid-3">
        {/* Donut Chart */}
        <div className="reports-card">
          <div className="reports-card-header">
            <h3>Asset Utilization (Used vs Idle)</h3>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
          </div>
          <div className="utilization-content">
            <div className="donut-container">
              <svg width="160" height="160" viewBox="0 0 160 160">
                <circle cx="80" cy="80" r={radius} fill="transparent" stroke="#e5e7eb" strokeWidth="20" />
                <circle 
                  cx="80" cy="80" r={radius} 
                  fill="transparent" 
                  stroke="#10b981" 
                  strokeWidth="20" 
                  strokeDasharray={calculateStrokeDasharray(data.utilization.used, data.utilization.total, circumference)}
                  strokeDashoffset={circumference / 4} // Start from top
                  transform="rotate(-90 80 80)"
                />
              </svg>
              <div className="donut-text">
                <div className="pct">{utilizedPct}%</div>
                <div className="lbl">Utilized</div>
              </div>
            </div>
            <div className="utilization-legend">
              <div className="legend-item">
                <div className="legend-dot" style={{backgroundColor: '#10b981'}}></div>
                <div>
                  <div className="legend-lbl">In Use / Allocated</div>
                  <div className="legend-val">{Math.round((data.utilization.used / data.utilization.total) * 100)}% ({data.utilization.used})</div>
                </div>
              </div>
              <div className="legend-item">
                <div className="legend-dot" style={{backgroundColor: '#e5e7eb'}}></div>
                <div>
                  <div className="legend-lbl">Idle / Available</div>
                  <div className="legend-val">{Math.round((data.utilization.idle / data.utilization.total) * 100)}% ({data.utilization.idle})</div>
                </div>
              </div>
              <div className="legend-total">
                <div className="legend-lbl">Total Assets</div>
                <div className="legend-val-lrg">{data.utilization.total}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="reports-card">
          <div className="reports-card-header">
            <h3>Maintenance Frequency by Category</h3>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
          </div>
          <div className="bar-chart-container">
            <div className="y-axis-lbl">Requests</div>
            <div className="bar-chart">
              {data.maintenanceFrequency.map((item, idx) => {
                const maxVal = 30; // Hardcoded max for scale matching screenshot
                const heightPct = (item.count / maxVal) * 100;
                return (
                  <div className="bar-wrapper" key={idx}>
                    <div className="bar-val">{item.count}</div>
                    <div className="bar" style={{height: `${heightPct}%`, backgroundColor: '#4f46e5'}}></div>
                    <div className="bar-lbl">{item.category}</div>
                  </div>
                );
              })}
            </div>
            {/* Y axis lines */}
            <div className="y-axis-lines">
              <span>30</span><span>25</span><span>20</span><span>15</span><span>10</span><span>5</span><span>0</span>
            </div>
          </div>
        </div>

        {/* Table 1 */}
        <div className="reports-card">
          <div className="reports-card-header">
            <h3>Assets Nearing Retirement / Due for Maintenance</h3>
          </div>
          <table className="mini-table">
            <thead>
              <tr>
                <th>Asset Tag</th>
                <th>Asset Name</th>
                <th>Category</th>
                <th>Due Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.nearingRetirement.map((item, idx) => (
                <tr key={idx}>
                  <td style={{fontWeight: 500}}>{item.tag}</td>
                  <td>{item.name}</td>
                  <td>{item.category}</td>
                  <td>{item.dueDate}</td>
                  <td>
                    <span className={`status-badge-mini ${item.status === 'Retirement' ? 'badge-danger' : 'badge-warning'}`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="view-all-link">
            <a href="#">View All (18) &rarr;</a>
          </div>
        </div>
      </div>

      {/* Row 2: Tables & Heatmap */}
      <div className="reports-grid-2">
        <div className="reports-card">
          <div className="reports-card-header">
            <h3>Department-wise Allocation Summary</h3>
          </div>
          <table className="mini-table alt-table">
            <thead>
              <tr>
                <th>Department</th>
                <th style={{textAlign: 'center'}}>Total Assets</th>
                <th style={{textAlign: 'center'}}>Allocated Assets</th>
                <th style={{textAlign: 'center'}}>Available Assets</th>
                <th>Utilization (%)</th>
                <th style={{textAlign: 'center'}}>Employees</th>
              </tr>
            </thead>
            <tbody>
              {data.departmentAllocation.map((item, idx) => (
                <tr key={idx} style={item.isTotal ? {fontWeight: 'bold', borderTop: '2px solid #f3f4f6'} : {}}>
                  <td>{item.department}</td>
                  <td style={{textAlign: 'center'}}>{item.totalAssets}</td>
                  <td style={{textAlign: 'center'}}>{item.allocatedAssets}</td>
                  <td style={{textAlign: 'center'}}>{item.availableAssets}</td>
                  <td>
                    <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                      <span>{item.utilization}%</span>
                      <div style={{width: '60px', height: '6px', background: '#e5e7eb', borderRadius: '3px'}}>
                        <div style={{width: `${item.utilization}%`, height: '100%', background: '#4f46e5', borderRadius: '3px'}}></div>
                      </div>
                    </div>
                  </td>
                  <td style={{textAlign: 'center'}}>{item.employees}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="view-all-link" style={{marginTop: '16px'}}>
            <a href="#" onClick={(e) => { e.preventDefault(); handleExport('csv'); }}>Export CSV &rarr;</a>
          </div>
        </div>

        <div className="reports-card">
          <div className="reports-card-header">
            <h3>Booking Heatmap (Peak Hours / Days)</h3>
          </div>
          <div className="heatmap-container">
            <div className="heatmap-grid">
              {/* Header row for hours */}
              <div className="heatmap-corner">Day / Time</div>
              {['6 AM', '8 AM', '10 AM', '12 PM', '2 PM', '4 PM', '6 PM', '8 PM', '10 PM'].map(hr => (
                <div key={hr} className="heatmap-hr">{hr}</div>
              ))}
              
              {/* Data rows */}
              {data.heatmap.map(row => (
                <React.Fragment key={row.day}>
                  <div className="heatmap-day">{row.day}</div>
                  {['6 AM', '8 AM', '10 AM', '12 PM', '2 PM', '4 PM', '6 PM', '8 PM', '10 PM'].map(hr => {
                    const intensity = row.data[hr];
                    let bg = '#eff6ff'; // default 0
                    if (intensity > 0 && intensity <= 2) bg = '#dbeafe';
                    else if (intensity > 2 && intensity <= 4) bg = '#bfdbfe';
                    else if (intensity > 4 && intensity <= 6) bg = '#93c5fd';
                    else if (intensity > 6 && intensity <= 8) bg = '#60a5fa';
                    else if (intensity > 8) bg = '#3b82f6';
                    
                    return <div key={`${row.day}-${hr}`} className="heatmap-cell" style={{backgroundColor: bg}}></div>;
                  })}
                </React.Fragment>
              ))}
            </div>
            
            <div className="heatmap-legend">
              <span className="lbl">Low</span>
              <div className="heatmap-scale">
                <div style={{backgroundColor: '#eff6ff'}}></div>
                <div style={{backgroundColor: '#dbeafe'}}></div>
                <div style={{backgroundColor: '#bfdbfe'}}></div>
                <div style={{backgroundColor: '#93c5fd'}}></div>
                <div style={{backgroundColor: '#60a5fa'}}></div>
                <div style={{backgroundColor: '#3b82f6'}}></div>
              </div>
              <span className="lbl">High</span>
              <div className="view-all-link" style={{marginLeft: 'auto'}}>
                <a href="#">View All Bookings &rarr;</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Summary Cards */}
      <div className="reports-summary-cards">
        <div className="summary-card">
          <div className="summary-icon icon-emerald">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
          </div>
          <div className="summary-info">
            <div className="summary-lbl">Total Assets</div>
            <div className="summary-val">{data.summaryCards.totalAssets.value}</div>
            <div className={`summary-change ${data.summaryCards.totalAssets.isPositive ? 'pos' : 'neg'}`}>
              {data.summaryCards.totalAssets.isPositive ? '↑' : '↓'} {data.summaryCards.totalAssets.change} vs last month
            </div>
          </div>
        </div>
        
        <div className="summary-card">
          <div className="summary-icon icon-blue">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          </div>
          <div className="summary-info">
            <div className="summary-lbl">Assets Allocated</div>
            <div className="summary-val">{data.summaryCards.assetsAllocated.value}</div>
            <div className={`summary-change ${data.summaryCards.assetsAllocated.isPositive ? 'pos' : 'neg'}`}>
              {data.summaryCards.assetsAllocated.isPositive ? '↑' : '↓'} {data.summaryCards.assetsAllocated.change} vs last month
            </div>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon icon-indigo">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          </div>
          <div className="summary-info">
            <div className="summary-lbl">Active Bookings</div>
            <div className="summary-val">{data.summaryCards.activeBookings.value}</div>
            <div className={`summary-change ${data.summaryCards.activeBookings.isPositive ? 'pos' : 'neg'}`}>
              {data.summaryCards.activeBookings.isPositive ? '↑' : '↓'} {data.summaryCards.activeBookings.change} vs last month
            </div>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon icon-orange">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
          </div>
          <div className="summary-info">
            <div className="summary-lbl">Maintenance Requests</div>
            <div className="summary-val">{data.summaryCards.maintenanceRequests.value}</div>
            <div className={`summary-change ${data.summaryCards.maintenanceRequests.isPositive ? 'pos' : 'neg'}`}>
              {data.summaryCards.maintenanceRequests.isPositive ? '↑' : '↓'} {data.summaryCards.maintenanceRequests.change} vs last month
            </div>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon icon-teal">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/></svg>
          </div>
          <div className="summary-info">
            <div className="summary-lbl">Pending Transfers</div>
            <div className="summary-val">{data.summaryCards.pendingTransfers.value}</div>
            <div className={`summary-change ${data.summaryCards.pendingTransfers.isPositive ? 'pos' : 'neg'}`}>
              {data.summaryCards.pendingTransfers.isPositive ? '↑' : '↓'} {data.summaryCards.pendingTransfers.change} vs last month
            </div>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon icon-red">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
          <div className="summary-info">
            <div className="summary-lbl">Overdue Items</div>
            <div className="summary-val">{data.summaryCards.overdueItems.value}</div>
            <div className={`summary-change ${data.summaryCards.overdueItems.isPositive ? 'pos' : 'neg'}`}>
              {data.summaryCards.overdueItems.isPositive ? '↑' : '↓'} {data.summaryCards.overdueItems.change} vs last month
            </div>
          </div>
        </div>
      </div>

    </DashboardLayout>
  );
}
