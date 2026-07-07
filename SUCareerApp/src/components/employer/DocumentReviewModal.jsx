// src/components/employer/DocumentReviewModal.jsx
import { useState } from 'react';
import { X, File, FileText, FileImage, FileArchive, Download, Mail, Calendar as CalendarIcon, CheckCircle, XCircle, Clock, Info, AlertTriangle, Lock } from 'lucide-react';
import { NAVY } from '../../pages/employer/constants';

// Helper: Get file icon based on file type
function getFileIcon(filename) {
  if (!filename) return <File size={16} />;
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  if (['pdf'].includes(ext)) return <FileText size={16} color="#dc2626" />;
  if (['doc', 'docx'].includes(ext)) return <FileText size={16} color="#2563eb" />;
  if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext)) return <FileImage size={16} color="#16a34a" />;
  if (['zip', 'rar', '7z'].includes(ext)) return <FileArchive size={16} color="#d97706" />;
  return <File size={16} color="#64748b" />;
}

// Helper: Format file size
function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '';
  const kb = bytes / 1024;
  if (kb < 1024) return `${Math.round(kb)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(1)} MB`;
}

// Helper: Format date
function formatDate(dateValue) {
  if (!dateValue) return 'N/A';
  if (typeof dateValue.toDate === 'function') {
    return dateValue.toDate().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }
  return new Date(dateValue).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

// Confirmation Modal with Permanent Action Checkbox
function ConfirmationModal({ isOpen, onClose, onConfirm, title, message, confirmLabel, confirmColor, isPermanent = false }) {
  const [confirmed, setConfirmed] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (isPermanent && !confirmed) return;
    onConfirm();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 3000,
        backdropFilter: 'blur(2px)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          maxWidth: '440px',
          width: '100%',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          {isPermanent && <AlertTriangle size={20} color="#dc2626" />}
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: NAVY }}>{title}</h3>
        </div>
        <p style={{ margin: '0 0 12px 0', fontSize: 14, color: '#475569', lineHeight: 1.6 }}>{message}</p>

        {isPermanent && (
          <>
            <div
              style={{
                padding: '10px 12px',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '6px',
                marginBottom: 12,
              }}
            >
              <p style={{ margin: 0, fontSize: 12, color: '#dc2626', fontWeight: 700 }}>
                ⚠️ This action is PERMANENT and cannot be undone.
              </p>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#475569', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                style={{ width: 16, height: 16, cursor: 'pointer' }}
              />
              I understand this action is permanent and cannot be undone.
            </label>
          </>
        )}

        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 16 }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 20px',
              borderRadius: '6px',
              border: '1px solid #e2e8f0',
              background: 'white',
              color: '#64748b',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            style={{
              padding: '8px 20px',
              borderRadius: '6px',
              border: 'none',
              background: isPermanent && !confirmed ? '#94a3b8' : (confirmColor || NAVY),
              color: '#ffffff',
              fontSize: 13,
              fontWeight: 700,
              cursor: isPermanent && !confirmed ? 'not-allowed' : 'pointer',
              opacity: isPermanent && !confirmed ? 0.6 : 1,
            }}
            disabled={isPermanent && !confirmed}
          >
            {confirmLabel || 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DocumentReviewModal({ applicant, onClose, onSave }) {
  const [tempStatus, setTempStatus] = useState(applicant.status || 'submitted');
  const [isSaving, setIsSaving] = useState(false);
  const [confirmation, setConfirmation] = useState(null);
  const [statusMessage, setStatusMessage] = useState(null);

  // Get documents from applicant object
  const docs = applicant.docs || applicant.documents || applicant.requiredDocuments || [];

  // Get applicant details
  const applicantName = applicant.name || applicant.fullName || 'Unknown Applicant';
  const applicantEmail = applicant.email || applicant.contactEmail || 'No email provided';
  const applicantCourse = applicant.course || applicant.studyField || 'Course not specified';
  const appliedDate = applicant.appliedAt || applicant.appliedDate || applicant.createdAt || null;

  // Check if the original status is final
  const originalStatus = applicant.status || 'submitted';
  const isFinalStatus = ['shortlisted', 'rejected'].includes(originalStatus);

  // Handle status change with confirmation
  const handleStatusChange = (newStatus) => {
    // If already final, do nothing
    if (isFinalStatus) return;

    setStatusMessage(null);
    // Only show confirmation for shortlist and reject
    if (newStatus === 'shortlisted' || newStatus === 'rejected') {
      const configs = {
        shortlisted: {
          title: 'Confirm Shortlist',
          message: `Are you sure you want to shortlist ${applicantName}? They will be notified of their progress.`,
          confirmLabel: 'Yes, Shortlist',
          confirmColor: '#16a34a',
          isPermanent: true,
        },
        rejected: {
          title: 'Confirm Rejection',
          message: `Are you sure you want to reject ${applicantName}? They will be notified and their application will be closed.`,
          confirmLabel: 'Yes, Reject',
          confirmColor: '#dc2626',
          isPermanent: true,
        },
      };
      const config = configs[newStatus];
      setConfirmation({
        ...config,
        onConfirm: () => {
          setTempStatus(newStatus);
          setConfirmation(null);
        },
      });
    } else {
      setTempStatus(newStatus);
    }
  };

  // Handle Save
  const handleSave = async () => {
    // If status is final, we should not allow saving (but button is disabled anyway)
    if (isFinalStatus) return;

    setIsSaving(true);
    setStatusMessage(null);

    try {
      await onSave(applicant.id, tempStatus);

      // Send email notification based on status
      if (tempStatus === 'shortlisted' || tempStatus === 'rejected') {
        console.log(`📧 Email notification triggered for ${applicantName}: ${tempStatus}`);
        // TODO: Call email service here
        // await sendStatusUpdateEmail(applicantEmail, applicantName, tempStatus, jobTitle);
      }

      onClose();
    } catch {
      setStatusMessage({
        type: 'error',
        text: 'Failed to update the application status. Please try again.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const styles = {
      submitted: { bg: '#fef3c7', color: '#d97706', label: 'Submitted', icon: Clock },
      shortlisted: { bg: '#dcfce7', color: '#16a34a', label: 'Shortlisted', icon: CheckCircle },
      rejected: { bg: '#fee2e2', color: '#dc2626', label: 'Rejected', icon: XCircle },
    };
    const s = styles[status] || styles.submitted;
    const Icon = s.icon;
    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        background: s.bg,
        color: s.color,
        padding: '4px 12px',
        borderRadius: '12px',
        fontSize: 12,
        fontWeight: 700,
      }}>
        <Icon size={12} /> {s.label}
      </span>
    );
  };

  // Determine if the current status is final (for display)
  // Note: we use isFinalStatus based on the original status.

  return (
    <>
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
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div
          style={{
            backgroundColor: '#ffffff',
            width: '100%',
            maxWidth: '560px',
            borderRadius: '12px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            maxHeight: '90vh',
          }}
        >
          {/* Header */}
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    backgroundColor: NAVY,
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 14,
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {applicantName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                </div>
                <div>
                  <h3 style={{ margin: '0 0 2px 0', fontSize: 18, fontWeight: 800, color: NAVY }}>
                    {applicantName}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>{applicantCourse}</span>
                    <span style={{ color: '#cbd5e1' }}>•</span>
                    <span style={{ fontSize: 12, color: '#94a3b8' }}>{getStatusBadge(tempStatus)}</span>
                    {isFinalStatus && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#dc2626', fontWeight: 700 }}>
                        <Lock size={12} /> Final
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                style={{
                  background: '#f1f5f9',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#64748b',
                  padding: '6px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Applicant Info */}
            <div style={{ display: 'flex', gap: 16, marginTop: 12, flexWrap: 'wrap', fontSize: 12, color: '#64748b' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Mail size={14} color="#94a3b8" />
                <span>{applicantEmail}</span>
              </div>
              {appliedDate && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <CalendarIcon size={14} color="#94a3b8" />
                  <span>Applied: {formatDate(appliedDate)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Documents */}
          <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
            {statusMessage && (
              <div style={{
                padding: '10px 12px',
                marginBottom: 12,
                background: statusMessage.type === 'error' ? '#fef2f2' : '#f0fdf4',
                border: `1px solid ${statusMessage.type === 'error' ? '#fecaca' : '#bbf7d0'}`,
                borderRadius: 8,
                color: statusMessage.type === 'error' ? '#b91c1c' : '#166534',
                fontSize: 13,
                fontWeight: 700,
              }}>
                {statusMessage.text}
              </div>
            )}
            <h4
              style={{
                margin: '0 0 12px 0',
                fontSize: 10,
                fontWeight: 700,
                color: '#94a3b8',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              Submitted Documents
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {docs.length === 0 && (
                <div
                  style={{
                    padding: '16px',
                    textAlign: 'center',
                    border: '1px dashed #e2e8f0',
                    borderRadius: '6px',
                    color: '#94a3b8',
                    fontSize: 13,
                  }}
                >
                  No documents attached to this application.
                </div>
              )}
              {docs.map((doc, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    transition: 'border-color 0.2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = NAVY)}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#e2e8f0')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div
                      style={{
                        padding: '6px',
                        backgroundColor: '#f1f5f9',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {getFileIcon(doc.name || doc.filename || doc.fileName)}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>
                        {doc.name || doc.filename || doc.fileName || `Document ${idx + 1}`}
                      </div>
                      <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
                        {formatFileSize(doc.size || doc.fileSize)}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const url = doc.url || doc.downloadUrl || doc.link || '#';
                      if (url && url !== '#') {
                        window.open(url, '_blank', 'noopener,noreferrer');
                      } else {
                        setStatusMessage({ type: 'error', text: 'No download link is available for this document.' });
                      }
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      padding: '6px 12px',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      color: NAVY,
                      fontSize: 12,
                      fontWeight: 600,
                      transition: 'background-color 0.2s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#e2e8f0')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                  >
                    <Download size={14} /> View
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              padding: '16px 24px',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              backgroundColor: '#f8fafc',
            }}
          >
            {isFinalStatus ? (
              // ─── LOCKED STATE ──────────────────────────────────────────
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 12px',
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '6px',
                  color: '#dc2626',
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                <Lock size={16} />
                <span>This decision is <strong>FINAL</strong> and cannot be changed. You may only view the documents.</span>
              </div>
            ) : (
              // ─── ACTION BUTTONS ────────────────────────────────────────
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button
                    onClick={() => handleStatusChange('shortlisted')}
                    style={{
                      padding: '6px 16px',
                      borderRadius: '6px',
                      border: tempStatus === 'shortlisted' ? '2px solid #16a34a' : '1px solid #e2e8f0',
                      background: tempStatus === 'shortlisted' ? '#dcfce7' : 'white',
                      color: tempStatus === 'shortlisted' ? '#16a34a' : '#64748b',
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    ✅ Shortlist
                  </button>
                  <button
                    onClick={() => handleStatusChange('rejected')}
                    style={{
                      padding: '6px 16px',
                      borderRadius: '6px',
                      border: tempStatus === 'rejected' ? '2px solid #dc2626' : '1px solid #e2e8f0',
                      background: tempStatus === 'rejected' ? '#fee2e2' : 'white',
                      color: tempStatus === 'rejected' ? '#dc2626' : '#64748b',
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    ❌ Reject
                  </button>
                </div>

                {/* Save Button */}
                <button
                  onClick={handleSave}
                  disabled={isSaving || tempStatus === originalStatus}
                  style={{
                    padding: '8px 20px',
                    borderRadius: '6px',
                    border: 'none',
                    background: (isSaving || tempStatus === originalStatus) ? '#94a3b8' : NAVY,
                    color: '#ffffff',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: (isSaving || tempStatus === originalStatus) ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 12px rgba(27, 58, 107, 0.2)',
                    opacity: (isSaving || tempStatus === originalStatus) ? 0.6 : 1,
                  }}
                >
                  {isSaving ? 'Saving...' : (tempStatus === originalStatus ? 'No Changes' : 'Save & Close')}
                </button>
              </div>
            )}

            {/* Communication Note */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 12px',
                backgroundColor: '#f1f5f9',
                borderRadius: '6px',
                fontSize: 11,
                color: '#64748b',
              }}
            >
              <Info size={14} color="#94a3b8" />
              <span>
                {isFinalStatus
                  ? `This application has been ${originalStatus}. The decision is final.`
                  : (tempStatus === 'shortlisted' || tempStatus === 'rejected')
                    ? `⚠️ ${tempStatus === 'shortlisted' ? 'Shortlisting' : 'Rejecting'} ${applicantName} will send an email notification.`
                    : 'Further communication with candidates will be conducted via email outside this platform.'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmation && (
        <ConfirmationModal
          isOpen={true}
          onClose={() => setConfirmation(null)}
          onConfirm={() => {
            confirmation.onConfirm();
          }}
          title={confirmation.title}
          message={confirmation.message}
          confirmLabel={confirmation.confirmLabel}
          confirmColor={confirmation.confirmColor}
          isPermanent={confirmation.isPermanent}
        />
      )}
    </>
  );
}