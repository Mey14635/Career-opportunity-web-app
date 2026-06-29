import { useEffect, useState } from "react";
import { NavLink, useNavigate, useSearchParams } from "react-router-dom";
import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import {
  Bell,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronDown,
  Clock3,
  FileText,
  Heart,
  LayoutDashboard,
  LogOut,
  UserCircle,
} from "lucide-react";
import { auth, db } from "../../../config/firebase";
import { useAuth } from "../../../contexts/AuthContext";
import { subscribeToUserNotifications } from "../../../services/notificationService";
import "./Navbar.css";

function getNotificationTone(notification) {
  if (notification.type === "application_status_update") return "status";
  if (notification.type === "deadline_48h") return "deadline";
  return "default";
}

function renderNotificationIcon(notification) {
  if (notification.type === "application_status_update") {
    return <CheckCircle2 size={16} strokeWidth={2.4} />;
  }

  if (notification.type === "deadline_48h") {
    return <Clock3 size={16} strokeWidth={2.4} />;
  }

  if (notification.type === "saved_opportunity") {
    return <BriefcaseBusiness size={16} strokeWidth={2.4} />;
  }

  return <Bell size={16} strokeWidth={2.4} />;
}

function Navbar() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [avatarInitial, setAvatarInitial] = useState("U");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const searchText = searchParams.get("search") || "";
  const newNotificationsCount = notifications.filter((item) => !item.isRead && !item.read).length;
  const previewNotifications = notifications.slice(0, 3);

  useEffect(() => {
    async function loadAvatarInitial() {
      if (!user) {
        setAvatarInitial("U");
        return;
      }

      const fallbackName = user.displayName || user.email || "U";

      try {
        const profileSnap = await getDoc(doc(db, "student_profiles", user.uid));
        const profileData = profileSnap.exists() ? profileSnap.data() : {};
        const firstName = profileData.firstName || fallbackName;

        setAvatarInitial(firstName.trim().charAt(0).toUpperCase());
      } catch (err) {
        console.error("Failed to load avatar initial:", err);
        setAvatarInitial(fallbackName.trim().charAt(0).toUpperCase());
      }
    }

    loadAvatarInitial();
  }, [user]);

  useEffect(() => {
    if (!user) {
      return;
    }

    return subscribeToUserNotifications(
      user.uid,
      setNotifications,
      (err) => {
        console.error("Failed to load notifications:", err);
      }
    );
  }, [user]);

  function handleSearchChange(e) {
    const nextSearch = e.target.value;
    const nextParams = new URLSearchParams(searchParams);

    if (nextSearch.trim()) {
      nextParams.set("search", nextSearch);
    } else {
      nextParams.delete("search");
    }

    setSearchParams(nextParams);
  }

  async function handleLogout() {
    try {
      await signOut(auth);
      navigate("/student-dashboard/login", { replace: true });
    } catch (err) {
      console.error("Logout failed:", err);
    }
  }

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <div className="navbar-logo" aria-hidden="true">
          SU
        </div>
        <div className="navbar-brand-group">
          <span className="navbar-brand">SU Career Portal</span>
          <span className="navbar-subbrand">Student Portal</span>
        </div>
      </div>

      {/*  Tab links */}
      <div className="navbar-tabs">
        <NavLink
          to="/student-dashboard/dashboard"
          className={({ isActive }) => isActive ? "nav-tab active-tab" : "nav-tab"}
        >
          <LayoutDashboard size={16} aria-hidden="true" />
          Dashboard
        </NavLink>
        <NavLink
          to="/student-dashboard/favorites"
          className={({ isActive }) => isActive ? "nav-tab active-tab" : "nav-tab"}
        >
          <Heart size={16} aria-hidden="true" />
          Favorites
        </NavLink>
        <NavLink
          to="/student-dashboard/applications"
          className={({ isActive }) => isActive ? "nav-tab active-tab" : "nav-tab"}
        >
          <FileText size={16} aria-hidden="true" />
          My Applications
        </NavLink>
      </div>

      <div className="navbar-search">
        <input
          type="text"
          placeholder="Search opportunities..."
          value={searchText}
          onChange={handleSearchChange}
          className="navbar-search-input"
        />
      </div>
      <div className="navbar-right">
        <div className="notification-menu">
          <button
            className="bell-btn"
            aria-label="Notifications"
            aria-expanded={showNotifications}
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell size={18} aria-hidden="true" />
            {newNotificationsCount > 0 && (
              <span className="notification-count-badge">
                {newNotificationsCount > 99 ? "99+" : newNotificationsCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="notification-popover">
              <div className="notification-popover-header">
                <h2>Notifications</h2>
                <span>{newNotificationsCount} new</span>
              </div>

              <div className="notification-popover-list">
                {previewNotifications.length > 0 ? (
                  previewNotifications.map((notification) => (
                    <div className="notification-preview" key={notification.id}>
                      <div className={`notification-icon ${getNotificationTone(notification)}`} aria-hidden="true">
                        {renderNotificationIcon(notification)}
                      </div>
                      <div>
                        <h3>{notification.title}</h3>
                        <p>{notification.message}</p>
                        {notification.time || notification.date ? <small>{notification.time || notification.date}</small> : null}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="notification-preview">
                    <div className="notification-icon" aria-hidden="true">
                      <Bell size={16} strokeWidth={2.4} />
                    </div>
                    <div>
                      <h3>No notifications yet</h3>
                      <p>New updates will appear here when they are available.</p>
                    </div>
                  </div>
                )}
              </div>

              <button
                className="view-notifications-btn"
                type="button"
                onClick={() => {
                  setShowNotifications(false);
                  navigate("/student-dashboard/notifications");
                }}
              >
                View all notifications
              </button>
            </div>
          )}
        </div>
        <div className="user-menu">
          <button
            className="avatar-btn"
            type="button"
            aria-label="Open user menu"
            aria-expanded={showUserMenu}
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <span className="avatar">{avatarInitial}</span>
            <ChevronDown size={14} aria-hidden="true" />
          </button>

          {showUserMenu && (
            <div className="user-menu-popover">
              <button
                className="user-menu-item"
                type="button"
                onClick={() => {
                  setShowUserMenu(false);
                  navigate("/student-dashboard/profile");
                }}
              >
                <span className="user-menu-icon" aria-hidden="true"><UserCircle size={15} /></span>
                Profile
              </button>
              <button className="user-menu-item danger" type="button" onClick={handleLogout}>
                <span className="user-menu-icon" aria-hidden="true"><LogOut size={15} /></span>
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
