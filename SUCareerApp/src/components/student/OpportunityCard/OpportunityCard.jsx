// src/components/OpportunityCard/OpportunityCard.jsx

import { Link } from 'react-router-dom';
import { useAuth } from "../../../contexts/AuthContext";
import { toggleSavedOpportunityForUser } from "../../../utils/saveOpportunity";
import "./OpportunityCard.css";

function OpportunityCard({
  opportunity,
  title,
  company,
  employerId,   // ← NEW prop
  location,
  description,
  type,
  daysLeft,
  deadline,
  saved = false,
  onSaved,
  onOpen,
}) {
  const { user } = useAuth();
  const isDeadlineUrgent = daysLeft !== null && daysLeft <= 2;

  function handleCardKeyDown(e) {
    if ((e.key === "Enter" || e.key === " ") && onOpen) {
      e.preventDefault();
      onOpen();
    }
  }

  async function handleSave(e) {
    e.stopPropagation();

    if (!user || !opportunity) {
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
    <article
      className="card"
      onClick={onOpen}
      onKeyDown={handleCardKeyDown}
      role="button"
      tabIndex={0}
    >
      <div className="card-top">
        <h3 className="card-title">{title}</h3>
        <button
          className={`heart-btn ${saved ? "saved" : ""}`}
          onClick={handleSave}
          aria-label={saved ? "Remove saved opportunity" : "Save opportunity"}
        >
            {saved ? "💛" : "🤍"}
        </button>
      </div>

      {/* ─── COMPANY NAME WITH LINK ────────────────────────────────── */}
      <p className="card-company">
        {employerId ? (
          <Link to={`/company/${employerId}`} className="company-link">
            {company}
          </Link>
        ) : (
          company
        )}
        &nbsp;📍 {location}
      </p>

      {/* Short description */}
      <p className="card-description">{description}</p>

      {/* Bottom row: type badge + closing info */}
      <div className="card-footer">
        <span className="badge">{type}</span>
        <span className={`closes ${isDeadlineUrgent ? "urgent" : ""}`}>
          Deadline: {deadline || (daysLeft === null ? "Not set" : `${daysLeft} days`)}
        </span>
      </div>
    </article>
  );
}

export default OpportunityCard;