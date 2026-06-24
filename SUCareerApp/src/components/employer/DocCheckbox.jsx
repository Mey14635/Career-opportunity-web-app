import { Check } from 'lucide-react';
import { NAVY, GOLD } from '../../pages/employer/constants';

export default function DocCheckbox({ label, sub, checked, onChange }) {
  return (
    <div 
      onClick={onChange} 
      style={{ 
        display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', 
        border: checked ? `1px solid ${GOLD}` : '1px solid #e2e8f0', 
        borderRadius: '8px', cursor: 'pointer', marginBottom: '8px', 
        backgroundColor: checked ? '#fffbeb' : '#ffffff', 
        transition: 'all 0.2s', fontFamily: 'Inter, system-ui, sans-serif'
      }}
    >
      <div style={{ 
        width: 18, height: 18, borderRadius: '4px', 
        background: checked ? GOLD : 'transparent', 
        border: checked ? `1px solid ${GOLD}` : '1px solid #cbd5e1', 
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 
      }}>
        {checked && <Check size={14} color="#fff" />}
      </div>
      <div>
        <div style={{ fontSize: '13px', fontWeight: 700, color: NAVY }}>{label}</div>
        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{sub}</div>
      </div>
    </div>
  );
}