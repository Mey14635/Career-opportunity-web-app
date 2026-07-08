// src/components/employer/GlobalATSWidget.jsx
import { useState } from 'react';
import { Search, Eye, Users, FileText } from 'lucide-react';
import { NAVY, BG_GRAY } from '../../pages/employer/constants';

// ─── HELPER: Status Badge ──────────────────────────────────────────────
function getStatusBadge(status) {
  const styles = {
    submitted: { bg: '#fef3c7', color: '#d97706', label: 'Submitted' },
    shortlisted: { bg: '#dcfce7', color: '#16a34a', label: 'Shortlisted' },
    rejected: { bg: '#fee2e2', color: '#dc2626', label: 'Rejected' },
  };
  const s = styles[status] || styles.submitted;
  return (
    <span style={{
      display: 'inline-block',
      background: s.bg,
      color: s.color,
      padding: '4px 12px',
      borderRadius: '12px',
      fontSize: 12,
      fontWeight: 700,
      whiteSpace: 'nowrap',
    }}>
      {s.label}
    </span>
  );
}

// ─── HELPER: Format date ──────────────────────────────────────────────
function formatDate(dateValue) {
  if (!dateValue) return 'N/A';
  if (typeof dateValue.toDate === 'function') {
    return dateValue.toDate().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }
  return new Date(dateValue).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

export default function GlobalATSWidget({ applicants, jobs, onReview }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredApps = applicants.filter(app => {
    const name = String(app.name || '');
    const course = String(app.course || '');
    const normalizedSearch = searchTerm.toLowerCase();

    return (
      name.toLowerCase().includes(normalizedSearch) ||
      course.toLowerCase().includes(normalizedSearch)
    );
  });

  return (
    <div>
      {/* ─── HEADER ────────────────────────────────────────────────────── */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ffffff' }}>
        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: NAVY }}>
          Applicant Database
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, backgroundColor: BG_GRAY, padding: '6px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', width: '250px' }}>
          <Search size={14} color="#94a3b8" />
          <input
            type="text"
            placeholder="Search applicants..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              border: 'none',
              background: 'transparent',
              outline: 'none',
              fontSize: 12,
              width: '100%',
              color: '#1e293b',
            }}
          />
        </div>
      </div>

      {/* ─── TABLE ──────────────────────────────────────────────────────── */}
      {filteredApps.length === 0 ? (
        <div style={{ padding: '40px 24px', textAlign: 'center', color: '#64748b', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <div style={{ padding: '12px', backgroundColor: '#f1f5f9', borderRadius: '50%' }}>
            <Users size={20} color="#94a3b8" />
          </div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>No applicants found</div>
          <div style={{ fontSize: 12, color: '#94a3b8' }}>Try adjusting your search or filter.</div>
        </div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
              <th style={{ padding: '12px 20px', fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', width: '25%' }}>
                Applicant
              </th>
              <th style={{ padding: '12px 20px', fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
                Role
              </th>
              <th style={{ padding: '12px 20px', fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
                Applied
              </th>
              <th style={{ padding: '12px 20px', fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
                Status
              </th>
              <th style={{ padding: '12px 20px', fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', textAlign: 'center' }}>
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredApps.map(app => {
              const jobTitle = jobs.find(j => j.id === app.jobId)?.title || 'Role not found';
              return (
                <tr
                  key={app.id}
                  style={{ borderBottom: '1px solid #f1f5f9' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  {/* ─── Applicant Name ────────────────────────────────── */}
                  <td style={{ padding: '12px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: '50%',
                          backgroundColor: NAVY,
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 11,
                          fontWeight: 700,
                          flexShrink: 0,
                        }}
                      >
                        {app.initials || app.name?.[0] || 'A'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: '#1e293b', fontSize: 13 }}>
                          {app.name || 'Unknown Applicant'}
                        </div>
                        <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                          {app.course || 'Course not specified'}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* ─── Role ──────────────────────────────────────────── */}
                  <td style={{ padding: '12px 20px', color: '#1e293b', fontSize: 12, fontWeight: 600 }}>
                    {jobTitle}
                  </td>

                  {/* ─── Date Applied ──────────────────────────────────── */}
                  <td style={{ padding: '12px 20px', color: '#64748b', fontSize: 12 }}>
                    {formatDate(app.appliedAt || app.appliedDate || app.date)}
                  </td>

                  {/* ─── Status ────────────────────────────────────────── */}
                  <td style={{ padding: '12px 20px' }}>
                    {getStatusBadge(app.status)}
                  </td>

                  {/* ─── Action ────────────────────────────────────────── */}
                  <td style={{ padding: '12px 20px', textAlign: 'center' }}>
                    <button
                      onClick={() => onReview(app)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '6px 14px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        background: 'white',
                        color: NAVY,
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'background-color 0.2s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'white')}
                    >
                      <Eye size={14} /> Review
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {/* ─── FOOTER ────────────────────────────────────────────────────── */}
      <div
        style={{
          padding: '10px 20px',
          borderTop: '1px solid #e2e8f0',
          backgroundColor: '#f8fafc',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: 12,
          color: '#94a3b8',
        }}
      >
        <span>
          {filteredApps.length} {filteredApps.length === 1 ? 'applicant' : 'applicants'}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <FileText size={12} /> Review documents before updating status
        </span>
      </div>
    </div>
  );
}