import { GOLD, NAVY } from '../../pages/admin/constants';

export default function NavButton({ active, onClick, icon: Icon, label, badge }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px',
        borderRadius: 0, width: '100%', border: 'none', cursor: 'pointer',
        background: active ? GOLD : 'transparent',
        color: active ? NAVY : '#cbd5e1',
        fontWeight: active ? 600 : 400, fontSize: 14, transition: 'all 0.2s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Icon size={18} />
        {label}
      </div>
      {badge > 0 && (
        <span style={{ background: active ? NAVY : '#ef4444', color: 'white', fontSize: 11, fontWeight: 'bold', padding: '2px 6px', borderRadius: 10 }}>
          {badge}
        </span>
      )}
    </button>
  );
}