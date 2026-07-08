// src/services/cloudinaryUpload.js

const allowedDocumentTypes = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const allowedExtensions = [".pdf", ".doc", ".docx"];
const maxFileSize = 10 * 1024 * 1024;

function getExtension(fileName) {
  const dotIndex = fileName.lastIndexOf(".");
  return dotIndex >= 0 ? fileName.slice(dotIndex).toLowerCase() : "";
}

export function validateApplicationDocument(file) {
  if (!file) {
    return "Please choose a file.";
  }

  const extension = getExtension(file.name);

  if (!allowedDocumentTypes.includes(file.type) && !allowedExtensions.includes(extension)) {
    return "Only PDF, DOC, and DOCX files are allowed.";
  }

  if (file.size > maxFileSize) {
    return "File must be 10MB or smaller.";
  }

  return "";
}

export async function uploadApplicationDocument(file) {
  const validationError = validateApplicationDocument(file);

  if (validationError) {
    throw new Error(validationError);
  }

  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error("Cloudinary is not configured.");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`, {
    method: "POST",
    body: formData,
  });
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error?.message || "Upload failed.");
  }

  return {
    url: result.secure_url,
    publicId: result.public_id,
    originalFileName: file.name,
    resourceType: result.resource_type || "raw",
  };
}

export async function uploadLogo(file) {
  const allowedImageTypes = ["image/jpeg", "image/png", "image/svg+xml", "image/webp"];

  if (!allowedImageTypes.includes(file.type)) {
    throw new Error("Only JPEG, PNG, SVG, and WebP images are allowed.");
  }

  if (file.size > 2 * 1024 * 1024) {
    throw new Error("Logo must be 2MB or smaller.");
  }

  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_LOGO_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error("Cloudinary is not configured.");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: formData,
  });
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error?.message || "Upload failed.");
  }

  return {
    url: result.secure_url,
    publicId: result.public_id,
    originalFileName: file.name,
    resourceType: result.resource_type || "image",
  };
}