// src/pages/employer/views/ApplicantTrackingView.jsx
import { NAVY } from '../constants';
import GlobalATSWidget from '../../../components/employer/GlobalATSWidget';

export default function ApplicantTrackingView({
  applicants,
  jobs,
  atsFilter,
  onFilterChange,
  onReview,
}) {
  const filteredApps = atsFilter === 'All'
    ? applicants
    : applicants.filter(a => a.status === atsFilter.toLowerCase());

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: '0 0 4px 0', fontSize: 20, fontWeight: 800, color: NAVY }}>Applicant Tracking System</h1>
        <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>Unified view across all active pipelines.</p>
      </div>

      {/* ─── FILTER TABS ────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, backgroundColor: '#ffffff', padding: 6, borderRadius: '8px', width: 'fit-content', border: '1px solid #e2e8f0' }}>
        {['All', 'Shortlisted', 'Submitted', 'Rejected'].map(tab => (
          <button
            key={tab}
            onClick={() => onFilterChange(tab)}
            style={{
              padding: '6px 16px',
              borderRadius: '6px',
              border: 'none',
              background: atsFilter === tab ? NAVY : 'transparent',
              color: atsFilter === tab ? 'white' : '#475569',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ─── WIDGET ────────────────────────────────────────────────────── */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
        <GlobalATSWidget
          applicants={filteredApps}
          jobs={jobs}
          onReview={onReview}
        />
      </div>
    </div>
  );
}