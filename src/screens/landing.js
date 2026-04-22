import React from 'react';
import { useNavigate } from 'react-router-dom';

function Landing() {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <svg width="72" height="72" viewBox="0 0 80 80" fill="none" style={{ marginBottom: '20px' }}>
        <rect x="4" y="4" width="72" height="72" stroke="#6BA3C8" strokeWidth="2.5" fill="none"/>
        <rect x="14" y="14" width="52" height="52" stroke="#6BA3C8" strokeWidth="2" fill="none" opacity="0.8"/>
        <rect x="24" y="24" width="32" height="32" stroke="#6BA3C8" strokeWidth="1.5" fill="none" opacity="0.6"/>
        <rect x="34" y="34" width="12" height="12" stroke="#6BA3C8" strokeWidth="1.5" fill="none" opacity="0.4"/>
        <rect x="38" y="38" width="4" height="4" fill="#6BA3C8" opacity="0.6"/>
      </svg>

      <div style={styles.logo}>AX<span style={styles.logoSpan}>IS</span></div>
      <div style={styles.tagline}>The art of inner mapping</div>
      <div style={styles.divider}></div>
      <div style={styles.headline}>Navigate your inner world.</div>

      <button style={styles.btn} onClick={() => navigate('/login')}>Begin</button>
    </div>
  );
}

const styles = {
  container: {
    position: 'fixed',
    inset: 0,
    background: '#0d1b2a',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
  },
  logo: {
    fontFamily: 'Georgia, serif',
    fontSize: '72px',
    fontWeight: '300',
    color: '#D8E6F0',
    letterSpacing: '-3px',
    lineHeight: 1,
    marginBottom: '48px',
  },
  logoSpan: {
    color: '#6BA3C8',
    fontWeight: '600',
  },
  tagline: {
    fontFamily: 'Georgia, serif',
    fontSize: '20px',
    fontStyle: 'italic',
    letterSpacing: '4px',
    color: '#8BAFC8',
    marginBottom: '12px',
    textAlign: 'center',
  },
  divider: {
    width: '32px',
    height: '1px',
    background: 'rgba(107,163,200,0.3)',
    margin: '28px auto',
  },
  headline: {
    fontFamily: 'Georgia, serif',
    fontSize: '36px',
    fontWeight: '300',
    color: '#D8E6F0',
    textAlign: 'center',
    lineHeight: 1.4,
    marginBottom: '56px',
  },
  btn: {
    fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
    fontSize: '11px',
    fontWeight: '600',
    letterSpacing: '4px',
    textTransform: 'uppercase',
    color: '#D8E6F0',
    background: 'none',
    border: '1px solid rgba(107,163,200,0.3)',
    padding: '16px 48px',
    cursor: 'pointer',
  },
};

export default Landing;