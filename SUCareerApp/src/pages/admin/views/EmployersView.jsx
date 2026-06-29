// src/pages/admin/views/EmployersView.jsx
import { useState } from 'react';
import { Eye, X, Building2, Mail, User, Calendar, Globe, Phone, Users, Award } from 'lucide-react';
import StatusBadge from '../../../components/shared/StatusBadge';
import { NAVY } from '../constants';

// ─── EMPLOYER DETAIL MODAL ──────────────────────────────────────────
function EmployerDetailModal({ employer, onClose }) {
  if (!employer) return null;

  // Helper: Format date
  const formatDate = (dateValue) => {
    if (!dateValue) return 'N/A';
    if (typeof dateValue.toDate === 'function') {
      return dateValue.toDate().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
    }
    return new Date(dateValue).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Helper: Display value or "Not specified"
  const displayValue = (value) => {
    return value && value.trim() ? value : 'Not specified';
  };

  // Helper: Format company size
  const formatCompanySize = (size) => {
    if (!size) return 'Not specified';
    const sizeMap = {
      '1-50': '1-50 Employees',
      '51-200': '51-200 Employees',
      '201-500': '201-500 Employees',
      '500+': '500+ Employees',
    };
    return sizeMap[size] || size;
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        backdropFilter: 'blur(2px)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          width: '100%',
          maxWidth: '620px',
          borderRadius: '12px',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
          padding: '32px',
          maxHeight: '90vh',
          overflowY: 'auto',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            background: '#f1f5f9',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <X size={18} color="#64748b" />
        </button>

        {/* Company Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <div style={{
            width: 56,
            height: 56,
            borderRadius: '12px',
            backgroundColor: '#f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid #e2e8f0',
            flexShrink: 0,
          }}>
            <Building2 size={28} color={NAVY} />
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: '0 0 4px 0', fontSize: 20, fontWeight: 800, color: NAVY }}>
              {employer.companyName}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <StatusBadge status={employer.verificationStatus} />
            </div>
          </div>
        </div>

        {/* Employer Details - Two column layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          {/* Company Info */}
          <div style={{ gridColumn: 'span 2', marginBottom: 4 }}>
            <h4 style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 12px 0' }}>
              Company Information
            </h4>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: '#f8fafc', borderRadius: '8px' }}>
            <Building2 size={18} color="#64748b" />
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                Industry
              </div>
              <div style={{ fontSize: 14, color: '#1e293b', fontWeight: 500 }}>
                {displayValue(employer.industry)}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: '#f8fafc', borderRadius: '8px' }}>
            <Users size={18} color="#64748b" />
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                Company Size
              </div>
              <div style={{ fontSize: 14, color: '#1e293b', fontWeight: 500 }}>
                {formatCompanySize(employer.size || employer.companySize)}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: '#f8fafc', borderRadius: '8px' }}>
            <Globe size={18} color="#64748b" />
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                Website
              </div>
              <div style={{ fontSize: 14, color: '#1e293b', fontWeight: 500 }}>
                {employer.website && employer.website.trim() ? (
                  <a
                    href={employer.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: NAVY, textDecoration: 'none' }}
                    onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                    onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                  >
                    {employer.website}
                  </a>
                ) : 'Not specified'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: '#f8fafc', borderRadius: '8px' }}>
            <Award size={18} color="#64748b" />
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                Status
              </div>
              <div style={{ fontSize: 14, color: '#1e293b', fontWeight: 500 }}>
                <StatusBadge status={employer.verificationStatus} />
              </div>
            </div>
          </div>
        </div>

        {/* Contact Details */}
        <div style={{ marginBottom: 16 }}>
          <h4 style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 12px 0' }}>
            Contact Details
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: '#f8fafc', borderRadius: '8px' }}>
              <User size={18} color="#64748b" />
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                  Contact Person
                </div>
                <div style={{ fontSize: 14, color: '#1e293b', fontWeight: 500 }}>
                  {displayValue(employer.contactPerson)}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: '#f8fafc', borderRadius: '8px' }}>
              <Mail size={18} color="#64748b" />
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                  Email Address
                </div>
                <div style={{ fontSize: 14, color: '#1e293b', fontWeight: 500 }}>
                  {displayValue(employer.email || employer.contactEmail)}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: '#f8fafc', borderRadius: '8px' }}>
              <Phone size={18} color="#64748b" />
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                  Phone Number
                </div>
                <div style={{ fontSize: 14, color: '#1e293b', fontWeight: 500 }}>
                  {displayValue(employer.phone)}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: '#f8fafc', borderRadius: '8px' }}>
              <Calendar size={18} color="#64748b" />
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                  Registered On
                </div>
                <div style={{ fontSize: 14, color: '#1e293b', fontWeight: 500 }}>
                  {formatDate(employer.createdAt)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Close button */}
        <div style={{ marginTop: 8, display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 24px',
              borderRadius: '8px',
              border: 'none',
              background: NAVY,
              color: 'white',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0f2a4a'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = NAVY}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────
export default function EmployersView({ employersData, triggerModal }) {
  const [activeTab, setActiveTab] = useState('all');
  const [selectedEmployer, setSelectedEmployer] = useState(null);

  const tabs = [
    { key: 'all', label: 'All Employers' },
    { key: 'pending', label: 'Pending Approvals' },
    { key: 'revoked', label: 'Access Suspended' }
  ];

  const filtered = activeTab === 'pending'
    ? employersData.filter(emp => emp.verificationStatus === 'pending')
    : activeTab === 'revoked'
      ? employersData.filter(emp => emp.verificationStatus === 'rejected')
      : employersData;

  return (
    <div style={{ maxWidth: '1200px' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ margin: '0 0 8px 0', fontSize: 24, fontWeight: 800, color: NAVY }}>Employer Approvals</h1>
        <p style={{ margin: 0, fontSize: 14, color: '#64748b' }}>Vet and manage corporate partner accounts and access privileges.</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, background: 'white', padding: 6, borderRadius: 12, width: 'fit-content', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '8px 20px', borderRadius: 8, border: 'none',
              background: activeTab === tab.key ? NAVY : 'transparent',
              color: activeTab === tab.key ? 'white' : '#475569',
              fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
              {['COMPANY NAME', 'INDUSTRY', 'CONTACT PERSON', 'PARTNERSHIP STATUS', 'ACTIONS'].map((h) => (
                <th key={h} style={{ padding: '16px 24px', fontSize: 12, fontWeight: 700, color: '#94a3b8' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((emp) => (
              <tr key={emp.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '20px 24px', fontSize: 14, fontWeight: 700, color: NAVY }}>{emp.companyName}</td>
                <td style={{ padding: '20px 24px', fontSize: 14, color: '#64748b' }}>{emp.industry}</td>
                <td style={{ padding: '20px 24px', fontSize: 14, color: '#475569' }}>{emp.contactPerson}</td>
                <td style={{ padding: '20px 24px' }}><StatusBadge status={emp.verificationStatus} /></td>
                <td style={{ padding: '20px 24px' }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    {/* ─── VIEW BUTTON ─── */}
                    <button
                      onClick={() => setSelectedEmployer(emp)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        padding: '6px 12px',
                        borderRadius: 6,
                        border: '1px solid #cbd5e1',
                        background: 'transparent',
                        color: '#475569',
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'background-color 0.2s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <Eye size={14} /> View
                    </button>

                    {/* ─── STATUS ACTIONS ─── */}
                    {emp.verificationStatus === 'approved' && (
                      <button
                        onClick={() => triggerModal('Suspend Partner', `Are you sure you want to suspend ${emp.companyName}?`, 'danger', { view: 'employer', id: emp.id, type: 'revoke' })}
                        style={{ padding: '6px 16px', borderRadius: 6, border: '1px solid #ef4444', background: 'transparent', color: '#ef4444', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                      >
                        Suspend
                      </button>
                    )}
                    {emp.verificationStatus === 'pending' && (
                      <button
                        onClick={() => triggerModal('Activate Partner', `Approve ${emp.companyName}?`, 'primary', { view: 'employer', id: emp.id, type: 'approve' })}
                        style={{ padding: '6px 16px', borderRadius: 6, border: 'none', background: NAVY, color: '#ffffff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                      >
                        Activate Partner
                      </button>
                    )}
                    {emp.verificationStatus === 'rejected' && (
                      <span style={{ fontSize: 13, color: '#94a3b8' }}>—</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan="5" style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>No employers found in this view.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ─── EMPLOYER DETAIL MODAL ─── */}
      {selectedEmployer && (
        <EmployerDetailModal
          employer={selectedEmployer}
          onClose={() => setSelectedEmployer(null)}
        />
      )}
    </div>
  );
}