import { Bell, Briefcase, CheckCircle2, FileCheck2, Trash2, UserPlus } from 'lucide-react';
import { deleteNotification, markAllNotificationsAsRead, markNotificationAsRead } from '../../../services/notificationService';
import { NAVY, GOLD } from '../constants';

const iconMap = {
  briefcase: Briefcase,
  check: CheckCircle2,
  fileCheck: FileCheck2,
  userPlus: UserPlus,
};

export default function NotificationsView({ notificationsData = [], employersData = [], onNotificationAction }) {
  const unreadCount = notificationsData.filter(n => !n.read && !n.isRead).length;
  const getEmployerId = (note) => (
    note.targetId ||
    note.action?.entityId ||
    note.metadata?.employerId ||
    note.metadata?.id ||
    ''
  );
  const getEmployerStatus = (note) => {
    if (note.type !== 'employer_access_request') {
      return '';
    }

    const employerId = getEmployerId(note);
    const employer = employersData.find((item) => item.id === employerId || item.uid === employerId);
    return employer?.verificationStatus || '';
  };
  const getActionLabel = (note) => {
    if (note.type === 'employer_access_request') {
      return getEmployerStatus(note) === 'approved' ? 'Approved' : 'Review';
    }

    return note.actionLabel;
  };
  const isActionDisabled = (note) => (
    note.type === 'employer_access_request' && getEmployerStatus(note) === 'approved'
  );
  const isRead = (note) => Boolean(note.read || note.isRead);
  const markAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead(notificationsData);
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
    <div style={{ maxWidth: '1200px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <h1 style={{ margin: '0 0 8px 0', fontSize: 24, fontWeight: 800, color: NAVY }}>System Alerts & Notifications</h1>
          <p style={{ margin: 0, fontSize: 14, color: '#64748b' }}>
            {unreadCount === 0 ? "You're all caught up." : `${unreadCount} unread alerts requiring review.`}
          </p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllAsRead} style={{ background: 'none', border: 'none', color: GOLD, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
            Mark all as read
          </button>
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {notificationsData.length === 0 && (
          <div style={{ textAlign: 'center', padding: '64px', background: 'white', borderRadius: 12, color: '#94a3b8' }}>No notifications to display.</div>
        )}
        {notificationsData.map(note => (
          <div key={note.id} style={{
            background: '#ffffff', borderRadius: 12, padding: '24px 32px', display: 'flex', alignItems: 'flex-start', gap: 20,
            border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: '#eef2ff', color: NAVY, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {(() => {
                const Icon = iconMap[note.iconKey] || Bell;
                return <Icon size={18} />;
              })()}
            </div>
            <div style={{ marginTop: 6 }}>
              {isRead(note) ? (
                <div style={{ width: 10, height: 10, borderRadius: '50%', border: '2px solid #cbd5e1' }} />
              ) : (
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: GOLD }} />
              )}
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: 15, fontWeight: isRead(note) ? 600 : 700, color: isRead(note) ? '#64748b' : NAVY }}>{note.title}</h3>
              <p style={{ margin: '0 0 12px 0', fontSize: 14, color: isRead(note) ? '#94a3b8' : '#475569', lineHeight: 1.6 }}>{note.desc || note.message}</p>
              <div style={{ fontSize: 12, color: '#94a3b8' }}>{note.time || note.date}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {getActionLabel(note) && (
                <button
                  onClick={() => {
                    if (!isActionDisabled(note)) {
                      onNotificationAction(note);
                    }
                  }}
                  disabled={isActionDisabled(note)}
                  style={{
                    background: isActionDisabled(note) ? '#dcfce7' : NAVY,
                    border: 'none',
                    color: isActionDisabled(note) ? '#166534' : '#ffffff',
                    borderRadius: 6,
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: isActionDisabled(note) ? 'default' : 'pointer',
                    padding: '8px 12px'
                  }}
                >
                  {getActionLabel(note)}
                </button>
              )}
              <button
                onClick={() => {
                  if (!isRead(note)) {
                    handleMarkRead(note.id);
                  }
                }}
                disabled={isRead(note)}
                style={{ background: 'none', border: 'none', color: isRead(note) ? '#94a3b8' : '#64748b', fontSize: 13, fontWeight: 600, cursor: isRead(note) ? 'default' : 'pointer', padding: '4px 8px' }}
              >
                {isRead(note) ? 'Read' : 'Mark read'}
              </button>
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
