export default function StatusBadge({ status }) {
  const styles = {
    Active: { bg: '#dcfce7', color: '#16a34a' },
    Pending: { bg: '#fef3c7', color: '#d97706' },
    'Pending Review': { bg: '#fef3c7', color: '#d97706' },
    Revoked: { bg: '#fee2e2', color: '#dc2626' },
    Complete: { bg: '#dcfce7', color: '#16a34a' },
    Incomplete: { bg: '#f1f5f9', color: '#64748b' },
  };
  const s = styles[status] || styles.Active;
  return (
    <span style={{ background: s.bg, color: s.color, padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, display: 'inline-block' }}>
      {status}
    </span>
  );
}