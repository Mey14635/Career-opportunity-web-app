import { useState } from "react";
import { auth } from "../../firebase";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import AuthAlert from "../../components/Auth/AuthAlert";
import AuthCard from "../../components/Auth/AuthCard";
import AuthFooter from "../../components/Auth/AuthFooter";
import AuthInput from "../../components/Auth/AuthInput";
import AuthTabs from "../../components/Auth/AuthTabs";
import Button from "../../components/Button/Button";

const SignUp = () => {
  const navigate = useNavigate();
  const pendingRegistrationKey = "pendingStudentRegistration";
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const sendStudentVerificationEmail = async (user) => {
    await sendEmailVerification(user, {
      url: `${window.location.origin}/verify-email`,
      handleCodeInApp: false,
    });
    setSuccess("Verification email sent. Please check your inbox  .");
  };

  const savePendingRegistration = (user, firstName, lastName, email) => {
    window.localStorage.setItem(
      pendingRegistrationKey,
      JSON.stringify({
        uid: user.uid,
        email,
        displayName: `${firstName} ${lastName}`,
      }),
    );
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const { firstName, lastName, email, password, confirmPassword } = formData;
    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    const trimmedEmail = email.trim().toLowerCase();

    // 1. Client-Side Input Validations
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!trimmedEmail.endsWith("@strathmore.edu")) {
      setError("Access denied. You must register using a valid @strathmore.edu email address.");
      return;
    }

    setLoading(true);

    try {
      // 2. Create the Account in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, trimmedEmail, password);
      const user = userCredential.user;

      
      await updateProfile(user, {
        displayName: `${trimmedFirstName} ${trimmedLastName}`,
      });

      // 4. Trigger Verification Email immediately

      await sendStudentVerificationEmail(user);
      savePendingRegistration(user, trimmedFirstName, trimmedLastName, trimmedEmail);
      setFormData({ firstName: trimmedFirstName, lastName: trimmedLastName, email: trimmedEmail, password: "", confirmPassword: "" });
      navigate("/verify-email", { replace: true });
    } catch (err) {
      console.error(err);
      if (err.code === "auth/email-already-in-use") {
        try {
          const existingCredential = await signInWithEmailAndPassword(auth, trimmedEmail, password);
          const existingUser = existingCredential.user;

          if (existingUser.emailVerified) {
            setError("This email address is already verified. Please log in instead.");
            return;
          }

          await sendStudentVerificationEmail(existingUser);
          savePendingRegistration(existingUser, trimmedFirstName, trimmedLastName, trimmedEmail);
          setFormData({ firstName: trimmedFirstName, lastName: trimmedLastName, email: trimmedEmail, password: "", confirmPassword: "" });
          navigate("/verify-email", { replace: true });
        } catch (signInErr) {
          console.error(signInErr);
          setError("This email is already registered. Please log in or reset your password.");
        }
      } else if (err.code === "auth/operation-not-allowed") {
        setError("Email/password signup is not enabled in Firebase Authentication.");
      } else if (err.code === "auth/too-many-requests") {
        setError("Firebase has temporarily blocked email sending because of too many attempts. Please wait and try again.");
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard>
      <AuthTabs activeTab="signup" />
      <AuthAlert message={error} type="danger" />
      <AuthAlert message={success} type="success" />

      <form onSubmit={handleSignUp} className="auth-form">
        <div className="form-row">
          <AuthInput type="text" name="firstName" value={formData.firstName} required onChange={handleChange} label="First Name" placeholder="John" />
          <AuthInput type="text" name="lastName" value={formData.lastName} required onChange={handleChange} label="Last Name" placeholder="Doe" />
        </div>

        <AuthInput type="email" name="email" value={formData.email} required onChange={handleChange} label="Strathmore Email Address" placeholder="username@strathmore.edu" />

        <AuthInput type="password" name="password" value={formData.password} required onChange={handleChange} label="Password" placeholder="••••••••" />

        <AuthInput type="password" name="confirmPassword" value={formData.confirmPassword} required onChange={handleChange} label="Confirm Password" placeholder="••••••••" />

        <Button type="submit" className="auth-btn" disabled={loading}>
          {loading ? "Creating Account..." : "Register Account"}
        </Button>
      </form>

      <AuthFooter text="Already have an account?" linkText="Log In" to="/login" />
    </AuthCard>
  );
};

export default SignUp;
