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
  const [complexes, setComplexes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dream form
  const [showDreamForm, setShowDreamForm] = useState(false);
  const [editDreamIdx, setEditDreamIdx] = useState(null);
  const [dreamForm, setDreamForm] = useState({ title: '', tone: '', narrative: '', people: '', symbols: '', reflection: '', complexLink: '', date: new Date().toISOString() });

  // Dream view modal
  const [viewDreamIdx, setViewDreamIdx] = useState(null);

  // Free journal
  const [showFreeForm, setShowFreeForm] = useState(false);
  const [editFreeIdx, setEditFreeIdx] = useState(null);
  const [freeForm, setFreeForm] = useState({ text: '', date: new Date().toISOString() });

  const [saving, setSaving] = useState(false);

  useEffect(() => { loadData(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadData = async () => {
    try {
      const [dreamsRes, journalRes, complexRes] = await Promise.all([
        axios.get(`${API}/api/dreams`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/api/journal`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/api/complexes`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      setDreams(dreamsRes.data || []);
      setFreeEntries(journalRes.data || []);
      setComplexes(complexRes.data || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const saveDreams = async (updated) => {
    await axios.post(`${API}/api/dreams`, { data: updated }, { headers: { Authorization: `Bearer ${token}` } });
    setDreams(updated);
  };

  const saveFree = async (updated) => {
    await axios.post(`${API}/api/journal`, { data: updated }, { headers: { Authorization: `Bearer ${token}` } });
    setFreeEntries(updated);
  };

  const openDreamForm = (idx = null) => {
    if (idx !== null) {
      setDreamForm({ ...dreams[idx] });
      setEditDreamIdx(idx);
    } else {
      setDreamForm({ title: '', tone: '', narrative: '', people: '', symbols: '', reflection: '', complexLink: '', date: new Date().toISOString() });
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
    const name = dreams[idx]?.title || 'this dream';
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    const updated = dreams.filter((_, i) => i !== idx);
    await saveDreams(updated);
    if (viewDreamIdx === idx) setViewDreamIdx(null);
  };

  const openFreeForm = (idx = null) => {
    if (idx !== null) {
      setFreeForm({ ...freeEntries[idx] });
      setEditFreeIdx(idx);
    } else {
      setFreeForm({ text: '', date: new Date().toISOString() });
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

  if (loading) return <div style={{ color: '#5A7A94', padding: '48px', textAlign: 'center' }}>Loading...</div>;

  // Dream form screen
  if (showDreamForm) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <button style={styles.backBtn} onClick={() => setShowDreamForm(false)}>← Cancel</button>
          <span style={styles.screenTitle}>{editDreamIdx !== null ? 'Edit Dream' : 'Record Dream'}</span>
        </div>
        <div style={styles.body}>
          <div style={styles.card}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Title</label>
              <input style={styles.input} value={dreamForm.title} onChange={e => setDreamForm({ ...dreamForm, title: e.target.value })} placeholder="Give this dream a name..." autoFocus />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Tone</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {TONES.map(t => (
                  <button
                    key={t}
                    style={{ fontSize: '10px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', padding: '6px 14px', border: `1px solid ${dreamForm.tone === t ? '#6BA3C8' : 'rgba(107,163,200,0.2)'}`, background: dreamForm.tone === t ? 'rgba(107,163,200,0.1)' : 'none', color: dreamForm.tone === t ? '#6BA3C8' : '#5A7A94', cursor: 'pointer', borderRadius: '2px' }}
                    onClick={() => setDreamForm({ ...dreamForm, tone: dreamForm.tone === t ? '' : t })}
                  >{t}</button>
                ))}
              </div>
            </div>
            {[
              { key: 'narrative', label: 'Narrative', placeholder: 'What happened in the dream?' },
              { key: 'people', label: 'Who Appeared', placeholder: 'Who appeared?' },
              { key: 'symbols', label: 'Symbols & Recurring Themes', placeholder: 'What symbols or images stood out?' },
              { key: 'reflection', label: 'Reflection', placeholder: 'What does this dream mean to you?' },
            ].map(field => (
              <div key={field.key} style={styles.formGroup}>
                <label style={styles.label}>{field.label}</label>
                <textarea style={styles.textarea} value={dreamForm[field.key] || ''} onChange={e => setDreamForm({ ...dreamForm, [field.key]: e.target.value })} placeholder={field.placeholder} rows={3} />
              </div>
            ))}
            <div style={styles.formGroup}>
              <label style={styles.label}>Link to Complex <span style={{ color: '#5A7A94', fontWeight: 400 }}>— optional</span></label>
              <select style={styles.input} value={dreamForm.complexLink || ''} onChange={e => setDreamForm({ ...dreamForm, complexLink: e.target.value })}>
                <option value="">-- No link --</option>
                {complexes.map((c, i) => <option key={i} value={c.name}>{c.name}</option>)}
              </select>
            </div>
            <div style={styles.formFooter}>
              <button style={styles.cancelBtn} onClick={() => setShowDreamForm(false)}>Cancel</button>
              <button style={styles.btn} onClick={saveDream} disabled={saving}>{saving ? 'Saving...' : 'Save Dream'}</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Free entry form screen
  if (showFreeForm) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <button style={styles.backBtn} onClick={() => setShowFreeForm(false)}>← Cancel</button>
          <span style={styles.screenTitle}>{editFreeIdx !== null ? 'Edit Entry' : 'New Entry'}</span>
        </div>
        <div style={styles.body}>
          <div style={{ fontSize: '10px', fontWeight: '600', letterSpacing: '3px', textTransform: 'uppercase', color: '#5A7A94', marginBottom: '12px' }}>
            {new Date(freeForm.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
          <textarea
            style={{ ...styles.textarea, minHeight: '400px', fontFamily: 'Georgia, serif', fontSize: '15px', lineHeight: 1.8, padding: '24px' }}
            value={freeForm.text}
            onChange={e => setFreeForm({ ...freeForm, text: e.target.value })}
            placeholder="Write freely. This space is yours."
            autoFocus
          />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px' }}>
            <span style={{ fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: '#5A7A94' }}></span>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button style={styles.cancelBtn} onClick={() => setShowFreeForm(false)}>Cancel</button>
              <button style={styles.btn} onClick={saveFreeEntry} disabled={saving}>{saving ? 'Saving...' : 'Save Entry'}</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Dream view modal
  const viewDream = viewDreamIdx !== null ? dreams[viewDreamIdx] : null;

  return (
    <div style={styles.container}>

      {/* Dream view modal */}
      {viewDream && (
        <div style={styles.modalOverlay}>
          <div style={{ ...styles.modal, maxWidth: '560px' }}>
            <div style={styles.modalHeader}>
              <div style={{ fontFamily: 'Georgia, serif', fontSize: '24px', fontWeight: '300', color: '#D8E6F0' }}>{viewDream.title || 'Untitled Dream'}</div>
              <button style={styles.modalClose} onClick={() => setViewDreamIdx(null)}>✕</button>
            </div>
            <div style={styles.modalBody}>
              {viewDream.date && <div style={{ fontSize: '10px', fontWeight: '600', letterSpacing: '3px', textTransform: 'uppercase', color: '#5A7A94', marginBottom: '20px' }}>{new Date(viewDream.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</div>}
              {viewDream.tone && <div style={{ display: 'inline-block', fontSize: '9px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', padding: '4px 12px', borderRadius: '10px', background: 'rgba(176,144,216,0.15)', border: '1px solid rgba(176,144,216,0.3)', color: '#B088D4', marginBottom: '24px' }}>{viewDream.tone}</div>}
              {[
                { key: 'narrative', label: 'Narrative' },
                { key: 'people', label: 'Who Appeared' },
                { key: 'symbols', label: 'Symbols & Recurring Themes' },
                { key: 'reflection', label: 'Reflection', color: '#6BA3C8' },
              ].map(field => viewDream[field.key] && viewDream[field.key].trim() ? (
                <div key={field.key} style={{ marginBottom: '20px' }}>
                  <div style={{ fontSize: '9px', fontWeight: '600', letterSpacing: '3px', textTransform: 'uppercase', color: '#5A7A94', marginBottom: '8px' }}>{field.label}</div>
                  <div style={{ fontSize: '14px', color: field.color || '#D8E6F0', lineHeight: 1.7, whiteSpace: 'pre-line' }}>{viewDream[field.key]}</div>
                </div>
              ) : null)}
              {viewDream.complexLink && (
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ fontSize: '9px', fontWeight: '600', letterSpacing: '3px', textTransform: 'uppercase', color: '#5A7A94', marginBottom: '8px' }}>Linked Complex</div>
                  <div style={{ border: '1px solid rgba(74,174,136,0.25)', borderRadius: '3px', padding: '12px 16px', background: 'rgba(74,174,136,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ fontSize: '14px', color: '#4AAE88', fontFamily: 'Georgia, serif' }}>{viewDream.complexLink}</div>
                  </div>
                </div>
              )}
            </div>
            <div style={styles.modalFooter}>
              <button style={{ ...styles.cancelBtn, color: '#B05A5A', borderColor: 'rgba(176,90,90,0.3)' }} onClick={() => { deleteDream(viewDreamIdx); setViewDreamIdx(null); }}>Delete</button>
              <button style={styles.btn} onClick={() => { setViewDreamIdx(null); openDreamForm(viewDreamIdx); }}>Edit</button>
            </div>
          </div>
        </div>
      )}

      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate('/')}>← Home</button>
        <span style={styles.screenTitle}>Journal</span>
        <button style={styles.btn} onClick={() => tab === 'dreams' ? openDreamForm() : openFreeForm()}>
          {tab === 'dreams' ? '+ Record Dream' : '+ New Entry'}
        </button>
      </div>

      <div style={styles.body}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid rgba(107,163,200,0.15)', marginBottom: '32px' }}>
          <button style={{ ...styles.tabBtn, ...(tab === 'dreams' ? styles.tabBtnActive : {}) }} onClick={() => setTab('dreams')}>Dream Journal</button>
          <button style={{ ...styles.tabBtn, ...(tab === 'free' ? styles.tabBtnActive : {}) }} onClick={() => setTab('free')}>Free Journal</button>
        </div>

        {/* Dream Journal */}
        {tab === 'dreams' && (
          dreams.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 40px', color: '#5A7A94' }}>
              <div style={{ fontSize: '13px', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '12px' }}>No dreams recorded yet</div>
              <div style={{ fontSize: '13px', color: '#5A7A94', lineHeight: 1.6, fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>Click "+ Record Dream" to begin.<br />Your dreams hold language worth listening to.</div>
            </div>
          ) : (
            <div style={styles.dreamGrid}>
              {dreams.slice().reverse().map((d, i) => {
                const realIdx = dreams.length - 1 - i;
                const dateStr = d.date ? new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';
                return (
                  <div
                    key={realIdx}
                    style={styles.dreamCard}
                    onClick={(e) => { if (!e.target.closest('button')) setViewDreamIdx(realIdx); }}
                  >
                    <div style={{ fontFamily: 'Georgia, serif', fontSize: '16px', fontWeight: '300', color: '#D8E6F0', lineHeight: 1.4, marginBottom: '8px' }}>{d.title || 'Untitled Dream'}</div>
                    {d.tone && <div style={{ display: 'inline-block', fontSize: '9px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', padding: '3px 10px', borderRadius: '10px', background: 'rgba(176,144,216,0.12)', border: '1px solid rgba(176,144,216,0.25)', color: '#B088D4', marginBottom: '10px' }}>{d.tone}</div>}
                    {d.narrative && <div style={{ fontSize: '13px', color: '#5A7A94', lineHeight: 1.6, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{d.narrative}</div>}
                    <div style={{ fontSize: '10px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', color: '#5A7A94', opacity: 0.6, marginTop: '10px' }}>{dateStr}</div>
                    <div style={styles.cardFooter}>
                      <button style={styles.smallBtn} onClick={e => { e.stopPropagation(); openDreamForm(realIdx); }}>Edit</button>
                      <button style={{ ...styles.smallBtn, color: '#B05A5A', borderColor: 'rgba(176,90,90,0.3)', marginLeft: 'auto' }} onClick={e => { e.stopPropagation(); deleteDream(realIdx); }}>Delete</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}

        {/* Free Journal */}
        {tab === 'free' && (
          freeEntries.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 40px' }}>
              <div style={{ fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', color: '#5A7A94', marginBottom: '12px' }}>No entries yet</div>
              <div style={{ fontSize: '13px', color: '#5A7A94', lineHeight: 1.7, fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>This space is yours. Write freely.</div>
            </div>
          ) : (
            <div>
              {freeEntries.slice().reverse().map((e, i) => {
                const realIdx = freeEntries.length - 1 - i;
                const dateObj = new Date(e.date);
                const dateStr = dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
                const timeStr = dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
                const preview = e.text ? e.text.trim().substring(0, 120).replace(/\n/g, ' ') + (e.text.length > 120 ? '...' : '') : '';
                return (
                  <div
                    key={realIdx}
                    style={styles.freeCard}
                    onClick={() => openFreeForm(realIdx)}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <div>
                        <div style={{ fontSize: '10px', fontWeight: '600', letterSpacing: '3px', textTransform: 'uppercase', color: '#5A7A94', marginBottom: '4px' }}>{dateStr}</div>
                        <div style={{ fontSize: '9px', letterSpacing: '1px', color: '#5A7A94', opacity: 0.6 }}>{timeStr}</div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }} onClick={ev => ev.stopPropagation()}>
                        <button style={styles.smallBtn} onClick={() => openFreeForm(realIdx)}>Edit</button>
                        <button style={{ ...styles.smallBtn, color: '#B05A5A', borderColor: 'rgba(176,90,90,0.3)' }} onClick={() => deleteFree(realIdx)}>Delete</button>
                      </div>
                    </div>
                    <div style={{ fontSize: '14px', color: '#8BAFC8', lineHeight: 1.7, fontFamily: 'Georgia, serif' }}>{preview}</div>
                  </div>
                );
              })}
            </div>
          )
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', background: '#0d1b2a', display: 'flex', flexDirection: 'column' },
  header: { display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 32px', borderBottom: '1px solid rgba(107,163,200,0.15)', background: '#0f2236' },
  backBtn: { background: 'none', border: 'none', color: '#5A7A94', fontSize: '12px', fontWeight: '600', letterSpacing: '1px', cursor: 'pointer', padding: 0 },
  screenTitle: { fontFamily: 'Georgia, serif', fontSize: '18px', fontWeight: '300', color: '#D8E6F0', letterSpacing: '2px', flex: 1 },
  body: { maxWidth: '900px', margin: '0 auto', padding: '40px 32px 80px', width: '100%' },
  tabBtn: { background: 'none', border: 'none', borderBottom: '2px solid transparent', padding: '12px 24px', color: '#5A7A94', fontSize: '10px', fontWeight: '600', letterSpacing: '3px', textTransform: 'uppercase', cursor: 'pointer', marginBottom: '-1px' },
  tabBtnActive: { color: '#6BA3C8', borderBottomColor: '#6BA3C8' },
  dreamGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' },
  dreamCard: { background: '#162534', border: '1px solid rgba(107,163,200,0.2)', borderRadius: '3px', padding: '20px', cursor: 'pointer', transition: 'border-color 0.2s' },
  freeCard: { background: '#162534', border: '1px solid rgba(107,163,200,0.2)', borderRadius: '3px', padding: '24px 28px', marginBottom: '12px', cursor: 'pointer', transition: 'border-color 0.2s' },
  cardFooter: { display: 'flex', gap: '6px', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(107,163,200,0.08)' },
  smallBtn: { background: 'none', border: '1px solid rgba(107,163,200,0.2)', borderRadius: '2px', padding: '4px 10px', color: '#5A7A94', fontSize: '10px', cursor: 'pointer' },
  btn: { background: 'rgba(107,163,200,0.15)', border: '1px solid rgba(107,163,200,0.4)', borderRadius: '3px', padding: '10px 20px', color: '#6BA3C8', fontSize: '11px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer', whiteSpace: 'nowrap' },
  cancelBtn: { background: 'none', border: '1px solid rgba(107,163,200,0.2)', borderRadius: '3px', padding: '10px 20px', color: '#5A7A94', fontSize: '11px', cursor: 'pointer' },
  card: { background: '#162534', border: '1px solid rgba(107,163,200,0.15)', borderRadius: '4px', padding: '32px' },
  formGroup: { marginBottom: '20px' },
  label: { display: 'block', fontSize: '10px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', color: '#5A7A94', marginBottom: '8px' },
  input: { width: '100%', background: '#0f2236', border: '1px solid rgba(107,163,200,0.2)', borderRadius: '3px', padding: '10px 14px', color: '#D8E6F0', fontSize: '14px', outline: 'none', boxSizing: 'border-box' },
  textarea: { width: '100%', background: '#0f2236', border: '1px solid rgba(107,163,200,0.2)', borderRadius: '3px', padding: '10px 14px', color: '#D8E6F0', fontSize: '14px', outline: 'none', boxSizing: 'border-box', resize: 'vertical', fontFamily: 'inherit' },
  formFooter: { display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' },
  modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 200, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', overflowY: 'auto', padding: '40px 20px' },
  modal: { background: '#162534', border: '1px solid rgba(107,163,200,0.3)', borderRadius: '4px', width: '100%', boxShadow: '0 0 40px rgba(0,0,0,0.6)', margin: 'auto' },
  modalHeader: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '28px 32px 20px', borderBottom: '1px solid rgba(107,163,200,0.15)' },
  modalClose: { background: 'none', border: 'none', color: '#5A7A94', cursor: 'pointer', fontSize: '18px' },
  modalBody: { padding: '24px 32px' },
  modalFooter: { display: 'flex', gap: '10px', padding: '16px 32px 24px', borderTop: '1px solid rgba(107,163,200,0.1)' },
};

export default Journal;