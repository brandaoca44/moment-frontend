import { Outlet } from 'react-router-dom';

export function AppLayout() {
  return (
    <div style={{ minHeight: '100vh', background: '#fff', color: '#111' }}>
      <header
        style={{
          borderBottom: '1px solid #e5e7eb',
          padding: '16px 24px',
          fontWeight: 700,
        }}
      >
        Moment
      </header>

      <main style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
        <Outlet />
      </main>
    </div>
  );
}