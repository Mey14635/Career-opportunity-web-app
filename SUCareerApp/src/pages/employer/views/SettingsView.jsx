import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { NAVY, inputStyle, labelStyle } from '../constants';

function PasswordField({ label }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div style={{ marginBottom: 20 }}>
      <label style={labelStyle}>{label}</label>
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

export default function SettingsView({ onUpdatePassword }) {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}><h1 style={{ margin: '0 0 4px 0', fontSize: 20, fontWeight: 800, color: NAVY }}>Account Settings</h1><p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>Manage your credentials and API endpoints.</p></div>
      <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', padding: '32px', border: '1px solid #e2e8f0' }}>
        <h3 style={labelStyle}>Security Access Control</h3>
        <PasswordField label="Current System Password" />
        <PasswordField label="New System Password" />
        <button onClick={onUpdatePassword} style={{ padding: '10px 24px', backgroundColor: NAVY, color: '#ffffff', borderRadius: '6px', border: 'none', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>Update Security Token</button>
      </div>
    </div>
  );
}
