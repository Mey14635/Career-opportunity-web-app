import { useAuth } from "../../Context/authContext";
import { toggleSavedOpportunityForUser } from "../../utils/saveOpportunity";
import "./JobDetailsModal.css";

function JobDetailsModal({ opportunity, saved = false, onSaved, onClose, hideSaveButton = false }) {
  const { user } = useAuth();

  if (!opportunity) {
    return null;
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

  return (
    <div className="job-modal-backdrop" role="presentation" onClick={onClose}>
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
          <button className="job-modal-close" type="button" onClick={onClose} aria-label="Close job details">
            x
          </button>
        </header>

        <div className={`job-modal-actions ${hideSaveButton ? "apply-only" : ""}`}>
          <button className="job-apply-btn" type="button">
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

        <div className="job-deadline">
          <span aria-hidden="true">i</span>
          Application Deadline: {opportunity.deadline}
        </div>

        <div className="job-modal-content">
          <section>
            <h3>About the Role</h3>
            <p>{opportunity.about}</p>
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
            <h3>Documents Required</h3>
            {opportunity.documentsRequired.length > 0 ? (
              <ul>
                {opportunity.documentsRequired.map((item) => (
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
  );
}

export default JobDetailsModal;
