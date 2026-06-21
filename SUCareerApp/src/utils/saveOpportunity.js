import { addDoc, collection, deleteDoc, getDocs, query, serverTimestamp, where } from "firebase/firestore";
import { db } from "../firebase";

async function findSavedOpportunityDocs(userId, opportunityID) {
  const existingUppercaseSaveQuery = query(
    collection(db, "saved_opportunities"),
    where("userId", "==", userId),
    where("opportunityID", "==", opportunityID)
  );
  const existingLowercaseSaveQuery = query(
    collection(db, "saved_opportunities"),
    where("userId", "==", userId),
    where("opportunityId", "==", opportunityID)
  );
  const [existingUppercaseSaveSnap, existingLowercaseSaveSnap] = await Promise.all([
    getDocs(existingUppercaseSaveQuery),
    getDocs(existingLowercaseSaveQuery),
  ]);

  return [...existingUppercaseSaveSnap.docs, ...existingLowercaseSaveSnap.docs];
}

export async function saveOpportunityForUser(userId, opportunityID) {
  const savedDocs = await findSavedOpportunityDocs(userId, opportunityID);

  if (savedDocs.length > 0) {
    return;
  }

  await addDoc(collection(db, "saved_opportunities"), {
    userId,
    opportunityID,
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
  return true;
}
