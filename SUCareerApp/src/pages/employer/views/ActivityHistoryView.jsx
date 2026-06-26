import { ArrowLeft } from 'lucide-react';
import { NAVY } from '../constants';

export default function ActivityHistoryView({ activities, onBack }) {
  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: '0 0 4px 0', fontSize: 20, fontWeight: 800, color: NAVY }}>Activity History</h1>
          <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>A complete log of your account's actions and events.</p>
        </div>
        <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', color: '#475569', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
          <ArrowLeft size={14} /> Back to Dashboard
        </button>
      </div>

      <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
        {activities.map((act, i) => (
          <div key={act.id} style={{ padding: '20px 24px', borderBottom: i !== activities.length - 1 ? '1px solid #f1f5f9' : 'none', display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 40, height: 40, borderRadius: '10px', backgroundColor: act.bg, color: act.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <act.icon size={20} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>{act.action}</div>
              <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>{act.details}</div>
            </div>
            <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>{act.time}</div>
          </div>
        ))}
      </div>
    </div>
  );
}