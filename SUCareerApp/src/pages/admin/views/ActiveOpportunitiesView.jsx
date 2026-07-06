import { useState } from 'react';
import { Eye } from 'lucide-react';
import { NAVY } from '../constants';
import JobDetailModal from '../../../components/shared/JobDetailModal';

// ─── JOB DETAIL MODAL (moved outside component) ──────────────────────────
function JobDetailModal({ job, onClose }) {
  if (!job) return null;

  const formatDate = (dateValue) => {
    if (!dateValue) return 'Not specified';
    if (typeof dateValue.toDate === 'function') {
      return dateValue.toDate().toDateString();
    }
    return new Date(dateValue).toDateString();
  };

  const parseList = (value) => {
    if (!value) return [];
    if (Array.isArray(value)) {
      return value
        .filter(Boolean)
        .map(item => {
          if (typeof item === 'string') return item;
          const label = item.label || item.name || 'Document';
          return item.format && item.format !== 'any'
            ? `${label} (${item.formatLabel || item.format})`
            : label;
        })
        .filter(item => item && item.trim() !== '');
    }
    if (typeof value === 'string') {
      return value.split(',').map(item => item.trim()).filter(Boolean);
    }
    return [];
  };

  const documentsList = parseList(job.requiredDocuments || job.documentsRequired || job.requiredDocument);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        backdropFilter: 'blur(2px)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          width: '100%',
          maxWidth: '700px',
          borderRadius: '12px',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
          padding: '32px',
          maxHeight: '90vh',
          overflowY: 'auto',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            background: '#f1f5f9',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <X size={18} color="#64748b" />
        </button>

        <h2 style={{ margin: '0 0 4px 0', fontSize: 22, fontWeight: 800, color: NAVY }}>{job.title}</h2>
        <p style={{ margin: '0 0 16px 0', fontSize: 14, color: '#64748b' }}>
          {job.companyName || job.employerId} &bull; {job.location || 'Location not specified'}
        </p>

        <div style={{ marginBottom: 16 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: NAVY, marginBottom: 4 }}>Description</h3>
          <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.6, margin: 0 }}>
            {job.description || 'No description provided.'}
          </p>
        </div>

        <div style={{ marginBottom: 16 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: NAVY, marginBottom: 4 }}>Requirements</h3>
          <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.6, margin: 0 }}>
            {job.requirement || job.requirements || 'No specific requirements listed.'}
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 24px', marginBottom: 16 }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.3px', margin: '0 0 2px 0' }}>
              Deadline
            </p>
            <p style={{ margin: 0, fontSize: 14, color: '#1e293b' }}>{formatDate(job.deadline)}</p>
          </div>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.3px', margin: '0 0 2px 0' }}>
              Status
            </p>
            <p style={{ margin: 0, fontSize: 14, color: '#1e293b' }}>{job.status || 'N/A'}</p>
          </div>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.3px', margin: '0 0 2px 0' }}>
              Duration
            </p>
            <p style={{ margin: 0, fontSize: 14, color: '#1e293b' }}>{job.duration || 'Not specified'}</p>
          </div>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.3px', margin: '0 0 2px 0' }}>
              Positions
            </p>
            <p style={{ margin: 0, fontSize: 14, color: '#1e293b' }}>{job.positions || 'Not specified'}</p>
          </div>
        </div>

        {documentsList.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: NAVY, marginBottom: 4 }}>Required Documents</h3>
            <ul style={{ margin: 0, paddingLeft: 20, color: '#475569', fontSize: 14, lineHeight: 1.8 }}>
              {documentsList.map((doc, idx) => (
                <li key={idx}>{doc}</li>
              ))}
            </ul>
          </div>
        )}

        {job.jobDescriptionPdfUrl && (
          <div>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: NAVY, marginBottom: 4 }}>Job Description PDF</h3>
            <a
              href={job.jobDescriptionPdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 14px',
                background: '#f1f5f9',
                color: NAVY,
                borderRadius: '6px',
                textDecoration: 'none',
                fontSize: 13,
                fontWeight: 600,
                border: '1px solid #e2e8f0',
              }}
            >
              <FileText size={16} /> View PDF
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ActiveOpportunitiesView({ activeJobsData, triggerModal }) {
  const [selectedJob, setSelectedJob] = useState(null);

  return (
    <div style={{ maxWidth: '1200px' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ margin: '0 0 8px 0', fontSize: 24, fontWeight: 800, color: NAVY }}>Active Opportunities</h1>
        <p style={{ margin: 0, fontSize: 14, color: '#64748b' }}>Manage job listings that are currently live and visible to students.</p>
      </div>
      <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
              {['JOB TITLE', 'COMPANY', 'PUBLISHED DATE', 'APPLICANTS', 'ACTIONS'].map((h) => (
                <th key={h} style={{ padding: '16px 24px', fontSize: 12, fontWeight: 700, color: '#94a3b8' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {activeJobsData.map((job) => (
              <tr key={job.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '20px 24px', fontSize: 14, fontWeight: 700, color: NAVY }}>{job.title}</td>
                <td style={{ padding: '20px 24px', fontSize: 14, color: '#64748b' }}>{job.companyName || job.employerId || job.employerID}</td>
                <td style={{ padding: '20px 24px', fontSize: 14, color: '#475569' }}>{job.createdAt?.toDate?.()?.toDateString() || 'N/A'}</td>
                <td style={{ padding: '20px 24px', fontSize: 14, fontWeight: 600, color: NAVY }}>{job.metrics?.applications || 0}</td>
                <td style={{ padding: '20px 24px' }}>
                  <div style={{ display: 'flex', gap: 8 }}>
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
                      <Eye size={14} /> View
                    </button>
                    <button
                      onClick={() => triggerModal('Unpublish Job', `Unpublish "${job.title}"? This will move it back to pending review.`, 'danger', { view: 'active', id: job.id, reason: 'unpublished' })}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 6,
                        border: '1px solid #ef4444',
                        background: 'transparent',
                        color: '#ef4444',
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'background-color 0.2s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fee2e2')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      Unpublish
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {activeJobsData.length === 0 && (
              <tr><td colSpan="5" style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>No active opportunities at the moment.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedJob && (
        <JobDetailModal job={selectedJob} onClose={() => setSelectedJob(null)} />
      )}
    </div>
  );
}
