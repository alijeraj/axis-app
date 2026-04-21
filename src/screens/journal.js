import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = 'https://axis-backend-production-5e9b.up.railway.app';

const TONES = ['Peaceful','Anxious','Joyful','Fearful','Melancholic','Intense','Confusing','Vivid','Dark','Healing'];

function Journal() {
  const navigate = useNavigate();
  const token = localStorage.getItem('axis_token');
  const [tab, setTab] = useState('dreams');
  const [dreams, setDreams] = useState([]);
  const [freeEntries, setFreeEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDreamForm, setShowDreamForm] = useState(false);
  const [showFreeForm, setShowFreeForm] = useState(false);
  const [editDreamIdx, setEditDreamIdx] = useState(null);
  const [editFreeIdx, setEditFreeIdx] = useState(null);
  const [dreamForm, setDreamForm] = useState({ title: '', tone: '', narrative: '', people: '', symbols: '', reflection: '', date: new Date().toLocaleDateString('en-CA') });
  const [freeForm, setFreeForm] = useState({ text: '', date: new Date().toLocaleDateString('en-CA') });
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadData(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadData = async () => {
    try {
      const [dreamsRes, journalRes] = await Promise.all([
        axios.get(`${API}/api/dreams`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/api/journal`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      setDreams(dreamsRes.data || []);
      setFreeEntries(journalRes.data || []);
    } catch (err) {
      console.log('Error loading journal:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveDreams = async (updated) => {
    await axios.post(`${API}/api/dreams`, { data: updated }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setDreams(updated);
  };

  const saveFree = async (updated) => {
    await axios.post(`${API}/api/journal`, { data: updated }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setFreeEntries(updated);
  };

  const openDreamForm = (idx = null) => {
    if (idx !== null) {
      setDreamForm({ ...dreams[idx] });
      setEditDreamIdx(idx);
    } else {
      setDreamForm({ title: '', tone: '', narrative: '', people: '', symbols: '', reflection: '', date: new Date().toLocaleDateString('en-CA') });
      setEditDreamIdx(null);
    }
    setShowDreamForm(true);
  };

  const saveDream = async () => {
    if (!dreamForm.title.trim()) return;
    setSaving(true);
    try {
      let updated;
      if (editDreamIdx !== null) {
        updated = [...dreams];
        updated[editDreamIdx] = dreamForm;
      } else {
        updated = [...dreams, dreamForm];
      }
      await saveDreams(updated);
      setShowDreamForm(false);
    } finally {
      setSaving(false);
    }
  };

  const deleteDream = async (idx) => {
    if (!window.confirm('Delete this dream? This cannot be undone.')) return;
    const updated = dreams.filter((_, i) => i !== idx);
    await saveDreams(updated);
  };

  const openFreeForm = (idx = null) => {
    if (idx !== null) {
      setFreeForm({ ...freeEntries[idx] });
      setEditFreeIdx(idx);
    } else {
      setFreeForm({ text: '', date: new Date().toLocaleDateString('en-CA') });
      setEditFreeIdx(null);
    }
    setShowFreeForm(true);
  };

  const saveFreeEntry = async () => {
    if (!freeForm.text.trim()) return;
    setSaving(true);
    try {
      let updated;
      if (editFreeIdx !== null) {
        updated = [...freeEntries];
        updated[editFreeIdx] = freeForm;
      } else {
        updated = [...freeEntries, freeForm];
      }
      await saveFree(updated);
      setShowFreeForm(false);
    } finally {
      setSaving(false);
    }
  };

  const deleteFree = async (idx) => {
    if (!window.confirm('Delete this entry? This cannot be undone.')) return;
    const updated = freeEntries.filter((_, i) => i !== idx);
    await saveFree(updated);
  };

  if (loading) return <div style={{ color: 'var(--text-light)', padding: '48px', textAlign: 'center' }}>Loading...</div>;

  if (showDreamForm) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <button style={styles.backBtn} onClick={() => setShowDreamForm(false)}>← Cancel</button>
          <div style={styles.title}>{editDreamIdx !== null ? 'Edit Dream' : 'New Dream'}</div>
        </div>
        <div style={styles.card}>
          {[
            { key: 'title', label: 'Title', type: 'input', placeholder: 'Give this dream a name...' },
            { key: 'narrative', label: 'Narrative', type: 'textarea', placeholder: 'What happened in the dream?' },
            { key: 'people', label: 'People', type: 'textarea', placeholder: 'Who appeared?' },
            { key: 'symbols', label: 'Symbols', type: 'textarea', placeholder: 'What symbols or images stood out?' },
            { key: 'reflection', label: 'Reflection', type: 'textarea', placeholder: 'What does this dream mean to you?' },
          ].map(field => (
            <div key={field.key} style={styles.formGroup}>
              <label style={styles.label}>{field.label}</label>
              {field.type === 'input' ? (
                <input style={styles.input} value={dreamForm[field.key]} onChange={e => setDreamForm({ ...dreamForm, [field.key]: e.target.value })} placeholder={field.placeholder} />
              ) : (
                <textarea style={styles.textarea} value={dreamForm[field.key]} onChange={e => setDreamForm({ ...dreamForm, [field.key]: e.target.value })} placeholder={field.placeholder} rows={3} />
              )}
            </div>
          ))}
          <div style={styles.formGroup}>
            <label style={styles.label}>Tone</label>
            <select style={styles.input} value={dreamForm.tone} onChange={e => setDreamForm({ ...dreamForm, tone: e.target.value })}>
              <option value="">-- Select tone --</option>
              {TONES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div style={styles.formFooter}>
            <button style={styles.cancelBtn} onClick={() => setShowDreamForm(false)}>Cancel</button>
            <button style={styles.btn} onClick={saveDream} disabled={saving}>{saving ? 'Saving...' : 'Save Dream'}</button>
          </div>
        </div>
      </div>
    );
  }

  if (showFreeForm) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <button style={styles.backBtn} onClick={() => setShowFreeForm(false)}>← Cancel</button>
          <div style={styles.title}>{editFreeIdx !== null ? 'Edit Entry' : 'New Entry'}</div>
        </div>
        <div style={styles.card}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Entry</label>
            <textarea style={{ ...styles.textarea, minHeight: '200px' }} value={freeForm.text} onChange={e => setFreeForm({ ...freeForm, text: e.target.value })} placeholder="Write freely..." rows={10} />
          </div>
          <div style={styles.formFooter}>
            <button style={styles.cancelBtn} onClick={() => setShowFreeForm(false)}>Cancel</button>
            <button style={styles.btn} onClick={saveFreeEntry} disabled={saving}>{saving ? 'Saving...' : 'Save Entry'}</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate('/')}>← Home</button>
        <div style={styles.title}>Journal</div>
        <button style={styles.btn} onClick={() => tab === 'dreams' ? openDreamForm() : openFreeForm()}>
          + {tab === 'dreams' ? 'New Dream' : 'New Entry'}
        </button>
      </div>

      <div style={styles.tabs}>
        <button style={{ ...styles.tab, ...(tab === 'dreams' ? styles.tabActive : {}) }} onClick={() => setTab('dreams')}>Dream Journal</button>
        <button style={{ ...styles.tab, ...(tab === 'free' ? styles.tabActive : {}) }} onClick={() => setTab('free')}>Free Journal</button>
      </div>

      {tab === 'dreams' && (
        dreams.length === 0 ? (
          <div style={styles.empty}>No dreams recorded yet. Capture your first dream.</div>
        ) : (
          <div style={styles.list}>
            {dreams.slice().reverse().map((d, i) => {
              const realIdx = dreams.length - 1 - i;
              return (
                <div key={realIdx} style={styles.entryCard}>
                  <div style={styles.entryHeader}>
                    <div style={styles.entryTitle}>{d.title}</div>
                    <div style={styles.entryDate}>{d.date}</div>
                  </div>
                  {d.tone && <div style={styles.entryTone}>{d.tone}</div>}
                  {d.narrative && <div style={styles.entryPreview}>{d.narrative.slice(0, 100)}{d.narrative.length > 100 ? '...' : ''}</div>}
                  <div style={styles.entryFooter}>
                    <button style={styles.smallBtn} onClick={() => openDreamForm(realIdx)}>Edit</button>
                    <button style={{ ...styles.smallBtn, color: 'var(--burdened)', borderColor: 'rgba(176,90,90,0.3)', marginLeft: 'auto' }} onClick={() => deleteDream(realIdx)}>Delete</button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {tab === 'free' && (
        freeEntries.length === 0 ? (
          <div style={styles.empty}>No entries yet. Write freely.</div>
        ) : (
          <div style={styles.list}>
            {freeEntries.slice().reverse().map((e, i) => {
              const realIdx = freeEntries.length - 1 - i;
              return (
                <div key={realIdx} style={styles.entryCard}>
                  <div style={styles.entryHeader}>
                    <div style={styles.entryDate}>{e.date}</div>
                  </div>
                  <div style={styles.entryPreview}>{e.text.slice(0, 150)}{e.text.length > 150 ? '...' : ''}</div>
                  <div style={styles.entryFooter}>
                    <button style={styles.smallBtn} onClick={() => openFreeForm(realIdx)}>Edit</button>
                    <button style={{ ...styles.smallBtn, color: 'var(--burdened)', borderColor: 'rgba(176,90,90,0.3)', marginLeft: 'auto' }} onClick={() => deleteFree(realIdx)}>Delete</button>
                  </div>
                </div>
              );
            })}
          </div>
        )
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
  empty: {
    textAlign: 'center',
    padding: '80px 24px',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    color: 'var(--text-light)',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  entryCard: {
    background: 'var(--navy-3)',
    border: '1px solid var(--border)',
    borderRadius: '4px',
    padding: '16px 20px',
  },
  entryHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '8px',
  },
  entryTitle: {
    fontFamily: 'Georgia, serif',
    fontSize: '16px',
    fontWeight: '300',
    color: 'var(--text-dark)',
  },
  entryDate: {
    fontSize: '11px',
    color: 'var(--text-light)',
  },
  entryTone: {
    fontSize: '9px',
    fontWeight: '600',
    letterSpacing: '2px',
    textTransform: 'uppercase',
    color: 'var(--steel-blue)',
    marginBottom: '8px',
  },
  entryPreview: {
    fontSize: '13px',
    color: 'var(--text-light)',
    lineHeight: 1.6,
    marginBottom: '12px',
  },
  entryFooter: {
    display: 'flex',
    gap: '8px',
    paddingTop: '12px',
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

export default Journal;