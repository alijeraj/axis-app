import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = 'https://axis-backend-production-5e9b.up.railway.app';

const BURDEN_COLORS = {
  Fear:  { bg: 'rgba(101,67,33,0.35)', border: 'rgba(139,90,43,0.6)', text: '#C8A87A' },
  Guilt: { bg: 'rgba(180,150,0,0.25)', border: 'rgba(210,180,0,0.5)', text: '#D4C060' },
  Shame: { bg: 'rgba(180,80,0,0.28)',  border: 'rgba(210,100,0,0.5)', text: '#E8955A' },
  Anger: { bg: 'rgba(176,40,40,0.28)', border: 'rgba(200,60,60,0.5)', text: '#E08080' },
  Envy:  { bg: 'rgba(100,40,160,0.28)',border: 'rgba(130,60,190,0.5)',text: '#B07ED4' },
  Grief: { bg: 'rgba(180,100,120,0.25)',border: 'rgba(200,130,145,0.5)',text: '#D4A0B0' },
};

const EMOTION_ORDER = ['Fear','Guilt','Shame','Anger','Envy','Grief'];

function CPM() {
  const navigate = useNavigate();
  const token = localStorage.getItem('axis_token');
  const [complexes, setComplexes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBuilder, setShowBuilder] = useState(false);
  const [editIdx, setEditIdx] = useState(null);
  const [form, setForm] = useState({
    name: '', burden: '', beliefs: '', thoughts: '',
    feelings: '', behaviors: '', trigger: '',
    counter: '', counterBehavior: '', notes: '',
    status: 'active', originalWound: false
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadComplexes();
  }, []);

  const loadComplexes = async () => {
    try {
      const res = await axios.get(`${API}/api/complexes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setComplexes(res.data || []);
    } catch (err) {
      console.log('Error loading complexes:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveComplex = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      if (editIdx !== null) {
        const updated = [...complexes];
        updated[editIdx] = form;
        await axios.post(`${API}/api/complexes`, { data: updated }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setComplexes(updated);
      } else {
        const updated = [...complexes, { ...form }];
        await axios.post(`${API}/api/complexes`, { data: updated }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setComplexes(updated);
      }
      closeBuilder();
    } catch (err) {
      console.log('Error saving:', err);
    } finally {
      setSaving(false);
    }
  };

  const deleteComplex = async (idx) => {
    const name = complexes[idx]?.name || 'this complex';
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    const updated = complexes.filter((_, i) => i !== idx);
    await axios.post(`${API}/api/complexes`, { data: updated }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setComplexes(updated);
  };

  const openBuilder = (idx = null) => {
    if (idx !== null) {
      setForm({ ...complexes[idx] });
      setEditIdx(idx);
    } else {
      setForm({
        name: '', burden: '', beliefs: '', thoughts: '',
        feelings: '', behaviors: '', trigger: '',
        counter: '', counterBehavior: '', notes: '',
        status: 'active', originalWound: false
      });
      setEditIdx(null);
    }
    setShowBuilder(true);
  };

  const closeBuilder = () => {
    setShowBuilder(false);
    setEditIdx(null);
  };

  // Group by burden
  const groups = {};
  EMOTION_ORDER.forEach(e => { groups[e] = []; });
  complexes.forEach((c, i) => {
    const key = c.burden && groups[c.burden] !== undefined ? c.burden : null;
    if (key) groups[key].push({ ...c, _idx: i });
  });

  if (loading) return <div style={{ color: 'var(--text-light)', padding: '48px', textAlign: 'center' }}>Loading...</div>;

  if (showBuilder) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <button style={styles.backBtn} onClick={closeBuilder}>← Cancel</button>
          <div style={styles.title}>{editIdx !== null ? 'Edit Complex' : 'Build Complex'}</div>
        </div>
        <div style={styles.card}>
          {[
            { key: 'name', label: 'Name', type: 'input', placeholder: 'Give this complex a name...' },
            { key: 'beliefs', label: 'Beliefs', type: 'textarea', placeholder: 'What do you believe when this complex is active?' },
            { key: 'thoughts', label: 'Thoughts', type: 'textarea', placeholder: 'What thoughts arise?' },
            { key: 'feelings', label: 'Feelings', type: 'textarea', placeholder: 'What do you feel as these thoughts arise?' },
            { key: 'behaviors', label: 'Behaviors', type: 'textarea', placeholder: 'How do you act when this complex is triggered?' },
            { key: 'trigger', label: 'Trigger', type: 'input', placeholder: 'What activates this complex?' },
            { key: 'counter', label: 'Counter Belief', type: 'textarea', placeholder: 'What else could also be true?' },
            { key: 'counterBehavior', label: 'Counter Behavior', type: 'textarea', placeholder: 'How do you act differently from the counter belief?' },
            { key: 'notes', label: 'Notes', type: 'textarea', placeholder: 'Any additional observations...' },
          ].map(field => (
            <div key={field.key} style={styles.formGroup}>
              <label style={styles.label}>{field.label}</label>
              {field.type === 'input' ? (
                <input
                  style={styles.input}
                  value={form[field.key]}
                  onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                  placeholder={field.placeholder}
                />
              ) : (
                <textarea
                  style={styles.textarea}
                  value={form[field.key]}
                  onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                  placeholder={field.placeholder}
                  rows={3}
                />
              )}
            </div>
          ))}

          <div style={styles.formGroup}>
            <label style={styles.label}>Emotional Burden</label>
            <select
              style={styles.input}
              value={form.burden}
              onChange={e => setForm({ ...form, burden: e.target.value })}
            >
              <option value="">-- Select burden --</option>
              {EMOTION_ORDER.map(e => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>

          <div
            style={{ ...styles.woundToggle, ...(form.originalWound ? styles.woundActive : {}) }}
            onClick={() => setForm({ ...form, originalWound: !form.originalWound })}
          >
            <div style={{ ...styles.woundDot, ...(form.originalWound ? styles.woundDotActive : {}) }} />
            <div>
              <div style={styles.woundLabel}>Original Wound</div>
              <div style={styles.woundDesc}>Mark this complex as the origin — where the pattern first formed.</div>
            </div>
          </div>

          <div style={styles.formFooter}>
            <button style={styles.cancelBtn} onClick={closeBuilder}>Cancel</button>
            <button style={styles.btn} onClick={saveComplex} disabled={saving}>
              {saving ? 'Saving...' : 'Save to Map'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate('/')}>← Home</button>
        <div style={styles.title}>Complex Map</div>
        <button style={styles.btn} onClick={() => openBuilder()}>+ Build Complex</button>
      </div>

      {complexes.length === 0 ? (
        <div style={styles.empty}>No complexes yet. Build your first complex to begin mapping.</div>
      ) : (
        EMOTION_ORDER.map(emotion => {
          const group = groups[emotion];
          if (group.length === 0) return null;
          const col = BURDEN_COLORS[emotion];
          return (
            <div key={emotion} style={styles.section}>
              <div style={styles.sectionHeader}>
                <div style={{ ...styles.dot, background: col.text }} />
                <span style={{ ...styles.sectionLabel, color: col.text }}>{emotion}</span>
                <div style={{ flex: 1, height: '1px', background: col.border, opacity: 0.4 }} />
                <span style={styles.count}>{group.length} complex{group.length > 1 ? 'es' : ''}</span>
              </div>
              <div style={styles.grid}>
                {group.map(c => (
                  <div
                    key={c._idx}
                    style={{
                      ...styles.complexCard,
                      borderLeftColor: col.border,
                      background: col.bg,
                      ...(c.originalWound ? { borderStyle: 'dashed', borderLeftStyle: 'solid' } : {})
                    }}
                  >
                    <div style={styles.cardHeader}>
                      <div style={styles.cardName}>
                        {c.name}
                        {c.originalWound && <span style={styles.woundSymbol}> ◉</span>}
                      </div>
                      <span style={{ ...styles.statusBadge, ...(c.status === 'resolved' ? styles.resolvedBadge : styles.activeBadge) }}>
                        {c.status || 'active'}
                      </span>
                    </div>
                    <div style={{ ...styles.cardBurden, color: col.text }}>{c.burden}</div>
                    <div style={styles.cardFooter}>
                      <button style={styles.smallBtn} onClick={() => openBuilder(c._idx)}>Edit</button>
                      <button
                        style={{ ...styles.smallBtn, color: 'var(--burdened)', borderColor: 'rgba(176,90,90,0.3)', marginLeft: 'auto' }}
                        onClick={() => deleteComplex(c._idx)}
                      >Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: 'var(--navy-1)',
    padding: '32px 24px',
    maxWidth: '1000px',
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
  empty: {
    textAlign: 'center',
    padding: '80px 24px',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    color: 'var(--text-light)',
  },
  section: {
    marginBottom: '40px',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '16px',
  },
  dot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  sectionLabel: {
    fontSize: '10px',
    fontWeight: '600',
    letterSpacing: '3px',
    textTransform: 'uppercase',
  },
  count: {
    fontSize: '10px',
    color: 'var(--text-light)',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
  },
  complexCard: {
    border: '1px solid rgba(107,163,200,0.1)',
    borderLeft: '3px solid',
    borderRadius: '3px',
    padding: '14px 16px',
    cursor: 'pointer',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: '6px',
  },
  cardName: {
    fontFamily: 'Georgia, serif',
    fontSize: '15px',
    fontWeight: '300',
    color: 'var(--text-dark)',
  },
  woundSymbol: {
    color: '#C8A840',
    fontSize: '14px',
  },
  statusBadge: {
    fontSize: '8px',
    fontWeight: '600',
    letterSpacing: '2px',
    textTransform: 'uppercase',
    padding: '3px 8px',
    borderRadius: '2px',
    flexShrink: 0,
    marginLeft: '8px',
  },
  activeBadge: {
    color: 'var(--burdened)',
    background: 'rgba(176,90,90,0.12)',
    border: '1px solid rgba(176,90,90,0.3)',
  },
  resolvedBadge: {
    color: 'var(--regulated)',
    background: 'rgba(74,174,136,0.12)',
    border: '1px solid rgba(74,174,136,0.3)',
  },
  cardBurden: {
    fontSize: '9px',
    fontWeight: '600',
    letterSpacing: '2px',
    textTransform: 'uppercase',
    marginBottom: '8px',
  },
  cardFooter: {
    display: 'flex',
    gap: '6px',
    marginTop: '10px',
    paddingTop: '10px',
    borderTop: '1px solid rgba(107,163,200,0.08)',
  },
  smallBtn: {
    background: 'none',
    border: '1px solid var(--border)',
    borderRadius: '2px',
    padding: '4px 10px',
    color: 'var(--text-light)',
    fontSize: '10px',
    cursor: 'pointer',
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
  textarea: {
    width: '100%',
    background: 'var(--navy-2)',
    border: '1px solid var(--border)',
    borderRadius: '3px',
    padding: '10px 14px',
    color: 'var(--text-dark)',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
    resize: 'vertical',
    fontFamily: 'inherit',
  },
  woundToggle: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    border: '1px solid rgba(200,168,80,0.2)',
    borderRadius: '3px',
    background: 'rgba(200,168,80,0.03)',
    cursor: 'pointer',
    marginBottom: '24px',
  },
  woundActive: {
    borderColor: 'rgba(200,168,80,0.5)',
    background: 'rgba(200,168,80,0.07)',
  },
  woundDot: {
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    border: '2px solid rgba(200,168,80,0.4)',
    flexShrink: 0,
  },
  woundDotActive: {
    background: 'rgba(200,168,80,0.8)',
    borderColor: 'rgba(200,168,80,0.9)',
  },
  woundLabel: {
    fontSize: '9px',
    fontWeight: '700',
    letterSpacing: '2px',
    textTransform: 'uppercase',
    color: 'rgba(200,168,80,0.7)',
  },
  woundDesc: {
    fontSize: '11px',
    color: 'var(--text-light)',
    marginTop: '2px',
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

export default CPM;