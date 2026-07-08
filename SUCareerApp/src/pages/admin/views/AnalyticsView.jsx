// src/pages/admin/views/AnalyticsView.jsx
import { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import { db } from '../../../config/firebase';
import { collection, getDocs, getDoc, doc, query, where } from 'firebase/firestore';
import { NAVY, GOLD } from '../constants';
import { exportAdminAnalyticsReport } from '../../../utils/pdfExport';
import styles from './AnalyticsView.styles';
import strathLogo from '../../../assets/strathmore-logo.png';

export default function AnalyticsView() {
  const [loading, setLoading] = useState(true);
  const [funnelData, setFunnelData] = useState({
    views: 0,
    applications: 0,
    shortlisted: 0,
    rejected: 0,
  });
  const [jobTypeData, setJobTypeData] = useState([]);
  const [courseData, setCourseData] = useState([]);
  const [employerPerformance, setEmployerPerformance] = useState([]);
  const [totalJobs, setTotalJobs] = useState(0);
  const [totalEmployers, setTotalEmployers] = useState(0);

  useEffect(() => {
    async function fetchData() {
      try {
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

        const oppIds = opps.map((o) => o.id);
        let allApps = [];
        let shortlistedCount = 0;
        let rejectedCount = 0;

        if (oppIds.length > 0) {
          const appsQuery = query(
            collection(db, 'applications'),
            where('opportunityId', 'in', oppIds)
          );
          const appsSnapshot = await getDocs(appsQuery);
          allApps = appsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
          shortlistedCount = allApps.filter(a => a.status === 'shortlisted').length;
          rejectedCount = allApps.filter(a => a.status === 'rejected').length;
        }

        setFunnelData({
          views: totalViews,
          applications: totalApplications,
          shortlisted: shortlistedCount,
          rejected: rejectedCount,
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

        const employerMap = new Map();
        const allEmployers = [];

        for (const job of opps) {
          const employerId = job.employerID || job.employerId;
          if (!employerId) continue;

          if (!employerMap.has(employerId)) {
            employerMap.set(employerId, {
              employerId,
              companyName: job.companyName || 'Unknown',
              totalApplicants: 0,
              shortlisted: 0,
              rejected: 0,
              jobIds: [],
            });
          }
          employerMap.get(employerId).jobIds.push(job.id);
          allEmployers.push(employerId);
        }

        setTotalEmployers([...new Set(allEmployers)].length);

        for (const app of allApps) {
          const opportunity = opps.find(o => o.id === app.opportunityId);
          if (!opportunity) continue;

          const empId = opportunity.employerID || opportunity.employerId;
          const emp = employerMap.get(empId);
          if (!emp) continue;

          emp.totalApplicants += 1;
          if (app.status === 'shortlisted') emp.shortlisted += 1;
          if (app.status === 'rejected') emp.rejected += 1;
        }

        const performanceData = Array.from(employerMap.values())
          .filter(emp => emp.totalApplicants > 0)
          .map(emp => {
            const shortlistRate = emp.totalApplicants > 0 ? (emp.shortlisted / emp.totalApplicants) * 100 : 0;
            let rating = 'low';
            if (shortlistRate >= 40) rating = 'high';
            else if (shortlistRate >= 20) rating = 'medium';
            return {
              ...emp,
              shortlistRate,
              rating,
            };
          })
          .sort((a, b) => b.shortlistRate - a.shortlistRate);

        setEmployerPerformance(performanceData);

      } catch {
      return;
    } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleExportPDF = async () => {
    if (totalJobs === 0) return;

    await exportAdminAnalyticsReport({
      totalJobs,
      totalEmployers,
      funnelData,
      jobTypeData,
      courseData,
      employerPerformance,
      strathLogoUrl: strathLogo,
    });
  };

  const pieColors = [NAVY, GOLD, '#06b6d4', '#10b981', '#8b5cf6', '#ec4899'];

  const getRatingBadge = (rating) => {
    const configs = {
      high: { label: 'Good Partner', style: styles.statusBadge('high') },
      medium: { label: 'Average', style: styles.statusBadge('medium') },
      low: { label: 'Needs Review', style: styles.statusBadge('low') },
    };
    const config = configs[rating] || configs.medium;
    return <span style={config.style}>{config.label}</span>;
  };

  const generateYAxisLabels = (maxValue) => {
    if (maxValue <= 0) return ['0'];
    let step = Math.max(1, Math.ceil(maxValue / 4));
    const labels = [];
    for (let i = 0; i <= Math.floor(maxValue / step); i++) {
      labels.push(i * step);
    }
    if (labels[labels.length - 1] < maxValue) {
      labels.push(maxValue);
    }
    return labels.reverse();
  };

  if (loading) {
    return <div style={styles.loading}>Loading analytics data...</div>;
  }

  const maxCourseCount = Math.max(...courseData.map(c => c.count), 1);
  const yAxisLabels = generateYAxisLabels(maxCourseCount);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Platform Analytics & Reporting</h1>
          <p style={styles.subtitle}>Data insights — {new Date().getFullYear()} academic cycle.</p>
        </div>
        <button
          onClick={handleExportPDF}
          disabled={totalJobs === 0}
          style={{ ...styles.exportBtn, opacity: totalJobs === 0 ? 0.6 : 1, cursor: totalJobs === 0 ? 'not-allowed' : 'pointer' }}
        >
          <Download size={16} /> Export PDF Report
        </button>
      </div>

      <div style={styles.twoCol}>
        <div style={styles.card}>
          <h3 style={{ ...styles.cardTitle, textAlign: 'center' }}>Candidate Conversion Pipeline</h3>
          {funnelData.views === 0 ? (
            <div style={styles.emptyState}>No data available yet.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={styles.funnelContainer}>
                <div style={styles.funnelRow}>
                  <div style={styles.funnelLabel}>Views</div>
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
                  <div style={styles.funnelLabel}>Shortlisted</div>
                  <div style={styles.funnelBarTrack}>
                    <div style={{ ...styles.funnelBarFill, width: `${funnelData.views > 0 ? (funnelData.shortlisted / funnelData.views) * 100 : 0}%`, background: '#16a34a' }} />
                  </div>
                  <div style={styles.funnelValue}>{funnelData.shortlisted}</div>
                </div>
                <div style={styles.funnelRow}>
                  <div style={styles.funnelLabel}>Rejected</div>
                  <div style={styles.funnelBarTrack}>
                    <div style={{ ...styles.funnelBarFill, width: `${funnelData.views > 0 ? (funnelData.rejected / funnelData.views) * 100 : 0}%`, background: '#dc2626' }} />
                  </div>
                  <div style={styles.funnelValue}>{funnelData.rejected}</div>
                </div>
              </div>
              <div style={styles.funnelFooter}>
                <span style={styles.funnelFooterLabel}>Conversion Rate</span>
                <span style={styles.funnelFooterValue}>
                  {funnelData.views > 0 ? ((funnelData.shortlisted / funnelData.views) * 100).toFixed(1) : 0}%
                </span>
              </div>
            </div>
          )}
        </div>

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

      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Top Courses by Application Volume</h3>
        {courseData.length === 0 ? (
          <div style={styles.emptyState}>No course data available yet.</div>
        ) : (
          <div style={styles.barChartContainer}>
            <div style={styles.barChartYAxis}>
              {yAxisLabels.map((label, idx) => (
                <span key={idx}>{label}</span>
              ))}
            </div>
            <div style={styles.barChartGrid}>
              {[...Array(5)].map((_, i) => <div key={i} style={{ borderTop: '1px dashed #e2e8f0', width: '100%' }} />)}
            </div>
            <div style={styles.barChartBars}>
              {courseData.map((item) => {
                const max = maxCourseCount;
                const heightPercent = max > 0 ? (item.count / max) * 100 : 0;
                return (
                  <div key={item.course} style={styles.barColumn}>
                    <div style={{ ...styles.bar, height: `${Math.max(heightPercent, 4)}%`, minHeight: heightPercent > 0 ? '4px' : '0' }} />
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

      <div style={{ ...styles.card, ...styles.employerCard }}>
        <h3 style={styles.cardTitle}>Employer Performance & Partner Quality</h3>

        <div style={styles.calloutBox}>
          <p style={styles.calloutText}>
            This table tracks shortlist and rejection rates to help CDS identify which employers are actively engaging with student talent versus those who are passive.
          </p>
          <p style={styles.calloutText}>
            <strong>Rating Guide:</strong>
            <span style={{ color: '#16a34a', fontWeight: 600, marginLeft: 8 }}>Good Partner (≥40%)</span> |
            <span style={{ color: '#d97706', fontWeight: 600, marginLeft: 8 }}>Average (20-39%)</span> |
            <span style={{ color: '#dc2626', fontWeight: 600, marginLeft: 8 }}>Needs Review (&lt;20%)</span>
          </p>
        </div>

        {employerPerformance.length === 0 ? (
          <div style={styles.emptyState}>No employer data available yet.</div>
        ) : (
          <table style={styles.employerTable}>
            <thead>
              <tr>
                <th style={styles.employerTh}>Employer</th>
                <th style={styles.employerTh}>Applicants</th>
                <th style={styles.employerTh}>Shortlisted</th>
                <th style={styles.employerTh}>Rejected</th>
                <th style={styles.employerTh}>Shortlist Rate</th>
                <th style={styles.employerTh}>Rating</th>
              </tr>
            </thead>
            <tbody>
              {employerPerformance.map((emp, index) => (
                <tr key={emp.employerId} style={styles.employerRow(index)}>
                  <td style={styles.employerTd}>
                    <div style={{ fontWeight: 600, color: '#1e293b' }}>{emp.companyName}</div>
                  </td>
                  <td style={styles.employerTd}>{emp.totalApplicants}</td>
                  <td style={styles.employerTd}>{emp.shortlisted}</td>
                  <td style={styles.employerTd}>{emp.rejected}</td>
                  <td style={styles.employerTd}>
                    <span style={{ fontWeight: 600, color: emp.shortlistRate >= 40 ? '#16a34a' : emp.shortlistRate >= 20 ? '#d97706' : '#dc2626' }}>
                      {emp.shortlistRate.toFixed(1)}%
                    </span>
                  </td>
                  <td style={styles.employerTd}>{getRatingBadge(emp.rating)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}