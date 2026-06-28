// src/pages/admin/AdminDashboard.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import Modal from '../../components/shared/Modal';
import TopBar from '../../components/shared/TopBar';
import Sidebar from '../../components/admin/AdminSidebar';
import { BG_GRAY } from './constants';
import { auth, db } from '../../config/firebase';

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
        />
        <main style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
          {activeTab === 'dashboard' && <DashboardView statsData={stats}
            recentPendingJobs={jobQueue} 
            pendingEmployers={employers.filter(emp => emp.verificationStatus === 'pending')}/>}
          {activeTab === 'students' && <StudentsView studentsData={students} />}
          {activeTab === 'employer-approvals' && <EmployersView employersData={employers} triggerModal={triggerModal} />}
          {activeTab === 'job-reviews' && (
            <JobReviewsView
              queueData={jobQueue}
              triggerModal={triggerModal}
            />
          )}
          {activeTab === 'active-opportunities' && (
            <ActiveOpportunitiesView
              activeJobsData={activeJobs}
              triggerModal={triggerModal}
            />
          )}
          {activeTab === 'rejected-jobs' && (
            <RejectedJobsView
              rejectedJobsData={rejectedJobs}
              triggerModal={triggerModal}
            />
          )}
          {activeTab === 'analytics' && <AnalyticsView />}
          {activeTab === 'notifications' && <NotificationsView notificationsData={notifications} setNotifications={setNotifications} />}
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
    </div>
  );
}