function formatDate(value) {
  if (!value) {
    return "Not specified";
  }

  const date = typeof value.toDate === "function" ? value.toDate() : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function calculateDaysLeft(value) {
  if (!value) {
    return null;
  }

  const date = typeof value.toDate === "function" ? value.toDate() : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);

  return Math.max(0, Math.ceil((date - today) / (1000 * 60 * 60 * 24)));
}

function normalizeList(value) {
  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }

  if (typeof value === "string" && value.trim()) {
    return value
      .split(/\r?\n|,/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function normalizeDocumentFormat(format = "any") {
  const normalizedFormat = String(format || "any").trim().toLowerCase();

  if (["pdf", "docx", "link"].includes(normalizedFormat)) {
    return normalizedFormat;
  }

  return "any";
}

function getDocumentFormatLabel(format) {
  const labels = {
    any: "Any Format",
    pdf: "PDF only",
    docx: "DOCX only",
    link: "Link (URL)",
  };

  return labels[format] || labels.any;
}

function normalizeRequiredDocuments(value) {
  if (Array.isArray(value)) {
    return value
      .filter(Boolean)
      .map((item) => {
        if (typeof item === "string") {
          return normalizeRequiredDocumentText(item);
        }

        const format = normalizeDocumentFormat(item.format);
        const label = item.label || item.name || "Document";

        return {
          key: item.key || label.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          label,
          format,
          formatLabel: item.formatLabel || getDocumentFormatLabel(format),
          inputType: item.inputType || (format === "link" ? "url" : "file"),
          custom: item.custom === true,
        };
      });
  }

  return normalizeList(value).map(normalizeRequiredDocumentText);
}

function normalizeRequiredDocumentText(value) {
  const text = String(value || "").trim();
  const formatMatch = text.match(/\((PDF only|DOCX only|Link \(URL\)|Any Format)\)$/i);
  const label = formatMatch ? text.replace(formatMatch[0], "").trim() : text;
  const formatText = formatMatch?.[1]?.toLowerCase() || "any";
  const format = formatText.includes("pdf")
    ? "pdf"
    : formatText.includes("docx")
      ? "docx"
      : formatText.includes("link")
        ? "link"
        : "any";

  return {
    key: label.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    label,
    format,
    formatLabel: getDocumentFormatLabel(format),
    inputType: format === "link" ? "url" : "file",
  };
}

function normalizeKey(key) {
  return key.toLowerCase().replace(/[\s_-]/g, "");
}

function pickField(data, fieldNames) {
  const normalizedEntries = Object.entries(data).map(([key, value]) => [
    normalizeKey(key),
    value,
  ]);

  for (const fieldName of fieldNames) {
    const normalizedFieldName = normalizeKey(fieldName);
    const matchingEntry = normalizedEntries.find(([key]) => key === normalizedFieldName);

    if (matchingEntry && matchingEntry[1] !== undefined && matchingEntry[1] !== null && matchingEntry[1] !== "") {
      return matchingEntry[1];
    }
  }

  return undefined;
}

function normalizeStatus(value) {
  return String(value || "").trim().toLowerCase();
}

export function isStudentVisibleOpportunity(data = {}) {
  const status = normalizeStatus(pickField(data, ["status", "approvalStatus", "approval status"]));
  const isActive = pickField(data, ["isActive", "is active", "active"]);

  const approvedStatuses = ["approved", "open", "active", "published"];
  const isApproved = approvedStatuses.includes(status);
  const isExplicitlyActive = isActive === undefined || isActive === true;

  return isApproved && isExplicitlyActive;
}

export function mapOpportunityDoc(docSnap) {
  return mapOpportunityData(docSnap.id, docSnap.data());
}

export function mapOpportunityData(id, data = {}) {
  const deadlineValue = pickField(data, [
    "deadline",
    "applicationDeadline",
    "application deadline",
    "application_deadline",
    "closingDate",
    "closing date",
    "closing_date",
    "deadlineDate",
    "deadline date",
    "endDate",
    "end date",
  ]);
  const title = pickField(data, ["title", "jobTitle", "job title", "position"]) || "Untitled Opportunity";
  const company =
    pickField(data, ["company", "companyName", "company name", "employerName", "employer name"]) ||
    "Company not specified";
  const description =
    pickField(data, ["description", "summary", "about", "roleDescription", "role description"]) ||
    "No description provided yet.";

  return {
    id,
    title,
    company,
    employerId: pickField(data, ["employerId", "employerID", "employerId", "employer", "uid"]),
    employerId: pickField(data, ["employerId", "employerID", "employer", "uid"]),
    department: pickField(data, ["department"]) || "",
    location: pickField(data, ["location", "city", "workLocation", "work location", "workMode", "work mode"]) || "Location not specified",
    description,
    type: pickField(data, ["type", "jobType", "job type", "opportunityType", "opportunity type"]) || "Opportunity",
    industry: pickField(data, ["industry", "category"]) || "General",
    stipend: pickField(data, ["stipend", "salary", "compensation"]) || "",
    applicationEmail: pickField(data, ["applicationEmail", "application email"]) || "",
    applicationSubject: pickField(data, ["applicationSubject", "application subject"]) || "",
    deadline: formatDate(deadlineValue),
    daysLeft: calculateDaysLeft(deadlineValue),
    about: pickField(data, ["about", "roleDescription", "role description"]) || description,
    duration: pickField(data, ["duration"]) || "Duration not specified",
    positions: pickField(data, ["positions", "openPositions", "open positions"]) || "Not specified",
    jobDescriptionPdfUrl: pickField(data, ["jobDescriptionPdfUrl", "jobDescriptionPdf", "pdfUrl"]),
    pdfFileName: pickField(data, ["pdfFileName", "pdfName", "fileName"]), // ✅ Added: stores original file name
    responsibilities: normalizeList(
      pickField(data, [
        "responsibilities",
        "responsibility",
        "keyResponsibilities",
        "key responsibilities",
      ])
    ),
    requirements: normalizeList(
      pickField(data, [
        "requirements",
        "requirement",
        "requiredRequirements",
        "required requirements",
        "requiredRequirement",
        "required requirement",
        "qualifications",
        "qualification",
        "requiredSkills",
        "required skills",
        "requiredSkill",
        "required skill",
        "skills",
      ])
    ),
    documentsRequired: normalizeRequiredDocuments(
      pickField(data, [
        "requiredDocuments",
        "required documents",
        "documentsRequired",
        "documents required",
        "requiredDocument",
        "required document",
        "documents",
        "docs",
      ])
    ),
  };
}
