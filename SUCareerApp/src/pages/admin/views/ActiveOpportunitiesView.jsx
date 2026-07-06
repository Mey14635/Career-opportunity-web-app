import { useState } from 'react';
import { Eye } from 'lucide-react';
import { NAVY } from '../constants';
import JobDetailModal from '../../../components/shared/JobDetailModal';

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