import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { Bell, BriefcaseBusiness, CheckCircle2, Clock3, Trash2 } from "lucide-react";
import JobDetailsModal from "../../../components/student/JobDetailsModal/JobDetailsModal";
import { db } from "../../../config/firebase";
import { useAuth } from "../../../contexts/AuthContext";
import {
  deleteNotification,
  getOpportunitySnapByReference,
  markNotificationAsRead,
  subscribeToUserNotifications,
} from "../../../services/notificationService";
import { mapOpportunityDoc } from "../../../utils/opportunityMapper";
import "./Notifications.css";

function getNotificationTone(notification) {
  if (notification.type === "application_status_update") return "status";
  if (notification.type === "deadline_48h") return "deadline";
  return "default";
}

function renderNotificationIcon(notification) {
  if (notification.type === "application_status_update") {
    return <CheckCircle2 size={18} strokeWidth={2.4} />;
  }

  if (notification.type === "deadline_48h") {
    return <Clock3 size={18} strokeWidth={2.4} />;
  }

  if (notification.type === "saved_opportunity") {
    return <BriefcaseBusiness size={18} strokeWidth={2.4} />;
  }

  return <Bell size={18} strokeWidth={2.4} />;
}

function canOpenOpportunity(notification) {
  return notification.targetType === "opportunity" || notification.type === "deadline_48h";
}

function Notifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [appliedOpportunityIds, setAppliedOpportunityIds] = useState([]);
  const unreadCount = notifications.filter((notification) => !notification.isRead && !notification.read).length;

  useEffect(() => {
    if (!user) {
      return;
    }

    return subscribeToUserNotifications(
      user.uid,
      (nextNotifications) => {
        setNotifications(nextNotifications);
      },
      (err) => {
        console.error("Failed to load notifications:", err);
      }
    );
  }, [user]);

  useEffect(() => {
    async function loadAppliedOpportunities() {
      if (!user) {
        setAppliedOpportunityIds([]);
        return;
      }

      try {
        const applicationsSnap = await getDocs(query(
          collection(db, "applications"),
          where("studentId", "==", user.uid)
        ));
        const ids = [
          ...new Set(
            applicationsSnap.docs
              .map((docSnap) => docSnap.data().opportunityId || docSnap.data().opportunityID)
              .filter(Boolean)
          ),
        ];

        setAppliedOpportunityIds(ids);
      } catch (err) {
        console.error("Failed to load applied opportunities:", err);
      }
    }

    loadAppliedOpportunities();
  }, [user]);

  function markOpportunityApplied(opportunityId) {
    setAppliedOpportunityIds((currentIds) =>
      currentIds.includes(opportunityId) ? currentIds : [...currentIds, opportunityId]
    );
  }

  async function handleMarkRead(notificationId) {
    try {
      await markNotificationAsRead(notificationId);
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  }

  async function handleOpenOpportunity(notification) {
    if (!notification.opportunityId) {
      return;
    }

    try {
      if (!notification.isRead) {
        await markNotificationAsRead(notification.id);
      }

      const opportunitySnap = await getOpportunitySnapByReference(notification.opportunityId);

      if (opportunitySnap) {
        setSelectedOpportunity(mapOpportunityDoc(opportunitySnap));
      }
    } catch (err) {
      console.error("Failed to open opportunity from notification:", err);
    }
  }

  async function handleDelete(notificationId) {
    try {
      await deleteNotification(notificationId);
    } catch (err) {
      console.error("Failed to delete notification:", err);
    }
  }

  return (
    <main className="notifications-page">
      <div className="notifications-shell">
        <div className="notifications-heading">
          <div>
            <h1>Notifications</h1>
            <p>
              Do not miss important deadlines for your saved opportunities and applications.
            </p>
          </div>
          <span>{unreadCount} unread</span>
        </div>

        {notifications.length > 0 ? (
          <div className="notifications-list">
            {notifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onMarkRead={handleMarkRead}
                onDelete={handleDelete}
                onOpenOpportunity={handleOpenOpportunity}
              />
            ))}
          </div>
        ) : (
          <div className="notifications-empty">
            <h2>No notifications yet</h2>
            <p>Employer updates, deadline reminders, and application alerts will appear here.</p>
          </div>
        )}
      </div>

      <JobDetailsModal
        opportunity={selectedOpportunity}
        saved={Boolean(selectedOpportunity)}
        hideSaveButton
        applied={selectedOpportunity ? appliedOpportunityIds.includes(selectedOpportunity.id) : false}
        onApplied={markOpportunityApplied}
        onClose={() => setSelectedOpportunity(null)}
      />
    </main>
  );
}

function NotificationCard({ notification, onMarkRead, onDelete, onOpenOpportunity }) {
  const isRead = notification.isRead || notification.read;
  const canReviewOpportunity = canOpenOpportunity(notification) && notification.opportunityId;
  const tone = getNotificationTone(notification);

  return (
    <article className={`notification-card ${isRead ? "read" : ""}`}>
      <div className={`notification-card-icon ${tone}`} aria-hidden="true">
        {renderNotificationIcon(notification)}
      </div>

      <div className="notification-card-content">
        <div className="notification-card-top">
          <div className="notification-card-title">
            <span className={`notification-read-dot ${isRead ? "read" : ""}`} aria-hidden="true" />
            <h2>{notification.title}</h2>
          </div>
          <div className="notification-card-buttons">
            <button
              type="button"
              disabled={isRead}
              onClick={() => onMarkRead(notification.id)}
            >
              {isRead ? "Read" : "Mark read"}
            </button>
            <button
              className="delete-notification-btn"
              type="button"
              aria-label="Delete notification"
              onClick={() => onDelete(notification.id)}
            >
              <Trash2 size={14} aria-hidden="true" />
              Delete
            </button>
          </div>
        </div>
        <p>{notification.message}</p>
        {notification.deadlineLabel && notification.type === "deadline_48h" && (
          <div className="notification-deadline">{notification.deadlineLabel}</div>
        )}
        <small>{notification.time || notification.date}</small>
        {canReviewOpportunity && (
          <div className="notification-actions">
            <button type="button" onClick={() => onOpenOpportunity(notification)}>
              View opportunity
            </button>
          </div>
        )}
      </div>
    </article>
  );
}

export default Notifications;
