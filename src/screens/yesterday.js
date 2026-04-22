import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = 'https://axis-backend-production-5e9b.up.railway.app';

const LEVEL_CONFIGS = [
  { label: 'Mild',     color: 'rgba(74,174,136,0.25)',  border: 'rgba(74,174,136,0.4)',   width: '100%', num: 1 },
  { label: 'Low',      color: 'rgba(107,163,200,0.2)',  border: 'rgba(107,163,200,0.35)', width: '85%',  num: 2 },
  { label: 'Moderate', color: 'rgba(155,126,200,0.2)',  border: 'rgba(155,126,200,0.35)', width: '68%',  num: 3 },
  { label: 'Intense',  color: 'rgba(200,126,80,0.22)',  border: 'rgba(200,126,80,0.4)',   width: '50%',  num: 4 },
  { label: 'Severe',   color: 'rgba(176,90,90,0.28)',   border: 'rgba(176,90,90,0.5)',    width: '32%',  num: 5 },
];

const LEVEL_NAMES = ['Mild', 'Low', 'Moderate', 'Intense', 'Severe'];

const getAlternatives = (b) => {
  if (!b) return [];
  if (Array.isArray(b.alternatives)) return b.alternatives.filter(a => a && a.trim());
  if (b.alternative && b.alternative.trim()) return [b.alternative];
  return [];
};

