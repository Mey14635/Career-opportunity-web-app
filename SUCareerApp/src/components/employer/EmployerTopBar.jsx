import { useState, useEffect, useRef } from 'react';
import { ChevronDown, Bell, Settings, LogOut } from 'lucide-react';
import { NAVY, GOLD } from '../../pages/employer/constants';

export default function EmployerTopBar({ 
  breadcrumb, 
  notifications, 
  setNotifications, 
  onSettings, 
  onLogout, 
  onSeeAllNotifications 
}) {
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

  // ✅ Removed unused 'unreadCount'

  return (
    <header style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '0 40px', height: 70, display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 5 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8' }}>
        {breadcrumb.split(' > ').map((part, i, arr) => (
          <span key={i}>
            {i === arr.length - 1 ? <span style={{ color: NAVY }}>{part}</span> : part}
            {i < arr.length - 1 && <span style={{ margin: '0 8px' }}>&gt;</span>}
          </span>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        <div ref={bellRef} style={{ position: 'relative' }}>
          <button onClick={() => setBellOpen(!bellOpen)} style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}>
            <Bell size={18} color="#64748b" />
            {notifications.some(n => !n.read) && (
              <span style={{ position: 'absolute', top: -2, right: -2, width: 8, height: 8, backgroundColor: '#ef4444', borderRadius: '50%', border: '2px solid #ffffff' }}></span>
            )}
          </button>

          {bellOpen && (
            <div style={{ position: 'absolute', top: 'calc(100% + 12px)', right: -10, width: 320, backgroundColor: '#ffffff', borderRadius: '10px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0', zIndex: 50, overflow: 'hidden' }}>
              <div style={{ padding: '14px 16px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
                <span style={{ fontWeight: 700, color: NAVY, fontSize: 13, fontFamily: 'Inter' }}>Notifications</span>
                <button onClick={() => setNotifications(notifications.map(n => ({...n, read: true})))} style={{ background: 'none', border: 'none', color: GOLD, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter' }}>Mark all read</button>
              </div>
              <div className="custom-scroll" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {notifications.map(n => (
                  <div key={n.id} style={{ padding: '14px 16px', borderBottom: '1px solid #f1f5f9', backgroundColor: n.read ? '#ffffff' : '#f8fafc' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: NAVY }}>{n.title}</span>
                      {!n.read && <div style={{ width: 6, height: 6, backgroundColor: GOLD, borderRadius: '50%', marginTop: 4 }}></div>}
                    </div>
                    <p style={{ fontSize: 11, color: '#64748b', margin: '0 0 6px 0', lineHeight: 1.5 }}>{n.desc}</p>
                    <span style={{ fontSize: 10, color: '#94a3b8' }}>{n.time}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={onSeeAllNotifications}
                style={{ width: '100%', padding: '12px', background: 'white', borderTop: '1px solid #e2e8f0', borderBottom: 'none', borderLeft: 'none', borderRight: 'none', color: NAVY, fontSize: 12, fontWeight: 700, cursor: 'pointer', textAlign: 'center', transition: 'background 0.2s', fontFamily: 'Inter' }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
              >
                See all Notifications
              </button>
            </div>
          )}
        </div>

        <div ref={menuRef} style={{ position: 'relative' }}>
          <div onClick={() => setMenuOpen(!menuOpen)} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', padding: '4px 8px', borderRadius: '6px', transition: 'background-color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
             <div style={{ width: 32, height: 32, backgroundColor: NAVY, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <span style={{ color: 'white', fontSize: 12, fontWeight: 700, fontFamily: 'Inter' }}>SF</span>
             </div>
             <ChevronDown size={14} color="#64748b" />
          </div>

          {menuOpen && (
            <div style={{ position: 'absolute', top: 'calc(100% + 12px)', right: 0, width: 220, backgroundColor: '#ffffff', borderRadius: '10px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0', overflow: 'hidden', zIndex: 50 }}>
              <div style={{ padding: '14px 16px', borderBottom: '1px solid #f1f5f9', backgroundColor: '#f8fafc' }}>
                <div style={{ fontWeight: 700, color: NAVY, fontSize: 13, fontFamily: 'Inter' }}>Safaricom PLC</div>
                <div style={{ color: '#64748b', fontSize: 11, marginTop: 4, fontFamily: 'Inter' }}>talent@safaricom.co.ke</div>
              </div>
              <div style={{ padding: '6px' }}>
                <button onClick={() => { setMenuOpen(false); onSettings(); }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#475569', borderRadius: '6px', textAlign: 'left', transition: 'background-color 0.2s', fontFamily: 'Inter' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                  <Settings size={14} /> Account Settings
                </button>
                <button onClick={() => { setMenuOpen(false); onLogout(); }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#ef4444', borderRadius: '6px', textAlign: 'left', marginTop: 2, transition: 'background-color 0.2s', fontFamily: 'Inter' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fee2e2'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                  <LogOut size={14} /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}