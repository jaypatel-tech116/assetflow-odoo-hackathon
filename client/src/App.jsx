import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
<<<<<<< HEAD
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

// Prince & Vraj specific pages
import DepartmentAssets from './pages/DepartmentAssets/DepartmentAssets';
import ApprovalRequests from './pages/ApprovalRequests/ApprovalRequests';
import MyAssets from './pages/MyAssets/MyAssets';
import TransferRequests from './pages/TransferRequests/TransferRequests';
import BookResource from './pages/BookResource/BookResource';
import Profile from './pages/Profile/Profile';
import Notifications from './pages/Notifications/Notifications';

=======
import Login from './pages/Login';
import Register from './pages/Register';
>>>>>>> 879dbf2bd635ae5d9b416f4693c99acc2a2408c9
import './App.css';

function App() {
  return (
<<<<<<< HEAD
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
            
            {/* Prince/DeptHead & Admin */}
            <Route path="/department-assets" element={<DepartmentAssets />} />
            <Route path="/approval-requests" element={<ApprovalRequests />} />
            
            {/* Vraj/Employee & General */}
            <Route path="/my-assets" element={<MyAssets />} />
            <Route path="/transfer-requests" element={<TransferRequests />} />
            <Route path="/book-resource" element={<BookResource />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/notifications" element={<Notifications />} />

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
=======
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
>>>>>>> 879dbf2bd635ae5d9b416f4693c99acc2a2408c9
  );
}

export default App;

