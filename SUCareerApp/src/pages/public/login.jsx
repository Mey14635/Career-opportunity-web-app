import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const NAVY = "#1B3A6B";
const GOLD = "#C9A230";
const BG_GRAY = "#F5F6FA";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');

  const inputStyle = {
    width: '100%', padding: '12px 16px', borderRadius: '8px', 
    border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box',
    outline: 'none', fontFamily: 'inherit', background: '#F8FAFC'
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const userEmail = email.toLowerCase();
    
    // Restored your previous logic exactly
    if (userEmail.includes('admin') || userEmail === 'cds@strathmore.edu' || userEmail.includes('@strathmore.edu')) {
      navigate('/admin-dashboard');
    } else if (userEmail.includes('employer') || userEmail.includes('@company.com')) {
      navigate('/employer-dashboard');
    } else {
      alert('Please use an authorized email (e.g., cds@strathmore.edu or hr@company.com)');
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
        <h2 style={{ textAlign: 'center', color: NAVY, margin: '0 0 8px 0', fontSize: '24px' }}>Portal Login</h2>
        <p style={{ textAlign: 'center', color: '#64748b', margin: '0 0 24px 0', fontSize: '14px' }}>Sign in to access your dashboard</p>
        
        <div style={{ padding: '12px', background: '#f8fafc', borderRadius: 8, fontSize: '13px', color: '#64748b', marginBottom: 24 }}>
          <strong>Demo:</strong> Use <strong>cds@strathmore.edu</strong> for Admin, or <strong>@company.com</strong> for Employer.
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>Email Address</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="cds@strathmore.edu" style={inputStyle} required />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>Password</label>
            <input type="password" placeholder="••••••••" style={inputStyle} required />
          </div>
          <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: NAVY, color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '15px', cursor: 'pointer', marginTop: '8px' }}>
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}