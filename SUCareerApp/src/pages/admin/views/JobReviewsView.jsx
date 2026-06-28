import { useMemo, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { NAVY, GOLD, BG_GRAY } from '../constants';

// ─── Helper: Extract documents from job (handles both array and comma‑separated string) ──
function getRequiredDocuments(job = {}) {
  let docs = [];

  // If it's already an array
  if (Array.isArray(job.requiredDocuments) && job.requiredDocuments.length > 0) {
    docs = job.requiredDocuments;
  } else if (Array.isArray(job.documentsRequired) && job.documentsRequired.length > 0) {
    docs = job.documentsRequired;
  } else if (Array.isArray(job.docs) && job.docs.length > 0) {
    docs = job.docs;
  } else if (typeof job.requiredDocument === 'string' && job.requiredDocument.trim()) {
    // Split by commas
    docs = job.requiredDocument.split(',').map(d => d.trim()).filter(Boolean);
  }

  return docs;
}

function formatDocumentLabel(document) {
  if (typeof document === 'string') {
    return document;
  }

  if (!document) {
    return 'Document';
  }

  const label = document.label || document.name || 'Document';
  return document.format && document.format !== 'any'
    ? `${label} (${document.formatLabel || document.format})`
    : label;
}

// ─── Helper: Parse requirements (comma‑separated string → array) ──
function getRequirements(job = {}) {
  if (Array.isArray(job.requirements) && job.requirements.length > 0) {
    return job.requirements;
  }
  if (typeof job.requirement === 'string' && job.requirement.trim()) {
    return job.requirement.split(',').map(r => r.trim()).filter(Boolean);
  }
  return [];
}

export function JobReviewDetails({ selectedJob, triggerModal, onBack, clearSelection }) {
  const docs = getRequiredDocuments(selectedJob);
  const reqs = getRequirements(selectedJob);

  return (
    <div style={{ maxWidth: '1000px' }}>
      {onBack && (
        <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#64748b', fontSize: 14, cursor: 'pointer', marginBottom: 24 }}>
          <ArrowLeft size={16} /> Back to Job Reviews
        </button>
      )}
      <div style={{ background: 'white', borderRadius: 16, padding: 32, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
        <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: 24, marginBottom: 24 }}>
          <h1 style={{ margin: '0 0 8px 0', color: NAVY, fontSize: 28, fontWeight: 800 }}>{selectedJob.title}</h1>
          <p style={{ margin: 0, color: '#64748b', fontSize: 16 }}>
            {selectedJob.companyName || selectedJob.employerId || selectedJob.employerID || 'Company'} &bull; 
            {selectedJob.location || selectedJob.workMode || 'Location not specified'}
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 40 }}>
          <div>
            <h3 style={{ color: NAVY, fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Job Description</h3>
            <p style={{ color: '#475569', lineHeight: 1.7, fontSize: 15, marginBottom: 24 }}>
              {selectedJob.description || 'No description provided.'}
            </p>

            <h3 style={{ color: NAVY, fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Requirements</h3>
            {reqs.length > 0 ? (
              <ul style={{ margin: 0, paddingLeft: 20, color: '#475569', fontSize: 15, lineHeight: 1.8 }}>
                {reqs.map((req, idx) => <li key={idx}>{req}</li>)}
              </ul>
            ) : (
              <p style={{ color: '#94a3b8', fontSize: 15 }}>No specific requirements listed.</p>
            )}
          </div>

          <div>
            <div style={{ background: BG_GRAY, borderRadius: 12, padding: 24, marginBottom: 24 }}>
              <h3 style={{ color: NAVY, fontSize: 14, fontWeight: 700, margin: '0 0 16px 0', textTransform: 'uppercase' }}>Role Details</h3>
              <div style={{ marginBottom: 12 }}>
                <p style={{ margin: '0 0 4px 0', fontSize: 12, fontWeight: 700, color: '#94a3b8' }}>APPLICATION DEADLINE</p>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: NAVY }}>
                  {selectedJob.deadline?.toDate?.()?.toDateString() || 'Not specified'}
                </p>
              </div>
              <div style={{ marginBottom: 12 }}>
                <p style={{ margin: '0 0 4px 0', fontSize: 12, fontWeight: 700, color: '#94a3b8' }}>DURATION</p>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: NAVY }}>
                  {selectedJob.duration || 'Not specified'}
                </p>
              </div>
              <div>
                <p style={{ margin: '0 0 4px 0', fontSize: 12, fontWeight: 700, color: '#94a3b8' }}>OPEN POSITIONS</p>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: NAVY }}>
                  {selectedJob.positions || 'Not specified'}
                </p>
              </div>
            </div>

            <div>
              <h3 style={{ color: NAVY, fontSize: 14, fontWeight: 700, margin: '0 0 12px 0', textTransform: 'uppercase' }}>Documents Required</h3>
              {docs.length > 0 ? (
                <ul style={{ margin: 0, paddingLeft: 20, color: '#475569', fontSize: 14, lineHeight: 1.8 }}>
                  {docs.map((doc, idx) => <li key={idx}>{formatDocumentLabel(doc)}</li>)}
                </ul>
              ) : (
                <p style={{ color: '#94a3b8', fontSize: 14 }}>No documents specified.</p>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 16, borderTop: '1px solid #e2e8f0', paddingTop: 24, marginTop: 32 }}>
          <button
            onClick={() => {
              triggerModal('Reject Listing', `Reject "${selectedJob.title}"?`, 'danger', {
                view: 'job',
                id: selectedJob.id,
                type: 'reject',
                clearSelection,
              });
            }}
            style={{ padding: '12px 24px', borderRadius: 8, border: 'none', background: '#fee2e2', color: '#dc2626', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
          >
            Reject / Request Edits
          </button>
          <button
            onClick={() => {
              triggerModal('Approve & Publish', `Publish "${selectedJob.title}"?`, 'primary', {
                view: 'job',
                id: selectedJob.id,
                type: 'approve',
                job: selectedJob,
                clearSelection,
              });
            }}
            style={{ padding: '12px 24px', borderRadius: 8, border: 'none', background: GOLD, color: NAVY, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
          >
            Approve & Publish
          </button>
        </div>
      </div>
    </div>
  );
}

export default function JobReviewsView({ queueData, triggerModal, focusedJobId }) {
  const [selectedJobOverride, setSelectedJobOverride] = useState(null);
  const [dismissedFocusedJobId, setDismissedFocusedJobId] = useState('');
  const focusedJob = useMemo(
    () => queueData.find((job) => job.id === focusedJobId) || null,
    [focusedJobId, queueData]
  );
  const selectedJob = selectedJobOverride || (focusedJobId !== dismissedFocusedJobId ? focusedJob : null);

  if (selectedJob) {
    return (
      <JobReviewDetails
        selectedJob={selectedJob}
        triggerModal={triggerModal}
        onBack={() => {
          setSelectedJobOverride(null);
          setDismissedFocusedJobId(focusedJobId || '');
        }}
        clearSelection={() => setSelectedJobOverride(null)}
      />
    );
  }

  // ─── LIST VIEW ──────────────────────────────────────────────────────
  return (
    <div style={{ maxWidth: '1200px' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ margin: '0 0 8px 0', fontSize: 24, fontWeight: 800, color: NAVY }}>Job Reviews</h1>
        <p style={{ margin: 0, fontSize: 14, color: '#64748b' }}>Review employer listings before publishing to the active opportunities feed.</p>
      </div>

      {queueData.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px', background: 'white', borderRadius: 12, color: '#94a3b8' }}>All caught up! No pending jobs to review.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {queueData.map(job => {
            const docs = getRequiredDocuments(job);
            return (
              <div
                key={job.id}
                onClick={() => {
                  setSelectedJobOverride(job);
                  setDismissedFocusedJobId('');
                }}
                style={{ background: 'white', borderRadius: 12, padding: '24px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)'; }}
              >
                <div style={{ flex: 1, paddingRight: 24 }}>
                  <h3 style={{ margin: '0 0 6px 0', fontSize: 16, fontWeight: 700, color: NAVY }}>{job.title}</h3>
                  <div style={{ fontSize: 14, color: '#64748b', marginBottom: 12 }}>{job.companyName || job.employerId || job.employerID}</div>
                  <div style={{ fontSize: 13, color: '#94a3b8' }}>
                    Application Deadline: <span style={{ fontWeight: 700, color: '#334155' }}>{job.deadline?.toDate?.()?.toDateString() || 'N/A'}</span>
                  </div>
                </div>

                <div style={{ flex: 1, padding: '0 24px' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', marginBottom: 8, letterSpacing: '0.5px', textTransform: 'uppercase' }}>Required Documents</div>
                  <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: 8 }}>
                    {docs.length > 0 ? (
                      docs.map((doc, idx) => <div key={idx} style={{ fontSize: 13, color: '#64748b', marginBottom: 4 }}>- {formatDocumentLabel(doc)}</div>)
                    ) : (
                      <div style={{ fontSize: 13, color: '#94a3b8' }}>No documents specified</div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', paddingLeft: 24 }}>
                  <span style={{ color: GOLD, fontSize: 14, fontWeight: 700 }}>Review Details &rarr;</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
