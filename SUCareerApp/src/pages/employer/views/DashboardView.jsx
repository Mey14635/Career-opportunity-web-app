// src/pages/employer/views/DashboardView.jsx
import { Users, FileText, PlusCircle, Clock, AlertCircle } from 'lucide-react';
import { NAVY, GOLD } from '../constants';

export default function DashboardView({
  myJobs,
  applicants,
  companyName,
  onPostJob,
  onSelectJob,
  onViewAllJobs,   // ← NEW PROP
}) {
  // Filter applicants by status (case-insensitive)
  const shortlistedCount = applicants.filter(a => 
    a.status?.toLowerCase() === 'shortlisted'
  ).length;

  // Sort jobs by createdAt (newest first)
  const sortedJobs = [...myJobs].sort((a, b) => {
    const dateA = a.createdAt?.toDate?.() || new Date(0);
    const dateB = b.createdAt?.toDate?.() || new Date(0);
    return dateB - dateA;
  });

  // Only show active (open) jobs on dashboard
  const activeJobs = sortedJobs.filter(j => j.status === 'open');

  // UPCOMING DEADLINES
  const today = new Date();
  const sevenDaysFromNow = new Date();
  sevenDaysFromNow.setDate(today.getDate() + 7);

  const upcomingDeadlines = activeJobs
    .filter(job => {
      const deadline = job.deadline?.toDate?.() || new Date(job.deadline);
      return deadline >= today && deadline <= sevenDaysFromNow;
    })
    .sort((a, b) => {
      const dateA = a.deadline?.toDate?.() || new Date(a.deadline);
      const dateB = b.deadline?.toDate?.() || new Date(b.deadline);
      return dateA - dateB;
    });

  const formatDate = (dateValue) => {
    if (!dateValue) return 'N/A';
    if (typeof dateValue.toDate === 'function') {
      return dateValue.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    return new Date(dateValue).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getDaysLeft = (dateValue) => {
    if (!dateValue) return 0;
    const deadline = typeof dateValue.toDate === 'function' ? dateValue.toDate() : new Date(dateValue);
    const diff = Math.ceil((deadline - new Date()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ margin: '0 0 4px 0', fontSize: 24, fontWeight: 800, color: NAVY }}>
            Welcome, {companyName || 'Employer'} Team
          </h1>
          <p style={{ margin: 0, fontSize: 14, color: '#64748b' }}>Overview of your current recruitment pipeline.</p>
        </div>
        <button onClick={onPostJob} style={{ background: GOLD, color: NAVY, border: 'none', padding: '10px 16px', borderRadius: '8px', fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', boxShadow: '0 4px 12px rgba(201, 162, 48, 0.2)' }}>
          <PlusCircle size={16} /> Post a Job
        </button>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'flex', gap: 20, marginBottom: 32 }}>
        {[
          { label: 'Active Job Postings', count: activeJobs.length, sub: 'Live and receiving applications', color: NAVY },
          { label: 'Total Applicants', count: applicants.length, sub: 'Across all active jobs', color: GOLD },
          { label: 'Shortlisted Candidates', count: shortlistedCount, sub: 'Ready for interview scheduling', color: '#16a34a' }
        ].map((stat, i) => (
          <div key={i} style={{ flex: 1, backgroundColor: '#ffffff', borderRadius: '10px', padding: '24px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#475569', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{stat.label}</h3>
            <div style={{ fontSize: 36, fontWeight: 800, color: stat.color, lineHeight: 1 }}>{stat.count}</div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 10 }}>{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* Two-column layout: Active Jobs + Upcoming Deadlines */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, marginBottom: 32 }}>
        {/* Active Job Postings */}
        <div>
          <h2 style={{ margin: '0 0 16px 0', fontSize: 16, fontWeight: 800, color: NAVY }}>Active Job Postings</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {activeJobs.length > 0 ? (
              activeJobs.slice(0, 3).map(job => {
                const jobApplicants = applicants.filter(a => a.jobId === job.id);
                const jobType = job.jobType || job.type || 'Internship';
                const typeColor = jobType === 'Internship' ? '#1e3a8a' : jobType === 'Graduate Program' ? '#166534' : '#d97706';
                const typeBg = jobType === 'Internship' ? '#eff6ff' : jobType === 'Graduate Program' ? '#f0fdf4' : '#fef3c7';

                return (
                  <div key={job.id} style={{ backgroundColor: '#ffffff', borderRadius: '10px', padding: '20px', border: '1px solid #e2e8f0', cursor: 'pointer' }} onClick={() => onSelectJob(job)}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{ width: 40, height: 40, backgroundColor: '#f8fafc', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0' }}>
                          <FileText size={20} color={NAVY} />
                        </div>
                        <div>
                          <h3 style={{ margin: '0 0 4px 0', fontSize: 15, fontWeight: 700, color: NAVY }}>{job.title}</h3>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 11, color: '#64748b' }}>
                            <span>Deadline: {formatDate(job.deadline)}</span>
                            <span style={{ color: '#cbd5e1' }}>•</span>
                            <span style={{ background: typeBg, color: typeColor, padding: '2px 10px', borderRadius: '12px', fontWeight: 600, fontSize: 10 }}>
                              {jobType}
                            </span>
                          </div>
                        </div>
                      </div>
                      <span style={{
                        background: '#dcfce7',
                        color: '#16a34a',
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: 11,
                        fontWeight: 700
                      }}>
                        Active
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Users size={16} color="#64748b" />
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#475569' }}>
                          {jobApplicants.length} {jobApplicants.length === 1 ? 'Applicant' : 'Applicants'}
                        </span>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); onSelectJob(job); }}
                        style={{
                          backgroundColor: '#f1f5f9',
                          color: NAVY,
                          border: '1px solid #e2e8f0',
                          padding: '6px 16px',
                          borderRadius: '6px',
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e2e8f0'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                      >
                        View Applicants
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', background: 'white', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                No active job postings yet. Click "Post a Job" to get started.
              </div>
            )}
            {activeJobs.length > 3 && (
              <div style={{ textAlign: 'center' }}>
                <button
                  onClick={() => onViewAllJobs && onViewAllJobs()}
                  style={{ background: 'none', border: 'none', color: NAVY, fontSize: 13, fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
                >
                  View all {activeJobs.length} active jobs →
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div>
          <h2 style={{ margin: '0 0 16px 0', fontSize: 16, fontWeight: 800, color: NAVY }}>Upcoming Deadlines</h2>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            {upcomingDeadlines.length > 0 ? (
              upcomingDeadlines.map((job, idx) => {
                const daysLeft = getDaysLeft(job.deadline);
                return (
                  <div
                    key={job.id}
                    style={{
                      padding: '16px 20px',
                      borderBottom: idx < upcomingDeadlines.length - 1 ? '1px solid #f1f5f9' : 'none',
                      cursor: 'pointer'
                    }}
                    onClick={() => onSelectJob(job)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: NAVY }}>{job.title}</div>
                        <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                          {formatDate(job.deadline)}
                        </div>
                      </div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        background: daysLeft <= 3 ? '#fee2e2' : '#fef3c7',
                        color: daysLeft <= 3 ? '#dc2626' : '#d97706',
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: 11,
                        fontWeight: 700,
                        whiteSpace: 'nowrap'
                      }}>
                        <Clock size={12} />
                        {daysLeft} {daysLeft === 1 ? 'day' : 'days'} left
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>
                <AlertCircle size={24} style={{ marginBottom: 8 }} />
                <div style={{ fontSize: 13, marginBottom: 4 }}>No upcoming deadlines</div>
                <div style={{ fontSize: 12 }}>All active jobs have deadlines beyond 7 days.</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}