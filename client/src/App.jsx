import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
