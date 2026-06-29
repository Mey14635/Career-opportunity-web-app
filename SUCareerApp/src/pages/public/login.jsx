import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';

const NAVY = "#1B3A6B";
const GOLD = "#C9A230";
const BG_GRAY = "#F5F6FA";
const ADMIN_DEMO_EMAIL = "cds@strathmore.edu";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshAuthStatus } = useAuth();
  const [email, setEmail] = useState(ADMIN_DEMO_EMAIL);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(location.state?.authError || '');
  const [loading, setLoading] = useState(false);

  const inputStyle = {
    width: '100%', padding: '12px 16px', borderRadius: '8px', 
    border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box',
    outline: 'none', fontFamily: 'inherit', background: '#F8FAFC'
  };

  const saveAdminRecord = async (user, trimmedEmail) => {
    const userRef = doc(db, 'user', user.uid);
    const userSnap = await getDoc(userRef);
    const adminData = {
      uid: user.uid,
      email: trimmedEmail,
      role: 'admin',
      profileCompleted: true,
      updatedAt: serverTimestamp(),
    };

    if (!userSnap.exists() || !userSnap.data().createdAt) {
      adminData.createdAt = serverTimestamp();
    }

    await setDoc(userRef, adminData, { merge: true });
  };

  const signInOrCreateDemoAdmin = async (trimmedEmail) => {
    try {
      return await signInWithEmailAndPassword(auth, trimmedEmail, password);
    } catch (err) {
      if (err.code !== 'auth/invalid-credential' && err.code !== 'auth/user-not-found') {
        throw err;
      }

      return createUserWithEmailAndPassword(auth, trimmedEmail, password);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const userEmail = email.trim().toLowerCase();

    if (userEmail !== ADMIN_DEMO_EMAIL) {
      setError(`Use ${ADMIN_DEMO_EMAIL} for demo admin access.`);
      setLoading(false);
      return;
    }

    try {
      const credential = await signInOrCreateDemoAdmin(userEmail);
      await saveAdminRecord(credential.user, userEmail);
      await credential.user.reload();
      await refreshAuthStatus();
      navigate('/admin-dashboard', { replace: true });
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/weak-password') {
        setError('Use a stronger password with at least 6 characters.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: BG_GRAY, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{ width: '100%', maxWidth: '400px', backgroundColor: '#ffffff', padding: '40px', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
        <button onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', marginBottom: 32, fontSize: '14px' }}>
          <ArrowLeft size={16} /> Back to Home
        </button>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
           <div style={{ width: 48, height: 48, background: NAVY, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: GOLD, fontWeight: 800, fontSize: 20 }}>SU</span>
          </div>
        </div>
        <h2 style={{ textAlign: 'center', color: NAVY, margin: '0 0 8px 0', fontSize: '24px' }}>Admin Registration</h2>
        <p style={{ textAlign: 'center', color: '#64748b', margin: '0 0 24px 0', fontSize: '14px' }}>Use {ADMIN_DEMO_EMAIL} to access the admin dashboard.</p>

        {error && (
          <div style={{ padding: '12px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, fontSize: '13px', color: '#b91c1c', marginBottom: 24, lineHeight: 1.5 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>Email Address</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder={ADMIN_DEMO_EMAIL} style={inputStyle} required />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" style={{ ...inputStyle, paddingRight: 44 }} required />
              <button
                type="button"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowPassword(current => !current)}
                style={{ position: 'absolute', top: '50%', right: 10, transform: 'translateY(-50%)', width: 30, height: 30, border: 'none', borderRadius: 8, background: 'transparent', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', backgroundColor: NAVY, color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '15px', cursor: loading ? 'not-allowed' : 'pointer', marginTop: '8px', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Please wait...' : 'Continue to Admin Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
}
