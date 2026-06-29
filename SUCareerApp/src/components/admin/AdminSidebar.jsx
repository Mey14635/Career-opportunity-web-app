// src/components/admin/AdminSidebar.jsx
import NavButton from '../shared/NavButton';
import { NAVY, GOLD } from '../../pages/admin/constants';
import {
  LayoutDashboard,
  GraduationCap,
  Building2,
  Shield,
  Briefcase,
  XCircle,
  BarChart2,
} from 'lucide-react';

export default function AdminSidebar({ activeTab, setActiveTab }) {
  return (
    <aside style={{ width: 260, background: NAVY, flexShrink: 0, display: 'flex', flexDirection: 'column', height: '100vh', zIndex: 10 }}>
      <div style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, background: GOLD, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ color: NAVY, fontWeight: 800, fontSize: 16 }}>CDS</span>
          </div>
          <div>
            <div style={{ color: 'white', fontWeight: 700, fontSize: 14, lineHeight: 1.2 }}>CDS</div>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>Command Center</div>
          </div>
        </div>
      </div>
      <nav style={{ flex: 1, padding: '24px 0', display: 'flex', flexDirection: 'column', gap: 4 }}>
        <NavButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={LayoutDashboard} label="Dashboard" />
        <NavButton active={activeTab === 'students'} onClick={() => setActiveTab('students')} icon={GraduationCap} label="Students" />
        <NavButton active={activeTab === 'employer-approvals'} onClick={() => setActiveTab('employer-approvals')} icon={Building2} label="Employer Approvals" />
        <NavButton active={activeTab === 'job-reviews'} onClick={() => setActiveTab('job-reviews')} icon={Shield} label="Job Reviews" />
        <NavButton active={activeTab === 'active-opportunities'} onClick={() => setActiveTab('active-opportunities')} icon={Briefcase} label="Active Opportunities" />
        <NavButton active={activeTab === 'rejected-jobs'} onClick={() => setActiveTab('rejected-jobs')} icon={XCircle} label="Rejected Jobs" />
        <NavButton active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} icon={BarChart2} label="Analytics" />
      </nav>
    </aside>
  );
}