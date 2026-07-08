import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, Clock3, Mail, MapPin } from 'lucide-react';

const NAVY = '#1B3A6B';
const GOLD = '#C9A230';

export default function HelpCenter() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', color: '#1e293b', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <header style={{ background: NAVY, padding: '22px 64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 40, height: 40, background: GOLD, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: NAVY, fontWeight: 800, fontSize: 18 }}>SU</span>
          </div>
          <div>
            <div style={{ color: '#ffffff', fontWeight: 800, fontSize: 18 }}>SU Career Portal</div>
            <div style={{ color: '#cbd5e1', fontSize: 12, marginTop: 2 }}>Help Center</div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => navigate('/')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.22)', background: 'rgba(255,255,255,0.08)', color: '#ffffff', fontWeight: 700, cursor: 'pointer' }}
        >
          <ArrowLeft size={16} />
          Back
        </button>
      </header>

      <main style={{ maxWidth: 1040, margin: '0 auto', padding: '56px 24px 80px' }}>
        <section style={{ marginBottom: 28 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: NAVY, background: '#fff7e3', border: '1px solid #f3d78d', borderRadius: 8, padding: '7px 10px', fontSize: 12, fontWeight: 800 }}>
            <Building2 size={14} />
            Career Development Services
          </span>
          <h1 style={{ color: NAVY, fontSize: 40, lineHeight: 1.1, margin: '18px 0 12px', fontWeight: 800 }}>
            Helping students and employers connect with confidence.
          </h1>
          <p style={{ maxWidth: 700, color: '#64748b', fontSize: 16, lineHeight: 1.7, margin: 0 }}>
            The Career Development Services department supports Strathmore University students with career guidance, application readiness, and access to verified employment opportunities.
          </p>
        </section>

        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 16, marginBottom: 20 }}>
          {[
            { icon: Building2, title: 'What we do', text: 'We review opportunities, support student career preparation, and connect approved employers with student talent.' },
            { icon: MapPin, title: 'Where we are', text: 'Visit us at Strathmore University, Madaraka Campus, Ole Sangale Road, Nairobi, Kenya.' },
            { icon: Clock3, title: 'When to reach us', text: 'Students and partners can contact the department during normal university working hours.' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.title} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8, padding: 22, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div style={{ width: 38, height: 38, borderRadius: 8, background: '#fff7e3', color: GOLD, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  <Icon size={19} />
                </div>
                <h2 style={{ color: NAVY, fontSize: 17, margin: '0 0 8px', fontWeight: 800 }}>{item.title}</h2>
                <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.6, margin: 0 }}>{item.text}</p>
              </article>
            );
          })}
        </section>

        <section style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '20px 22px', display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ width: 38, height: 38, borderRadius: 8, background: '#f1f5f9', color: NAVY, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Mail size={18} />
          </div>
          <p style={{ margin: 0, color: '#475569', fontSize: 14, lineHeight: 1.6 }}>
            For portal support, visit the Career Development Services office or contact the department through the official Strathmore University communication channels.
          </p>
        </section>
      </main>
    </div>
  );
}
