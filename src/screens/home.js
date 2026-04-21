import React from 'react';
import { useNavigate } from 'react-router-dom';

function Home(props) {
  const navigate = useNavigate();

  const handleLogout = () => {
    props.onLogout();
  };

  const menuItems = [
    { id: 'scan', label: 'Daily Scan', icon: '◎', desc: 'Map your current state' },
    { id: 'cpm', label: 'Complex Map', icon: '◈', desc: 'Map your patterns' },
    { id: 'cbm', label: 'Behavior Map', icon: '▲', desc: 'Map your behaviors' },
    { id: 'progress', label: 'View Progress', icon: '◇', desc: 'Track your evolution' },
    { id: 'journal', label: 'Dream Journal', icon: '☽', desc: 'Capture your dreams' },
    { id: 'tutorial', label: 'App Tutorial', icon: '✦', desc: 'Learn the framework' },
  ];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.logo}>AXIS</div>
        <button style={styles.logoutBtn} onClick={handleLogout}>Sign Out</button>
      </div>

      <div style={styles.grid}>
        {menuItems.map(item => (
          <div key={item.id} style={styles.card} onClick={() => navigate('/'+item.id)}>
            <div style={styles.icon}>{item.icon}</div>
            <div style={styles.cardLabel}>{item.label}</div>
            <div style={styles.cardDesc}>{item.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: 'var(--navy-1)',
    padding: '32px 24px',
    maxWidth: '900px',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '48px',
  },
  logo: {
    fontFamily: 'Georgia, serif',
    fontSize: '28px',
    fontWeight: '300',
    letterSpacing: '8px',
    color: 'var(--text-dark)',
  },
  logoutBtn: {
    background: 'none',
    border: '1px solid var(--border)',
    borderRadius: '3px',
    padding: '8px 16px',
    color: 'var(--text-light)',
    fontSize: '10px',
    letterSpacing: '2px',
    textTransform: 'uppercase',
    cursor: 'pointer',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '16px',
  },
  card: {
    background: 'var(--navy-3)',
    border: '1px solid var(--border)',
    borderRadius: '4px',
    padding: '32px 24px',
    cursor: 'pointer',
    textAlign: 'center',
  },
  icon: {
    fontSize: '28px',
    color: 'var(--steel-blue)',
    marginBottom: '16px',
    opacity: '0.8',
  },
  cardLabel: {
    fontFamily: 'Georgia, serif',
    fontSize: '16px',
    fontWeight: '300',
    color: 'var(--text-dark)',
    marginBottom: '8px',
  },
  cardDesc: {
    fontSize: '11px',
    color: 'var(--text-light)',
    letterSpacing: '1px',
  },
};

export default Home;