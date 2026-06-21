import { useEffect } from "react";
import { useAuth } from "../../Context/authContext";
import { checkSavedOpportunityDeadlines } from "../../services/notificationService";

function DeadlineNotificationChecker() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      return;
    }

    checkSavedOpportunityDeadlines(user.uid).catch((err) => {
      console.error("Failed to check saved opportunity deadlines:", err);
    });
  }, [user]);

  return null;
}

export default DeadlineNotificationChecker;
