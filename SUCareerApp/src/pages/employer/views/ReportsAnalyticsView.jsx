import { Download } from 'lucide-react';
import { NAVY, GOLD } from '../constants';

export default function ReportsAnalyticsView({ onExport }) {
  const tableData = [
    { rank: 1, title: 'Software Engineering Intern', views: '450', apps: '85', rate: '18.9%' },
    { rank: 2, title: 'Data Analyst — Graduate', views: '312', apps: '61', rate: '19.6%' },
    { rank: 3, title: 'Frontend Developer Intern', views: '198', apps: '42', rate: '21.2%' }
  ];

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: '0 0 4px 0', fontSize: 20, fontWeight: 800, color: NAVY }}>Reports & Analytics</h1>
          <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>Performance indices across the current recruitment cycle.</p>
        </div>
        <button onClick={onExport} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', color: '#475569', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
          <Download size={14} /> Export Metrics Sheet
        </button>
      </div>

      <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', overflow: 'hidden', marginBottom: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0' }}>
          <h3 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: NAVY }}>Top Performing Listings</h3>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
              {['RANK', 'JOB TITLE', 'TOTAL VIEWS', 'APPLICATIONS', 'CONVERSION RATE'].map((h) => (
                <th key={h} style={{ padding: '10px 20px', fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableData.map((row) => (
              <tr key={row.rank} style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: row.rank === 1 ? '#fffbeb' : '#ffffff' }}>
                <td style={{ padding: '12px 20px' }}>
                  <div style={{ width: 24, height: 24, borderRadius: '6px', backgroundColor: row.rank === 1 ? GOLD : '#f1f5f9', color: row.rank === 1 ? '#ffffff' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>
                    {row.rank}
                  </div>
                </td>
                <td style={{ padding: '12px 20px' }}>
                  <div style={{ fontWeight: 600, color: '#1e293b', fontSize: 13 }}>{row.title}</div>
                  {row.rank === 1 && <div style={{ fontSize: 10, color: GOLD, marginTop: 2, fontWeight: 600 }}>Top performer</div>}
                </td>
                <td style={{ padding: '12px 20px', color: '#475569', fontSize: 12, fontWeight: 600 }}>{row.views}</td>
                <td style={{ padding: '12px 20px', color: '#475569', fontSize: 12, fontWeight: 600 }}>{row.apps}</td>
                <td style={{ padding: '12px 20px', color: '#16a34a', fontSize: 12, fontWeight: 700 }}>{row.rate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '20px' }}>
        <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <h3 style={{ margin: '0 0 4px 0', fontSize: 13, fontWeight: 700, color: NAVY }}>Applicant Funnel Drop-off</h3>
          <p style={{ margin: '0 0 20px 0', fontSize: 11, color: '#94a3b8' }}>Conversion map from visual impressions to final document submission</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[{ label: 'Listing Views', value: 450, pct: 100 }, { label: 'Initiated Form', value: 158, pct: 35 }, { label: 'Submitted', value: 85, pct: 19 }].map(item => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 110, fontSize: 11, color: '#64748b', textAlign: 'right', fontWeight: 500 }}>{item.label}</div>
                <div style={{ flex: 1, backgroundColor: '#f1f5f9', borderRadius: '4px', height: 20, overflow: 'hidden' }}>
                  <div style={{ width: `${item.pct}%`, backgroundColor: item.pct === 100 ? NAVY : item.pct === 35 ? '#3b82f6' : GOLD, height: '100%' }}></div>
                </div>
                <div style={{ width: 30, fontSize: 11, fontWeight: 600, color: '#1e293b' }}>{item.value}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ margin: '0 0 4px 0', fontSize: 13, fontWeight: 700, color: NAVY }}>Academic Demographics</h3>
          <p style={{ margin: '0 0 20px 0', fontSize: 11, color: '#94a3b8' }}>Distribution by course of study</p>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 140, height: 140, borderRadius: '50%', background: 'conic-gradient(#1B3A6B 0% 45%, #C9A230 45% 65%, #06b6d4 65% 85%, #10b981 85% 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
              <div style={{ width: 90, height: 90, backgroundColor: '#ffffff', borderRadius: '50%' }}></div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#475569', fontWeight: 500 }}><div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: NAVY }}></div> Informatics</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#475569', fontWeight: 500 }}><div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: GOLD }}></div> BBIT</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#475569', fontWeight: 500 }}><div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#06b6d4' }}></div> Commerce</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#475569', fontWeight: 500 }}><div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#10b981' }}></div> Engineering</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}