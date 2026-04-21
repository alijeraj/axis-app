import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = 'https://axis-backend-production-5e9b.up.railway.app';

function Progress() {
  const navigate = useNavigate();
  const token = localStorage.getItem('axis_token');
  const [entries, setEntries] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadEntries(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadEntries = async () => {
    try {
      const res = await axios.get(`${API}/api/entries`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEntries(res.data || {});
    } catch (err) {
      console.log('Error loading entries:', err);
    } finally {
      setLoading(false);
    }
  };

  const keys = Object.keys(entries).sort();
  const last7 = keys.slice(-7);

  const avg = (arr, key) => {
    if (arr.length === 0) return 0;
    return Math.round(arr.reduce((sum, k) => sum + (entries[k]?.[key] || 0), 0) / arr.length);
  };

  const ismAvg = avg(last7, 'ismScore');
  const esmAvg = avg(last7, 'esmScore');
  const axisAvg = avg(last7, 'axisScore');

  if (loading) return <div style={{ color: 'var(--text-light)', padding: '48px', textAlign: 'center' }}>Loading...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate('/')}>← Home</button>
        <div style={styles.title}>Progress</div>
      </div>

      <div style={styles.scoreRow}>
        {[
          { label: 'ISM', value: ismAvg, color: 'var(--steel-blue)' },
          { label: 'ESM', value: esmAvg, color: '#B088D4' },
          { label: 'AXIS', value: axisAvg, color: 'var(--text-dark)' },
        ].map(s => (
          <div key={s.label} style={styles.scoreCard}>
            <div style={{ ...styles.scoreVal, color: s.color }}>{s.value || '--'}</div>
            <div style={styles.scoreLabel}>{s.label}</div>
            <div style={styles.scoreSub}>7-day average</div>
          </div>
        ))}
      </div>

      <div style={styles.section}>
        <div style={styles.sectionTitle}>Scan History</div>
        {keys.length === 0 ? (
          <div style={styles.empty}>No scans yet. Complete your first Daily Scan to begin tracking.</div>
        ) : (
          <div style={styles.historyList}>
            {keys.slice().reverse().map(date => {
              const e = entries[date];
              return (
                <div key={date} style={styles.historyRow}>
                  <div style={styles.historyDate}>{date}</div>
                  <div style={styles.historyScores}>
                    <span style={{ color: 'var(--steel-blue)' }}>ISM {e.ismScore}</span>
                    <span style={{ color: '#B088D4' }}>ESM {e.esmScore}</span>
                    <span style={{ color: 'var(--text-dark)' }}>AXIS {e.axisScore}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: 'var(--navy-1)',
    padding: '32px 24px',
    maxWidth: '800px',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '40px',
  },
  title: {
    fontFamily: 'Georgia, serif',
    fontSize: '24px',
    fontWeight: '300',
    color: 'var(--text-dark)',
    flex: 1,
  },
  backBtn: {
    background: 'none',
    border: '1px solid var(--border)',
    borderRadius: '3px',
    padding: '8px 16px',
    color: 'var(--text-light)',
    fontSize: '12px',
    cursor: 'pointer',
  },
  scoreRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '16px',
    marginBottom: '40px',
  },
  scoreCard: {
    background: 'var(--navy-3)',
    border: '1px solid var(--border)',
    borderRadius: '4px',
    padding: '24px',
    textAlign: 'center',
  },
  scoreVal: {
    fontFamily: 'Georgia, serif',
    fontSize: '48px',
    fontWeight: '300',
    marginBottom: '8px',
  },
  scoreLabel: {
    fontSize: '10px',
    fontWeight: '600',
    letterSpacing: '3px',
    textTransform: 'uppercase',
    color: 'var(--text-light)',
    marginBottom: '4px',
  },
  scoreSub: {
    fontSize: '10px',
    color: 'var(--text-light)',
    opacity: 0.6,
  },
  section: {
    background: 'var(--navy-3)',
    border: '1px solid var(--border)',
    borderRadius: '4px',
    padding: '24px',
  },
  sectionTitle: {
    fontSize: '10px',
    fontWeight: '600',
    letterSpacing: '3px',
    textTransform: 'uppercase',
    color: 'var(--text-light)',
    marginBottom: '20px',
  },
  empty: {
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    color: 'var(--text-light)',
    textAlign: 'center',
    padding: '24px',
  },
  historyList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  historyRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    border: '1px solid var(--border)',
    borderRadius: '3px',
  },
  historyDate: {
    fontSize: '13px',
    color: 'var(--text-light)',
  },
  historyScores: {
    display: 'flex',
    gap: '20px',
    fontSize: '13px',
    fontWeight: '600',
  },
};

export default Progress;