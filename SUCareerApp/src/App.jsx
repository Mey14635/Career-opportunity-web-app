import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/public/LandingPage';
import LoginPage from './pages/public/Login';
import EmployerAccess from './pages/public/EmployerAccess';
import AdminDashboard from './pages/admin/AdminDashboard';
import EmployerDashboard from './pages/employer/EmployerDashboard';
import StudentDashboard from './pages/student/StudentDashboard';
import CompanyPublicView from './pages/public/CompanyPublicView';
import ProtectedRoute from './routes/protectedRoute';

function handleLogout() {
  window.location.href = '/';
}

function handleEmployerLogin() {
  window.location.href = '/employer-dashboard';
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ─── PUBLIC ROUTES ────────────────────────────────────────────────── */}
        <Route path="/" element={<LandingPage onNavigate={(route) => {
          if (route === 'login') window.location.href = '/login';
          else if (route === 'employer-access') window.location.href = '/employer-access';
        }} />} />
        
        <Route path="/login" element={<LoginPage 
          onLogin={() => window.location.href = '/admin-dashboard'}
          onBack={() => window.location.href = '/'}
        />} />

        <Route path="/employer-access" element={<EmployerAccess 
          onNavigate={(route) => {
            if (route === 'landing') window.location.href = '/';
          }}
          onLogin={handleEmployerLogin}
        />} />

        {/* ─── PROTECTED ROUTES ────────────────────────────────────────────── */}
        <Route path="/admin-dashboard" element={<AdminDashboard onLogout={handleLogout} />} />
        <Route path="/employer-dashboard" element={<EmployerDashboard onLogout={handleLogout} />} />
        <Route path="/student-dashboard/*" element={<StudentDashboard />} />

        {/* ─── COMPANY PROFILE (all authenticated roles) ───────────────────── */}
        <Route 
          path="/company/:employerId" 
          element={
            <ProtectedRoute allowedRoles={['student', 'employer', 'admin']}>
              <CompanyPublicView />
            </ProtectedRoute>
          } 
        />

        {/* ─── CATCH-ALL ────────────────────────────────────────────────────── */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;