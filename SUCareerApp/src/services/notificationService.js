import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../firebase";

function toDate(value) {
  if (!value) {
    return null;
  }

  const date = typeof value.toDate === "function" ? value.toDate() : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatNotificationDate(value) {
  const date = toDate(value);

  if (!date) {
    return "";
  }

  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getDeadlineValue(opportunityData = {}) {
  return (
    opportunityData.deadline ||
    opportunityData.Deadline ||
    opportunityData.applicationDeadline ||
    opportunityData.application_deadline ||
    opportunityData.closingDate ||
    opportunityData.deadlineDate
  );
}

function getOpportunityTitle(opportunityData = {}) {
  return opportunityData.title || opportunityData.jobTitle || opportunityData.position || "This opportunity";
}

function mapNotificationDoc(docSnap) {
  const data = docSnap.data();

  return {
    id: docSnap.id,
    notificationId: data.notificationId || docSnap.id,
    title: data.title || "Deadline reminder",
    message: data.message || "You have a new notification.",
    isRead: data.isRead === true,
    sentAt: data.sentAt,
    date: formatNotificationDate(data.sentAt),
    readAt: data.readAt,
    opportunityID: data.opportunityID,
    type: data.type,
  };
}

export function subscribeToUserNotifications(userId, onNext, onError) {
  const notificationsQuery = query(
    collection(db, "notifications"),
    where("userId", "==", userId)
  );

  return onSnapshot(
    notificationsQuery,
    (snapshot) => {
      const notifications = snapshot.docs
        .map(mapNotificationDoc)
        .sort((a, b) => {
          const dateA = toDate(a.sentAt)?.getTime() || 0;
          const dateB = toDate(b.sentAt)?.getTime() || 0;
          return dateB - dateA;
        });

      onNext(notifications);
    },
    onError
  );
}

export async function markNotificationAsRead(notificationId) {
  await updateDoc(doc(db, "notifications", notificationId), {
    isRead: true,
    readAt: serverTimestamp(),
  });
}

async function notificationAlreadyExists(userId, opportunityID, type) {
  const notificationsQuery = query(
    collection(db, "notifications"),
    where("userId", "==", userId)
  );
  const notificationsSnap = await getDocs(notificationsQuery);

  return notificationsSnap.docs.some((notificationDoc) => {
    const data = notificationDoc.data();
    return data.opportunityID === opportunityID && data.type === type;
  });
}

function buildDeadlineNotificationId(userId, opportunityID) {
  return `${userId}_${opportunityID}_deadline_48h`;
}

async function createDeadlineNotification(userId, opportunityID, opportunityData) {
  const type = "deadline_48h";
  const notificationId = buildDeadlineNotificationId(userId, opportunityID);
  const notificationSnap = await getDoc(doc(db, "notifications", notificationId));

  if (notificationSnap.exists()) {
    return;
  }

  const exists = await notificationAlreadyExists(userId, opportunityID, type);

  if (exists) {
    return;
  }

  const title = getOpportunityTitle(opportunityData);
  await setDoc(doc(db, "notifications", notificationId), {
    userId,
    opportunityID,
    notificationId,
    type,
    title: "Application deadline approaching",
    message: `Your deadline for ${title} is within 48 hours.`,
    isRead: false,
    sentAt: serverTimestamp(),
    readAt: null,
  });
}

export async function checkSavedOpportunityDeadlines(userId) {
  const savedQuery = query(
    collection(db, "saved_opportunities"),
    where("userId", "==", userId)
  );
  const savedSnap = await getDocs(savedQuery);
  const now = new Date();
  const fortyEightHoursFromNow = new Date(now.getTime() + 48 * 60 * 60 * 1000);

  await Promise.all(
    savedSnap.docs.map(async (savedDoc) => {
      const savedData = savedDoc.data();
      const opportunityID = savedData.opportunityID || savedData.opportunityId;

      if (!opportunityID) {
        return;
      }

      const opportunitySnap = await getDoc(doc(db, "opportunities", opportunityID));

      if (!opportunitySnap.exists()) {
        return;
      }

      const opportunityData = opportunitySnap.data();
      const deadline = toDate(getDeadlineValue(opportunityData));

      if (!deadline || deadline <= now || deadline > fortyEightHoursFromNow) {
        return;
      }

      await createDeadlineNotification(userId, opportunityID, opportunityData);
    })
  );
}
