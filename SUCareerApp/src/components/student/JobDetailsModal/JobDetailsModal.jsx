import { useState } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { submitApplication } from "../../../services/applicationService";
import { toggleSavedOpportunityForUser } from "../../../utils/saveOpportunity";
import "./JobDetailsModal.css";

function JobDetailsModal({ opportunity, saved = false, onSaved, onClose, hideSaveButton = false }) {
  const { user } = useAuth();
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [documentFiles, setDocumentFiles] = useState({});
  const [applicationStatus, setApplicationStatus] = useState({ type: "", message: "" });
  const [submittingApplication, setSubmittingApplication] = useState(false);

  if (!opportunity) {
    return null;
  }

  const isDeadlineUrgent = opportunity.daysLeft !== null && opportunity.daysLeft <= 2;
  const requiredDocuments = opportunity.documentsRequired || [];
  const applicationDocuments = requiredDocuments.length > 0 ? requiredDocuments : ["CV / Resume"];
  const hasPdf = opportunity.jobDescriptionPdfUrl && opportunity.jobDescriptionPdfUrl.trim() !== "";

  function closeApplicationForm() {
    setShowApplyForm(false);
    setDocumentFiles({});
    setApplicationStatus({ type: "", message: "" });
  }

  function handleDocumentFileChange(label, file) {
    setDocumentFiles((prev) => ({
      ...prev,
      [label]: file,
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
    } catch (err) {
      console.error("Failed to update saved opportunity:", err);
    }
  }

  async function handleSubmitApplication(e) {
    e.preventDefault();

    if (!user) {
      setApplicationStatus({ type: "error", message: "Please sign in before applying." });
      return;
    }

    const missingDocument = applicationDocuments.find((label) => !documentFiles[label]);
    if (missingDocument) {
      setApplicationStatus({ type: "error", message: `Please upload ${missingDocument}.` });
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
      setApplicationStatus({ type: "success", message: "Application submitted successfully." });
      setDocumentFiles({});
    } catch (err) {
      console.error("Failed to submit application:", err);
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
              {opportunity.company.charAt(0)}
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
            <button className="job-apply-btn" type="button" onClick={() => setShowApplyForm(true)}>
              Apply Now
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

          <div className={`job-deadline ${isDeadlineUrgent ? "urgent" : ""}`}>
            <span aria-hidden="true">i</span>
            Application Deadline: {opportunity.deadline}
          </div>

          <div className="job-modal-content">
            <section>
              <h3>About the Role</h3>
              <p>{opportunity.about}</p>
            </section>

            <section>
              <h3>Responsibilities</h3>
              {opportunity.responsibilities?.length > 0 ? (
                <ul>
                  {opportunity.responsibilities.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p>No responsibilities listed yet.</p>
              )}
            </section>

            <section>
              <h3>Requirements</h3>
              {opportunity.requirements.length > 0 ? (
                <ul>
                  {opportunity.requirements.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p>No requirements listed yet.</p>
              )}
            </section>

            <section>
              <h3>Role Details</h3>
              <ul>
                <li>Start date: {opportunity.startDate}</li>
                <li>Duration: {opportunity.duration}</li>
                <li>Open positions: {opportunity.positions}</li>
              </ul>
            </section>

            {/* ─── PDF DOWNLOAD LINK ──────────────────────────────────── */}
            {hasPdf && (
              <section>
                <h3>Job Description PDF</h3>
                <p style={{ marginTop: '6px' }}>
                  <a
                    href={opportunity.jobDescriptionPdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-block',
                      padding: '8px 16px',
                      background: '#1B3A6B',
                      color: '#ffffff',
                      borderRadius: '6px',
                      textDecoration: 'none',
                      fontWeight: 600,
                      fontSize: '14px',
                    }}
                  >
                    📄 Download Full Job Description
                  </a>
                </p>
              </section>
            )}

            <section>
              <h3>Documents Required</h3>
              {requiredDocuments.length > 0 ? (
                <ul>
                  {requiredDocuments.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p>No documents listed yet.</p>
              )}
            </section>

            <p className="job-modal-closes">
              {opportunity.daysLeft === null ? "Deadline not set" : `Closes in ${opportunity.daysLeft} days`}
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
                  <span>{requiredDocuments.join(", ")}</span>
                </div>
              )}

              {applicationDocuments.map((label) => (
                <label key={label}>
                  {label} *
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={(e) => handleDocumentFileChange(label, e.target.files?.[0] || null)}
                  />
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