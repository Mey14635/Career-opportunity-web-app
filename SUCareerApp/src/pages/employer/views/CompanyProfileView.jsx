import { Building2, Upload, Info, Globe, Mail, Phone, Users, ExternalLink } from 'lucide-react';
import { NAVY, GOLD, inputStyle, labelStyle } from '../constants';

export default function CompanyProfileView({ onSave, onViewPublic, onUploadLogo }) {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: '0 0 4px 0', fontSize: 20, fontWeight: 800, color: NAVY }}>Company Profile</h1>
          <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>Manage how your corporate identity appears to candidates.</p>
        </div>
        <button onClick={onViewPublic} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', color: '#475569', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
          <ExternalLink size={14} /> View Public Profile
        </button>
      </div>

      <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #bfdbfe' }}>
            <Building2 size={24} color="#3b82f6" />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: NAVY, marginBottom: 4 }}>Corporate Logo</div>
            <button onClick={onUploadLogo} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', color: GOLD, fontSize: 12, fontWeight: 700, cursor: 'pointer', padding: 0, marginBottom: 4 }}>
              <Upload size={12} /> Upload New Branding
            </button>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>PNG or SVG vector metrics, max 2MB</div>
          </div>
        </div>

        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <label style={labelStyle}>COMPANY NAME</label>
            <div style={{ position: 'relative' }}>
              <Building2 size={14} color="#94a3b8" style={{ position: 'absolute', left: 14, top: 12 }} />
              <input type="text" defaultValue="Safaricom PLC" style={{...inputStyle, paddingLeft: 40}} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div>
              <label style={labelStyle}>INDUSTRY</label>
              <div style={{ position: 'relative' }}>
                <Info size={14} color="#94a3b8" style={{ position: 'absolute', left: 14, top: 12 }} />
                <input type="text" defaultValue="Telecommunications & Financial Services" style={{...inputStyle, paddingLeft: 40}} />
              </div>
            </div>
            <div>
              <label style={labelStyle}>COMPANY SIZE</label>
              <div style={{ position: 'relative' }}>
                <Users size={14} color="#94a3b8" style={{ position: 'absolute', left: 14, top: 12 }} />
                <select style={{...inputStyle, paddingLeft: 40, appearance: 'auto'}}>
                  <option>1-50 Employees</option>
                  <option>51-200 Employees</option>
                  <option>201-500 Employees</option>
                  <option selected>500+ Employees</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <label style={labelStyle}>WEBSITE URL</label>
            <div style={{ position: 'relative' }}>
              <Globe size={14} color="#94a3b8" style={{ position: 'absolute', left: 14, top: 12 }} />
              <input type="url" defaultValue="https://www.safaricom.co.ke" style={{...inputStyle, paddingLeft: 40}} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div>
              <label style={labelStyle}>PRIMARY TALENT CONTACT EMAIL</label>
              <div style={{ position: 'relative' }}>
                <Mail size={14} color="#94a3b8" style={{ position: 'absolute', left: 14, top: 12 }} />
                <input type="email" defaultValue="talent@safaricom.co.ke" style={{...inputStyle, paddingLeft: 40}} />
              </div>
            </div>
            <div>
              <label style={labelStyle}>OFFICIAL PHONE NUMBER</label>
              <div style={{ position: 'relative' }}>
                <Phone size={14} color="#94a3b8" style={{ position: 'absolute', left: 14, top: 12 }} />
                <input type="tel" defaultValue="+254 722 000 000" style={{...inputStyle, paddingLeft: 40}} />
              </div>
            </div>
          </div>

          <div>
            <label style={labelStyle}>COMPANY OVERVIEW / CULTURE</label>
            <textarea rows="4" style={{...inputStyle, resize: 'vertical'}} defaultValue="Safaricom PLC is a leading communications and technology company in Kenya committed to driving innovation in digital financial ecosystems."></textarea>
          </div>
        </div>

        <div style={{ padding: '20px 24px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={onSave} style={{ padding: '10px 20px', backgroundColor: NAVY, color: '#ffffff', border: 'none', borderRadius: '6px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
            Save Profile Changes
          </button>
        </div>
      </div>
    </div>
  );
}