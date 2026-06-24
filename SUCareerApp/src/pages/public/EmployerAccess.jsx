// ─── src/pages/public/EmployerAccess.jsx ──────────────────────────────────────

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building, User, Mail, Globe, CheckCircle2 } from 'lucide-react';

const NAVY = "#1B3A6B";
const GOLD = "#C9A230";

export default function EmployerAccess() {
  const navigate = useNavigate();
  const [isSubmitted, setIsSubmitted] = useState(false);

  const inputStyle = {
    width: '100%', padding: '12px 16px 12px 40px', borderRadius: '8px',
    border: '1px solid #e2e8f0', fontSize: '14px', boxSizing: 'border-box',
    outline: 'none', fontFamily: 'inherit', background: '#f8fafc', color: '#1e293b'
  };
  
  const labelStyle = {
    display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569',
    marginBottom: '6px', letterSpacing: '0.5px', textTransform: 'uppercase'
  };

  const handleRegister = (e) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* ─── Navy Left Side ─── */}
      <div style={{ flex: 1, backgroundColor: NAVY, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px', color: '#ffffff' }}>
        <div style={{ maxWidth: '400px', textAlign: 'center' }}>
          <div style={{ width: 80, height: 80, background: GOLD, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 32px auto' }}>
            <span style={{ color: NAVY, fontWeight: 800, fontSize: 32 }}>SU</span>
          </div>
          <h1 style={{ fontSize: '36px', fontWeight: 800, margin: '0 0 16px 0', lineHeight: 1.2 }}>CDS Corporate<br/>Partner Network</h1>
          <p style={{ fontSize: '16px', color: '#cbd5e1', lineHeight: 1.6, marginBottom: '48px' }}>
            Connect your organisation with Strathmore University's top talent across all faculties and departments.
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '32px' }}>
            <div><div style={{ color: GOLD, fontSize: '24px', fontWeight: 800 }}>2,400+</div><div style={{ color: '#cbd5e1', fontSize: '13px' }}>Students</div></div>
            <div><div style={{ color: GOLD, fontSize: '24px', fontWeight: 800 }}>180+</div><div style={{ color: '#cbd5e1', fontSize: '13px' }}>Employers</div></div>
            <div><div style={{ color: GOLD, fontSize: '24px', fontWeight: 800 }}>94%</div><div style={{ color: '#cbd5e1', fontSize: '13px' }}>Placement</div></div>
          </div>
        </div>
      </div>

      {/* ─── White Right Side ─── */}
      <div style={{ flex: 1, backgroundColor: '#ffffff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px', position: 'relative' }}>
        
        <div style={{ maxWidth: '480px', width: '100%' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: 800, color: NAVY, margin: '0 0 8px 0' }}>Employer Registration</h2>
            <p style={{ fontSize: '15px', color: '#64748b', margin: '0' }}>Request access to the CDS Employer Portal</p>
          </div>

          <form onSubmit={handleRegister} style={{ border: '1px solid #e2e8f0', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={labelStyle}>COMPANY NAME</label>
                <div style={{ position: 'relative' }}>
                  <Building size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} />
                  <input type="text" placeholder="Safaricom PLC" style={inputStyle} required />
                </div>
              </div>
              <div>
                <label style={labelStyle}>CONTACT PERSON</label>
                <div style={{ position: 'relative' }}>
                  <User size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} />
                  <input type="text" placeholder="Jane Mwangi" style={inputStyle} required />
                </div>
              </div>
              <div>
                <label style={labelStyle}>OFFICIAL EMAIL</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} />
                  <input type="email" placeholder="hr@company.com" style={inputStyle} required />
                </div>
              </div>
              <div>
                <label style={labelStyle}>WEBSITE URL</label>
                <div style={{ position: 'relative' }}>
                  <Globe size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} />
                  <input type="url" placeholder="https://company.com" style={inputStyle} />
                </div>
              </div>
              
              <button type="submit" style={{ width: '100%', padding: '14px', backgroundColor: GOLD, color: NAVY, border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '15px', cursor: 'pointer', marginTop: '12px' }}>
                Request Employer Access
              </button>
              
              <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '14px', color: '#64748b' }}>
                Already approved? <span onClick={() => navigate('/login')} style={{ color: NAVY, fontWeight: 700, cursor: 'pointer' }}>Sign in to your account</span>
              </div>
            </div>
          </form>

          {isSubmitted && (
            <div style={{ marginTop: '24px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '20px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <CheckCircle2 size={24} color="#16a34a" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <h4 style={{ margin: '0 0 6px 0', color: '#166534', fontSize: '15px', fontWeight: 700 }}>Success State Preview</h4>
                <p style={{ margin: 0, color: '#15803d', fontSize: '13px', lineHeight: 1.5 }}>Your account request has been sent to the Strathmore CDS Administration for verification. You will be notified once approved.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}