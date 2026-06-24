import { NAVY, GOLD, stats } from '../../pages/admin/constants';

/**
 * Displays 4 metric cards on the Overview page.
 */
export default function StatsCards() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20, marginBottom: 32 }}>
      {stats.map((stat, i) => (
        <div
          key={i}
          style={{
            background: 'white',
            borderRadius: 16,
            padding: 20,
            borderLeft: `4px solid ${stat.urgent ? GOLD : NAVY}`,
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase' }}>
              {stat.label}
            </span>
            <stat.icon size={18} color={stat.urgent ? GOLD : NAVY} />
          </div>
          <div style={{ fontSize: 32, fontWeight: 800, color: stat.urgent ? GOLD : NAVY }}>
            {stat.count}
          </div>
          <div style={{ fontSize: 12, color: stat.urgent ? '#b45309' : '#10b981', marginTop: 6 }}>
            {stat.change}
          </div>
        </div>
      ))}
    </div>
  );
}