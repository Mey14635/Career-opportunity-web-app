import { useState, useEffect, useRef } from 'react';
import { Search, Bell, Settings, LogOut, ChevronDown, Briefcase, CheckCircle2, FileCheck2, Trash2, UserPlus } from 'lucide-react';
import { deleteNotification } from '../../services/notificationService';

const NAVY = "#1B3A6B";
const GOLD = "#C9A230";
const BG_GRAY = "#F5F6FA";

export default function TopBar({
  // ─── REQUIRED ────────────────────────────────────────────────────────
  onLogout,
  onSettings,
  notifications,
  setActiveTab,
  onNotificationAction,

  // ─── BREADCRUMB (optional) ──────────────────────────────────────────
  breadcrumb,

  // ─── SEARCH BAR (optional) ──────────────────────────────────────────
  showSearch = true,
  searchPlaceholder = 'Search employers, students, listings...',

  // ─── USER INFO (dynamic) ────────────────────────────────────────────
  userInitials = 'CA',
  userName = 'CDS Portal',
  userEmail = 'cds@strathmore.edu',
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

  const iconMap = {
    briefcase: Briefcase,
    check: CheckCircle2,
    fileCheck: FileCheck2,
    userPlus: UserPlus,
  };
  const safeNotifications = Array.isArray(notifications) ? notifications : [];
  const unreadCount = safeNotifications.filter(n => !n.read && !n.isRead).length;
  const topNotifs = safeNotifications.slice(0, 3);

  const handleActionClick = (notification) => {
    setBellOpen(false);
    if (onNotificationAction) {
      onNotificationAction(notification);
      return;
    }
    setActiveTab('notifications');
  };

  const handleDelete = async (event, notificationId) => {
    event.stopPropagation();

    try {
      await deleteNotification(notificationId);
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  const getActionLabel = (notification) => (
    notification.type === 'employer_access_request' ? 'Review' : notification.actionLabel
  );

  return (
    <header style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '12px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 5 }}>
      {/* ─── LEFT SIDE: Breadcrumb or Search ─────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
        {breadcrumb ? (
          <div style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8' }}>
            {breadcrumb.split(' > ').map((part, i, arr) => (
              <span key={i}>
                {i === arr.length - 1 ? <span style={{ color: NAVY }}>{part}</span> : part}
                {i < arr.length - 1 && <span style={{ margin: '0 8px' }}>&gt;</span>}
              </span>
            ))}
          </div>
        ) : showSearch ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: BG_GRAY, padding: '10px 16px', borderRadius: 8, width: 400, border: '1px solid #e2e8f0' }}>
            <Search size={16} color="#9CA3AF" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: 13, width: '100%', color: '#1e293b' }}
            />
          </div>
        ) : null}
      </div>

      {/* ─── RIGHT SIDE: Notifications + Profile ────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        {/* ─── NOTIFICATION BELL ────────────────────────────────────── */}
        <div ref={bellRef} style={{ position: 'relative' }}>
          <button onClick={() => setBellOpen(!bellOpen)} style={{ position: 'relative', width: 38, height: 38, background: '#fff9ea', border: '1px solid #f3d78d', borderRadius: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, color: GOLD }}>
            <Bell size={20} color={GOLD} />
            {unreadCount > 0 && <span style={{ position: 'absolute', top: -6, right: -8, minWidth: 18, height: 18, padding: '0 5px', background: '#ef4444', border: '2px solid white', borderRadius: 999, color: 'white', fontSize: 10, fontWeight: 800, lineHeight: '14px', textAlign: 'center' }}>{unreadCount > 99 ? '99+' : unreadCount}</span>}
          </button>
          {bellOpen && (
            <div style={{ position: 'absolute', top: 'calc(100% + 12px)', right: -10, width: 360, maxHeight: 'calc(100vh - 100px)', background: 'white', borderRadius: 12, boxShadow: '0 10px 30px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', zIndex: 50 }}>
              <div style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', flexShrink: 0 }}>
                <span style={{ fontWeight: 700, color: NAVY, fontSize: 14 }}>Recent Alerts</span>
                {unreadCount > 0 && <span style={{ fontSize: 11, color: '#ef4444', background: '#fee2e2', padding: '2px 8px', borderRadius: 12, fontWeight: 700 }}>{unreadCount} New</span>}
              </div>
              <div style={{ overflowY: 'auto', flex: 1 }}>
                {topNotifs.length === 0 && (
                  <div style={{ padding: '24px 16px', color: '#94a3b8', fontSize: 13, textAlign: 'center' }}>No notifications yet.</div>
                )}
                {topNotifs.map(n => {
                  const NotificationIcon = iconMap[n.iconKey] || Bell;
                  return (
                  <div key={n.id} style={{ padding: '16px', borderBottom: '1px solid #f1f5f9', background: n.read ? 'white' : '#f8fafc', display: 'flex', gap: 12 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: '#eef2ff', color: NAVY, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <NotificationIcon size={16} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>{n.title}</span>
                        {!n.read && <div style={{ width: 7, height: 7, background: GOLD, borderRadius: '50%', marginTop: 5, flexShrink: 0 }} />}
                      </div>
                      <p style={{ fontSize: 12, color: '#64748b', margin: '0 0 8px 0', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{n.desc || n.message}</p>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                        <span style={{ fontSize: 11, color: '#94a3b8' }}>{n.time || n.date}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          {getActionLabel(n) && (
                            <button type="button" onClick={() => handleActionClick(n)} style={{ border: 'none', background: NAVY, color: 'white', borderRadius: 6, padding: '5px 8px', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                              {getActionLabel(n)}
                            </button>
                          )}
                          <button type="button" aria-label="Delete notification" onClick={(event) => handleDelete(event, n.id)} style={{ border: 'none', background: '#f1f5f9', color: '#64748b', borderRadius: 6, padding: 5, cursor: 'pointer', display: 'flex' }}>
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )})}
              </div>
              <button
                onClick={() => { setBellOpen(false); setActiveTab('notifications'); }}
                style={{ width: '100%', padding: '14px', background: 'white', borderTop: '1px solid #e2e8f0', borderBottom: 'none', borderLeft: 'none', borderRight: 'none', color: NAVY, fontSize: 13, fontWeight: 700, cursor: 'pointer', textAlign: 'center', transition: 'background 0.2s', flexShrink: 0 }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
              >
                View All
              </button>
            </div>
          )}
        </div>

        {/* ─── PROFILE MENU ────────────────────────────────────────── */}
        <div ref={menuRef} style={{ position: 'relative' }}>
          <div onClick={() => setMenuOpen(!menuOpen)} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', padding: '4px 8px', borderRadius: 6, transition: 'background-color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
            <div style={{ width: 32, height: 32, background: NAVY, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: 'white', fontSize: 12, fontWeight: 700, fontFamily: 'Inter' }}>{userInitials}</span>
            </div>
            <ChevronDown size={14} color="#64748b" style={{ transform: menuOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
          </div>
          {menuOpen && (
            <div style={{ position: 'absolute', top: 'calc(100% + 12px)', right: 0, width: 220, background: 'white', borderRadius: 10, boxShadow: '0 10px 25px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0', overflow: 'hidden', zIndex: 50 }}>
              <div style={{ padding: '14px 16px', borderBottom: '1px solid #f1f5f9', backgroundColor: '#f8fafc' }}>
                <div style={{ fontWeight: 700, color: NAVY, fontSize: 13, fontFamily: 'Inter' }}>{userName}</div>
                <div style={{ color: '#64748b', fontSize: 11, marginTop: 4, fontFamily: 'Inter' }}>{userEmail}</div>
              </div>
              <div style={{ padding: 6 }}>
                <button
                  onClick={() => { setMenuOpen(false); onSettings(); }}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#475569', borderRadius: 6, textAlign: 'left', transition: 'background-color 0.2s', fontFamily: 'Inter' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <Settings size={14} /> Account Settings
                </button>
                <button
                  onClick={() => { setMenuOpen(false); onLogout(); }}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#ef4444', borderRadius: 6, textAlign: 'left', marginTop: 2, transition: 'background-color 0.2s', fontFamily: 'Inter' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fee2e2'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
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
