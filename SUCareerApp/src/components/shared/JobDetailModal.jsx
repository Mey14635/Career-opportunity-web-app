// src/components/shared/JobDetailModal.jsx
import { X, File, Download } from 'lucide-react';
import { NAVY } from '../../pages/admin/constants';

export default function JobDetailModal({
  job,
  onClose,
  renderContent,
  parseDocumentList,
}) {
  if (!job) return null;

  const formatDate = (dateValue) => {
    if (!dateValue) return 'Not specified';
    if (typeof dateValue.toDate === 'function') {
      return dateValue.toDate().toDateString();
    }
    return new Date(dateValue).toDateString();
  };

  const documentsList = parseDocumentList
    ? parseDocumentList(job.requiredDocuments || job.documentsRequired || job.requiredDocument)
    : [];

  const hasPdf = job.jobDescriptionPdfUrl && job.jobDescriptionPdfUrl.trim() !== '';

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

        {/* About the Role / Description */}
        <div style={{ marginBottom: 16 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: NAVY, marginBottom: 8 }}>
            {job.about ? 'About the Role' : 'Description'}
          </h3>
          {renderContent
            ? renderContent(job.about || job.description) || (
                <p style={{ color: '#94a3b8', fontSize: 14 }}>No description provided.</p>
              )
            : <p style={{ color: '#475569', fontSize: 14 }}>{job.description || 'No description provided.'}</p>
          }
        </div>

        {/* Responsibilities */}
        {job.responsibilities && (
          <div style={{ marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: NAVY, marginBottom: 8 }}>Responsibilities</h3>
            {renderContent
              ? renderContent(job.responsibilities)
              : <p style={{ color: '#475569', fontSize: 14 }}>{job.responsibilities}</p>
            }
          </div>
        )}

        {/* Requirements */}
        <div style={{ marginBottom: 16 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: NAVY, marginBottom: 8 }}>Requirements</h3>
          {renderContent
            ? renderContent(job.requirement || job.requirements) || (
                <p style={{ color: '#94a3b8', fontSize: 14 }}>No specific requirements listed.</p>
              )
            : <p style={{ color: '#475569', fontSize: 14 }}>{job.requirement || job.requirements || 'No specific requirements listed.'}</p>
          }
        </div>

        {/* ─── ROLE DETAILS ─────────────────────────────────────────────── */}
        <div style={{ marginBottom: 16 }}>
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
            {job.department && (
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.3px', margin: '0 0 2px 0' }}>
                  Department
                </p>
                <p style={{ margin: 0, fontSize: 14, color: '#1e293b' }}>{job.department}</p>
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
            {job.stipend && (
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.3px', margin: '0 0 2px 0' }}>
                  Stipend / Salary
                </p>
                <p style={{ margin: 0, fontSize: 14, color: '#1e293b' }}>{job.stipend}</p>
              </div>
            )}
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.3px', margin: '0 0 2px 0' }}>
                Deadline
              </p>
              <p style={{ margin: 0, fontSize: 14, color: '#1e293b' }}>{formatDate(job.deadline)}</p>
            </div>
          </div>
        </div>

        {/* Documents Required */}
        {documentsList.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: NAVY, marginBottom: 8 }}>Documents Required</h3>
            <ul style={{ margin: 0, paddingLeft: 20, color: '#475569', fontSize: 14, lineHeight: 1.8 }}>
              {documentsList.map((doc, idx) => (
                <li key={idx}>{doc}</li>
              ))}
            </ul>
          </div>
        )}

        {/* PDF */}
        {hasPdf && (
          <div>
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
              <File size={16} /> {job.pdfFileName || 'Download Job Description'} <Download size={14} />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}