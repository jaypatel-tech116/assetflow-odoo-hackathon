import { useState, useEffect } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { getOverviewStats, getAssetUtilization, getMaintenanceFrequency, getDepartmentAllocation } from '../../services/reportService';
import './Reports.css';

const COLORS = ['var(--primary)', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function Reports() {
  const [stats, setStats] = useState(null);
  const [utilization, setUtilization] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [deptAllocation, setDeptAllocation] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const [statsRes, utilRes, maintRes, deptRes] = await Promise.all([
        getOverviewStats(),
        getAssetUtilization(),
        getMaintenanceFrequency(),
        getDepartmentAllocation(),
      ]);

      if (statsRes.success) setStats(statsRes.data || statsRes);
      if (utilRes.success) setUtilization(utilRes.assets || []);
      if (maintRes.success) setMaintenance(maintRes.data || []);
      if (deptRes.success) setDeptAllocation(deptRes.departments || []);
      setLoading(false);
    };
    fetch();
  }, []);

  if (loading) return <div className="page-loading"><div className="loading-spinner" /></div>;

  // Format department data for PieChart
  const pieData = deptAllocation.map(d => ({
    name: d.name,
    value: parseInt(d.assetCount || 0),
  })).filter(d => d.value > 0);

  // Format utilization data for Horizontal BarChart
  const barData = utilization.slice(0, 8).map(a => ({
    tag: a.asset_tag,
    allocations: parseInt(a.allocationCount || 0),
  }));

  // Format maintenance over time
  const areaData = maintenance.map(m => ({
    month: m.month,
    requests: m.count,
  }));

  return (
    <div className="reports-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Reports & Analytics</h1>
          <p className="page-subtitle">Deep dive insights into asset utilization, maintenance frequencies, and deployments</p>
        </div>
      </div>

      {stats && (
        <div className="stats-strip">
          <div className="stat-item">
            <span className="stat-val">{stats.totalAssets || 0}</span>
            <span className="stat-lbl">Total Registered Assets</span>
          </div>
          <div className="stat-item">
            <span className="stat-val">{stats.totalMaintenanceThisMonth || 0}</span>
            <span className="stat-lbl">Maintenance This Month</span>
          </div>
          <div className="stat-item">
            <span className="stat-val">{stats.totalBookingsThisMonth || 0}</span>
            <span className="stat-lbl">Bookings This Month</span>
          </div>
        </div>
      )}

      <div className="reports-grid">
        {/* Chart 1: Maintenance Frequency over time */}
        <div className="report-card">
          <h3>Maintenance Frequency (Requests per Month)</h3>
          <div className="chart-container">
            {areaData.length === 0 ? <p className="no-data">No maintenance records yet</p> : (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={areaData}>
                  <defs>
                    <linearGradient id="colorMaint" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey="requests" stroke="var(--primary)" fillOpacity={1} fill="url(#colorMaint)" name="Requests" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart 2: Department Allocation Share */}
        <div className="report-card">
          <h3>Asset Allocation by Department</h3>
          <div className="chart-container pie-chart-flex">
            {pieData.length === 0 ? <p className="no-data">No active allocations</p> : (
              <>
                <ResponsiveContainer width="50%" height={260}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pie-legend">
                  {pieData.map((d, i) => (
                    <div key={d.name} className="legend-item">
                      <span className="legend-dot" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="legend-name">{d.name} ({d.value})</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Chart 3: Top Asset Utilization */}
        <div className="report-card full-width">
          <h3>Asset Utilization (Top Allocated Assets)</h3>
          <div className="chart-container">
            {barData.length === 0 ? <p className="no-data">No allocation records yet</p> : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="tag" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="allocations" fill="#06b6d4" name="Allocations Count" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
