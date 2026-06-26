import { collection, deleteDoc, doc, getDocs, query, serverTimestamp, setDoc, where } from "firebase/firestore";
import { db } from "../config/firebase";
import {
  checkOpportunityDeadlineForUser,
  checkSavedOpportunityDeadlines,
} from "../services/notificationService";

async function findSavedOpportunityDocs(userId, opportunityID) {
  const savedCollection = collection(db, "saved_opportunities");
  const userFields = ["userId", "studentId"];
  const opportunityFields = ["opportunityID", "opportunityId"];
  const savedQueries = userFields.flatMap((userField) =>
    opportunityFields.map((opportunityField) =>
      query(
        savedCollection,
        where(userField, "==", userId),
        where(opportunityField, "==", opportunityID)
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

export async function saveOpportunityForUser(userId, opportunityID) {
  const savedDocs = await findSavedOpportunityDocs(userId, opportunityID);

  if (savedDocs.length > 0) {
    return;
  }

  const savedRef = doc(collection(db, "saved_opportunities"));

  await setDoc(savedRef, {
    bookmarkId: savedRef.id,
    studentId: userId,
    opportunityId: opportunityID,
    savedAt: serverTimestamp(),
  });
}

export async function unsaveOpportunityForUser(userId, opportunityID) {
  const savedDocs = await findSavedOpportunityDocs(userId, opportunityID);

  await Promise.all(savedDocs.map((savedDoc) => deleteDoc(savedDoc.ref)));
}

export async function toggleSavedOpportunityForUser(userId, opportunityID, currentlySaved) {
  if (currentlySaved) {
    await unsaveOpportunityForUser(userId, opportunityID);
    return false;
  }

  await saveOpportunityForUser(userId, opportunityID);
  await checkOpportunityDeadlineForUser(userId, opportunityID);
  await checkSavedOpportunityDeadlines(userId);
  return true;
}
