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
    { key: 'pending', label: 'Pending' },
    { key: 'active', label: 'Active' },
    { key: 'expired', label: 'Expired' },
    { key: 'rejected', label: 'Rejected' },
  ];

  // ─── FILTER JOBS BY SEARCH QUERY ──────────────────────────────────────
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

  // ─── GET TAB COUNTS (UNFILTERED – TOTAL AVAILABLE) ────────────────────
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

  // ─── PREPARE FILTERED DATA FOR EACH TAB ──────────────────────────────
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

      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {tabs.map((tab) => {
          const count = getTabCount(tab.key);
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: '8px 20px',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === tab.key ? NAVY : 'transparent',
                color: activeTab === tab.key ? 'white' : '#475569',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              {tab.label}
              {count > 0 && (
                <span
                  style={{
                    background: activeTab === tab.key ? 'rgba(255,255,255,0.2)' : '#e2e8f0',
                    color: activeTab === tab.key ? 'white' : '#94a3b8',
                    padding: '1px 8px',
                    borderRadius: '12px',
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