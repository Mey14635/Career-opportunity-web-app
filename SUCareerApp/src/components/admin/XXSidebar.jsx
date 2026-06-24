import { LogOut, LayoutDashboard, GraduationCap, Building2, Shield } from 'lucide-react';
import { NAVY, GOLD } from '../../pages/admin/constants';
import NavButton from './NavButton';

export default function Sidebar({ activeTab, setActiveTab, navigate }) {
  return (
    <aside
      style={{
        width: 260,
        background: NAVY,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      {/* Logo & Brand - now on one line */}
      <div
        style={{
          padding: '28px 20px 20px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              background: GOLD,
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <span style={{ color: NAVY, fontWeight: 800, fontSize: 18 }}>CDS</span>
          </div>
          {/* Combined text on one line */}
          <div
            style={{
              color: 'white',
              fontWeight: 700,
              fontSize: 14,
              lineHeight: 1.3,
            }}
          >
            CDS Command Center
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <nav
        style={{
          flex: 1,
          padding: '20px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        <NavButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={LayoutDashboard} label="System Overview" />
        <NavButton active={activeTab === 'students'} onClick={() => setActiveTab('students')} icon={GraduationCap} label="Student Directory" />
        <NavButton active={activeTab === 'vetting'} onClick={() => setActiveTab('vetting')} icon={Building2} label="Employer Vetting" />
        <NavButton active={activeTab === 'moderation'} onClick={() => setActiveTab('moderation')} icon={Shield} label="Moderation Queue" />
      </nav>

      {/* Sign Out */}
      <div style={{ padding: '20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <button
          onClick={() => navigate('/')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            color: 'rgba(255,255,255,0.6)',
            fontSize: 13,
            fontWeight: 500,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            width: '100%',
            padding: '10px 12px',
            borderRadius: 8,
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
            e.currentTarget.style.color = 'white';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
          }}
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}