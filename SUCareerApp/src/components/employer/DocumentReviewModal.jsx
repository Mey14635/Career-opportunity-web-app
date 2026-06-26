import { useState } from 'react';
import { X, Mail, Calendar, MessageSquare, FileJson, Download } from 'lucide-react';
import { NAVY } from '../../pages/employer/constants';
import StatusDropdown from './StatusDropdown';

export default function DocumentReviewModal({ applicant, onClose, onSave }) {
  const [tempStatus, setTempStatus] = useState(applicant.status);
  const docs = Array.isArray(applicant.docs) ? applicant.docs : [];

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, backdropFilter: 'blur(2px)' }} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{ backgroundColor: '#ffffff', width: '100%', maxWidth: '500px', borderRadius: '12px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: NAVY, color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700 }}>
                {applicant.initials || 'NA'}
              </div>
              <div>
                <h3 style={{ margin: '0 0 2px 0', fontSize: '18px', fontWeight: '800', color: NAVY }}>{applicant.name || 'Unknown Applicant'}</h3>
                <div style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>{applicant.course || 'Course not specified'}</div>
              </div>
            </div>
            <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', cursor: 'pointer', color: '#64748b', padding: '6px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={16} /></button>
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
            <button onClick={() => alert(`Drafting email to ${applicant.email}`)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '8px', backgroundColor: '#eff6ff', color: '#1e3a8a', border: 'none', borderRadius: '6px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
              <Mail size={14}/> Email
            </button>
            <button onClick={() => alert(`Opening scheduling tool for ${applicant.name}`)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '8px', backgroundColor: '#f0fdf4', color: '#166534', border: 'none', borderRadius: '6px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
              <Calendar size={14}/> Schedule
            </button>
            <button onClick={() => alert(`Opening message thread with ${applicant.name}`)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '8px', backgroundColor: '#fef3c7', color: '#d97706', border: 'none', borderRadius: '6px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
              <MessageSquare size={14}/> Message
            </button>
          </div>
        </div>

        <div style={{ padding: '20px 24px' }}>
          <h4 style={{ margin: '0 0 12px 0', fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Submitted Documents</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {docs.length === 0 && (
              <div style={{ padding: '12px', border: '1px solid #e2e8f0', borderRadius: '6px', color: '#64748b', fontSize: 13 }}>
                No documents were attached to this application.
              </div>
            )}
            {docs.map((doc, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '6px', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.borderColor = NAVY} onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ padding: '8px', backgroundColor: '#fee2e2', borderRadius: '6px' }}><FileJson size={16} color="#dc2626" /></div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>{doc.name}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{doc.size} • Uploaded {applicant.date}</div>
                  </div>
                </div>
                <button onClick={() => doc.url ? window.open(doc.url, '_blank', 'noopener,noreferrer') : alert(`No download link available for ${doc.name}`)} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', cursor: 'pointer', color: NAVY, padding: '6px', borderRadius: '6px', display: 'flex', alignItems: 'center' }}><Download size={14} /></button>
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding: '16px 24px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Update Status:</span>
            <StatusDropdown value={tempStatus} onChange={(e) => setTempStatus(e.target.value)} />
          </div>
          <button onClick={() => onSave(applicant.id, tempStatus)} style={{ padding: '8px 20px', borderRadius: '6px', border: 'none', backgroundColor: NAVY, color: '#ffffff', fontSize: '13px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 12px rgba(27, 58, 107, 0.2)' }}>
            Save Profile
          </button>
        </div>
      </div>
    </div>
  );
}
