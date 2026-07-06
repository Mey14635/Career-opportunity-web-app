// src/pages/admin/views/ExpiredJobsView.jsx
import { useState } from 'react';
import { Eye } from 'lucide-react';
import { NAVY } from '../constants';
import JobDetailModal from '../../../components/shared/JobDetailModal';

function isJobExpired(job) {
  if (!job.deadline) return false;
  const deadline = typeof job.deadline.toDate === 'function' ? job.deadline.toDate() : new Date(job.deadline);
  return deadline < new Date();
}

export default function ExpiredJobsView({ activeJobsData }) {
  const [selectedJob, setSelectedJob] = useState(null);

  // Filter only expired jobs
  const expiredJobs = (activeJobsData || []).filter(job => isJobExpired(job));

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
              <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 700, color: '#94a3b8' }}>STATUS</th>
              <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 700, color: '#94a3b8' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {expiredJobs.map((job) => (
              <tr key={job.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '20px 24px', fontSize: 14, fontWeight: 700, color: NAVY }}>{job.title}</td>
                <td style={{ padding: '20px 24px', fontSize: 14, color: '#64748b' }}>{job.companyName || job.employerId || job.employerID}</td>
                <td style={{ padding: '20px 24px', fontSize: 14, color: '#475569' }}>{formatDate(job.deadline)}</td>
                <td style={{ padding: '20px 24px' }}>
                  <span style={{ background: '#f1f5f9', color: '#64748b', padding: '4px 12px', borderRadius: '12px', fontSize: 12, fontWeight: 700 }}>
                    Expired
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
            ))}
          </tbody>
        </table>
      </div>

      {selectedJob && (
        <JobDetailModal job={selectedJob} onClose={() => setSelectedJob(null)} />
      )}
    </div>
  );
}