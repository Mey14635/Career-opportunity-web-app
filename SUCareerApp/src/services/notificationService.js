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

const NOTIFICATION_CONFIG = {
  employer_access_request: {
    title: "Employer access approval",
    iconKey: "userPlus",
    actionLabel: "Activate Partner",
    targetTab: "employer-approvals",
  },
  job_review_request: {
    title: "Job posting review",
    iconKey: "briefcase",
    actionLabel: "Review",
    targetTab: "job-reviews",
  },
  student_application: {
    title: "New student application",
    iconKey: "fileCheck",
    actionLabel: "Review",
    targetTab: "ats",
  },
  application_status_update: {
    title: "Application update",
    iconKey: "fileCheck",
    actionLabel: "",
    targetTab: "notifications",
  },
  job_approved: {
    title: "Job posting approved",
    iconKey: "check",
    actionLabel: "",
    targetTab: "notifications",
  },
  deadline_48h: {
    title: "Application deadline approaching",
    iconKey: "clock",
    actionLabel: "",
    targetTab: "notifications",
  },
};

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

function formatRelativeTime(value) {
  const date = toDate(value);

  if (!date) {
    return "";
  }

  const diffMinutes = Math.max(0, Math.floor((Date.now() - date.getTime()) / 60000));

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes} ${diffMinutes === 1 ? "minute" : "minutes"} ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? "hour" : "hours"} ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} ${diffDays === 1 ? "day" : "days"} ago`;

  return formatNotificationDate(value);
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

export async function getOpportunitySnapByReference(opportunityId) {
  const opportunitySnap = await getDoc(doc(db, "opportunities", opportunityId));

  if (opportunitySnap.exists()) {
    return opportunitySnap;
  }

  const opportunityIdQuery = query(
    collection(db, "opportunities"),
    where("opportunityID", "==", opportunityId)
  );
  const opportunityIdSnap = await getDocs(opportunityIdQuery);

  return opportunityIdSnap.docs[0] || null;
}

function mapNotificationDoc(docSnap) {
  const data = docSnap.data();
  const notificationId = data.notificationId || docSnap.id;
  const config = NOTIFICATION_CONFIG[data.type] || {};

  return {
    id: docSnap.id,
    notificationId,
    title: data.title || config.title || "Notification",
    message: data.message || "You have a new notification.",
    desc: data.message || "You have a new notification.",
    isRead: data.isRead === true,
    read: data.isRead === true,
    sentAt: data.sentAt,
    date: formatNotificationDate(data.sentAt),
    time: formatRelativeTime(data.sentAt),
    readAt: data.readAt,
    opportunityId: data.opportunityId || data.targetId || getOpportunityIdFromNotificationId(notificationId, data.uid),
    opportunityID: data.opportunityId || data.targetId || getOpportunityIdFromNotificationId(notificationId, data.uid),
    deadlineAt: data.deadlineAt,
    deadlineDate: formatNotificationDate(data.deadlineAt),
    deadlineLabel: getDaysLeftLabel(data.deadlineAt),
    type: data.type,
    targetId: data.targetId || data.action?.entityId || data.metadata?.jobId || data.metadata?.employerId || data.metadata?.applicationId || "",
    targetType: data.targetType || data.action?.entityType || "",
    iconKey: config.iconKey || "bell",
    actionLabel: config.actionLabel || "",
    action: data.action || null,
    metadata: data.metadata || {},
  };
}

function getNotificationDedupeKey(notification) {
  if (notification.notificationId) {
    return notification.notificationId;
  }

  if (notification.opportunityId && notification.type) {
    return `${notification.opportunityId}_${notification.type}`;
  }

  if (notification.opportunityId && notification.title === "Application deadline approaching") {
    return `${notification.opportunityId}_deadline_48h`;
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

export async function markAllNotificationsAsRead(notifications = []) {
  await Promise.all(
    notifications
      .filter((notification) => !notification.isRead && !notification.read)
      .map((notification) => markNotificationAsRead(notification.id))
  );
}

export async function deleteNotification(notificationId) {
  await deleteDoc(doc(db, "notifications", notificationId));
}

async function getAdminUserIds() {
  const adminQuery = query(collection(db, "user"), where("role", "==", "admin"));
  const adminSnap = await getDocs(adminQuery);

  return adminSnap.docs.map((adminDoc) => adminDoc.id);
}

function buildNotificationDoc({ uid, notificationId, type, message, targetId = "", targetType = "", opportunityId = "", deadlineAt = null }) {
  const config = NOTIFICATION_CONFIG[type] || {};

  const notificationDoc = {
    uid,
    notificationId,
    type,
    title: config.title || "Notification",
    message,
    targetId,
    targetType,
    isRead: false,
    sentAt: serverTimestamp(),
    readAt: null,
  };

  if (opportunityId) {
    notificationDoc.opportunityId = opportunityId;
  }

  if (deadlineAt) {
    notificationDoc.deadlineAt = deadlineAt;
  }

  return notificationDoc;
}

async function createNotificationIfMissing(payload) {
  const notificationRef = doc(db, "notifications", payload.notificationId);
  const notificationSnap = await getDoc(notificationRef);

  if (notificationSnap.exists()) {
    return;
  }

  await setDoc(notificationRef, buildNotificationDoc(payload));
}

async function createAdminNotifications(type, buildPayload) {
  const adminIds = await getAdminUserIds();

  await Promise.all(
    adminIds.map((uid) => createNotificationIfMissing(buildPayload(uid, type)))
  );
}

export async function createAdminEmployerVerificationNotification(employerData = {}) {
  const employerId = employerData.uid || employerData.id;
  const companyName = employerData.companyName || "An employer";
  const contactPerson = employerData.contactPerson || "A company representative";

  if (!employerId) {
    return;
  }

  await createAdminNotifications("employer_access_request", (uid, type) => ({
    uid,
    type,
    notificationId: `${uid}_employer_verified_${employerId}`,
    message: `${companyName} completed email verification. ${contactPerson} requested employer access approval.`,
    targetId: employerId,
    targetType: "employer",
  }));
}

export async function createAdminJobReviewNotification(jobId, jobData = {}) {
  const companyName = jobData.companyName || "An employer";
  const jobTitle = getOpportunityTitle(jobData);

  if (!jobId) {
    return;
  }

  await createAdminNotifications("job_review_request", (uid, type) => ({
    uid,
    type,
    notificationId: `${uid}_job_review_${jobId}`,
    message: `${companyName} submitted "${jobTitle}" for review.`,
    targetId: jobId,
    targetType: "job",
  }));
}

export async function createEmployerApplicationNotification(applicationId, applicationData = {}) {
  const opportunityId = applicationData.opportunityId || applicationData.opportunityID;

  if (!applicationId || !opportunityId) {
    return;
  }

  const opportunitySnap = await getOpportunitySnapByReference(opportunityId);

  if (!opportunitySnap) {
    return;
  }

  const opportunityData = opportunitySnap.data();
  const employerId = opportunityData.employerID || opportunityData.employerId;

  if (!employerId) {
    return;
  }

  let studentData = {};

  if (applicationData.studentId) {
    const studentSnap = await getDoc(doc(db, "student_profiles", applicationData.studentId));
    studentData = studentSnap.exists() ? studentSnap.data() : {};
  }

  const studentName =
    [studentData.firstName, studentData.lastName].filter(Boolean).join(" ") ||
    applicationData.studentName ||
    applicationData.email ||
    "A student";
  const jobTitle = getOpportunityTitle(opportunityData);

  await createNotificationIfMissing({
    uid: employerId,
    type: "student_application",
    notificationId: `${employerId}_application_${applicationId}`,
    message: `${studentName} applied for "${jobTitle}".`,
    targetId: applicationId,
    targetType: "application",
    opportunityId: opportunitySnap.id,
  });
}

export async function createStudentApplicationStatusNotification(applicationId, applicationData = {}, status = "") {
  const studentId = applicationData.studentId || applicationData.uid || applicationData.userId;
  const opportunityId = applicationData.opportunityId || applicationData.opportunityID;
  const readableStatus = String(status || applicationData.status || "updated").trim();
  const statusKey = readableStatus.toLowerCase().replace(/[^a-z0-9_-]+/g, "_");

  if (!applicationId || !studentId) {
    return;
  }

  let jobTitle = applicationData.jobTitle || applicationData.title || "your application";
  let companyName = applicationData.companyName || "";

  if (opportunityId) {
    const opportunitySnap = await getOpportunitySnapByReference(opportunityId);

    if (opportunitySnap) {
      const opportunityData = opportunitySnap.data();
      jobTitle = getOpportunityTitle(opportunityData);
      companyName = opportunityData.companyName || companyName;
    }
  }

  await createNotificationIfMissing({
    uid: studentId,
    type: "application_status_update",
    notificationId: `${studentId}_application_status_${applicationId}_${statusKey}`,
    message: `${companyName ? `${companyName} updated` : "An employer updated"} your application for "${jobTitle}" to ${readableStatus}.`,
    targetId: applicationId,
    targetType: "application",
    opportunityId: opportunityId || "",
  });
}

export async function createEmployerJobApprovedNotification(jobId, jobData = {}) {
  const employerId = jobData.employerID || jobData.employerId;
  const jobTitle = getOpportunityTitle(jobData);

  if (!jobId || !employerId) {
    return;
  }

  await createNotificationIfMissing({
    uid: employerId,
    type: "job_approved",
    notificationId: `${employerId}_job_approved_${jobId}`,
    message: `"${jobTitle}" has been approved and is now visible to students.`,
    targetId: jobId,
    targetType: "job",
  });
}

function buildDeadlineNotificationId(uid, opportunityId) {
  return `${uid}_${opportunityId}_deadline_48h`;
}

async function createDeadlineNotification(uid, opportunityId, opportunityData) {
  const type = "deadline_48h";
  const notificationId = buildDeadlineNotificationId(uid, opportunityId);
  const title = getOpportunityTitle(opportunityData);
  const baseNotificationData = {
    uid,
    notificationId,
    type,
    title: "Application deadline approaching",
    message: `Your deadline for ${title} is approaching.`,
    targetId: opportunityId,
    targetType: "opportunity",
    opportunityId,
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
      const opportunityId = savedData.opportunityId || savedData.opportunityID;

      if (!opportunityId) {
        return;
      }

      const opportunitySnap = await getOpportunitySnapByReference(opportunityId);

      if (!opportunitySnap) {
        return;
      }

      const opportunityData = opportunitySnap.data();
      const daysLeft = getCalendarDaysLeft(getDeadlineValue(opportunityData));

      if (daysLeft === null || daysLeft < 0 || daysLeft > 2) {
        return;
      }

      await createDeadlineNotification(uid, opportunityId, opportunityData);
    })
  );
}

export async function checkOpportunityDeadlineForUser(uid, opportunityId) {
  const opportunitySnap = await getOpportunitySnapByReference(opportunityId);

  if (!opportunitySnap) {
    return;
  }

  const opportunityData = opportunitySnap.data();
  const daysLeft = getCalendarDaysLeft(getDeadlineValue(opportunityData));

  if (daysLeft === null || daysLeft < 0 || daysLeft > 2) {
    return;
  }

  await createDeadlineNotification(uid, opportunityId, opportunityData);
}
