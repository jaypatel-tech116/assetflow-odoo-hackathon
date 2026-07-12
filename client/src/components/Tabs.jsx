import './Tabs.css';

export default function Tabs({ tabs, activeTab, onTabChange }) {
  return (
    <div className="tabs">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          className={`tabs-item ${activeTab === tab.key ? 'tabs-item--active' : ''}`}
          onClick={() => onTabChange(tab.key)}
        >
          {tab.label}
          {tab.count !== undefined && <span className="tabs-count">{tab.count}</span>}
        </button>
      ))}
    </div>
  );
}
