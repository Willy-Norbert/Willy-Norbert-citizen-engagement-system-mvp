
import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Dashboard from "./pages/dashboard";
import Register from "./pages/registrationpage";
import Sample from "./pages/Samplepage1";
import Enquiry from "./pages/EnquiryPage";
import ComplaintGrid from "./pages/ComplaintGrid";
import AdminDashboard from "./pages/AdminDashboard";
import LoginPage from "./pages/LoginPage";
import DepartmentDashboard from "./pages/DepartmentDashboard";
import ComplaintTracking from "./pages/ComplaintTracking";
import CitizenDashboard from "./pages/CitizenDashboard";
import HomePage from "./pages/HomePage";
import UserProfile from "./pages/UserProfile"; // This will need to be created

// Auth guard for protected routes
const ProtectedRoute = ({ element, requiredRole }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return element;
};

// Role-based redirection
const RoleBasedRedirect = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  
  if (!user) {
    return <Navigate to="/home" replace />;
  }
  
  switch (user.role) {
    case 'admin':
      return <Navigate to="/admin" replace />;
    case 'department':
      return <Navigate to="/department-dashboard" replace />;
    case 'citizen':
      return <Navigate to="/citizen-dashboard" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} exact />
        <Route path="/home" element={<HomePage />} exact />
        
        {/* Root path shows HomePage for non-authenticated users and redirects based on role for authenticated users */}
        <Route path="/" element={
          localStorage.getItem('token') ? <RoleBasedRedirect /> : <HomePage />
        } exact />
        
        {/* Protected routes - any authenticated user */}
        <Route path="/Register" element={<Register />} exact />
        <Route path="/Sample" element={<ProtectedRoute element={<Sample />} />} exact />
        <Route path="/Enquiry" element={<Enquiry />} exact />
        <Route path="/ComplaintGrid" element={<ComplaintGrid />} exact />
        <Route path="/ComplaintTracking/:id" element={<ProtectedRoute element={<ComplaintTracking />} />} exact />
        <Route path="/profile" element={<ProtectedRoute element={<UserProfile />} />} exact />
        
        {/* Legacy dashboard, will redirect to role-specific dashboard */}
        <Route path="/dashboard" element={<RoleBasedRedirect />} exact />
        
        {/* Role-specific routes */}
        <Route path="/admin" element={<ProtectedRoute element={<AdminDashboard />} requiredRole="admin" />} exact />
        <Route path="/department-dashboard" element={<ProtectedRoute element={<DepartmentDashboard />} requiredRole="department" />} exact />
        <Route path="/citizen-dashboard" element={<ProtectedRoute element={<CitizenDashboard />} requiredRole="citizen" />} exact />
        
        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
