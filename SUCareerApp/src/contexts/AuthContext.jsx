import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../config/firebase";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null);
    const [hasProfile, setHasProfile] = useState(false); // New flag
    const [loading, setLoading] = useState(true);

    // Helper function to fetch the user metadata cleanly
    const fetchUserRoleAndProfile = useCallback(async (currentUser) => {
        try {
            const userDocSnap = await getDoc(doc(db, "user", currentUser.uid));
            
            if (userDocSnap.exists()) {
                const data = userDocSnap.data();
                setRole(data.role ?? null);
                
                // Check if they completed onboarding profile setup
                setHasProfile(data.profileCompleted === true);
            } else {
                setRole(null);
                setHasProfile(false);
            }
        } catch (err) {
            console.error("Error fetching user role data:", err);
            setRole(null);
            setHasProfile(false);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
            setLoading(true);
            setUser(nextUser);

            if (!nextUser) {
                setRole(null);
                setHasProfile(false);
                setLoading(false);
                return;
            }

            await fetchUserRoleAndProfile(nextUser);
        });

        return unsubscribe;
    }, [fetchUserRoleAndProfile]);

    // Provide a function to manually trigger a refresh after profile completion
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
            isStudent: role === "student",
            isAuthenticated: Boolean(user),
            refreshAuthStatus, // Expose this to pages changing profile state
        }),
        [loading, role, user, hasProfile, refreshAuthStatus],
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
