import { Navigate, useLocation } from "react-router-dom";
import { auth } from "../config/firebase";
import { useAuth } from "../contexts/AuthContext";

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const { loading, isAuthenticated, role, hasProfile, user } = useAuth();
    const location = useLocation();

    if (loading) {
        return <div className="auth-status">Loading secure page...</div>;
    }

    // 1. Not logged in? Go straight to login
    if (!isAuthenticated) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    // Signed-in students must confirm their email before profile setup.
    const emailVerified = user?.emailVerified || auth.currentUser?.emailVerified;
    if (user && !emailVerified) {
        return <Navigate to="/verify-email" replace />;
    }

    // 2. Logged in but trying to access a role-restricted route (like /dashboard)
    if (allowedRoles.length > 0) {
        if (!allowedRoles.includes(role)) {
            return <Navigate to="/login" replace />;
        }
        
        // If they are a student but haven't set up their profile, force them to onboarding
        if (role === "student" && !hasProfile) {
            return <Navigate to="/profile" replace />;
        }
    }

    return children;
};

export default ProtectedRoute;
