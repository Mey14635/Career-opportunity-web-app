import { NAVY, GOLD, moderationQueue } from '../../pages/admin/constants';

export default function ModerationQueue({ onSelectJob }) {
  const handleReviewClick = (job, e) => {
    e.stopPropagation(); // Prevent any parent click handlers
    console.log('Review clicked for job:', job.title);
    if (onSelectJob) {
      onSelectJob(job);
    } else {
      console.error('onSelectJob prop is missing');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {moderationQueue.map(job => (
        <div
          key={job.id}
          style={{
            background: 'white',
            borderRadius: 16,
            padding: 20,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderLeft: `4px solid ${GOLD}`,
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}
        >
          <div>
            <h4 style={{ margin: '0 0 6px 0', fontSize: 16, fontWeight: 700, color: NAVY }}>
              {job.title}
            </h4>
            <div style={{ fontSize: 13, color: '#6B7280' }}>
              <strong>Employer:</strong> {job.company}
            </div>
            <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 4 }}>
              📄 {job.docs.join(', ')} | ⏳ {job.deadline}
            </div>
          </div>
          <button
            onClick={(e) => handleReviewClick(job, e)}
            style={{
              background: GOLD,
              color: NAVY,
              padding: '8px 18px',
              borderRadius: 40,
              border: 'none',
              fontSize: 13,
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'transform 0.1s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.02)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            Click to review →
          </button>
        </div>
      ))}
    </div>
  );
}