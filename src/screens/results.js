import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const API = 'https://axis-backend-production-5e9b.up.railway.app';

const ISM_FULL = [
  { id: 'attention', label: 'Attention', liberated: 'Focused',    burdened: 'Distracted' },
  { id: 'location',  label: 'Location',  liberated: 'Presence',   burdened: 'Absence' },
  { id: 'drive',     label: 'Drive',     liberated: 'Purposeful', burdened: 'Compulsive' },
  { id: 'emotions',  label: 'Emotions',  liberated: 'Regulated',  burdened: 'Dysregulated' },
];

const ESM_FULL = [
  { id: 'fear',   label: 'Survival',   liberated: 'Secure',    burdened: 'Fear',   right: 'The right to feel safe' },
  { id: 'guilt',  label: 'Action',     liberated: 'Free',      burdened: 'Guilt',  right: 'The right to autonomous expression' },
  { id: 'shame',  label: 'Identity',   liberated: 'Empowered', burdened: 'Shame',  right: 'The right to be' },
  { id: 'anger',  label: 'Boundary',   liberated: 'At Peace',  burdened: 'Anger',  right: 'The right to be respected' },
  { id: 'envy',   label: 'Comparison', liberated: 'Abundant',  burdened: 'Envy',   right: 'The right to be seen' },
  { id: 'grief',  label: 'Love',       liberated: 'Connected', burdened: 'Grief',  right: 'The right to love and be loved' },
];

function colorForScore(score, type) {
  if (score === undefined || score === null) return { bg: 'rgba(107,163,200,0.04)', color: '#5A7A94' };
  const intensity = Math.abs(score) / 5;
  if (score > 0) {
    const alpha = 0.1 + intensity * 0.35;
    return type === 'esm'
      ? { bg: `rgba(74,174,136,${alpha})`, color: '#E8F4FF' }
      : { bg: `rgba(107,163,200,${alpha})`, color: '#E8F4FF' };
  } else if (score < 0) {
    const alpha = 0.1 + intensity * 0.35;
    return { bg: `rgba(176,90,90,${alpha})`, color: '#F0D8D8' };
  }
  return { bg: 'rgba(107,163,200,0.08)', color: '#8BAFC8' };
}

