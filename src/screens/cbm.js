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

function CBM() {
  const navigate = useNavigate();
  const token = localStorage.getItem('axis_token');
  const [view, setView] = useState('dysregulated');
  const [data, setData] = useState({ levels: Array(5).fill(null).map(() => ({ behaviors: [] })) });
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editBehavior, setEditBehavior] = useState(null);
  const [form, setForm] = useState({ name: '', level: 0, alternative: '' });

  useEffect(() => { loadData(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadData = async () => {
    try {
      const res = await axios.get(`${API}/api/cbm`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data && res.data.levels) setData(res.data);
    } catch (err) {
      console.log('Error loading CBM:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveData = async (newData) => {
    await axios.post(`${API}/api/cbm`, { data: newData }, {
      headers: { Authorization: `Bearer ${token}` }
    });
  };

  const openAdd = () => {
    setForm({ name: '', level: 0, alternative: '' });
    setEditBehavior(null);
    setShowAdd(true);
  };

  const openEdit = (levelIdx, behaviorIdx) => {
    const b = data.levels[levelIdx].behaviors[behaviorIdx];
    setForm({ name: b.name, level: levelIdx, alternative: b.alternative || '' });
    setEditBehavior({ levelIdx, behaviorIdx });
    setShowAdd(true);
  };

  const saveBehavior = async () => {
    if (!form.name.trim()) return;
    const newData = JSON.parse(JSON.stringify(data));
    if (editBehavior) {
      newData.levels[editBehavior.levelIdx].behaviors.splice(editBehavior.behaviorIdx, 1);
    }
    newData.levels[form.level].behaviors.push({ name: form.name, alternative: form.alternative });
    await saveData(newData);
    setData(newData);
    setShowAdd(false);
  };

  if (loading) return <div style={{ color: 'var(--text-light)', padding: '48px', textAlign: 'center' }}>Loading...</div>;

  if (showAdd) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <button style={styles.backBtn} onClick={() => setShowAdd(false)}>← Cancel</button>
          <div style={styles.title}>{editBehavior ? 'Edit Behavior' : 'Add Behavior'}</div>
        </div>
        <div style={styles.card}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Behavior Name</label>
            <input
              style={styles.input}
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="Name this behavior..."
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Level</label>
            <select
              style={styles.input}
              value={form.level}
              onChange={e => setForm({ ...form, level: parseInt(e.target.value) })}
            >
              {LEVEL_CONFIGS.map((cfg, i) => (
                <option key={i} value={i}>Level {cfg.num} · {cfg.label}</option>
              ))}
            </select>
          </div>
          <div style={styles.formGroup}>
            <label style={{ ...styles.label, color: 'var(--regulated)' }}>Alternative Behavior <span style={{ color: 'var(--text-light)', fontWeight: 400 }}>— optional</span></label>
            <input
              style={{ ...styles.input, borderColor: 'rgba(74,174,136,0.25)' }}
              value={form.alternative}
              onChange={e => setForm({ ...form, alternative: e.target.value })}
              placeholder="What could you do instead?"
            />
          </div>
          <div style={styles.formFooter}>
            <button style={styles.cancelBtn} onClick={() => setShowAdd(false)}>Cancel</button>
            <button style={styles.btn} onClick={saveBehavior}>Save</button>
          </div>
        </div>
      </div>
    );
  }

  const hasAlternatives = data.levels.some(l => l.behaviors.some(b => b.alternative));

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate('/')}>← Home</button>
        <div style={styles.title}>Behavior Map</div>
        <button style={styles.btn} onClick={openAdd}>+ Add Behavior</button>
      </div>

      <div style={styles.tabs}>
        <button
          style={{ ...styles.tab, ...(view === 'dysregulated' ? styles.tabActive : {}) }}
          onClick={() => setView('dysregulated')}
        >Dysregulated</button>
        <button
          style={{ ...styles.tab, ...(view === 'regulated' ? styles.tabActiveGreen : {}) }}
          onClick={() => setView('regulated')}
        >Regulated Self</button>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '12px', fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--text-light)', opacity: 0.6 }}>
        {view === 'dysregulated' ? 'Higher Dysregulation' : 'Higher Regulation'}
      </div>

      <div style={styles.pyramid}>
        {[4, 3, 2, 1, 0].map(i => {
          const cfg = view === 'dysregulated' ? LEVEL_CONFIGS[i] : REG_CONFIGS[i];
          const behaviors = data.levels[i].behaviors;
          const isReg = view === 'regulated';

          return (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
              <div style={{
                width: cfg.width,
                background: cfg.color,
                border: `1px solid ${cfg.border}`,
                padding: '12px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxSizing: 'border-box',
                minHeight: '52px',
              }}>
                <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', color: isReg ? 'var(--regulated)' : 'rgba(255,255,255,0.7)' }}>
                  {cfg.label}
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', flex: 1, justifyContent: 'center', padding: '0 12px' }}>
                  {isReg ? (
                    behaviors.filter(b => b.alternative).map((b, bi) => (
                      <span key={bi} style={{ padding: '4px 10px', border: `1px solid ${cfg.border}`, borderRadius: '2px', fontSize: '11px', color: 'var(--regulated)', background: 'rgba(74,174,136,0.08)' }}>
                        {b.alternative}
                      </span>
                    ))
                  ) : (
                    behaviors.map((b, bi) => (
                      <span
                        key={bi}
                        style={{ padding: '4px 10px', border: '1px solid rgba(107,163,200,0.3)', borderRadius: '2px', fontSize: '11px', color: 'var(--text-dark)', background: 'rgba(107,163,200,0.08)', cursor: 'pointer' }}
                        onClick={() => openEdit(i, bi)}
                      >
                        {b.name}
                      </span>
                    ))
                  )}
                </div>
                {!isReg && (
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.4)' }}>{cfg.num}</span>
                )}
              </div>
              {i > 0 && (
                <div style={{ width: cfg.width, height: '3px', background: `linear-gradient(to bottom, ${cfg.border}, transparent)` }} />
              )}
            </div>
          );
        })}
      </div>

      <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--text-light)', opacity: 0.6 }}>
        {view === 'dysregulated' ? 'Lower Dysregulation' : 'Lower Regulation'}
      </div>

      {view === 'regulated' && !hasAlternatives && (
        <div style={{ textAlign: 'center', padding: '24px', fontFamily: 'Georgia, serif', fontStyle: 'italic', color: 'var(--text-light)', marginTop: '16px' }}>
          Add alternative behaviors to your compulsive behaviors to build your regulated self map.
        </div>
      )}
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
    marginBottom: '32px',
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
  btn: {
    background: 'rgba(107,163,200,0.15)',
    border: '1px solid rgba(107,163,200,0.4)',
    borderRadius: '3px',
    padding: '10px 20px',
    color: 'var(--steel-blue)',
    fontSize: '11px',
    fontWeight: '600',
    letterSpacing: '2px',
    textTransform: 'uppercase',
    cursor: 'pointer',
  },
  tabs: {
    display: 'flex',
    borderBottom: '1px solid var(--border)',
    marginBottom: '24px',
  },
  tab: {
    background: 'none',
    border: 'none',
    borderBottom: '2px solid transparent',
    padding: '10px 20px',
    color: 'var(--text-light)',
    fontSize: '10px',
    fontWeight: '600',
    letterSpacing: '3px',
    textTransform: 'uppercase',
    cursor: 'pointer',
    marginBottom: '-1px',
  },
  tabActive: {
    color: 'var(--text-dark)',
    borderBottomColor: 'var(--steel-blue)',
  },
  tabActiveGreen: {
    color: 'var(--regulated)',
    borderBottomColor: 'var(--regulated)',
  },
  pyramid: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0px',
  },
  card: {
    background: 'var(--navy-3)',
    border: '1px solid var(--border)',
    borderRadius: '4px',
    padding: '32px',
  },
  formGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    fontSize: '10px',
    fontWeight: '600',
    letterSpacing: '2px',
    textTransform: 'uppercase',
    color: 'var(--text-light)',
    marginBottom: '8px',
  },
  input: {
    width: '100%',
    background: 'var(--navy-2)',
    border: '1px solid var(--border)',
    borderRadius: '3px',
    padding: '10px 14px',
    color: 'var(--text-dark)',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
  },
  formFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '8px',
  },
  cancelBtn: {
    background: 'none',
    border: '1px solid var(--border)',
    borderRadius: '3px',
    padding: '10px 20px',
    color: 'var(--text-light)',
    fontSize: '11px',
    cursor: 'pointer',
  },
};

export default CBM;