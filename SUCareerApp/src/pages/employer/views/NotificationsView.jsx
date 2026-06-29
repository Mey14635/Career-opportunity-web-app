import { Bell, Briefcase, CheckCircle2, FileCheck2, Trash2, UserPlus } from 'lucide-react';
import { deleteNotification, markAllNotificationsAsRead, markNotificationAsRead } from '../../../services/notificationService';
import { NAVY, GOLD } from '../constants';

const iconMap = {
  briefcase: Briefcase,
  check: CheckCircle2,
  fileCheck: FileCheck2,
  userPlus: UserPlus,
};

export default function NotificationsView({ notifications = [], onNotificationAction }) {
  const unreadCount = notifications.filter(n => !n.read && !n.isRead).length;
  const markAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead(notifications);
    } catch (err) {
      console.error('Failed to mark notifications as read:', err);
    }
  };
  const handleDelete = async (id) => {
    try {
      await deleteNotification(id);
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };
  const handleMarkRead = async (id) => {
    try {
      await markNotificationAsRead(id);
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: '0 0 4px 0', fontSize: 20, fontWeight: 800, color: NAVY }}>Notifications</h1>
          <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>
            {unreadCount === 0 ? "You're all caught up." : `${unreadCount} unread alerts.`}
          </p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllAsRead} style={{ background: 'none', border: 'none', color: GOLD, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
            Mark all as read
          </button>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {notifications.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: 10, color: '#94a3b8' }}>
            No notifications to display.
          </div>
        )}
        {notifications.map(note => (
          <div key={note.id} style={{
            background: '#ffffff', borderRadius: '10px', padding: '20px 24px',
            display: 'flex', alignItems: 'flex-start', gap: 16,
            border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
          }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#eef2ff', color: NAVY, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {(() => {
                const Icon = iconMap[note.iconKey] || Bell;
                return <Icon size={18} />;
              })()}
            </div>
            <div style={{ marginTop: 4 }}>
              {note.read ? (
                <div style={{ width: 10, height: 10, borderRadius: '50%', border: '2px solid #cbd5e1' }} />
              ) : (
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: GOLD }} />
              )}
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: '0 0 6px 0', fontSize: 14, fontWeight: note.read ? 600 : 700, color: note.read ? '#64748b' : NAVY }}>
                {note.title}
              </h3>
              <p style={{ margin: '0 0 10px 0', fontSize: 13, color: note.read ? '#94a3b8' : '#475569', lineHeight: 1.6 }}>
                {note.desc || note.message}
              </p>
              <div style={{ fontSize: 11, color: '#94a3b8' }}>{note.time || note.date}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {note.actionLabel && (
                <button onClick={() => onNotificationAction(note)} style={{ background: NAVY, border: 'none', color: '#ffffff', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer', padding: '8px 12px' }}>
                  {note.actionLabel}
                </button>
              )}
              {!note.read && (
              <button onClick={() => handleMarkRead(note.id)} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: 12, fontWeight: 600, cursor: 'pointer', padding: '4px 8px' }}>
                Mark read
              </button>
              )}
              <button onClick={() => handleDelete(note.id)} style={{ background: '#f1f5f9', border: 'none', color: '#64748b', borderRadius: 6, cursor: 'pointer', padding: 8, display: 'flex' }}>
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
