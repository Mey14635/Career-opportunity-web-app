// src/services/metricsService.js
import { db } from '../config/firebase';
import { doc, updateDoc, increment } from 'firebase/firestore';

// ─── INCREMENT VIEWS ──────────────────────────────────────────────────────
export const incrementViews = async (opportunityId) => {
  if (!opportunityId) return;
  try {
    const jobRef = doc(db, 'opportunities', opportunityId);
    await updateDoc(jobRef, {
      'metrics.views': increment(1)
    });
  } catch (error) {
    console.error('Error incrementing views:', error);
  }
};

// ─── INCREMENT APPLICATIONS ──────────────────────────────────────────────
export const incrementApplications = async (opportunityId) => {
  if (!opportunityId) return;
  try {
    const jobRef = doc(db, 'opportunities', opportunityId);
    await updateDoc(jobRef, {
      'metrics.applications': increment(1)
    });
  } catch (error) {
    console.error('Error incrementing applications:', error);
  }
};