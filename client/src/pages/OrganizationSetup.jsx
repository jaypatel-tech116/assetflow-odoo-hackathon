import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import DepartmentManagement from '../components/organization/DepartmentManagement';
import AssetCategoryManagement from '../components/organization/AssetCategoryManagement';
import EmployeeDirectory from '../components/organization/EmployeeDirectory';
import './OrganizationSetup.css';

export default function OrganizationSetup() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Read tab from query string or default to 0
  const queryParams = new URLSearchParams(location.search);
  const initialTab = parseInt(queryParams.get('tab')) || 0;
  
  const [activeTab, setActiveTab] = useState(initialTab);

  // Update tab state if URL changes
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const handleTabChange = (index) => {
    setActiveTab(index);
    navigate(`/organization-setup?tab=${index}`);
  };

  return (
    <DashboardLayout>
      <div className="org-setup-header">
        <h1 className="org-setup-title">Organization Setup</h1>
        <p className="org-setup-subtitle">Manage your organization structure, asset categories, and employee directory.</p>
      </div>

      <div className="org-tabs">
        <button 
          className={`org-tab ${activeTab === 0 ? 'active' : ''}`}
          onClick={() => handleTabChange(0)}
        >
          <span className="org-tab-letter">A</span> Department Management
        </button>
        <button 
          className={`org-tab ${activeTab === 1 ? 'active' : ''}`}
          onClick={() => handleTabChange(1)}
        >
          <span className="org-tab-letter">B</span> Asset Category Management
        </button>
        <button 
          className={`org-tab ${activeTab === 2 ? 'active' : ''}`}
          onClick={() => handleTabChange(2)}
        >
          <span className="org-tab-letter">C</span> Employee Directory
        </button>
      </div>

      <div className="org-tab-content">
        {activeTab === 0 && <DepartmentManagement />}
        {activeTab === 1 && <AssetCategoryManagement />}
        {activeTab === 2 && <EmployeeDirectory />}
      </div>
    </DashboardLayout>
  );
}
