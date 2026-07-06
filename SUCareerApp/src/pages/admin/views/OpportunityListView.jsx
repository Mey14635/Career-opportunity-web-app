// src/pages/admin/views/OpportunityListView.jsx
import { useState } from 'react';
import { NAVY } from '../constants';
import JobReviewsView from './JobReviewsView';
import ActiveOpportunitiesView from './ActiveOpportunitiesView';
import ExpiredJobsView from './ExpiredJobsView';
import RejectedJobsView from './RejectedJobsView';

export default function OpportunityListView({
  pendingJobs = [],
  activeJobs = [],
  rejectedJobs = [],
  triggerModal,
  onRefresh,
}) {
  const [activeTab, setActiveTab] = useState('pending');

  const tabs = [
    { key: 'pending', label: 'Pending' },
    { key: 'active', label: 'Active' },
    { key: 'expired', label: 'Expired' },
    { key: 'rejected', label: 'Rejected' },
  ];

  const getTabCount = (tabKey) => {
    switch (tabKey) {
      case 'pending':
        return pendingJobs.length;
      case 'active':
        return activeJobs.filter(job => {
          const deadline = job.deadline?.toDate?.() || new Date(job.deadline);
          return job.status === 'open' && deadline >= new Date();
        }).length;
      case 'expired':
        return activeJobs.filter(job => {
          const deadline = job.deadline?.toDate?.() || new Date(job.deadline);
          return job.status === 'open' && deadline < new Date();
        }).length;
      case 'rejected':
        return rejectedJobs.length;
      default:
        return 0;
    }
  };

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
          queueData={pendingJobs}
          triggerModal={triggerModal}
          onRefresh={onRefresh}
        />
      )}

      {activeTab === 'active' && (
        <ActiveOpportunitiesView
          activeJobsData={activeJobs.filter(job => {
            const deadline = job.deadline?.toDate?.() || new Date(job.deadline);
            return job.status === 'open' && deadline >= new Date();
          })}
          triggerModal={triggerModal}
        />
      )}

      {activeTab === 'expired' && (
        <ExpiredJobsView
          activeJobsData={activeJobs}
        />
      )}

      {activeTab === 'rejected' && (
        <RejectedJobsView
          rejectedJobsData={rejectedJobs}
          triggerModal={triggerModal}
        />
      )}
    </div>
  );
}