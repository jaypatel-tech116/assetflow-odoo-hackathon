<<<<<<< HEAD
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

const navItems = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
      </svg>
    ),
  },
  {
    label: 'Organization Setup',
    path: '/organization',
    roles: ['Admin'],
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
      </svg>
    ),
  },
  {
    label: 'Asset Directory',
    path: '/assets',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/>
      </svg>
    ),
  },
  {
    label: 'Allocation & Transfer',
    path: '/allocations',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>
      </svg>
    ),
  },
  {
    label: 'Resource Booking',
    path: '/bookings',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    ),
  },
  {
    label: 'Maintenance',
    path: '/maintenance',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/>
      </svg>
    ),
  },
  {
    label: 'Asset Audit',
    path: '/audits',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
      </svg>
    ),
  },
  {
    label: 'Reports & Analytics',
    path: '/reports',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
    ),
  },
  {
    label: 'Activity Logs',
    path: '/activity-logs',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
  },
];

export default function Sidebar({ isOpen, onClose }) {
  const { user } = useAuth();
  const location = useLocation();

  const filteredItems = navItems.filter((item) => {
    if (!item.roles) return true;
    return item.roles.includes(user?.role);
  });

  return (
    <>
      {isOpen && <div className="sidebar-backdrop" onClick={onClose} />}
      <aside className={`sidebar ${isOpen ? 'sidebar--open' : ''}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L4 6V12C4 16.42 7.4 20.74 12 22C16.6 20.74 20 16.42 20 12V6L12 2Z" fill="white" opacity="0.3"/>
              <path d="M12 5L7 7.5V12C7 15.04 9.16 18.06 12 19C14.84 18.06 17 15.04 17 12V7.5L12 5Z" fill="white"/>
              <path d="M10 12L11.5 13.5L14.5 10.5" stroke="#0f1120" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="sidebar-logo-text">
            <span className="sidebar-logo-name">Asset<span className="sidebar-logo-highlight">Flow</span></span>
          </div>
          <button className="sidebar-close-btn" onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <nav className="sidebar-nav">
          {filteredItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `sidebar-nav-item ${isActive || location.pathname.startsWith(item.path) ? 'sidebar-nav-item--active' : ''}`
              }
            >
              <span className="sidebar-nav-icon">{item.icon}</span>
              <span className="sidebar-nav-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-version">AssetFlow v1.0</div>
        </div>
      </aside>
    </>
=======
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Sidebar.css';
import './Sidebar-Subnav.css';

const navSections = [
  {
    label: '',
    items: [
      { id: 'dashboard', name: 'Dashboard', icon: 'dashboard', path: '/dashboard' },
    ],
  },
  {
    label: 'ORGANIZATION',
    items: [
      {
        id: 'organization-setup',
        name: 'Organization Setup',
        icon: 'org-setup',
        path: '/organization-setup',
        subItems: [
          { id: 'departments', name: 'Departments', tabIndex: 0 },
          { id: 'asset-categories', name: 'Asset Categories', tabIndex: 1 },
          { id: 'employee-directory', name: 'Employee Directory', tabIndex: 2 },
        ]
      },
      { id: 'role-management', name: 'Role Management', icon: 'roles', path: '/roles' },
    ],
  },
  {
    label: 'REPORTS & ANALYTICS',
    items: [
      { id: 'reports', name: 'Reports', icon: 'reports', path: '/reports' },
      { id: 'audit', name: 'Audit Cycle', icon: 'audit', path: '/audit-cycle' },
      { id: 'analytics', name: 'Analytics', icon: 'analytics', path: '/analytics' },
    ],
  },
  {
    label: 'SYSTEM',
    items: [
      { id: 'activity-logs', name: 'Activity Logs', icon: 'logs', path: '/activity-logs' },
      { id: 'notifications', name: 'Notifications', icon: 'notifications', badge: 12, path: '/activity-logs' },
      { id: 'settings', name: 'Settings', icon: 'settings', path: '/settings' },
    ],
  },
];

function NavIcon({ type }) {
  const props = { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (type) {
    case 'dashboard':
      return <svg {...props}><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>;
    case 'org-setup':
      return <svg {...props}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><circle cx="12" cy="12" r="3"/><line x1="12" y1="9" x2="12" y2="15"/><line x1="9" y1="12" x2="15" y2="12"/></svg>;
    case 'roles':
      return <svg {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>;
    case 'reports':
      return <svg {...props}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>;
    case 'audit':
      return <svg {...props}><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 14l2 2 4-4"/></svg>;
    case 'analytics':
      return <svg {...props}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>;
    case 'logs':
      return <svg {...props}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
    case 'notifications':
      return <svg {...props}><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>;
    case 'settings':
      return <svg {...props}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/></svg>;
    default:
      return null;
  }
}

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Try to determine active item from URL
  const currentPath = location.pathname;
  let defaultActive = 'dashboard';
  let defaultExpanded = '';
  
  navSections.forEach(section => {
    section.items.forEach(item => {
      if (currentPath.includes(item.path)) {
        defaultActive = item.id;
        if (item.subItems) {
          defaultExpanded = item.id;
        }
      }
    });
  });

  const [activeItem, setActiveItem] = useState(defaultActive);
  const [expandedGroups, setExpandedGroups] = useState({ [defaultExpanded]: true });

  const handleNavClick = (item) => {
    if (item.subItems) {
      setExpandedGroups(prev => ({ ...prev, [item.id]: !prev[item.id] }));
      setActiveItem(item.id);
      navigate(item.path);
    } else {
      setActiveItem(item.id);
      navigate(item.path);
    }
  };

  const handleSubItemClick = (parentItem, subItem) => {
    navigate(`${parentItem.path}?tab=${subItem.tabIndex}`);
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="14" fill="rgba(255,255,255,0.15)"/>
            <path d="M16 6C10.48 6 6 10.48 6 16s4.48 10 10 10 10-4.48 10-10S21.52 6 16 6zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" fill="white"/>
          </svg>
        </div>
        <div className="sidebar-logo-text">
          <span className="sidebar-logo-name">Asset<span className="sidebar-logo-highlight">Flow</span></span>
          <span className="sidebar-logo-tagline">Enterprise Asset &<br/>Resource Management System</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navSections.map((section, si) => (
          <div className="sidebar-section" key={si}>
            {section.label && <div className="sidebar-section-label">{section.label}</div>}
            {section.items.map((item) => {
              const isActive = activeItem === item.id;
              const isExpanded = expandedGroups[item.id];
              return (
                <div key={item.id} className="sidebar-nav-group">
                  <button
                    className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                    onClick={() => handleNavClick(item)}
                  >
                    <NavIcon type={item.icon} />
                    <span className="sidebar-nav-text">{item.name}</span>
                    {item.badge && <span className="sidebar-nav-badge">{item.badge}</span>}
                    {item.subItems && (
                      <svg className={`sidebar-nav-chevron ${isExpanded ? 'expanded' : ''}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6 9 12 15 18 9"/>
                      </svg>
                    )}
                  </button>
                  
                  {item.subItems && isExpanded && (
                    <div className="sidebar-subnav">
                      {item.subItems.map(subItem => (
                        <button
                          key={subItem.id}
                          className="sidebar-subnav-item"
                          onClick={() => handleSubItemClick(item, subItem)}
                        >
                          <span className="sidebar-subnav-dot"></span>
                          {subItem.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="sidebar-user">
        <div className="sidebar-user-avatar">PR</div>
        <div className="sidebar-user-info">
          <span className="sidebar-user-name">Prince Roy</span>
          <span className="sidebar-user-role">Administrator</span>
        </div>
        <svg className="sidebar-user-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </div>
    </aside>
>>>>>>> origin/kashyap
  );
}
