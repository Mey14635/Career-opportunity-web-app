import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import Modal from '../../components/shared/Modal';
import TopBar from '../../components/shared/TopBar';
import Sidebar from '../../components/admin/AdminSidebar';
import { BG_GRAY } from './constants';
import { auth } from '../../config/firebase';

import DashboardView from './views/DashboardView';
import StudentsView from './views/StudentsView';
import EmployersView from './views/EmployersView';
import JobReviewsView from './views/JobReviewsView';
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
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  // ─── DATA STATE ──────────────────────────────────────────────────────
  const [stats, setStats] = useState({ totalStudents: 0, activeEmployers: 0, pendingApprovals: 0, totalJobs: 0 });
  const [students, setStudents] = useState([]);
  const [employers, setEmployers] = useState([]);
  const [jobQueue, setJobQueue] = useState([]);
  const [activeJobs, setActiveJobs] = useState([]);
  const [notifications, setNotifications] = useState([]);

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
        />
        <main style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
          {activeTab === 'dashboard' && <DashboardView statsData={stats} />}
          {activeTab === 'students' && <StudentsView studentsData={students} />}
          {activeTab === 'employer-approvals' && <EmployersView employersData={employers} triggerModal={triggerModal} />}
          {activeTab === 'job-reviews' && <JobReviewsView queueData={jobQueue} triggerModal={triggerModal} />}
          {activeTab === 'active-opportunities' && <ActiveOpportunitiesView activeJobsData={activeJobs} triggerModal={triggerModal} />}
          {activeTab === 'analytics' && <AnalyticsView />}
          {activeTab === 'notifications' && <NotificationsView notificationsData={notifications} setNotifications={setNotifications} />}
          {activeTab === 'settings' && <SettingsView />}
        </main>
      </div>
      <Modal
        isOpen={modalOpen}
        config={modalConfig}
        onClose={() => setModalOpen(false)}
        onConfirm={handleModalConfirm}
      />
    </div>
  );
}
