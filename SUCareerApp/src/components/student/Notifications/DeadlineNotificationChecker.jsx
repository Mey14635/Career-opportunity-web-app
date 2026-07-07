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
      checkSavedOpportunityDeadlines(user.uid).catch(() => {});
    }

    runDeadlineCheck();

    const savedCollection = collection(db, "saved_opportunities");
    const unsubscribeUserSaved = onSnapshot(
      query(savedCollection, where("userId", "==", user.uid)),
      () => runDeadlineCheck(),
      () => {}
    );
    const unsubscribeStudentSaved = onSnapshot(
      query(savedCollection, where("studentId", "==", user.uid)),
      () => runDeadlineCheck(),
      () => {}
    );
    const unsubscribeOpportunities = onSnapshot(
      collection(db, "opportunities"),
      () => runDeadlineCheck(),
      () => {}
    );
    const intervalId = window.setInterval(runDeadlineCheck, 60 * 1000);

    return () => {
      unsubscribeUserSaved();
      unsubscribeStudentSaved();
      unsubscribeOpportunities();
      window.clearInterval(intervalId);
    };
  }, [user]);

  return null;
}

export default DeadlineNotificationChecker;
