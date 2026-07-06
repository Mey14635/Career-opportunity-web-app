// src/pages/admin/views/AnalyticsView.styles.js
import { NAVY, GOLD } from '../constants';

export default {
  container: { maxWidth: '1200px' },

  loading: { textAlign: 'center', padding: '60px', color: '#94a3b8' },

  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 },

  title: { margin: '0 0 8px 0', fontSize: 24, fontWeight: 800, color: NAVY },

  subtitle: { margin: 0, fontSize: 14, color: '#64748b' },

  exportBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    background: GOLD,
    color: NAVY,
    border: 'none',
    padding: '10px 20px',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 700,
  },

  twoCol: { display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 24, marginBottom: 24 },

  card: {
    background: 'white',
    padding: 32,
    borderRadius: 12,
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    display: 'flex',
    flexDirection: 'column',
  },

  cardTitle: { margin: '0 0 24px 0', fontSize: 16, fontWeight: 700, color: NAVY },

  emptyState: { textAlign: 'center', padding: '20px 0', color: '#94a3b8' },

  funnelContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    flex: 1,
    justifyContent: 'center',
    maxWidth: '90%',
    margin: '0 auto',
    width: '100%',
  },

  funnelRow: { display: 'flex', alignItems: 'center' },

  funnelLabel: { width: 140, fontSize: 13, color: '#475569', textAlign: 'right', paddingRight: 16 },

  funnelBarTrack: { flex: 1, background: '#f1f5f9', height: 24, borderRadius: 4, overflow: 'hidden', position: 'relative' },

  funnelBarFill: { height: '100%', borderRadius: 4 },

  funnelValue: { minWidth: 60, fontSize: 13, fontWeight: 600, color: NAVY, textAlign: 'right', paddingLeft: 16 },

  funnelFooter: {
    marginTop: 'auto',
    paddingTop: 12,
    borderTop: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'center',
    gap: 16,
  },

  funnelFooterLabel: { fontSize: 13, fontWeight: 600, color: '#475569' },

  funnelFooterValue: { fontSize: 14, fontWeight: 700, color: GOLD },

  pieContainer: { display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 },

  pieChart: { width: 200, height: 200, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' },

  pieCenter: { width: 130, height: 130, background: 'white', borderRadius: '50%' },

  pieLegend: { display: 'flex', flexWrap: 'wrap', gap: 16, marginTop: 32, justifyContent: 'center', fontSize: 12, color: '#64748b' },

  legendItem: { display: 'flex', alignItems: 'center', gap: 6 },

  legendDot: { width: 8, height: 8, borderRadius: '50%' },

  barChartContainer: { display: 'flex', height: 200, alignItems: 'flex-end', gap: 24, paddingLeft: 40, position: 'relative' },

  barChartYAxis: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    color: '#94a3b8',
    fontSize: 12,
  },

  barChartGrid: {
    position: 'absolute',
    left: 40,
    right: 0,
    top: 0,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    pointerEvents: 'none',
  },

  barChartBars: { display: 'flex', flex: 1, gap: 24, height: '100%', alignItems: 'flex-end', zIndex: 1 },

  barColumn: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, height: '100%', justifyContent: 'flex-end' },

  bar: { width: '100%', background: GOLD, borderRadius: '4px 4px 0 0' },

  barLabel: { fontSize: 12, color: '#475569', textAlign: 'center' },

  barCount: { fontSize: 11, fontWeight: 600, color: NAVY },

  employerTable: { width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 },

  employerTh: { padding: '12px 16px', background: '#f8fafc', fontWeight: 700, color: '#475569', borderBottom: '1px solid #e2e8f0' },

  employerTd: { padding: '12px 16px', borderBottom: '1px solid #f1f5f9' },

  employerRow: (index) => ({
    background: index % 2 === 0 ? '#ffffff' : '#fafbfc',
  }),

  statusBadge: (type) => {
    const colors = {
      high: { bg: '#dcfce7', color: '#16a34a' },
      medium: { bg: '#fef3c7', color: '#d97706' },
      low: { bg: '#fee2e2', color: '#dc2626' },
    };
    const s = colors[type] || colors.medium;
    return {
      display: 'inline-block',
      background: s.bg,
      color: s.color,
      padding: '4px 10px',
      borderRadius: '12px',
      fontSize: 12,
      fontWeight: 700,
    };
  },

  employerCard: { marginTop: 24 },

  calloutBox: {
    background: '#f8fafc',
    borderLeft: `4px solid ${GOLD}`,
    padding: '16px',
    borderRadius: '0 8px 8px 0',
    marginBottom: 24,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },

  calloutText: {
    fontSize: 13,
    color: '#475569',
    margin: 0,
    lineHeight: 1.5,
  },
};