import Sidebar from './Sidebar';
import TopBar from './TopBar';
import './DashboardLayout.css';

export default function DashboardLayout({ children }) {
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-main-container">
        <TopBar />
        <main className="dashboard-content">
          {children}
        </main>
      </div>
    </div>
  );
}
