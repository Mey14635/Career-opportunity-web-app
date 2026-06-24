import { useState } from 'react';
import { NAVY, allEmployers } from '../../pages/admin/constants';
import StatusBadge from './StatusBadge';

export default function EmployersTable() {
  const [employers, setEmployers] = useState(allEmployers);
  const [activeTab, setActiveTab] = useState('all');
  const [modalData, setModalData] = useState(null); // { type, employerName }

  const tabs = [
    { key: 'all', label: 'All Employers' },
    { key: 'pending', label: 'Pending Vetting' },
    { key: 'revoked', label: 'Access Revoked' },
  ];

  const filteredEmployers = employers.filter(emp => {
    if (activeTab === 'pending') return emp.status === 'Pending';
    if (activeTab === 'revoked') return emp.status === 'Revoked';
    return true;
  });

  // Open modal with type and employer name
  const openModal = (type, employerName) => {
    setModalData({ type, employerName });
  };

  // Close modal
  const closeModal = () => {
    setModalData(null);
  };

  // Confirm action (approve or revoke)
  const confirmAction = () => {
    if (!modalData) return;
    const { type, employerName } = modalData;
    if (type === 'approve') {
      setEmployers(prev =>
        prev.map(emp =>
          emp.name === employerName
            ? { ...emp, status: 'Active', contractStatus: 'Active' }
            : emp
        )
      );
    } else if (type === 'revoke') {
      setEmployers(prev =>
        prev.map(emp =>
          emp.name === employerName
            ? { ...emp, status: 'Revoked', contractStatus: 'Revoked' }
            : emp
        )
      );
    }
    closeModal();
  };

  return (
    <>
      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, background: 'white', padding: 4, borderRadius: 40, width: 'fit-content', border: '1px solid #e2e8f0' }}>
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '8px 20px',
              borderRadius: 40,
              border: 'none',
              background: activeTab === tab.key ? NAVY : 'transparent',
              color: activeTab === tab.key ? 'white' : '#475569',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Employers Table */}
      <div style={{ background: 'white', borderRadius: 16, overflow: 'auto', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#F9FAFB', borderBottom: '1px solid rgba(0,0,0,0.07)' }}>
              {['Company Name', 'Industry', 'Contact Person', 'Contract Status', 'Actions'].map(h => (
                <th key={h} style={{ padding: '14px 20px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#9CA3AF' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredEmployers.map(emp => (
              <tr key={emp.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                <td style={{ padding: '14px 20px', fontWeight: 600, color: NAVY }}>{emp.name}</td>
                <td style={{ padding: '14px 20px', fontSize: 13, color: '#6B7280' }}>{emp.industry}</td>
                <td style={{ padding: '14px 20px', fontSize: 13, color: '#374151' }}>{emp.contact}</td>
                <td style={{ padding: '14px 20px' }}><StatusBadge status={emp.contractStatus} /></td>
                <td style={{ padding: '14px 20px', display: 'flex', gap: 8 }}>
                  {emp.status === 'Pending' && (
                    <button
                      onClick={() => openModal('approve', emp.name)}
                      style={{ background: NAVY, color: 'white', border: 'none', padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                    >
                      Approve Partner
                    </button>
                  )}
                  {emp.status === 'Active' && (
                    <button
                      onClick={() => openModal('revoke', emp.name)}
                      style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                    >
                      Revoke Access
                    </button>
                  )}
                  {emp.status === 'Revoked' && <span style={{ fontSize: 12, color: '#9CA3AF' }}>—</span>}
                </td>
              </tr>
            ))}
            {filteredEmployers.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#9CA3AF' }}>No employers found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal - guaranteed working cancel button */}
      {modalData && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
          }}
          onClick={(e) => {
            // Close if clicking on the backdrop
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div
            style={{
              background: 'white',
              width: 450,
              borderRadius: 12,
              borderTop: `4px solid ${modalData.type === 'approve' ? NAVY : '#dc2626'}`,
              boxShadow: '0 20px 35px rgba(0,0,0,0.2)',
              overflow: 'hidden',
            }}
          >
            <div style={{ padding: '24px 28px' }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: 20, fontWeight: 700, color: modalData.type === 'approve' ? NAVY : '#dc2626' }}>
                {modalData.type === 'approve' ? 'Approve Employer' : 'Revoke Employer Access'}
              </h3>
              <p style={{ margin: 0, color: '#334155', fontSize: 14, lineHeight: 1.6 }}>
                {modalData.type === 'approve'
                  ? `Grant platform access to ${modalData.employerName}?`
                  : `Revoke access for ${modalData.employerName}? This will terminate login, hide listings, and block applicant data.`}
              </p>
            </div>
            <div style={{ padding: '16px 28px', background: '#f8fafc', display: 'flex', justifyContent: 'flex-end', gap: 12, borderTop: '1px solid #e2e8f0' }}>
              <button
                onClick={closeModal}
                style={{
                  padding: '8px 18px',
                  borderRadius: 30,
                  border: '1px solid #cbd5e1',
                  background: 'white',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  color: '#1e293b',
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmAction}
                style={{
                  padding: '8px 18px',
                  borderRadius: 30,
                  border: 'none',
                  background: modalData.type === 'approve' ? NAVY : '#dc2626',
                  color: 'white',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}