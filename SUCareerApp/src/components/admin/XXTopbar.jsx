import { Search } from 'lucide-react';
import { NAVY } from '../../pages/admin/constants';

/**
 * Top bar with search and admin profile (no bell or dropdown chevron).
 */
export default function TopBar() {
  return (
    <header
      style={{
        background: 'white',
        borderBottom: '1px solid rgba(0,0,0,0.07)',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      {/* Search Input - fixed text color */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          background: '#F5F6FA',
          padding: '8px 16px',
          borderRadius: 40,
          width: 300,
        }}
      >
        <Search size={16} color="#9CA3AF" />
        <input
          type="text"
          placeholder="Search users, companies, or jobs..."
          style={{
            background: 'none',
            border: 'none',
            outline: 'none',
            fontSize: 13,
            width: '100%',
            color: '#1e293b', // Explicit dark color for visibility
          }}
        />
      </div>

      {/* Admin Profile - without chevron */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div
          style={{
            width: 36,
            height: 36,
            background: NAVY,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span style={{ color: 'white', fontSize: 14, fontWeight: 'bold' }}>SA</span>
        </div>
        <span style={{ fontSize: 13, fontWeight: 600, color: NAVY }}>CDS Admin</span>
      </div>
    </header>
  );
}