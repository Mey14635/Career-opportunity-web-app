// src/pages/admin/views/DashboardView.jsx
import { Users, Building2, AlertTriangle, FileText, Clock, UserPlus } from 'lucide-react';
import { NAVY, BG_GRAY } from '../constants';

// Helper: Sort by createdAt descending (newest first)
function sortByCreatedDescending(data) {
  return [...data].sort((a, b) => {
    const aTime = a.createdAt?.toDate?.()?.getTime() || new Date(a.createdAt).getTime() || 0;
    const bTime = b.createdAt?.toDate?.()?.getTime() || new Date(b.createdAt).getTime() || 0;
    return bTime - aTime;
  });
}

export default function DashboardView({ statsData, recentPendingJobs, pendingEmployers }) {
  const stats = [
    { label: 'Total Students', count: statsData.totalStudents, change: 'Active on platform', urgent: false, icon: Users },
    { label: 'Active Employers', count: statsData.activeEmployers, change: 'Corporate Partners', urgent: false, icon: Building2 },
    { label: 'Employers Pending Approvals', count: statsData.pendingApprovals, change: 'Requires review', urgent: true, icon: AlertTriangle },
    { label: 'Jobs Reviewed', count: statsData.totalJobs, change: 'Past 30 days', urgent: false, icon: FileText },
  ];

  // Get the 5 most recent pending jobs
  const recentJobs = sortByCreatedDescending(recentPendingJobs || []).slice(0, 5);

  // Get the 5 most recent pending employers
  const recentEmployers = sortByCreatedDescending(pendingEmployers || []).slice(0, 5);

  // Helper to format date
  const formatDate = (dateValue) => {
    if (!dateValue) return 'N/A';
    if (typeof dateValue.toDate === 'function') {
      return dateValue.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    return new Date(dateValue).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div style={{ maxWidth: '1200px' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ margin: '0 0 8px 0', fontSize: 24, fontWeight: 800, color: NAVY }}>Dashboard</h1>
        <p style={{ margin: 0, fontSize: 14, color: '#64748b' }}>Real-time platform health and activity — Academic Year 2025/26.</p>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, marginBottom: 32 }}>
        {stats.map((stat, i) => (
          <div key={i} style={{ background: '#ffffff', borderRadius: 12, padding: 24, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>{stat.label}</span>
              <div style={{ backgroundColor: stat.urgent ? '#fef9c3' : BG_GRAY, padding: '8px', borderRadius: '8px' }}>
                <stat.icon size={18} color={stat.urgent ? '#ca8a04' : NAVY} />
              </div>
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: NAVY }}>{stat.count}</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: stat.urgent ? '#ca8a04' : '#64748b', marginTop: 8 }}>{stat.change}</div>
          </div>
        ))}
      </div>

      {/* Two-column layout for recent activity */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Recent Job Submissions */}
        <div style={{ background: '#ffffff', borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Clock size={18} color={NAVY} />
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: NAVY }}>Recent Job Submissions</h3>
            </div>
            <span style={{ fontSize: 13, color: '#94a3b8' }}>
              {recentJobs.length === 0 ? 'No submissions' : `Showing ${recentJobs.length} latest`}
            </span>
          </div>

          {recentJobs.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>
              No pending job submissions at the moment. Check back soon.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {recentJobs.map((job, idx) => (
                <div
                  key={job.id}
                  style={{
                    padding: '14px 24px',
                    borderBottom: idx < recentJobs.length - 1 ? '1px solid #f1f5f9' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: job.pendingReason === 'unpublished' ? '#d97706' : '#eab308',
                        flexShrink: 0,
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: NAVY }}>{job.title}</div>
                      <div style={{ fontSize: 13, color: '#64748b' }}>
                        {job.companyName || job.employerId || 'Unknown company'}
                        {job.pendingReason === 'unpublished' && (
                          <span
                            style={{
                              marginLeft: 10,
                              padding: '2px 8px',
                              borderRadius: '12px',
                              fontSize: 11,
                              fontWeight: 700,
                              color: '#d97706',
                              background: '#fef3c7',
                            }}
                          >
                            Returned for edits
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div style={{ fontSize: 13, color: '#94a3b8', whiteSpace: 'nowrap', marginLeft: 16 }}>
                    {formatDate(job.createdAt)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Employer Approvals */}
        <div style={{ background: '#ffffff', borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <UserPlus size={18} color={NAVY} />
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: NAVY }}>Pending Employer Approvals</h3>
            </div>
            <span style={{ fontSize: 13, color: '#94a3b8' }}>
              {recentEmployers.length === 0 ? 'No pending' : `Showing ${recentEmployers.length} latest`}
            </span>
          </div>

          {recentEmployers.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>
              No pending employer approvals at this time.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {recentEmployers.map((employer, idx) => (
                <div
                  key={employer.id}
                  style={{
                    padding: '14px 24px',
                    borderBottom: idx < recentEmployers.length - 1 ? '1px solid #f1f5f9' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: '#eab308',
                        flexShrink: 0,
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: NAVY }}>
                        {employer.companyName || employer.name || 'Unnamed company'}
                      </div>
                      <div style={{ fontSize: 13, color: '#64748b' }}>
                        {employer.contactPerson || employer.email || 'No contact person'}
                      </div>
                    </div>
                  </div>
                  <div style={{ fontSize: 13, color: '#94a3b8', whiteSpace: 'nowrap', marginLeft: 16 }}>
                    {formatDate(employer.createdAt)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}