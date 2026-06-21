import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./views/student/login";
import SignUp from "./views/student/signUp";
import VerifyEmail from "./views/student/verifyEmail";
import Dashboard from "./views/student/Dashboard";
import Favorites from "./views/student/Favorites";
import Notifications from "./views/student/Notifications";
import Applications from "./views/student/Applications";
import Profile from "./views/student/profile";
import Navbar from "./components/Navbar/Navbar";
import DeadlineNotificationChecker from "./components/Notifications/DeadlineNotificationChecker";
import { AuthProvider } from "./Context/authContext";
import ProtectedRoute from "./routes/protectedRoute";
import "./index.css"; 

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/signup" element={<SignUp />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                  <Navbar />
                  <DeadlineNotificationChecker />
                  <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/favorites"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                  <Navbar />
                  <DeadlineNotificationChecker />
                  <Favorites />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                  <Navbar />
                  <DeadlineNotificationChecker />
                  <Notifications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/applications"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                  <Navbar />
                  <DeadlineNotificationChecker />
                  <Applications />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
