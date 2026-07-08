// src/utils/pdfExport.js
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const NAVY = '#1B3A6B';
const GOLD = '#C9A230';
const TEXT_MUTED = '#64748B';

// Crops an image into a circular shape
const createCircularImage = (url, size = 128) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(img, 0, 0, size, size);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = reject;
    img.src = url;
  });
};

// Adds a gold footer with page numbers to every page
const applyPageFooters = (doc) => {
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(TEXT_MUTED);
    doc.setFont('helvetica', 'normal');
    doc.setDrawColor(GOLD);
    doc.setLineWidth(0.3);
    doc.line(14, 284, 283, 284);
    doc.text('Strathmore University Career Development Services', 14, 289);
    doc.text(`Page ${i} of ${pageCount}`, 280, 289, { align: 'right' });
  }
};

// Draws a gold line under a title with exact width
const drawTitleLine = (doc, y, width) => {
  doc.setDrawColor(GOLD);
  doc.setLineWidth(0.6);
  doc.line(14, y + 3, 14 + width, y + 3);
};

// Estimates the vertical space needed for a table
const estimateTableHeight = (rowsCount, headerHeight = 10, rowHeight = 8) => {
  return headerHeight + rowsCount * rowHeight + 5;
};

// Ensures enough room for table; if not, adds a page and returns adjusted Y
const ensureTableFits = (doc, startY, neededHeight) => {
  const pageHeight = doc.internal.pageSize.height;
  if (startY + neededHeight > pageHeight - 20) {
    doc.addPage();
    return 20;
  }
  return startY;
};

// Base table styling for consistent look
const baseTableStyles = {
  theme: 'striped',
  styles: {
    fontSize: 10,
    cellPadding: 4,
    lineColor: '#E2E8F0',
    lineWidth: 0.1,
  },
  headStyles: {
    fillColor: NAVY,
    textColor: '#FFFFFF',
    fontStyle: 'bold',
    lineColor: NAVY,
    lineWidth: 0.2,
  },
  alternateRowStyles: { fillColor: '#F4F6F8' },
};

// Generates a professional recruitment report PDF for employers
export const generateRecruitmentReport = async ({ companyName, logoUrl, opportunities, funnelData, demographics }) => {
  const doc = new jsPDF('landscape', 'mm', 'a4');

  // Header background
  doc.setFillColor(NAVY);
  doc.rect(0, 0, 297, 40, 'F');
  doc.setFillColor(GOLD);
  doc.rect(0, 38, 297, 2, 'F');

  // Logo badge with white background
  const circleX = 22;
  const circleY = 20;
  const circleRadius = 14;

  doc.setFillColor('#FFFFFF');
  doc.circle(circleX, circleY, circleRadius, 'F');

  let logoSuccess = false;
  if (logoUrl) {
    try {
      const circularLogo = await createCircularImage(logoUrl);
      doc.addImage(circularLogo, 'PNG', circleX - circleRadius, circleY - circleRadius, circleRadius * 2, circleRadius * 2);
      logoSuccess = true;
    } catch {
      // fall through to initials
    }
  }

  if (!logoSuccess) {
    const initials = companyName.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase().slice(0, 2);
    doc.setTextColor(NAVY);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(initials || 'C', circleX, circleY + 4, { align: 'center' });
  }

  // Gold circle outline
  doc.setDrawColor(GOLD);
  doc.setLineWidth(1);
  doc.circle(circleX, circleY, circleRadius, 'S');

  // Company name
  doc.setTextColor('#FFFFFF');
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(companyName || 'Employer', 44, 20);

  // Gold underline under company name
  doc.setDrawColor(GOLD);
  doc.setLineWidth(0.8);
  doc.line(44, 24, 44 + 140, 24);

  // Strathmore branding on the right
  doc.setTextColor(GOLD);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Strathmore University', 280, 14, { align: 'right' });

  doc.setTextColor(GOLD);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Career Development Services', 280, 22, { align: 'right' });

  // Report date
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  doc.setTextColor('#CBD5E1');
  doc.setFontSize(10);
  doc.text(today, 280, 32, { align: 'right' });

  let currentY = 55;

  // Top Performing Listings table
  // Column widths: Rank(20) + Title(80) + Views(25) + Applications(32) + Shortlisted(32) + Conversion(30) = 219
  const table1Width = 20 + 80 + 25 + 32 + 32 + 30;
  doc.setTextColor(NAVY);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Top Performing Listings', 14, currentY);
  drawTitleLine(doc, currentY, table1Width);
  currentY += 10;

  const rowsCount = opportunities.length;
  const needed = estimateTableHeight(rowsCount > 0 ? Math.max(1, rowsCount) : 1);
  currentY = ensureTableFits(doc, currentY, needed);

  const tableData = opportunities.map((opp, index) => {
    const convRate = typeof opp.conversionRate === 'number' ? opp.conversionRate : 0;
    return [
      index + 1,
      opp.title || 'Untitled Listing',
      opp.views || 0,
      opp.applications || 0,
      opp.shortlistedCount || 0,
      `${convRate.toFixed(1)}%`
    ];
  });

  autoTable(doc, {
    ...baseTableStyles,
    startY: currentY,
    head: [['Rank', 'Job Title', 'Views', 'Applications', 'Shortlisted', 'Conversion Rate']],
    body: tableData,
    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: 80 },
      2: { cellWidth: 25 },
      3: { cellWidth: 32 },  // Wider to prevent wrapping
      4: { cellWidth: 32 },  // Wider to prevent wrapping
      5: { cellWidth: 30 },
    },
  });

  let finalY = doc.lastAutoTable?.finalY || 70;

  // Applicant Funnel Summary table
  if (finalY + 50 > 280) {
    doc.addPage();
    finalY = 20;
  } else {
    finalY += 15;
  }

  const table2Width = 140;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(NAVY);
  doc.text('Applicant Funnel Summary', 14, finalY);
  drawTitleLine(doc, finalY, table2Width);
  finalY += 10;

  const funnelRows = [
    ['Listing Views', funnelData.views || 0],
    ['Applications', funnelData.applications || 0],
    ['Shortlisted', funnelData.shortlisted || 0],
    ['Rejected', funnelData.rejected || 0],
  ];
  const needed2 = estimateTableHeight(funnelRows.length);
  finalY = ensureTableFits(doc, finalY, needed2);

  autoTable(doc, {
    ...baseTableStyles,
    startY: finalY,
    head: [['Metric', 'Count']],
    body: funnelRows,
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 60 },
    },
  });

  finalY = doc.lastAutoTable?.finalY || 130;

  // Academic Demographics table
  if (demographics && demographics.length > 0) {
    if (finalY + 50 > 280) {
      doc.addPage();
      finalY = 20;
    } else {
      finalY += 15;
    }

    const table3Width = 150;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(NAVY);
    doc.text('Academic Demographics', 14, finalY);
    drawTitleLine(doc, finalY, table3Width);
    finalY += 10;

    const demogRows = demographics.map((item) => {
      const pct = typeof item.percentage === 'number' ? item.percentage : 0;
      return [
        item.course || 'Unknown',
        item.count || 0,
        `${pct.toFixed(0)}%`
      ];
    });
    const needed3 = estimateTableHeight(demogRows.length);
    finalY = ensureTableFits(doc, finalY, needed3);

    autoTable(doc, {
      ...baseTableStyles,
      startY: finalY,
      head: [['Course', 'Applicants', 'Percentage']],
      body: demogRows,
      columnStyles: {
        0: { cellWidth: 80 },
        1: { cellWidth: 30 },
        2: { cellWidth: 40 },
      },
    });
  }

  applyPageFooters(doc);
  doc.save(`recruitment_report_${new Date().toISOString().slice(0, 10)}.pdf`);
};

