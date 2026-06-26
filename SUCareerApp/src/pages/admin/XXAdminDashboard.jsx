import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import OverviewView from './views/OverviewView';
import StudentsView from './views/StudentsView';
import EmployersView from './views/EmployersView';
import ModerationView from './views/ModerationView';
import OpportunityDetailView from './views/OpportunityDetailView';
import Modal from '../../components/admin/Modal';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState({ title: '', message: '', type: '' });
  const [selectedJob, setSelectedJob] = useState(null);
  const navigate = useNavigate();

  const triggerModal = (title, message, type = 'primary') => {
    setModalConfig({ title, message, type });
    setModalOpen(true);
  };

  const handleModalConfirm = () => {
    setModalOpen(false);
  };

  const handleSelectJob = (job) => {
    console.log('setSelectedJob called with:', job.title);
    setSelectedJob(job);
  };

  const handleApproveJob = (job) => {
    triggerModal('Job Approved', `"${job.title}" has been published.`, 'primary');
    setSelectedJob(null);
  };

  const handleRejectJob = (job) => {
    triggerModal('Job Rejected', `"${job.title}" was rejected.`, 'danger');
    setSelectedJob(null);
  };

  const renderContent = () => {
    if (selectedJob) {
      console.log('Rendering detail view for:', selectedJob.title);
      return (
        <OpportunityDetailView
          job={selectedJob}
          onBack={() => setSelectedJob(null)}
          onApprove={() => handleApproveJob(selectedJob)}
          onReject={() => handleRejectJob(selectedJob)}
        />
      );
    }
    switch (activeTab) {
      case 'overview': return <OverviewView />;
      case 'students': return <StudentsView />;
      case 'vetting': return <EmployersView />;
      case 'moderation': return <ModerationView onSelectJob={handleSelectJob} />;
      default: return <OverviewView />;
    }
  };

  return (
    <>
      <AdminLayout activeTab={activeTab} setActiveTab={setActiveTab} navigate={navigate}>
        {renderContent()}
      </AdminLayout>
      <Modal
        isOpen={modalOpen}
        config={modalConfig}
        onClose={() => setModalOpen(false)}
        onConfirm={handleModalConfirm}
      />
    </>
  );
}