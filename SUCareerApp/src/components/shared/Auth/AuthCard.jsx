import "./Auth.css";

const AuthCard = ({ children, title = "SU Career Portal", subtitle = "Your gateway to professional opportunities" }) => {
  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo-placeholder su-logo-mark" aria-hidden="true">
            <span />
          </div>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>

        {children}
      </div>
    </div>
  );
};

export default AuthCard;
