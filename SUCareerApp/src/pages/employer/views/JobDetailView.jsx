// src/pages/employer/views/JobDetailView.jsx
import { ArrowLeft, Edit2, Calendar, File, Download, Users } from 'lucide-react';
import DOMPurify from 'dompurify';
import { NAVY } from '../constants';
import JobApplicantsWidget from '../../../components/employer/JobApplicantsWidget';

// ─── RENDER CONTENT ──────────────────────────────────────────────────────
function renderContent(content) {
  if (!content) return null;

  // If it's an array, join with newlines
  if (Array.isArray(content)) {
    content = content.join('\n');
  }

  const str = String(content).trim();
  if (!str) return null;

  // Check for HTML tags
  const isHtmlContent = /<[^>]+>/i.test(str);

  if (isHtmlContent) {
    let cleaned = str;
    // Clean up common issues
    cleaned = cleaned.replace(/<p>\s*<\/p>/g, '');
    cleaned = cleaned.replace(/<li>\s*<p>/g, '<li>');
    cleaned = cleaned.replace(/<\/p>\s*<\/li>/g, '</li>');
    cleaned = cleaned.replace(/<ul>\s*<p>/g, '<ul>');
    cleaned = cleaned.replace(/<\/p>\s*<\/ul>/g, '</ul>');
    cleaned = cleaned.replace(/<ol>\s*<p>/g, '<ol>');
    cleaned = cleaned.replace(/<\/p>\s*<\/ol>/g, '</ol>');
    cleaned = cleaned.replace(/<p>\s*\.\s*<\/p>/g, '');
    cleaned = cleaned.replace(/<p>\s*<\/p>/g, '');
    cleaned = cleaned.replace(/\n\s*\n/g, '\n');

    const sanitized = DOMPurify.sanitize(cleaned, {
      ADD_ATTR: ['target'],
      ADD_TAGS: ['iframe'],
    });

    return <div className="rich-content" dangerouslySetInnerHTML={{ __html: sanitized }} />;
  }

  // Plain text: split by periods/newlines into bullet list if multiple items
  const items = str
    .split(/(?:\.\s+|\n)/)
    .map(item => item.trim())
    .filter(item => item && item.length > 0);
  if (items.length > 1) {
    return (
      <ul style={{ margin: 0, paddingLeft: 20, color: '#475569', fontSize: 14, lineHeight: 1.8 }}>
        {items.map((item, idx) => (
          <li key={idx}>{item}</li>
        ))}
      </ul>
    );
  }

  // Single sentence – render as paragraph
  return <p style={{ color: '#475569', lineHeight: 1.7, fontSize: 14, margin: 0 }}>{str}</p>;
}

