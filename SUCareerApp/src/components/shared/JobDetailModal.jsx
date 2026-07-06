// src/components/shared/JobDetailModal.jsx
import { X, FileText } from 'lucide-react';
import { NAVY } from '../../pages/admin/constants';

export default function JobDetailModal({ job, onClose }) {
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
    if (Array.isArray(value)) return value.filter(item => item && item.trim() !== '');
    if (typeof value === 'string') {
      return value.split(',').map(item => item.trim()).filter(Boolean);
    }
    return [];
  };

  const documentsList = parseList(job.requiredDocument || job.documentsRequired);

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
          {job.companyName || job.employerId || job.employerID} &bull; {job.location || 'Location not specified'}
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