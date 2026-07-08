// src/pages/admin/views/JobReviewsView.jsx
import { useMemo, useState } from 'react';
import { ArrowLeft, Clock, AlertTriangle, Filter, Info } from 'lucide-react';
import DOMPurify from 'dompurify';
import { NAVY, GOLD, BG_GRAY } from '../constants';

// Helper: Extract documents from job (handles both string and array formats)
function getRequiredDocuments(job = {}) {
  let docs = [];

  if (Array.isArray(job.requiredDocuments) && job.requiredDocuments.length > 0) {
    docs = job.requiredDocuments;
  } else if (Array.isArray(job.documentsRequired) && job.documentsRequired.length > 0) {
    docs = job.documentsRequired;
  } else if (Array.isArray(job.docs) && job.docs.length > 0) {
    docs = job.docs;
  } else if (typeof job.requiredDocument === 'string' && job.requiredDocument.trim()) {
    docs = job.requiredDocument.split(',').map(d => d.trim()).filter(Boolean);
  }

  return docs;
}

// Helper: Format document label (just the label, no format suffix)
function formatDocumentLabel(document) {
  if (typeof document === 'string') {
    return document;
  }

  if (!document) {
    return 'Document';
  }

  return document.label || document.name || 'Document';
}

// Helper: Parse text into list items (splits on periods or newlines)
function parseList(value) {
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
    const items = value
      .split(/(?:\.\s+|\n)/)
      .map(item => item.trim())
      .filter(item => item && item.length > 0);
    if (items.length > 1) return items;
    return [value.trim()];
  }
  return [];
}

// Helper: Render content (detects HTML, else uses parseList)
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

  const items = parseList(str);
  if (items.length === 0) return <p style={{ color: '#475569', lineHeight: 1.7, fontSize: 15, marginBottom: 24 }}>{str}</p>;
  if (items.length === 1) return <p style={{ color: '#475569', lineHeight: 1.7, fontSize: 15, marginBottom: 24 }}>{items[0]}</p>;

  return (
    <ul style={{ margin: 0, paddingLeft: 20, color: '#475569', fontSize: 15, lineHeight: 1.8 }}>
      {items.map((item, idx) => (
        <li key={idx}>{item}</li>
      ))}
    </ul>
  );
}

// Helper: Check if job is expired
function isJobExpired(job) {
  if (!job.deadline) return false;
  const deadline = typeof job.deadline.toDate === 'function' ? job.deadline.toDate() : new Date(job.deadline);
  return deadline < new Date();
}

// Helper: Get days left for a job
function getDaysLeft(job) {
  if (!job.deadline) return null;
  const deadline = typeof job.deadline.toDate === 'function' ? job.deadline.toDate() : new Date(job.deadline);
  const now = new Date();
  return Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
}

// Helper: Get days waiting (since creation)
function getDaysWaiting(job) {
  const created = job.createdAt?.toDate?.() || new Date(job.createdAt);
  const now = new Date();
  return Math.ceil((now - created) / (1000 * 60 * 60 * 24));
}

// Helper: Check if job was returned for edits
function isReturnedForEdits(job) {
  return job.pendingReason === 'unpublished' || job.pendingReason === 'edits_requested';
}

// ─── NEW: Helper to safely get timestamp ──────────────────────────────
function getTimestamp(value) {
  if (!value) return null;
  if (typeof value.toDate === 'function') {
    return value.toDate().getTime();
  }
  if (value instanceof Date) {
    return value.getTime();
  }
  if (typeof value === 'number') {
    return value;
  }
  return null;
}

// ─── NEW: Helper to check if job was edited after admin request ──────
function isEditedAfterRequest(job) {
  if (!job.editsRequestedAt) return false;
  const requestedTime = getTimestamp(job.editsRequestedAt);
  const updatedTime = getTimestamp(job.updatedAt);
  if (requestedTime === null || updatedTime === null) return false;
  return updatedTime > requestedTime;
}

// Sorting functions
function sortByNewest(data) {
  return [...data].sort((a, b) => {
    const aTime = a.createdAt?.toDate?.()?.getTime() || new Date(a.createdAt).getTime() || 0;
    const bTime = b.createdAt?.toDate?.()?.getTime() || new Date(b.createdAt).getTime() || 0;
    return bTime - aTime;
  });
}

