import { Link } from "react-router-dom";

const AuthTabs = ({ activeTab }) => {
  return (
    <div className="auth-tabs" aria-label="Authentication options">
      <Link to="/login" className={activeTab === "login" ? "active" : undefined}>Sign In</Link>
      <Link to="/signup" className={activeTab === "signup" ? "active" : undefined}>Register</Link>
    </div>
  );
};

export default AuthTabs;
