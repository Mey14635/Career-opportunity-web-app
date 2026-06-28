import { useMemo, useState } from 'react';
import StatusBadge from '../../../components/shared/StatusBadge';
import { NAVY } from '../constants';

export default function EmployersView({ employersData, triggerModal, focusedEmployerId }) {
  const [activeTab, setActiveTab] = useState('all');
  const [manualTabSelected, setManualTabSelected] = useState(false);
  const tabs = [
    { key: 'all', label: 'All Employers' },
    { key: 'pending', label: 'Pending Approvals' },
    { key: 'revoked', label: 'Access Suspended' }
  ];
  const focusedEmployer = useMemo(
    () => employersData.find((emp) => emp.id === focusedEmployerId) || null,
    [employersData, focusedEmployerId]
  );
  const effectiveTab = focusedEmployer?.verificationStatus === 'pending' && !manualTabSelected ? 'pending' : activeTab;

  const filtered = effectiveTab === 'pending'
    ? employersData.filter(emp => emp.verificationStatus === 'pending')
    : effectiveTab === 'revoked'
      ? employersData.filter(emp => emp.verificationStatus === 'rejected')
      : employersData;

  return (
    <div style={{ maxWidth: '1200px' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ margin: '0 0 8px 0', fontSize: 24, fontWeight: 800, color: NAVY }}>Employer Approvals</h1>
        <p style={{ margin: 0, fontSize: 14, color: '#64748b' }}>Vet and manage corporate partner accounts and access privileges.</p>
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, background: 'white', padding: 6, borderRadius: 12, width: 'fit-content', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => {
              setManualTabSelected(true);
              setActiveTab(tab.key);
            }}
            style={{
              padding: '8px 20px', borderRadius: 8, border: 'none',
              background: effectiveTab === tab.key ? NAVY : 'transparent',
              color: effectiveTab === tab.key ? 'white' : '#475569',
              fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
              {['COMPANY NAME', 'INDUSTRY', 'CONTACT PERSON', 'PARTNERSHIP STATUS', 'QUICK ACTIONS'].map((h) => (
                <th key={h} style={{ padding: '16px 24px', fontSize: 12, fontWeight: 700, color: '#94a3b8' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((emp) => (
              <tr key={emp.id} style={{ borderBottom: '1px solid #f1f5f9', background: emp.id === focusedEmployerId ? '#fffbeb' : 'transparent' }}>
                <td style={{ padding: '20px 24px', fontSize: 14, fontWeight: 700, color: NAVY }}>{emp.companyName}</td>
                <td style={{ padding: '20px 24px', fontSize: 14, color: '#64748b' }}>{emp.industry}</td>
                <td style={{ padding: '20px 24px', fontSize: 14, color: '#475569' }}>{emp.contactPerson}</td>
                <td style={{ padding: '20px 24px' }}><StatusBadge status={emp.verificationStatus} /></td>
                <td style={{ padding: '20px 24px' }}>
                  {emp.verificationStatus === 'approved' && (
                    <button onClick={() => triggerModal('Suspend Partner', `Are you sure you want to suspend ${emp.companyName}?`, 'danger', { view: 'employer', id: emp.id, type: 'revoke' })} style={{ padding: '6px 16px', borderRadius: 6, border: '1px solid #ef4444', background: 'transparent', color: '#ef4444', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                      Suspend
                    </button>
                  )}
                  {emp.verificationStatus === 'pending' && (
                    <button onClick={() => triggerModal('Activate Partner', `Approve ${emp.companyName}?`, 'primary', { view: 'employer', id: emp.id, type: 'approve' })} style={{ padding: '6px 16px', borderRadius: 6, border: 'none', background: NAVY, color: '#ffffff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                      Activate Partner
                    </button>
                  )}
                  {emp.verificationStatus === 'rejected' && (
                    <span style={{ fontSize: 13, color: '#94a3b8' }}>—</span>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan="5" style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>No employers found in this view.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
