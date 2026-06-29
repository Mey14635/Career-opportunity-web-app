import { db } from '../config/firebase';
import {
  collection,
  deleteField,
  getDoc,
  getDocs,
  doc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,          // ✅ Uncommented – now used in getRecentOpportunities
  Timestamp,
  setDoc,
} from 'firebase/firestore';
import {
  createAdminJobReviewNotification,
  createEmployerJobApprovedNotification,
  createStudentApplicationStatusNotification,
} from './notificationService';

// ─── EMPLOYERS ────────────────────────────────────────────────────────────
export const getEmployers = async () => {
  const snap = await getDocs(collection(db, 'employer_profiles'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const updateEmployerStatus = async (employerId, status) => {
  const employerRef = doc(db, 'employer_profiles', employerId);
  const userRef = doc(db, 'user', employerId);
  await Promise.all([
    updateDoc(employerRef, { verificationStatus: status, updatedAt: Timestamp.now() }),
    setDoc(userRef, { role: 'employer', verificationStatus: status, updatedAt: Timestamp.now() }, { merge: true }),
  ]);
};

// ─── STUDENTS ─────────────────────────────────────────────────────────────
export const getStudents = async () => {
  const snap = await getDocs(collection(db, 'student_profiles'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

// ─── OPPORTUNITIES ────────────────────────────────────────────────────────
export const getOpportunities = async (statusFilter) => {
  let q = collection(db, 'opportunities');
  if (statusFilter) {
    q = query(q, where('status', '==', statusFilter));
  }
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const updateOpportunityStatus = async (opportunityId, status) => {
  const ref = doc(db, 'opportunities', opportunityId);
  const opportunitySnap = await getDoc(ref);
  const opportunityData = opportunitySnap.exists() ? opportunitySnap.data() : {};

  await updateDoc(ref, {
    status,
    updatedAt: Timestamp.now(),
  });

  if (status === 'open') {
    createEmployerJobApprovedNotification(opportunityId, opportunityData).catch((notificationError) => {
      console.error('Job approval notification failed:', notificationError);
    });
  }
};

// ─── RECENT OPPORTUNITIES (for Analytics) ──────────────────────────────
export const getRecentOpportunities = async (limitCount = 5) => {
  const q = query(
    collection(db, 'opportunities'),
    orderBy('createdAt', 'desc'),
    limit(limitCount)   // ✅ uses the imported 'limit'
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

// ─── EMPLOYER JOBS (for Employer Dashboard) ──────────────────────────────
export const getEmployerJobs = async (employerId) => {
  const employerFields = ['employerId', 'employerID'];
  const snapshots = await Promise.all(
    employerFields.map((fieldName) =>
      getDocs(query(collection(db, 'opportunities'), where(fieldName, '==', employerId)))
    )
  );
  const jobsById = new Map();

  snapshots.forEach((snap) => {
    snap.docs.forEach((d) => {
      jobsById.set(d.id, { id: d.id, ...d.data() });
    });
  });

  return [...jobsById.values()];
};

// ─── CREATE JOB ────────────────────────────────────────────────────────
export const createJob = async (jobData) => {
  try {
    const ref = doc(collection(db, 'opportunities'));
    await setDoc(ref, {
      ...jobData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    createAdminJobReviewNotification(ref.id, jobData).catch((notificationError) => {
      console.error('Job review notification failed:', notificationError);
    });
    return ref.id;
  } catch (error) {
    console.error('createJob error:', error);
    throw error;
  }
};

export const updateJob = async (jobId, jobData) => {
  const ref = doc(db, 'opportunities', jobId);
  await updateDoc(ref, { ...jobData, editRequestReason: deleteField(), updatedAt: Timestamp.now() });
};

// ─── APPLICATIONS ─────────────────────────────────────────────────────────
const formatApplicationDate = (value) => {
  if (!value) return 'Not specified';

  const date = typeof value.toDate === 'function' ? value.toDate() : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const getInitials = (name) => {
  const words = String(name || '').trim().split(/\s+/).filter(Boolean);

  if (words.length === 0) return 'NA';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();

  return `${words[0][0]}${words[1][0]}`.toUpperCase();
};

const formatApplicantStatus = (status) => {
  const normalizedStatus = String(status || 'Pending').trim().toLowerCase();

  if (normalizedStatus === 'shortlisted') return 'Shortlisted';
  if (normalizedStatus === 'rejected' || normalizedStatus === 'declined') return 'Rejected';

  return 'Pending';
};

const buildApplicationDocs = (applicationData) => {
  if (Array.isArray(applicationData.documents) && applicationData.documents.length > 0) {
    return applicationData.documents
      .filter((item) => item?.url)
      .map((item) => ({
        name: item.label || item.name || item.fileName || 'Document',
        size: item.fileName || 'Uploaded file',
        url: item.url,
      }));
  }

  const docs = [];

  if (applicationData.resumeUrl) {
    docs.push({
      name: 'Resume',
      size: 'Uploaded file',
      url: applicationData.resumeUrl,
    });
  }

  if (applicationData.coverLetterUrl) {
    docs.push({
      name: 'Cover Letter',
      size: 'Uploaded file',
      url: applicationData.coverLetterUrl,
    });
  }

  return docs;
};

const mapApplicantDoc = async (applicationDoc) => {
  const applicationData = applicationDoc.data();
  let studentData = {};

  if (applicationData.studentId) {
    const studentSnap = await getDoc(doc(db, 'student_profiles', applicationData.studentId));
    studentData = studentSnap.exists() ? studentSnap.data() : {};
  }

  const fallbackName = applicationData.studentName || applicationData.name || applicationData.email || applicationData.studentId || 'Unknown Applicant';
  const name = [studentData.firstName, studentData.lastName].filter(Boolean).join(' ') || fallbackName;

  return {
    id: applicationDoc.id,
    ...applicationData,
    applicationId: applicationData.applicationId || applicationDoc.id,
    course: studentData.course || applicationData.course || 'Course not specified',
    date: formatApplicationDate(applicationData.appliedAt || applicationData.createdAt),
    docs: buildApplicationDocs(applicationData),
    email: studentData.personalEmail || applicationData.email || '',
    initials: getInitials(name),
    jobId: applicationData.opportunityId || applicationData.opportunityID,
    name,
    status: formatApplicantStatus(applicationData.status),
  };
};

export const getJobApplicants = async (jobId) => {
  const opportunityFields = ['opportunityId', 'opportunityID'];
  const snapshots = await Promise.all(
    opportunityFields.map((fieldName) =>
      getDocs(query(collection(db, 'applications'), where(fieldName, '==', jobId)))
    )
  );
  const applicantsById = new Map();

  snapshots.forEach((snap) => {
    snap.docs.forEach((d) => {
      applicantsById.set(d.id, d);
    });
  });

  return Promise.all([...applicantsById.values()].map(mapApplicantDoc));
};

export const updateApplicationStatus = async (applicationId, status) => {
  const ref = doc(db, 'applications', applicationId);
  const applicationSnap = await getDoc(ref);
  const applicationData = applicationSnap.exists() ? applicationSnap.data() : {};

  await updateDoc(ref, { status });

  createStudentApplicationStatusNotification(applicationId, applicationData, status).catch((notificationError) => {
    console.error('Application status notification failed:', notificationError);
  });
};

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────
export const getNotificationsForUser = async (uid) => {
  const q = query(
    collection(db, 'notifications'),
    where('uid', '==', uid),
    orderBy('sentAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

// ─── AGGREGATED STATS ────────────────────────────────────────────────────
export const getDashboardStats = async () => {
  const [students, employers, opportunities] = await Promise.all([
    getStudents(),
    getEmployers(),
    getOpportunities(), // all
  ]);
  return {
    totalStudents: students.length,
    activeEmployers: employers.filter(e => e.verificationStatus === 'approved').length,
    pendingApprovals: employers.filter(e => e.verificationStatus === 'pending').length,
    totalJobs: opportunities.length,
  };
};