function sortByPriority(data) {
  const now = new Date();
  return [...data].sort((a, b) => {
    const aDeadline = a.deadline?.toDate?.() || new Date(a.deadline);
    const bDeadline = b.deadline?.toDate?.() || new Date(b.deadline);
    const aDaysLeft = Math.ceil((aDeadline - now) / (1000 * 60 * 60 * 24));
    const bDaysLeft = Math.ceil((bDeadline - now) / (1000 * 60 * 60 * 24));
    const aCreated = a.createdAt?.toDate?.() || new Date(a.createdAt);
    const bCreated = b.createdAt?.toDate?.() || new Date(b.createdAt);
    const aDaysWaiting = Math.ceil((now - aCreated) / (1000 * 60 * 60 * 24));
    const bDaysWaiting = Math.ceil((now - bCreated) / (1000 * 60 * 60 * 24));

    const aWaiting = aDaysWaiting >= 14;
    const bWaiting = bDaysWaiting >= 14;
    if (aWaiting && !bWaiting) return -1;
    if (!aWaiting && bWaiting) return 1;

    const aUrgent = aDaysLeft <= 7 && aDaysLeft > 0;
    const bUrgent = bDaysLeft <= 7 && bDaysLeft > 0;
    if (aUrgent && !bUrgent) return -1;
    if (!aUrgent && bUrgent) return 1;

    if (aDaysLeft <= 0 && bDaysLeft > 0) return -1;
    if (aDaysLeft > 0 && bDaysLeft <= 0) return 1;

    return bCreated - aCreated;
  });
}

