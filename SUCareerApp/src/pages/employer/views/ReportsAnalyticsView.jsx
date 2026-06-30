// src/pages/employer/views/ReportsAnalyticsView.jsx
import { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import { db } from '../../../config/firebase';
import { collection, query, where, getDocs, getDoc, doc } from 'firebase/firestore';
import { NAVY, GOLD } from '../constants';

export default function ReportsAnalyticsView({ employerId }) {
  const [loading, setLoading] = useState(true);
  const [opportunities, setOpportunities] = useState([]);
  const [funnelData, setFunnelData] = useState({ 
    views: 0, 
    applications: 0, 
    submissions: 0,
    shortlisted: 0,
    rejected: 0
  });
  const [demographics, setDemographics] = useState([]);

  useEffect(() => {
    async function fetchData() {
      if (!employerId) {
        setLoading(false);
        return;
      }

      try {
        // Only fetch jobs with status 'open' or 'approved' (published jobs)
        const oppsQuery = query(
          collection(db, 'opportunities'),
          where('employerID', '==', employerId),
          where('status', 'in', ['open', 'approved'])
        );
        const oppsSnapshot = await getDocs(oppsQuery);
        const opps = oppsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

        let totalViews = 0;
        let totalApplications = 0;
        let shortlistedCount = 0;
        let rejectedCount = 0;

        const oppsWithMetrics = opps.map((opp) => {
          const views = opp.metrics?.views || 0;
          const apps = opp.metrics?.applications || 0;
          totalViews += views;
          totalApplications += apps;
          return {
            ...opp,
            views,
            applications: apps,
            conversionRate: views > 0 ? (apps / views) * 100 : 0,
          };
        });

        const sortedOpps = oppsWithMetrics.sort((a, b) => b.conversionRate - a.conversionRate);
        setOpportunities(sortedOpps);

        // ─── FETCH APPLICATIONS FOR STATUS BREAKDOWN ──────────────────
        if (opps.length > 0) {
          const oppIds = opps.map((o) => o.id);
          const appsQuery = query(
            collection(db, 'applications'),
            where('opportunityId', 'in', oppIds)
          );
          const appsSnapshot = await getDocs(appsQuery);
          const allApps = appsSnapshot.docs.map((d) => d.data());
          
          // Count by status
          shortlistedCount = allApps.filter(a => a.status === 'shortlisted').length;
          rejectedCount = allApps.filter(a => a.status === 'rejected').length;

          // ─── ACADEMIC DEMOGRAPHICS ──────────────────────────────────
          const studentIds = [...new Set(allApps.map((a) => a.studentId))];
          const courseCounts = {};
          for (const studentId of studentIds) {
            const studentRef = doc(db, 'student_profiles', studentId);
            const studentSnap = await getDoc(studentRef);
            if (studentSnap.exists()) {
              const course = studentSnap.data().course || 'Unknown';
              courseCounts[course] = (courseCounts[course] || 0) + 1;
            }
          }
          const totalStudents = studentIds.length;
          const demog = Object.entries(courseCounts).map(([course, count]) => ({
            course,
            count,
            percentage: totalStudents > 0 ? (count / totalStudents) * 100 : 0,
          }));
          setDemographics(demog);
        }

        // ─── SET FUNNEL DATA ──────────────────────────────────────────
        setFunnelData({ 
          views: totalViews, 
          applications: totalApplications, 
          submissions: totalApplications,
          shortlisted: shortlistedCount,
          rejected: rejectedCount
        });

      } catch (err) {
        console.error('Error fetching report data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [employerId]);

  const handleExport = () => {
    if (opportunities.length === 0) return;
    const headers = ['Job Title', 'Views', 'Applications', 'Conversion Rate (%)'];
    const rows = opportunities.map((opp) => [
      opp.title,
      opp.views,
      opp.applications,
      opp.conversionRate.toFixed(1),
    ]);
    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `employer_metrics_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>Loading your analytics...</div>;
  }

  if (!employerId) {
    return (
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', padding: '40px', color: '#dc2626' }}>
          <h3>Missing Employer ID</h3>
          <p>Please log out and log in again.</p>
        </div>
      </div>
    );
  }

  // ─── HELPER: Check if funnel has any data ────────────────────────────
  const hasFunnelData = funnelData.views > 0 || funnelData.applications > 0 || funnelData.submissions > 0;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* ─── HEADER ────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: '0 0 4px 0', fontSize: 24, fontWeight: 800, color: NAVY }}>Reports & Analytics</h1>
          <p style={{ margin: 0, fontSize: 14, color: '#64748b' }}>Performance indices across the current recruitment cycle.</p>
        </div>
        <button
          onClick={handleExport}
          disabled={opportunities.length === 0}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 16px',
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            color: opportunities.length === 0 ? '#94a3b8' : '#475569',
            fontSize: 13,
            fontWeight: 600,
            cursor: opportunities.length === 0 ? 'not-allowed' : 'pointer',
          }}
        >
          <Download size={16} /> Export Metrics Sheet
        </button>
      </div>

      {/* ─── TOP PERFORMING LISTINGS ──────────────────────────────────── */}
      <div style={{ background: '#ffffff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden', marginBottom: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: NAVY }}>Top Performing Listings</h3>
        </div>
        {opportunities.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>No published opportunities yet.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                <th style={{ padding: '12px 20px', fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Rank</th>
                <th style={{ padding: '12px 20px', fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Job Title</th>
                <th style={{ padding: '12px 20px', fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Views</th>
                <th style={{ padding: '12px 20px', fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Applications</th>
                <th style={{ padding: '12px 20px', fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Conversion Rate</th>
              </tr>
            </thead>
            <tbody>
              {opportunities.map((opp, index) => {
                const rank = index + 1;
                return (
                  <tr key={opp.id} style={{ borderBottom: index < opportunities.length - 1 ? '1px solid #f1f5f9' : 'none', background: rank === 1 ? '#fffbeb' : '#ffffff' }}>
                    <td style={{ padding: '12px 20px' }}>
                      <div style={{
                        width: 28,
                        height: 28,
                        borderRadius: '6px',
                        backgroundColor: rank === 1 ? GOLD : '#f1f5f9',
                        color: rank === 1 ? '#ffffff' : '#64748b',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 12,
                        fontWeight: 700,
                      }}>
                        {rank}
                      </div>
                    </td>
                    <td style={{ padding: '12px 20px' }}>
                      <div style={{ fontWeight: 600, color: '#1e293b', fontSize: 14 }}>{opp.title}</div>
                      {rank === 1 && <div style={{ fontSize: 11, color: GOLD, fontWeight: 600, marginTop: 2 }}>Top performer</div>}
                    </td>
                    <td style={{ padding: '12px 20px', color: '#475569', fontSize: 14 }}>{opp.views}</td>
                    <td style={{ padding: '12px 20px', color: '#475569', fontSize: 14 }}>{opp.applications}</td>
                    <td style={{ padding: '12px 20px', color: '#16a34a', fontSize: 14, fontWeight: 700 }}>{opp.conversionRate.toFixed(1)}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ─── FUNNEL & DEMOGRAPHICS ────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>

        {/* ─── APPLICANT FUNNEL ───────────────────────────────────────── */}
        <div style={{ background: '#ffffff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: NAVY }}>Applicant Funnel</h3>
          </div>
          <div style={{ padding: '20px 24px' }}>
            {!hasFunnelData ? (
              <div style={{ textAlign: 'center', padding: '20px 0', color: '#94a3b8', fontSize: 14 }}>No data available yet.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 6, borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ fontSize: 13, color: '#64748b' }}>Listing Views</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: NAVY }}>{funnelData.views}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 6, borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ fontSize: 13, color: '#64748b' }}>Applications</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: NAVY }}>{funnelData.applications}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 6, borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ fontSize: 13, color: '#64748b' }}>Shortlisted</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#16a34a' }}>{funnelData.shortlisted}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 13, color: '#64748b' }}>Rejected</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#dc2626' }}>{funnelData.rejected}</span>
                </div>
                <div style={{ marginTop: 8, paddingTop: 12, borderTop: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#475569' }}>Application Rate</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: GOLD }}>
                      {funnelData.views > 0 ? ((funnelData.applications / funnelData.views) * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ─── ACADEMIC DEMOGRAPHICS ──────────────────────────────────── */}
        <div style={{ background: '#ffffff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: NAVY }}>Academic Demographics</h3>
          </div>
          <div style={{ padding: '20px 24px' }}>
            {demographics.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px 0', color: '#94a3b8', fontSize: 14 }}>No applicant data.</div>
            ) : (
              <div>
                {demographics.map((item, idx) => (
                  <div key={item.course} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: idx < demographics.length - 1 ? 10 : 0 }}>
                    <span style={{ fontWeight: 500, color: '#1e293b', fontSize: 14, flex: 1 }}>{item.course}</span>
                    <span style={{ color: '#64748b', fontSize: 14 }}>{item.count}</span>
                    <span style={{ fontWeight: 600, color: NAVY, fontSize: 14, minWidth: 48, textAlign: 'right' }}>{item.percentage.toFixed(0)}%</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}