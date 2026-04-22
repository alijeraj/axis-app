import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = 'https://axis-backend-production-5e9b.up.railway.app';

const CBM_LEVEL_NAMES = ['None', 'Mild', 'Low', 'Moderate', 'Intense', 'Severe'];

function Progress() {
  const navigate = useNavigate();
  const token = localStorage.getItem('axis_token');
  const [entries, setEntries] = useState({});
  const [cbmLog, setCbmLog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('7d');
  const [cbmView, setCbmView] = useState('7d');
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [selectedDateStr, setSelectedDateStr] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [entriesRes, cbmLogRes] = await Promise.all([
          axios.get(`${API}/api/entries`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API}/api/cbm-log`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        setEntries(entriesRes.data || {});
        setCbmLog(cbmLogRes.data || []);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const today = new Date();
  const todayKey = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');
  const keys = Object.keys(entries).sort();

  const getEntryPct = (e) => {
    if (!e) return null;
    if (e.ismPct !== undefined) return e;
    const ism = e.ism || {};
    const esm = e.esm || {};
    const ismRaw = Object.values(ism).reduce((a, b) => a + b, 0);
    const esmRaw = Object.values(esm).reduce((a, b) => a + b, 0);
    const totalRaw = ismRaw + esmRaw;
    return {
      ismPct: Math.round(((ismRaw + 20) / 40) * 100),
      esmPct: Math.round(((esmRaw + 30) / 60) * 100),
      totalPct: Math.round(((totalRaw + 50) / 100) * 100),
      ismRaw,
    };
  };

  // Period entries
  const days = view === '7d' ? 7 : view === '4w' ? 28 : 365;
  const label = view === '7d' ? '7 Days' : view === '4w' ? '28 Days' : '12 Months';
  const periodEntries = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    if (entries[key]) periodEntries.push({ key, entry: getEntryPct(entries[key]) });
  }

  const n = periodEntries.length;
  const avgISM = n ? Math.round(periodEntries.reduce((a, e) => a + e.entry.ismPct, 0) / n) : null;
  const avgESM = n ? Math.round(periodEntries.reduce((a, e) => a + e.entry.esmPct, 0) / n) : null;
  const avgAXIS = n ? Math.round(periodEntries.reduce((a, e) => a + e.entry.totalPct, 0) / n) : null;
  const avgISMRaw = n ? Math.round(periodEntries.reduce((a, e) => a + (e.entry.ismRaw || 0), 0) / n) : 0;
  const osTendency = avgISMRaw > 2 ? 'Prefrontal Dominant' : avgISMRaw < -2 ? 'Limbic Dominant' : 'Balanced';
  const osColor = avgISMRaw > 2 ? '#4AAE88' : avgISMRaw < -2 ? '#B05A5A' : '#5A7A94';

  // Streak
  let streak = 0;
  const checkDate = new Date(today);
  while (true) {
    const k = checkDate.getFullYear() + '-' + String(checkDate.getMonth() + 1).padStart(2, '0') + '-' + String(checkDate.getDate()).padStart(2, '0');
    if (entries[k]) { streak++; checkDate.setDate(checkDate.getDate() - 1); }
    else break;
  }

  // Personal best
  let bestScore = 0; let bestKey = null;
  keys.forEach(k => {
    const e = getEntryPct(entries[k]);
    if (e && e.totalPct > bestScore) { bestScore = e.totalPct; bestKey = k; }
  });
  let bestDate = '';
  if (bestKey) {
    const bp = bestKey.split('-');
    bestDate = new Date(bp[0], bp[1] - 1, bp[2]).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  const hasTodayEntry = !!entries[todayKey];

  // ISM/ESM Chart data
  const getChartData = () => {
    if (view === '7d') {
      const data = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today); d.setDate(today.getDate() - i);
        const key = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
        const lbl = d.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0) + d.getDate();
        data.push({ label: lbl, key, entry: entries[key] ? getEntryPct(entries[key]) : null });
      }
      return data;
    } else if (view === '4w') {
      const data = [];
      for (let i = 3; i >= 0; i--) {
        const ws = new Date(today); ws.setDate(today.getDate() - i * 7 - today.getDay());
        const lbl = (ws.getMonth() + 1) + '/' + ws.getDate();
        const weekEntries = [];
        for (let j = 0; j <= 6; j++) {
          const dd = new Date(ws); dd.setDate(ws.getDate() + j);
          const k = dd.getFullYear() + '-' + String(dd.getMonth() + 1).padStart(2, '0') + '-' + String(dd.getDate()).padStart(2, '0');
          if (entries[k]) weekEntries.push(getEntryPct(entries[k]));
        }
        if (weekEntries.length > 0) {
          data.push({ label: lbl, entry: {
            ismPct: Math.round(weekEntries.reduce((a, e) => a + e.ismPct, 0) / weekEntries.length),
            esmPct: Math.round(weekEntries.reduce((a, e) => a + e.esmPct, 0) / weekEntries.length),
            totalPct: Math.round(weekEntries.reduce((a, e) => a + e.totalPct, 0) / weekEntries.length),
          }});
        } else { data.push({ label: lbl, entry: null }); }
      }
      return data;
    } else {
      const data = [];
      for (let i = 11; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const monthEntries = keys.filter(k => k.startsWith(d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'))).map(k => getEntryPct(entries[k]));
        const lbl = d.toLocaleDateString('en-US', { month: 'short' });
        if (monthEntries.length > 0) {
          data.push({ label: lbl, entry: {
            ismPct: Math.round(monthEntries.reduce((a, e) => a + e.ismPct, 0) / monthEntries.length),
            esmPct: Math.round(monthEntries.reduce((a, e) => a + e.esmPct, 0) / monthEntries.length),
            totalPct: Math.round(monthEntries.reduce((a, e) => a + e.totalPct, 0) / monthEntries.length),
          }});
        } else { data.push({ label: lbl, entry: null }); }
      }
      return data;
    }
  };

  // CBM chart data
  const dk = (d) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');

  const getCBMDailyCeilings = (v) => {
    if (!cbmLog.length) return [];
    const dayCeiling = (key) => {
      const dayLogs = cbmLog.filter(e => dk(new Date(e.date)) === key);
      return dayLogs.length > 0 ? { ceiling: Math.max(...dayLogs.map(e => e.level)), logs: dayLogs } : null;
    };
    if (v === '7d') {
      const result = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today); d.setDate(today.getDate() - i);
        const key = dk(d);
        const lbl = d.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0) + d.getDate();
        const dc = dayCeiling(key);
        result.push({ key, label: lbl, ceiling: dc ? dc.ceiling : null, logs: dc ? dc.logs : [] });
      }
      return result;
    } else if (v === '4w') {
      const result = [];
      for (let w = 3; w >= 0; w--) {
        const ws = new Date(today); ws.setDate(today.getDate() - w * 7 - today.getDay());
        const lbl = (ws.getMonth() + 1) + '/' + ws.getDate();
        const weekCeilings = [];
        for (let j = 0; j <= 6; j++) {
          const dd = new Date(ws); dd.setDate(ws.getDate() + j);
          const dc = dayCeiling(dk(dd));
          if (dc) weekCeilings.push(dc.ceiling);
        }
        const avg = weekCeilings.length ? Math.round(weekCeilings.reduce((a, b) => a + b, 0) / weekCeilings.length * 10) / 10 : null;
        result.push({ key: dk(ws), label: lbl, ceiling: avg, logs: [] });
      }
      return result;
    } else {
      const result = [];
      for (let i = 11; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const monthKey = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
        const lbl = d.toLocaleDateString('en-US', { month: 'short' });
        const monthLogs = cbmLog.filter(e => { const ld = new Date(e.date); return (ld.getFullYear() + '-' + String(ld.getMonth() + 1).padStart(2, '0')) === monthKey; });
        const dayKeys = {};
        monthLogs.forEach(e => { const key = dk(new Date(e.date)); if (!dayKeys[key]) dayKeys[key] = []; dayKeys[key].push(e.level); });
        const dayCeilings = Object.keys(dayKeys).map(k => Math.max(...dayKeys[k]));
        const avg = dayCeilings.length ? Math.round(dayCeilings.reduce((a, b) => a + b, 0) / dayCeilings.length * 10) / 10 : null;
        result.push({ key: monthKey, label: lbl, ceiling: avg, logs: [] });
      }
      return result;
    }
  };

  const calcResistance = (ceilings) => {
    const withData = ceilings.filter(d => d.ceiling !== null);
    if (!withData.length) return null;
    return Math.round(withData.reduce((a, d) => a + d.ceiling, 0) / withData.length * 10) / 10;
  };

  const chartData = getChartData();
  const cbmCeilings = getCBMDailyCeilings(cbmView);
  const cbmResistance = calcResistance(cbmCeilings);

  const renderISMChart = () => {
    const W = 600; const H = 220;
    const PAD = { top: 20, right: 20, bottom: 30, left: 40 };
    const cW = W - PAD.left - PAD.right;
    const cH = H - PAD.top - PAD.bottom;
    const hasData = chartData.some(d => d.entry);
    if (!hasData) return <div style={{ color: '#5A7A94', padding: '40px', textAlign: 'center', fontStyle: 'italic', fontSize: '13px' }}>No entries yet.</div>;

    const xPos = (i) => PAD.left + (i / (chartData.length - 1 || 1)) * cW;
    const yPos = (pct) => PAD.top + cH - (pct / 100) * cH;

    const grid = [];
    for (let g = 0; g <= 4; g++) {
      const y = PAD.top + (g / 4) * cH;
      grid.push(<line key={`g${g}`} x1={PAD.left} y1={y} x2={W - PAD.right} y2={y} stroke="rgba(107,163,200,0.1)" strokeWidth="1" />);
      grid.push(<text key={`gt${g}`} x={PAD.left - 6} y={y + 4} fill="rgba(107,163,200,0.4)" fontSize="9" textAnchor="end">{100 - g * 25}</text>);
    }

    const buildPath = (key) => {
      const pts = chartData.map((d, i) => d.entry ? `${xPos(i)},${yPos(d.entry[key])}` : null).filter(Boolean);
      if (pts.length < 2) return null;
      return 'M' + pts.join(' L');
    };

    return (
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: H }}>
        {grid}
        {chartData.map((d, i) => <text key={i} x={xPos(i)} y={H - 6} fill="rgba(107,163,200,0.5)" fontSize="9" textAnchor="middle">{d.label}</text>)}
        {buildPath('ismPct') && <path d={buildPath('ismPct')} fill="none" stroke="#6BA3C8" strokeWidth="2.5" opacity="0.9" />}
        {buildPath('esmPct') && <path d={buildPath('esmPct')} fill="none" stroke="#B088D4" strokeWidth="2.5" opacity="0.9" />}
        {buildPath('totalPct') && <path d={buildPath('totalPct')} fill="none" stroke="#4EC9A0" strokeWidth="2.5" opacity="0.9" />}
        {chartData.map((d, i) => d.entry ? [
          <circle key={`ism${i}`} cx={xPos(i)} cy={yPos(d.entry.ismPct)} r="4" fill="#6BA3C8" stroke="#0d1b2a" strokeWidth="2" />,
          <circle key={`esm${i}`} cx={xPos(i)} cy={yPos(d.entry.esmPct)} r="4" fill="#B088D4" stroke="#0d1b2a" strokeWidth="2" />,
          <circle key={`tot${i}`} cx={xPos(i)} cy={yPos(d.entry.totalPct)} r="4" fill="#4EC9A0" stroke="#0d1b2a" strokeWidth="2" />,
        ] : null)}
      </svg>
    );
  };

  const renderCBMChart = () => {
    if (!cbmLog.length) return (
      <div style={{ textAlign: 'center', padding: '60px', fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', color: '#5A7A94' }}>
        No resistance logs yet. Use Set Resistance on the Compulsive Behavior Map.
      </div>
    );

    const hasData = cbmCeilings.some(d => d.ceiling !== null);
    if (!hasData) return <div style={{ textAlign: 'center', padding: '60px', fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', color: '#5A7A94' }}>No logs in this period.</div>;

    const W = 600; const H = 220;
    const PAD = { top: 24, right: 48, bottom: 32, left: 48 };
    const cW = W - PAD.left - PAD.right;
    const cH = H - PAD.top - PAD.bottom;

    const xPos = (i) => PAD.left + (i / (cbmCeilings.length - 1 || 1)) * cW;
    const yPos = (level) => PAD.top + cH - (level / 5) * cH;

    const pathPoints = cbmCeilings.map((d, i) => d.ceiling !== null ? { x: xPos(i), y: yPos(d.ceiling), d } : null).filter(Boolean);

    return (
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: H, overflow: 'visible' }}>
        {[0, 1, 2, 3, 4, 5].map(i => (
          <g key={i}>
            <line x1={PAD.left} y1={yPos(i)} x2={W - PAD.right} y2={yPos(i)} stroke="rgba(107,163,200,0.08)" strokeWidth="1" />
            <text x={PAD.left - 8} y={yPos(i) + 4} textAnchor="end" fontSize="9" fill="rgba(107,163,200,0.4)">{CBM_LEVEL_NAMES[i]}</text>
          </g>
        ))}
        {cbmCeilings.map((d, i) => <text key={i} x={xPos(i)} y={H - 6} textAnchor="middle" fontSize="9" fill="rgba(107,163,200,0.45)">{d.label}</text>)}
        {cbmResistance !== null && (
          <>
            <line x1={PAD.left} y1={yPos(cbmResistance)} x2={W - PAD.right} y2={yPos(cbmResistance)} stroke="rgba(255,200,80,0.55)" strokeWidth="1.5" strokeDasharray="6,3" />
            <text x={W - PAD.right + 6} y={yPos(cbmResistance) + 4} fontSize="9" fill="rgba(255,200,80,0.7)" fontWeight="600">R</text>
          </>
        )}
        {pathPoints.length > 1 && <path d={'M' + pathPoints.map(p => `${p.x},${p.y}`).join(' L')} fill="none" stroke="rgba(176,144,216,0.55)" strokeWidth="2" />}
        {pathPoints.map((p, i) => {
          const aboveR = cbmResistance !== null && p.d.ceiling > cbmResistance;
          return <circle key={i} cx={p.x} cy={p.y} r={aboveR ? 5 : 4} fill={aboveR ? 'rgba(200,106,106,0.9)' : 'rgba(176,144,216,0.9)'} stroke="#0d1b2a" strokeWidth="1.5" />;
        })}
      </svg>
    );
  };

  // Calendar
  const monthName = new Date(calYear, calMonth, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const firstDay = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const dayLabels = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const handleCalDay = (day) => {
    const key = calYear + '-' + String(calMonth + 1).padStart(2, '0') + '-' + String(day).padStart(2, '0');
    if (!entries[key]) return;
    const e = getEntryPct(entries[key]);
    const parts = key.split('-');
    const d = new Date(parts[0], parts[1] - 1, parts[2]);
    setSelectedDateStr(d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }));
    setSelectedEntry(e);
  };

  if (loading) return <div style={{ color: '#5A7A94', padding: '48px', textAlign: 'center' }}>Loading...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate('/')}>← Home</button>
        <span style={styles.screenTitle}>Progress</span>
      </div>

      <div style={styles.body}>

        {/* Dashboard block */}
        {n === 0 && !streak ? (
          <div style={styles.emptyBlock}>No entries yet. Complete your first scan to see progress.</div>
        ) : (
          <div style={styles.dashBlock}>
            <div style={styles.dashRow1}>
              <div>
                <div style={styles.osLabel}>Operating System</div>
                <div style={{ fontFamily: 'Georgia, serif', fontSize: '32px', fontWeight: '300', color: osColor }}>{osTendency}</div>
                <div style={{ fontSize: '11px', color: '#5A7A94', marginTop: '6px' }}>{label} tendency</div>
              </div>
              <div style={{ ...styles.scoreCol, borderLeft: '3px solid #6BA3C8' }}>
                <div style={{ ...styles.scoreColLabel, color: '#6BA3C8' }}>ISM</div>
                <div style={{ ...styles.scoreColNum, color: '#6BA3C8' }}>{avgISM !== null ? avgISM + '%' : '--'}</div>
                <div style={styles.scoreColSub}>avg</div>
              </div>
              <div style={{ ...styles.scoreCol, borderLeft: '3px solid #B088D4' }}>
                <div style={{ ...styles.scoreColLabel, color: '#B088D4' }}>ESM</div>
                <div style={{ ...styles.scoreColNum, color: '#B088D4' }}>{avgESM !== null ? avgESM + '%' : '--'}</div>
                <div style={styles.scoreColSub}>avg</div>
              </div>
              <div style={{ ...styles.scoreCol, borderLeft: '3px solid #4EC9A0' }}>
                <div style={{ ...styles.scoreColLabel, color: '#4EC9A0' }}>AXIS</div>
                <div style={{ ...styles.scoreColNum, color: '#4EC9A0' }}>{avgAXIS !== null ? avgAXIS + '%' : '--'}</div>
                <div style={styles.scoreColSub}>avg</div>
              </div>
            </div>
            <div style={styles.dashRow2}>
              <div>
                <div style={styles.statLabel}>Period</div>
                <div style={{ fontFamily: 'Georgia, serif', fontSize: '24px', fontWeight: '300', color: '#D8E6F0' }}>{label}</div>
                <div style={{ marginTop: '8px' }}>
                  <span style={styles.entryBadge}>{n === 1 ? '1 entry' : n + ' entries'}</span>
                </div>
              </div>
              {streak > 0 && (
                <div style={{ textAlign: 'center' }}>
                  <div style={styles.statLabel}>Streak</div>
                  <div style={{ fontFamily: 'Georgia, serif', fontSize: '42px', fontWeight: '300', color: '#6BA3C8', lineHeight: 1 }}>{streak}</div>
                  <div style={{ fontSize: '11px', color: '#5A7A94', marginTop: '6px' }}>{streak === 1 ? 'consecutive day' : 'consecutive days'}</div>
                </div>
              )}
              {bestKey && (
                <div style={{ textAlign: 'center' }}>
                  <div style={styles.statLabel}>Personal Best</div>
                  <div style={{ fontFamily: 'Georgia, serif', fontSize: '42px', fontWeight: '300', color: '#4AAE88', lineHeight: 1 }}>{bestScore}%</div>
                  <div style={{ fontSize: '11px', color: '#5A7A94', marginTop: '6px' }}>{bestDate}</div>
                </div>
              )}
              {hasTodayEntry && (
                <button style={styles.viewResultsBtn} onClick={() => navigate('/results', { state: { origin: 'progress' } })}>
                  View Today Results
                </button>
              )}
            </div>
          </div>
        )}

        {/* Chart + Calendar layout */}
        <div style={styles.trackLayout}>
          <div>
            <div style={styles.graphTop}>
              <div style={styles.legend}>
                <div style={styles.legendItem}><div style={{ ...styles.legendDot, background: '#6BA3C8' }} /><span>ISM</span></div>
                <div style={styles.legendItem}><div style={{ ...styles.legendDot, background: '#B088D4' }} /><span>ESM</span></div>
                <div style={styles.legendItem}><div style={{ ...styles.legendDot, background: '#4EC9A0' }} /><span>AXIS</span></div>
              </div>
              <div style={styles.viewTabs}>
                {['7d', '4w', '12m'].map(v => (
                  <button key={v} style={{ ...styles.viewTab, ...(view === v ? styles.viewTabActive : {}) }} onClick={() => setView(v)}>
                    {v === '7d' ? '7D' : v === '4w' ? '4W' : '12M'}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ position: 'relative', width: '100%' }}>{renderISMChart()}</div>
          </div>

          <div>
            <div style={styles.calHeader}>
              <div style={styles.calMonth}>{monthName}</div>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button style={styles.calBtn} onClick={() => { let m = calMonth - 1; let y = calYear; if (m < 0) { m = 11; y--; } setCalMonth(m); setCalYear(y); setSelectedEntry(null); }}>‹</button>
                <button style={styles.calBtn} onClick={() => { let m = calMonth + 1; let y = calYear; if (m > 11) { m = 0; y++; } setCalMonth(m); setCalYear(y); setSelectedEntry(null); }}>›</button>
              </div>
            </div>
            <div style={styles.calGrid}>
              {dayLabels.map(d => <div key={d} style={styles.calDayLabel}>{d}</div>)}
              {Array(firstDay).fill(null).map((_, i) => <div key={`e${i}`} />)}
              {Array(daysInMonth).fill(null).map((_, i) => {
                const day = i + 1;
                const key = calYear + '-' + String(calMonth + 1).padStart(2, '0') + '-' + String(day).padStart(2, '0');
                const isToday = calYear === today.getFullYear() && calMonth === today.getMonth() && day === today.getDate();
                const hasEntry = !!entries[key];
                return (
                  <div key={day} style={{ ...styles.calDay, ...(isToday && !hasEntry ? styles.calDayToday : {}), ...(hasEntry ? styles.calDayHasEntry : {}), ...(hasEntry && isToday ? styles.calDayTodayEntry : {}) }} onClick={() => hasEntry && handleCalDay(day)}>
                    {day}
                  </div>
                );
              })}
            </div>
            {selectedEntry && (
              <div style={styles.entryDetail}>
                <div style={styles.entryDetailDate}>{selectedDateStr}</div>
                <div style={styles.entryDetailScores}>
                  <div style={styles.entryDetailScore}><div style={styles.entryDetailLabel}>ISM</div><div style={{ ...styles.entryDetailValue, color: '#6BA3C8' }}>{selectedEntry.ismPct}%</div></div>
                  <div style={styles.entryDetailScore}><div style={styles.entryDetailLabel}>ESM</div><div style={{ ...styles.entryDetailValue, color: '#B088D4' }}>{selectedEntry.esmPct}%</div></div>
                  <div style={styles.entryDetailScore}><div style={styles.entryDetailLabel}>AXIS</div><div style={{ ...styles.entryDetailValue, color: '#4EC9A0' }}>{selectedEntry.totalPct}%</div></div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CBM Chart */}
        <div style={{ marginTop: '48px', paddingTop: '36px', borderTop: '1px solid rgba(107,163,200,0.12)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '4px', textTransform: 'uppercase', color: '#5A7A94' }}>Compulsive Behavior Log</div>
              {cbmResistance !== null && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '8px', height: '8px', background: 'rgba(255,200,80,0.8)', borderRadius: '50%' }} />
                  <span style={{ fontSize: '10px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,200,80,0.8)' }}>Resistance: {cbmResistance.toFixed(1)} ({CBM_LEVEL_NAMES[Math.min(Math.round(cbmResistance), 5)]})</span>
                  <span style={{ fontSize: '10px', color: '#5A7A94', marginLeft: '4px' }}>rolling avg</span>
                </div>
              )}
            </div>
            <div style={styles.viewTabs}>
              {['7d', '4w', '12m'].map(v => (
                <button key={v} style={{ ...styles.viewTab, ...(cbmView === v ? styles.viewTabActive : {}) }} onClick={() => setCbmView(v)}>
                  {v === '7d' ? '7D' : v === '4w' ? '4W' : '12M'}
                </button>
              ))}
            </div>
          </div>
          <div style={{ position: 'relative', width: '100%' }}>{renderCBMChart()}</div>
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
  body: { maxWidth: '1100px', margin: '0 auto', padding: '40px 32px 80px', width: '100%' },
  emptyBlock: { border: '1px solid rgba(107,163,200,0.2)', borderRadius: '3px', background: '#162534', padding: '40px', marginBottom: '32px', textAlign: 'center', fontSize: '13px', letterSpacing: '3px', textTransform: 'uppercase', color: '#5A7A94' },
  dashBlock: { border: '1px solid rgba(107,163,200,0.6)', borderRadius: '3px', background: '#162534', padding: '36px 48px', marginBottom: '32px', boxShadow: '0 0 24px rgba(107,163,200,0.15), 0 0 48px rgba(107,163,200,0.08), inset 0 1px 0 rgba(107,163,200,0.2)' },
  dashRow1: { display: 'grid', gridTemplateColumns: '1fr auto auto auto', alignItems: 'center', gap: '40px', paddingBottom: '28px', borderBottom: '1px solid rgba(107,163,200,0.15)' },
  osLabel: { fontSize: '11px', fontWeight: '600', letterSpacing: '4px', textTransform: 'uppercase', color: '#6BA3C8', marginBottom: '8px', textShadow: '0 0 20px rgba(107,163,200,0.4)' },
  scoreCol: { textAlign: 'center', padding: '0 24px' },
  scoreColLabel: { fontSize: '11px', fontWeight: '600', letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '8px' },
  scoreColNum: { fontFamily: 'Georgia, serif', fontSize: '40px', fontWeight: '300', lineHeight: 1 },
  scoreColSub: { fontSize: '11px', color: '#5A7A94', marginTop: '6px' },
  dashRow2: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '28px' },
  statLabel: { fontSize: '11px', fontWeight: '600', letterSpacing: '4px', textTransform: 'uppercase', color: '#5A7A94', marginBottom: '6px' },
  entryBadge: { fontSize: '10px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', padding: '3px 10px', borderRadius: '10px', background: 'rgba(107,163,200,0.1)', border: '1px solid rgba(107,163,200,0.25)', color: '#6BA3C8' },
  viewResultsBtn: { fontSize: '10px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', padding: '10px 20px', border: '1px solid rgba(107,163,200,0.4)', background: 'none', color: '#6BA3C8', cursor: 'pointer', borderRadius: '2px' },
  trackLayout: { display: 'grid', gridTemplateColumns: '1fr 280px', gap: '40px', alignItems: 'start' },
  graphTop: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' },
  legend: { display: 'flex', alignItems: 'center', gap: '20px' },
  legendItem: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#5A7A94' },
  legendDot: { width: '8px', height: '8px', borderRadius: '50%' },
  viewTabs: { display: 'flex', gap: '2px' },
  viewTab: { fontSize: '9px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', padding: '6px 12px', border: '1px solid rgba(107,163,200,0.2)', background: 'none', color: '#5A7A94', cursor: 'pointer', borderRadius: '2px' },
  viewTabActive: { background: '#1a3a5c', color: 'white', borderColor: '#1a3a5c' },
  calHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' },
  calMonth: { fontSize: '13px', fontWeight: '600', letterSpacing: '2px', color: '#D8E6F0' },
  calBtn: { background: 'none', border: '1px solid rgba(107,163,200,0.2)', color: '#5A7A94', cursor: 'pointer', padding: '4px 10px', fontSize: '16px', borderRadius: '2px' },
  calGrid: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '3px' },
  calDayLabel: { fontSize: '9px', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase', color: '#5A7A94', textAlign: 'center', padding: '4px 0 8px' },
  calDay: { aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '500', color: '#5A7A94', borderRadius: '2px' },
  calDayToday: { fontWeight: '700', color: '#6BA3C8', border: '1.5px solid #6BA3C8' },
  calDayHasEntry: { background: '#1a3a5c', color: 'white', fontWeight: '600', cursor: 'pointer' },
  calDayTodayEntry: { background: '#6BA3C8', border: 'none', color: 'white' },
  entryDetail: { marginTop: '14px', padding: '16px', background: '#162534', borderLeft: '2px solid #6BA3C8' },
  entryDetailDate: { fontSize: '9px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', color: '#5A7A94', marginBottom: '10px' },
  entryDetailScores: { display: 'flex', gap: '20px' },
  entryDetailScore: { textAlign: 'center' },
  entryDetailLabel: { fontSize: '8px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', color: '#5A7A94', marginBottom: '2px' },
  entryDetailValue: { fontFamily: 'Georgia, serif', fontSize: '22px', fontWeight: '300' },
};

export default Progress;