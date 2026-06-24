import { Download } from 'lucide-react';
import { NAVY, GOLD, mockBarData, mockCourseData } from '../constants';

export default function AnalyticsView() {
  return (
    <div style={{ maxWidth: '1200px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <h1 style={{ margin: '0 0 8px 0', fontSize: 24, fontWeight: 800, color: NAVY }}>Platform Analytics & Reporting</h1>
          <p style={{ margin: 0, fontSize: 14, color: '#64748b' }}>Data insights — January to June 2026 academic cycle.</p>
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: 8, background: GOLD, color: NAVY, border: 'none', padding: '10px 20px', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
          <Download size={16} /> Export to CSV
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 24, marginBottom: 24 }}>
        {/* Same as original – copy from previous */}
        <div style={{ background: 'white', padding: 32, borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <h3 style={{ margin: '0 0 24px 0', fontSize: 16, fontWeight: 700, color: NAVY }}>Application Funnel</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {mockBarData.map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ width: 140, fontSize: 13, color: '#475569', textAlign: 'right', paddingRight: 16 }}>{item.label}</div>
                <div style={{ flex: 1, background: '#f1f5f9', height: 24, borderRadius: 4, overflow: 'hidden', position: 'relative' }}>
                  <div style={{ width: `${(item.val / 1000) * 100}%`, background: NAVY, height: '100%', borderRadius: 4 }} />
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginLeft: 140, marginTop: 12, color: '#94a3b8', fontSize: 12, padding: '0 16px' }}>
            <span>0</span><span>250</span><span>500</span><span>750</span><span>1000</span>
          </div>
        </div>
        <div style={{ background: 'white', padding: 32, borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h3 style={{ margin: '0 0 24px 0', fontSize: 16, fontWeight: 700, color: NAVY, alignSelf: 'flex-start' }}>Opportunity Market Trends</h3>
          <div style={{ position: 'relative', width: 200, height: 200, borderRadius: '50%', background: `conic-gradient(${NAVY} 0% 60%, ${GOLD} 60% 85%, #94a3b8 85% 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 130, height: 130, background: 'white', borderRadius: '50%' }} />
          </div>
          <div style={{ display: 'flex', gap: 16, marginTop: 32, fontSize: 12, color: '#64748b' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ width: 8, height: 8, borderRadius: '50%', background: NAVY }}/> Internship</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ width: 8, height: 8, borderRadius: '50%', background: GOLD }}/> Graduate Programme</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ width: 8, height: 8, borderRadius: '50%', background: '#94a3b8' }}/> Part-time</div>
          </div>
        </div>
      </div>
      <div style={{ background: 'white', padding: 32, borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <h3 style={{ margin: '0 0 24px 0', fontSize: 16, fontWeight: 700, color: NAVY }}>Course-to-Opportunity Success Metric</h3>
        <div style={{ display: 'flex', height: 200, alignItems: 'flex-end', gap: 24, paddingLeft: 40, position: 'relative' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', color: '#94a3b8', fontSize: 12 }}>
            <span>60</span><span>45</span><span>30</span><span>15</span><span>0</span>
          </div>
          <div style={{ position: 'absolute', left: 40, right: 0, top: 0, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', pointerEvents: 'none' }}>
            {[...Array(5)].map((_, i) => <div key={i} style={{ borderTop: '1px dashed #e2e8f0', width: '100%' }} />)}
          </div>
          {mockCourseData.map((item, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, zIndex: 1 }}>
              <div style={{ width: '100%', height: `${(item.val / 60) * 100}%`, background: GOLD, borderRadius: '4px 4px 0 0' }} />
              <div style={{ fontSize: 13, color: '#475569' }}>{item.course}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}