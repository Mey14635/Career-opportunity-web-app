// src/pages/admin/views/RejectedJobsView.jsx
import { useState } from 'react';
import { Eye, RotateCcw } from 'lucide-react';
import { NAVY } from '../constants';
import JobDetailModal from '../../../components/shared/JobDetailModal';

export default function RejectedJobsView({ rejectedJobsData, triggerModal }) {
  const [selectedJob, setSelectedJob] = useState(null);

  if (!rejectedJobsData || rejectedJobsData.length === 0) {
    return (
      <div style={{ maxWidth: '1200px' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ margin: '0 0 8px 0', fontSize: 24, fontWeight: 800, color: NAVY }}>Rejected Jobs</h1>
          <p style={{ margin: 0, fontSize: 14, color: '#64748b' }}>Review jobs that have been rejected by the admin.</p>
        </div>
        <div style={{ textAlign: 'center', padding: '64px', background: 'white', borderRadius: 12, color: '#94a3b8' }}>
          No rejected jobs to display.
        </div>
      </div>
    );
  }

  const sortedJobs = [...rejectedJobsData].sort((a, b) => {
    const aTime = a.updatedAt?.toDate?.()?.getTime() || new Date(a.updatedAt).getTime() || 0;
    const bTime = b.updatedAt?.toDate?.()?.getTime() || new Date(b.updatedAt).getTime() || 0;
    return bTime - aTime;
  });

  return (
    <div style={{ maxWidth: '1200px' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ margin: '0 0 8px 0', fontSize: 24, fontWeight: 800, color: NAVY }}>Rejected Jobs</h1>
        <p style={{ margin: 0, fontSize: 14, color: '#64748b' }}>Review jobs that have been rejected by the admin.</p>
      </div>

      <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
              <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 700, color: '#94a3b8' }}>JOB TITLE</th>
              <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 700, color: '#94a3b8' }}>COMPANY</th>
              <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 700, color: '#94a3b8' }}>REJECTED DATE</th>
              <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 700, color: '#94a3b8' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {sortedJobs.map((job) => (
              <tr key={job.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '20px 24px', fontSize: 14, fontWeight: 700, color: NAVY }}>{job.title}</td>
                <td style={{ padding: '20px 24px', fontSize: 14, color: '#64748b' }}>{job.companyName || job.employerId || job.employerID}</td>
                <td style={{ padding: '20px 24px', fontSize: 14, color: '#475569' }}>
                  {job.updatedAt?.toDate?.()?.toDateString() || new Date(job.updatedAt).toDateString() || 'N/A'}
                </td>
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
                      <Eye size={14} /> View Details
                    </button>
                    <button
                      onClick={() =>
                        triggerModal(
                          'Unreject Job',
                          `Return "${job.title}" to pending review? This will allow you to approve or reject it again.`,
                          'warning',
                          { view: 'rejected', id: job.id, type: 'unreject' }
                        )
                      }
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        padding: '6px 12px',
                        borderRadius: 6,
                        border: '1px solid #f59e0b',
                        background: 'transparent',
                        color: '#d97706',
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'background-color 0.2s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fef3c7')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <RotateCcw size={14} /> Unreject
                    </button>
                  </div>
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