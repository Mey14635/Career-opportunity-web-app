import { Search } from 'lucide-react';
import StatusBadge from '../../../components/shared/StatusBadge';
import { NAVY, GOLD } from '../constants';

export default function StudentsView({ studentsData }) {
  return (
    <div style={{ maxWidth: '1200px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <h1 style={{ margin: '0 0 8px 0', fontSize: 24, fontWeight: 800, color: NAVY }}>Students</h1>
          <p style={{ margin: 0, fontSize: 14, color: '#64748b' }}>Manage and inspect registered student accounts and profiles.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#ffffff', padding: '10px 16px', borderRadius: 8, width: 300, border: '1px solid #e2e8f0' }}>
          <Search size={16} color="#9CA3AF" />
          <input type="text" placeholder="Search by name or student ID" style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: 13, width: '100%', color: '#1e293b' }} />
        </div>
      </div>
      <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #e2e8f0', background: '#ffffff' }}>
              {['STUDENT NAME', 'COURSE OF STUDY', 'ACADEMIC YEAR', 'PROFILE STATUS', 'ACTIONS'].map((h) => (
                <th key={h} style={{ padding: '16px 24px', fontSize: 12, fontWeight: 700, color: '#94a3b8' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {studentsData.map((s) => (
              <tr key={s.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '20px 24px', fontSize: 14, fontWeight: 700, color: NAVY }}>{`${s.firstName} ${s.lastName}`}</td>
                <td style={{ padding: '20px 24px', fontSize: 14, color: '#64748b' }}>{s.course}</td>
                <td style={{ padding: '20px 24px', fontSize: 14, color: '#94a3b8' }}>{`Year ${s.yearOfStudy}`}</td>
                <td style={{ padding: '20px 24px' }}><StatusBadge status={s.verificationStatus || 'Complete'} /></td>
                <td style={{ padding: '20px 24px' }}>
                  <button style={{ background: 'none', border: 'none', color: GOLD, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>View Profile</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}