// src/pages/admin/views/OpportunityListView.jsx
import { useState, useMemo, useCallback } from 'react';
import { NAVY } from '../constants';
import JobReviewsView from './JobReviewsView';
import ActiveOpportunitiesView from './ActiveOpportunitiesView';
import ExpiredJobsView from './ExpiredJobsView';
import RejectedJobsView from './RejectedJobsView';

// Helper: Check if a job is expired
function isJobExpired(job) {
  if (!job.deadline) return false;
  const deadline = typeof job.deadline.toDate === 'function' ? job.deadline.toDate() : new Date(job.deadline);
  return deadline < new Date();
}

export default function OpportunityListView({
  pendingJobs = [],
  activeJobs = [],
  rejectedJobs = [],
  expiredJobs = [],
  triggerModal,
  onRefresh,
  searchQuery = '',
}) {
  const [activeTab, setActiveTab] = useState('pending');

  const tabs = [
    { key: 'pending', label: 'Pending', color: '#f59e0b' },
    { key: 'active', label: 'Active', color: '#16a34a' },
    { key: 'expired', label: 'Expired', color: '#64748b' },
    { key: 'rejected', label: 'Rejected', color: '#dc2626' },
  ];

  const filterJobs = useCallback((jobs) => {
    if (!searchQuery) return jobs;
    const q = searchQuery.toLowerCase().trim();
    return jobs.filter(job =>
      job.title?.toLowerCase().includes(q) ||
      job.companyName?.toLowerCase().includes(q) ||
      job.location?.toLowerCase().includes(q) ||
      job.industry?.toLowerCase().includes(q) ||
      job.jobType?.toLowerCase().includes(q) ||
      job.type?.toLowerCase().includes(q) ||
      job.department?.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const getTabCount = (tabKey) => {
    switch (tabKey) {
      case 'pending':
        return pendingJobs.filter(job => !isJobExpired(job)).length;
      case 'active':
        return activeJobs.filter(job => {
          const deadline = job.deadline?.toDate?.() || new Date(job.deadline);
          return job.status === 'open' && deadline >= new Date();
        }).length;
      case 'expired':
        return expiredJobs.length;
      case 'rejected':
        return rejectedJobs.length;
      default:
        return 0;
    }
  };

  const filteredPending = useMemo(
    () => filterJobs(pendingJobs.filter(job => !isJobExpired(job))),
    [filterJobs, pendingJobs]
  );

  const filteredActive = useMemo(
    () => filterJobs(activeJobs.filter(job => {
      const deadline = job.deadline?.toDate?.() || new Date(job.deadline);
      return job.status === 'open' && deadline >= new Date();
    })),
    [filterJobs, activeJobs]
  );

  const filteredExpired = useMemo(
    () => filterJobs(expiredJobs),
    [filterJobs, expiredJobs]
  );

  const filteredRejected = useMemo(
    () => filterJobs(rejectedJobs),
    [filterJobs, rejectedJobs]
  );

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: '0 0 8px 0', fontSize: 24, fontWeight: 800, color: NAVY }}>
          Opportunity Listings
        </h1>
        <p style={{ margin: 0, fontSize: 14, color: '#64748b' }}>
          Review, approve, and manage all career opportunities across the platform.
        </p>
      </div>

      {/* ─── REFINED TAB BAR ─────────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          gap: 4,
          marginBottom: 28,
          background: '#f1f5f9',
          padding: 4,
          borderRadius: 12,
          width: 'fit-content',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}
      >
        {tabs.map((tab) => {
          const count = getTabCount(tab.key);
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: '8px 18px',
                borderRadius: 8,
                border: 'none',
                background: isActive ? '#ffffff' : 'transparent',
                color: isActive ? NAVY : '#64748b',
                fontSize: 14,
                fontWeight: isActive ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: isActive ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                position: 'relative',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.5)';
                  e.currentTarget.style.color = NAVY;
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#64748b';
                }
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: tab.color,
                  flexShrink: 0,
                }}
              />
              {tab.label}
              {count > 0 && (
                <span
                  style={{
                    background: isActive ? NAVY : '#e2e8f0',
                    color: isActive ? '#ffffff' : '#94a3b8',
                    padding: '1px 8px',
                    borderRadius: 12,
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {activeTab === 'pending' && (
        <JobReviewsView
          queueData={filteredPending}
          triggerModal={triggerModal}
          onRefresh={onRefresh}
        />
      )}

      {activeTab === 'active' && (
        <ActiveOpportunitiesView
          activeJobsData={filteredActive}
          triggerModal={triggerModal}
        />
      )}

      {activeTab === 'expired' && (
        <ExpiredJobsView
          expiredJobsData={filteredExpired}
        />
      )}

      {activeTab === 'rejected' && (
        <RejectedJobsView
          rejectedJobsData={filteredRejected}
          triggerModal={triggerModal}
        />
      )}
    </div>
  );
}