import { useEffect } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useAuth } from "../../../contexts/AuthContext";
import { db } from "../../../config/firebase";
import { checkSavedOpportunityDeadlines } from "../../../services/notificationService";

function DeadlineNotificationChecker() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      return;
    }

    function runDeadlineCheck() {
      checkSavedOpportunityDeadlines(user.uid).catch((err) => {
        console.error("Failed to check saved opportunity deadlines:", err);
      });
    }

    runDeadlineCheck();

    const savedQuery = query(
      collection(db, "saved_opportunities"),
      where("userId", "==", user.uid)
    );
    const unsubscribeSaved = onSnapshot(
      savedQuery,
      () => runDeadlineCheck(),
      (err) => {
        console.error("Failed to watch saved opportunities:", err);
      }
    );
    const intervalId = window.setInterval(runDeadlineCheck, 60 * 1000);

    return () => {
      unsubscribeSaved();
      window.clearInterval(intervalId);
    };
  }, [user]);

  return null;
}

export default DeadlineNotificationChecker;
