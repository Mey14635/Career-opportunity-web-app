import { NAVY, GOLD, students } from '../../pages/admin/constants';
import StatusBadge from './StatusBadge';

/**
 * Table listing all students with status badges.
 */
export default function StudentsTable() {
  return (
    <div
      style={{
        background: 'white',
        borderRadius: 16,
        overflow: 'auto',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      }}
    >
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#F9FAFB', borderBottom: '1px solid rgba(0,0,0,0.07)' }}>
            {['Admission No.', 'Student Name', 'Course', 'Status', 'Action'].map((h) => (
              <th
                key={h}
                style={{
                  padding: '14px 20px',
                  textAlign: 'left',
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#9CA3AF',
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {students.map((s) => (
            <tr
              key={s.id}
              style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <td style={{ padding: '14px 20px', fontSize: 13, color: '#6B7280' }}>{s.id}</td>
              <td style={{ padding: '14px 20px', fontSize: 13, fontWeight: 600, color: NAVY }}>{s.name}</td>
              <td style={{ padding: '14px 20px', fontSize: 13, color: '#374151' }}>{s.course}</td>
              <td style={{ padding: '14px 20px' }}>
                <StatusBadge status={s.status} />
              </td>
              <td style={{ padding: '14px 20px' }}>
                <button
                  style={{
                    color: GOLD,
                    fontSize: 12,
                    fontWeight: 600,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  View Profile
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}