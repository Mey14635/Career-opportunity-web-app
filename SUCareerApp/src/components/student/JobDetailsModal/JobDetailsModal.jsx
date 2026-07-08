import { useState, useEffect } from "react";
import { File, Download } from "lucide-react";
import { useAuth } from "../../../contexts/AuthContext";
import { submitApplication } from "../../../services/applicationService";
import { toggleSavedOpportunityForUser } from "../../../utils/saveOpportunity";
import { incrementViews } from "../../../services/metricsService";
import DOMPurify from "dompurify";
import "./JobDetailsModal.css";

const defaultDocument = {
  key: "cv-resume",
  label: "CV / Resume",
  format: "any",
  formatLabel: "Any Format",
  inputType: "file",
};

function normalizeApplicationDocument(document) {
  if (typeof document === "string") {
    return {
      key: document.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      label: document,
      format: "any",
      formatLabel: "Any Format",
      inputType: "file",
    };
  }

  const label = document.label || document.name || "Document";
  const format = document.format || "any";

  return {
    key: document.key || label.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    label,
    format,
    formatLabel: document.formatLabel || "Any Format",
    inputType: document.inputType || (format === "link" ? "url" : "file"),
  };
}

function getAcceptValue(format) {
  if (format === "pdf") {
    return ".pdf,application/pdf";
  }

  if (format === "docx") {
    return ".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  }

  return ".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";
}

// ─── SINGLE, ROBUST CONTENT RENDERER ────────────────────────────────────

/**
 * Renders content safely – handles HTML (rich text) and plain text.
 * - If content is HTML: sanitizes and renders with dangerouslySetInnerHTML.
 * - If content is plain text: splits by '.' and renders as a bullet list.
 * - If content is a single sentence with no period, renders as a paragraph.
 */
function renderContent(content) {
  if (!content) return null;

  // If it's an array, join with newlines
  if (Array.isArray(content)) {
    content = content.join('\n');
  }

  // Ensure it's a string
  const str = String(content).trim();
  if (!str) return null;

  // Check if it looks like HTML (contains a tag)
  const isHtmlContent = /<\/?(p|ul|ol|li|h[2-3]|b|strong|i|em|u|br|div|span|blockquote|table|tr|td|a)[^>]*>/i.test(str);

  if (isHtmlContent) {
    // Clean up and sanitize
    let cleaned = str;
    // Remove empty <p> tags
    cleaned = cleaned.replace(/<p>\s*<\/p>/g, '');
    // Remove <p> inside <li>
    cleaned = cleaned.replace(/<li>\s*<p>/g, '<li>');
    cleaned = cleaned.replace(/<\/p>\s*<\/li>/g, '</li>');
    // Remove <p> inside <ul> / <ol>
    cleaned = cleaned.replace(/<ul>\s*<p>/g, '<ul>');
    cleaned = cleaned.replace(/<\/p>\s*<\/ul>/g, '</ul>');
    cleaned = cleaned.replace(/<ol>\s*<p>/g, '<ol>');
    cleaned = cleaned.replace(/<\/p>\s*<\/ol>/g, '</ol>');
    // Remove empty <p> with just a dot
    cleaned = cleaned.replace(/<p>\s*\.\s*<\/p>/g, '');
    // Remove extra blank lines
    cleaned = cleaned.replace(/\n\s*\n/g, '\n');

    const sanitized = DOMPurify.sanitize(cleaned, {
      ADD_ATTR: ['target'],
      ADD_TAGS: ['iframe'],
    });

    return <div className="rich-content" dangerouslySetInnerHTML={{ __html: sanitized }} />;
  }

  // Plain text: split by periods, but only if there is more than one period
  const hasMultiplePeriods = (str.match(/\./g) || []).length > 1;
  if (hasMultiplePeriods) {
    const items = str
      .split('.')
      .map(item => item.trim())
      .filter(item => item.length > 0);
    if (items.length > 0) {
      return (
        <ul>
          {items.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      );
    }
  }

  // Single sentence or no periods: render as a paragraph
  return <p>{str}</p>;
}

// ─── HELPER: Safely display any value (string, array, etc.) ──────────────
function safeDisplay(value) {
  if (value === null || value === undefined) return null;
  if (Array.isArray(value)) return value.join(", ");
  return value;
}

function JobDetailsModal({
  opportunity,
  saved = false,
  applied = false,
  shortlistedCount = 0,
  onSaved,
  onApplied,
  onClose,
  hideSaveButton = false,
}) {
  const { user } = useAuth();
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [documentFiles, setDocumentFiles] = useState({});
  const [applicationStatus, setApplicationStatus] = useState({ type: "", message: "" });
  const [submittingApplication, setSubmittingApplication] = useState(false);

  useEffect(() => {
    if (opportunity?.id) {
      incrementViews(opportunity.id);
    }
  }, [opportunity?.id]);

  if (!opportunity) {
    return null;
  }

  const isExpired = opportunity.daysLeft !== null && opportunity.daysLeft !== undefined && opportunity.daysLeft <= 0;
  const isDeadlineUrgent = !isExpired && opportunity.daysLeft !== null && opportunity.daysLeft <= 2;
  const requiredDocuments = opportunity.documentsRequired || [];
  
  const applicationDocuments = (requiredDocuments.length > 0 ? requiredDocuments : [defaultDocument])
    .map(normalizeApplicationDocument);

  const hasPdf = opportunity.jobDescriptionPdfUrl && opportunity.jobDescriptionPdfUrl.trim() !== "";

  const totalPositions = opportunity.positions || 0;
  const isFullyFilled = totalPositions > 0 && shortlistedCount >= totalPositions;

  const getDeadlineDisplay = () => {
    if (!opportunity.deadline || opportunity.daysLeft === null || opportunity.daysLeft === undefined) {
      return "No deadline specified";
    }
    if (opportunity.daysLeft === 0 || opportunity.daysLeft < 0) {
      return "Deadline has passed";
    }
    return `Closes in ${opportunity.daysLeft} day${opportunity.daysLeft > 1 ? 's' : ''}`;
  };

  function closeApplicationForm() {
    setShowApplyForm(false);
    setDocumentFiles({});
    setApplicationStatus({ type: "", message: "" });
  }

  function handleDocumentInputChange(key, value) {
    setDocumentFiles((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  function handleCloseJobDetails() {
    closeApplicationForm();
    onClose();
  }

  async function handleSave() {
    if (!user) {
      return;
    }

    try {
      const nextSaved = await toggleSavedOpportunityForUser(user.uid, opportunity.id, saved);
      onSaved?.(opportunity.id, nextSaved);
    } catch {
      return;
    }
  }

  async function handleSubmitApplication(e) {
    e.preventDefault();

    if (!user) {
      setApplicationStatus({ type: "error", message: "Please sign in before applying." });
      return;
    }

    if (isExpired) {
      setApplicationStatus({ type: "error", message: "Applications are closed for this opportunity." });
      return;
    }

    const missingDocument = applicationDocuments.find((document) => !documentFiles[document.key]);
    if (missingDocument) {
      setApplicationStatus({ type: "error", message: `Please provide ${missingDocument.label}.` });
      return;
    }

    setSubmittingApplication(true);
    setApplicationStatus({ type: "", message: "" });

    try {
      await submitApplication({
        studentId: user.uid,
        opportunityId: opportunity.id,
        requiredDocuments: applicationDocuments,
        documentFiles,
      });

      onApplied?.(opportunity.id);
      closeApplicationForm();
      setDocumentFiles({});
    } catch (err) {
      setApplicationStatus({
        type: "error",
        message: err.message || "Could not submit your application.",
      });
    } finally {
      setSubmittingApplication(false);
    }
  }

  return (
    <>
      <div className="job-modal-backdrop" role="presentation" onClick={handleCloseJobDetails}>
        <section
          className="job-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="job-modal-title"
          onClick={(e) => e.stopPropagation()}
        >
          <header className="job-modal-header">
            <div className="job-company-mark" aria-hidden="true">
              {opportunity.company?.charAt(0) || 'C'}
            </div>
            <div>
              <h2 id="job-modal-title">{opportunity.title}</h2>
              <p>
                {opportunity.company} | {opportunity.location} | {opportunity.type}
              </p>
            </div>
            <button className="job-modal-close" type="button" onClick={handleCloseJobDetails} aria-label="Close job details">
              x
            </button>
          </header>

          <div className={`job-modal-actions ${hideSaveButton ? "apply-only" : ""}`}>
            <button
              className={`job-apply-btn ${applied ? "applied" : ""} ${isExpired ? "closed" : ""}`}
              type="button"
              disabled={applied || isFullyFilled || isExpired}
              onClick={() => {
                if (!applied && !isFullyFilled && !isExpired) {
                  setShowApplyForm(true);
                }
              }}
              title={isExpired ? "Applications are closed for this opportunity" : isFullyFilled ? "All positions have been filled" : ""}
            >
              {applied ? "Applied" : isExpired ? "Applications Closed" : isFullyFilled ? "Positions Filled" : "Apply Now"}
            </button>
            {!hideSaveButton && (
              <button
                className={`job-save-btn ${saved ? "saved" : ""}`}
                type="button"
                onClick={handleSave}
              >
                <span aria-hidden="true">{saved ? "♥" : "♡"}</span>
                {saved ? "Saved" : "Save to Favorites"}
              </button>
            )}
          </div>

          {isExpired && !applied && (
            <div
              style={{
                marginTop: 8,
                padding: '8px 16px',
                backgroundColor: '#f1f5f9',
                borderRadius: '6px',
                color: '#64748b',
                fontSize: 13,
                fontWeight: 600,
                textAlign: 'center',
              }}
            >
              Applications closed on {opportunity.deadline || 'the deadline date'}.
            </div>
          )}

          {isFullyFilled && !applied && !isExpired && (
            <div
              style={{
                marginTop: 8,
                padding: '8px 16px',
                backgroundColor: '#f1f5f9',
                borderRadius: '6px',
                color: '#64748b',
                fontSize: 13,
                fontWeight: 600,
                textAlign: 'center',
              }}
            >
              All positions have been filled.
            </div>
          )}

          <div className={`job-deadline ${isDeadlineUrgent ? "urgent" : ""} ${isExpired ? "closed" : ""}`}>
            <span aria-hidden="true">i</span>
            {isExpired ? "Applications Closed" : "Application Deadline"}: {opportunity.deadline}
          </div>

          <div className="job-modal-content">
            {/* ─── ABOUT THE ROLE ───────────────────────────────────────── */}
            <section>
              <h3>About the Role</h3>
              {renderContent(opportunity.about) || <p>No description provided.</p>}
            </section>

            {/* ─── RESPONSIBILITIES ─────────────────────────────────────── */}
            <section>
              <h3>Responsibilities</h3>
              {renderContent(opportunity.responsibilities) || <p>No responsibilities listed yet.</p>}
            </section>

            {/* ─── REQUIREMENTS ─────────────────────────────────────────── */}
            <section>
              <h3>Requirements</h3>
              {renderContent(opportunity.requirements) || <p>No requirements listed yet.</p>}
            </section>

            {/* ─── ROLE DETAILS ─────────────────────────────────────────── */}
            <section>
              <h3>Role Details</h3>
              <ul>
                {opportunity.startDate && opportunity.startDate !== 'Not specified' && (
                  <li>Start date: {safeDisplay(opportunity.startDate)}</li>
                )}
                {opportunity.department && (
                  <li>Department: {safeDisplay(opportunity.department)}</li>
                )}
                <li>Duration: {safeDisplay(opportunity.duration)}</li>
                <li>Open positions: {safeDisplay(opportunity.positions)}</li>
                {opportunity.stipend && (
                  <li>Stipend / Salary: {safeDisplay(opportunity.stipend)}</li>
                )}
              </ul>
            </section>

            {hasPdf && (
              <section>
                <h3>Job Description PDF</h3>
                <p style={{ marginTop: '6px' }}>
                  <a
                    href={opportunity.jobDescriptionPdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 16px',
                      background: '#1B3A6B',
                      color: '#ffffff',
                      borderRadius: '6px',
                      textDecoration: 'none',
                      fontWeight: 600,
                      fontSize: '14px',
                    }}
                  >
                    <File size={16} />
                    {opportunity.pdfFileName || 'Download Job Description'}
                    <Download size={14} />
                  </a>
                </p>
              </section>
            )}

            <section>
              <h3>Documents Required</h3>
              {requiredDocuments.length > 0 ? (
                <ul>
                  {applicationDocuments.map((item) => (
                    <li key={item.key}>
                      {item.label}{item.format !== "any" ? ` (${item.formatLabel})` : ""}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No documents listed yet.</p>
              )}
            </section>

            <p className="job-modal-closes">
              {getDeadlineDisplay()}
            </p>
          </div>
        </section>
      </div>

      {showApplyForm && (
        <div className="application-modal-backdrop" role="presentation" onClick={closeApplicationForm}>
          <section
            className="application-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="application-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="application-modal-header">
              <div>
                <h2 id="application-modal-title">Submit Application</h2>
                <p>{opportunity.title}</p>
              </div>
              <button
                className="job-modal-close"
                type="button"
                onClick={closeApplicationForm}
                aria-label="Close application form"
              >
                x
              </button>
            </header>

            <form className="job-apply-form" onSubmit={handleSubmitApplication}>
              {requiredDocuments.length > 0 && (
                <div className="application-required-docs">
                  <strong>Required by employer:</strong>
                  <span>
                    {applicationDocuments
                      .map((item) => item.format !== "any" ? `${item.label} (${item.formatLabel})` : item.label)
                      .join(", ")}
                  </span>
                </div>
              )}

              {applicationDocuments.map((document) => (
                <label key={document.key}>
                  {document.label}{document.format !== "any" ? ` (${document.formatLabel})` : ""} *
                  {document.inputType === "url" ? (
                    <input
                      type="url"
                      placeholder="https://example.com/your-document"
                      value={documentFiles[document.key] || ""}
                      onChange={(e) => handleDocumentInputChange(document.key, e.target.value)}
                    />
                  ) : (
                    <input
                      type="file"
                      accept={getAcceptValue(document.format)}
                      onChange={(e) => handleDocumentInputChange(document.key, e.target.files?.[0] || null)}
                    />
                  )}
                </label>
              ))}

              {applicationStatus.message && (
                <p className={`application-feedback ${applicationStatus.type}`}>
                  {applicationStatus.message}
                </p>
              )}

              <button className="job-submit-application-btn" type="submit" disabled={submittingApplication}>
                {submittingApplication ? "Submitting..." : "Submit Application"}
              </button>
            </form>
          </section>
        </div>
      )}
    </>
  );
}

export default JobDetailsModal;