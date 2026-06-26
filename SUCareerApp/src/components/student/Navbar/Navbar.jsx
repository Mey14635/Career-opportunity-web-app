import { useEffect, useState } from "react";
import { NavLink, useNavigate, useSearchParams } from "react-router-dom";
import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { ChevronDown, LogOut, UserCircle } from "lucide-react";
import { auth, db } from "../../../config/firebase";
import { useAuth } from "../../../contexts/AuthContext";
import { subscribeToUserNotifications } from "../../../services/notificationService";
import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [avatarInitial, setAvatarInitial] = useState("U");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const searchText = searchParams.get("search") || "";
  const newNotificationsCount = notifications.filter((item) => !item.isRead).length;
  const previewNotifications = notifications.slice(0, 2);

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
        <div className="navbar-logo su-logo-mark" aria-hidden="true">
          <span />
        </div>
        <span className="navbar-brand">SU Career Portal</span>
      </div>

      {/*  Tab links */}
      <div className="navbar-tabs">
        <NavLink
          to="/student-dashboard/dashboard"
          className={({ isActive }) => isActive ? "nav-tab active-tab" : "nav-tab"}
        >
          Dashboard
        </NavLink>
        <NavLink
          to="/student-dashboard/favorites"
          className={({ isActive }) => isActive ? "nav-tab active-tab" : "nav-tab"}
        >
          Favorites
        </NavLink>
        <NavLink
          to="/student-dashboard/applications"
          className={({ isActive }) => isActive ? "nav-tab active-tab" : "nav-tab"}
        >
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
            <span aria-hidden="true">🔔</span>
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
                      <div className="notification-icon" aria-hidden="true">
                        !
                      </div>
                      <div>
                        <h3>{notification.title}</h3>
                        <p>{notification.message}</p>
                        {notification.date && <small>{notification.date}</small>}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="notification-preview">
                    <div className="notification-icon" aria-hidden="true">
                      i
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
