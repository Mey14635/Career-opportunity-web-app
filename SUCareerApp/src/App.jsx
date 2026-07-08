// src/App.jsx
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import LandingPage from './pages/public/LandingPage';
import LoginPage from './pages/public/Login';
import EmployerAccess from './pages/public/EmployerAccess';
import HelpCenter from './pages/public/HelpCenter';
import AdminDashboard from './pages/admin/AdminDashboard';
import EmployerDashboard from './pages/employer/EmployerDashboard';
import StudentDashboard from './pages/student/StudentDashboard';
import CompanyPublicView from './pages/public/CompanyPublicView';
import ProtectedRoute from './routes/protectedRoute';

function App() {
  const navigate = useNavigate();

  // ─── Navigation handlers ──────────────────────────────────────────────
  const handleLogout = () => navigate('/');

  const handleEmployerLogin = () => navigate('/employer-dashboard');

  const handleLandingNavigate = (route) => {
    if (route === 'login') navigate('/login');
    else if (route === 'employer-access') navigate('/employer-access');
  };

  const handleLoginNavigate = (action) => {
    if (action === 'login') navigate('/admin-dashboard');
    else if (action === 'back') navigate('/');
  };

  const handleEmployerAccessNavigate = (route) => {
    if (route === 'landing') navigate('/');
  };

  return (
    <Routes>
      <Route path="/" element={<LandingPage onNavigate={handleLandingNavigate} />} />
      <Route
        path="/login"
        element={
          <LoginPage
            onLogin={() => handleLoginNavigate('login')}
            onBack={() => handleLoginNavigate('back')}
          />
        }
      />
      <Route
        path="/employer-access"
        element={
          <EmployerAccess
            onNavigate={handleEmployerAccessNavigate}
            onLogin={handleEmployerLogin}
          />
        }
      />
      <Route path="/help-center" element={<HelpCenter />} />

      <Route
        path="/admin-dashboard"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard onLogout={handleLogout} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employer-dashboard"
        element={
          <ProtectedRoute allowedRoles={['employer']}>
            <EmployerDashboard onLogout={handleLogout} />
          </ProtectedRoute>
        }
      />
      <Route path="/student-dashboard/*" element={<StudentDashboard />} />

      <Route
        path="/company/:employerId"
        element={
          <ProtectedRoute allowedRoles={['student', 'employer', 'admin']}>
            <CompanyPublicView />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;