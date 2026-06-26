import { addDoc, collection, doc, getDocs, query, serverTimestamp, updateDoc, where } from "firebase/firestore";
import { db } from "../config/firebase";
import { uploadApplicationDocument } from "./cloudinaryUpload";

export async function hasStudentApplied(studentId, opportunityId) {
  const applicationQuery = query(
    collection(db, "applications"),
    where("studentId", "==", studentId),
    where("opportunityId", "==", opportunityId)
  );
  const applicationSnap = await getDocs(applicationQuery);

  return !applicationSnap.empty;
}

function getLegacyDocumentUrl(label, url) {
  if (/cv|resume/i.test(label)) {
    return { resumeUrl: url };
  }

  if (/cover/i.test(label)) {
    return { coverLetterUrl: url };
  }

  return {};
}

export async function submitApplication({ studentId, opportunityId, requiredDocuments = [], documentFiles = {} }) {
  const alreadyApplied = await hasStudentApplied(studentId, opportunityId);

  if (alreadyApplied) {
    throw new Error("You have already applied for this opportunity.");
  }

  const documents = [];
  const legacyUrls = {};

  for (const label of requiredDocuments) {
    const file = documentFiles[label];

    if (!file) {
      throw new Error(`Please upload ${label}.`);
    }

    const upload = await uploadApplicationDocument(file);
    documents.push({
      label,
      name: label,
      fileName: file.name,
      size: file.size,
      url: upload.url,
    });
    Object.assign(legacyUrls, getLegacyDocumentUrl(label, upload.url));
  }

  const applicationRef = await addDoc(collection(db, "applications"), {
    applicationId: "",
    appliedAt: serverTimestamp(),
    coverLetterUrl: legacyUrls.coverLetterUrl || "",
    documents,
    requiredDocuments,
    opportunityId,
    resumeUrl: legacyUrls.resumeUrl || "",
    status: "submitted",
    studentId,
  });

  await updateDoc(doc(db, "applications", applicationRef.id), {
    applicationId: applicationRef.id,
  });

  return {
    applicationId: applicationRef.id,
    documents,
    resumeUrl: legacyUrls.resumeUrl || "",
    coverLetterUrl: legacyUrls.coverLetterUrl || "",
  };
}
