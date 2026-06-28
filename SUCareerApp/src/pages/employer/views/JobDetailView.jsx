import { ArrowLeft, Edit2, Calendar, File, Download } from 'lucide-react';
import { NAVY } from '../constants';
import JobApplicantsWidget from '../../../components/employer/JobApplicantsWidget';

export default function JobDetailView({ job, applicants, onBack, onStatusChange, onReview, onEdit }) {
  const jobApps = applicants.filter(app => app.jobId === job.id);

  // Format date for display
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

  // ─── DEADLINE DISPLAY LOGIC ──────────────────────────────────────────────
  const getDeadlineDisplay = () => {
    if (!job.deadline) return 'No deadline specified';
    const days = job.daysLeft;
    if (days === null || days === undefined) return 'No deadline specified';
    if (days === 0) return 'Deadline has passed';
    if (days < 0) return 'Deadline has passed';
    return `Closes in ${days} day${days > 1 ? 's' : ''}`;
  };

  /**
   * Smart parser for requirements/responsibilities/documents.
   * - Splits by: period + space (". ") or newline ("\n")
   * - Keeps commas inside sentences intact
   */
  const parseList = (value) => {
    if (!value) return [];
    if (Array.isArray(value)) {
      return value.filter(item => item && item.trim() !== '');
    }
    if (typeof value === 'string') {
      const items = value
        .split(/(?:\.\s+|\n)/)
        .map(item => item.trim())
        .filter(item => item && item.length > 0);
      if (items.length > 1) return items;
      return [value.trim()];
    }
    return [];
  };

  const requirementsList = parseList(job.requirement || job.requirements);
  const responsibilitiesList = parseList(job.responsibilities);
  const documentsList = parseList(job.requiredDocument || job.documentsRequired);
  const hasPdf = job.jobDescriptionPdfUrl && job.jobDescriptionPdfUrl.trim() !== '';

  // Check if job is urgent (deadline <= 2 days)
  const isDeadlineUrgent = job.daysLeft !== null && job.daysLeft !== undefined && job.daysLeft <= 2 && job.daysLeft > 0;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {/* ─── BACK BUTTON ────────────────────────────────────────────────── */}
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

      {/* ─── JOB HEADER ────────────────────────────────────────────────── */}
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

      {/* ─── JOB DETAILS CARD ──────────────────────────────────────────── */}
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
          <p style={{ color: '#475569', lineHeight: 1.7, fontSize: 14, margin: 0 }}>
            {job.description || 'No description provided.'}
          </p>
        </div>

        {/* Responsibilities */}
        {responsibilitiesList.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: NAVY, marginBottom: 8 }}>Responsibilities</h3>
            <ul style={{ margin: 0, paddingLeft: 20, color: '#475569', fontSize: 14, lineHeight: 1.8 }}>
              {responsibilitiesList.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Requirements */}
        {requirementsList.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: NAVY, marginBottom: 8 }}>Requirements</h3>
            <ul style={{ margin: 0, paddingLeft: 20, color: '#475569', fontSize: 14, lineHeight: 1.8 }}>
              {requirementsList.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Role Details - Conditional Start Date */}
        <div style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: NAVY, marginBottom: 12 }}>Role Details</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 24px' }}>
            {/* Start Date – only shown if present and not 'Not specified' */}
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
              <p style={{ margin: 0, fontSize: 14, color: '#1e293b' }}>{job.positions || 'Not specified'}</p>
            </div>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.3px', margin: '0 0 2px 0' }}>
                Job Type
              </p>
              <p style={{ margin: 0, fontSize: 14, color: '#1e293b' }}>{job.jobType || job.type || 'Not specified'}</p>
            </div>
          </div>
        </div>

        {/* Required Documents */}
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

        {/* PDF Download */}
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

      {/* ─── APPLICANTS TABLE ──────────────────────────────────────────── */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
        <JobApplicantsWidget applicants={jobApps} onStatusChange={onStatusChange} onReview={onReview} />
      </div>
    </div>
  );
}