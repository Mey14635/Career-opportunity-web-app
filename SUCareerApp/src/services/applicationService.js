import { addDoc, collection, doc, getDocs, query, serverTimestamp, updateDoc, where } from "firebase/firestore";
import { db } from "../config/firebase";
import { uploadApplicationDocument } from "./cloudinaryUpload";
import { createEmployerApplicationNotification } from "./notificationService";
import { incrementApplications } from "./metricsService";  // ← ADDED

export async function hasStudentApplied(studentId, opportunityId) {
  const applicationQuery = query(
    collection(db, "applications"),
    where("studentId", "==", studentId),
    where("opportunityId", "==", opportunityId)
  );
  const applicationSnap = await getDocs(applicationQuery);

  return !applicationSnap.empty;
}

function normalizeRequiredDocument(document) {
  if (typeof document === "string") {
    return {
      key: document.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      label: document,
      format: "any",
      inputType: "file",
    };
  }

  const label = document.label || document.name || "Document";
  const format = document.format || "any";

  return {
    key: document.key || label.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    label,
    format,
    formatLabel: document.formatLabel || "",
    inputType: document.inputType || (format === "link" ? "url" : "file"),
  };
}

function getFileExtension(fileName = "") {
  const dotIndex = fileName.lastIndexOf(".");
  return dotIndex >= 0 ? fileName.slice(dotIndex).toLowerCase() : "";
}

function validateDocumentFormat(file, document) {
  if (document.format === "pdf" && file.type !== "application/pdf" && getFileExtension(file.name) !== ".pdf") {
    return `${document.label} must be a PDF file.`;
  }

  if (
    document.format === "docx" &&
    file.type !== "application/vnd.openxmlformats-officedocument.wordprocessingml.document" &&
    getFileExtension(file.name) !== ".docx"
  ) {
    return `${document.label} must be a DOCX file.`;
  }

  return "";
}

function normalizeUrl(value = "") {
  const trimmedValue = String(value).trim();

  if (!trimmedValue) {
    return "";
  }

  try {
    const normalizedValue = /^https?:\/\//i.test(trimmedValue) ? trimmedValue : `https://${trimmedValue}`;
    return new URL(normalizedValue).toString();
  } catch {
    throw new Error("Please enter a valid URL.");
  }
}

export async function submitApplication({ studentId, opportunityId, requiredDocuments = [], documentFiles = {} }) {
  const alreadyApplied = await hasStudentApplied(studentId, opportunityId);

  if (alreadyApplied) {
    throw new Error("You have already applied for this opportunity.");
  }

  const documents = [];
  const normalizedRequiredDocuments = requiredDocuments.map(normalizeRequiredDocument);

  for (const document of normalizedRequiredDocuments) {
    const inputValue = documentFiles[document.key];

    if (!inputValue) {
      throw new Error(`Please provide ${document.label}.`);
    }

    if (document.inputType === "url" || document.format === "link") {
      const url = normalizeUrl(inputValue);

      documents.push({
        label: document.label,
        name: document.label,
        type: "url",
        url,
      });
      continue;
    }

    const file = inputValue;
    const formatError = validateDocumentFormat(file, document);

    if (formatError) {
      throw new Error(formatError);
    }

    const upload = await uploadApplicationDocument(file);
    documents.push({
      label: document.label,
      name: document.label,
      type: "file",
      format: document.format,
      fileName: file.name,
      size: file.size,
      url: upload.url,
    });
  }

  const applicationPayload = {
    applicationId: "",
    appliedAt: serverTimestamp(),
    documents,
    opportunityId,
    status: "submitted",
    studentId,
  };

  const applicationRef = await addDoc(collection(db, "applications"), applicationPayload);

  await updateDoc(doc(db, "applications", applicationRef.id), {
    applicationId: applicationRef.id,
  });

  createEmployerApplicationNotification(applicationRef.id, {
    ...applicationPayload,
    applicationId: applicationRef.id,
  }).catch((notificationError) => {
    console.error("Application notification failed:", notificationError);
  });

  // ─── INCREMENT APPLICATIONS METRIC ──────────────────────────────────
  await incrementApplications(opportunityId);

  return {
    applicationId: applicationRef.id,
    documents,
  };
}