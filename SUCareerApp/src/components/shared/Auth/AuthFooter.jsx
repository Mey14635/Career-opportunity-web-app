import { Link } from "react-router-dom";

const AuthFooter = ({ text, linkText, to }) => {
  return (
    <div className="auth-footer">
      <p>
        {text ? `${text} ` : ""}
        <Link to={to}>{linkText}</Link>
      </p>
    </div>
  );
};

export default AuthFooter;
