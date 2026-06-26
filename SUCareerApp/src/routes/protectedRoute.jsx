import { Navigate, useLocation } from "react-router-dom";
import { auth } from "../config/firebase";
import { useAuth } from "../contexts/AuthContext";

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const { loading, isAuthenticated, role, hasProfile, verificationStatus, user } = useAuth();
    const location = useLocation();
    const isStudentPortal = location.pathname.startsWith("/student-dashboard");
    const isEmployerPortal = location.pathname.startsWith("/employer-dashboard");
    const loginPath = isStudentPortal ? "/student-dashboard/login" : isEmployerPortal ? "/employer-access" : "/login";
    const verifyEmailPath = "/student-dashboard/verify-email";
    const profilePath = isStudentPortal ? "/student-dashboard/profile" : "/profile";

    if (loading) {
        return <div className="auth-status">Loading secure page...</div>;
    }

    // 1. Not logged in? Go straight to login
    if (!isAuthenticated) {
        return <Navigate to={loginPath} replace state={{ from: location }} />;
    }

    // Signed-in students and employers must confirm email before protected access.
    const emailVerified = user?.emailVerified || auth.currentUser?.emailVerified;
    if (user && role === "student" && !emailVerified) {
        return <Navigate to={verifyEmailPath} replace />;
    }

    if (user && role === "employer" && !emailVerified) {
        return <Navigate to={loginPath} replace state={{ authError: "Please verify your email before signing in to the employer portal." }} />;
    }

    // 2. Logged in but trying to access a role-restricted route (like /dashboard)
    if (allowedRoles.length > 0) {
        if (!allowedRoles.includes(role)) {
            return <Navigate to={loginPath} replace />;
        }
        
        // If they are a student but haven't set up their profile, force them to onboarding
        if (role === "student" && !hasProfile) {
            return <Navigate to={profilePath} replace />;
        }

        if (role === "employer" && verificationStatus !== "approved") {
            return <Navigate to={loginPath} replace state={{ authError: "Your employer account is awaiting admin approval." }} />;
        }
    }

    return children;
};

export default ProtectedRoute;
