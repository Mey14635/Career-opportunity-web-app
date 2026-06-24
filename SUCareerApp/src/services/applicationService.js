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

export async function submitApplication({ studentId, opportunityId, resumeFile, coverLetterFile }) {
  const alreadyApplied = await hasStudentApplied(studentId, opportunityId);

  if (alreadyApplied) {
    throw new Error("You have already applied for this opportunity.");
  }

  const resumeUpload = await uploadApplicationDocument(resumeFile);
  const coverLetterUpload = coverLetterFile ? await uploadApplicationDocument(coverLetterFile) : null;
  const applicationRef = await addDoc(collection(db, "applications"), {
    applicationId: "",
    appliedAt: serverTimestamp(),
    coverLetterUrl: coverLetterUpload?.url || "",
    opportunityId,
    resumeUrl: resumeUpload.url,
    status: "submitted",
    studentId,
  });

  await updateDoc(doc(db, "applications", applicationRef.id), {
    applicationId: applicationRef.id,
  });

  return {
    applicationId: applicationRef.id,
    resumeUrl: resumeUpload.url,
    coverLetterUrl: coverLetterUpload?.url || "",
  };
}
