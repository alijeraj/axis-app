import React, { useState, useEffect } from 'react';
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

const REG_CONFIGS = [
  { label: 'Mild',     color: 'rgba(74,174,136,0.20)',  border: 'rgba(74,174,136,0.45)',  width: '100%' },
  { label: 'Low',      color: 'rgba(74,174,136,0.16)',  border: 'rgba(74,174,136,0.4)',   width: '85%'  },
  { label: 'Moderate', color: 'rgba(74,174,136,0.13)',  border: 'rgba(74,174,136,0.35)',  width: '68%'  },
  { label: 'Intense',  color: 'rgba(74,174,136,0.10)',  border: 'rgba(74,174,136,0.3)',   width: '50%'  },
  { label: 'Severe',   color: 'rgba(74,174,136,0.08)',  border: 'rgba(74,174,136,0.25)',  width: '32%'  },
];

const LOG_CONFIGS = [
  { label: 'Mild',     color: 'rgba(74,174,136,0.3)',   border: 'rgba(74,174,136,0.5)',   num: 1 },
  { label: 'Low',      color: 'rgba(107,163,200,0.25)', border: 'rgba(107,163,200,0.45)', num: 2 },
  { label: 'Moderate', color: 'rgba(155,126,200,0.25)', border: 'rgba(155,126,200,0.45)', num: 3 },
  { label: 'Intense',  color: 'rgba(200,126,80,0.25)',  border: 'rgba(200,126,80,0.45)',  num: 4 },
  { label: 'Severe',   color: 'rgba(176,90,90,0.3)',    border: 'rgba(176,90,90,0.5)',    num: 5 },
];

const LEVEL_NAMES = ['Mild', 'Low', 'Moderate', 'Intense', 'Severe'];

