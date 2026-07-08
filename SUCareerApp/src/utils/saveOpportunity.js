import { collection, deleteDoc, doc, getDocs, query, serverTimestamp, setDoc, where } from "firebase/firestore";
import { db } from "../config/firebase";
import {
  checkOpportunityDeadlineForUser,
  checkSavedOpportunityDeadlines,
} from "../services/notificationService";

async function findSavedOpportunityDocs(userId, opportunityId) {
  const savedCollection = collection(db, "saved_opportunities");
  const userFields = ["userId", "studentId"];
  const opportunityFields = ["opportunityID", "opportunityId"];
  const savedQueries = userFields.flatMap((userField) =>
    opportunityFields.map((opportunityField) =>
      query(
        savedCollection,
        where(userField, "==", userId),
        where(opportunityField, "==", opportunityId)
      )
    )
  );
  const savedSnaps = await Promise.all(savedQueries.map((savedQuery) => getDocs(savedQuery)));
  const savedDocsById = new Map();

  savedSnaps.forEach((savedSnap) => {
    savedSnap.docs.forEach((savedDoc) => {
      savedDocsById.set(savedDoc.id, savedDoc);
    });
  });

  return [...savedDocsById.values()];
}

export async function saveOpportunityForUser(userId, opportunityId) {
  const savedDocs = await findSavedOpportunityDocs(userId, opportunityId);

  if (savedDocs.length > 0) {
    return;
  }

  const savedRef = doc(collection(db, "saved_opportunities"));

  await setDoc(savedRef, {
    bookmarkId: savedRef.id,
    studentId: userId,
    opportunityId,
    savedAt: serverTimestamp(),
  });
}

export async function unsaveOpportunityForUser(userId, opportunityId) {
  const savedDocs = await findSavedOpportunityDocs(userId, opportunityId);

  await Promise.all(savedDocs.map((savedDoc) => deleteDoc(savedDoc.ref)));
}

export async function toggleSavedOpportunityForUser(userId, opportunityId, currentlySaved) {
  if (currentlySaved) {
    await unsaveOpportunityForUser(userId, opportunityId);
    return false;
  }

  await saveOpportunityForUser(userId, opportunityId);
  await checkOpportunityDeadlineForUser(userId, opportunityId);
  await checkSavedOpportunityDeadlines(userId);
  return true;
}