// Exports the admin platform analytics as a PDF report
export const exportAdminAnalyticsReport = async ({ totalJobs, totalEmployers, funnelData, jobTypeData, courseData, employerPerformance, strathLogoUrl }) => {
  const doc = new jsPDF('landscape', 'mm', 'a4');

  // Header background
  doc.setFillColor(NAVY);
  doc.rect(0, 0, 297, 40, 'F');
  doc.setFillColor(GOLD);
  doc.rect(0, 38, 297, 2, 'F');

  // Logo badge
  const circleX = 22;
  const circleY = 20;
  const circleRadius = 14;

  doc.setFillColor('#FFFFFF');
  doc.circle(circleX, circleY, circleRadius, 'F');

  if (strathLogoUrl) {
    try {
      const circularLogo = await createCircularImage(strathLogoUrl);
      doc.addImage(circularLogo, 'PNG', circleX - circleRadius, circleY - circleRadius, circleRadius * 2, circleRadius * 2);
    } catch {
      doc.setTextColor(GOLD);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('SU', circleX, circleY + 4, { align: 'center' });
    }
  } else {
    doc.setTextColor(GOLD);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('SU', circleX, circleY + 4, { align: 'center' });
  }

  doc.setDrawColor(GOLD);
  doc.setLineWidth(1);
  doc.circle(circleX, circleY, circleRadius, 'S');

  // Title
  doc.setTextColor('#FFFFFF');
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Platform Analytics Report', 44, 20);

  doc.setTextColor(GOLD);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('Strathmore University Career Development Services', 44, 28);

  // Gold underline under title
  doc.setDrawColor(GOLD);
  doc.setLineWidth(0.8);
  doc.line(44, 32, 44 + 180, 32);

  // Report date
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  doc.setTextColor('#CBD5E1');
  doc.setFontSize(10);
  doc.text(today, 280, 32, { align: 'right' });

  let currentY = 55;

  // Platform Summary table
  const table1Width = 140;
  doc.setTextColor(NAVY);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Platform Summary', 14, currentY);
  drawTitleLine(doc, currentY, table1Width);
  currentY += 10;

  const conversionRate = funnelData.views > 0 ? ((funnelData.shortlisted / funnelData.views) * 100) : 0;

  const summaryRows = [
    ['Total Active Job Listings', totalJobs || 0],
    ['Total Employers', totalEmployers || 0],
    ['Total Views', funnelData.views || 0],
    ['Total Applications', funnelData.applications || 0],
    ['Shortlisted Candidates', funnelData.shortlisted || 0],
    ['Rejected Candidates', funnelData.rejected || 0],
    ['Conversion Rate (Shortlisted / Views)', `${conversionRate.toFixed(1)}%`],
  ];
  const needed1 = estimateTableHeight(summaryRows.length);
  currentY = ensureTableFits(doc, currentY, needed1);

  autoTable(doc, {
    ...baseTableStyles,
    startY: currentY,
    head: [['Metric', 'Value']],
    body: summaryRows,
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 60 },
    },
  });

  let finalY = doc.lastAutoTable?.finalY || 70;

  // Opportunity Market Trends table
  if (jobTypeData && jobTypeData.length > 0) {
    if (finalY + 50 > 280) {
      doc.addPage();
      finalY = 20;
    } else {
      finalY += 15;
    }

    const table2Width = 155;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(NAVY);
    doc.text('Opportunity Market Trends', 14, finalY);
    drawTitleLine(doc, finalY, table2Width);
    finalY += 10;

    const jobTypeRows = jobTypeData.map((item) => {
      const pct = typeof item.percentage === 'number' ? item.percentage : 0;
      return [
        item.label || 'Unknown',
        item.count || 0,
        `${pct.toFixed(1)}%`
      ];
    });
    const needed2 = estimateTableHeight(jobTypeRows.length);
    finalY = ensureTableFits(doc, finalY, needed2);

    autoTable(doc, {
      ...baseTableStyles,
      startY: finalY,
      head: [['Job Type', 'Count', 'Percentage']],
      body: jobTypeRows,
      columnStyles: {
        0: { cellWidth: 80 },
        1: { cellWidth: 35 },
        2: { cellWidth: 40 },
      },
    });

    finalY = doc.lastAutoTable?.finalY || 130;
  }

  // Top Courses by Application Volume table
  if (courseData && courseData.length > 0) {
    const needed3 = estimateTableHeight(courseData.length);
    if (finalY + needed3 > 280) {
      doc.addPage();
      finalY = 20;
    } else {
      finalY += 15;
    }

    const table3Width = 150;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(NAVY);
    doc.text('Top Courses by Application Volume', 14, finalY);
    drawTitleLine(doc, finalY, table3Width);
    finalY += 10;

    finalY = ensureTableFits(doc, finalY, needed3);

    const courseRows = courseData.map((item) => [
      item.course || 'Unknown',
      item.count || 0,
    ]);

    autoTable(doc, {
      ...baseTableStyles,
      startY: finalY,
      head: [['Course', 'Applicants']],
      body: courseRows,
      columnStyles: {
        0: { cellWidth: 110 },
        1: { cellWidth: 40 },
      },
    });

    finalY = doc.lastAutoTable?.finalY || 130;
  }

  // Employer Performance table
  if (employerPerformance && employerPerformance.length > 0) {
    const needed4 = estimateTableHeight(employerPerformance.length);
    if (finalY + needed4 > 280) {
      doc.addPage();
      finalY = 20;
    } else {
      finalY += 15;
    }

    const table4Width = 220;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(NAVY);
    doc.text('Employer Performance', 14, finalY);
    drawTitleLine(doc, finalY, table4Width);
    finalY += 10;

    finalY = ensureTableFits(doc, finalY, needed4);

    const perfRows = employerPerformance.map((emp) => {
      const rate = typeof emp.shortlistRate === 'number' ? emp.shortlistRate : 0;
      let ratingLabel = 'Needs Review';
      if (emp.rating === 'high') ratingLabel = 'Good Partner';
      else if (emp.rating === 'medium') ratingLabel = 'Average';
      return [
        emp.companyName || 'Unknown',
        emp.totalApplicants || 0,
        emp.shortlisted || 0,
        emp.rejected || 0,
        `${rate.toFixed(1)}%`,
        ratingLabel,
      ];
    });

    autoTable(doc, {
      ...baseTableStyles,
      startY: finalY,
      head: [['Employer', 'Applicants', 'Shortlisted', 'Rejected', 'Shortlist Rate', 'Rating']],
      body: perfRows,
      columnStyles: {
        0: { cellWidth: 60 },
        1: { cellWidth: 30 },
        2: { cellWidth: 30 },
        3: { cellWidth: 30 },
        4: { cellWidth: 35 },
        5: { cellWidth: 35 },
      },
      didDrawCell: (data) => {
        if (data.section === 'body' && data.column.index === 5) {
          const rating = data.cell.raw;
          let color = '#64748B';
          if (rating === 'Good Partner') color = '#16A34A';
          else if (rating === 'Average') color = '#D97706';
          else if (rating === 'Needs Review') color = '#DC2626';
          data.cell.styles.textColor = color;
          data.cell.styles.fontStyle = 'bold';
        }
      },
    });
  }

  applyPageFooters(doc);
  doc.save(`platform_analytics_${new Date().toISOString().slice(0, 10)}.pdf`);
};