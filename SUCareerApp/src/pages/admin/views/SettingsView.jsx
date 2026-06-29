import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { NAVY } from '../constants';

function PasswordField({ label, inputStyle }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div style={{ marginBottom: 24 }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 8 }}>{label}</label>
      <div style={{ position: 'relative' }}>
        <input type={showPassword ? 'text' : 'password'} placeholder="••••••••" style={{ ...inputStyle, paddingRight: 44 }} />
        <button
          type="button"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          onClick={() => setShowPassword((current) => !current)}
          style={{ position: 'absolute', top: '50%', right: 10, transform: 'translateY(-50%)', width: 30, height: 30, border: 'none', borderRadius: 8, background: 'transparent', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </div>
    </div>
  );
}

export default function SettingsView() {
  const inputStyle = {
    width: '100%', padding: '12px 16px', borderRadius: 8, border: '1px solid #e2e8f0',
    fontSize: 14, color: '#1e293b', backgroundColor: '#F8FAFC', boxSizing: 'border-box',
    outline: 'none', fontFamily: 'inherit', transition: 'border-color 0.2s'
  };

  return (
    <div style={{ maxWidth: '800px' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ margin: '0 0 8px 0', fontSize: 24, fontWeight: 800, color: NAVY }}>Account Settings</h1>
        <p style={{ margin: 0, fontSize: 14, color: '#64748b' }}>Manage your personal details and security credentials.</p>
      </div>
      <div style={{ background: 'white', borderRadius: 16, padding: '40px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
        <div style={{ paddingBottom: 32, borderBottom: '1px solid #f1f5f9', marginBottom: 32 }}>
          <h3 style={{ margin: '0 0 24px 0', fontSize: 16, fontWeight: 700, color: NAVY }}>Personal Details</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 8 }}>First Name</label>
              <input type="text" style={inputStyle} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 8 }}>Last Name</label>
              <input type="text" style={inputStyle} />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 8 }}>Department</label>
            <input type="text" style={inputStyle} />
          </div>
        </div>
        <div style={{ marginBottom: 40 }}>
          <h3 style={{ margin: '0 0 24px 0', fontSize: 16, fontWeight: 700, color: NAVY }}>Security</h3>
          <PasswordField label="Current Password" inputStyle={inputStyle} />
          <PasswordField label="New Password" inputStyle={inputStyle} />
          <PasswordField label="Confirm New Password" inputStyle={inputStyle} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
          <button style={{ padding: '12px 32px', backgroundColor: NAVY, color: '#ffffff', borderRadius: 8, border: 'none', fontWeight: 600, fontSize: 14, cursor: 'pointer', transition: 'background 0.2s' }}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
