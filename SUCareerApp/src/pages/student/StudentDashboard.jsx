import { useNavigate } from 'react-router-dom';

export default function StudentDashboard() {
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f8f9fa', fontFamily: 'sans-serif', alignItems: 'center', justifyContent: 'center' }}>
      
      <div style={{ backgroundColor: '#ffffff', padding: '50px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', textAlign: 'center', maxWidth: '500px', width: '90%', borderTop: '6px solid #003366' }}>
        
        {/* Animated-style Icon Placeholder */}
        <div style={{ width: '80px', height: '80px', backgroundColor: '#FEF3C7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px auto', border: '2px dashed #D4AF37' }}>
          <span style={{ fontSize: '32px' }}>🚧</span>
        </div>

        <h1 style={{ color: '#003366', margin: '0 0 15px 0', fontSize: '26px' }}>Student Discovery Portal</h1>
        
        <p style={{ color: '#64748b', fontSize: '16px', lineHeight: '1.6', marginBottom: '30px' }}>
          Coming Soon! 
          <br /><br />
         </p>

        {/* Progress Bar Illusion */}
        <div style={{ width: '100%', height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden', marginBottom: '30px' }}>
          <div style={{ width: '65%', height: '100%', backgroundColor: '#D4AF37', borderRadius: '4px' }}></div>
        </div>

        <button 
          onClick={() => navigate('/')}
          style={{ padding: '12px 24px', backgroundColor: '#003366', color: '#ffffff', border: 'none', borderRadius: '6px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', transition: 'background 0.2s', width: '100%' }}
        >
          Sign Out & Return to Login
        </button>
      </div>
      
    </div>
  );
}