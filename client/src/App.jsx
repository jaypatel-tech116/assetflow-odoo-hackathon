import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import OrganizationSetup from "./pages/OrganizationSetup";
import Reports from "./pages/Reports";
import ActivityLogs from "./pages/ActivityLogs";
import AuditCycle from "./pages/AuditCycle";
import "./App.css";

function App() {
  const isAuthenticated = !!localStorage.getItem('token');

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/organization-setup" element={<OrganizationSetup />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/activity-logs" element={<ActivityLogs />} />
        <Route path="/audit-cycle" element={<AuditCycle />} />
        {/* If logged in, go to dashboard, else go to login */}
        <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;

