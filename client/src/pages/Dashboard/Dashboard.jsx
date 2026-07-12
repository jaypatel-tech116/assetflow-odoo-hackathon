import { useAuth } from '../../context/AuthContext';
import AdminDashboard from './AdminDashboard';
import DeptHeadDashboard from './DeptHeadDashboard';
import EmployeeDashboard from '../EmployeeDashboard/EmployeeDashboard';

export default function Dashboard() {
  const { user } = useAuth();

  if (!user) return null;

  switch (user.role) {
    case 'Admin':
    case 'Asset Manager':
      return <AdminDashboard />;
    case 'Department Head':
      return <DeptHeadDashboard />;
    case 'Employee':
      return <EmployeeDashboard />;
    default:
      return <div>Unknown role</div>;
  }
}
