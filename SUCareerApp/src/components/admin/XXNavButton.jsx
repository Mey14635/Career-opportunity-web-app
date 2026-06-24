import { NAVY, GOLD } from '../../pages/admin/constants';

/**
 * Sidebar navigation button with active state styling.
 * @param {boolean} active - whether the current tab is active
 * @param {function} onClick - click handler
 * @param {Icon} icon - Lucide icon component
 * @param {string} label - button text
 */
export default function NavButton({ active, onClick, icon: Icon, label }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '10px 16px',
        borderRadius: 12,
        width: '100%',
        border: 'none',
        cursor: 'pointer',
        background: active ? GOLD : 'transparent',
        color: active ? NAVY : 'rgba(255,255,255,0.7)',
        fontWeight: active ? 700 : 400,
        fontSize: 14,
        transition: 'all 0.2s',
      }}
      // Hover effect: lighter background when not active
      onMouseEnter={(e) => {
        if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
      }}
      onMouseLeave={(e) => {
        if (!active) e.currentTarget.style.background = 'transparent';
      }}
    >
      <Icon size={16} />
      {label}
    </button>
  );
}