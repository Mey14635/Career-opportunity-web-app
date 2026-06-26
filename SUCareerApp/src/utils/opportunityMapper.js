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

  // Students should only see jobs that admin has approved/published.
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
    location: pickField(data, ["location", "city", "workLocation", "work location", "workMode", "work mode"]) || "Location not specified",
    description,
    type: pickField(data, ["type", "jobType", "job type", "opportunityType", "opportunity type"]) || "Opportunity",
    industry: pickField(data, ["industry", "category"]) || "General",
    deadline: formatDate(deadlineValue),
    daysLeft: calculateDaysLeft(deadlineValue),
    about: pickField(data, ["about", "roleDescription", "role description"]) || description,
    startDate: formatDate(pickField(data, ["startDate", "start date"])),
    duration: pickField(data, ["duration"]) || "Duration not specified",
    positions: pickField(data, ["positions", "openPositions", "open positions"]) || "Not specified",
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
    documentsRequired: normalizeList(
      pickField(data, [
        "documentsRequired",
        "documents required",
        "requiredDocuments",
        "required documents",
        "requiredDocument",
        "required document",
        "documents",
        "docs",
      ])
    ),
  };
}
