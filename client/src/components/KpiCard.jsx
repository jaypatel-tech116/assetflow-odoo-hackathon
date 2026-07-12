import './KpiCard.css';

export default function KpiCard({ title, value, icon, color = 'var(--primary)', delta, deltaLabel }) {
  return (
    <div className="kpi-card">
      <div className="kpi-card-icon" style={{ background: `${color}15`, color }}>
        {icon}
      </div>
      <div className="kpi-card-content">
        <span className="kpi-card-value">{value}</span>
        <span className="kpi-card-title">{title}</span>
        {(delta !== undefined || deltaLabel) && (
          <span className={`kpi-card-delta ${delta > 0 ? 'kpi-card-delta--up' : delta < 0 ? 'kpi-card-delta--down' : ''}`}>
            {delta > 0 ? '↑' : delta < 0 ? '↓' : ''} {deltaLabel || delta}
          </span>
        )}
      </div>
    </div>
  );
}
