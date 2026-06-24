// import StatsCards from '../../../components/admin/StatsCards';
// import { auditLogs, NAVY, GOLD } from '../constants';

// /**
//  * Dashboard home page – shows metric cards and system audit logs.
//  */
// export default function OverviewView() {
//   return (
//     <>
//       <StatsCards />
//       <div
//         style={{
//           background: 'white',
//           borderRadius: 16,
//           overflow: 'hidden',
//           boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
//         }}
//       >
//         <div
//           style={{
//             padding: '16px 24px',
//             borderBottom: '1px solid rgba(0,0,0,0.06)',
//             fontWeight: 700,
//             color: NAVY,
//           }}
//         >
//           System Audit Logs
//         </div>
//         {auditLogs.map((log, idx) => (
//           <div
//             key={idx}
//             style={{
//               padding: '12px 24px',
//               borderBottom: idx < auditLogs.length - 1 ? '1px solid rgba(0,0,0,0.04)' : 'none',
//               display: 'flex',
//               gap: 12,
//             }}
//           >
//             <div style={{ width: 6, height: 6, background: GOLD, borderRadius: '50%', marginTop: 8 }} />
//             <div style={{ flex: 1, fontSize: 13, color: '#374151' }}>{log.action}</div>
//             <div style={{ fontSize: 11, color: '#9CA3AF' }}>{log.time}</div>
//           </div>
//         ))}
//       </div>
//     </>
//   );
// }