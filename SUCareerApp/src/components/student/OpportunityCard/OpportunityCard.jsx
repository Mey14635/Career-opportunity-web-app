import { Link } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { useAuth } from "../../../contexts/AuthContext";
import { toggleSavedOpportunityForUser } from "../../../utils/saveOpportunity";
import "./OpportunityCard.css";

// ─── DECODE HTML ENTITIES ────────────────────────────────────────────────
function decodeHTMLEntities(text) {
  const entities = {
    '&lt;': '<',
    '&gt;': '>',
    '&amp;': '&',
    '&quot;': '"',
    '&#39;': "'",
    '&nbsp;': ' ',
    '&#x27;': "'",
    '&#x2F;': '/',
    '&#x3C;': '<',
    '&#x3E;': '>',
  };
  return text.replace(/&lt;|&gt;|&amp;|&quot;|&#39;|&nbsp;|&#x27;|&#x2F;|&#x3C;|&#x3E;/g, (match) => entities[match] || match);
}

// ─── RENDER DESCRIPTION FOR CARD PREVIEW ────────────────────────────────
function renderCardDescription(content) {
  if (!content) return null;

  const rawContent = Array.isArray(content) ? content.join('\n') : String(content);
  let trimmed = rawContent.trim();

  if (!trimmed) return null;

  // Decode HTML entities (e.g., &lt;ul&gt; → <ul>)
  trimmed = decodeHTMLEntities(trimmed);

  // Check if it's HTML
  const isHtmlContent = /<[^>]+>/i.test(trimmed);

  if (isHtmlContent) {
    let cleaned = trimmed
      .replace(/<p>\s*<\/p>/g, '')
      .replace(/<li>\s*<p>/g, '<li>')
      .replace(/<\/p>\s*<\/li>/g, '</li>')
      .replace(/<ul>\s*<p>/g, '<ul>')
      .replace(/<\/p>\s*<\/ul>/g, '</ul>')
      .replace(/<ol>\s*<p>/g, '<ol>')
      .replace(/<\/p>\s*<\/ol>/g, '</ol>')
      .replace(/<p>\s*\.\s*<\/p>/g, '')
      .replace(/\n\s*\n/g, '\n');

    const sanitized = DOMPurify.sanitize(cleaned, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'b', 'em', 'i', 'u', 'ul', 'ol', 'li', 'span', 'div'],
      ALLOWED_ATTR: ['class', 'style'],
    });

    return <div className="card-description rich-card-content" dangerouslySetInnerHTML={{ __html: sanitized }} />;
  }

  // Plain text: truncate to 120 characters for card preview
  if (trimmed.length > 120) {
    trimmed = trimmed.substring(0, 120) + '...';
  }

  return <p className="card-description plain-card-description">{trimmed}</p>;
}

function OpportunityCard({
  opportunity,
  title,
  company,
  employerId,
  location,
  description,
  type,
  daysLeft,
  deadline,
  expired = false,
  saved = false,
  applied = false,
  onSaved,
  onOpen,
}) {
  const { user } = useAuth();
  const isDeadlineUrgent = !expired && daysLeft !== null && daysLeft <= 2;

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
    } catch {
      return;
    }
  }

  return (
    <article
      className={`card ${applied ? "applied" : ""} ${expired ? "expired" : ""}`}
      onClick={onOpen}
      onKeyDown={handleCardKeyDown}
      role="button"
      tabIndex={0}
    >
      <div className="card-top">
        <h3 className="card-title">{title}</h3>
        <div className="card-actions">
          {expired && <span className="closed-pill">Closed</span>}
          {applied && <span className="applied-pill">Applied</span>}
          <button
            className={`heart-btn ${saved ? "saved" : ""}`}
            onClick={handleSave}
            aria-label={saved ? "Remove saved opportunity" : "Save opportunity"}
          >
              {saved ? "💛" : "🤍"}
          </button>
        </div>
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
      {renderCardDescription(description)}

      {/* Bottom row: type badge + closing info */}
      <div className="card-footer">
        <span className="badge">{type}</span>
        <span className={`closes ${isDeadlineUrgent ? "urgent" : ""} ${expired ? "closed" : ""}`}>
          {expired ? `Closed on: ${deadline || "Deadline passed"}` : `Deadline: ${deadline || (daysLeft === null ? "Not set" : `${daysLeft} days`)}`}
        </span>
      </div>
    </article>
  );
}

export default OpportunityCard;