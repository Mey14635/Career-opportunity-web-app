import { useState, useEffect } from 'react';
import { Check, FileText, Building2 } from 'lucide-react'; // ✅ only used icons
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

// ─── SHARED COMPONENTS ──────────────────────────────────────────────────
import EmployerSidebar from '../../components/employer/EmployerSidebar';
import EmployerTopBar from '../../components/employer/EmployerTopBar';
import DocumentReviewModal from '../../components/employer/DocumentReviewModal';

// ─── CONSTANTS ──────────────────────────────────────────────────────────
import { BG_GRAY } from './constants';
import { auth } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';

// ─── FIRESTORE SERVICES ────────────────────────────────────────────────
import {
  getEmployerJobs,
  getJobApplicants,
  updateApplicationStatus,
} from '../../services/firestoreService';

// ─── VIEWS ──────────────────────────────────────────────────────────────
import DashboardView from './views/DashboardView';
import JobDetailView from './views/JobDetailView';
import PostJobView from './views/PostJobView';
import ApplicantTrackingView from './views/ApplicantTrackingView';
import CompanyProfileView from './views/CompanyProfileView';
import ReportsAnalyticsView from './views/ReportsAnalyticsView';
import SettingsView from './views/SettingsView';
import NotificationsView from './views/NotificationsView';
import ActivityHistoryView from './views/ActivityHistoryView';

export default function EmployerDashboard({ onLogout }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const employerId = user?.uid;

  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedJob, setSelectedJob] = useState(null);
  const [atsFilter, setAtsFilter] = useState('All');
  const [reviewApplicant, setReviewApplicant] = useState(null);
  const [loading, setLoading] = useState(true);

  // ─── DATA STATE ──────────────────────────────────────────────────────
  const [myJobs, setMyJobs] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'New Application', desc: 'Jane Doe submitted credentials.', time: '2 hours ago', read: false },
  ]);

  // Mock activities (can be replaced with real activity log later)
  const recentActivities = [
    { id: 1, action: 'Application Received', details: 'Jane Doe applied for Frontend Developer Intern.', time: '2h ago', icon: FileText, color: '#3b82f6', bg: '#eff6ff' },
    { id: 2, action: 'Listing Published', details: 'Data Analyst — Graduate is now live.', time: '1d ago', icon: Check, color: '#16a34a', bg: '#dcfce7' },
  ];
  const fullHistory = [
    ...recentActivities,
    { id: 3, action: 'Profile Updated', details: 'Corporate branding logo was updated.', time: '2w ago', icon: Building2, color: '#8b5cf6', bg: '#ede9fe' },
  ];

  // ─── FETCH DATA ──────────────────────────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      if (!employerId) {
        setLoading(false);
        return;
      }

      try {
        // 1. Fetch jobs posted by this employer
        const jobs = await getEmployerJobs(employerId);
        setMyJobs(jobs);

        // 2. Fetch applicants for all jobs
        let allApplicants = [];
        for (const job of jobs) {
          const apps = await getJobApplicants(job.id);
          allApplicants = [...allApplicants, ...apps.map(a => ({ ...a, jobId: job.id }))];
        }
        setApplicants(allApplicants);
      } catch (err) {
        console.error('Error fetching employer data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [employerId]);

  // ─── EVENT HANDLERS ──────────────────────────────────────────────────
  const handleStatusChange = async (appId, newStatus) => {
    try {
      await updateApplicationStatus(appId, newStatus);
      // Update local state
      setApplicants(prev => prev.map(app => 
        app.id === appId ? { ...app, status: newStatus } : app
      ));
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handleModalSave = async (appId, newStatus) => {
    await handleStatusChange(appId, newStatus);
    setReviewApplicant(null);
  };

  const handleAction = (msg) => alert(`Action triggered: ${msg}`);

  const handleLogout = async () => {
    if (onLogout) {
      onLogout();
      return;
    }

    await signOut(auth);
    navigate('/employer-access', { replace: true, state: { mode: 'login' } });
  };

  const getBreadcrumb = () => {
    if (activeTab === 'post-role') return 'Dashboard > Post a Job';
    if (selectedJob) return `Dashboard > ${selectedJob.title} > Applicant Pipeline`;
    if (activeTab === 'ats') return 'Applicant Tracking System';
    if (activeTab === 'profile') return 'Company Profile';
    if (activeTab === 'settings') return 'Account Settings';
    if (activeTab === 'analytics') return 'Reports & Analytics';
    if (activeTab === 'notifications') return 'Notifications';
    if (activeTab === 'history') return 'Dashboard > Activity History';
    return 'Dashboard';
  };

  const navigateTab = (tab) => {
    setActiveTab(tab);
    setSelectedJob(null);
  };

  // ─── RENDER ────────────────────────────────────────────────────────────
  const renderView = () => {
    if (loading) {
      return <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Loading your data...</div>;
    }

    switch (activeTab) {
      case 'history':
        return <ActivityHistoryView activities={fullHistory} onBack={() => navigateTab('dashboard')} />;
      case 'notifications':
        return <NotificationsView notifications={notifications} setNotifications={setNotifications} />;
      case 'profile':
        return (
          <CompanyProfileView
            onSave={() => handleAction('Saving Profile Details to Database')}
            onViewPublic={() => handleAction('Navigating to Public Profile View')}
            onUploadLogo={() => handleAction('Opening local file dialog for Logo Upload')}
          />
        );
      case 'settings':
        return <SettingsView onUpdatePassword={() => handleAction('Updating Security Token via Authentication Service')} />;
      case 'analytics':
        return <ReportsAnalyticsView onExport={() => handleAction('Generating and downloading CSV Export')} />;
      case 'post-role':
        return (
          <PostJobView
            employerId={employerId}
            onCancel={() => navigateTab('dashboard')}
            onSuccess={() => {
              alert('Job posted successfully! It will appear after admin approval.');
              navigateTab('dashboard');
            }}
          />
        );
      case 'ats':
        return (
          <ApplicantTrackingView
            applicants={applicants}
            jobs={myJobs}
            atsFilter={atsFilter}
            onFilterChange={setAtsFilter}
            onStatusChange={handleStatusChange}
            onReview={setReviewApplicant}
          />
        );
      default: // dashboard or job detail
        if (selectedJob) {
          return (
            <JobDetailView
              job={selectedJob}
              applicants={applicants}
              onBack={() => setSelectedJob(null)}
              onStatusChange={handleStatusChange}
              onReview={setReviewApplicant}
              onEdit={() => handleAction('Opening Edit Listing Module')}
            />
          );
        } else {
          return (
            <DashboardView
              myJobs={myJobs}
              applicants={applicants}
              onPostJob={() => navigateTab('post-role')}
              onSelectJob={setSelectedJob}
              recentActivities={recentActivities}
              onViewAllHistory={() => navigateTab('history')}
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
          } else {
            navigateTab(tab);
          }
        }}
      />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <EmployerTopBar
          breadcrumb={getBreadcrumb()}
          notifications={notifications}
          setNotifications={setNotifications}
          onSettings={() => navigateTab('settings')}
          onLogout={handleLogout}
          onSeeAllNotifications={() => navigateTab('notifications')}
        />
        <main style={{ flex: 1, overflowY: 'auto', padding: '40px', backgroundColor: BG_GRAY }}>
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
    </div>
  );
}
