import { useState } from 'react';
import { Users, FileText, Edit2, Trash2, Eye } from 'lucide-react';
import { NAVY } from '../constants';

export default function MyJobsView({ jobs, applicants, onSelectJob, onEditJob, onDeleteJob }) {
  const [statusFilter, setStatusFilter] = useState('all');

  const tabs = [
    { key: 'all', label: 'All Jobs' },
    { key: 'pending', label: 'Pending Approval' },
    { key: 'open', label: 'Active' },
    { key: 'closed', label: 'Closed' },
  ];

  const filteredJobs = statusFilter === 'all'
    ? jobs
    : jobs.filter(j => j.status === statusFilter);

  // Helper: Check if job was returned for edits
  const isReturnedForEdits = (job) => {
    return job.pendingReason === 'unpublished' || job.pendingReason === 'edits_requested';
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: { bg: '#fef3c7', color: '#d97706', label: 'Pending' },
      open: { bg: '#dcfce7', color: '#16a34a', label: 'Active' },
      closed: { bg: '#fee2e2', color: '#dc2626', label: 'Closed' },
    };
    const s = styles[status] || styles.pending;
    return (
      <span style={{ background: s.bg, color: s.color, padding: '4px 12px', borderRadius: '12px', fontSize: 11, fontWeight: 700 }}>
        {s.label}
      </span>
    );
  };

  const getTypeBadge = (job) => {
    const type = job.jobType || job.type || 'Internship';
    const styles = {
      'Internship': { bg: '#eff6ff', color: '#1e3a8a' },
      'Graduate Program': { bg: '#f0fdf4', color: '#166534' },
      'Full Time': { bg: '#fef3c7', color: '#d97706' },
      'Part-time': { bg: '#f3e8ff', color: '#7c3aed' },
    };
    const s = styles[type] || styles['Internship'];
    return (
      <span style={{ background: s.bg, color: s.color, padding: '2px 10px', borderRadius: '12px', fontSize: 10, fontWeight: 600 }}>
        {type}
      </span>
    );
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: '0 0 4px 0', fontSize: 20, fontWeight: 800, color: NAVY }}>My Jobs</h1>
        <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>Manage all your job postings.</p>
      </div>

      {/* ─── TABS ────────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, backgroundColor: '#ffffff', padding: 6, borderRadius: '8px', width: 'fit-content', border: '1px solid #e2e8f0' }}>
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            style={{
              padding: '6px 16px',
              borderRadius: '6px',
              border: 'none',
              background: statusFilter === tab.key ? NAVY : 'transparent',
              color: statusFilter === tab.key ? 'white' : '#475569',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ─── JOB LIST ────────────────────────────────────────────────────── */}
      {filteredJobs.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', background: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          No jobs found in this category.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
          {filteredJobs.map(job => {
            const jobApplicants = applicants.filter(a => a.jobId === job.id);
            const returnedForEdits = isReturnedForEdits(job);
            return (
              <div
                key={job.id}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '10px',
                  padding: '20px 24px',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'box-shadow 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)'}
                onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1 }}>
                  <div style={{ width: 40, height: 40, backgroundColor: '#f8fafc', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0' }}>
                    <FileText size={20} color={NAVY} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
                      <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: NAVY }}>{job.title}</h3>
                      {getStatusBadge(job.status)}
                      {/* ─── "Returned for edits" badge ─── */}
                      {returnedForEdits && (
                        <span style={{
                          background: '#fef3c7',
                          color: '#d97706',
                          padding: '2px 10px',
                          borderRadius: '12px',
                          fontSize: 11,
                          fontWeight: 700,
                        }}>
                          Returned for edits
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: '#64748b', flexWrap: 'wrap' }}>
                      <span>Deadline: {job.deadline?.toDate?.()?.toDateString() || 'N/A'}</span>
                      <span style={{ color: '#cbd5e1' }}>•</span>
                      {getTypeBadge(job)}
                      <span style={{ color: '#cbd5e1' }}>•</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Users size={14} color="#64748b" />
                        {jobApplicants.length} {jobApplicants.length === 1 ? 'Applicant' : 'Applicants'}
                      </span>
                    </div>
                    {returnedForEdits && job.editRequestReason && (
                      <div style={{ marginTop: 10, padding: '10px 12px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, color: '#92400e', fontSize: 12, lineHeight: 1.5, maxWidth: 560 }}>
                        <strong>Requested change:</strong> {job.editRequestReason}
                      </div>
                    )}
                  </div>
                </div>

                {/* ─── ACTIONS ──────────────────────────────────────────── */}
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => onSelectJob(job)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      padding: '6px 12px',
                      backgroundColor: '#f1f5f9',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      fontSize: 12,
                      fontWeight: 600,
                      color: NAVY,
                      cursor: 'pointer',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e2e8f0'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                  >
                    <Eye size={14} /> View
                  </button>

                  {/* ─── Only show Edit/Delete for pending jobs ────────── */}
                  {job.status === 'pending' && (
                    <>
                      <button
                        onClick={() => onEditJob(job)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          padding: '6px 12px',
                          backgroundColor: '#eff6ff',
                          border: '1px solid #bfdbfe',
                          borderRadius: '6px',
                          fontSize: 12,
                          fontWeight: 600,
                          color: '#1e3a8a',
                          cursor: 'pointer',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#dbeafe'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#eff6ff'}
                      >
                        <Edit2 size={14} /> Edit
                      </button>
                      <button
                        onClick={() => onDeleteJob(job)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          padding: '6px 12px',
                          backgroundColor: '#fee2e2',
                          border: '1px solid #fecaca',
                          borderRadius: '6px',
                          fontSize: 12,
                          fontWeight: 600,
                          color: '#dc2626',
                          cursor: 'pointer',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fecaca'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fee2e2'}
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
