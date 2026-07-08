import Sidebar from '../../../components/admin/Sidebar';
import TopBar from '../../../components/admin/XXTopbar';

/**
 * Wraps all admin pages with Sidebar and TopBar.
 * Children are the current view (Overview, Students, etc.).
 */
export default function AdminLayout({ children, activeTab, setActiveTab, navigate }) {
  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        backgroundColor: '#F5F6FA',
      }}
    >
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} navigate={navigate} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <TopBar />
        <main style={{ flex: 1, overflowY: 'auto', padding: '24px 32px' }}>{children}</main>
      </div>
    </div>
  );
}