// src/components/OpportunityCard/OpportunityCard.jsx

import { useAuth } from "../../Context/authContext";
import { toggleSavedOpportunityForUser } from "../../utils/saveOpportunity";
import "./OpportunityCard.css";

function OpportunityCard({
  opportunity,
  title,
  company,
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
      <p className="card-company">
        {company} &nbsp;📍 {location}
      </p>

      {/* Short description */}
      <p className="card-description">{description}</p>

      {/* Bottom row: type badge + closing info */}
      <div className="card-footer">
        <span className="badge">{type}</span>
        <span className="closes">
          Deadline: {deadline || (daysLeft === null ? "Not set" : `${daysLeft} days`)}
        </span>
      </div>
    </article>
  );
}

export default OpportunityCard;
