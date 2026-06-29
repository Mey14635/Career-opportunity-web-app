import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { Building2, Globe, Mail, Phone, Users, ArrowLeft, Search } from 'lucide-react';

const NAVY = "#1B3A6B";
const GOLD = "#C9A230";
const BG_GRAY = "#F5F6FA";

export default function CompanyPublicView() {
  const { employerId } = useParams();
  const { role } = useAuth();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [jobTypeFilter, setJobTypeFilter] = useState('All');

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        const docRef = doc(db, 'employer_profiles', employerId);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
          setError('Company not found');
          setLoading(false);
          return;
        }
        const data = docSnap.data();
        setCompany(data);

        const jobsRef = collection(db, 'opportunities');
        const jobSnaps = await Promise.all([
          getDocs(query(jobsRef, where('employerId', '==', employerId), where('status', '==', 'open'))),
          getDocs(query(jobsRef, where('employerID', '==', employerId), where('status', '==', 'open'))),
        ]);
        const jobsById = new Map();
        jobSnaps.forEach((jobsSnap) => {
          jobsSnap.docs.forEach((d) => jobsById.set(d.id, { id: d.id, ...d.data() }));
        });
        const jobsData = [...jobsById.values()];
        setJobs(jobsData);
      } catch (err) {
        console.error('Error fetching company data:', err);
        setError('Failed to load company profile');
      } finally {
        setLoading(false);
      }
    };
    fetchCompanyData();
  }, [employerId]);

  const getBackPath = () => {
    if (role === 'student') return '/student-dashboard/dashboard';
    if (role === 'employer') return '/employer-dashboard';
    if (role === 'admin') return '/admin-dashboard';
    return '/';
  };

  const handleGoBack = () => {
    navigate(getBackPath());
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = jobTypeFilter === 'All' || job.jobType === jobTypeFilter;
    return matchesSearch && matchesType;
  });

  const jobTypes = ['All', ...new Set(jobs.map(job => job.jobType).filter(Boolean))];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'Inter, system-ui, sans-serif' }}>
        <div style={{ fontSize: 18, color: '#64748b' }}>Loading company profile...</div>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'Inter, system-ui, sans-serif' }}>
        <div style={{ fontSize: 24, fontWeight: 700, color: '#dc2626', marginBottom: 16 }}>Company not found</div>
        <button onClick={handleGoBack} style={{ color: NAVY, fontWeight: 600, cursor: 'pointer', background: 'none', border: 'none', fontSize: 14 }}>
          Return to dashboard
        </button>
      </div>
    );
  }

  // ─── Only students can apply; others just view ──────────────────────
  const isStudent = role === 'student';

  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif', backgroundColor: BG_GRAY, minHeight: '100vh' }}>
      <header style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '16px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, background: GOLD, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: NAVY, fontWeight: 800, fontSize: 14 }}>SU</span>
          </div>
          <span style={{ fontWeight: 700, color: NAVY, fontSize: 18 }}>SU Career Portal</span>
        </div>
        <button onClick={handleGoBack} style={{ display: 'flex', alignItems: 'center', gap: 6, color: NAVY, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 }}>
          <ArrowLeft size={16} /> Back to Dashboard
        </button>
      </header>

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 32, background: '#ffffff', padding: '32px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #bfdbfe' }}>
            <Building2 size={32} color="#3b82f6" />
          </div>
          <div>
            <h1 style={{ margin: '0 0 4px 0', fontSize: 28, fontWeight: 800, color: NAVY }}>{company.companyName}</h1>
            <p style={{ margin: 0, fontSize: 14, color: '#64748b' }}>{company.industry || 'Industry not specified'}</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, marginBottom: 32 }}>
          <div style={{ background: '#ffffff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: NAVY, marginBottom: 12 }}>About the Company</h2>
            <p style={{ color: '#475569', lineHeight: 1.7, fontSize: 14 }}>{company.overview || 'No description provided.'}</p>
          </div>
          <div style={{ background: '#ffffff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: NAVY, marginBottom: 12 }}>Contact Information</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {company.website && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Globe size={16} color="#64748b" />
                  <a href={company.website} target="_blank" rel="noopener noreferrer" style={{ color: NAVY, textDecoration: 'none', fontSize: 14 }}>{company.website}</a>
                </div>
              )}
              {company.email && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Mail size={16} color="#64748b" />
                  <span style={{ fontSize: 14, color: '#1e293b' }}>{company.email}</span>
                </div>
              )}
              {company.phone && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Phone size={16} color="#64748b" />
                  <span style={{ fontSize: 14, color: '#1e293b' }}>{company.phone}</span>
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Users size={16} color="#64748b" />
                <span style={{ fontSize: 14, color: '#1e293b' }}>{company.size || 'Size not specified'}</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ background: '#ffffff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: NAVY, margin: 0 }}>Active Opportunities</h2>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: BG_GRAY, padding: '4px 10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                <Search size={14} color="#94a3b8" />
                <input
                  type="text"
                  placeholder="Search jobs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 13, width: '140px', color: '#1e293b' }}
                />
              </div>
              <select
                value={jobTypeFilter}
                onChange={(e) => setJobTypeFilter(e.target.value)}
                style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: 13, background: '#ffffff', outline: 'none' }}
              >
                {jobTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>

          {filteredJobs.length === 0 ? (
            <p style={{ color: '#94a3b8', fontSize: 14 }}>No active job opportunities match your criteria.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {filteredJobs.map(job => {
                // Link to student dashboard with opportunity query param
                const jobLink = `/student-dashboard/dashboard?opportunity=${job.id}`;
                return (
                  <Link
                    key={job.id}
                    to={jobLink}
                    style={{
                      display: 'block',
                      padding: '16px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      color: 'inherit',
                      cursor: isStudent ? 'pointer' : 'default',
                      transition: 'box-shadow 0.2s',
                      pointerEvents: isStudent ? 'auto' : 'none',
                    }}
                    onMouseEnter={(e) => {
                      if (isStudent) e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <h3 style={{ margin: '0 0 4px 0', fontSize: 15, fontWeight: 700, color: NAVY }}>{job.title}</h3>
                    <p style={{ margin: '0 0 6px 0', fontSize: 13, color: '#64748b' }}>{job.jobType || 'Internship'}</p>
                    <div style={{ fontSize: 12, color: '#94a3b8' }}>
                      Deadline: {job.deadline?.toDate?.()?.toDateString() || 'N/A'}
                    </div>
                    {isStudent && (
                      <div style={{ marginTop: 8, fontSize: 12, color: GOLD, fontWeight: 600 }}>
                        Click to apply →
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <footer style={{ backgroundColor: '#0f172a', color: '#94a3b8', padding: '32px 40px', textAlign: 'center', fontSize: 13, marginTop: 32 }}>
        &copy; {new Date().getFullYear()} Strathmore University Career Development Services
      </footer>
    </div>
  );
}
