// src/pages/admin/AdminDashboard.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
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
import JobReviewsView from './views/JobReviewsView';
import ActiveOpportunitiesView from './views/ActiveOpportunitiesView';
import RejectedJobsView from './views/RejectedJobsView';
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

  // Data state
  const [stats, setStats] = useState({ totalStudents: 0, activeEmployers: 0, pendingApprovals: 0, totalJobs: 0 });
  const [students, setStudents] = useState([]);
  const [employers, setEmployers] = useState([]);
  const [jobQueue, setJobQueue] = useState([]);
  const [activeJobs, setActiveJobs] = useState([]);
  const [rejectedJobs, setRejectedJobs] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [focusedEmployerId, setFocusedEmployerId] = useState('');
  const [focusedJobId, setFocusedJobId] = useState('');
  const [notificationFocusKey, setNotificationFocusKey] = useState(0);
  const [notificationJobReview, setNotificationJobReview] = useState(null);
  const [notificationEmployerReview, setNotificationEmployerReview] = useState(null);

  // Confirmation modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState(null);

  const triggerModal = (title, message, type, actionData) => {
    setModalConfig({ title, message, type, ...actionData });
    setModalOpen(true);
  };

  // Fetch all data
  const fetchAllData = async () => {
    try {
      const [statsData, studentsData, employersData, pendingJobs, openJobs, rejectedJobsData] = await Promise.all([
        getDashboardStats(),
        getStudents(),
        getEmployers(),
        getOpportunities('pending'),
        getOpportunities('open'),
        getOpportunities('rejected'),
      ]);
      setStats(statsData);
      setStudents(studentsData);
      setEmployers(employersData);
      setJobQueue(pendingJobs);
      setActiveJobs(openJobs);
      setRejectedJobs(rejectedJobsData);

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
      const selectedEmployer = employers.find((employer) => employer.id === entityId || employer.uid === entityId);

      if (selectedEmployer) {
        setNotificationEmployerReview(selectedEmployer);
        return;
      }

      setFocusedEmployerId(entityId);
      setFocusedJobId('');
      setNotificationFocusKey((key) => key + 1);
      setActiveTab('employer-approvals');
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
      setFocusedEmployerId('');
      if (modalConfig.clearSelection) modalConfig.clearSelection();
    } else if (modalConfig.view === 'job') {
      const jobRef = doc(db, 'opportunities', modalConfig.id);
      if (modalConfig.type === 'approve') {
        // Approve: set status to 'open', make active, clear pendingReason
        await updateOpportunityStatus(modalConfig.id, 'open');
        await updateDoc(jobRef, {
          isActive: true,
          pendingReason: null,
          updatedAt: new Date()
        });
        // Refresh both lists
        const [openJobs, pendingJobs] = await Promise.all([
          getOpportunities('open'),
          getOpportunities('pending')
        ]);
        setActiveJobs(openJobs);
        setJobQueue(pendingJobs);
      } else if (modalConfig.type === 'request_edits') {
        // Request edits: set status to 'pending', keep inactive, add pendingReason
        await updateOpportunityStatus(modalConfig.id, 'pending');
        await updateDoc(jobRef, {
          isActive: false,
          pendingReason: 'edits_requested',
          updatedAt: new Date()
        });
        // Refresh pending list
        const pendingJobs = await getOpportunities('pending');
        setJobQueue(pendingJobs);
      } else if (modalConfig.type === 'unrequest_edits') {
        // Unrequest edits – clear pendingReason
        await updateDoc(jobRef, {
          pendingReason: null,
          updatedAt: new Date()
        });
        // Refresh pending list
        const pendingJobs = await getOpportunities('pending');
        setJobQueue(pendingJobs);
      } else if (modalConfig.type === 'reject') {
        // Reject: set status to 'rejected', keep inactive, clear pendingReason
        await updateOpportunityStatus(modalConfig.id, 'rejected');
        await updateDoc(jobRef, {
          isActive: false,
          pendingReason: null,
          updatedAt: new Date()
        });
        // Remove from pending queue and refresh rejected list
        const updatedQueue = jobQueue.filter(j => j.id !== modalConfig.id);
        setJobQueue(updatedQueue);
        const rejectedJobsData = await getOpportunities('rejected');
        setRejectedJobs(rejectedJobsData);
      }
      if (modalConfig.clearSelection) modalConfig.clearSelection();
    } else if (modalConfig.view === 'active') {
      // Unpublish: set status to 'pending', add pendingReason
      await updateOpportunityStatus(modalConfig.id, 'pending');
      const jobRef = doc(db, 'opportunities', modalConfig.id);
      await updateDoc(jobRef, {
        isActive: false,
        pendingReason: 'unpublished',
        updatedAt: new Date()
      });
      // Refresh both lists
      const [openJobs, pendingJobs] = await Promise.all([
        getOpportunities('open'),
        getOpportunities('pending')
      ]);
      setActiveJobs(openJobs);
      setJobQueue(pendingJobs);
    } else if (modalConfig.view === 'rejected') {
      if (modalConfig.type === 'unreject') {
        // Unreject: set status to 'pending', clear pendingReason
        const jobRef = doc(db, 'opportunities', modalConfig.id);
        await updateOpportunityStatus(modalConfig.id, 'pending');
        await updateDoc(jobRef, {
          isActive: false,
          pendingReason: null,
          updatedAt: new Date()
        });
        // Refresh rejected and pending lists
        const [rejectedJobsData, pendingJobs] = await Promise.all([
          getOpportunities('rejected'),
          getOpportunities('pending')
        ]);
        setRejectedJobs(rejectedJobsData);
        setJobQueue(pendingJobs);
      }
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
          {activeTab === 'dashboard' && <DashboardView statsData={stats}
            recentPendingJobs={jobQueue} 
            pendingEmployers={employers.filter(emp => emp.verificationStatus === 'pending')}/>}
          {activeTab === 'students' && <StudentsView studentsData={students} />}
          {activeTab === 'rejected-jobs' && (
            <RejectedJobsView
              rejectedJobsData={rejectedJobs}
              triggerModal={triggerModal}
            />
          )}
          {activeTab === 'employer-approvals' && <EmployersView key={`employers-${notificationFocusKey}`} employersData={employers} triggerModal={triggerModal} focusedEmployerId={focusedEmployerId} />}
          {activeTab === 'job-reviews' && <JobReviewsView key={`jobs-${notificationFocusKey}`} queueData={jobQueue} triggerModal={triggerModal} focusedJobId={focusedJobId} onRefresh={fetchAllData} />}
          {activeTab === 'active-opportunities' && <ActiveOpportunitiesView activeJobsData={activeJobs} triggerModal={triggerModal} />}
          {activeTab === 'analytics' && <AnalyticsView />}
          {activeTab === 'notifications' && <NotificationsView notificationsData={notifications} employersData={employers} onNotificationAction={handleNotificationAction} />}
          {activeTab === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Confirmation Modal */}
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
            <JobReviewsView
              queueData={[notificationJobReview]}
              triggerModal={triggerModal}
              onRefresh={() => {
                fetchAllData();
                setNotificationJobReview(null);
              }}
              focusedJobId={notificationJobReview.id}
            />
          </div>
        </div>
      )}
      {notificationEmployerReview && (
        <div
          role="presentation"
          onClick={() => setNotificationEmployerReview(null)}
          style={{ position: 'fixed', inset: 0, zIndex: 1500, background: 'rgba(15, 23, 42, 0.42)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Employer approval details"
            onClick={(event) => event.stopPropagation()}
            style={{ width: 'min(680px, 100%)', maxHeight: 'calc(100vh - 48px)', overflowY: 'auto', background: '#ffffff', borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 24px 60px rgba(15, 23, 42, 0.22)' }}
          >
            <div style={{ padding: '22px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', gap: 16 }}>
              <div>
                <h2 style={{ margin: 0, color: '#1B3A6B', fontSize: 20, fontWeight: 800 }}>Employer Access Request</h2>
                <p style={{ margin: '6px 0 0', color: '#64748b', fontSize: 13 }}>Review submitted company information before activating access.</p>
              </div>
              <button
                type="button"
                aria-label="Close employer review"
                onClick={() => setNotificationEmployerReview(null)}
                style={{ width: 32, height: 32, border: 'none', borderRadius: 8, background: '#f1f5f9', color: '#64748b', fontSize: 20, lineHeight: 1, cursor: 'pointer' }}
              >
                x
              </button>
            </div>
            <div style={{ padding: 24, display: 'grid', gap: 14 }}>
              {[
                ['Company Name', notificationEmployerReview.companyName || 'Not specified'],
                ['Contact Person', notificationEmployerReview.contactPerson || 'Not specified'],
                ['Email', notificationEmployerReview.email || 'Not specified'],
                ['Phone', notificationEmployerReview.phone || 'Not specified'],
                ['Website', notificationEmployerReview.website || 'Not specified'],
                ['Industry', notificationEmployerReview.industry || 'Not specified'],
                ['Company Size', notificationEmployerReview.size || notificationEmployerReview.companySize || 'Not specified'],
                ['Status', notificationEmployerReview.verificationStatus || 'pending'],
              ].map(([label, value]) => (
                <div key={label} style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: 12, padding: '12px 14px', background: '#f8fafc', borderRadius: 8 }}>
                  <span style={{ color: '#64748b', fontSize: 12, fontWeight: 800, textTransform: 'uppercase' }}>{label}</span>
                  <span style={{ color: '#1e293b', fontSize: 14, fontWeight: 600 }}>{value}</span>
                </div>
              ))}
            </div>
            <div style={{ padding: '18px 24px 24px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button
                type="button"
                onClick={() => setNotificationEmployerReview(null)}
                style={{ padding: '10px 18px', borderRadius: 8, border: '1px solid #cbd5e1', background: '#ffffff', color: '#475569', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
              >
                Close
              </button>
              {notificationEmployerReview.verificationStatus === 'pending' ? (
                <button
                  type="button"
                  onClick={() => {
                    triggerModal('Activate Partner', `Approve ${notificationEmployerReview.companyName || notificationEmployerReview.email || 'this employer'}?`, 'primary', {
                      view: 'employer',
                      id: notificationEmployerReview.id || notificationEmployerReview.uid,
                      type: 'approve',
                      clearSelection: () => setNotificationEmployerReview(null),
                    });
                  }}
                  style={{ padding: '10px 18px', borderRadius: 8, border: 'none', background: '#1B3A6B', color: '#ffffff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
                >
                  Activate Partner
                </button>
              ) : (
                <button type="button" disabled style={{ padding: '10px 18px', borderRadius: 8, border: 'none', background: '#dcfce7', color: '#166534', fontSize: 13, fontWeight: 700 }}>
                  Approved
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
