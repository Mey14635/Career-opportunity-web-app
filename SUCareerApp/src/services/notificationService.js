import {
  collection,
  deleteDoc,
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
import { db } from "../config/firebase";

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

function getDaysLeftLabel(value) {
  const deadline = toDate(value);

  if (!deadline) {
    return "";
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  deadline.setHours(0, 0, 0, 0);

  const daysLeft = Math.max(0, Math.ceil((deadline - today) / (1000 * 60 * 60 * 24)));

  if (daysLeft === 0) {
    return "Due today";
  }

  return `${daysLeft} ${daysLeft === 1 ? "day" : "days"} left`;
}

function getCalendarDaysLeft(value) {
  const deadline = toDate(value);

  if (!deadline) {
    return null;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  deadline.setHours(0, 0, 0, 0);

  return Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
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

function getOpportunityIdFromNotificationId(notificationId, uid) {
  const prefix = `${uid}_`;
  const suffix = "_deadline_48h";

  if (!uid || !notificationId.startsWith(prefix) || !notificationId.endsWith(suffix)) {
    return "";
  }

  return notificationId.slice(prefix.length, -suffix.length);
}

export async function getOpportunitySnapByReference(opportunityID) {
  const opportunitySnap = await getDoc(doc(db, "opportunities", opportunityID));

  if (opportunitySnap.exists()) {
    return opportunitySnap;
  }

  const opportunityIdQuery = query(
    collection(db, "opportunities"),
    where("opportunityID", "==", opportunityID)
  );
  const opportunityIdSnap = await getDocs(opportunityIdQuery);

  return opportunityIdSnap.docs[0] || null;
}

function mapNotificationDoc(docSnap) {
  const data = docSnap.data();
  const notificationId = data.notificationId || docSnap.id;

  return {
    id: docSnap.id,
    notificationId,
    title: data.title || "Deadline reminder",
    message: data.message || "You have a new notification.",
    isRead: data.isRead === true,
    sentAt: data.sentAt,
    date: formatNotificationDate(data.sentAt),
    readAt: data.readAt,
    opportunityID: getOpportunityIdFromNotificationId(notificationId, data.uid),
    deadlineAt: data.deadlineAt,
    deadlineDate: formatNotificationDate(data.deadlineAt),
    deadlineLabel: getDaysLeftLabel(data.deadlineAt),
    type: data.type,
  };
}

function getNotificationDedupeKey(notification) {
  if (notification.notificationId) {
    return notification.notificationId;
  }

  if (notification.opportunityID && notification.type) {
    return `${notification.opportunityID}_${notification.type}`;
  }

  if (notification.opportunityID && notification.title === "Application deadline approaching") {
    return `${notification.opportunityID}_deadline_48h`;
  }

  return notification.id;
}

function isNotificationStillRelevant(notification) {
  const deadline = toDate(notification.deadlineAt);

  if (!deadline) {
    return true;
  }

  return deadline > new Date();
}

function dedupeNotifications(notifications) {
  const seen = new Set();

  return notifications.filter((notification) => {
    const key = getNotificationDedupeKey(notification);

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

export function subscribeToUserNotifications(uid, onNext, onError) {
  const notificationsQuery = query(
    collection(db, "notifications"),
    where("uid", "==", uid)
  );

  return onSnapshot(
    notificationsQuery,
    (snapshot) => {
      const notifications = snapshot.docs
        .map(mapNotificationDoc)
        .filter(isNotificationStillRelevant)
        .sort((a, b) => {
          const dateA = toDate(a.sentAt)?.getTime() || 0;
          const dateB = toDate(b.sentAt)?.getTime() || 0;
          return dateB - dateA;
        });

      onNext(dedupeNotifications(notifications));
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

export async function deleteNotification(notificationId) {
  await deleteDoc(doc(db, "notifications", notificationId));
}

function buildDeadlineNotificationId(uid, opportunityID) {
  return `${uid}_${opportunityID}_deadline_48h`;
}

async function createDeadlineNotification(uid, opportunityID, opportunityData) {
  const type = "deadline_48h";
  const notificationId = buildDeadlineNotificationId(uid, opportunityID);
  const title = getOpportunityTitle(opportunityData);
  const baseNotificationData = {
    uid,
    notificationId,
    type,
    title: "Application deadline approaching",
    message: `Your deadline for ${title} is approaching.`,
    deadlineAt: getDeadlineValue(opportunityData),
  };
  const newNotificationData = {
    ...baseNotificationData,
    isRead: false,
    sentAt: serverTimestamp(),
    readAt: null,
  };
  const notificationSnap = await getDoc(doc(db, "notifications", notificationId));

  if (notificationSnap.exists()) {
    await setDoc(doc(db, "notifications", notificationId), baseNotificationData, { merge: true });
    return;
  }

  await setDoc(doc(db, "notifications", notificationId), newNotificationData);
}

export async function checkSavedOpportunityDeadlines(uid) {
  const savedQuery = query(
    collection(db, "saved_opportunities"),
    where("userId", "==", uid)
  );
  const savedSnap = await getDocs(savedQuery);

  await Promise.all(
    savedSnap.docs.map(async (savedDoc) => {
      const savedData = savedDoc.data();
      const opportunityID = savedData.opportunityID || savedData.opportunityId;

      if (!opportunityID) {
        return;
      }

      const opportunitySnap = await getOpportunitySnapByReference(opportunityID);

      if (!opportunitySnap) {
        return;
      }

      const opportunityData = opportunitySnap.data();
      const daysLeft = getCalendarDaysLeft(getDeadlineValue(opportunityData));

      if (daysLeft === null || daysLeft < 0 || daysLeft > 2) {
        return;
      }

      await createDeadlineNotification(uid, opportunityID, opportunityData);
    })
  );
}

export async function checkOpportunityDeadlineForUser(uid, opportunityID) {
  const opportunitySnap = await getOpportunitySnapByReference(opportunityID);

  if (!opportunitySnap) {
    return;
  }

  const opportunityData = opportunitySnap.data();
  const daysLeft = getCalendarDaysLeft(getDeadlineValue(opportunityData));

  if (daysLeft === null || daysLeft < 0 || daysLeft > 2) {
    return;
  }

  await createDeadlineNotification(uid, opportunityID, opportunityData);
}
