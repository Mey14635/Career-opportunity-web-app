import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import './index.css';

// Public Pages
import LandingPage from './pages/public/LandingPage';
import Login from './pages/public/Login';
import EmployerAccess from './pages/public/EmployerAccess';

// Dashboards
import AdminDashboard from './pages/admin/AdminDashboard';
import EmployerDashboard from './pages/employer/EmployerDashboard';
import StudentDashboard from './pages/student/StudentDashboard';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/employer-access" element={<EmployerAccess />} />
          
          {/* Dashboard Routes */}
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/employer-dashboard" element={<EmployerDashboard />} />
          <Route path="/student-dashboard/*" element={<StudentDashboard />} />

          {/* Catch-all redirect for bad URLs */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}