export default function JobDetailView({ job, applicants, onBack, onReview, onEdit }) {
  const jobApps = applicants.filter(app => app.jobId === job.id);
  const widgetKey = jobApps.map(app => `${app.id}-${app.status}`).join(',');

  // Count shortlisted applicants (these fill the positions)
  const shortlistedCount = jobApps.filter(app => app.status?.toLowerCase() === 'shortlisted').length;
  const totalPositions = job.positions || 0;
  const isFullyFilled = totalPositions > 0 && shortlistedCount >= totalPositions;

  const formatDate = (dateValue) => {
    if (!dateValue) return 'Not specified';
    if (typeof dateValue.toDate === 'function') {
      return dateValue.toDate().toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    }
    return new Date(dateValue).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const getDaysLeft = () => {
    if (!job.deadline) return null;
    const deadline = typeof job.deadline.toDate === 'function' ? job.deadline.toDate() : new Date(job.deadline);
    const now = new Date();
    const diff = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const daysLeft = job.daysLeft !== undefined && job.daysLeft !== null ? job.daysLeft : getDaysLeft();

  const getDeadlineDisplay = () => {
    if (!job.deadline) return '';
    if (daysLeft === null || daysLeft === undefined) return '';
    if (daysLeft === 0) return 'Deadline has passed';
    if (daysLeft < 0) return 'Deadline has passed';
    return `Closes in ${daysLeft} day${daysLeft > 1 ? 's' : ''}`;
  };

  // ─── parseList: removes format suffix, just returns the label ─────────
  const parseList = (value) => {
    if (!value) return [];
    if (Array.isArray(value)) {
      return value
        .filter(Boolean)
        .map(item => {
          if (typeof item === 'string') return item;
          return item.label || item.name || 'Document';
        })
        .filter(item => item && item.trim() !== '');
    }
    if (typeof value === 'string') {
      // For plain text, we'll rely on renderContent to handle formatting.
      // Return the string as‑is, because renderContent will split it.
      return [value.trim()];
    }
    return [];
  };

  // ─── Use parseList only for plain text; for HTML we render directly ──
  // We'll pass the raw content to renderContent later, so we keep raw strings.
  const rawDescription = job.description || 'No description provided.';
  const rawResponsibilities = job.responsibilities || null;
  const rawRequirements = job.requirement || job.requirements || null;

  const documentsList = parseList(job.requiredDocuments || job.documentsRequired || job.requiredDocument);
  const hasPdf = job.jobDescriptionPdfUrl && job.jobDescriptionPdfUrl.trim() !== '';

  const isDeadlineUrgent = daysLeft !== null && daysLeft !== undefined && daysLeft <= 2 && daysLeft > 0;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {/* Back Button */}
      <button
        onClick={onBack}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          background: 'none',
          border: 'none',
          color: '#64748b',
          fontSize: 12,
          fontWeight: 600,
          cursor: 'pointer',
          marginBottom: 20,
          padding: 0,
        }}
      >
        <ArrowLeft size={14} /> Back to Dashboard
      </button>

      {/* Job Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 20,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: NAVY }}>{job.title}</h1>
          <span
            style={{
              padding: '2px 12px',
              borderRadius: '20px',
              fontSize: 12,
              fontWeight: 600,
              background: job.status === 'open' ? '#dcfce7' : job.status === 'pending' ? '#fef3c7' : '#fee2e2',
              color: job.status === 'open' ? '#16a34a' : job.status === 'pending' ? '#d97706' : '#dc2626',
            }}
          >
            {job.status === 'open' ? 'Active' : job.status === 'pending' ? 'Pending' : 'Closed'}
          </span>
          {job.status === 'pending' && (
            <button
              onClick={onEdit}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 12px',
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                color: '#64748b',
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
            >
              <Edit2 size={12} /> Edit
            </button>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, color: '#64748b' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Calendar size={14} /> Deadline: {formatDate(job.deadline)}
          </span>
          {isDeadlineUrgent && (
            <span style={{ color: '#dc2626', fontWeight: 600, fontSize: 12, background: '#fee2e2', padding: '2px 10px', borderRadius: '12px' }}>
              Closing soon
            </span>
          )}
          <span style={{ fontSize: 12, color: '#475569', fontWeight: 500 }}>
            {getDeadlineDisplay()}
          </span>
        </div>
      </div>

      {/* Positions Filled Indicator */}
      {totalPositions > 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 16px',
            borderRadius: '8px',
            marginBottom: 20,
            background: isFullyFilled ? '#f1f5f9' : '#f0fdf4',
            border: isFullyFilled ? '1px solid #e2e8f0' : '1px solid #bbf7d0',
          }}
        >
          <Users size={16} color={isFullyFilled ? '#64748b' : '#16a34a'} />
          <span style={{ fontSize: 13, fontWeight: 600, color: isFullyFilled ? '#64748b' : '#166534' }}>
            {isFullyFilled
              ? `All ${totalPositions} position${totalPositions > 1 ? 's' : ''} filled`
              : `${shortlistedCount} of ${totalPositions} position${totalPositions > 1 ? 's' : ''} filled`}
          </span>
          {isFullyFilled && (
            <span
              style={{
                marginLeft: 'auto',
                padding: '2px 12px',
                borderRadius: '12px',
                fontSize: 11,
                fontWeight: 700,
                background: '#e2e8f0',
                color: '#64748b',
              }}
            >
              Filled
            </span>
          )}
        </div>
      )}

      {/* Job Details Card */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          padding: '32px',
          marginBottom: 24,
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
        }}
      >
        {/* About the Role */}
        <div style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: NAVY, marginBottom: 8 }}>About the Role</h3>
          {renderContent(rawDescription) || <p style={{ color: '#94a3b8', fontSize: 14 }}>No description provided.</p>}
        </div>

        {/* Responsibilities */}
        {rawResponsibilities && (
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: NAVY, marginBottom: 8 }}>Responsibilities</h3>
            {renderContent(rawResponsibilities) || <p style={{ color: '#94a3b8', fontSize: 14 }}>No responsibilities listed.</p>}
          </div>
        )}

        {/* Requirements */}
        {rawRequirements && (
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: NAVY, marginBottom: 8 }}>Requirements</h3>
            {renderContent(rawRequirements) || <p style={{ color: '#94a3b8', fontSize: 14 }}>No requirements listed.</p>}
          </div>
        )}

        <div style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: NAVY, marginBottom: 12 }}>Role Details</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 24px' }}>
            {job.startDate && job.startDate !== 'Not specified' && (
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.3px', margin: '0 0 2px 0' }}>
                  Start Date
                </p>
                <p style={{ margin: 0, fontSize: 14, color: '#1e293b' }}>{formatDate(job.startDate)}</p>
              </div>
            )}
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.3px', margin: '0 0 2px 0' }}>
                Duration
              </p>
              <p style={{ margin: 0, fontSize: 14, color: '#1e293b' }}>{job.duration || 'Not specified'}</p>
            </div>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.3px', margin: '0 0 2px 0' }}>
                Open Positions
              </p>
              <p style={{ margin: 0, fontSize: 14, color: '#1e293b' }}>{totalPositions}</p>
            </div>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.3px', margin: '0 0 2px 0' }}>
                Job Type
              </p>
              <p style={{ margin: 0, fontSize: 14, color: '#1e293b' }}>{job.jobType || job.type || 'Not specified'}</p>
            </div>
          </div>
        </div>

        {documentsList.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: NAVY, marginBottom: 8 }}>Documents Required</h3>
            <ul style={{ margin: 0, paddingLeft: 20, color: '#475569', fontSize: 14, lineHeight: 1.8 }}>
              {documentsList.map((doc, idx) => (
                <li key={idx}>{doc}</li>
              ))}
            </ul>
          </div>
        )}

        {hasPdf && (
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: NAVY, marginBottom: 8 }}>Job Description PDF</h3>
            <a
              href={job.jobDescriptionPdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 16px',
                backgroundColor: '#f1f5f9',
                color: NAVY,
                borderRadius: '6px',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: 13,
                border: '1px solid #e2e8f0',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#e2e8f0')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
            >
              <File size={16} />
              {job.pdfFileName || 'Download Job Description'}
              <Download size={14} />
            </a>
          </div>
        )}
      </div>

      {/* Applicants Table */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
        }}
      >
        <JobApplicantsWidget key={widgetKey} applicants={jobApps} onReview={onReview} />
      </div>
    </div>
  );
}