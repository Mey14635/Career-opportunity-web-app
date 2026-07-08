// src/pages/employer/EmployerDashboard.jsx
import { useState, useEffect, useRef } from 'react';
import { FileText, Users } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';

import EmployerSidebar from '../../components/employer/EmployerSidebar';
import TopBar from '../../components/shared/TopBar';
import DocumentReviewModal from '../../components/employer/DocumentReviewModal';
import Modal from '../../components/shared/Modal';

import { BG_GRAY } from './constants';
import { auth, db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';

import {
  getEmployerJobs,
  getJobApplicants,
  updateApplicationStatus,
} from '../../services/firestoreService';
import {
  markNotificationAsRead,
  subscribeToUserNotifications,
} from '../../services/notificationService';

import DashboardView from './views/DashboardView';
import JobDetailView from './views/JobDetailView';
import PostJobView from './views/PostJobView';
import ApplicantTrackingView from './views/ApplicantTrackingView';
import CompanyProfileView from './views/CompanyProfileView';
import ReportsAnalyticsView from './views/ReportsAnalyticsView';
import SettingsView from './views/SettingsView';
import NotificationsView from './views/NotificationsView';
import ActivityHistoryView from './views/ActivityHistoryView';
import MyJobsView from './views/MyJobsView';

export default function EmployerDashboard() {
  const { user } = useAuth();
  const employerId = user?.uid;

  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedJob, setSelectedJob] = useState(null);
  const [editingJob, setEditingJob] = useState(null);
  const [atsFilter, setAtsFilter] = useState('All');
  const [reviewApplicant, setReviewApplicant] = useState(null);
  const [loading, setLoading] = useState(true);

  const [myJobs, setMyJobs] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [realActivities, setRealActivities] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const [companyName, setCompanyName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [dashboardMessage, setDashboardMessage] = useState(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteModalConfig, setDeleteModalConfig] = useState(null);

  // Track when the last status update occurred to prevent overwrites.
  const lastStatusUpdateTime = useRef(0);

  useEffect(() => {
    const fetchAllData = async () => {
      if (user && user.email) {
        setUserEmail(user.email);
      } else {
        setUserEmail('employer@company.com');
      }

      if (!employerId) {
        setLoading(false);
        return;
      }

      try {
        const profileRef = doc(db, 'employer_profiles', employerId);
        const profileSnap = await getDoc(profileRef);
        if (profileSnap.exists()) {
          const data = profileSnap.data();
          setCompanyName(data.companyName || '');
        }

        const jobs = await getEmployerJobs(employerId);
        setMyJobs(jobs);

        let allApplicants = [];
        // Only fetch applicants if we don't have a recent status update (within 3 seconds).
        const shouldFetchApplicants = Date.now() - lastStatusUpdateTime.current > 3000;
        if (shouldFetchApplicants) {
          for (const job of jobs) {
            const apps = await getJobApplicants(job.id);
            allApplicants = [...allApplicants, ...apps.map(a => ({ ...a, jobId: job.id }))];
          }
          setApplicants(allApplicants);
        } else {
          // Use existing applicants from state.
          allApplicants = applicants;
        }

        const buildActivities = (jobs, apps) => {
          const activities = [];
          jobs.forEach(job => {
            const date = job.createdAt?.toDate?.() || new Date();
            activities.push({
              id: `job-${job.id}`,
              action: 'Job Posted',
              details: `"${job.title}" was published`,
              time: date.toLocaleString(),
              timestamp: date.getTime(),
              icon: FileText,
              color: '#3b82f6',
              bg: '#eff6ff',
            });
          });
          apps.forEach(app => {
            const date = app.appliedAt?.toDate?.() || new Date();
            const jobTitle = jobs.find(j => j.id === app.jobId)?.title || 'a job';
            activities.push({
              id: `app-${app.id}`,
              action: 'Application Received',
              details: `${app.name || 'A student'} applied for "${jobTitle}"`,
              time: date.toLocaleString(),
              timestamp: date.getTime(),
              icon: Users,
              color: '#16a34a',
              bg: '#dcfce7',
            });
          });
          activities.sort((a, b) => b.timestamp - a.timestamp);
          return activities;
        };

        const activities = buildActivities(jobs, allApplicants);
        setRealActivities(activities);
      } catch {
        setDashboardMessage({ type: 'error', text: 'Could not load all employer dashboard data right now.' });
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employerId, refreshKey, user]);

  useEffect(() => {
    if (!employerId) {
      return undefined;
    }

    return subscribeToUserNotifications(
      employerId,
      setNotifications,
      () => setDashboardMessage({ type: 'error', text: 'Could not load notifications right now.' })
    );
  }, [employerId]);

  const getInitials = () => {
    if (!companyName) return 'EM';
    const words = companyName.split(' ');
    if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
    return companyName.substring(0, 2).toUpperCase();
  };

  const handleStatusChange = async (appId, newStatus) => {
    try {
      await updateApplicationStatus(appId, newStatus);
      // Update local state immediately.
      setApplicants(prev => prev.map(app =>
        app.id === appId ? { ...app, status: newStatus } : app
      ));
      // Record the time of this status update.
      lastStatusUpdateTime.current = Date.now();
    } catch {
      setDashboardMessage({ type: 'error', text: 'Could not update the applicant status. Please try again.' });
    }
  };

  const handleModalSave = async (appId, newStatus) => {
    await handleStatusChange(appId, newStatus);
    setReviewApplicant(null);
    // Do NOT update refreshKey here – it would trigger a re-fetch
    // that might overwrite the local state with stale data.
  };

  const handleAction = (msg) => setDashboardMessage({ type: 'info', text: msg });

  const handleNotificationAction = async (notification) => {
    try {
      if (!notification.read && !notification.isRead) {
        await markNotificationAsRead(notification.id);
      }
    } catch {
      setDashboardMessage({ type: 'error', text: 'Could not mark the notification as read.' });
    }

    if (notification.type === 'job_edits_requested') {
      const jobId = notification.targetId || notification.metadata?.jobId;
      if (jobId) {
        let job = myJobs.find(j => j.id === jobId);
        if (!job) {
          try {
            const jobSnap = await getDoc(doc(db, 'opportunities', jobId));
            if (jobSnap.exists()) {
              job = { id: jobSnap.id, ...jobSnap.data() };
            }
          } catch {
            // fallback
          }
        }
        if (job) {
          setEditingJob(job);
          setActiveTab('edit-job');
          return;
        }
      }
      setActiveTab('my-jobs');
      return;
    }

    if (notification.type === 'student_application' || notification.action?.targetTab === 'ats') {
      const applicationId = notification.targetId || notification.action?.entityId || notification.metadata?.applicationId;
      const applicant = applicants.find((item) => item.id === applicationId || item.applicationId === applicationId);

      setActiveTab('ats');
      setSelectedJob(null);
      setEditingJob(null);

      if (applicant) {
        setReviewApplicant(applicant);
      }
      return;
    }

    setActiveTab(notification.action?.targetTab || 'notifications');
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.clear();
      sessionStorage.clear();
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
      window.location.replace('/employer-access?mode=login');
    } catch {
      window.location.replace('/employer-access?mode=login');
    }
  };

  const handleEditJob = (job) => {
    setEditingJob(job);
    setActiveTab('edit-job');
  };

  const handleViewPublicProfile = () => {
    if (employerId) {
      window.open(`/company/${employerId}`, '_blank');
    } else {
      setDashboardMessage({ type: 'error', text: 'Employer profile is not available yet.' });
    }
  };

  const confirmDeleteJob = (job) => {
    setDeleteModalConfig({
      title: 'Delete Job',
      message: `Are you sure you want to delete "${job.title}"? This action cannot be undone.`,
      type: 'danger',
      jobId: job.id,
    });
    setDeleteModalOpen(true);
  };

  const handleDeleteJob = async () => {
    if (!deleteModalConfig) return;
    try {
      await deleteDoc(doc(db, 'opportunities', deleteModalConfig.jobId));
      setRefreshKey(prev => prev + 1);
      setDashboardMessage({ type: 'success', text: 'Job deleted successfully.' });
    } catch {
      setDashboardMessage({ type: 'error', text: 'Failed to delete the job. Please try again.' });
    }
    setDeleteModalOpen(false);
    setDeleteModalConfig(null);
  };

  const handleUpdateJob = () => {
    setEditingJob(null);
    setRefreshKey(prev => prev + 1);
    setActiveTab('my-jobs');
  };

  // ─── BREADCRUMB – CLEAN ROUTING ─────────────────────────────────────────
  const getBreadcrumb = () => {
    if (activeTab === 'post-role') return 'Post a Job';
    if (activeTab === 'edit-job') return 'My Jobs > Edit Job';
    if (selectedJob) return `My Jobs > ${selectedJob.title} > Applicant Pipeline`;
    if (activeTab === 'ats') return 'Applicant Tracking';
    if (activeTab === 'profile') return 'Company Profile';
    if (activeTab === 'settings') return 'Account Settings';
    if (activeTab === 'analytics') return 'Reports & Analytics';
    if (activeTab === 'notifications') return 'Notifications';
    if (activeTab === 'history') return 'Activity History';
    if (activeTab === 'my-jobs') return 'My Jobs';
    return 'Dashboard';
  };

  const navigateTab = (tab) => {
    setActiveTab(tab);
    setSelectedJob(null);
    setEditingJob(null);
  };

  const handleJobPosted = () => {
    setRefreshKey(prev => prev + 1);
    navigateTab('dashboard');
  };

  const renderView = () => {
    if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Loading your data...</div>;

    switch (activeTab) {
      case 'history':
        return <ActivityHistoryView activities={realActivities} onBack={() => navigateTab('dashboard')} />;
      case 'notifications':
        return <NotificationsView notifications={notifications} onNotificationAction={handleNotificationAction} />;
      case 'profile':
        return (
          <CompanyProfileView
            employerId={employerId}
            onViewPublic={handleViewPublicProfile}
            onUploadLogo={() => handleAction('Opening local file dialog for Logo Upload')}
          />
        );
      case 'settings':
        return <SettingsView onUpdatePassword={() => handleAction('Updating Security Token via Authentication Service')} />;
      case 'analytics':
        return <ReportsAnalyticsView employerId={employerId} />;
      case 'post-role':
        return (
          <PostJobView
            employerId={employerId}
            companyName={companyName}
            onCancel={() => navigateTab('dashboard')}
            onSuccess={handleJobPosted}
          />
        );
      case 'edit-job':
        return (
          <PostJobView
            employerId={employerId}
            companyName={companyName}
            editingJob={editingJob}
            onCancel={() => {
              setEditingJob(null);
              setActiveTab('my-jobs');
            }}
            onSuccess={handleUpdateJob}
          />
        );
      case 'ats':
        return (
          <ApplicantTrackingView
            applicants={applicants}
            jobs={myJobs}
            atsFilter={atsFilter}
            onFilterChange={setAtsFilter}
            onReview={setReviewApplicant}
          />
        );
      case 'my-jobs':
        return (
          <MyJobsView
            jobs={myJobs}
            applicants={applicants}
            onSelectJob={(job) => {
              setSelectedJob(job);
              setActiveTab('job-detail');
            }}
            onEditJob={handleEditJob}
            onDeleteJob={confirmDeleteJob}
          />
        );
      default:
        if (selectedJob) {
          return (
            <JobDetailView
              job={selectedJob}
              applicants={applicants}
              onBack={() => setSelectedJob(null)}
              onReview={setReviewApplicant}
              onEdit={() => {
                setEditingJob(selectedJob);
                setActiveTab('edit-job');
              }}
            />
          );
        } else {
          return (
            <DashboardView
              myJobs={myJobs}
              applicants={applicants}
              companyName={companyName}
              recentActivities={realActivities.slice(0, 3)}
              onPostJob={() => navigateTab('post-role')}
              onSelectJob={(job) => {
                setSelectedJob(job);
                setActiveTab('job-detail');
              }}
              onViewAllHistory={() => navigateTab('history')}
              onViewAllJobs={() => {
                setActiveTab('my-jobs');
                setSelectedJob(null);
                setEditingJob(null);
              }}
            />
          );
        }
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', backgroundColor: BG_GRAY }}>
      <EmployerSidebar
        active={activeTab}
        onNavigate={(tab) => {
          if (tab === 'dashboard') {
            setActiveTab('dashboard');
            setSelectedJob(null);
            setEditingJob(null);
          } else {
            navigateTab(tab);
          }
        }}
      />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <TopBar
          notifications={notifications}
          setNotifications={setNotifications}
          onSettings={() => navigateTab('settings')}
          onLogout={handleLogout}
          setActiveTab={setActiveTab}
          onNotificationAction={handleNotificationAction}
          breadcrumb={getBreadcrumb()}
          showSearch={false}
          searchPlaceholder="Search your jobs..."
          userInitials={getInitials()}
          userName={companyName || 'Employer'}
          userEmail={userEmail || 'employer@company.com'}
        />
        <main style={{ flex: 1, overflowY: 'auto', padding: '40px', backgroundColor: BG_GRAY }}>
          {dashboardMessage && (
            <div style={{
              marginBottom: 16,
              padding: '12px 14px',
              background: dashboardMessage.type === 'error' ? '#fef2f2' : dashboardMessage.type === 'success' ? '#f0fdf4' : '#eff6ff',
              border: `1px solid ${dashboardMessage.type === 'error' ? '#fecaca' : dashboardMessage.type === 'success' ? '#bbf7d0' : '#bfdbfe'}`,
              borderRadius: 8,
              color: dashboardMessage.type === 'error' ? '#b91c1c' : dashboardMessage.type === 'success' ? '#166534' : '#1d4ed8',
              fontSize: 13,
              fontWeight: 700,
            }}>
              {dashboardMessage.text}
            </div>
          )}
          {renderView()}
        </main>
      </div>

      {reviewApplicant && (
        <DocumentReviewModal
          applicant={reviewApplicant}
          onClose={() => setReviewApplicant(null)}
          onSave={handleModalSave}
        />
      )}

      <Modal
        isOpen={deleteModalOpen}
        config={deleteModalConfig}
        onClose={() => {
          setDeleteModalOpen(false);
          setDeleteModalConfig(null);
        }}
        onConfirm={handleDeleteJob}
      />
    </div>
  );
}