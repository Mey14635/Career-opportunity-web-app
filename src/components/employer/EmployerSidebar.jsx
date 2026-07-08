// src/components/employer/EmployerSidebar.jsx
import NavButton from '../../components/shared/NavButton';
import { NAVY, GOLD } from '../../pages/employer/constants';
import { LayoutDashboard, FileText, PlusCircle, Building2, BarChart2, Briefcase } from 'lucide-react';

export default function EmployerSidebar({ active, onNavigate }) {
  // ─── DASHBOARD: active for dashboard and history ──────────────────────
  const isDashboardActive = active === 'dashboard' || active === 'history';

  // ─── MY JOBS: active for my‑jobs, job‑detail, and edit‑job ────────────
  const isMyJobsActive = active === 'my-jobs' || active === 'job-detail' || active === 'edit-job';

  return (
    <aside style={{ width: 260, backgroundColor: NAVY, flexShrink: 0, display: 'flex', flexDirection: 'column', height: '100vh', zIndex: 10 }}>
      <div style={{ padding: '24px', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 40, height: 40, backgroundColor: GOLD, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ color: NAVY, fontWeight: 800, fontSize: 15 }}>SU</span>
          </div>
          <div>
            <div style={{ color: 'white', fontWeight: 700, fontSize: 15, lineHeight: 1.2 }}>SU Career Portal</div>
            <div style={{ color: '#94a3b8', fontSize: 12, marginTop: 4 }}>Employer Console</div>
          </div>
        </div>
      </div>

      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <NavButton 
          active={isDashboardActive} 
          onClick={() => onNavigate('dashboard')} 
          icon={LayoutDashboard} 
          label="Dashboard" 
        />
        <NavButton 
          active={isMyJobsActive} 
          onClick={() => onNavigate('my-jobs')} 
          icon={Briefcase} 
          label="My Jobs" 
        />
        <NavButton 
          active={active === 'ats'} 
          onClick={() => onNavigate('ats')} 
          icon={FileText} 
          label="Applicant Tracking" 
        />
        <NavButton 
          active={active === 'post-role'} 
          onClick={() => onNavigate('post-role')} 
          icon={PlusCircle} 
          label="Post a Job" 
        />
        <NavButton 
          active={active === 'profile'} 
          onClick={() => onNavigate('profile')} 
          icon={Building2} 
          label="Company Profile" 
        />
        <NavButton 
          active={active === 'analytics'} 
          onClick={() => onNavigate('analytics')} 
          icon={BarChart2} 
          label="Reports & Analytics" 
        />
      </nav>
    </aside>
  );
}