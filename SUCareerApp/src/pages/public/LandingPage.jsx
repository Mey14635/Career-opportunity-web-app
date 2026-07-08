import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Building2, Plus, Minus } from 'lucide-react';
import welcomeHeroImage from '../../assets/welcome-career-hero.jpg';

const NAVY = "#1B3A6B";
const GOLD = "#C9A230";
const GOLD_LIGHT = "#E8C84A";
const WHITE = "#FFFFFF";

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
      
      {/* ============ HEADER ============ */}
      <header style={{ padding: '24px 64px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'transparent', position: 'absolute', top: 0, left: 0, right: 0, zIndex: 5 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, background: GOLD, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: NAVY, fontWeight: 800, fontSize: 20 }}>SU</span>
          </div>
          <span style={{ color: '#ffffff', fontWeight: 800, fontSize: 22, letterSpacing: '-0.5px' }}>Career Portal</span>
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          <button
            onClick={() => navigate('/help-center')}
            style={{ 
              padding: '12px 24px', 
              backgroundColor: 'rgba(255, 255, 255, 0.12)', 
              color: '#ffffff', 
              border: '1px solid rgba(255, 255, 255, 0.25)', 
              borderRadius: '8px',
              fontWeight: 700, 
              fontSize: '15px', 
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.22)';
              e.target.style.borderColor = 'rgba(255, 255, 255, 0.45)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.12)';
              e.target.style.borderColor = 'rgba(255, 255, 255, 0.25)';
            }}
          >
            Help Center
          </button>
          <button 
            onClick={() => navigate('/login')}
            style={{ 
              padding: '12px 28px', 
              backgroundColor: GOLD, 
              color: NAVY, 
              borderRadius: '8px', 
              border: 'none', 
              fontWeight: 700, 
              fontSize: '15px', 
              cursor: 'pointer', 
              transition: 'transform 0.2s', 
              boxShadow: '0 4px 12px rgba(201, 162, 48, 0.2)' 
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = GOLD_LIGHT;
              e.target.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = GOLD;
              e.target.style.transform = 'translateY(0)';
            }}
          >
            Admin
          </button>
        </div>
      </header>

      {/* ============ HERO SECTION (EXACTLY AS ORIGINAL) ============ */}
      <section
        style={{
          minHeight: '560px',
          backgroundImage: `linear-gradient(90deg, rgba(27, 58, 107, 0.88) 0%, rgba(27, 58, 107, 0.76) 42%, rgba(27, 58, 107, 0.28) 100%), url(${welcomeHeroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 42%',
          padding: '126px clamp(24px, 6vw, 64px) 112px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ maxWidth: '850px', position: 'relative', zIndex: 2 }}>
          <h1 style={{ color: '#ffffff', fontSize: '56px', fontWeight: 800, margin: '0 0 24px 0', lineHeight: 1.08, letterSpacing: '-1px' }}>
            Connecting Strathmore Excellence with Industry Leaders
          </h1>
          <p style={{ color: '#e2e8f0', fontSize: '20px', margin: '0 auto 40px auto', lineHeight: 1.6, maxWidth: '650px' }}>
            The centralized hub for empowering student careers and enabling top-tier corporate partnerships across the continent.
          </p>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
            <button 
              onClick={() => navigate('/student-dashboard/signup')}
              style={{ 
                padding: '16px 36px', 
                backgroundColor: GOLD, 
                color: NAVY, 
                borderRadius: '8px', 
                border: 'none', 
                fontWeight: 700, 
                fontSize: '16px', 
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 14px rgba(201, 162, 48, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = GOLD_LIGHT;
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 20px rgba(201, 162, 48, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = GOLD;
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 14px rgba(201, 162, 48, 0.3)';
              }}
            >
              Discover Opportunity
            </button>
            <button 
              onClick={() => navigate('/employer-access')}
              style={{ 
                padding: '16px 36px', 
                backgroundColor: 'rgba(255,255,255,0.14)', 
                color: '#ffffff', 
                borderRadius: '8px', 
                border: '1.5px solid rgba(255,255,255,0.4)', 
                fontWeight: 700, 
                fontSize: '16px', 
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                backdropFilter: 'blur(4px)'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'rgba(255,255,255,0.25)';
                e.target.style.borderColor = 'rgba(255,255,255,0.6)';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'rgba(255,255,255,0.14)';
                e.target.style.borderColor = 'rgba(255,255,255,0.4)';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              Partner With Us
            </button>
          </div>
        </div>
      </section>

      {/* ============ MAIN CONTENT ============ */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 24px 80px', marginTop: '-36px' }}>
        
        {/* Cards Section (EXACTLY AS ORIGINAL - No extra buttons) */}
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

        {/* FAQ Section (IMPROVED) */}
        <section style={{ maxWidth: '820px', width: '100%', marginBottom: '40px' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <span style={{ 
              display: 'inline-block',
              color: '#A88820',
              fontWeight: 600,
              fontSize: '13px',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              marginBottom: '8px'
            }}>
              Got Questions?
            </span>
            <h2 style={{ 
              fontSize: '36px', 
              color: NAVY, 
              fontWeight: 800,
              margin: 0,
              letterSpacing: '-0.5px'
            }}>
              Frequently Asked <span style={{ color: GOLD }}>Questions</span>
            </h2>
            <p style={{ color: '#64748b', fontSize: '17px', marginTop: '12px' }}>
              Find answers to the most common questions about our platform.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {faqs.map((faq, index) => (
              <div 
                key={index} 
                style={{ 
                  border: `1px solid ${openFaq === index ? GOLD : '#e2e8f0'}`,
                  borderRadius: '12px', 
                  overflow: 'hidden', 
                  background: '#ffffff',
                  boxShadow: openFaq === index ? '0 8px 24px rgba(201, 162, 48, 0.10)' : 'none',
                  transition: 'all 0.2s ease',
                }}
              >
                <button 
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  style={{ 
                    width: '100%', 
                    padding: '20px 24px', 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    background: 'none', 
                    border: 'none', 
                    cursor: 'pointer', 
                    textAlign: 'left', 
                    color: openFaq === index ? NAVY : '#1e293b', 
                    fontWeight: 700, 
                    fontSize: '16px',
                  }}
                >
                  <span style={{ flex: 1, marginRight: '16px' }}>{faq.question}</span>
                  <div style={{
                    minWidth: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: openFaq === index ? 'rgba(201, 162, 48, 0.10)' : '#f1f5f9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease',
                  }}>
                    {openFaq === index ? (
                      <Minus size={18} color="#A88820" />
                    ) : (
                      <Plus size={18} color={NAVY} />
                    )}
                  </div>
                </button>
                {openFaq === index && (
                  <div style={{ 
                    padding: '0 24px 24px', 
                    color: '#475569', 
                    fontSize: '15px', 
                    lineHeight: 1.7,
                    borderTop: '1px solid #f1f5f9',
                    paddingTop: '16px',
                    marginTop: '4px'
                  }}>
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* ============ FOOTER (SIMPLIFIED WITH CONTACT DETAILS) ============ */}
      <footer style={{ backgroundColor: '#0f172a', color: '#94a3b8' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '48px 64px 32px' }}>
          {/* Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '16px' }}>
            <div style={{ 
              width: 40, 
              height: 40, 
              background: GOLD, 
              borderRadius: 8, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <span style={{ color: NAVY, fontWeight: 800, fontSize: 18 }}>SU</span>
            </div>
            <span style={{ color: WHITE, fontWeight: 700, fontSize: 18 }}>Career Portal</span>
          </div>
          
          <p style={{ fontSize: '14px', lineHeight: 1.6, marginBottom: '24px', maxWidth: '400px' }}>
            Connecting Strathmore Excellence with Industry Leaders.
          </p>

          {/* Contact Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px', lineHeight: 1.6, marginBottom: '32px' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
              <span style={{ color: GOLD, minWidth: '80px' }}>Address:</span>
              <span>Madaraka Estate Ole Sangale Road, PO Box 59857, 00200 City Square Nairobi, Kenya</span>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
              <span style={{ color: GOLD, minWidth: '80px' }}>Phone:</span>
              <span>(+254) (0)703-034000 (+254) (0)703-034200 (+254) (0)703-034300</span>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
              <span style={{ color: GOLD, minWidth: '80px' }}>Email:</span>
              <span>systems@strathmore.edu</span>
            </div>
          </div>

          {/* Copyright */}
          <div style={{ 
            borderTop: '1px solid rgba(255,255,255,0.06)', 
            paddingTop: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '13px',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <span>&copy; {new Date().getFullYear()} Strathmore University. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}