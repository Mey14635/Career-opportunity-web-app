// src/pages/admin/views/AnalyticsView.jsx
import { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import { db } from '../../../config/firebase';
import { collection, getDocs, getDoc, doc, query, where } from 'firebase/firestore';
import { NAVY, GOLD } from '../constants';
import styles from './AnalyticsView.styles';

export default function AnalyticsView() {
  const [loading, setLoading] = useState(true);
  const [funnelData, setFunnelData] = useState({ views: 0, applications: 0, submissions: 0 });
  const [jobTypeData, setJobTypeData] = useState([]);
  const [courseData, setCourseData] = useState([]);
  const [totalJobs, setTotalJobs] = useState(0);

  useEffect(() => {
    async function fetchData() {
      try {
        // Only fetch jobs with status 'open' or 'approved' (active jobs)
        const oppsQuery = query(
          collection(db, 'opportunities'),
          where('status', 'in', ['open', 'approved'])
        );
        const oppsSnapshot = await getDocs(oppsQuery);
        const opps = oppsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setTotalJobs(opps.length);

        let totalViews = 0;
        let totalApplications = 0;
        opps.forEach((opp) => {
          totalViews += opp.metrics?.views || 0;
          totalApplications += opp.metrics?.applications || 0;
        });
        setFunnelData({
          views: totalViews,
          applications: totalApplications,
          submissions: totalApplications,
        });

        const jobTypeCounts = {};
        opps.forEach((opp) => {
          const type = opp.jobType || 'Other';
          jobTypeCounts[type] = (jobTypeCounts[type] || 0) + 1;
        });
        const jobTypes = Object.entries(jobTypeCounts).map(([label, count]) => ({
          label,
          count,
          percentage: opps.length > 0 ? (count / opps.length) * 100 : 0,
        }));
        setJobTypeData(jobTypes);

        // Only get applications for active jobs
        const oppIds = opps.map((o) => o.id);
        let allApps = [];
        if (oppIds.length > 0) {
          const appsQuery = query(
            collection(db, 'applications'),
            where('opportunityId', 'in', oppIds)
          );
          const appsSnapshot = await getDocs(appsQuery);
          allApps = appsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        }

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
        const sortedCourses = Object.entries(courseCounts)
          .map(([course, count]) => ({ course, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 6);

        const maxCount = sortedCourses.length > 0 ? Math.max(...sortedCourses.map((c) => c.count)) : 1;
        const courseDataWithHeight = sortedCourses.map((c) => ({
          ...c,
          height: Math.round((c.count / maxCount) * 100),
        }));
        setCourseData(courseDataWithHeight);

      } catch (err) {
        console.error('Error fetching analytics data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleExport = () => {
    const headers = ['Metric', 'Value'];
    const rows = [
      ['Total Active Job Listings', totalJobs],
      ['Total Views', funnelData.views],
      ['Total Applications', funnelData.applications],
      ['Total Submissions', funnelData.submissions],
      ['Conversion Rate', funnelData.views > 0 ? `${((funnelData.submissions / funnelData.views) * 100).toFixed(1)}%` : '0%'],
    ];
    jobTypeData.forEach((item) => {
      rows.push([`${item.label} (Count)`, item.count]);
      rows.push([`${item.label} (%)`, `${item.percentage.toFixed(1)}%`]);
    });
    courseData.forEach((item) => {
      rows.push([`${item.course} Applicants`, item.count]);
    });

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `platform_analytics_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const pieColors = [NAVY, GOLD, '#06b6d4', '#10b981', '#8b5cf6', '#ec4899'];

  if (loading) {
    return <div style={styles.loading}>Loading analytics data...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Platform Analytics & Reporting</h1>
          <p style={styles.subtitle}>Data insights — {new Date().getFullYear()} academic cycle.</p>
        </div>
        <button
          onClick={handleExport}
          disabled={totalJobs === 0}
          style={{ ...styles.exportBtn, opacity: totalJobs === 0 ? 0.6 : 1, cursor: totalJobs === 0 ? 'not-allowed' : 'pointer' }}
        >
          <Download size={16} /> Export to CSV
        </button>
      </div>

      <div style={styles.twoCol}>

        {/* Application Funnel */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Application Funnel</h3>
          {funnelData.views === 0 ? (
            <div style={styles.emptyState}>No data available yet.</div>
          ) : (
            <>
              <div style={styles.funnelContainer}>
                <div style={styles.funnelRow}>
                  <div style={styles.funnelLabel}>Listing Views</div>
                  <div style={styles.funnelBarTrack}>
                    <div style={{ ...styles.funnelBarFill, width: '100%', background: NAVY }} />
                  </div>
                  <div style={styles.funnelValue}>{funnelData.views}</div>
                </div>
                <div style={styles.funnelRow}>
                  <div style={styles.funnelLabel}>Applications</div>
                  <div style={styles.funnelBarTrack}>
                    <div style={{ ...styles.funnelBarFill, width: `${funnelData.views > 0 ? (funnelData.applications / funnelData.views) * 100 : 0}%`, background: GOLD }} />
                  </div>
                  <div style={styles.funnelValue}>{funnelData.applications}</div>
                </div>
                <div style={styles.funnelRow}>
                  <div style={styles.funnelLabel}>Submissions</div>
                  <div style={styles.funnelBarTrack}>
                    <div style={{ ...styles.funnelBarFill, width: `${funnelData.views > 0 ? (funnelData.submissions / funnelData.views) * 100 : 0}%`, background: '#16a34a' }} />
                  </div>
                  <div style={styles.funnelValue}>{funnelData.submissions}</div>
                </div>
              </div>
              <div style={styles.funnelFooter}>
                <span style={styles.funnelFooterLabel}>Overall Conversion Rate</span>
                <span style={styles.funnelFooterValue}>
                  {funnelData.views > 0 ? ((funnelData.submissions / funnelData.views) * 100).toFixed(1) : 0}%
                </span>
              </div>
            </>
          )}
        </div>

        {/* Opportunity Market Trends */}
        <div style={{ ...styles.card, alignItems: 'center' }}>
          <h3 style={{ ...styles.cardTitle, alignSelf: 'flex-start' }}>Opportunity Market Trends</h3>
          {jobTypeData.length === 0 ? (
            <div style={styles.emptyState}>No active job types data.</div>
          ) : (
            <>
              <div style={styles.pieContainer}>
                {(() => {
                  let cumulative = 0;
                  const gradient = jobTypeData.map((item, idx) => {
                    const start = cumulative;
                    cumulative += item.percentage;
                    const color = pieColors[idx % pieColors.length];
                    return `${color} ${start}% ${cumulative}%`;
                  }).join(', ');
                  return (
                    <div style={{ ...styles.pieChart, background: `conic-gradient(${gradient || '#e2e8f0'})` }}>
                      <div style={styles.pieCenter} />
                    </div>
                  );
                })()}
              </div>
              <div style={styles.pieLegend}>
                {jobTypeData.map((item, idx) => (
                  <div key={item.label} style={styles.legendItem}>
                    <div style={{ ...styles.legendDot, background: pieColors[idx % pieColors.length] }} />
                    {item.label} ({item.count})
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Course-to-Opportunity Success Metric */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Course-to-Opportunity Success Metric</h3>
        {courseData.length === 0 ? (
          <div style={styles.emptyState}>No course data available yet.</div>
        ) : (
          <div style={styles.barChartContainer}>
            <div style={styles.barChartYAxis}>
              <span>{Math.max(...courseData.map(c => c.count))}</span>
              <span>{Math.round(Math.max(...courseData.map(c => c.count)) * 0.75)}</span>
              <span>{Math.round(Math.max(...courseData.map(c => c.count)) * 0.5)}</span>
              <span>{Math.round(Math.max(...courseData.map(c => c.count)) * 0.25)}</span>
              <span>0</span>
            </div>
            <div style={styles.barChartGrid} />
            <div style={styles.barChartBars}>
              {courseData.map((item) => {
                const max = Math.max(...courseData.map(c => c.count));
                const heightPercent = max > 0 ? (item.count / max) * 100 : 0;
                return (
                  <div key={item.course} style={styles.barColumn}>
                    <div style={{ ...styles.bar, height: `${Math.max(heightPercent, 2)}%`, minHeight: heightPercent > 0 ? '4px' : '0' }} />
                    <div style={styles.barLabel}>
                      {item.course.length > 12 ? `${item.course.slice(0, 10)}...` : item.course}
                      <br />
                      <span style={styles.barCount}>{item.count}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}