import { Users, Building2, AlertTriangle, FileText } from 'lucide-react';
import { NAVY, BG_GRAY } from '../constants';

export default function DashboardView({ statsData }) {
  const stats = [
    { label: 'Total Students', count: statsData.totalStudents, change: '+12% this sem', urgent: false, icon: Users },
    { label: 'Active Employers', count: statsData.activeEmployers, change: 'Corporate Partners', urgent: false, icon: Building2 },
    { label: 'Pending Approvals', count: statsData.pendingApprovals, change: 'Requires review', urgent: true, icon: AlertTriangle },
    { label: 'Jobs Reviewed', count: statsData.totalJobs, change: 'Past 30 days', urgent: false, icon: FileText },
  ];

  return (
    <div style={{ maxWidth: '1200px' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ margin: '0 0 8px 0', fontSize: 24, fontWeight: 800, color: NAVY }}>Dashboard</h1>
        <p style={{ margin: 0, fontSize: 14, color: '#64748b' }}>Real-time platform health and activity — Academic Year 2025/26.</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, marginBottom: 32 }}>
        {stats.map((stat, i) => (
          <div key={i} style={{ background: '#ffffff', borderRadius: 12, padding: 24, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>{stat.label}</span>
              <div style={{ backgroundColor: stat.urgent ? '#fef9c3' : BG_GRAY, padding: '8px', borderRadius: '8px' }}>
                <stat.icon size={18} color={stat.urgent ? '#ca8a04' : NAVY} />
              </div>
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: NAVY }}>{stat.count}</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: stat.urgent ? '#ca8a04' : '#64748b', marginTop: 8 }}>{stat.change}</div>
          </div>
        ))}
      </div>
      <div style={{ background: '#ffffff', borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: NAVY }}>Activity Log</h3>
          <span style={{ fontSize: 13, color: '#94a3b8' }}>Showing last 24 hours</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {/* Use mockAuditLogs from constants or keep static */}
          {[
            { time: '10:42 AM', action: 'System Admin activated McKinsey & Company employer account.', type: 'approval' },
            { time: '10:15 AM', action: 'New job opportunity "Software Engineering Intern" submitted by Safaricom PLC.', type: 'submission' },
            { time: '09:30 AM', action: 'System flagged student profile #120455 for incomplete documentation.', type: 'flag' },
          ].map((log, idx) => (
            <div key={idx} style={{ padding: '16px 24px', borderBottom: idx < 2 ? '1px solid #f1f5f9' : 'none', display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: log.type === 'danger' ? '#ef4444' : log.type === 'warning' ? '#eab308' : '#94a3b8' }} />
              <div style={{ flex: 1, fontSize: 14, color: '#334155' }}>{log.action}</div>
              <div style={{ fontSize: 13, color: '#94a3b8', whiteSpace: 'nowrap' }}>{log.time}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}