import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
<<<<<<< HEAD
<<<<<<< HEAD
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import EmployeeDashboard from './pages/EmployeeDashboard';
import MyAssets from './pages/MyAssets';
import BookResource from './pages/BookResource';
import MaintenanceRequests from './pages/MaintenanceRequests';
import TransferRequests from './pages/TransferRequests';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import DashboardLayout from './components/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function AppRoutes() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div className="dash-spinner" style={{ width: 36, height: 36, border: '3px solid #e5e7eb', borderTopColor: '#6c3ce0', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />} />

      {/* Protected routes — Employee Dashboard */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout><EmployeeDashboard /></DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-assets"
        element={
          <ProtectedRoute>
            <DashboardLayout><MyAssets /></DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/book-resource"
        element={
          <ProtectedRoute>
            <DashboardLayout><BookResource /></DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/maintenance-requests"
        element={
          <ProtectedRoute>
            <DashboardLayout><MaintenanceRequests /></DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/transfer-requests"
        element={
          <ProtectedRoute>
            <DashboardLayout><TransferRequests /></DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <DashboardLayout><Notifications /></DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <DashboardLayout><Profile /></DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Default redirect */}
      <Route path="/" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />} />
      <Route path="*" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />} />
    </Routes>
  );
=======
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardLayout from './components/DashboardLayout';
import Dashboard from './pages/Dashboard';
import DepartmentAssets from './pages/DepartmentAssets';
import ApprovalRequests from './pages/ApprovalRequests';
import ResourceBookings from './pages/ResourceBookings';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import { getToken } from './services/authService';
import './App.css';

function ProtectedRoute({ children }) {
  const token = getToken();
  if (!token) return <Navigate to="/login" replace />;
  return children;
>>>>>>> origin/prince
}

function App() {
  return (
    <BrowserRouter>
<<<<<<< HEAD
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
=======
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="assets" element={<DepartmentAssets />} />
          <Route path="approvals" element={<ApprovalRequests />} />
          <Route path="bookings" element={<ResourceBookings />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="profile" element={<Profile />} />
        </Route>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
>>>>>>> origin/prince
    </BrowserRouter>
=======
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
>>>>>>> origin/jay
  );
}

export default App;
<<<<<<< HEAD
=======

>>>>>>> origin/jay
