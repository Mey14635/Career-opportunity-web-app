import { useState } from 'react';
import { Search, Eye } from 'lucide-react';
import { NAVY, BG_GRAY } from '../../pages/employer/constants';
import StatusDropdown from './StatusDropdown';

export default function JobApplicantsWidget({ applicants, onStatusChange, onReview }) {
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
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ffffff' }}>
        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: NAVY }}>All Applicants <span style={{ color: '#94a3b8', fontWeight: 500, fontSize: 13 }}>({applicants.length} total)</span></h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, backgroundColor: BG_GRAY, padding: '6px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', width: '220px' }}>
          <Search size={14} color="#94a3b8" />
          <input type="text" placeholder="Search name or course..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: 12, width: '100%', color: '#1e293b' }} />
        </div>
      </div>

      {filteredApps.length === 0 ? (
        <div style={{ padding: '40px 24px', textAlign: 'center', color: '#64748b', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <div style={{ padding: '12px', backgroundColor: '#f1f5f9', borderRadius: '50%' }}><Search size={20} color="#94a3b8" /></div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>No matching applicants found.</div>
        </div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
              {['APPLICANT NAME', 'COURSE OF STUDY', 'DATE APPLIED', 'STATUS', 'ACTION'].map((h, i) => (
                <th key={h} style={{ padding: '12px 20px', fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', width: i === 0 ? '30%' : 'auto' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredApps.map(app => (
              <tr key={app.id} style={{ borderBottom: '1px solid #f1f5f9' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                <td style={{ padding: '12px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: NAVY, color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>{app.initials || 'NA'}</div>
                    <span style={{ fontWeight: 600, color: '#1e293b', fontSize: 13 }}>{app.name || 'Unknown Applicant'}</span>
                  </div>
                </td>
                <td style={{ padding: '12px 20px', color: '#64748b', fontSize: 12 }}>{app.course || 'Course not specified'}</td>
                <td style={{ padding: '12px 20px', color: '#64748b', fontSize: 12 }}>{app.date || 'Not specified'}</td>
                <td style={{ padding: '12px 20px' }}><StatusDropdown value={app.status} onChange={(e) => onStatusChange(app.id, e.target.value)} /></td>
                <td style={{ padding: '12px 20px' }}>
                  <button onClick={() => onReview(app)} style={{ display: 'flex', alignItems: 'center', gap: 6, backgroundColor: '#f1f5f9', border: '1px solid #e2e8f0', color: NAVY, fontSize: 11, fontWeight: 700, cursor: 'pointer', padding: '6px 12px', borderRadius: '6px' }}>
                    <Eye size={12} /> Review Documents
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
