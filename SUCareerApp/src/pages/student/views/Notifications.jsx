import { useEffect, useState } from "react";
import JobDetailsModal from "../../../components/student/JobDetailsModal/JobDetailsModal";
import { useAuth } from "../../../contexts/AuthContext";
import {
  deleteNotification,
  getOpportunitySnapByReference,
  markNotificationAsRead,
  subscribeToUserNotifications,
} from "../../../services/notificationService";
import { mapOpportunityDoc } from "../../../utils/opportunityMapper";
import "./Notifications.css";

function Notifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const unreadCount = notifications.filter((notification) => !notification.isRead).length;

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

  async function handleMarkRead(notificationId) {
    try {
      await markNotificationAsRead(notificationId);
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  }

  async function handleApply(notification) {
    if (!notification.opportunityID) {
      return;
    }

    try {
      if (!notification.isRead) {
        await markNotificationAsRead(notification.id);
      }

      const opportunitySnap = await getOpportunitySnapByReference(notification.opportunityID);

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
              <article
                className={`notification-card ${notification.isRead ? "read" : ""}`}
                key={notification.id}
              >
                <div className="notification-card-icon" aria-hidden="true">
                  !
                </div>

                <div className="notification-card-content">
                  <div className="notification-card-top">
                    <h2>Deadline reminder</h2>
                    <div className="notification-card-buttons">
                      <button
                        type="button"
                        disabled={notification.isRead}
                        onClick={() => handleMarkRead(notification.id)}
                      >
                        {notification.isRead ? "Read" : "Mark read"}
                      </button>
                      <button
                        className="delete-notification-btn"
                        type="button"
                        onClick={() => handleDelete(notification.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <p>{notification.message}</p>
                  <small>{notification.date}</small>
                  {notification.opportunityID && (
                    <div className="notification-actions">
                      <button type="button" onClick={() => handleApply(notification)}>
                        Apply
                      </button>
                    </div>
                  )}
                </div>
              </article>
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
        onClose={() => setSelectedOpportunity(null)}
      />
    </main>
  );
}

export default Notifications;
