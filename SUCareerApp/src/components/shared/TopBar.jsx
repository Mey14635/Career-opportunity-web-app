import { useState, useEffect, useRef } from 'react';
import { Search, Bell, Settings, LogOut, ChevronDown } from 'lucide-react';

const NAVY = "#1B3A6B";
const GOLD = "#C9A230";
const BG_GRAY = "#F5F6FA";

export default function TopBar({ onLogout, onSettings, notifications, setActiveTab }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const menuRef = useRef(null);
  const bellRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) setMenuOpen(false);
      if (bellRef.current && !bellRef.current.contains(event.target)) setBellOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;
  const topNotifs = notifications.slice(0, 3);

  return (
    <header style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '12px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 5 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: BG_GRAY, padding: '10px 16px', borderRadius: 8, width: 400, border: '1px solid #e2e8f0' }}>
        <Search size={16} color="#9CA3AF" />
        <input type="text" placeholder="Search employers, students, listings..." style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: 13, width: '100%', color: '#1e293b' }} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        <div ref={bellRef} style={{ position: 'relative' }}>
          <button onClick={() => setBellOpen(!bellOpen)} style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px' }}>
            <Bell size={20} color={NAVY} />
            {unreadCount > 0 && <span style={{ position: 'absolute', top: 0, right: 0, width: 10, height: 10, background: '#ef4444', border: '2px solid white', borderRadius: '50%' }} />}
          </button>
          {bellOpen && (
            <div style={{ position: 'absolute', top: 'calc(100% + 12px)', right: -10, width: 360, maxHeight: 'calc(100vh - 100px)', background: 'white', borderRadius: 12, boxShadow: '0 10px 30px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', zIndex: 50 }}>
              <div style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', flexShrink: 0 }}>
                <span style={{ fontWeight: 700, color: NAVY, fontSize: 14 }}>Recent Alerts</span>
                {unreadCount > 0 && <span style={{ fontSize: 11, color: '#ef4444', background: '#fee2e2', padding: '2px 8px', borderRadius: 12, fontWeight: 700 }}>{unreadCount} New</span>}
              </div>
              <div style={{ overflowY: 'auto', flex: 1 }}>
                {topNotifs.map(n => (
                  <div key={n.id} style={{ padding: '16px', borderBottom: '1px solid #f1f5f9', background: n.read ? 'white' : '#f8fafc' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>{n.title}</span>
                      {!n.read && <div style={{ width: 6, height: 6, background: GOLD, borderRadius: '50%', marginTop: 4, flexShrink: 0 }} />}
                    </div>
                    <p style={{ fontSize: 12, color: '#64748b', margin: '0 0 6px 0', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{n.desc}</p>
                    <span style={{ fontSize: 11, color: '#94a3b8' }}>{n.time}</span>
                  </div>
                ))}
              </div>
              <button 
                onClick={() => { setBellOpen(false); setActiveTab('notifications'); }}
                style={{ width: '100%', padding: '14px', background: 'white', borderTop: '1px solid #e2e8f0', borderBottom: 'none', borderLeft: 'none', borderRight: 'none', color: NAVY, fontSize: 13, fontWeight: 700, cursor: 'pointer', textAlign: 'center', transition: 'background 0.2s', flexShrink: 0 }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
              >
                See all Notifications
              </button>
            </div>
          )}
        </div>

        <div ref={menuRef} style={{ position: 'relative' }}>
          <div onClick={() => setMenuOpen(!menuOpen)} style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', padding: '4px 8px', borderRadius: 8, transition: 'background 0.2s' }}>
            <div style={{ width: 36, height: 36, background: NAVY, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: 'white', fontSize: 14, fontWeight: 'bold' }}>CA</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>CDS Portal</span>
              <ChevronDown size={16} color="#64748b" style={{ transform: menuOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
            </div>
          </div>
          {menuOpen && (
            <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, width: 200, background: 'white', borderRadius: 8, boxShadow: '0 10px 25px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <button 
                onClick={() => { setMenuOpen(false); onSettings(); }}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 14, color: '#334155', borderBottom: '1px solid #f1f5f9', textAlign: 'left' }}
              >
                <Settings size={16} /> Account Settings
              </button>
              <button 
                onClick={() => { setMenuOpen(false); onLogout(); }}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 14, color: '#ef4444', textAlign: 'left' }}
              >
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}