function Results() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('axis_token');
  const origin = location.state?.origin || 'scan';
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadToday = async () => {
      try {
        const res = await axios.get(`${API}/api/entries`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const today = new Date().toISOString().split('T')[0];
        if (res.data && res.data[today]) {
          setEntry(res.data[today]);
        }
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };
    loadToday();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return <div style={{ color: '#5A7A94', padding: '48px', textAlign: 'center' }}>Loading...</div>;
  if (!entry) return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate('/scan')}>← Scan</button>
        <span style={styles.screenTitle}>Results</span>
      </div>
      <div style={{ padding: '80px', textAlign: 'center', fontFamily: 'Georgia, serif', fontStyle: 'italic', color: '#5A7A94' }}>
        No entry logged today. Complete a scan first.
      </div>
    </div>
  );

  const ism = entry.ism || {};
  const esm = entry.esm || {};

  // Compute scores from raw dimension values
  const ismVals = Object.values(ism);
  const esmVals = Object.values(esm);
  const ismRaw = ismVals.reduce((a, b) => a + b, 0);
  const esmRaw = esmVals.reduce((a, b) => a + b, 0);
  const totalRaw = ismRaw + esmRaw;
  const ismPct = Math.round(((ismRaw + 20) / 40) * 100);
  const esmPct = Math.round(((esmRaw + 30) / 60) * 100);
  const totalPct = Math.round(((totalRaw + 50) / 100) * 100);

  const osActive = ismRaw > 0 ? 'pf' : ismRaw < 0 ? 'lm' : null;
  const osLabel = osActive === 'pf' ? 'Prefrontal Cortex' : osActive === 'lm' ? 'Limbic System' : 'Balanced';
  const osColor = osActive === 'pf' ? '#4AAE88' : osActive === 'lm' ? '#B05A5A' : '#8BAFC8';

  const dateStr = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        {origin === 'scan' && (
          <button style={styles.backBtn} onClick={() => navigate('/scan')}>← Scan</button>
        )}
        {origin === 'progress' && (
          <button style={styles.backBtn} onClick={() => navigate('/progress')}>← Progress</button>
        )}
        <span style={styles.screenTitle}>AX<span style={{ color: '#6BA3C8', fontWeight: 600 }}>IS</span></span>
        <button style={{ ...styles.backBtn, marginLeft: 'auto' }} onClick={() => navigate('/')}>Home →</button>
      </div>

      <div style={styles.body}>

        {/* Dashboard block */}
        <div style={styles.dashboardBlock}>
          <div style={styles.dateStr}>{dateStr}</div>
          <div style={styles.dashGrid}>
            {/* OS */}
            <div>
              <div style={styles.osLabel}>Operating System</div>
              <div style={{ ...styles.osValue, color: osColor }}>{osLabel}</div>
            </div>
            {/* ISM */}
            <div style={styles.scoreCol}>
              <div style={styles.scoreColLabel}>ISM</div>
              <div style={{ ...styles.scoreColNum, color: '#6BA3C8' }}>{ismPct}%</div>
              <div style={styles.scoreColSub}>{ismRaw} / 20</div>
            </div>
            {/* ESM */}
            <div style={styles.scoreCol}>
              <div style={styles.scoreColLabel}>ESM</div>
              <div style={{ ...styles.scoreColNum, color: '#B088D4' }}>{esmPct}%</div>
              <div style={styles.scoreColSub}>{esmRaw} / 30</div>
            </div>
            {/* AXIS */}
            <div style={styles.scoreCol}>
              <div style={styles.scoreColLabel}>AXIS Score</div>
              <div style={{ ...styles.scoreColNum, color: '#4EC9A0' }}>{totalPct}%</div>
              <div style={styles.scoreColSub}>{totalRaw} / 50</div>
            </div>
          </div>
        </div>

        {/* ISM Map */}
        <div style={styles.mapSection}>
          <div style={styles.mapDim}>Neurological Dimension</div>
          <div style={styles.mapHeader}>
            <span style={styles.mapBadge}>ISM</span>
            <span style={styles.mapTitle}>Internal State Map</span>
          </div>
          <div style={styles.mapTable}>
            <div style={styles.mapHeaderRow}>
              <span></span>
              <span style={{ ...styles.mapHeaderCell, textAlign: 'center' }}>Dimension</span>
              <span></span>
              <span></span>
              <span></span>
            </div>
            {/* OS row */}
            <div style={{ ...styles.mapRow, borderBottom: '2px solid rgba(107,163,200,0.2)', marginBottom: '4px', background: 'rgba(107,163,200,0.04)' }}>
              <span style={{ ...styles.mapLib, background: osActive === 'pf' ? 'rgba(107,163,200,0.25)' : 'rgba(107,163,200,0.04)', color: osActive === 'pf' ? '#D8E6F0' : '#5A7A94' }}>Prefrontal Cortex</span>
              <span style={{ ...styles.mapCenter, color: '#6BA3C8' }}>Operating System</span>
              <span style={{ ...styles.mapBur, background: osActive === 'lm' ? 'rgba(176,90,90,0.25)' : 'rgba(176,90,90,0.04)', color: osActive === 'lm' ? '#F0D8D8' : '#5A7A94' }}>Limbic System</span>
              <span></span>
              <span style={{ fontFamily: 'Georgia, serif', fontSize: '18px', fontWeight: '300', color: osColor, textAlign: 'right', padding: '16px 8px' }}>
                {ismRaw > 0 ? '+' : ''}{ismRaw}
              </span>
            </div>
            {ISM_FULL.map(dim => {
              const score = ism[dim.id];
              const libCol = colorForScore(score, 'ism');
              const burCol = score < 0 ? colorForScore(score, 'ism') : { bg: 'rgba(176,90,90,0.04)', color: '#5A7A94' };
              const scoreColor = score > 0 ? '#E8F4FF' : score < 0 ? '#F0D8D8' : '#8BAFC8';
              return (
                <div key={dim.id} style={styles.mapRow}>
                  <span style={{ ...styles.mapLib, background: score > 0 ? libCol.bg : 'rgba(107,163,200,0.04)', color: score > 0 ? libCol.color : '#5A7A94' }}>{dim.liberated}</span>
                  <span style={styles.mapCenter}>{dim.label}</span>
                  <span style={{ ...styles.mapBur, background: score < 0 ? burCol.bg : 'rgba(176,90,90,0.04)', color: score < 0 ? burCol.color : '#5A7A94' }}>{dim.burdened}</span>
                  <span></span>
                  <span style={{ fontFamily: 'Georgia, serif', fontSize: '18px', fontWeight: '300', color: scoreColor, textAlign: 'right', padding: '16px 8px' }}>
                    {score !== undefined ? (score > 0 ? '+' : '') + score : ''}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ESM Map */}
        <div style={styles.mapSection}>
          <div style={styles.mapDim}>Emotional Dimension</div>
          <div style={styles.mapHeader}>
            <span style={{ ...styles.mapBadge, color: '#B088D4', background: 'rgba(176,136,212,0.1)' }}>ESM</span>
            <span style={styles.mapTitle}>Emotional Spectrum Map</span>
          </div>
          <div style={styles.mapTable}>
            <div style={styles.mapHeaderRow}>
              <span style={{ ...styles.mapHeaderCell, color: '#4AAE88', background: 'rgba(74,174,136,0.08)', textAlign: 'right', padding: '0 10px' }}>Liberated</span>
              <span style={{ ...styles.mapHeaderCell, textAlign: 'center' }}>Dimension</span>
              <span style={{ ...styles.mapHeaderCell, color: '#B05A5A', background: 'rgba(176,90,90,0.08)', padding: '0 10px' }}>Burden</span>
              <span style={{ ...styles.mapHeaderCell, color: '#6BA3C8', padding: '0 10px' }}>Fundamental Right</span>
              <span></span>
            </div>
            {ESM_FULL.map(dim => {
              const score = esm[dim.id];
              const scoreColor = score > 0 ? '#E8F4FF' : score < 0 ? '#F0D8D8' : '#8BAFC8';
              const intensity = score !== undefined ? Math.abs(score) / 5 : 0;
              const libBg = score > 0 ? `rgba(74,174,136,${0.1 + intensity * 0.35})` : 'rgba(74,174,136,0.04)';
              const burBg = score < 0 ? `rgba(176,90,90,${0.1 + intensity * 0.35})` : 'rgba(176,90,90,0.04)';
              return (
                <div key={dim.id} style={styles.mapRow}>
                  <span style={{ ...styles.mapLib, background: libBg, color: score > 0 ? '#E8F4FF' : '#5A7A94' }}>{dim.liberated}</span>
                  <span style={styles.mapCenter}>{dim.label}</span>
                  <span style={{ ...styles.mapBur, background: burBg, color: score < 0 ? '#F0D8D8' : '#5A7A94' }}>{dim.burdened}</span>
                  <span style={{ fontFamily: 'Georgia, serif', fontSize: '11px', fontStyle: 'italic', color: '#6BA3C8', padding: '16px 10px', lineHeight: 1.3 }}>{dim.right}</span>
                  <span style={{ fontFamily: 'Georgia, serif', fontSize: '18px', fontWeight: '300', color: scoreColor, textAlign: 'right', padding: '16px 8px' }}>
                    {score !== undefined ? (score > 0 ? '+' : '') + score : ''}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', background: '#0d1b2a', display: 'flex', flexDirection: 'column' },
  header: { display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 32px', borderBottom: '1px solid rgba(107,163,200,0.15)', background: '#0f2236' },
  backBtn: { background: 'none', border: 'none', color: '#5A7A94', fontSize: '12px', fontWeight: '600', letterSpacing: '1px', cursor: 'pointer', padding: 0 },
  screenTitle: { fontFamily: 'Georgia, serif', fontSize: '18px', fontWeight: '300', color: '#D8E6F0', letterSpacing: '2px' },
  body: { maxWidth: '960px', margin: '0 auto', padding: '48px 32px 80px', width: '100%' },
  dashboardBlock: {
    border: '1px solid rgba(107,163,200,0.6)',
    borderRadius: '3px',
    background: '#162534',
    padding: '40px 48px',
    marginBottom: '48px',
    boxShadow: '0 0 24px rgba(107,163,200,0.15), 0 0 48px rgba(107,163,200,0.08), inset 0 1px 0 rgba(107,163,200,0.2)',
  },
  dateStr: { fontSize: '13px', fontWeight: '600', letterSpacing: '3px', textTransform: 'uppercase', color: '#8BAFC8', marginBottom: '28px' },
  dashGrid: { display: 'grid', gridTemplateColumns: '1fr auto auto auto', alignItems: 'center', gap: '48px' },
  osLabel: { fontSize: '22px', fontWeight: '700', letterSpacing: '5px', textTransform: 'uppercase', color: '#6BA3C8', textShadow: '0 0 30px rgba(107,163,200,0.4)', marginBottom: '16px' },
  osValue: { fontFamily: 'Georgia, serif', fontSize: '36px', fontWeight: '300', letterSpacing: '-1px' },
  scoreCol: { textAlign: 'center', padding: '0 24px', borderLeft: '1px solid rgba(107,163,200,0.2)' },
  scoreColLabel: { fontSize: '9px', fontWeight: '600', letterSpacing: '3px', textTransform: 'uppercase', color: '#5A7A94', marginBottom: '8px' },
  scoreColNum: { fontFamily: 'Georgia, serif', fontSize: '40px', fontWeight: '300', lineHeight: 1 },
  scoreColSub: { fontSize: '11px', color: '#5A7A94', marginTop: '6px' },
  mapSection: { marginBottom: '48px' },
  mapDim: { fontSize: '9px', fontWeight: '600', letterSpacing: '3px', textTransform: 'uppercase', color: '#5A7A94', marginBottom: '8px' },
  mapHeader: { display: 'flex', alignItems: 'baseline', gap: '16px', marginBottom: '16px', paddingBottom: '12px', borderBottom: '2px solid rgba(107,163,200,0.25)' },
  mapBadge: { fontSize: '11px', fontWeight: '600', letterSpacing: '3px', color: '#6BA3C8', background: 'rgba(107,163,200,0.1)', padding: '5px 12px', borderRadius: '2px' },
  mapTitle: { fontFamily: 'Georgia, serif', fontSize: '22px', fontWeight: '300', color: '#D8E6F0' },
  mapTable: { borderTop: '1px solid rgba(107,163,200,0.15)' },
  mapHeaderRow: { display: 'grid', gridTemplateColumns: '1fr 160px 1fr 200px 40px', paddingBottom: '8px', marginBottom: '4px', borderBottom: '2px solid rgba(107,163,200,0.25)' },
  mapHeaderCell: { fontSize: '9px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', color: '#5A7A94' },
  mapRow: { display: 'grid', gridTemplateColumns: '1fr 160px 1fr 200px 40px', alignItems: 'center', borderBottom: '1px solid rgba(107,163,200,0.1)', minHeight: '56px' },
  mapLib: { fontSize: '14px', fontWeight: '500', padding: '16px 14px', textAlign: 'right' },
  mapCenter: { fontSize: '11px', fontWeight: '600', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#8BAFC8', padding: '16px 12px', textAlign: 'center' },
  mapBur: { fontSize: '14px', fontWeight: '600', padding: '16px 14px' },
};

export default Results;