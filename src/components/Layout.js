import React from 'react';
import { useNavigate } from 'react-router-dom';

export const WIDTHS = { reading: 720, content: 1100 };

const s = {
  container: { minHeight: '100vh', background: '#0d1b2a', display: 'flex', flexDirection: 'column' },
  header: { display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 32px', borderBottom: '1px solid rgba(142,196,224,0.15)', background: '#0f2236', flexShrink: 0 },
  backBtn: { background: 'none', border: 'none', color: '#8BAFC8', fontSize: '12px', fontWeight: '600', letterSpacing: '1px', cursor: 'pointer', padding: 0 },
  title: { fontFamily: 'Georgia, serif', fontSize: '18px', fontWeight: '300', color: '#D8E6F0', letterSpacing: '2px' },
};

export function AppHeader({ backLabel = '← Home', onBack, title, right }) {
  const navigate = useNavigate();
  const handleBack = onBack || (() => navigate('/'));
  return (
    <div style={s.header}>
      <button style={s.backBtn} onClick={handleBack}>{backLabel}</button>
      {title && <span style={s.title}>{title}</span>}
      <div style={{ flex: 1 }} />
      {right}
    </div>
  );
}

export function Page({ children }) {
  return <div style={s.container}>{children}</div>;
}

export function PageBody({ width = 'content', children }) {
  if (width === 'full') {
    return <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>{children}</div>;
  }
  return (
    <div style={{ maxWidth: WIDTHS[width] + 'px', margin: '0 auto', padding: '40px 32px 80px', width: '100%' }}>
      {children}
    </div>
  );
}