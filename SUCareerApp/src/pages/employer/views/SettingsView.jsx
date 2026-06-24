import { NAVY, inputStyle, labelStyle } from '../constants';

export default function SettingsView({ onUpdatePassword }) {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}><h1 style={{ margin: '0 0 4px 0', fontSize: 20, fontWeight: 800, color: NAVY }}>Account Settings</h1><p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>Manage your credentials and API endpoints.</p></div>
      <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', padding: '32px', border: '1px solid #e2e8f0' }}>
        <h3 style={labelStyle}>Security Access Control</h3>
        <div style={{ marginBottom: 20 }}><label style={labelStyle}>Current System Password</label><input type="password" placeholder="••••••••" style={inputStyle} /></div>
        <div style={{ marginBottom: 20 }}><label style={labelStyle}>New System Password</label><input type="password" placeholder="••••••••" style={inputStyle} /></div>
        <button onClick={onUpdatePassword} style={{ padding: '10px 24px', backgroundColor: NAVY, color: '#ffffff', borderRadius: '6px', border: 'none', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>Update Security Token</button>
      </div>
    </div>
  );
}