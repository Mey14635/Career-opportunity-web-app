import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import Modal from '../../components/shared/Modal';
import TopBar from '../../components/shared/TopBar';
import Sidebar from '../../components/admin/AdminSidebar';
import { BG_GRAY } from './constants';
import { auth, db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import {
  createAdminEmployerVerificationNotification,
  markNotificationAsRead,
  subscribeToUserNotifications,
} from '../../services/notificationService';

import DashboardView from './views/DashboardView';
import StudentsView from './views/StudentsView';
import EmployersView from './views/EmployersView';
import JobReviewsView, { JobReviewDetails } from './views/JobReviewsView';
import ActiveOpportunitiesView from './views/ActiveOpportunitiesView';
import AnalyticsView from './views/AnalyticsView';
import NotificationsView from './views/NotificationsView';
import SettingsView from './views/SettingsView';

import {
  getDashboardStats,
  getStudents,
  getEmployers,
  getOpportunities,
  updateEmployerStatus,
  updateOpportunityStatus,
} from '../../services/firestoreService';

export default function AdminDashboard({ onLogout }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  // ─── DATA STATE ──────────────────────────────────────────────────────
  const [stats, setStats] = useState({ totalStudents: 0, activeEmployers: 0, pendingApprovals: 0, totalJobs: 0 });
  const [students, setStudents] = useState([]);
  const [employers, setEmployers] = useState([]);
  const [jobQueue, setJobQueue] = useState([]);
  const [activeJobs, setActiveJobs] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [focusedEmployerId, setFocusedEmployerId] = useState('');
  const [focusedJobId, setFocusedJobId] = useState('');
  const [notificationFocusKey, setNotificationFocusKey] = useState(0);
  const [notificationJobReview, setNotificationJobReview] = useState(null);

  // ─── MODAL ──────────────────────────────────────────────────────────
  const [modalOpen, setModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState(null);

  const triggerModal = (title, message, type, actionData) => {
    setModalConfig({ title, message, type, ...actionData });
    setModalOpen(true);
  };

  // ─── FETCH DATA ────────────────────────────────────────────────────
  const fetchAllData = async () => {
    try {
      const [statsData, studentsData, employersData, pendingJobs, openJobs] = await Promise.all([
        getDashboardStats(),
        getStudents(),
        getEmployers(),
        getOpportunities('pending'),
        getOpportunities('open'),
      ]);
      setStats(statsData);
      setStudents(studentsData);
      setEmployers(employersData);
      setJobQueue(pendingJobs);
      setActiveJobs(openJobs);

      Promise.all(
        employersData
          .filter((employer) => employer.verificationStatus === 'pending')
          .map((employer) => createAdminEmployerVerificationNotification(employer))
      ).catch((err) => console.error('Failed to backfill employer approval notifications:', err));
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAllData();
  }, []);

  useEffect(() => {
    if (!user?.uid) {
      return undefined;
    }

    return subscribeToUserNotifications(
      user.uid,
      setNotifications,
      (err) => console.error('Failed to load admin notifications:', err)
    );
  }, [user?.uid]);

  const handleNotificationAction = async (notification) => {
    try {
      if (!notification.read && !notification.isRead) {
        await markNotificationAsRead(notification.id);
      }
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }

    const targetTab =
      notification.action?.targetTab ||
      (notification.type === 'job_review_request' ? 'job-reviews' : '') ||
      (notification.type === 'employer_access_request' ? 'employer-approvals' : '');
    const entityId =
      notification.targetId ||
      notification.action?.entityId ||
      notification.metadata?.jobId ||
      notification.metadata?.employerId ||
      notification.metadata?.id ||
      '';

    if (targetTab === 'employer-approvals') {
      setFocusedEmployerId(entityId);
      setFocusedJobId('');
      setNotificationFocusKey((key) => key + 1);
    } else if (targetTab === 'job-reviews') {
      let selectedJob = jobQueue.find((job) => job.id === entityId);

      if (!selectedJob && entityId) {
        try {
          const jobSnap = await getDoc(doc(db, 'opportunities', entityId));
          selectedJob = jobSnap.exists() ? { id: jobSnap.id, ...jobSnap.data() } : null;
        } catch (err) {
          console.error('Failed to load notification job review:', err);
        }
      }

      if (selectedJob) {
        setNotificationJobReview(selectedJob);
        return;
      }

      setActiveTab('notifications');
      setFocusedJobId('');
      setFocusedEmployerId('');
      return;
    }

    setActiveTab(targetTab || 'notifications');
  };

  // ─── MODAL CONFIRM ─────────────────────────────────────────────
  const handleModalConfirm = async () => {
    if (!modalConfig) return;

    if (modalConfig.view === 'employer') {
      if (modalConfig.type === 'approve') {
        await updateEmployerStatus(modalConfig.id, 'approved');
      } else if (modalConfig.type === 'revoke') {
        await updateEmployerStatus(modalConfig.id, 'rejected');
      }
    } else if (modalConfig.view === 'job') {
      if (modalConfig.type === 'approve') {
        await updateOpportunityStatus(modalConfig.id, 'open');
        const updatedQueue = jobQueue.filter(j => j.id !== modalConfig.id);
        setJobQueue(updatedQueue);
        const openJobs = await getOpportunities('open');
        setActiveJobs(openJobs);
      } else if (modalConfig.type === 'reject') {
        await updateOpportunityStatus(modalConfig.id, 'rejected');
        const updatedQueue = jobQueue.filter(j => j.id !== modalConfig.id);
        setJobQueue(updatedQueue);
      }
      if (modalConfig.clearSelection) modalConfig.clearSelection();
    } else if (modalConfig.view === 'active') {
      await updateOpportunityStatus(modalConfig.id, 'closed');
      const openJobs = await getOpportunities('open');
      setActiveJobs(openJobs);
    }

    setModalOpen(false);
    await fetchAllData();
  };

  const handleSignOut = async () => {
    if (onLogout) onLogout();
    else {
      await signOut(auth);
      navigate('/', { replace: true });
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'Inter, system-ui, sans-serif', backgroundColor: BG_GRAY }}>
        <div style={{ fontSize: 18, color: '#64748b' }}>Loading platform data...</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', fontFamily: 'Inter, system-ui, sans-serif', backgroundColor: BG_GRAY }}>
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <TopBar
          onLogout={handleSignOut}
          onSettings={() => setActiveTab('settings')}
          notifications={notifications}
          setActiveTab={setActiveTab}
          onNotificationAction={handleNotificationAction}
        />
        <main style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
          {activeTab === 'dashboard' && <DashboardView statsData={stats} />}
          {activeTab === 'students' && <StudentsView studentsData={students} />}
          {activeTab === 'employer-approvals' && <EmployersView key={`employers-${notificationFocusKey}`} employersData={employers} triggerModal={triggerModal} focusedEmployerId={focusedEmployerId} />}
          {activeTab === 'job-reviews' && <JobReviewsView key={`jobs-${notificationFocusKey}`} queueData={jobQueue} triggerModal={triggerModal} focusedJobId={focusedJobId} />}
          {activeTab === 'active-opportunities' && <ActiveOpportunitiesView activeJobsData={activeJobs} triggerModal={triggerModal} />}
          {activeTab === 'analytics' && <AnalyticsView />}
          {activeTab === 'notifications' && <NotificationsView notificationsData={notifications} onNotificationAction={handleNotificationAction} />}
          {activeTab === 'settings' && <SettingsView />}
        </main>
      </div>
      <Modal
        isOpen={modalOpen}
        config={modalConfig}
        onClose={() => setModalOpen(false)}
        onConfirm={handleModalConfirm}
      />
      {notificationJobReview && (
        <div
          role="presentation"
          onClick={() => setNotificationJobReview(null)}
          style={{ position: 'fixed', inset: 0, zIndex: 1500, background: 'rgba(15, 23, 42, 0.42)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Job review details"
            onClick={(event) => event.stopPropagation()}
            style={{ width: 'min(1000px, 100%)', maxHeight: 'calc(100vh - 48px)', overflowY: 'auto', position: 'relative' }}
          >
            <button
              type="button"
              aria-label="Close job review"
              onClick={() => setNotificationJobReview(null)}
              style={{ position: 'absolute', top: 14, right: 14, zIndex: 2, width: 32, height: 32, border: 'none', borderRadius: 8, background: '#f1f5f9', color: '#64748b', fontSize: 20, lineHeight: 1, cursor: 'pointer' }}
            >
              x
            </button>
            <JobReviewDetails
              selectedJob={notificationJobReview}
              triggerModal={triggerModal}
              clearSelection={() => setNotificationJobReview(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
