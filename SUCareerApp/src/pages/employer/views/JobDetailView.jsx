import { ArrowLeft, Edit2 } from 'lucide-react';
import { NAVY } from '../constants';
import JobApplicantsWidget from '../../../components/employer/JobApplicantsWidget';

export default function JobDetailView({ job, applicants, onBack, onStatusChange, onReview, onEdit }) {
  const jobApps = applicants.filter(app => app.jobId === job.id);

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <button
        onClick={onBack}
        style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#64748b', fontSize: 12, fontWeight: 600, cursor: 'pointer', marginBottom: 20, padding: 0 }}
      >
        <ArrowLeft size={14} /> Back to Dashboard
      </button>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: NAVY }}>{job.title}</h1>
          <button onClick={onEdit} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', color: '#64748b', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
            <Edit2 size={12} /> Edit Listing
          </button>
        </div>
        <div style={{ padding: '4px 10px', backgroundColor: job.status === 'open' ? '#f0fdf4' : '#fef3c7', border: job.status === 'open' ? '1px solid #bbf7d0' : '1px solid #fef3c7', color: job.status === 'open' ? '#16a34a' : '#d97706', borderRadius: '4px', fontSize: 11, fontWeight: 600 }}>
          {job.status === 'open' ? 'Active' : 'Pending Review'} · Closes {job.deadline?.toDate?.()?.toDateString() || 'N/A'}
        </div>
      </div>
      <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
        <JobApplicantsWidget applicants={jobApps} onStatusChange={onStatusChange} onReview={onReview} />
      </div>
    </div>
  );
}