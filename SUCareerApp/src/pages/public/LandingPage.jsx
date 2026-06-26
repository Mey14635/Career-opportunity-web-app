import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Building2, Plus, Minus } from 'lucide-react';

const NAVY = "#1B3A6B";
const GOLD = "#C9A230";

const faqs = [
  { question: "How do I access the student portal?", answer: "Students can log in using their standard university credentials. Once logged in, you will be prompted to complete your profile before accessing exclusive opportunities." },
  { question: "Can employers post opportunities directly?", answer: "Yes, once an employer account is vetted and approved by our team, they gain access to a dedicated dashboard to post internships, graduate programs, and part-time roles." },
  { question: "How is the job review process managed?", answer: "All employer job listings pass through an internal review phase. Our career services team ensures the roles meet academic and professional standards before publishing them to the active opportunities feed." },
  { question: "Is my data secure?", answer: "Absolutely. We adhere to strict data protection guidelines and ensure that student information is only shared with verified employers when you explicitly apply for a role." }
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'Inter, system-ui, sans-serif', backgroundColor: '#f8fafc' }}>
      
      <header style={{ padding: '24px 64px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: NAVY }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, background: GOLD, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: NAVY, fontWeight: 800, fontSize: 20 }}>SU</span>
          </div>
          <span style={{ color: '#ffffff', fontWeight: 800, fontSize: 22, letterSpacing: '-0.5px' }}>Career Portal</span>
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          <button style={{ padding: '12px 24px', backgroundColor: 'transparent', color: '#ffffff', border: 'none', fontWeight: 600, fontSize: '15px', cursor: 'pointer' }}>
            Help Center
          </button>
          <button 
            onClick={() => navigate('/login')}
            style={{ padding: '12px 28px', backgroundColor: GOLD, color: NAVY, borderRadius: '8px', border: 'none', fontWeight: 700, fontSize: '15px', cursor: 'pointer', transition: 'transform 0.2s', boxShadow: '0 4px 12px rgba(201, 162, 48, 0.2)' }}
          >
            Admin
          </button>
        </div>
      </header>

      <section style={{ backgroundColor: NAVY, padding: '80px 24px 100px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ maxWidth: '850px', position: 'relative', zIndex: 2 }}>
          <h1 style={{ color: '#ffffff', fontSize: '56px', fontWeight: 800, margin: '0 0 24px 0', lineHeight: 1.1, letterSpacing: '-1px' }}>
            Connecting Strathmore Excellence with Industry Leaders
          </h1>
          <p style={{ color: '#cbd5e1', fontSize: '20px', margin: '0 auto 48px auto', lineHeight: 1.6, maxWidth: '650px' }}>
            The centralized hub for empowering student careers and enabling top-tier corporate partnerships across the continent.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
            <button 
              onClick={() => navigate('/student-dashboard/signup')}
              style={{ padding: '16px 36px', backgroundColor: GOLD, color: NAVY, borderRadius: '8px', border: 'none', fontWeight: 700, fontSize: '16px', cursor: 'pointer' }}
            >
              Discover Opportunity
            </button>
            <button 
              onClick={() => navigate('/employer-access')}
              style={{ padding: '16px 36px', backgroundColor: 'rgba(255,255,255,0.1)', color: '#ffffff', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', fontWeight: 600, fontSize: '16px', cursor: 'pointer' }}
            >
              Partner With Us
            </button>
          </div>
        </div>
      </section>

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 24px 80px', marginTop: '-40px' }}>
        <section style={{ maxWidth: '1100px', width: '100%', display: 'flex', gap: '32px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '80px', position: 'relative', zIndex: 10 }}>
          <div style={{ flex: '1 1 400px', padding: '56px 48px', backgroundColor: '#ffffff', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.1)', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '50%', marginBottom: '24px' }}>
              <GraduationCap size={40} color={NAVY} />
            </div>
            <h2 style={{ fontSize: '28px', color: NAVY, marginBottom: '16px', fontWeight: 800 }}>For Students</h2>
            <p style={{ fontSize: '16px', color: '#64748b', marginBottom: '40px', lineHeight: 1.6 }}>
              Launch your career. Discover exclusive internships, build your profile, and connect with top recruiters.
            </p>
          </div>

          <div style={{ flex: '1 1 400px', padding: '56px 48px', backgroundColor: '#ffffff', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.1)', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ background: '#fffbeb', padding: '20px', borderRadius: '50%', marginBottom: '24px' }}>
              <Building2 size={40} color={GOLD} />
            </div>
            <h2 style={{ fontSize: '28px', color: NAVY, marginBottom: '16px', fontWeight: 800 }}>For Employers</h2>
            <p style={{ fontSize: '16px', color: '#64748b', marginBottom: '40px', lineHeight: 1.6 }}>
              Access Kenya's premier graduate talent. Post opportunities, vet candidates, and manage your pipeline.
            </p>
          </div>
        </section>

        <section style={{ maxWidth: '800px', width: '100%', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '32px', color: NAVY, marginBottom: '32px', fontWeight: 800, textAlign: 'center' }}>Frequently Asked Questions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {faqs.map((faq, index) => (
              <div key={index} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', background: '#ffffff' }}>
                <button 
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  style={{ width: '100%', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', color: NAVY, fontWeight: 700, fontSize: '16px' }}
                >
                  {faq.question}
                  {openFaq === index ? <Minus size={20} color={GOLD} /> : <Plus size={20} color={NAVY} />}
                </button>
                {openFaq === index && (
                  <div style={{ padding: '0 24px 24px', color: '#475569', fontSize: '15px', lineHeight: 1.6 }}>
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer style={{ backgroundColor: '#0f172a', color: '#94a3b8', padding: '64px 64px 32px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
          <div>&copy; {new Date().getFullYear()} Strathmore University. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
