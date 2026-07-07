// src/pages/admin/views/ExpiredJobsView.jsx
import { useState } from 'react';
import { Eye, Clock } from 'lucide-react';
import DOMPurify from 'dompurify';
import { NAVY } from '../constants';
import JobDetailModal from '../../../components/shared/JobDetailModal';

// Helper: render content safely (HTML or plain text)
function renderContent(content) {
  if (!content) return null;

  if (Array.isArray(content)) {
    content = content.join('\n');
  }

  const str = String(content).trim();
  if (!str) return null;

  const isHtmlContent = /<[^>]+>/i.test(str);
  if (isHtmlContent) {
    let cleaned = str;
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

  return <p style={{ color: '#475569', lineHeight: 1.7, fontSize: 14, margin: 0 }}>{str}</p>;
}

function getDaysSinceExpired(job) {
  if (!job.deadline) return null;
  const deadline = typeof job.deadline.toDate === 'function' ? job.deadline.toDate() : new Date(job.deadline);
  const now = new Date();
  return Math.ceil((now - deadline) / (1000 * 60 * 60 * 24));
}

function getDaysWaiting(job) {
  const created = job.createdAt?.toDate?.() || new Date(job.createdAt);
  const now = new Date();
  return Math.ceil((now - created) / (1000 * 60 * 60 * 24));
}

export default function ExpiredJobsView({ expiredJobsData }) {
  const [selectedJob, setSelectedJob] = useState(null);

  // expiredJobsData is already a list of expired jobs
  const expiredJobs = expiredJobsData || [];

  const formatDate = (dateValue) => {
    if (!dateValue) return 'N/A';
    if (typeof dateValue.toDate === 'function') {
      return dateValue.toDate().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }
    return new Date(dateValue).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const parseDocumentList = (value) => {
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
      return value.split(',').map(item => item.trim()).filter(Boolean);
    }
    return [];
  };

  if (expiredJobs.length === 0) {
    return (
      <div style={{ maxWidth: '1200px' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ margin: '0 0 8px 0', fontSize: 24, fontWeight: 800, color: NAVY }}>Expired Jobs</h1>
          <p style={{ margin: 0, fontSize: 14, color: '#64748b' }}>
            Jobs whose application deadlines have passed. These are no longer visible to students.
          </p>
        </div>
        <div style={{ textAlign: 'center', padding: '64px', background: 'white', borderRadius: 12, color: '#94a3b8' }}>
          No expired jobs to display.
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ margin: '0 0 8px 0', fontSize: 24, fontWeight: 800, color: NAVY }}>Expired Jobs</h1>
        <p style={{ margin: 0, fontSize: 14, color: '#64748b' }}>
          Jobs whose application deadlines have passed. These are no longer visible to students.
        </p>
        <p style={{ margin: '8px 0 0 0', fontSize: 13, color: '#94a3b8' }}>
          {expiredJobs.length} expired jobs
        </p>
      </div>

      <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
              <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 700, color: '#94a3b8' }}>JOB TITLE</th>
              <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 700, color: '#94a3b8' }}>COMPANY</th>
              <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 700, color: '#94a3b8' }}>DEADLINE</th>
              <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 700, color: '#94a3b8' }}>EXPIRED</th>
              <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 700, color: '#94a3b8' }}>PREVIOUS STATUS</th>
              <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 700, color: '#94a3b8' }}>WAITING TIME</th>
              <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 700, color: '#94a3b8' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {expiredJobs.map((job) => {
              const daysExpired = getDaysSinceExpired(job);
              const daysWaiting = getDaysWaiting(job);
              // Determine previous status before expiry
              const previousStatus = job.status === 'open' ? 'Active' : 'Pending';
              const statusColor = previousStatus === 'Active' ? '#16a34a' : '#d97706';
              const statusBg = previousStatus === 'Active' ? '#dcfce7' : '#fef3c7';

              return (
                <tr key={job.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '20px 24px', fontSize: 14, fontWeight: 700, color: NAVY }}>{job.title}</td>
                  <td style={{ padding: '20px 24px', fontSize: 14, color: '#64748b' }}>{job.companyName || job.employerId || job.employerID}</td>
                  <td style={{ padding: '20px 24px', fontSize: 14, color: '#475569' }}>{formatDate(job.deadline)}</td>
                  <td style={{ padding: '20px 24px', fontSize: 14, color: '#dc2626', fontWeight: 600 }}>
                    {daysExpired !== null ? `${daysExpired} day${daysExpired > 1 ? 's' : ''} ago` : 'N/A'}
                  </td>
                  <td style={{ padding: '20px 24px' }}>
                    <span
                      style={{
                        background: statusBg,
                        color: statusColor,
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    >
                      {previousStatus}
                    </span>
                    <span style={{ marginLeft: 8, fontSize: 12, color: '#94a3b8' }}>
                      (expired while {previousStatus.toLowerCase()})
                    </span>
                  </td>
                  <td style={{ padding: '20px 24px', fontSize: 13, color: '#64748b' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={14} color="#94a3b8" /> {daysWaiting} days
                    </span>
                  </td>
                  <td style={{ padding: '20px 24px' }}>
                    <button
                      onClick={() => setSelectedJob(job)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        padding: '6px 12px',
                        borderRadius: 6,
                        border: '1px solid #cbd5e1',
                        background: 'transparent',
                        color: '#475569',
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'background-color 0.2s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <Eye size={14} /> View Details
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selectedJob && (
        <JobDetailModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
          renderContent={renderContent}
          parseDocumentList={parseDocumentList}
        />
      )}
    </div>
  );
}