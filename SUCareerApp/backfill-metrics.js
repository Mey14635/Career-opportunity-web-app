// backfill-metrics.js
// Run with: node backfill-metrics.js

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { firebaseConfig } from './src/config/firebase.js';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function backfillMetrics() {
  console.log('🔄 Starting backfill...');

  // 1. Get all opportunities
  const oppsSnapshot = await getDocs(collection(db, 'opportunities'));
  const opportunities = oppsSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));

  console.log(`📊 Found ${opportunities.length} opportunities`);

  for (const opp of opportunities) {
    // Count applications for this job
    const appsSnapshot = await getDocs(collection(db, 'applications'));
    const appCount = appsSnapshot.docs.filter(d => {
      const data = d.data();
      return data.opportunityId === opp.id || data.opportunityID === opp.id;
    }).length;

    // Update metrics – preserve existing views if any, set applications count
    const oppRef = doc(db, 'opportunities', opp.id);
    await updateDoc(oppRef, {
      'metrics.views': opp.metrics?.views || 0,
      'metrics.applications': appCount,
    });

    console.log(`✅ Updated "${opp.title}" – Applications: ${appCount}, Views: ${opp.metrics?.views || 0}`);
  }

  console.log('🎉 Backfill complete!');
}

backfillMetrics().catch(console.error);