import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { NAVY, GOLD, BG_GRAY } from '../constants';

export default function JobReviewsView({ queueData, triggerModal }) {
  const [selectedJob, setSelectedJob] = useState(null);

  if (selectedJob) {
    return (
      <div style={{ maxWidth: '1000px' }}>
        <button onClick={() => setSelectedJob(null)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#64748b', fontSize: 14, cursor: 'pointer', marginBottom: 24 }}>
          <ArrowLeft size={16} /> Back to Job Reviews
        </button>
        <div style={{ background: 'white', borderRadius: 16, padding: 32, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
          <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: 24, marginBottom: 24 }}>
            <h1 style={{ margin: '0 0 8px 0', color: NAVY, fontSize: 28, fontWeight: 800 }}>{selectedJob.title}</h1>
            <p style={{ margin: 0, color: '#64748b', fontSize: 16 }}>{selectedJob.companyName || selectedJob.employerId} &bull; {selectedJob.workMode || 'N/A'}</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 40 }}>
            <div>
              <h3 style={{ color: NAVY, fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Job Description</h3>
              <p style={{ color: '#475569', lineHeight: 1.7, fontSize: 15, marginBottom: 24 }}>{selectedJob.description}</p>
              <h3 style={{ color: NAVY, fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Key Responsibilities</h3>
              <p style={{ color: '#475569', lineHeight: 1.7, fontSize: 15, marginBottom: 24 }}>{selectedJob.responsibilities || 'N/A'}</p>
            </div>
            <div>
              <div style={{ background: BG_GRAY, borderRadius: 12, padding: 24, marginBottom: 24 }}>
                <h3 style={{ color: NAVY, fontSize: 14, fontWeight: 700, margin: '0 0 16px 0', textTransform: 'uppercase' }}>Details</h3>
                <div style={{ marginBottom: 12 }}>
                  <p style={{ margin: '0 0 4px 0', fontSize: 12, fontWeight: 700, color: '#94a3b8' }}>START DATE</p>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: NAVY }}>{selectedJob.startDate || 'N/A'}</p>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <p style={{ margin: '0 0 4px 0', fontSize: 12, fontWeight: 700, color: '#94a3b8' }}>DURATION</p>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: NAVY }}>{selectedJob.duration || 'N/A'}</p>
                </div>
                <div>
                  <p style={{ margin: '0 0 4px 0', fontSize: 12, fontWeight: 700, color: '#94a3b8' }}>OPEN POSITIONS</p>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: NAVY }}>{selectedJob.positions || 'N/A'}</p>
                </div>
              </div>
              <div>
                <h3 style={{ color: NAVY, fontSize: 14, fontWeight: 700, margin: '0 0 12px 0', textTransform: 'uppercase' }}>Required Documents</h3>
                <ul style={{ margin: 0, paddingLeft: 20, color: '#475569', fontSize: 14, lineHeight: 1.8 }}>
                  {selectedJob.docs && selectedJob.docs.length > 0 ? (
                    selectedJob.docs.map(doc => <li key={doc}>{doc}</li>)
                  ) : (
                    <li>No documents specified</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 16, borderTop: '1px solid #e2e8f0', paddingTop: 24, marginTop: 32 }}>
            <button
              onClick={() => {
                triggerModal('Reject Listing', `Reject "${selectedJob.title}"?`, 'danger', { view: 'job', id: selectedJob.id, type: 'reject', clearSelection: () => setSelectedJob(null) });
              }}
              style={{ padding: '12px 24px', borderRadius: 8, border: 'none', background: '#fee2e2', color: '#dc2626', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
            >
              Reject / Request Edits
            </button>
            <button
              onClick={() => {
                triggerModal('Approve & Publish', `Publish "${selectedJob.title}"?`, 'primary', { view: 'job', id: selectedJob.id, type: 'approve', job: selectedJob, clearSelection: () => setSelectedJob(null) });
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
          {queueData.map(job => (
            <div
              key={job.id}
              onClick={() => setSelectedJob(job)}
              style={{ background: 'white', borderRadius: 12, padding: '24px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)'; }}
            >
              <div style={{ flex: 1, paddingRight: 24 }}>
                <h3 style={{ margin: '0 0 6px 0', fontSize: 16, fontWeight: 700, color: NAVY }}>{job.title}</h3>
                <div style={{ fontSize: 14, color: '#64748b', marginBottom: 12 }}>{job.companyName || job.employerId}</div>
                <div style={{ fontSize: 13, color: '#94a3b8' }}>
                  Application Deadline: <span style={{ fontWeight: 700, color: '#334155' }}>{job.deadline?.toDate?.()?.toDateString() || 'N/A'}</span>
                </div>
              </div>
              <div style={{ flex: 1, padding: '0 24px' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', marginBottom: 8, letterSpacing: '0.5px', textTransform: 'uppercase' }}>Required Documents</div>
                <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: 8 }}>
                  {job.docs && job.docs.length > 0 ? (
                    job.docs.map(doc => <div key={doc} style={{ fontSize: 13, color: '#64748b', marginBottom: 4 }}>- {doc}</div>)
                  ) : (
                    <div style={{ fontSize: 13, color: '#94a3b8' }}>No documents specified</div>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', paddingLeft: 24 }}>
                <span style={{ color: GOLD, fontSize: 14, fontWeight: 700 }}>Review Details &rarr;</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}