import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "../../routes/protectedRoute";
import Applications from "./views/Applications";
import Dashboard from "./views/Dashboard";
import Favorites from "./views/Favorites";
import Login from "./views/Login";
import Notifications from "./views/Notifications";
import Profile from "./views/profile";
import SignUp from "./views/SignUp";
import StudentLayout from "./layouts/StudentLayout";
import VerifyEmail from "./views/VerifyEmail";

function StudentDashboard() {
  return (
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
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <StudentLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/applications" element={<Applications />} />
      </Route>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

