import { db } from '../config/firebase';
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  query,
  where,
  orderBy,
  Timestamp,
  setDoc,
} from 'firebase/firestore';

// ─── EMPLOYERS ────────────────────────────────────────────────────────────
export const getEmployers = async () => {
  const snap = await getDocs(collection(db, 'employer_profiles'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const updateEmployerStatus = async (employerId, status) => {
  const ref = doc(db, 'employer_profiles', employerId);
  await updateDoc(ref, { verificationStatus: status });
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
  await updateDoc(ref, { status });
};

// ─── EMPLOYER JOBS (for Employer Dashboard) ──────────────────────────────
export const getEmployerJobs = async (employerId) => {
  const q = query(collection(db, 'opportunities'), where('employerId', '==', employerId));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
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
    return ref.id;
  } catch (error) {
    console.error('createJob error:', error);
    throw error;
  }
};

export const updateJob = async (jobId, jobData) => {
  const ref = doc(db, 'opportunities', jobId);
  await updateDoc(ref, { ...jobData, updatedAt: Timestamp.now() });
};

// ─── APPLICATIONS ─────────────────────────────────────────────────────────
export const getJobApplicants = async (jobId) => {
  const q = query(collection(db, 'applications'), where('opportunityId', '==', jobId));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const updateApplicationStatus = async (applicationId, status) => {
  const ref = doc(db, 'applications', applicationId);
  await updateDoc(ref, { status });
};

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────
export const getNotificationsForUser = async (userId) => {
  const q = query(
    collection(db, 'notifications'),
    where('userId', '==', userId),
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