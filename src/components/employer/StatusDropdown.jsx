import { getStatusStyle } from '../../pages/employer/constants';

export default function StatusDropdown({ value, onChange }) {
  const sStyle = getStatusStyle(value);
  return (
    <select
      value={value} onChange={onChange}
      style={{
        backgroundColor: sStyle.bg, color: sStyle.color, border: `1px solid ${sStyle.border}`,
        padding: '6px 28px 6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '700',
        cursor: 'pointer', outline: 'none', colorScheme: 'light', appearance: 'none',
        fontFamily: 'Inter, system-ui, sans-serif',
        backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23${sStyle.color.replace('#', '')}%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E")`,
        backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center', backgroundSize: '12px'
      }}
    >
      <option value="Shortlisted">Shortlisted</option>
      <option value="Pending">Pending</option>
      <option value="Rejected">Rejected</option>
    </select>
  );
}