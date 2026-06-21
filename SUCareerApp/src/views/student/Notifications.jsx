import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import JobDetailsModal from "../../components/JobDetailsModal/JobDetailsModal";
import { useAuth } from "../../Context/authContext";
import { db } from "../../firebase";
import {
  markNotificationAsRead,
  subscribeToUserNotifications,
} from "../../services/notificationService";
import { mapOpportunityDoc } from "../../utils/opportunityMapper";
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

    if (!notification.isRead) {
      await handleMarkRead(notification.id);
    }

    try {
      const opportunitySnap = await getDoc(doc(db, "opportunities", notification.opportunityID));

      if (opportunitySnap.exists()) {
        setSelectedOpportunity(mapOpportunityDoc(opportunitySnap));
      }
    } catch (err) {
      console.error("Failed to load opportunity from notification:", err);
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
                    <h2>{notification.title}</h2>
                    <button
                      type="button"
                      disabled={notification.isRead}
                      onClick={() => handleMarkRead(notification.id)}
                    >
                      {notification.isRead ? "Read" : "Mark read"}
                    </button>
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
