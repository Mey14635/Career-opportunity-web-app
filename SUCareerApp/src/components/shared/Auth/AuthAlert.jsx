const AuthAlert = ({ message, type = "info" }) => {
  if (!message) {
    return null;
  }

  return <div className={`auth-alert alert-${type}`}>{message}</div>;
};

export default AuthAlert;
