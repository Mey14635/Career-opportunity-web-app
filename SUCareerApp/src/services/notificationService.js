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

function normalizeKey(key) {
  return String(key).toLowerCase().replace(/[\s_-]/g, "");
}

function normalizeText(value) {
  return String(value || "").replace(/^["']|["']$/g, "").trim();
}

function pickField(data, fieldNames) {
  const normalizedEntries = Object.entries(data || {}).map(([key, value]) => [
    normalizeKey(key),
    value,
  ]);

  for (const fieldName of fieldNames) {
    const normalizedFieldName = normalizeKey(fieldName);
    const matchingEntry = normalizedEntries.find(([key]) => key === normalizedFieldName);

    if (matchingEntry && matchingEntry[1] !== undefined && matchingEntry[1] !== null && matchingEntry[1] !== "") {
      return matchingEntry[1];
    }
  }

  return undefined;
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

function isDeadlineWithin48Hours(value) {
  const deadline = toDate(value);

  if (!deadline) {
    return false;
  }

  const now = new Date();
  const fortyEightHours = 48 * 60 * 60 * 1000;
  const deadlineTime = deadline.getTime();
  const timeUntilDeadline = deadlineTime - now.getTime();

  if (timeUntilDeadline >= 0 && timeUntilDeadline <= fortyEightHours) {
    return true;
  }

  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const endOfTomorrow = new Date(startOfToday);
  endOfTomorrow.setDate(endOfTomorrow.getDate() + 2);
  endOfTomorrow.setMilliseconds(endOfTomorrow.getMilliseconds() - 1);

  return deadlineTime >= startOfToday.getTime() && deadlineTime <= endOfTomorrow.getTime();
}

function getDeadlineValue(opportunityData = {}) {
  return pickField(opportunityData, [
    "deadline",
    "applicationDeadline",
    "application deadline",
    "application_deadline",
    "closingDate",
    "closing date",
    "closing_date",
    "deadlineDate",
    "deadline date",
    "endDate",
    "end date",
  ]);
}

function getOpportunityTitle(opportunityData = {}) {
  return (
    pickField(opportunityData, ["title", "jobTitle", "job title", "position"]) ||
    "This opportunity"
  );
}

function getSavedOpportunityReference(savedData = {}) {
  const referenceValue = pickField(savedData, [
    "opportunityID",
    "opportunityId",
    "opportunity id",
    "opportunity_id",
    "opportunityRef",
    "opportunity reference",
    "jobId",
    "job id",
  ]);

  if (!referenceValue) {
    return "";
  }

  if (typeof referenceValue === "object" && referenceValue.id) {
    return referenceValue.id;
  }

  return normalizeText(referenceValue);
}

export async function getOpportunitySnapByReference(opportunityID) {
  const normalizedOpportunityID = normalizeText(opportunityID);

  if (!normalizedOpportunityID) {
    return null;
  }

  const opportunitySnap = await getDoc(doc(db, "opportunities", normalizedOpportunityID));

  if (opportunitySnap.exists()) {
    return opportunitySnap;
  }

  const referenceFields = ["opportunityID", "opportunityId"];

  for (const fieldName of referenceFields) {
    const opportunityIdQuery = query(
      collection(db, "opportunities"),
      where(fieldName, "==", normalizedOpportunityID)
    );
    const opportunityIdSnap = await getDocs(opportunityIdQuery);

    if (!opportunityIdSnap.empty) {
      return opportunityIdSnap.docs[0];
    }
  }

  return null;
}

function mapNotificationDoc(docSnap) {
  const data = docSnap.data();
  const notificationId = data.notificationId || docSnap.id;
  const userId = data.userId || "";
  const opportunityID =
    userId && notificationId.startsWith(`${userId}_`) && notificationId.endsWith("_deadline_48h")
      ? notificationId.slice(userId.length + 1, -"_deadline_48h".length)
      : "";

  return {
    id: docSnap.id,
    notificationId,
    userId,
    opportunityID,
    message: data.message || "You have a new notification.",
    isRead: data.isRead === true,
    sentAt: data.sentAt,
    date: formatNotificationDate(data.sentAt),
    readAt: data.readAt,
  };
}

function getNotificationDedupeKey(notification) {
  return normalizeText(notification.message).toLowerCase() || notification.notificationId || notification.id;
}

function isNotificationStillRelevant(notification) {
  return Boolean(notification.message);
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

async function createDeadlineNotification(userId, opportunityID, opportunityData) {
  const normalizedOpportunityID = normalizeText(opportunityID);
  const title = getOpportunityTitle(opportunityData);
  const message = `Your deadline for ${title} is 48hrs away!`;
  const existingNotificationsQuery = query(
    collection(db, "notifications"),
    where("userId", "==", userId)
  );
  const existingNotificationsSnap = await getDocs(existingNotificationsQuery);
  const alreadyExists = existingNotificationsSnap.docs.some((notificationDoc) => {
    const notificationData = notificationDoc.data();

    return normalizeText(notificationData.message) === message;
  });

  if (alreadyExists) {
    return;
  }

  const notificationRef = doc(
    db,
    "notifications",
    `${userId}_${normalizedOpportunityID}_deadline_48h`
  );
  const notificationSnap = await getDoc(notificationRef);

  if (notificationSnap.exists()) {
    return;
  }

  await setDoc(notificationRef, {
    notificationId: notificationRef.id,
    userId,
    message,
    isRead: false,
    sentAt: serverTimestamp(),
    readAt: null,
  });
}

export async function checkSavedOpportunityDeadlines(userId) {
  const savedCollection = collection(db, "saved_opportunities");
  const [userSavedSnap, studentSavedSnap] = await Promise.all([
    getDocs(query(savedCollection, where("userId", "==", userId))),
    getDocs(query(savedCollection, where("studentId", "==", userId))),
  ]);
  const savedDocsById = new Map();

  [...userSavedSnap.docs, ...studentSavedSnap.docs].forEach((savedDoc) => {
    savedDocsById.set(savedDoc.id, savedDoc);
  });

  await Promise.all(
    [...savedDocsById.values()].map(async (savedDoc) => {
      const savedData = savedDoc.data();
      const opportunityID = getSavedOpportunityReference(savedData);

      if (!opportunityID) {
        return;
      }

      const opportunitySnap = await getOpportunitySnapByReference(opportunityID);

      if (!opportunitySnap) {
        return;
      }

      const opportunityData = opportunitySnap.data();

      if (!isDeadlineWithin48Hours(getDeadlineValue(opportunityData))) {
        return;
      }

      await createDeadlineNotification(userId, opportunityID, opportunityData);
    })
  );
}

export async function checkOpportunityDeadlineForUser(userId, opportunityID) {
  const opportunitySnap = await getOpportunitySnapByReference(opportunityID);

  if (!opportunitySnap) {
    return;
  }

  const opportunityData = opportunitySnap.data();

  if (!isDeadlineWithin48Hours(getDeadlineValue(opportunityData))) {
    return;
  }

  await createDeadlineNotification(userId, opportunityID, opportunityData);
}
