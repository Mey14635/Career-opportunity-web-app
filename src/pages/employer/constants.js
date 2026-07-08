export const NAVY = "#1B3A6B";
export const GOLD = "#C9A230";
export const BG_GRAY = "#F8FAFC";

export const inputStyle = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: '6px',
  border: '1px solid #e2e8f0',
  outline: 'none',
  fontFamily: 'Inter, system-ui, sans-serif',
  fontSize: '13px',
  color: '#1e293b',
  backgroundColor: '#ffffff',
  colorScheme: 'light',
  transition: 'border-color 0.2s'
};

export const labelStyle = {
  display: 'block',
  fontSize: '11px',
  fontWeight: 800,
  color: '#475569',
  marginBottom: '6px',
  textTransform: 'uppercase',
  letterSpacing: '0.5px'
};

export const getStatusStyle = (status) => {
  switch(status) {
    case 'Shortlisted': return { color: '#16a34a', bg: '#dcfce7', border: '#bbf7d0' };
    case 'Rejected': return { color: '#dc2626', bg: '#fee2e2', border: '#fecaca' };
    default: return { color: '#475569', bg: '#f1f5f9', border: '#e2e8f0' };
  }
};