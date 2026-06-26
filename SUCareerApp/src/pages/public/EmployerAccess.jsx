// ─── src/pages/public/EmployerAccess.jsx ──────────────────────────────────────

import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { createUserWithEmailAndPassword, onAuthStateChanged, sendEmailVerification, signInWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth';
import { doc, getDoc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import AuthAlert from '../../components/shared/Auth/AuthAlert';
import AuthCard from '../../components/shared/Auth/AuthCard';
import AuthInput from '../../components/shared/Auth/AuthInput';
import Button from '../../components/shared/Button/Button';

const NAVY = "#1B3A6B";
export default function EmployerAccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshAuthStatus } = useAuth();
  const employerEmailVerified = new URLSearchParams(location.search).get('verified') === 'employer';
  const employerApprovalPending = location.state?.authError === 'Your employer account is awaiting admin approval.';
  const [authMode, setAuthMode] = useState(location.state?.mode === 'login' || location.state?.authError ? 'login' : 'register');
  const [isSubmitted, setIsSubmitted] = useState(employerEmailVerified || employerApprovalPending);
  const [waitingForApproval, setWaitingForApproval] = useState(employerEmailVerified || employerApprovalPending);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(employerApprovalPending ? '' : location.state?.authError || '');
  const [formData, setFormData] = useState({
    companyName: '',
    contactPerson: '',
    email: '',
    website: '',
    password: '',
    confirmPassword: '',
  });
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const showRegister = () => {
    setAuthMode('register');
    setError('');
    setIsSubmitted(false);
    setWaitingForApproval(false);
  };

  const showLogin = () => {
    setAuthMode('login');
    setError('');
    setIsSubmitted(false);
    setWaitingForApproval(false);
  };

  const isStrathmoreEmail = (email) => {
    const domain = email.trim().toLowerCase().split('@')[1] || '';
    return domain === 'strathmore.edu' || domain.endsWith('.strathmore.edu');
  };

  useEffect(() => {
    let unsubscribeUserDoc = null;
    let refreshIntervalId = null;
    let latestUserData = null;

    const goToDashboardWhenReady = async (currentUser, userData) => {
      if (userData?.role !== 'employer') {
        return;
      }

      if (userData.verificationStatus !== 'approved') {
        setWaitingForApproval(true);
        return;
      }

      await currentUser.reload();

      if (currentUser.emailVerified) {
        await refreshAuthStatus();
        navigate('/employer-dashboard', { replace: true });
        return;
      }

      setWaitingForApproval(true);
    };

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (unsubscribeUserDoc) {
        unsubscribeUserDoc();
        unsubscribeUserDoc = null;
      }

      if (refreshIntervalId) {
        window.clearInterval(refreshIntervalId);
        refreshIntervalId = null;
      }

      if (!currentUser) {
        return;
      }

      // If admin approves while an employer is still on this page, move them straight into the dashboard.
      unsubscribeUserDoc = onSnapshot(doc(db, 'user', currentUser.uid), async (userSnap) => {
        latestUserData = userSnap.exists() ? userSnap.data() : null;
        await goToDashboardWhenReady(currentUser, latestUserData);
      });

      refreshIntervalId = window.setInterval(async () => {
        if (latestUserData?.role === 'employer') {
          await goToDashboardWhenReady(currentUser, latestUserData);
        }
      }, 5000);
    });

    return () => {
      unsubscribeAuth();

      if (unsubscribeUserDoc) {
        unsubscribeUserDoc();
      }

      if (refreshIntervalId) {
        window.clearInterval(refreshIntervalId);
      }
    };
  }, [navigate, refreshAuthStatus]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitted(false);

    const companyName = formData.companyName.trim();
    const contactPerson = formData.contactPerson.trim();
    const email = formData.email.trim().toLowerCase();
    const website = formData.website.trim();

    if (isStrathmoreEmail(email)) {
      setError('Employer accounts must use an official company email. Strathmore email addresses are reserved for student and admin access.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const credential = await createUserWithEmailAndPassword(auth, email, formData.password);
      const user = credential.user;

      await updateProfile(user, { displayName: companyName });
      // Firebase's hosted email page returns here after Continue; the page then shows a wait-for-approval message.
      await sendEmailVerification(user, {
        url: `${window.location.origin}/employer-access?verified=employer`,
        handleCodeInApp: false,
      });

      const employerData = {
        uid: user.uid,
        companyName,
        contactPerson,
        email,
        website,
        role: 'employer',
        verificationStatus: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await Promise.all([
        setDoc(doc(db, 'user', user.uid), {
          uid: user.uid,
          email,
          displayName: companyName,
          role: 'employer',
          verificationStatus: 'pending',
          profileCompleted: true,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }, { merge: true }),
        setDoc(doc(db, 'employer_profiles', user.uid), employerData, { merge: true }),
      ]);

      setFormData({ companyName: '', contactPerson: '', email: '', website: '', password: '', confirmPassword: '' });
      setIsSubmitted(true);
      setWaitingForApproval(true);
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please sign in or use a different company email.');
      } else if (err.code === 'auth/weak-password') {
        setError('Use a stronger password with at least 6 characters.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmployerLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const email = loginData.email.trim().toLowerCase();

    try {
      const credential = await signInWithEmailAndPassword(auth, email, loginData.password);
      await credential.user.reload();

      const userDocSnap = await getDoc(doc(db, 'user', credential.user.uid));
      const userData = userDocSnap.exists() ? userDocSnap.data() : null;

      if (!userData || userData.role !== 'employer') {
        await signOut(auth);
        setError('This account is not registered as an employer.');
        return;
      }

      if (!credential.user.emailVerified) {
        await signOut(auth);
        setError('Please verify your email before signing in to the employer portal.');
        return;
      }

      if (userData.verificationStatus !== 'approved') {
        await signOut(auth);
        setError('Your employer account is awaiting admin approval.');
        return;
      }

      await refreshAuthStatus();
      navigate('/employer-dashboard', { replace: true });
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found') {
        setError('Invalid email address or password combination.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  if (employerEmailVerified) {
    return (
      <>
        <div style={{ position: 'absolute', top: 24, left: 24, zIndex: 50 }}>
          <button onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', color: NAVY, fontWeight: 600, cursor: 'pointer', fontSize: 15, fontFamily: 'Inter' }}>
            <ArrowLeft size={18} /> Back to Home
          </button>
        </div>
        <AuthCard title="Approval in Progress" subtitle="Your employer request is waiting for admin approval">
          <AuthAlert
            type="success"
            message="Your email has been verified. Keep this page open. Once the administrator approves your employer account, you will be taken to the dashboard automatically."
          />
          
        </AuthCard>
      </>
    );
  }

  return (
    <>
      <div style={{ position: 'absolute', top: 24, left: 24, zIndex: 50 }}>
        <button onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', color: NAVY, fontWeight: 600, cursor: 'pointer', fontSize: 15, fontFamily: 'Inter' }}>
          <ArrowLeft size={18} /> Back to Home
        </button>
      </div>

      <AuthCard
        title={waitingForApproval ? 'Approval in Progress' : authMode === 'login' ? 'Employer Sign In' : 'Employer Registration'}
        subtitle={waitingForApproval ? 'Your employer account is waiting for admin approval' : authMode === 'login' ? 'Enter your approved employer credentials' : 'Request access to the CDS Employer Portal'}
      >
        <AuthAlert message={error} type="danger" />
        {waitingForApproval ? (
          <AuthAlert
            type="success"
            message={isSubmitted ? "Check your email to verify your account if you have not already. Your request has been sent to the Strathmore CDS Administration, and this page will open the dashboard automatically after approval." : "Your employer request is pending admin approval. This page will open the dashboard automatically after approval."}
          />
        ) : authMode === 'login' ? (
          <form onSubmit={handleEmployerLogin} className="auth-form">
            <AuthInput
              type="email"
              name="email"
              value={loginData.email}
              required
              onChange={handleLoginChange}
              label="Employer Email"
              placeholder="hr@company.com"
            />
            <AuthInput
              type="password"
              name="password"
              value={loginData.password}
              required
              onChange={handleLoginChange}
              label="Password"
              placeholder="Enter your password"
            />

            <Button type="submit" className="auth-btn" disabled={loading}>
              {loading ? 'Checking Access...' : 'Sign In to Employer Portal'}
            </Button>

            <div className="auth-footer">
              <p>Need approval? <button type="button" className="auth-link-btn" onClick={showRegister}>Partner With Us</button></p>
            </div>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="auth-form">
            <AuthInput type="text" name="companyName" value={formData.companyName} required onChange={handleChange} label="Company Name" placeholder="Safaricom PLC" />
            <AuthInput type="text" name="contactPerson" value={formData.contactPerson} required onChange={handleChange} label="Contact Person" placeholder="Jane Mwangi" />
            <AuthInput type="email" name="email" value={formData.email} required onChange={handleChange} label="Official Email" placeholder="hr@company.com" />
            <AuthInput type="url" name="website" value={formData.website} onChange={handleChange} label="Website URL" placeholder="https://company.com" />
            <AuthInput type="password" name="password" value={formData.password} required onChange={handleChange} label="Password" placeholder="Enter your password" />
            <AuthInput type="password" name="confirmPassword" value={formData.confirmPassword} required onChange={handleChange} label="Confirm Password" placeholder="Confirm your password" />

            <Button type="submit" className="auth-btn" disabled={loading}>
              {loading ? 'Submitting Request...' : 'Request Employer Access'}
            </Button>

            <div className="auth-footer">
              <p>Already approved? <button type="button" className="auth-link-btn" onClick={showLogin}>Sign in to your account</button></p>
            </div>
          </form>
        )}
      </AuthCard>
    </>
  );
}