function CBM() {
  const navigate = useNavigate();
  const token = localStorage.getItem('axis_token');
  const [view, setView] = useState('dysregulated');
  const [data, setData] = useState({ levels: Array(5).fill(null).map(() => ({ behaviors: [] })) });
  const [cbmLog, setCbmLog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);
  const [showInsightModal, setShowInsightModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [complexes, setComplexes] = useState([]);
  const [popup, setPopup] = useState(null); // { levelIdx, behaviorIdx, name, x, y, showMove }
  const [selectedLogLevel, setSelectedLogLevel] = useState(null);
  const [logNote, setLogNote] = useState('');
  const [insightData, setInsightData] = useState(null); // { name, level, idx }
  const [editForm, setEditForm] = useState({ name: '', level: 0, alternative: '' });
  const [editTarget, setEditTarget] = useState(null); // { level, idx }
  const [linkTarget, setLinkTarget] = useState(null);
  const [selectedComplex, setSelectedComplex] = useState('');
  const [form, setForm] = useState({ name: '', level: 0, alternative: '' });

  useEffect(() => { loadData(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadData = async () => {
    try {
      const [cbmRes, complexRes, cbmLogRes] = await Promise.all([
        axios.get(`${API}/api/cbm`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/api/complexes`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/api/cbm-log`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (cbmRes.data && cbmRes.data.levels) setData(cbmRes.data);
      setComplexes(complexRes.data || []);
      setCbmLog(cbmLogRes.data || []);
    } catch (err) {
      console.log('Error loading CBM:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveData = async (newData) => {
    const existing = await axios.get(`${API}/api/cbm`, { headers: { Authorization: `Bearer ${token}` } });
    if (existing.data && existing.data.levels) {
      await axios.post(`${API}/api/cbm`, { data: newData }, { headers: { Authorization: `Bearer ${token}` } });
    } else {
      await axios.post(`${API}/api/cbm`, { data: newData }, { headers: { Authorization: `Bearer ${token}` } });
    }
  };

  const saveLog = async (newLog) => {
    await axios.post(`${API}/api/cbm-log`, { data: newLog }, { headers: { Authorization: `Bearer ${token}` } });
    setCbmLog(newLog);
  };

  // Resistance line calculation
  const today = new Date();
  const dk = (d) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  const cutoff = new Date(today); cutoff.setDate(today.getDate() - 28);
  const recentLogs = cbmLog.filter(e => new Date(e.date) >= cutoff);
  const resistance = (() => {
    if (!recentLogs.length) return null;
    // Get daily ceilings
    const dayMap = {};
    recentLogs.forEach(e => {
      const key = dk(new Date(e.date));
      if (!dayMap[key] || e.level > dayMap[key]) dayMap[key] = e.level;
    });
    const ceilings = Object.values(dayMap);
    if (!ceilings.length) return null;
    return Math.round(ceilings.reduce((a, b) => a + b, 0) / ceilings.length * 10) / 10;
  })();

  // Today's log
  const todayKey = dk(today);
  const todayLogs = cbmLog.filter(e => {
    const ld = new Date(e.date);
    return dk(ld) === todayKey;
  });
  const todayCeiling = todayLogs.length > 0 ? Math.max(...todayLogs.map(e => e.level)) : null;

  const saveBehavior = async () => {
    if (!form.name.trim()) return;
    const newData = JSON.parse(JSON.stringify(data));
    newData.levels[form.level].behaviors.push({ name: form.name, alternative: form.alternative, relocated: false });
    await saveData(newData);
    setData(newData);
    setShowAdd(false);
    setForm({ name: '', level: 0, alternative: '' });
  };

  const deleteBehavior = async (levelIdx, behaviorIdx) => {
    const newData = JSON.parse(JSON.stringify(data));
    newData.levels[levelIdx].behaviors.splice(behaviorIdx, 1);
    await saveData(newData);
    setData(newData);
  };

  const moveBehavior = async (fromLevel, fromIdx, toLevel) => {
    const newData = JSON.parse(JSON.stringify(data));
    const behavior = newData.levels[fromLevel].behaviors.splice(fromIdx, 1)[0];
    if (behavior) { behavior.relocated = true; newData.levels[toLevel].behaviors.push(behavior); }
    await saveData(newData);
    setData(newData);
  };

  const saveEdit = async () => {
    if (!editForm.name.trim() || !editTarget) return;
    const newData = JSON.parse(JSON.stringify(data));
    const behavior = newData.levels[editTarget.level].behaviors[editTarget.idx];
    if (behavior) {
      if (editForm.level !== editTarget.level) {
        newData.levels[editTarget.level].behaviors.splice(editTarget.idx, 1);
        behavior.name = editForm.name;
        behavior.alternative = editForm.alternative;
        newData.levels[editForm.level].behaviors.push(behavior);
      } else {
        behavior.name = editForm.name;
        behavior.alternative = editForm.alternative;
      }
    }
    await saveData(newData);
    setData(newData);
    setShowEditModal(false);
  };

  const saveLink = async () => {
    if (!linkTarget || !selectedComplex) return;
    const newData = JSON.parse(JSON.stringify(data));
    const behavior = newData.levels[linkTarget.level].behaviors[linkTarget.idx];
    if (behavior) behavior.complexLink = selectedComplex;
    await saveData(newData);
    setData(newData);
    setShowLinkModal(false);
  };

  const logEntry = async () => {
    if (selectedLogLevel === null) return;
    const newLog = [...cbmLog, { date: new Date().toISOString(), level: selectedLogLevel, note: logNote }];
    await saveLog(newLog);
    setShowLogModal(false);
    setSelectedLogLevel(null);
    setLogNote('');
  };

  if (loading) return <div style={{ color: '#5A7A94', padding: '48px', textAlign: 'center' }}>Loading...</div>;

  // Add behavior form
  if (showAdd) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <button style={styles.backBtn} onClick={() => setShowAdd(false)}>← Cancel</button>
          <div style={styles.toolbarTitle}>Add Behavior</div>
        </div>
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '40px 32px' }}>
          <div style={styles.card}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Behavior Name</label>
              <input style={styles.input} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Name this behavior..." autoFocus />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Level</label>
              <select style={styles.input} value={form.level} onChange={e => setForm({ ...form, level: parseInt(e.target.value) })}>
                {LEVEL_CONFIGS.map((cfg, i) => <option key={i} value={i}>Level {cfg.num} · {cfg.label}</option>)}
              </select>
            </div>
            <div style={styles.formGroup}>
              <label style={{ ...styles.label, color: '#4AAE88' }}>Alternative Behavior <span style={{ color: '#5A7A94', fontWeight: 400 }}>— optional</span></label>
              <input style={{ ...styles.input, borderColor: 'rgba(74,174,136,0.25)' }} value={form.alternative} onChange={e => setForm({ ...form, alternative: e.target.value })} placeholder="What could you do instead?" />
            </div>
            <div style={styles.formFooter}>
              <button style={styles.cancelBtn} onClick={() => setShowAdd(false)}>Cancel</button>
              <button style={styles.btn} onClick={saveBehavior}>Save</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const hasAlternatives = data.levels.some(l => l.behaviors.some(b => b.alternative));

  return (
    <div style={styles.container} onClick={() => setPopup(null)}>

      {/* Tag popup */}
      {popup && (
        <div
          style={{ position: 'fixed', top: popup.y, left: popup.x, background: '#162534', border: '1px solid rgba(107,163,200,0.2)', borderRadius: '3px', zIndex: 300, minWidth: '180px', boxShadow: '0 4px 24px rgba(0,0,0,0.4)' }}
          onClick={e => e.stopPropagation()}
        >
          <button style={styles.popupBtn} onClick={() => { setPopup(null); /* navigate to CPM */ navigate('/cpm'); }}>Build Complex</button>
          <button style={{ ...styles.popupBtn, borderTop: '1px solid rgba(107,163,200,0.1)', color: '#6BA3C8' }} onClick={() => {
            setInsightData({ name: popup.name, level: popup.levelIdx, idx: popup.behaviorIdx });
            setShowInsightModal(true); setPopup(null);
          }}>See Insight</button>
          <button style={{ ...styles.popupBtn, borderTop: '1px solid rgba(107,163,200,0.1)' }} onClick={() => {
            const b = data.levels[popup.levelIdx].behaviors[popup.behaviorIdx];
            setEditForm({ name: b.name, level: popup.levelIdx, alternative: b.alternative || '' });
            setEditTarget({ level: popup.levelIdx, idx: popup.behaviorIdx });
            setShowEditModal(true); setPopup(null);
          }}>Edit</button>
          <button style={{ ...styles.popupBtn, borderTop: '1px solid rgba(107,163,200,0.1)' }} onClick={() => {
            setLinkTarget({ level: popup.levelIdx, idx: popup.behaviorIdx, name: popup.name });
            setSelectedComplex(data.levels[popup.levelIdx].behaviors[popup.behaviorIdx]?.complexLink || '');
            setShowLinkModal(true); setPopup(null);
          }}>Link to Complex</button>
          <div style={{ borderTop: '1px solid rgba(107,163,200,0.1)' }}>
            <button
              style={{ ...styles.popupBtn, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              onClick={e => { e.stopPropagation(); setPopup({ ...popup, showMove: !popup.showMove }); }}
            >
              Move to Level <span style={{ opacity: 0.5 }}>{popup.showMove ? '▲' : '▼'}</span>
            </button>
            {popup.showMove && (
              <div style={{ borderTop: '1px solid rgba(107,163,200,0.1)' }}>
                {LEVEL_NAMES.map((name, i) => i !== popup.levelIdx ? (
                  <button key={i} style={{ ...styles.popupBtn, paddingLeft: '28px', fontSize: '10px', color: '#5A7A94' }} onClick={() => {
                    moveBehavior(popup.levelIdx, popup.behaviorIdx, i);
                    setPopup(null);
                  }}>{name} ({i + 1})</button>
                ) : null)}
              </div>
            )}
          </div>
          <button style={{ ...styles.popupBtn, borderTop: '1px solid rgba(107,163,200,0.1)', color: '#B05A5A' }} onClick={() => {
            deleteBehavior(popup.levelIdx, popup.behaviorIdx);
            setPopup(null);
          }}>Delete</button>
        </div>
      )}

      {/* Log modal */}
      {showLogModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <div style={styles.modalTitle}>Log Entry</div>
              <button style={styles.modalClose} onClick={() => setShowLogModal(false)}>✕</button>
            </div>
            <div style={styles.modalBody}>
              <div style={{ fontSize: '12px', color: '#5A7A94', marginBottom: '24px' }}>Select the highest level you reached. You can log multiple times today.</div>
              <div style={{ fontSize: '9px', fontWeight: '600', letterSpacing: '3px', textTransform: 'uppercase', color: '#5A7A94', textAlign: 'center', opacity: 0.5, marginBottom: '6px' }}>Higher Dysregulation</div>
              {[4, 3, 2, 1, 0].map(i => {
                const cfg = LOG_CONFIGS[i];
                const behaviors = data.levels[i] ? data.levels[i].behaviors : [];
                const behaviorNames = behaviors.map(b => b.name).join(', ');
                const isSelected = selectedLogLevel === (i + 1);
                return (
                  <div
                    key={i}
                    style={{ border: `1px solid ${cfg.border}`, background: cfg.color, borderRadius: '3px', padding: '12px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px', outline: isSelected ? '2px solid rgba(107,163,200,0.8)' : 'none', boxShadow: isSelected ? '0 0 12px rgba(107,163,200,0.15)' : 'none' }}
                    onClick={() => setSelectedLogLevel(i + 1)}
                  >
                    <div>
                      <span style={{ fontSize: '10px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)' }}>{cfg.label}</span>
                      {behaviorNames && <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '3px' }}>{behaviorNames}</div>}
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: '600', color: 'rgba(255,255,255,0.4)' }}>{cfg.num}</span>
                  </div>
                );
              })}
              <div
                style={{ border: '1px solid rgba(107,163,200,0.2)', background: 'rgba(107,163,200,0.06)', borderRadius: '3px', padding: '12px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px', outline: selectedLogLevel === 0 ? '2px solid rgba(107,163,200,0.8)' : 'none' }}
                onClick={() => setSelectedLogLevel(0)}
              >
                <span style={{ fontSize: '10px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', color: '#5A7A94' }}>Regulated · None</span>
                <span style={{ fontSize: '11px', fontWeight: '600', color: 'rgba(107,163,200,0.4)' }}>0</span>
              </div>
              <div style={{ fontSize: '9px', fontWeight: '600', letterSpacing: '3px', textTransform: 'uppercase', color: '#5A7A94', textAlign: 'center', opacity: 0.5, marginTop: '6px', marginBottom: '20px' }}>Lower Dysregulation</div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Note (optional)</label>
                <input style={styles.input} value={logNote} onChange={e => setLogNote(e.target.value)} placeholder="What happened? What triggered it?" />
              </div>
            </div>
            <div style={styles.modalFooter}>
              <button style={styles.cancelBtn} onClick={() => setShowLogModal(false)}>Cancel</button>
              <button style={styles.btn} onClick={logEntry} disabled={selectedLogLevel === null}>Log It</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit modal */}
      {showEditModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <div style={styles.modalTitle}>Edit Behavior</div>
              <button style={styles.modalClose} onClick={() => setShowEditModal(false)}>✕</button>
            </div>
            <div style={styles.modalBody}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Behavior Name</label>
                <input style={styles.input} value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Level</label>
                <select style={styles.input} value={editForm.level} onChange={e => setEditForm({ ...editForm, level: parseInt(e.target.value) })}>
                  {LEVEL_CONFIGS.map((cfg, i) => <option key={i} value={i}>Level {cfg.num} · {cfg.label}</option>)}
                </select>
              </div>
              <div style={styles.formGroup}>
                <label style={{ ...styles.label, color: '#4AAE88' }}>Alternative Behavior</label>
                <input style={{ ...styles.input, borderColor: 'rgba(74,174,136,0.25)' }} value={editForm.alternative} onChange={e => setEditForm({ ...editForm, alternative: e.target.value })} placeholder="What could you do instead?" />
              </div>
            </div>
            <div style={styles.modalFooter}>
              <button style={styles.cancelBtn} onClick={() => setShowEditModal(false)}>Cancel</button>
              <button style={styles.btn} onClick={saveEdit}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Insight modal */}
      {showInsightModal && insightData && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <div style={styles.modalTitle}>Insight</div>
              <button style={styles.modalClose} onClick={() => setShowInsightModal(false)}>✕</button>
            </div>
            <div style={styles.modalBody}>
              {(() => {
                const b = data.levels[insightData.level]?.behaviors[insightData.idx];
                const alternative = b?.alternative;
                const complexLink = b?.complexLink;
                const complex = complexLink ? complexes.find(c => c.name === complexLink) : null;
                const BURDEN_COLORS = { Fear: '#8B5A3C', Guilt: '#B4A03C', Shame: '#C87832', Anger: '#B05A5A', Envy: '#825AB4', Grief: '#A07882' };
                return (
                  <>
                    <div style={{ fontSize: '9px', fontWeight: '700', letterSpacing: '3px', textTransform: 'uppercase', color: '#6BA3C8', marginBottom: '4px' }}>{LEVEL_NAMES[insightData.level]}</div>
                    <div style={{ fontFamily: 'Georgia, serif', fontSize: '20px', fontWeight: '300', color: '#D8E6F0', marginBottom: alternative ? '12px' : '28px' }}>{insightData.name}</div>
                    {alternative && (
                      <div style={{ padding: '12px 16px', border: '1px solid rgba(74,174,136,0.3)', borderRadius: '3px', background: 'rgba(74,174,136,0.06)', marginBottom: '24px' }}>
                        <div style={{ fontSize: '9px', fontWeight: '700', letterSpacing: '3px', textTransform: 'uppercase', color: '#4AAE88', marginBottom: '6px' }}>Alternative</div>
                        <div style={{ fontSize: '15px', color: '#4AAE88', fontFamily: 'Georgia, serif' }}>{alternative}</div>
                      </div>
                    )}
                    {!complexLink ? (
                      <div style={{ padding: '20px', border: '1px solid rgba(107,163,200,0.15)', borderRadius: '3px', background: 'rgba(107,163,200,0.04)', textAlign: 'center' }}>
                        <div style={{ fontSize: '13px', color: '#5A7A94', fontFamily: 'Georgia, serif', fontStyle: 'italic', marginBottom: '12px' }}>No complex linked to this behavior yet.</div>
                        <div style={{ fontSize: '11px', color: '#5A7A94' }}>Use <strong>Link to Complex</strong> to connect this behavior to its pattern.</div>
                      </div>
                    ) : (
                      <>
                        <div style={{ fontSize: '9px', fontWeight: '700', letterSpacing: '3px', textTransform: 'uppercase', color: '#5A7A94', marginBottom: '12px' }}>Linked Complex</div>
                        {complex ? (
                          <>
                            <div style={{ cursor: 'pointer', padding: '14px 16px', border: '1px solid rgba(107,163,200,0.2)', borderRadius: '3px', background: 'rgba(107,163,200,0.04)', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} onClick={() => setShowInsightModal(false)}>
                              <div>
                                <div style={{ fontSize: '15px', fontWeight: '600', color: '#D8E6F0', marginBottom: '4px' }}>{complex.name}</div>
                                {complex.burden && <div style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: BURDEN_COLORS[complex.burden] || '#6BA3C8' }}>{complex.burden}</div>}
                              </div>
                            </div>
                            {complex.counterBehavior && <div style={{ padding: '14px 16px', border: '1px solid rgba(74,174,136,0.25)', borderRadius: '3px', background: 'rgba(74,174,136,0.05)', marginBottom: '12px' }}>
                              <div style={{ fontSize: '9px', fontWeight: '700', letterSpacing: '3px', textTransform: 'uppercase', color: '#4AAE88', marginBottom: '8px' }}>Counter Behavior</div>
                              <div style={{ fontSize: '14px', color: '#8BAFC8', fontFamily: 'Georgia, serif', lineHeight: 1.7 }}>{complex.counterBehavior}</div>
                            </div>}
                            {complex.counter && <div style={{ padding: '14px 16px', border: '1px solid rgba(74,174,136,0.15)', borderRadius: '3px', background: 'rgba(74,174,136,0.03)' }}>
                              <div style={{ fontSize: '9px', fontWeight: '700', letterSpacing: '3px', textTransform: 'uppercase', color: '#4AAE88', marginBottom: '8px' }}>Counter Belief</div>
                              <div style={{ fontSize: '14px', color: '#8BAFC8', fontFamily: 'Georgia, serif', lineHeight: 1.7 }}>{complex.counter}</div>
                            </div>}
                          </>
                        ) : (
                          <div style={{ fontSize: '14px', color: '#6BA3C8', fontFamily: 'Georgia, serif' }}>{complexLink}</div>
                        )}
                      </>
                    )}
                  </>
                );
              })()}
            </div>
            <div style={styles.modalFooter}>
              <button style={styles.btn} onClick={() => setShowInsightModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Link to Complex modal */}
      {showLinkModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <div style={styles.modalTitle}>Link to Complex</div>
              <button style={styles.modalClose} onClick={() => setShowLinkModal(false)}>✕</button>
            </div>
            <div style={styles.modalBody}>
              <div style={{ fontSize: '13px', color: '#5A7A94', marginBottom: '20px' }}>Link <strong style={{ color: '#D8E6F0' }}>{linkTarget?.name}</strong> to a complex pattern.</div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Select Complex</label>
                <select style={styles.input} value={selectedComplex} onChange={e => setSelectedComplex(e.target.value)}>
                  <option value="">-- Select complex --</option>
                  {complexes.map((c, i) => <option key={i} value={c.name}>{c.name}</option>)}
                </select>
              </div>
            </div>
            <div style={styles.modalFooter}>
              <button style={styles.cancelBtn} onClick={() => setShowLinkModal(false)}>Cancel</button>
              <button style={styles.btn} onClick={saveLink} disabled={!selectedComplex}>Link</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate('/')}>← Home</button>
        <span style={styles.toolbarTitle}>Compulsive Behavior Map</span>
        <button style={{ ...styles.btn, marginRight: '8px', background: 'none', border: '1px solid rgba(107,163,200,0.2)', color: '#5A7A94' }} onClick={() => setShowLogModal(true)}>Set Resistance</button>
        <button style={styles.btn} onClick={() => setShowAdd(true)}>+ Add Behavior</button>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 32px 80px', width: '100%' }}>

        {/* Resistance bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', marginBottom: '8px' }}>
          {recentLogs.length === 0 ? (
            <>
              <span style={{ fontSize: '10px', fontWeight: '600', letterSpacing: '3px', textTransform: 'uppercase', color: '#5A7A94' }}>Resistance Line:</span>
              <span style={{ fontSize: '11px', color: '#5A7A94', fontStyle: 'italic' }}>Will appear after your first log entry</span>
            </>
          ) : (
            <>
              <div style={{ width: '10px', height: '2px', background: 'rgba(255,200,80,0.7)' }} />
              <span style={{ fontSize: '10px', fontWeight: '600', letterSpacing: '3px', textTransform: 'uppercase', color: 'rgba(255,200,80,0.8)' }}>Resistance Line</span>
              <span style={{ fontSize: '11px', color: 'rgba(255,200,80,0.6)', letterSpacing: '1px' }}>
                {resistance !== null ? `${resistance.toFixed(1)} (${LEVEL_NAMES[Math.min(Math.round(resistance) - 1, 4)] || 'None'}, 28-day rolling avg)` : '--'}
              </span>
            </>
          )}
        </div>

        {/* View tabs */}
        <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid rgba(107,163,200,0.15)', marginBottom: '20px' }}>
          <button style={{ ...styles.tabBtn, ...(view === 'dysregulated' ? styles.tabBtnActive : {}) }} onClick={() => setView('dysregulated')}>Dysregulated</button>
          <button style={{ ...styles.tabBtn, ...(view === 'regulated' ? { ...styles.tabBtnActive, color: '#4AAE88', borderBottomColor: '#4AAE88' } : {}) }} onClick={() => setView('regulated')}>Regulated Self</button>
        </div>

        {/* Pyramid */}
        {view === 'regulated' && !hasAlternatives ? (
          <div style={{ textAlign: 'center', padding: '40px 24px', fontFamily: 'Georgia, serif', fontStyle: 'italic', color: '#5A7A94' }}>
            Add alternative behaviors to your compulsive behaviors to build your regulated self map.
          </div>
        ) : (
          <>
            <div style={{ textAlign: 'center', fontSize: '9px', fontWeight: '600', letterSpacing: '3px', textTransform: 'uppercase', color: view === 'regulated' ? '#4AAE88' : '#5A7A94', marginBottom: '12px', opacity: 0.5 }}>
              {view === 'regulated' ? 'Higher Regulation' : 'Higher Dysregulation'}
            </div>
            <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', maxWidth: '700px', margin: '0 auto' }}>
              {[4, 3, 2, 1, 0].map(i => {
                const cfg = view === 'dysregulated' ? LEVEL_CONFIGS[i] : REG_CONFIGS[i];
                const behaviors = data.levels[i].behaviors || [];
                const isReg = view === 'regulated';
                const alternatives = behaviors.filter(b => b.alternative && b.alternative.trim());
                return (
                  <React.Fragment key={i}>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '2px', minHeight: '72px', width: cfg.width, background: cfg.color, border: `1px solid ${cfg.border}` }}>
                      <span style={{ position: 'absolute', left: '-80px', fontSize: '9px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', color: isReg ? '#4AAE88' : '#5A7A94', whiteSpace: 'nowrap' }}>{cfg.label}</span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', alignItems: 'center', minHeight: '40px', padding: '12px 24px' }}>
                        {isReg ? (
                          alternatives.length === 0
                            ? <span style={{ fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)', pointerEvents: 'none' }}>Level {i + 1}</span>
                            : alternatives.map((b, bi) => (
                              <span key={bi} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '5px 10px', borderRadius: '2px', fontSize: '11px', fontWeight: '500', border: `1px solid ${cfg.border}`, background: 'rgba(74,174,136,0.08)', color: '#4AAE88', margin: '3px' }}>{b.alternative}</span>
                            ))
                        ) : (
                          behaviors.length === 0
                            ? <span style={{ fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)', pointerEvents: 'none' }}>Level {i + 1}</span>
                            : behaviors.map((b, bi) => (
                              <span
                                key={bi}
                                style={{ fontSize: '11px', fontWeight: '500', letterSpacing: '1px', padding: '5px 14px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.85)', background: 'rgba(0,0,0,0.15)', cursor: 'default', position: 'relative', ...(b.relocated ? { } : {}) }}
                                onClick={e => {
                                  e.stopPropagation();
                                  const rect = e.currentTarget.getBoundingClientRect();
                                  setPopup({ levelIdx: i, behaviorIdx: bi, name: b.name, y: rect.bottom + 6, x: rect.left, showMove: false });
                                }}
                              >
                                {b.name}
                                {b.complexLink && <span style={{ fontSize: '8px', opacity: 0.6, marginLeft: '4px' }}>⟡</span>}
                              </span>
                            ))
                        )}
                      </div>
                      <span style={{ position: 'absolute', right: '-40px', fontSize: '11px', fontWeight: '600', color: isReg ? 'rgba(74,174,136,0.4)' : 'rgba(255,255,255,0.4)' }}>{i + 1}</span>
                    </div>
                    {i > 0 && <div style={{ width: cfg.width, height: '3px', background: `linear-gradient(to bottom, ${cfg.border}, transparent)` }} />}
                  </React.Fragment>
                );
              })}
            </div>
            <div style={{ textAlign: 'center', fontSize: '9px', fontWeight: '600', letterSpacing: '3px', textTransform: 'uppercase', color: view === 'regulated' ? '#4AAE88' : '#5A7A94', marginTop: '12px', opacity: 0.5 }}>
              {view === 'regulated' ? 'Lower Regulation' : 'Lower Dysregulation'}
            </div>

            {/* Today log status */}
            {view === 'dysregulated' && todayCeiling !== null && (
              <div style={{ marginTop: '16px', fontSize: '11px', color: '#5A7A94', letterSpacing: '1px', textAlign: 'center' }}>
                Today: <span style={{ color: '#D8E6F0' }}>Level {todayCeiling} ({LEVEL_NAMES[Math.min(todayCeiling - 1, 4)] || 'Regulated'})</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', background: '#0d1b2a', display: 'flex', flexDirection: 'column' },
  header: { display: 'flex', alignItems: 'center', gap: '8px', padding: '16px 32px', borderBottom: '1px solid rgba(107,163,200,0.15)', background: '#0f2236' },
  backBtn: { background: 'none', border: 'none', color: '#5A7A94', fontSize: '12px', fontWeight: '600', letterSpacing: '1px', cursor: 'pointer', padding: 0, marginRight: '8px' },
  toolbarTitle: { fontSize: '11px', fontWeight: '600', letterSpacing: '4px', textTransform: 'uppercase', color: '#5A7A94', flex: 1, textAlign: 'center' },
  btn: { background: 'rgba(107,163,200,0.15)', border: '1px solid rgba(107,163,200,0.4)', borderRadius: '3px', padding: '8px 16px', color: '#6BA3C8', fontSize: '10px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer', whiteSpace: 'nowrap' },
  tabBtn: { background: 'none', border: 'none', borderBottom: '2px solid transparent', padding: '10px 20px', color: '#5A7A94', fontSize: '10px', fontWeight: '600', letterSpacing: '3px', textTransform: 'uppercase', cursor: 'pointer', marginBottom: '-1px' },
  tabBtnActive: { color: '#D8E6F0', borderBottomColor: '#6BA3C8' },
  popupBtn: { display: 'block', width: '100%', background: 'none', border: 'none', padding: '10px 16px', color: '#D8E6F0', fontSize: '12px', cursor: 'pointer', textAlign: 'left' },
  card: { background: '#162534', border: '1px solid rgba(107,163,200,0.15)', borderRadius: '4px', padding: '32px' },
  formGroup: { marginBottom: '20px' },
  label: { display: 'block', fontSize: '10px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', color: '#5A7A94', marginBottom: '8px' },
  input: { width: '100%', background: '#0f2236', border: '1px solid rgba(107,163,200,0.2)', borderRadius: '3px', padding: '10px 14px', color: '#D8E6F0', fontSize: '14px', outline: 'none', boxSizing: 'border-box' },
  formFooter: { display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' },
  cancelBtn: { background: 'none', border: '1px solid rgba(107,163,200,0.2)', borderRadius: '3px', padding: '10px 20px', color: '#5A7A94', fontSize: '11px', cursor: 'pointer' },
  modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  modal: { background: '#162534', border: '1px solid rgba(107,163,200,0.3)', borderRadius: '4px', width: '100%', maxWidth: '480px', padding: 0, boxShadow: '0 0 40px rgba(0,0,0,0.6)', maxHeight: '90vh', overflowY: 'auto' },
  modalHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 28px 16px' },
  modalTitle: { fontFamily: 'Georgia, serif', fontSize: '22px', fontWeight: '300', color: '#D8E6F0' },
  modalClose: { background: 'none', border: 'none', color: '#5A7A94', cursor: 'pointer', fontSize: '18px' },
  modalBody: { padding: '0 28px 16px' },
  modalFooter: { display: 'flex', gap: '12px', padding: '16px 28px 24px', justifyContent: 'flex-end' },
};

export default CBM;