// Job Review Details Component
export function JobReviewDetails({ selectedJob, triggerModal, onBack, clearSelection, onRefresh }) {
  const docs = getRequiredDocuments(selectedJob);
  const returnedForEdits = isReturnedForEdits(selectedJob);
  const editedAfterRequest = isEditedAfterRequest(selectedJob);
  const [editReasonOpen, setEditReasonOpen] = useState(false);
  const [editReason, setEditReason] = useState(selectedJob.editRequestReason || '');
  const [editReasonError, setEditReasonError] = useState('');

  const [rejectReasonOpen, setRejectReasonOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectReasonError, setRejectReasonError] = useState('');

  const handleModalAction = (title, message, type, actionData) => {
    const wrappedActionData = {
      ...actionData,
      onComplete: () => {
        if (actionData.clearSelection) {
          actionData.clearSelection();
        }
        if (onRefresh) {
          onRefresh();
        }
      }
    };
    triggerModal(title, message, type, wrappedActionData);
  };
  const closeDetails = clearSelection || (() => {});

  const submitEditReason = () => {
    const reason = editReason.trim();

    if (!reason) {
      setEditReasonError('Please enter the reason the employer needs to address.');
      return;
    }

    setEditReasonOpen(false);
    setEditReasonError('');
    handleModalAction(
      'Request Edits',
      `Request changes for "${selectedJob.title}"? The employer will be notified with your reason.`,
      'warning',
      {
        view: 'job',
        id: selectedJob.id,
        type: 'request_edits',
        editRequestReason: reason,
        clearSelection: closeDetails,
      }
    );
  };

  const submitRejectReason = () => {
    const reason = rejectReason.trim();

    if (!reason) {
      setRejectReasonError('Please enter a reason for rejecting this job.');
      return;
    }

    setRejectReasonOpen(false);
    setRejectReasonError('');
    handleModalAction(
      'Reject Listing',
      `Reject "${selectedJob.title}"? This action is permanent and the job will be moved to rejected.`,
      'danger',
      {
        view: 'job',
        id: selectedJob.id,
        type: 'reject',
        rejectReason: reason,
        clearSelection: closeDetails,
      }
    );
  };

  return (
    <div style={{ maxWidth: '1000px' }}>
      {onBack && (
        <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#64748b', fontSize: 14, cursor: 'pointer', marginBottom: 24 }}>
          <ArrowLeft size={16} /> Back to Job Reviews
        </button>
      )}
      <div style={{ background: 'white', borderRadius: 16, padding: 32, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
        <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: 24, marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <h1 style={{ margin: '0 0 8px 0', color: NAVY, fontSize: 28, fontWeight: 800 }}>{selectedJob.title}</h1>
            {returnedForEdits && (
              <span style={{ background: '#fef3c7', color: '#d97706', padding: '4px 12px', borderRadius: '20px', fontSize: 13, fontWeight: 700, marginBottom: 8 }}>
                Returned for edits
              </span>
            )}
            {editedAfterRequest && (
              <span style={{
                background: '#dbeafe',
                color: '#1e3a8a',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: 13,
                fontWeight: 700,
                border: '1px solid #bfdbfe',
                marginLeft: 4,
              }}>
                ✏️ Edited after admin request
              </span>
            )}
          </div>
          <p style={{ margin: 0, color: '#64748b', fontSize: 16 }}>
            {selectedJob.companyName || selectedJob.employerId || selectedJob.employerID || 'Company'} &bull;{' '}
            {selectedJob.location || selectedJob.workMode || 'Location not specified'}
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 40 }}>
          <div>
            <h3 style={{ color: NAVY, fontSize: 16, fontWeight: 700, marginBottom: 12 }}>
              {selectedJob.about ? 'About the Role' : 'Description'}
            </h3>
            {(() => {
              const content = selectedJob.about || selectedJob.description;
              return content ? renderContent(content) : (
                <p style={{ color: '#94a3b8', fontSize: 15, marginBottom: 24 }}>No description provided.</p>
              );
            })()}

            <h3 style={{ color: NAVY, fontSize: 16, fontWeight: 700, marginBottom: 12, marginTop: 24 }}>Responsibilities</h3>
            {(() => {
              const content = selectedJob.responsibilities;
              return content ? renderContent(content) : (
                <p style={{ color: '#94a3b8', fontSize: 15, marginBottom: 24 }}>No specific responsibilities listed.</p>
              );
            })()}

            <h3 style={{ color: NAVY, fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Requirements</h3>
            {(() => {
              const content = selectedJob.requirement || selectedJob.requirements;
              return content ? renderContent(content) : (
                <p style={{ color: '#94a3b8', fontSize: 15 }}>No specific requirements listed.</p>
              );
            })()}
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
                <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: NAVY }}>{selectedJob.duration || 'Not specified'}</p>
              </div>
              <div>
                <p style={{ margin: '0 0 4px 0', fontSize: 12, fontWeight: 700, color: '#94a3b8' }}>OPEN POSITIONS</p>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: NAVY }}>{selectedJob.positions || 'Not specified'}</p>
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
              if (returnedForEdits) {
                handleModalAction(
                  'Unrequest Edits',
                  `Remove the "Returned for edits" status for "${selectedJob.title}"? The job will become a normal pending review.`,
                  'warning',
                  {
                    view: 'job',
                    id: selectedJob.id,
                    type: 'unrequest_edits',
                    clearSelection: closeDetails,
                  }
                );
                return;
              }

              setEditReason(selectedJob.editRequestReason || '');
              setEditReasonError('');
              setEditReasonOpen(true);
            }}
            style={{ padding: '12px 24px', borderRadius: 8, border: 'none', background: returnedForEdits ? '#e2e8f0' : '#fef3c7', color: returnedForEdits ? '#475569' : '#d97706', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
          >
            {returnedForEdits ? 'Unrequest Edits' : 'Request Edits'}
          </button>
          <button
            onClick={() => {
              setRejectReason('');
              setRejectReasonError('');
              setRejectReasonOpen(true);
            }}
            style={{ padding: '12px 24px', borderRadius: 8, border: 'none', background: '#fee2e2', color: '#dc2626', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
          >
            Reject
          </button>
          <button
            onClick={() => {
              handleModalAction('Approve & Publish', `Publish "${selectedJob.title}"? It will become active immediately.`, 'primary', {
                view: 'job',
                id: selectedJob.id,
                type: 'approve',
                job: selectedJob,
                clearSelection: closeDetails,
              });
            }}
            style={{ padding: '12px 24px', borderRadius: 8, border: 'none', background: GOLD, color: NAVY, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
          >
            Approve & Publish
          </button>
        </div>
      </div>
      {editReasonOpen && (
        <div
          role="presentation"
          onClick={() => setEditReasonOpen(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 2200, background: 'rgba(15, 23, 42, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-label="Request edit reason"
            onClick={(event) => event.stopPropagation()}
            style={{ width: 'min(520px, 100%)', background: '#ffffff', borderRadius: 12, borderTop: '4px solid #d97706', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', overflow: 'hidden' }}
          >
            <div style={{ padding: '24px 28px' }}>
              <h3 style={{ margin: '0 0 8px', color: NAVY, fontSize: 18, fontWeight: 800 }}>Reason for requested edits</h3>
              <p style={{ margin: '0 0 16px', color: '#64748b', fontSize: 14, lineHeight: 1.6 }}>
                This reason will be saved on the job and shown to the employer in their notification and job list.
              </p>
              <textarea
                value={editReason}
                onChange={(event) => setEditReason(event.target.value)}
                rows={5}
                placeholder="Example: Please clarify the responsibilities and add the expected salary range."
                style={{ width: '100%', border: '1px solid #cbd5e1', borderRadius: 8, padding: 12, fontSize: 14, color: '#1e293b', resize: 'vertical', outline: 'none', fontFamily: 'inherit' }}
              />
              {editReasonError && <p style={{ margin: '8px 0 0', color: '#dc2626', fontSize: 12, fontWeight: 700 }}>{editReasonError}</p>}
            </div>
            <div style={{ padding: '16px 28px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button type="button" onClick={() => setEditReasonOpen(false)} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #cbd5e1', background: '#ffffff', color: '#475569', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                Cancel
              </button>
              <button type="button" onClick={submitEditReason} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: NAVY, color: '#ffffff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                Continue
              </button>
            </div>
          </section>
        </div>
      )}

      {rejectReasonOpen && (
        <div
          role="presentation"
          onClick={() => setRejectReasonOpen(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 2200, background: 'rgba(15, 23, 42, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-label="Reject job reason"
            onClick={(event) => event.stopPropagation()}
            style={{ width: 'min(520px, 100%)', background: '#ffffff', borderRadius: 12, borderTop: '4px solid #dc2626', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', overflow: 'hidden' }}
          >
            <div style={{ padding: '24px 28px' }}>
              <h3 style={{ margin: '0 0 8px', color: NAVY, fontSize: 18, fontWeight: 800 }}>Reason for rejection</h3>
              <p style={{ margin: '0 0 16px', color: '#64748b', fontSize: 14, lineHeight: 1.6 }}>
                Please provide a reason for rejecting this job. The employer will be notified.
              </p>
              <textarea
                value={rejectReason}
                onChange={(event) => setRejectReason(event.target.value)}
                rows={5}
                placeholder="Example: The job description lacks sufficient detail, and the salary range is not specified."
                style={{ width: '100%', border: '1px solid #cbd5e1', borderRadius: 8, padding: 12, fontSize: 14, color: '#1e293b', resize: 'vertical', outline: 'none', fontFamily: 'inherit' }}
              />
              {rejectReasonError && <p style={{ margin: '8px 0 0', color: '#dc2626', fontSize: 12, fontWeight: 700 }}>{rejectReasonError}</p>}
            </div>
            <div style={{ padding: '16px 28px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button type="button" onClick={() => setRejectReasonOpen(false)} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #cbd5e1', background: '#ffffff', color: '#475569', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                Cancel
              </button>
              <button type="button" onClick={submitRejectReason} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: '#dc2626', color: '#ffffff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                Confirm Rejection
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

// ─── MAIN COMPONENT ─────────────────────────────────────────────────────────

export default function JobReviewsView({ queueData, triggerModal, onRefresh, focusedJobId }) {
  const [selectedJobOverride, setSelectedJobOverride] = useState(null);
  const [dismissedFocusedJobId, setDismissedFocusedJobId] = useState('');
  const [sortMode, setSortMode] = useState('newest');
  const [filterMode, setFilterMode] = useState('all');

  const focusedJob = useMemo(
    () => queueData.find((job) => job.id === focusedJobId) || null,
    [focusedJobId, queueData]
  );

  const selectedJob = selectedJobOverride || (focusedJobId !== dismissedFocusedJobId ? focusedJob : null);

  const handleSelectJob = (job) => {
    setSelectedJobOverride(job);
    setDismissedFocusedJobId('');
  };

  const clearSelection = () => {
    setSelectedJobOverride(null);
  };

  // Filter out expired jobs – they belong in Expired Jobs view
  const activePendingJobs = queueData.filter(job => !isJobExpired(job));

  // Apply filters
  const filteredJobs = useMemo(() => {
    let filtered = [...activePendingJobs];

    if (filterMode === 'approaching') {
      filtered = filtered.filter(job => {
        const daysLeft = getDaysLeft(job);
        return daysLeft !== null && daysLeft <= 7 && daysLeft > 0;
      });
    } else if (filterMode === 'waiting') {
      filtered = filtered.filter(job => {
        const daysWaiting = getDaysWaiting(job);
        return daysWaiting >= 14;
      });
    }
    return filtered;
  }, [activePendingJobs, filterMode]);

  // Sort
  const sortedQueue = useMemo(() => {
    if (sortMode === 'priority') {
      return sortByPriority(filteredJobs);
    }
    return sortByNewest(filteredJobs);
  }, [filteredJobs, sortMode]);

  if (selectedJob) {
    return (
      <JobReviewDetails
        selectedJob={selectedJob}
        triggerModal={triggerModal}
        onBack={() => {
          setSelectedJobOverride(null);
          setDismissedFocusedJobId(focusedJobId || '');
        }}
        clearSelection={clearSelection}
        onRefresh={onRefresh}
      />
    );
  }

  return (
    <div style={{ maxWidth: '1200px' }}>
      <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ margin: '0 0 8px 0', fontSize: 24, fontWeight: 800, color: NAVY }}>Job Reviews</h1>
          <p style={{ margin: 0, fontSize: 14, color: '#64748b' }}>Review employer listings before publishing to the active opportunities feed.</p>
          <p style={{ margin: '8px 0 0 0', fontSize: 13, color: '#94a3b8' }}>
            {sortedQueue.length} pending job{sortedQueue.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10, width: '100%' }}>
          {/* ─── COLORFUL EXPLANATION BADGE ─────────────────────────────── */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '8px 16px',
              background: '#f0f4ff',
              borderRadius: '8px',
              border: '1px solid #dbeafe',
              fontSize: 12,
              color: '#475569',
              flexWrap: 'wrap',
              justifyContent: 'flex-end',
              width: '100%',
            }}
          >
            <Info size={14} color="#3b82f6" style={{ flexShrink: 0 }} />
            <span style={{ fontWeight: 600, color: '#1e293b' }}>How to use:</span>
            <span style={{ color: '#64748b' }}>
              <span style={{ color: '#dc2626', fontWeight: 600 }}>🔴 Red</span> = Waiting &gt;14 days (urgent review needed)
            </span>
            <span style={{ color: '#cbd5e1' }}>|</span>
            <span style={{ color: '#64748b' }}>
              <span style={{ color: '#d97706', fontWeight: 600 }}>🟠 Orange</span> = Approaching deadline (≤7 days left)
            </span>
            <span style={{ color: '#cbd5e1' }}>|</span>
            <span style={{ color: '#64748b' }}>
              <span style={{ color: '#1B3A6B', fontWeight: 600 }}>🔵 Blue</span> = Normal pending review
            </span>
          </div>

          {/* ─── FILTER & SORT CONTROLS ────────────────────────────────── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', justifyContent: 'flex-end', width: '100%' }}>
            {/* Filters */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Filter size={16} color="#94a3b8" />
              <span style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>Filter:</span>
              <button
                onClick={() => setFilterMode('all')}
                style={{
                  padding: '4px 12px',
                  borderRadius: '6px',
                  border: filterMode === 'all' ? '2px solid #1B3A6B' : '1px solid #e2e8f0',
                  background: filterMode === 'all' ? '#eef3ff' : 'white',
                  color: filterMode === 'all' ? '#1B3A6B' : '#64748b',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                All
              </button>
              <button
                onClick={() => setFilterMode('approaching')}
                style={{
                  padding: '4px 12px',
                  borderRadius: '6px',
                  border: filterMode === 'approaching' ? '2px solid #f59e0b' : '1px solid #e2e8f0',
                  background: filterMode === 'approaching' ? '#fffbeb' : 'white',
                  color: filterMode === 'approaching' ? '#d97706' : '#64748b',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Approaching (≤7 days)
              </button>
              <button
                onClick={() => setFilterMode('waiting')}
                style={{
                  padding: '4px 12px',
                  borderRadius: '6px',
                  border: filterMode === 'waiting' ? '2px solid #dc2626' : '1px solid #e2e8f0',
                  background: filterMode === 'waiting' ? '#fef2f2' : 'white',
                  color: filterMode === 'waiting' ? '#dc2626' : '#64748b',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Waiting {'>'}14 days
              </button>
            </div>

            {/* Sort */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>Sort:</span>
              <button
                onClick={() => setSortMode('newest')}
                style={{
                  padding: '4px 12px',
                  borderRadius: '6px',
                  border: sortMode === 'newest' ? '2px solid #1B3A6B' : '1px solid #e2e8f0',
                  background: sortMode === 'newest' ? '#eef3ff' : 'white',
                  color: sortMode === 'newest' ? '#1B3A6B' : '#64748b',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Newest First
              </button>
              <button
                onClick={() => setSortMode('priority')}
                style={{
                  padding: '4px 12px',
                  borderRadius: '6px',
                  border: sortMode === 'priority' ? '2px solid #dc2626' : '1px solid #e2e8f0',
                  background: sortMode === 'priority' ? '#fef2f2' : 'white',
                  color: sortMode === 'priority' ? '#dc2626' : '#64748b',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Priority (Deadline/Review)
              </button>
            </div>
          </div>
        </div>
      </div>

      {sortedQueue.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px', background: 'white', borderRadius: 12, color: '#94a3b8' }}>
          {filterMode !== 'all'
            ? `No jobs match the "${filterMode === 'approaching' ? 'Approaching Deadline' : 'Waiting >14 days'}" filter.`
            : 'All caught up! No pending jobs to review. All jobs have been processed or moved to expired.'}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {sortedQueue.map(job => {
            const docs = getRequiredDocuments(job);
            const returnedForEdits = isReturnedForEdits(job);
            const editedAfterRequest = isEditedAfterRequest(job);
            const daysLeft = getDaysLeft(job);
            const daysWaiting = getDaysWaiting(job);
            const isApproaching = daysLeft !== null && daysLeft <= 7 && daysLeft > 0;
            const isWaitingLong = daysWaiting >= 14;

            let cardBorderColor = '#e2e8f0';
            let cardShadow = '0 1px 3px rgba(0,0,0,0.05)';
            if (isWaitingLong) {
              cardBorderColor = '#dc2626';
              cardShadow = '0 4px 16px rgba(220, 38, 38, 0.15)';
            } else if (isApproaching) {
              cardBorderColor = '#f59e0b';
              cardShadow = '0 4px 16px rgba(245, 158, 11, 0.12)';
            }

            return (
              <div
                key={job.id}
                onClick={() => handleSelectJob(job)}
                style={{
                  background: 'white',
                  borderRadius: 12,
                  padding: '24px 32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  border: `1.5px solid ${cardBorderColor}`,
                  boxShadow: cardShadow,
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = cardShadow;
                }}
              >
                <div style={{ flex: 1, paddingRight: 24 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <h3 style={{ margin: '0 0 6px 0', fontSize: 16, fontWeight: 700, color: NAVY }}>{job.title}</h3>
                    {returnedForEdits && (
                      <span style={{
                        background: '#fef3c7',
                        color: '#d97706',
                        padding: '2px 10px',
                        borderRadius: '12px',
                        fontSize: 11,
                        fontWeight: 700,
                        marginBottom: 4,
                      }}>
                        Returned for edits
                      </span>
                    )}
                    {editedAfterRequest && (
                      <span style={{
                        background: '#dbeafe',
                        color: '#1e3a8a',
                        padding: '2px 10px',
                        borderRadius: '12px',
                        fontSize: 11,
                        fontWeight: 700,
                        border: '1px solid #bfdbfe',
                        marginBottom: 4,
                      }}>
                        ✏️ Edited after admin request
                      </span>
                    )}
                    {isWaitingLong && (
                      <span style={{
                        background: '#fef2f2',
                        color: '#dc2626',
                        padding: '2px 10px',
                        borderRadius: '12px',
                        fontSize: 11,
                        fontWeight: 700,
                        marginBottom: 4,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                      }}>
                        <AlertTriangle size={12} /> Waiting {daysWaiting} days
                      </span>
                    )}
                    {isApproaching && !isWaitingLong && (
                      <span style={{
                        background: '#fef3c7',
                        color: '#d97706',
                        padding: '2px 10px',
                        borderRadius: '12px',
                        fontSize: 11,
                        fontWeight: 700,
                        marginBottom: 4,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                      }}>
                        <Clock size={12} /> {daysLeft} days left
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 14, color: '#64748b', marginBottom: 12 }}>{job.companyName || job.employerId || job.employerID}</div>
                  <div style={{ display: 'flex', gap: 24, fontSize: 13, color: '#94a3b8', flexWrap: 'wrap' }}>
                    <span>Application Deadline: <span style={{ fontWeight: 700, color: '#334155' }}>{job.deadline?.toDate?.()?.toDateString() || 'N/A'}</span></span>
                    <span>Created: <span style={{ fontWeight: 700, color: '#334155' }}>{job.createdAt?.toDate?.()?.toDateString() || 'N/A'}</span></span>
                    <span>Days in Review: <span style={{ fontWeight: 700, color: isWaitingLong ? '#dc2626' : '#334155' }}>{daysWaiting}</span></span>
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