function Yesterday() {
  const navigate = useNavigate();
  const token = localStorage.getItem('axis_token');
  const [data, setData] = useState({ levels: Array(5).fill(null).map(() => ({ behaviors: [] })) });
  const [cbmLog, setCbmLog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLevel, setSelectedLevel] = useState(null); // 0-5, 0 = regulated
  const [saved, setSaved] = useState(false);
  const [note, setNote] = useState('');
  const pyramidRef = useRef(null);
  const isDragging = useRef(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [cbmRes, logRes] = await Promise.all([
          axios.get(`${API}/api/cbm`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API}/api/cbm-log`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        if (cbmRes.data && cbmRes.data.levels) setData(cbmRes.data);
        setCbmLog(logRes.data || []);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Check if yesterday already logged
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = yesterday.getFullYear() + '-' + String(yesterday.getMonth() + 1).padStart(2, '0') + '-' + String(yesterday.getDate()).padStart(2, '0');
  const yesterdayStr = yesterday.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  const alreadyLogged = cbmLog.some(e => {
    const d = new Date(e.date);
    const k = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    return k === yesterdayKey;
  });

  const handleLog = async () => {
    if (selectedLevel === null) return;
    const newLog = [...cbmLog, {
      date: new Date(yesterdayKey + 'T12:00:00').toISOString(),
      level: selectedLevel,
      note,
    }];
    await axios.post(`${API}/api/cbm-log`, { data: newLog }, { headers: { Authorization: `Bearer ${token}` } });
    setSaved(true);
  };

  // Pyramid height per level for drag calculation
  

  const handlePyramidClick = (e) => {
    if (!pyramidRef.current) return;
    const rect = pyramidRef.current.getBoundingClientRect();
    const relY = e.clientY - rect.top;
    const totalH = rect.height;
    // 5 levels from top (Severe=4) to bottom (Mild=0)
    const fraction = relY / totalH;
    // fraction 0 = top (Severe), fraction 1 = bottom (Mild)
    const levelFromTop = Math.floor(fraction * 5);
    const levelIdx = 4 - levelFromTop; // convert to 0=Mild..4=Severe
    const clamped = Math.max(0, Math.min(4, levelIdx));
    setSelectedLevel(clamped + 1); // 1-5
  };

  const handlePyramidMouseMove = (e) => {
    if (!isDragging.current) return;
    handlePyramidClick(e);
  };

  if (loading) return <div style={{ color: '#5A7A94', padding: '48px', textAlign: 'center' }}>Loading...</div>;

  if (saved) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <button style={styles.backBtn} onClick={() => navigate('/cbm')}>← Behavior Map</button>
          <span style={styles.screenTitle}>Yesterday</span>
        </div>
        <div style={{ maxWidth: '700px', margin: '0 auto', padding: '80px 32px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '24px' }}>✓</div>
          <div style={{ fontFamily: 'Georgia, serif', fontSize: '24px', fontWeight: '300', color: '#D8E6F0', marginBottom: '12px' }}>Logged</div>
          <div style={{ fontSize: '13px', color: '#5A7A94', marginBottom: '8px' }}>{yesterdayStr}</div>
          <div style={{ fontSize: '13px', color: '#5A7A94', marginBottom: '48px' }}>
            Level {selectedLevel} · {selectedLevel === 0 ? 'Regulated' : LEVEL_NAMES[selectedLevel - 1]}
          </div>
          <button style={styles.btn} onClick={() => navigate('/cbm')}>← Back to Behavior Map</button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate('/cbm')}>← Behavior Map</button>
        <span style={styles.screenTitle}>Yesterday</span>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 32px 80px', width: '100%' }}>

        {/* Date + instruction */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ fontSize: '13px', fontWeight: '600', letterSpacing: '3px', textTransform: 'uppercase', color: '#5A7A94', marginBottom: '8px' }}>{yesterdayStr}</div>
          <div style={{ fontFamily: 'Georgia, serif', fontSize: '22px', fontWeight: '300', color: '#D8E6F0', marginBottom: '8px' }}>How far did the system reach?</div>
          <div style={{ fontSize: '13px', color: '#5A7A94', lineHeight: 1.6 }}>Click or drag on the pyramid to set where yesterday's ceiling was. The resistance line will appear across the level you select.</div>
        </div>

        {alreadyLogged && (
          <div style={{ padding: '12px 16px', border: '1px solid rgba(255,200,80,0.3)', borderRadius: '3px', background: 'rgba(255,200,80,0.05)', marginBottom: '24px', fontSize: '12px', color: 'rgba(255,200,80,0.8)', letterSpacing: '1px' }}>
            You have already logged yesterday. Logging again will add a second entry.
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 48px', gap: '0', alignItems: 'stretch' }}>

          {/* Pyramid — read only, clickable */}
          <div>
            <div style={{ textAlign: 'center', fontSize: '9px', fontWeight: '600', letterSpacing: '3px', textTransform: 'uppercase', color: '#5A7A94', marginBottom: '12px', opacity: 0.5 }}>Higher Dysregulation</div>
            <div
              ref={pyramidRef}
              style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', cursor: 'crosshair', userSelect: 'none' }}
              onClick={handlePyramidClick}
              onMouseDown={() => { isDragging.current = true; }}
              onMouseMove={handlePyramidMouseMove}
              onMouseUp={() => { isDragging.current = false; }}
              onMouseLeave={() => { isDragging.current = false; }}
            >
              {[4, 3, 2, 1, 0].map(i => {
                const cfg = LEVEL_CONFIGS[i];
                const behaviors = data.levels[i].behaviors || [];
                const isSelected = selectedLevel === (i + 1);
                const isAbove = selectedLevel !== null && (i + 1) > selectedLevel;
                return (
                  <React.Fragment key={i}>
                    <div style={{
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '2px',
                      minHeight: '72px',
                      width: cfg.width,
                      background: isAbove ? cfg.color.replace(/[\d.]+\)$/, '0.08)') : cfg.color,
                      border: isSelected ? `2px solid rgba(255,200,80,0.8)` : `1px solid ${cfg.border}`,
                      boxShadow: isSelected ? '0 0 16px rgba(255,200,80,0.2)' : 'none',
                      transition: 'all 0.15s',
                      boxSizing: 'border-box',
                    }}>
                      {/* Resistance line on selected level */}
                      {isSelected && (
                        <div style={{ position: 'absolute', top: '50%', left: '-4px', right: '-4px', height: '2px', background: 'rgba(255,200,80,0.8)', transform: 'translateY(-50%)', zIndex: 10, pointerEvents: 'none' }}>
                          <div style={{ position: 'absolute', right: '-36px', top: '-8px', fontSize: '9px', fontWeight: '600', letterSpacing: '1px', color: 'rgba(255,200,80,0.8)', whiteSpace: 'nowrap' }}>ceiling</div>
                        </div>
                      )}
                      <span style={{ position: 'absolute', left: '-80px', fontSize: '9px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', color: '#5A7A94', whiteSpace: 'nowrap' }}>{cfg.label}</span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center', alignItems: 'center', padding: '12px 24px' }}>
                        {behaviors.length === 0 ? (
                          <span style={{ fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.15)' }}>Level {i + 1}</span>
                        ) : (
                          behaviors.map((b, bi) => (
                            <span key={bi} style={{ fontSize: '11px', padding: '4px 12px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)', color: isAbove ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.75)', background: 'rgba(0,0,0,0.1)' }}>
                              {b.name}
                              {getAlternatives(b).length > 0 && <span style={{ fontSize: '8px', marginLeft: '4px', color: '#4AAE88', opacity: 0.6 }}>✓</span>}
                            </span>
                          ))
                        )}
                      </div>
                      <span style={{ position: 'absolute', right: '-32px', fontSize: '11px', fontWeight: '600', color: 'rgba(255,255,255,0.3)' }}>{i + 1}</span>
                    </div>
                    {i > 0 && <div style={{ width: cfg.width, height: '3px', background: `linear-gradient(to bottom, ${cfg.border}, transparent)` }} />}
                  </React.Fragment>
                );
              })}

              {/* Regulated option at bottom */}
              <div style={{ width: '100%', marginTop: '8px' }}>
                <div
                  style={{ padding: '12px 16px', border: selectedLevel === 0 ? '2px solid rgba(255,200,80,0.8)' : '1px solid rgba(107,163,200,0.2)', borderRadius: '3px', background: 'rgba(107,163,200,0.04)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: selectedLevel === 0 ? '0 0 16px rgba(255,200,80,0.15)' : 'none', transition: 'all 0.15s' }}
                  onClick={e => { e.stopPropagation(); setSelectedLevel(0); }}
                >
                  <span style={{ fontSize: '10px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', color: '#5A7A94' }}>Regulated · None</span>
                  <span style={{ fontSize: '11px', color: 'rgba(107,163,200,0.4)' }}>0</span>
                </div>
              </div>
            </div>
            <div style={{ textAlign: 'center', fontSize: '9px', fontWeight: '600', letterSpacing: '3px', textTransform: 'uppercase', color: '#5A7A94', marginTop: '12px', opacity: 0.5 }}>Lower Dysregulation</div>
          </div>

          {/* Vertical drag handle — visual indicator */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingLeft: '16px' }}>
            <div style={{ width: '2px', height: '100%', background: 'rgba(107,163,200,0.1)', borderRadius: '1px', position: 'relative' }}>
              {selectedLevel !== null && selectedLevel > 0 && (
                <div style={{
                  position: 'absolute',
                  left: '-8px',
                  top: `${((5 - selectedLevel) / 5) * 100}%`,
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  background: 'rgba(255,200,80,0.8)',
                  transform: 'translateY(-50%)',
                  boxShadow: '0 0 8px rgba(255,200,80,0.4)',
                  transition: 'top 0.15s',
                }} />
              )}
            </div>
          </div>
        </div>

        {/* Selected level display */}
        <div style={{ marginTop: '32px', padding: '16px 20px', background: '#162534', border: `1px solid ${selectedLevel !== null ? 'rgba(255,200,80,0.3)' : 'rgba(107,163,200,0.15)'}`, borderRadius: '3px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ flex: 1 }}>
            {selectedLevel === null ? (
              <div style={{ fontSize: '13px', color: '#5A7A94', fontStyle: 'italic' }}>Click a level on the pyramid to set yesterday's ceiling</div>
            ) : (
              <>
                <div style={{ fontSize: '9px', fontWeight: '600', letterSpacing: '3px', textTransform: 'uppercase', color: 'rgba(255,200,80,0.7)', marginBottom: '4px' }}>Yesterday's Ceiling</div>
                <div style={{ fontFamily: 'Georgia, serif', fontSize: '20px', fontWeight: '300', color: '#D8E6F0' }}>
                  {selectedLevel === 0 ? 'Regulated · None' : `Level ${selectedLevel} · ${LEVEL_NAMES[selectedLevel - 1]}`}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Note */}
        <div style={{ marginTop: '16px' }}>
          <input
            style={{ ...styles.input, fontSize: '13px' }}
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Note (optional) — what happened?"
          />
        </div>

        {/* Log button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '24px', paddingTop: '24px', borderTop: '1px solid rgba(107,163,200,0.15)' }}>
          <button style={styles.btn} onClick={handleLog} disabled={selectedLevel === null}>
            Log Yesterday
          </button>
          <button style={styles.skipBtn} onClick={() => navigate('/cbm')}>Skip</button>
        </div>

      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', background: '#0d1b2a', display: 'flex', flexDirection: 'column' },
  header: { display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 32px', borderBottom: '1px solid rgba(107,163,200,0.15)', background: '#0f2236' },
  backBtn: { background: 'none', border: 'none', color: '#5A7A94', fontSize: '12px', fontWeight: '600', letterSpacing: '1px', cursor: 'pointer', padding: 0 },
  screenTitle: { fontFamily: 'Georgia, serif', fontSize: '18px', fontWeight: '300', color: '#D8E6F0', letterSpacing: '2px', flex: 1 },
  btn: { background: 'rgba(107,163,200,0.15)', border: '1px solid rgba(107,163,200,0.4)', borderRadius: '3px', padding: '14px 32px', color: '#6BA3C8', fontSize: '11px', fontWeight: '600', letterSpacing: '3px', textTransform: 'uppercase', cursor: 'pointer' },
  skipBtn: { background: 'none', border: 'none', color: '#5A7A94', fontSize: '11px', cursor: 'pointer', letterSpacing: '1px' },
  input: { width: '100%', background: '#0f2236', border: '1px solid rgba(107,163,200,0.2)', borderRadius: '3px', padding: '10px 14px', color: '#D8E6F0', fontSize: '14px', outline: 'none', boxSizing: 'border-box' },
};

export default Yesterday;