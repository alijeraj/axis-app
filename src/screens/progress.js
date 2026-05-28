import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Page, AppHeader, PageBody } from '../components/Layout';

const API = 'https://axis-backend-production-5e9b.up.railway.app';

// AUC model: no levels. Series carries D, R, and score per day.

function Progress() {
  const navigate = useNavigate();
  const token = localStorage.getItem('axis_token');
  const initialView = (() => {
    const params = new URLSearchParams(window.location.search);
    const v = params.get('view');
    return ['7d', '4w', '12m'].includes(v) ? v : '7d';
  })();
  const initialTab = (() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('tab') === 'behavior' ? 'behavior' : 'scan';
  })();
  const [tab, setTab] = useState(initialTab);
  const [entries, setEntries] = useState({});
  const [cbmLog, setCbmLog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState(initialView);
  const [cbmView, setCbmView] = useState(initialView);
  const [scanLines, setScanLines] = useState({ ismPct: true, esmPct: true, totalPct: true });
  const [cbmLines, setCbmLines] = useState({ d: true, r: true, score: true });
  const toggleScan = (k) => setScanLines(s => ({ ...s, [k]: !s[k] }));
  const toggleCbm = (k) => setCbmLines(s => ({ ...s, [k]: !s[k] }));
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [selectedDateStr, setSelectedDateStr] = useState('');
  const [selectedCbm, setSelectedCbm] = useState(null);
  const [selectedCbmDateStr, setSelectedCbmDateStr] = useState('');

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

  const days = view === '7d' ? 7 : view === '4w' ? 30 : 365;
  const label = view === '7d' ? 'Weekly' : view === '4w' ? 'Monthly' : 'Yearly';
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
  const osColor = avgISMRaw > 2 ? '#4AAE88' : avgISMRaw < -2 ? '#C87878' : '#8BAFC8';

  let streak = 0;
  const checkDate = new Date(today);
  while (true) {
    const k = checkDate.getFullYear() + '-' + String(checkDate.getMonth() + 1).padStart(2, '0') + '-' + String(checkDate.getDate()).padStart(2, '0');
    if (entries[k]) { streak++; checkDate.setDate(checkDate.getDate() - 1); }
    else break;
  }

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
      for (let i = 29; i >= 0; i--) {
        const d = new Date(today); d.setDate(today.getDate() - i);
        const key = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
        const lbl = (d.getMonth() + 1) + '/' + d.getDate();
        data.push({ label: lbl, key, entry: entries[key] ? getEntryPct(entries[key]) : null });
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

  const dk = (d) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');

  const validLog = (e) => e && e.date && typeof e.dTotal === 'number';

  const getCBMSeries = (v) => {
    if (v === '12m') {
      const out = [];
      for (let i = 11; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const mk = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
        const lbl = d.toLocaleDateString('en-US', { month: 'short' });
        const logs = cbmLog.filter(e => validLog(e) && (new Date(e.date).getFullYear() + '-' + String(new Date(e.date).getMonth() + 1).padStart(2, '0')) === mk);
        if (logs.length) {
          const dAvg = Math.round(logs.reduce((a, e) => a + e.dTotal, 0) / logs.length);
          const rAvg = Math.round(logs.reduce((a, e) => a + e.rTotal, 0) / logs.length);
          out.push({ label: lbl, d: dAvg, r: rAvg, score: rAvg - dAvg });
        } else out.push({ label: lbl, d: null, r: null, score: null });
      }
      return out;
    }
    const span = v === '7d' ? 7 : 30;
    const out = [];
    for (let i = span - 1; i >= 0; i--) {
      const d = new Date(today); d.setDate(today.getDate() - i);
      const key = dk(d);
      const lbl = v === '7d' ? d.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0) + d.getDate() : (d.getMonth() + 1) + '/' + d.getDate();
      const e = cbmLog.find(x => validLog(x) && dk(new Date(x.date)) === key);
      out.push({ label: lbl, d: e ? e.dTotal : null, r: e ? e.rTotal : null, score: e ? e.score : null });
    }
    return out;
  };

  const chartData = getChartData();
  const cbmSeries = getCBMSeries(cbmView);
  const cbmWithData = cbmSeries.filter(p => p.score !== null);
  const avgD = cbmWithData.length ? Math.round(cbmWithData.reduce((a, p) => a + p.d, 0) / cbmWithData.length) : null;
  const avgR = cbmWithData.length ? Math.round(cbmWithData.reduce((a, p) => a + p.r, 0) / cbmWithData.length) : null;
  const avgScore = cbmWithData.length ? Math.round(cbmWithData.reduce((a, p) => a + p.score, 0) / cbmWithData.length) : null;

  // Behavior stats for dashboard + calendar
  const cbmByDate = {};
  cbmLog.forEach(e => { if (validLog(e)) cbmByDate[dk(new Date(e.date))] = e; });
  const cbmCount = Object.keys(cbmByDate).length;
  let cbmStreak = 0;
  const cbmCheck = new Date(today);
  while (cbmByDate[dk(cbmCheck)]) { cbmStreak++; cbmCheck.setDate(cbmCheck.getDate() - 1); }
  let cbmBest = null; let cbmBestKey = null;
  Object.keys(cbmByDate).forEach(k => {
    const sc = cbmByDate[k].score;
    if (cbmBest === null || sc > cbmBest) { cbmBest = sc; cbmBestKey = k; }
  });
  let cbmBestDate = '';
  if (cbmBestKey) {
    const bp = cbmBestKey.split('-');
    cbmBestDate = new Date(bp[0], bp[1] - 1, bp[2]).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
  const cbmLoggedToday = !!cbmByDate[dk(today)];

  const renderISMChart = () => {
    const W = 600; const H = 220;
    const PAD = { top: 20, right: 20, bottom: 30, left: 40 };
    const cW = W - PAD.left - PAD.right;
    const cH = H - PAD.top - PAD.bottom;
    const hasData = chartData.some(d => d.entry);
    if (!hasData) return <div style={{ color: '#8BAFC8', padding: '40px', textAlign: 'center', fontStyle: 'italic', fontSize: '13px' }}>No entries yet.</div>;

    const xPos = (i) => PAD.left + (i / (chartData.length - 1 || 1)) * cW;
    const yPos = (pct) => PAD.top + cH - (pct / 100) * cH;

    const grid = [];
    for (let g = 0; g <= 4; g++) {
      const y = PAD.top + (g / 4) * cH;
      grid.push(<line key={`g${g}`} x1={PAD.left} y1={y} x2={W - PAD.right} y2={y} stroke="rgba(142,196,224,0.12)" strokeWidth="1" />);
      grid.push(<text key={`gt${g}`} x={PAD.left - 6} y={y + 4} fill="rgba(142,196,224,0.5)" fontSize="9" textAnchor="end">{100 - g * 25}</text>);
    }

    const buildPath = (key) => {
      const pts = chartData.map((d, i) => d.entry ? `${xPos(i)},${yPos(d.entry[key])}` : null).filter(Boolean);
      if (pts.length < 2) return null;
      return 'M' + pts.join(' L');
    };

    return (
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: H }}>
        {grid}
        {chartData.map((d, i) => <text key={i} x={xPos(i)} y={H - 6} fill="rgba(142,196,224,0.6)" fontSize="9" textAnchor="middle">{d.label}</text>)}
        {scanLines.ismPct && buildPath('ismPct') && <path d={buildPath('ismPct')} fill="none" stroke="#8EC4E0" strokeWidth="2.5" opacity="0.9" />}
        {scanLines.esmPct && buildPath('esmPct') && <path d={buildPath('esmPct')} fill="none" stroke="#C49FDA" strokeWidth="2.5" opacity="0.9" />}
        {scanLines.totalPct && buildPath('totalPct') && <path d={buildPath('totalPct')} fill="none" stroke="#4EC9A0" strokeWidth="2.5" opacity="0.9" />}
        {chartData.map((d, i) => d.entry ? [
          scanLines.ismPct && <circle key={`ism${i}`} cx={xPos(i)} cy={yPos(d.entry.ismPct)} r="4" fill="#8EC4E0" stroke="#0d1b2a" strokeWidth="2" />,
          scanLines.esmPct && <circle key={`esm${i}`} cx={xPos(i)} cy={yPos(d.entry.esmPct)} r="4" fill="#C49FDA" stroke="#0d1b2a" strokeWidth="2" />,
          scanLines.totalPct && <circle key={`tot${i}`} cx={xPos(i)} cy={yPos(d.entry.totalPct)} r="4" fill="#4EC9A0" stroke="#0d1b2a" strokeWidth="2" />,
        ] : null)}
      </svg>
    );
  };

  const renderCBMChart = () => {
    if (!cbmLog.length) return (
      <div style={{ textAlign: 'center', padding: '60px', fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', color: '#8BAFC8' }}>
        No behavior logs yet. Log a day on the Behavior Log screen.
      </div>
    );
    const hasData = cbmSeries.some(p => p.score !== null);
    if (!hasData) return <div style={{ textAlign: 'center', padding: '60px', fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', color: '#8BAFC8' }}>No logs in this period.</div>;

    const W = 600; const H = 220;
    const PAD = { top: 24, right: 48, bottom: 32, left: 48 };
    const cW = W - PAD.left - PAD.right;
    const cH = H - PAD.top - PAD.bottom;

    // Range must include D, R, and score (which can be negative)
    const allVals = [];
    cbmSeries.forEach(p => { if (p.d !== null) { allVals.push(p.d, p.r, p.score); } });
    const maxVal = allVals.length ? Math.max(...allVals, 1) : 1;
    const minVal = allVals.length ? Math.min(...allVals, 0) : 0;
    const range = (maxVal - minVal) || 1;

    const xPos = (i) => PAD.left + (i / (cbmSeries.length - 1 || 1)) * cW;
    const yPos = (val) => PAD.top + cH - ((val - minVal) / range) * cH;

    const buildPath = (key) => {
      const pts = cbmSeries.map((p, i) => p[key] !== null ? `${xPos(i)},${yPos(p[key])}` : null).filter(Boolean);
      if (pts.length < 2) return null;
      return 'M' + pts.join(' L');
    };

    const grid = [];
    for (let g = 0; g <= 4; g++) {
      const y = PAD.top + (g / 4) * cH;
      const val = Math.round(maxVal - (g / 4) * range);
      grid.push(<line key={`g${g}`} x1={PAD.left} y1={y} x2={W - PAD.right} y2={y} stroke="rgba(142,196,224,0.1)" strokeWidth="1" />);
      grid.push(<text key={`gt${g}`} x={PAD.left - 8} y={y + 4} textAnchor="end" fontSize="9" fill="rgba(142,196,224,0.5)">{val}</text>);
    }
    // zero baseline if range crosses zero
    const zeroLine = minVal < 0 ? <line x1={PAD.left} y1={yPos(0)} x2={W - PAD.right} y2={yPos(0)} stroke="rgba(142,196,224,0.3)" strokeWidth="1" strokeDasharray="3,3" /> : null;

    return (
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: H, overflow: 'visible' }}>
        {grid}
        {zeroLine}
        {cbmSeries.map((p, i) => <text key={i} x={xPos(i)} y={H - 6} textAnchor="middle" fontSize="9" fill="rgba(142,196,224,0.55)">{p.label}</text>)}
        {buildPath('d') && cbmLines.d && <path d={buildPath('d')} fill="none" stroke="#C87878" strokeWidth="2.5" opacity="0.9" />}
        {buildPath('r') && cbmLines.r && <path d={buildPath('r')} fill="none" stroke="#4AAE88" strokeWidth="2.5" opacity="0.9" />}
        {buildPath('score') && cbmLines.score && <path d={buildPath('score')} fill="none" stroke="#8EC4E0" strokeWidth="2.5" />}
        {cbmSeries.map((p, i) => p.d !== null ? [
          cbmLines.d && <circle key={`d${i}`} cx={xPos(i)} cy={yPos(p.d)} r="4" fill="#C87878" stroke="#0d1b2a" strokeWidth="2" />,
          cbmLines.r && <circle key={`r${i}`} cx={xPos(i)} cy={yPos(p.r)} r="4" fill="#4AAE88" stroke="#0d1b2a" strokeWidth="2" />,
          cbmLines.score && <circle key={`s${i}`} cx={xPos(i)} cy={yPos(p.score)} r="4" fill="#8EC4E0" stroke="#0d1b2a" strokeWidth="2" />,
        ] : null)}
      </svg>
    );
  };

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

  const handleCbmCalDay = (day) => {
    const key = calYear + '-' + String(calMonth + 1).padStart(2, '0') + '-' + String(day).padStart(2, '0');
    if (!cbmByDate[key]) return;
    const parts = key.split('-');
    const d = new Date(parts[0], parts[1] - 1, parts[2]);
    setSelectedCbmDateStr(d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }));
    setSelectedCbm(cbmByDate[key]);
  };

  const cbmLabel = cbmView === '7d' ? 'Weekly' : cbmView === '4w' ? 'Monthly' : 'Yearly';

  if (loading) return <div style={{ color: '#8BAFC8', padding: '48px', textAlign: 'center' }}>Loading...</div>;

  return (
    <Page>
      <AppHeader title="Progress" />

      <PageBody width="content">

        <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid rgba(142,196,224,0.15)', marginBottom: '24px' }}>
          <button style={{ ...styles.tabBtn, ...(tab === 'scan' ? styles.tabBtnActive : {}) }} onClick={() => setTab('scan')}>Scan</button>
          <button style={{ ...styles.tabBtn, ...(tab === 'behavior' ? styles.tabBtnActive : {}) }} onClick={() => setTab('behavior')}>Behavior</button>
        </div>

        {tab === 'scan' ? (
          <>
            {n === 0 && !streak ? (
              <div style={styles.emptyBlock}>No entries yet. Complete your first scan to see progress.</div>
            ) : (
              <div style={styles.dashBlock}>
                <div style={styles.dashRow1}>
                  <div>
                    <div style={styles.osLabel}>Operating System</div>
                    <div style={{ fontFamily: 'Georgia, serif', fontSize: '32px', fontWeight: '300', color: osColor }}>{osTendency}</div>
                    <div style={{ fontSize: '11px', color: '#8BAFC8', marginTop: '6px' }}>{label} tendency</div>
                  </div>
                  <div style={{ ...styles.scoreCol, borderLeft: '3px solid #8EC4E0' }}>
                    <div style={{ ...styles.scoreColLabel, color: '#8EC4E0' }}>ISM</div>
                    <div style={{ ...styles.scoreColNum, color: '#8EC4E0' }}>{avgISM !== null ? avgISM + '%' : '--'}</div>
                    <div style={styles.scoreColSub}>avg</div>
                  </div>
                  <div style={{ ...styles.scoreCol, borderLeft: '3px solid #C49FDA' }}>
                    <div style={{ ...styles.scoreColLabel, color: '#C49FDA' }}>ESM</div>
                    <div style={{ ...styles.scoreColNum, color: '#C49FDA' }}>{avgESM !== null ? avgESM + '%' : '--'}</div>
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
                      <div style={{ fontFamily: 'Georgia, serif', fontSize: '42px', fontWeight: '300', color: '#8EC4E0', lineHeight: 1 }}>{streak}</div>
                      <div style={{ fontSize: '11px', color: '#8BAFC8', marginTop: '6px' }}>{streak === 1 ? 'consecutive day' : 'consecutive days'}</div>
                    </div>
                  )}
                  {bestKey && (
                    <div style={{ textAlign: 'center' }}>
                      <div style={styles.statLabel}>Personal Best</div>
                      <div style={{ fontFamily: 'Georgia, serif', fontSize: '42px', fontWeight: '300', color: '#4AAE88', lineHeight: 1 }}>{bestScore}%</div>
                      <div style={{ fontSize: '11px', color: '#8BAFC8', marginTop: '6px' }}>{bestDate}</div>
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

            <div style={styles.trackLayout}>
              <div>
                <div style={styles.graphTop}>
                  <div style={styles.legend}>
                    <div style={{ ...styles.legendItem, opacity: scanLines.ismPct ? 1 : 0.35, cursor: 'pointer' }} onClick={() => toggleScan('ismPct')}><div style={{ ...styles.legendDot, background: '#8EC4E0' }} /><span>ISM</span></div>
                    <div style={{ ...styles.legendItem, opacity: scanLines.esmPct ? 1 : 0.35, cursor: 'pointer' }} onClick={() => toggleScan('esmPct')}><div style={{ ...styles.legendDot, background: '#C49FDA' }} /><span>ESM</span></div>
                    <div style={{ ...styles.legendItem, opacity: scanLines.totalPct ? 1 : 0.35, cursor: 'pointer' }} onClick={() => toggleScan('totalPct')}><div style={{ ...styles.legendDot, background: '#4EC9A0' }} /><span>AXIS</span></div>
                  </div>
                  <div style={styles.viewTabs}>
                    {['7d', '4w', '12m'].map(v => (
                      <button key={v} style={{ ...styles.viewTab, ...(view === v ? styles.viewTabActive : {}) }} onClick={() => setView(v)}>
                        {v === '7d' ? 'Weekly' : v === '4w' ? 'Monthly' : 'Yearly'}
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
                    <button style={styles.calBtn} onClick={() => { let m = calMonth - 1; let y = calYear; if (m < 0) { m = 11; y--; } setCalMonth(m); setCalYear(y); setSelectedEntry(null); }}>{'\u2039'}</button>
                    <button style={styles.calBtn} onClick={() => { let m = calMonth + 1; let y = calYear; if (m > 11) { m = 0; y++; } setCalMonth(m); setCalYear(y); setSelectedEntry(null); }}>{'\u203a'}</button>
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
                      <div style={styles.entryDetailScore}><div style={styles.entryDetailLabel}>ISM</div><div style={{ ...styles.entryDetailValue, color: '#8EC4E0' }}>{selectedEntry.ismPct}%</div></div>
                      <div style={styles.entryDetailScore}><div style={styles.entryDetailLabel}>ESM</div><div style={{ ...styles.entryDetailValue, color: '#C49FDA' }}>{selectedEntry.esmPct}%</div></div>
                      <div style={styles.entryDetailScore}><div style={styles.entryDetailLabel}>AXIS</div><div style={{ ...styles.entryDetailValue, color: '#4EC9A0' }}>{selectedEntry.totalPct}%</div></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <>
            {avgScore !== null && (
              <div style={styles.dashBlock}>
                <div style={styles.dashRow1}>
                  <div>
                    <div style={{ ...styles.osLabel, color: '#8EC4E0' }}>Average AXIS</div>
                    <div style={{ fontFamily: 'Georgia, serif', fontSize: '32px', fontWeight: '300', color: avgScore >= 0 ? '#4AAE88' : '#C87878' }}>{avgScore >= 0 ? '+' : ''}{avgScore}</div>
                    <div style={{ fontSize: '11px', color: '#8BAFC8', marginTop: '6px' }}>{cbmLabel} · R − D</div>
                  </div>
                  <div style={{ ...styles.scoreCol, borderLeft: '3px solid #C87878' }}>
                    <div style={{ ...styles.scoreColLabel, color: '#C87878' }}>Dysregulated</div>
                    <div style={{ ...styles.scoreColNum, color: '#C87878' }}>{avgD}</div>
                    <div style={styles.scoreColSub}>avg AUC</div>
                  </div>
                  <div style={{ ...styles.scoreCol, borderLeft: '3px solid #4AAE88' }}>
                    <div style={{ ...styles.scoreColLabel, color: '#4AAE88' }}>Regulated</div>
                    <div style={{ ...styles.scoreColNum, color: '#4AAE88' }}>{avgR}</div>
                    <div style={styles.scoreColSub}>avg AUC</div>
                  </div>
                </div>
                <div style={styles.dashRow2}>
                  <div>
                    <div style={styles.statLabel}>Period</div>
                    <div style={{ fontFamily: 'Georgia, serif', fontSize: '24px', fontWeight: '300', color: '#D8E6F0' }}>{cbmLabel}</div>
                    <div style={{ marginTop: '8px' }}>
                      <span style={styles.entryBadge}>{cbmCount === 1 ? '1 day' : cbmCount + ' days'}</span>
                    </div>
                  </div>
                  {cbmStreak > 0 && (
                    <div style={{ textAlign: 'center' }}>
                      <div style={styles.statLabel}>Streak</div>
                      <div style={{ fontFamily: 'Georgia, serif', fontSize: '42px', fontWeight: '300', color: '#8EC4E0', lineHeight: 1 }}>{cbmStreak}</div>
                      <div style={{ fontSize: '11px', color: '#8BAFC8', marginTop: '6px' }}>{cbmStreak === 1 ? 'consecutive day' : 'consecutive days'}</div>
                    </div>
                  )}
                  {cbmBestKey && (
                    <div style={{ textAlign: 'center' }}>
                      <div style={styles.statLabel}>Best AXIS</div>
                      <div style={{ fontFamily: 'Georgia, serif', fontSize: '42px', fontWeight: '300', color: '#4AAE88', lineHeight: 1 }}>{cbmBest >= 0 ? '+' : ''}{cbmBest}</div>
                      <div style={{ fontSize: '11px', color: '#8BAFC8', marginTop: '6px' }}>{cbmBestDate}</div>
                    </div>
                  )}
                  {cbmLoggedToday && (
                    <button style={styles.viewResultsBtn} onClick={() => navigate('/cbmresults')}>
                      View Today Results
                    </button>
                  )}
                </div>
              </div>
            )}

            <div style={styles.trackLayout}>
              <div>
                <div style={styles.graphTop}>
                  <div style={styles.legend}>
                    <div style={{ ...styles.legendItem, opacity: cbmLines.d ? 1 : 0.35, cursor: 'pointer' }} onClick={() => toggleCbm('d')}><div style={{ ...styles.legendDot, background: '#C87878' }} /><span>Dysregulated</span></div>
                    <div style={{ ...styles.legendItem, opacity: cbmLines.r ? 1 : 0.35, cursor: 'pointer' }} onClick={() => toggleCbm('r')}><div style={{ ...styles.legendDot, background: '#4AAE88' }} /><span>Regulated</span></div>
                    <div style={{ ...styles.legendItem, opacity: cbmLines.score ? 1 : 0.35, cursor: 'pointer' }} onClick={() => toggleCbm('score')}><div style={{ ...styles.legendDot, background: '#8EC4E0' }} /><span>AXIS</span></div>
                  </div>
                  <div style={styles.viewTabs}>
                    {['7d', '4w', '12m'].map(v => (
                      <button key={v} style={{ ...styles.viewTab, ...(cbmView === v ? styles.viewTabActive : {}) }} onClick={() => setCbmView(v)}>
                        {v === '7d' ? 'Weekly' : v === '4w' ? 'Monthly' : 'Yearly'}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ position: 'relative', width: '100%' }}>{renderCBMChart()}</div>
              </div>

              <div>
                <div style={styles.calHeader}>
                  <div style={styles.calMonth}>{monthName}</div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button style={styles.calBtn} onClick={() => { let m = calMonth - 1; let y = calYear; if (m < 0) { m = 11; y--; } setCalMonth(m); setCalYear(y); setSelectedCbm(null); }}>{'\u2039'}</button>
                    <button style={styles.calBtn} onClick={() => { let m = calMonth + 1; let y = calYear; if (m > 11) { m = 0; y++; } setCalMonth(m); setCalYear(y); setSelectedCbm(null); }}>{'\u203a'}</button>
                  </div>
                </div>
                <div style={styles.calGrid}>
                  {dayLabels.map(d => <div key={d} style={styles.calDayLabel}>{d}</div>)}
                  {Array(firstDay).fill(null).map((_, i) => <div key={`e${i}`} />)}
                  {Array(daysInMonth).fill(null).map((_, i) => {
                    const day = i + 1;
                    const key = calYear + '-' + String(calMonth + 1).padStart(2, '0') + '-' + String(day).padStart(2, '0');
                    const isToday = calYear === today.getFullYear() && calMonth === today.getMonth() && day === today.getDate();
                    const hasEntry = !!cbmByDate[key];
                    return (
                      <div key={day} style={{ ...styles.calDay, ...(isToday && !hasEntry ? styles.calDayToday : {}), ...(hasEntry ? styles.calDayHasEntry : {}), ...(hasEntry && isToday ? styles.calDayTodayEntry : {}) }} onClick={() => hasEntry && handleCbmCalDay(day)}>
                        {day}
                      </div>
                    );
                  })}
                </div>
                {selectedCbm && (
                  <div style={styles.entryDetail}>
                    <div style={styles.entryDetailDate}>{selectedCbmDateStr}</div>
                    <div style={styles.entryDetailScores}>
                      <div style={styles.entryDetailScore}><div style={styles.entryDetailLabel}>Dys</div><div style={{ ...styles.entryDetailValue, color: '#C87878' }}>{selectedCbm.dTotal}</div></div>
                      <div style={styles.entryDetailScore}><div style={styles.entryDetailLabel}>Reg</div><div style={{ ...styles.entryDetailValue, color: '#4AAE88' }}>{selectedCbm.rTotal}</div></div>
                      <div style={styles.entryDetailScore}><div style={styles.entryDetailLabel}>AXIS</div><div style={{ ...styles.entryDetailValue, color: '#8EC4E0' }}>{selectedCbm.score >= 0 ? '+' : ''}{selectedCbm.score}</div></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

      </PageBody>
    </Page>
  );
}

const styles = {
  container: { minHeight: '100vh', background: '#0d1b2a', display: 'flex', flexDirection: 'column' },
  header: { display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 32px', borderBottom: '1px solid rgba(142,196,224,0.15)', background: '#0f2236' },
  backBtn: { background: 'none', border: 'none', color: '#8BAFC8', fontSize: '12px', fontWeight: '600', letterSpacing: '1px', cursor: 'pointer', padding: 0 },
  screenTitle: { fontFamily: 'Georgia, serif', fontSize: '18px', fontWeight: '300', color: '#D8E6F0', letterSpacing: '2px' },
  body: { maxWidth: '1100px', margin: '0 auto', padding: '40px 32px 80px', width: '100%' },
  tabBtn: { background: 'none', border: 'none', borderBottom: '2px solid transparent', padding: '12px 24px', color: '#8BAFC8', fontSize: '11px', fontWeight: '600', letterSpacing: '3px', textTransform: 'uppercase', cursor: 'pointer', marginBottom: '-1px' },
  tabBtnActive: { color: '#D8E6F0', borderBottomColor: '#8EC4E0' },
  emptyBlock: { border: '1px solid rgba(142,196,224,0.2)', borderRadius: '3px', background: '#162534', padding: '40px', marginBottom: '32px', textAlign: 'center', fontSize: '13px', letterSpacing: '3px', textTransform: 'uppercase', color: '#8BAFC8' },
  dashBlock: { border: '1px solid rgba(142,196,224,0.6)', borderRadius: '3px', background: '#162534', padding: '20px 36px', marginBottom: '20px', boxShadow: '0 0 24px rgba(142,196,224,0.15), 0 0 48px rgba(142,196,224,0.08), inset 0 1px 0 rgba(142,196,224,0.2)' },
  dashRow1: { display: 'grid', gridTemplateColumns: '1fr auto auto auto', alignItems: 'center', gap: '28px' },
  osLabel: { fontSize: '11px', fontWeight: '600', letterSpacing: '4px', textTransform: 'uppercase', color: '#8EC4E0', marginBottom: '8px', textShadow: '0 0 20px rgba(142,196,224,0.4)' },
  scoreCol: { textAlign: 'center', padding: '0 18px' },
  scoreColLabel: { fontSize: '10px', fontWeight: '600', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '8px' },
  scoreColNum: { fontFamily: 'Georgia, serif', fontSize: '38px', fontWeight: '300', lineHeight: 1 },
  scoreColSub: { fontSize: '11px', color: '#8BAFC8', marginTop: '6px' },
  dashRow2: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '18px', paddingTop: '18px', borderTop: '1px solid rgba(142,196,224,0.15)' },
  statLabel: { fontSize: '11px', fontWeight: '600', letterSpacing: '4px', textTransform: 'uppercase', color: '#8BAFC8', marginBottom: '6px' },
  entryBadge: { fontSize: '10px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', padding: '3px 10px', borderRadius: '10px', background: 'rgba(142,196,224,0.1)', border: '1px solid rgba(142,196,224,0.25)', color: '#8EC4E0' },
  viewResultsBtn: { fontSize: '10px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', padding: '10px 20px', border: '1px solid rgba(142,196,224,0.4)', background: 'none', color: '#8EC4E0', cursor: 'pointer', borderRadius: '2px' },
  trackLayout: { display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 240px', gap: '24px', alignItems: 'start' },
  graphTop: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' },
  legend: { display: 'flex', alignItems: 'center', gap: '20px' },
  legendItem: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#8BAFC8' },
  legendDot: { width: '8px', height: '8px', borderRadius: '50%' },
  viewTabs: { display: 'flex', gap: '2px' },
  viewTab: { fontSize: '9px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', padding: '6px 12px', border: '1px solid rgba(142,196,224,0.2)', background: 'none', color: '#8BAFC8', cursor: 'pointer', borderRadius: '2px' },
  viewTabActive: { background: '#1a3a5c', color: '#D8E6F0', borderColor: '#1a3a5c' },
  calHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' },
  calMonth: { fontSize: '13px', fontWeight: '600', letterSpacing: '2px', color: '#D8E6F0' },
  calBtn: { background: 'none', border: '1px solid rgba(142,196,224,0.2)', color: '#8BAFC8', cursor: 'pointer', padding: '4px 10px', fontSize: '16px', borderRadius: '2px' },
  calGrid: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '3px' },
  calDayLabel: { fontSize: '9px', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase', color: '#8BAFC8', textAlign: 'center', padding: '4px 0 8px' },
  calDay: { aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '500', color: '#8BAFC8', borderRadius: '2px' },
  calDayToday: { fontWeight: '700', color: '#8EC4E0', border: '1.5px solid #8EC4E0' },
  calDayHasEntry: { background: '#1a3a5c', color: '#D8E6F0', fontWeight: '600', cursor: 'pointer' },
  calDayTodayEntry: { background: '#8EC4E0', border: 'none', color: '#0d1b2a' },
  entryDetail: { marginTop: '14px', padding: '16px', background: '#162534', borderLeft: '2px solid #8EC4E0' },
  entryDetailDate: { fontSize: '9px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', color: '#8BAFC8', marginBottom: '10px' },
  entryDetailScores: { display: 'flex', gap: '20px' },
  entryDetailScore: { textAlign: 'center' },
  entryDetailLabel: { fontSize: '8px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', color: '#8BAFC8', marginBottom: '2px' },
  entryDetailValue: { fontFamily: 'Georgia, serif', fontSize: '22px', fontWeight: '300' },
};

export default Progress;