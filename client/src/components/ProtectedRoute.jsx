import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
<<<<<<< HEAD
 * Wrapper that redirects unauthenticated users to /login.
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
=======
 * Protects routes — redirects to /login if unauthenticated.
 * Optionally restricts to specific roles.
 */
export default function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, loading, user } = useAuth();
>>>>>>> origin/jay

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
<<<<<<< HEAD
        <div className="btn-spinner-icon" style={{ width: 40, height: 40 }} />
=======
        <div className="loading-spinner" />
>>>>>>> origin/jay
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

<<<<<<< HEAD
=======
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }

>>>>>>> origin/jay
  return children;
}
