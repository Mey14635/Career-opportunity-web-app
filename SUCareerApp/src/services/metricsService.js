// src/services/metricsService.js
import { db } from '../config/firebase';
import { doc, updateDoc, increment } from 'firebase/firestore';

// Increments the view count for a specific job opportunity
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

// Increments the application count for a specific job opportunity
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