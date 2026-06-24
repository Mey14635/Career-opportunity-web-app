// import { ArrowLeft } from 'lucide-react';
// import { NAVY, GOLD } from '../constants';

// export default function OpportunityDetailView({ job, onBack, onApprove, onReject }) {
//   return (
//     <div style={{ background: '#F5F6FA', minHeight: '100vh', paddingBottom: 100 }}>
//       {/* Header with back button */}
//       <div style={{ padding: '24px 32px 16px' }}>
//         <button
//           onClick={onBack}
//           style={{
//             display: 'flex',
//             alignItems: 'center',
//             gap: 6,
//             background: 'none',
//             border: 'none',
//             color: '#6B7280',
//             fontSize: 13,
//             cursor: 'pointer',
//             marginBottom: 20,
//           }}
//         >
//           <ArrowLeft size={14} /> Back to Moderation Queue
//         </button>
//         <h1 style={{ color: NAVY, fontSize: 28, fontWeight: 800, marginBottom: 4 }}>{job.title}</h1>
//         <p style={{ color: '#6B7280', fontSize: 15 }}>{job.company} · {job.workMode}</p>
//       </div>

//       <div style={{ padding: '0 32px', display: 'grid', gap: 24, gridTemplateColumns: '1fr 320px' }}>
//         {/* Left: Description & Details */}
//         <div style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
//           <h3 style={{ color: NAVY, fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Job Description</h3>
//           <p style={{ color: '#374151', lineHeight: 1.7, fontSize: 14, marginBottom: 24 }}>{job.description}</p>

//           <h3 style={{ color: NAVY, fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Key Responsibilities</h3>
//           <p style={{ color: '#374151', lineHeight: 1.7, fontSize: 14, marginBottom: 24 }}>{job.responsibilities}</p>

//           <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 20 }}>
//             <h3 style={{ color: NAVY, fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Work Mode & Details</h3>
//             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
//               <div style={{ background: '#F5F6FA', padding: 12, borderRadius: 12 }}>
//                 <p style={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF', marginBottom: 4 }}>WORK MODE</p>
//                 <p style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>{job.workMode}</p>
//               </div>
//               <div style={{ background: '#F5F6FA', padding: 12, borderRadius: 12 }}>
//                 <p style={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF', marginBottom: 4 }}>DURATION</p>
//                 <p style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>{job.duration}</p>
//               </div>
//               <div style={{ background: '#F5F6FA', padding: 12, borderRadius: 12 }}>
//                 <p style={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF', marginBottom: 4 }}>START DATE</p>
//                 <p style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>{job.startDate}</p>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Right: Requirements & Metadata */}
//         <div style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.05)', height: 'fit-content' }}>
//           <h3 style={{ color: NAVY, fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Application Requirements</h3>
//           <ul style={{ margin: '0 0 24px 0', paddingLeft: 20, color: '#374151', fontSize: 13, lineHeight: 1.8 }}>
//             {job.docs.map(doc => <li key={doc}>{doc}</li>)}
//           </ul>
//           <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 16 }}>
//             <div style={{ marginBottom: 16 }}>
//               <p style={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF', marginBottom: 4 }}>APPLICATION DEADLINE</p>
//               <p style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>{job.deadline}</p>
//             </div>
//             <div>
//               <p style={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF', marginBottom: 4 }}>POSITIONS AVAILABLE</p>
//               <p style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>{job.positions}</p>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Sticky Footer with Approve/Reject */}
//       <div
//         style={{
//           position: 'fixed',
//           bottom: 0,
//           right: 0,
//           left: 260, // Sidebar width
//           background: 'white',
//           borderTop: '1px solid #e2e8f0',
//           padding: '16px 32px',
//           display: 'flex',
//           justifyContent: 'flex-end',
//           gap: 16,
//           zIndex: 10,
//         }}
//       >
//         <button
//           onClick={onReject}
//           style={{
//             background: '#fee2e2',
//             color: '#dc2626',
//             border: 'none',
//             padding: '10px 24px',
//             borderRadius: 40,
//             fontSize: 14,
//             fontWeight: 600,
//             cursor: 'pointer',
//           }}
//         >
//           Reject Listing
//         </button>
//         <button
//           onClick={onApprove}
//           style={{
//             background: GOLD,
//             color: NAVY,
//             border: 'none',
//             padding: '10px 28px',
//             borderRadius: 40,
//             fontSize: 14,
//             fontWeight: 700,
//             cursor: 'pointer',
//           }}
//         >
//           Approve & Publish
//         </button>
//       </div>
//     </div>
//   );
// }