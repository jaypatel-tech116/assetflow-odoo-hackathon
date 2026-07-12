import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/AppLayout';

// Auth pages
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// Dashboard & Setup
import Dashboard from './pages/Dashboard/Dashboard';
import OrganizationSetup from './pages/OrganizationSetup/OrganizationSetup';

// Assets
import AssetDirectory from './pages/AssetDirectory/AssetDirectory';
import AssetDetails from './pages/AssetDirectory/AssetDetails';

// Allocations & Resources
import AllocationTransfer from './pages/AllocationTransfer/AllocationTransfer';
import ResourceBooking from './pages/ResourceBooking/ResourceBooking';

// Maintenance
import Maintenance from './pages/Maintenance/Maintenance';

// Audits
import AuditCycles from './pages/AssetAudit/AuditCycles';
import AuditCycleDetail from './pages/AssetAudit/AuditCycleDetail';

// Reports & Logs
import Reports from './pages/Reports/Reports';
import ActivityLogs from './pages/ActivityLogs/ActivityLogs';

import './App.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Protected ERP Shell */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/assets" element={<AssetDirectory />} />
            <Route path="/assets/:id" element={<AssetDetails />} />
            <Route path="/allocations" element={<AllocationTransfer />} />
            <Route path="/bookings" element={<ResourceBooking />} />
            <Route path="/maintenance" element={<Maintenance />} />
            <Route path="/audits" element={<AuditCycles />} />
            <Route path="/audits/:id" element={<AuditCycleDetail />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/activity-logs" element={<ActivityLogs />} />

            {/* Admin-Only Route */}
            <Route
              path="/organization"
              element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <OrganizationSetup />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Catch All redirects to Dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

