import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../config/firebase";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null);
    const [hasProfile, setHasProfile] = useState(false);
    const [verificationStatus, setVerificationStatus] = useState(null);
    const [loading, setLoading] = useState(true);

    // Helper function to fetch the user metadata
    const fetchUserRoleAndProfile = useCallback(async (currentUser) => {
        try {
            const userDocSnap = await getDoc(doc(db, "user", currentUser.uid));
            
            if (userDocSnap.exists()) {
                const data = userDocSnap.data();
                setRole(data.role ?? null);
                setVerificationStatus(data.verificationStatus ?? null);
                setHasProfile(data.profileCompleted === true);
            } else {
                setRole(null);
                setHasProfile(false);
                setVerificationStatus(null);
            }
        } catch (err) {
            console.error("Error fetching user role data:", err);
            setRole(null);
            setHasProfile(false);
            setVerificationStatus(null);
        } finally {
            setLoading(false);
        }
    }, []);

    // ─── CENTRALISED LOGOUT ──────────────────────────────────────────────
    const logout = useCallback(async () => {
        try {
            // 1. Sign out from Firebase
            await signOut(auth);
            
            // 2. Clear all browser storage
            localStorage.clear();
            sessionStorage.clear();
            
            // 3. Clear cookies (if any)
            document.cookie.split(";").forEach((c) => {
                document.cookie = c
                    .replace(/^ +/, "")
                    .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
            });
            
            // 4. Force a full page reload to reset app state
            window.location.replace('/');
        } catch (err) {
            console.error("Logout error:", err);
            // Fallback: force reload anyway
            window.location.replace('/');
        }
    }, []);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
            setLoading(true);
            setUser(nextUser);

            if (!nextUser) {
                setRole(null);
                setHasProfile(false);
                setVerificationStatus(null);
                setLoading(false);
                return;
            }

            await fetchUserRoleAndProfile(nextUser);
        });

        return unsubscribe;
    }, [fetchUserRoleAndProfile]);

    // Refresh auth status (after profile update, etc.)
    const refreshAuthStatus = useCallback(async () => {
        if (auth.currentUser) {
            setLoading(true);
            await fetchUserRoleAndProfile(auth.currentUser);
        }
    }, [fetchUserRoleAndProfile]);

    const value = useMemo(
        () => ({
            user,
            role,
            loading,
            hasProfile,
            verificationStatus,
            isStudent: role === "student",
            isEmployer: role === "employer",
            isAdmin: role === "admin",
            isAuthenticated: Boolean(user),
            refreshAuthStatus,
            logout, // <-- exposed to all components
        }),
        [loading, role, user, hasProfile, verificationStatus, refreshAuthStatus, logout],
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};