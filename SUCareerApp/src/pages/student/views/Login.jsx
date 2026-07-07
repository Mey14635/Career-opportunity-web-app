import { useState } from "react";
import { auth, db } from "../../../config/firebase";
import { sendPasswordResetEmail, signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import AuthAlert from "../../../components/shared/Auth/AuthAlert";
import AuthCard from "../../../components/shared/Auth/AuthCard";
import AuthFooter from "../../../components/shared/Auth/AuthFooter";
import AuthInput from "../../../components/shared/Auth/AuthInput";
import AuthTabs from "../../../components/shared/Auth/AuthTabs";
import Button from "../../../components/shared/Button/Button";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoginLoading(true);

    const { email, password } = formData;
    const trimmedEmail = email.trim().toLowerCase();

    try {
      // 1. Authenticate user credentials with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, trimmedEmail, password);
      const user = userCredential.user;

      await user.reload();

      if (!user.emailVerified) {
        navigate("/student-dashboard/verify-email");
        return;
      }

      // 2. Fetch their authorization profile from the Firestore 'user' collection
      const userDocRef = doc(db, "user", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        const userRole = userData.role;
        
        // Aligned with the global AuthContext state property
        const hasProfile = userData.profileCompleted === true;

        // 3. Role-based Redirection
        if (userRole === "student") {
          // Send returning completed users to dashboard, send uncompleted users to profile setup
          navigate(hasProfile ? "/student-dashboard/dashboard" : "/student-dashboard/profile", { replace: true });
        } else {
          setError("Authorized role mismatch. Access denied.");
        }
      } else {
        navigate("/student-dashboard/verify-email");
      }
    } catch (err) {
      if (err.code === "auth/invalid-credential" || err.code === "auth/user-not-found") {
        setError("Invalid email address or password combination.");
      } else {
        setError(err.message);
      }
    } finally {
      setLoginLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    const trimmedEmail = formData.email.trim().toLowerCase();
    setError("");
    setSuccess("");

    if (!trimmedEmail) {
      setError("Enter your email address first, then use forgot password.");
      return;
    }

    setResetLoading(true);

    try {
      await sendPasswordResetEmail(auth, trimmedEmail);
      setSuccess("Password reset email sent. Check your inbox for Firebase's reset link.");
    } catch (err) {
      if (err.code === "auth/invalid-email") {
        setError("Enter a valid email address before requesting a password reset.");
      } else if (err.code === "auth/too-many-requests") {
        setError("Too many reset attempts. Please wait a moment and try again.");
      } else {
        setError(err.message);
      }
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <>
      <div style={{ position: "absolute", top: "24px", left: "24px", zIndex: 50 }}>
        <button
          onClick={() => navigate("/")}
          style={{ display: "flex", alignItems: "center", gap: "8px", background: "none", border: "none", color: "#1B3A6B", fontWeight: 600, cursor: "pointer", fontSize: "15px", fontFamily: "Inter" }}
        >
          <ArrowLeft size={18} /> Back to Home
        </button>
      </div>

    <AuthCard>
      <AuthTabs activeTab="login" />
      <AuthAlert message={error} type="danger" />
      <AuthAlert message={success} type="success" />

      <form onSubmit={handleLogin} className="auth-form">
        <AuthInput 
          type="email" 
          name="email" 
          value={formData.email} 
          required 
          onChange={handleChange} 
          label="Strathmore Email Address" 
          placeholder="username@strathmore.edu" 
        />

        <AuthInput 
          type="password" 
          name="password" 
          value={formData.password} 
          required 
          onChange={handleChange} 
          label="Password" 
          placeholder="Enter your password" 
        />

        <button
          type="button"
          className="auth-link-btn"
          onClick={handleForgotPassword}
          disabled={resetLoading || loginLoading}
        >
          {resetLoading ? "Sending reset email..." : "Forgot password?"}
        </button>

        <Button type="submit" className="auth-btn" disabled={loginLoading || resetLoading}>
          {loginLoading ? "Signing In..." : "Log In"}
        </Button>
      </form>

      <AuthFooter text="Don't have an account yet?" linkText="Register Here" to="/student-dashboard/signup" />
    </AuthCard>
    </>
  );
};

export default Login;
