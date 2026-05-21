import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Page, AppHeader, PageBody } from '../components/Layout';

const API = 'https://axis-backend-production-5e9b.up.railway.app';

function ComplexViewModal({ complex, onClose }) {
  if (!complex) return null;
  const c = complex;
  const hasCounter = c.counter && c.counter.trim();
  const hasCounterBehavior = c.counterBehavior && c.counterBehavior.trim();
  const W = 220; const CW = 180; const GAP = 16;

  const Arrow = ({ up, color }) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '28px' }}>
      {up && <div style={{ borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderBottom: `7px solid ${color || 'rgba(142,196,224,0.35)'}` }} />}
      <div style={{ width: '2px', flex: 1, background: color || 'rgba(142,196,224,0.35)' }} />
      {!up && <div style={{ borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: `7px solid ${color || 'rgba(142,196,224,0.35)'}` }} />}
    </div>
  );

  const FlowNode = ({ label, text, isBurden, isTrigger, isCounter }) => (
    <div style={{ border: `1px solid ${isCounter ? 'rgba(74,174,136,0.3)' : isBurden ? 'rgba(176,90,90,0.35)' : isTrigger ? 'rgba(200,168,80,0.3)' : 'rgba(142,196,224,0.2)'}`, borderRadius: '3px', padding: '12px 14px', background: isCounter ? 'rgba(74,174,136,0.06)' : isBurden ? 'rgba(176,90,90,0.08)' : isTrigger ? 'rgba(200,168,80,0.06)' : 'rgba(142,196,224,0.04)', width: '100%', boxSizing: 'border-box' }}>
      <div style={{ fontSize: '8px', fontWeight: '700', letterSpacing: '3px', textTransform: 'uppercase', color: isCounter ? '#4AAE88' : isBurden ? '#C87878' : isTrigger ? '#C8A840' : '#8EC4E0', marginBottom: '6px' }}>{label}</div>
      <div style={{ fontSize: '13px', color: '#D8E6F0', fontFamily: 'Georgia, serif', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{text || ''}</div>
    </div>
  );

  const Row = ({ main, counter, connector }) => (
    <div style={{ display: 'flex', alignItems: 'stretch', width: W + GAP + CW }}>
      <div style={{ width: W, flexShrink: 0 }}>{main}</div>
      <div style={{ width: GAP, flexShrink: 0, display: 'flex', alignItems: 'center' }}>{connector}</div>
      <div style={{ width: CW, flexShrink: 0 }}>{counter}</div>
    </div>
  );

  const ArrowRow = ({ left, right }) => (
    <div style={{ display: 'flex', width: W + GAP + CW }}>
      <div style={{ width: W, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>{left}</div>
      <div style={{ width: GAP }} />
      <div style={{ width: CW, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>{right}</div>
    </div>
  );

  const Connector = ({ color }) => <div style={{ height: '2px', width: '100%', background: color || 'rgba(74,174,136,0.4)' }} />;
  const bVal = Array.isArray(c.behaviors) ? c.behaviors.join('\n') : (c.behaviors || '');

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 400, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', overflowY: 'auto', padding: '40px 20px' }}>
      <div style={{ background: '#162534', border: '1px solid rgba(142,196,224,0.3)', borderRadius: '4px', width: '100%', maxWidth: '560px', padding: '32px', boxShadow: '0 0 40px rgba(0,0,0,0.6)', margin: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div>
            <div style={{ fontFamily: 'Georgia, serif', fontSize: '22px', fontWeight: '300', color: '#D8E6F0' }}>{c.name}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
              <span style={{ fontSize: '8px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', padding: '3px 8px', borderRadius: '2px', color: c.status === 'resolved' ? '#4AAE88' : '#C87878', background: c.status === 'resolved' ? 'rgba(74,174,136,0.12)' : 'rgba(176,90,90,0.12)', border: c.status === 'resolved' ? '1px solid rgba(74,174,136,0.3)' : '1px solid rgba(176,90,90,0.3)' }}>{c.status || 'active'}</span>
              {c.originalWound && <span style={{ fontSize: '9px', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', color: '#C8A840', border: '1px dashed #C8A840', padding: '2px 7px', borderRadius: '2px' }}>Original Wound</span>}
            </div>
          </div>
          <button style={{ background: 'none', border: 'none', color: '#8BAFC8', cursor: 'pointer', fontSize: '18px' }} onClick={onClose}>✕</button>
        </div>
        <div style={{ overflowX: 'auto', paddingBottom: '8px', marginTop: '24px' }}>
          <Row main={<FlowNode label="Emotional Burden" text={c.burden || ''} isBurden />} counter={<div />} connector={<div />} />
          <ArrowRow left={<Arrow />} right={<div />} />
          <Row main={<FlowNode label="Beliefs" text={c.beliefs || ''} />} connector={hasCounter ? <Connector /> : <div />} counter={hasCounter ? <><FlowNode label="Counter Beliefs" text={c.counter} isCounter />{c.originalWound && <div style={{ fontSize: '9px', fontStyle: 'italic', color: 'rgba(200,168,80,0.6)', marginTop: '6px' }}>You are speaking to your inner child.</div>}</> : <div />} />
          <ArrowRow left={<Arrow />} right={<div />} />
          <Row main={<FlowNode label="Thoughts" text={c.thoughts || ''} />} connector={<div />} counter={<div />} />
          {c.feelings && c.feelings.trim() && <><ArrowRow left={<Arrow />} right={<div />} /><Row main={<FlowNode label="Feelings" text={c.feelings} />} connector={<div />} counter={<div />} /></>}
          <ArrowRow left={<Arrow />} right={hasCounterBehavior ? <Arrow color="rgba(74,174,136,0.4)" /> : <div />} />
          <Row main={<FlowNode label="Behaviors" text={bVal} />} connector={hasCounterBehavior ? <Connector /> : <div />} counter={hasCounterBehavior ? <><FlowNode label="Counter Behaviors" text={c.counterBehavior} isCounter />{c.originalWound && <div style={{ fontSize: '9px', fontStyle: 'italic', color: 'rgba(200,168,80,0.6)', marginTop: '6px' }}>You are speaking to your inner child.</div>}</> : <div />} />
          <ArrowRow left={<Arrow up />} right={<div />} />
          <Row main={<FlowNode label="Triggers" text={c.trigger || ''} isTrigger />} connector={<div />} counter={<div />} />
          {c.notes && c.notes.trim() && <div style={{ marginTop: '20px', opacity: 0.7, width: W + GAP + CW }}><FlowNode label="Notes" text={c.notes} /></div>}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid rgba(142,196,224,0.15)' }}>
          <button style={{ background: 'rgba(142,196,224,0.15)', border: '1px solid rgba(142,196,224,0.4)', borderRadius: '3px', padding: '10px 24px', color: '#8EC4E0', fontSize: '11px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer' }} onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

function Journal() {
  const navigate = useNavigate();
  const token = localStorage.getItem('axis_token');
  const [tab, setTab] = useState('dreams');
  const [dreams, setDreams] = useState([]);
  const [freeEntries, setFreeEntries] = useState([]);
  const [complexes, setComplexes] = useState([]);
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showDreamForm, setShowDreamForm] = useState(false);
  const [editDreamIdx, setEditDreamIdx] = useState(null);
  const [dreamForm, setDreamForm] = useState({ title: '', narrative: '', people: [], symbols: '', reflection: '', complexLink: '', date: new Date().toISOString() });

  const [viewDreamIdx, setViewDreamIdx] = useState(null);
  const [viewComplex, setViewComplex] = useState(null);
  const [filterType, setFilterType] = useState(null);
  const [filterValue, setFilterValue] = useState('');

  const [showFreeForm, setShowFreeForm] = useState(false);
  const [editFreeIdx, setEditFreeIdx] = useState(null);
  const [freeForm, setFreeForm] = useState({ text: '', date: new Date().toISOString() });

  const [saving, setSaving] = useState(false);

  useEffect(() => { loadData(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadData = async () => {
    try {
      const [dreamsRes, journalRes, complexRes, peopleRes] = await Promise.all([
        axios.get(`${API}/api/dreams`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/api/journal`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/api/complexes`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/api/people`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      setDreams(dreamsRes.data || []);
      setFreeEntries(journalRes.data || []);
      setComplexes(complexRes.data || []);
      setPeople(peopleRes.data || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const savePerson = async (name) => {
    if (!name || !name.trim()) return;
    const trimmed = name.trim();
    if (people.find(p => p.name === trimmed)) return;
    const updated = [...people, { name: trimmed }];
    await axios.post(`${API}/api/people`, { data: updated }, { headers: { Authorization: `Bearer ${token}` } });
    setPeople(updated);
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
      const dream = { ...dreams[idx] };
      if (typeof dream.people === 'string') {
        dream.people = [];
      }
      if (!Array.isArray(dream.people)) {
        dream.people = [];
      }
      setDreamForm(dream);
      setEditDreamIdx(idx);
    } else {
      setDreamForm({ title: '', narrative: '', people: [], symbols: '', reflection: '', complexLink: '', date: new Date().toISOString() });
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

  if (loading) return <div style={{ color: '#8BAFC8', padding: '48px', textAlign: 'center' }}>Loading...</div>;

  if (showDreamForm) {
    return (
      <Page>
        <AppHeader backLabel="← Cancel" onBack={() => setShowDreamForm(false)} title={editDreamIdx !== null ? 'Edit Dream' : 'Record Dream'} />
        <PageBody width="reading">
          <div style={styles.card}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Title</label>
              <input style={styles.input} value={dreamForm.title} onChange={e => setDreamForm({ ...dreamForm, title: e.target.value })} placeholder="Give this dream a name..." autoFocus />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Year <span style={{ color: '#8BAFC8', fontWeight: 400 }}>— optional</span></label>
              <select style={styles.input} value={dreamForm.year || ''} onChange={e => setDreamForm({ ...dreamForm, year: e.target.value })}>
                <option value="">-- Unknown --</option>
                {(() => {
                  const currentYear = new Date().getFullYear();
                  const years = [];
                  for (let y = currentYear; y >= 2015; y--) years.push(y);
                  return years.map(y => <option key={y} value={y}>{y}</option>);
                })()}
              </select>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Narrative</label>
              <textarea style={styles.textarea} value={dreamForm.narrative || ''} onChange={e => setDreamForm({ ...dreamForm, narrative: e.target.value })} placeholder="What happened in the dream?" rows={3} />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Who Appeared / Who is it about?</label>
              {(() => {
                const selected = Array.isArray(dreamForm.people) ? dreamForm.people : [];
                const available = people.filter(p => !selected.includes(p.name));
                const togglePerson = (name) => {
                  const updated = selected.includes(name) ? selected.filter(n => n !== name) : [...selected, name];
                  setDreamForm({ ...dreamForm, people: updated });
                };
                const handleAddNew = async () => {
                  const name = window.prompt('Add a new person to your Relational Map:');
                  if (!name || !name.trim()) return;
                  const trimmed = name.trim();
                  await savePerson(trimmed);
                  if (!selected.includes(trimmed)) {
                    setDreamForm({ ...dreamForm, people: [...selected, trimmed] });
                  }
                };
                return (
                  <>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <select style={{ ...styles.input, flex: 1 }} value="" onChange={e => { if (e.target.value) togglePerson(e.target.value); }}>
                        <option value="">{selected.length === 0 ? '-- Add a person --' : '-- Add another person --'}</option>
                        {available.map((p, i) => <option key={i} value={p.name}>{p.name}</option>)}
                      </select>
                      <button type="button" style={styles.cancelBtn} onClick={handleAddNew}>+ New</button>
                    </div>
                    {selected.length > 0 && (
                      <div style={{ marginTop: '10px' }}>
                        {selected.map((name, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(142,196,224,0.06)', border: '1px solid rgba(142,196,224,0.25)', borderRadius: '3px', marginTop: '6px' }}>
                            <span style={{ fontSize: '13px', color: '#A0C4D8', fontFamily: 'Georgia, serif' }}>{name}</span>
                            <button type="button" style={{ background: 'none', border: 'none', color: '#8BAFC8', cursor: 'pointer', fontSize: '14px', padding: '0 4px' }} onClick={() => togglePerson(name)}>✕</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Symbols & Recurring Themes</label>
              <textarea style={styles.textarea} value={dreamForm.symbols || ''} onChange={e => setDreamForm({ ...dreamForm, symbols: e.target.value })} placeholder="What symbols or images stood out?" rows={3} />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Reflection</label>
              <textarea style={styles.textarea} value={dreamForm.reflection || ''} onChange={e => setDreamForm({ ...dreamForm, reflection: e.target.value })} placeholder="What does this dream mean to you?" rows={3} />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Link to Complexes <span style={{ color: '#8BAFC8', fontWeight: 400 }}>— optional</span></label>
              {(() => {
                const selected = Array.isArray(dreamForm.complexLinks) ? dreamForm.complexLinks : (dreamForm.complexLink ? [dreamForm.complexLink] : []);
                const available = complexes.filter(c => !selected.includes(c.name));
                const toggleComplex = (name) => {
                  const updated = selected.includes(name) ? selected.filter(n => n !== name) : [...selected, name];
                  setDreamForm({ ...dreamForm, complexLinks: updated, complexLink: undefined });
                };
                return (
                  <>
                    <select style={styles.input} value="" onChange={e => { if (e.target.value) toggleComplex(e.target.value); }}>
                      <option value="">{selected.length === 0 ? '-- Add a complex --' : '-- Add another complex --'}</option>
                      {available.map((c, i) => <option key={i} value={c.name}>{c.name}</option>)}
                    </select>
                    {selected.length > 0 && (
                      <div style={{ marginTop: '10px' }}>
                        {selected.map((name, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(74,174,136,0.06)', border: '1px solid rgba(74,174,136,0.25)', borderRadius: '3px', marginTop: '6px' }}>
                            <span style={{ fontSize: '13px', color: '#4AAE88', fontFamily: 'Georgia, serif' }}>{name}</span>
                            <button type="button" style={{ background: 'none', border: 'none', color: '#8BAFC8', cursor: 'pointer', fontSize: '14px', padding: '0 4px' }} onClick={() => toggleComplex(name)}>✕</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
            <div style={styles.formFooter}>
              <button style={styles.cancelBtn} onClick={() => setShowDreamForm(false)}>Cancel</button>
              <button style={styles.btn} onClick={saveDream} disabled={saving}>{saving ? 'Saving...' : 'Save Dream'}</button>
            </div>
          </div>
        </PageBody>
      </Page>
    );
  }

  if (showFreeForm) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <button style={styles.backBtn} onClick={() => setShowFreeForm(false)}>← Cancel</button>
          <span style={styles.screenTitle}>{editFreeIdx !== null ? 'Edit Entry' : 'New Entry'}</span>
        </div>
        <div style={styles.body}>
          <div style={{ fontSize: '10px', fontWeight: '600', letterSpacing: '3px', textTransform: 'uppercase', color: '#8BAFC8', marginBottom: '12px' }}>
            {new Date(freeForm.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
          <textarea
            style={{ ...styles.textarea, minHeight: '400px', fontFamily: 'Georgia, serif', fontSize: '15px', lineHeight: 1.8, padding: '24px' }}
            value={freeForm.text}
            onChange={e => setFreeForm({ ...freeForm, text: e.target.value })}
            placeholder="Write freely. This space is yours."
            autoFocus
          />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
            <button style={styles.cancelBtn} onClick={() => setShowFreeForm(false)}>Cancel</button>
            <button style={styles.btn} onClick={saveFreeEntry} disabled={saving}>{saving ? 'Saving...' : 'Save Entry'}</button>
          </div>
        </div>
      </div>
    );
  }

  const viewDream = viewDreamIdx !== null ? dreams[viewDreamIdx] : null;

  return (
    <div style={styles.container}>

      {viewComplex && (
        <ComplexViewModal complex={viewComplex} onClose={() => setViewComplex(null)} />
      )}

      {viewDream && (
        <div style={styles.modalOverlay}>
          <div style={{ ...styles.modal, maxWidth: '560px' }}>
            <div style={styles.modalHeader}>
              <div style={{ fontFamily: 'Georgia, serif', fontSize: '24px', fontWeight: '300', color: '#D8E6F0' }}>{viewDream.title || 'Untitled Dream'}</div>
              <button style={styles.modalClose} onClick={() => setViewDreamIdx(null)}>✕</button>
            </div>
            <div style={styles.modalBody}>
              {viewDream.year && <div style={{ fontSize: '10px', fontWeight: '600', letterSpacing: '3px', textTransform: 'uppercase', color: '#8EC4E0', marginBottom: '8px' }}>{viewDream.year}</div>}
              {viewDream.date && <div style={{ fontSize: '10px', fontWeight: '600', letterSpacing: '3px', textTransform: 'uppercase', color: '#8BAFC8', marginBottom: '20px' }}>{new Date(viewDream.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</div>}
              {viewDream.narrative && viewDream.narrative.trim() && (
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ fontSize: '9px', fontWeight: '600', letterSpacing: '3px', textTransform: 'uppercase', color: '#8BAFC8', marginBottom: '8px' }}>Narrative</div>
                  <div style={{ fontSize: '14px', color: '#D8E6F0', lineHeight: 1.7, whiteSpace: 'pre-line' }}>{viewDream.narrative}</div>
                </div>
              )}
              {(() => {
                const ppl = viewDream.people;
                if (!ppl) return null;
                if (Array.isArray(ppl)) {
                  if (ppl.length === 0) return null;
                  return (
                    <div style={{ marginBottom: '20px' }}>
                      <div style={{ fontSize: '9px', fontWeight: '600', letterSpacing: '3px', textTransform: 'uppercase', color: '#8BAFC8', marginBottom: '8px' }}>Who Appeared / Who is it about?</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {ppl.map((name, i) => (
                          <span key={i} style={{ fontSize: '12px', color: '#A0C4D8', fontFamily: 'Georgia, serif', padding: '4px 10px', background: 'rgba(142,196,224,0.08)', border: '1px solid rgba(142,196,224,0.25)', borderRadius: '3px' }}>{name}</span>
                        ))}
                      </div>
                    </div>
                  );
                }
                if (typeof ppl === 'string' && ppl.trim()) {
                  return (
                    <div style={{ marginBottom: '20px' }}>
                      <div style={{ fontSize: '9px', fontWeight: '600', letterSpacing: '3px', textTransform: 'uppercase', color: '#8BAFC8', marginBottom: '8px' }}>Who Appeared / Who is it about?</div>
                      <div style={{ fontSize: '14px', color: '#D8E6F0', lineHeight: 1.7, whiteSpace: 'pre-line' }}>{ppl}</div>
                    </div>
                  );
                }
                return null;
              })()}
              {viewDream.symbols && viewDream.symbols.trim() && (
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ fontSize: '9px', fontWeight: '600', letterSpacing: '3px', textTransform: 'uppercase', color: '#8BAFC8', marginBottom: '8px' }}>Symbols & Recurring Themes</div>
                  <div style={{ fontSize: '14px', color: '#D8E6F0', lineHeight: 1.7, whiteSpace: 'pre-line' }}>{viewDream.symbols}</div>
                </div>
              )}
              {viewDream.reflection && viewDream.reflection.trim() && (
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ fontSize: '9px', fontWeight: '600', letterSpacing: '3px', textTransform: 'uppercase', color: '#8BAFC8', marginBottom: '8px' }}>Reflection</div>
                  <div style={{ fontSize: '14px', color: '#8EC4E0', lineHeight: 1.7, whiteSpace: 'pre-line' }}>{viewDream.reflection}</div>
                </div>
              )}
              {(() => {
                const links = Array.isArray(viewDream.complexLinks) ? viewDream.complexLinks : (viewDream.complexLink ? [viewDream.complexLink] : []);
                if (links.length === 0) return null;
                return (
                  <div style={{ marginBottom: '20px' }}>
                    <div style={{ fontSize: '9px', fontWeight: '600', letterSpacing: '3px', textTransform: 'uppercase', color: '#8BAFC8', marginBottom: '8px' }}>Linked Complex{links.length > 1 ? 'es' : ''}</div>
                    {links.map((linkName, i) => {
                      const complex = complexes.find(c => c.name === linkName);
                      return (
                        <div key={i}
                          style={{ border: '1px solid rgba(74,174,136,0.25)', borderRadius: '3px', padding: '12px 16px', background: 'rgba(74,174,136,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: complex ? 'pointer' : 'default', marginBottom: i < links.length - 1 ? '8px' : 0 }}
                          onClick={() => { if (complex) { setViewDreamIdx(null); setViewComplex(complex); } }}
                        >
                          <div style={{ fontSize: '14px', color: '#4AAE88', fontFamily: 'Georgia, serif' }}>{linkName}</div>
                          {complex && <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M4 2 L9 6 L4 10" stroke="rgba(74,174,136,0.5)" strokeWidth="1.5" strokeLinecap="round" /></svg>}
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
            <div style={styles.modalFooter}>
              <button style={{ ...styles.cancelBtn, color: '#C87878', borderColor: 'rgba(176,90,90,0.3)' }} onClick={() => { deleteDream(viewDreamIdx); setViewDreamIdx(null); }}>Delete</button>
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
        <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid rgba(142,196,224,0.15)', marginBottom: '32px' }}>
          <button style={{ ...styles.tabBtn, ...(tab === 'dreams' ? styles.tabBtnActive : {}) }} onClick={() => setTab('dreams')}>Dream Journal</button>
          <button style={{ ...styles.tabBtn, ...(tab === 'free' ? styles.tabBtnActive : {}) }} onClick={() => setTab('free')}>Free Journal</button>
        </div>

        {tab === 'dreams' && (
          dreams.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 40px', color: '#8BAFC8' }}>
              <div style={{ fontSize: '13px', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '12px' }}>No dreams recorded yet</div>
              <div style={{ fontSize: '13px', color: '#8BAFC8', lineHeight: 1.6, fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>Click "+ Record Dream" to begin.<br />Your dreams hold language worth listening to.</div>
            </div>
          ) : (() => {
            const filteredDreams = dreams.filter((d) => {
              if (filterType === 'person' && filterValue) {
                const ppl = Array.isArray(d.people) ? d.people : [];
                return ppl.includes(filterValue);
              }
              if (filterType === 'complex' && filterValue) {
                const links = Array.isArray(d.complexLinks) ? d.complexLinks : (d.complexLink ? [d.complexLink] : []);
                return links.includes(filterValue);
              }
              return true;
            });
            const groups = {};
            filteredDreams.forEach((d) => {
              const realIdx = dreams.indexOf(d);
              const yearKey = d.year ? String(d.year) : 'Undated';
              if (!groups[yearKey]) groups[yearKey] = [];
              groups[yearKey].push({ dream: d, realIdx });
            });
            const yearKeys = Object.keys(groups).sort((a, b) => {
              if (a === 'Undated') return -1;
              if (b === 'Undated') return 1;
              return parseInt(b) - parseInt(a);
            });
            yearKeys.forEach(k => groups[k].reverse());
            const sortedPeople = people.slice().sort((a, b) => (a.name || '').localeCompare(b.name || ''));
            const sortedComplexes = complexes.slice().sort((a, b) => (a.name || '').localeCompare(b.name || ''));
            return (
              <div>
                <div style={styles.filterBar}>
                  <div style={styles.filterGroup}>
                    <label style={styles.filterLabel}>Filter by person</label>
                    <select
                      style={styles.filterSelect}
                      value={filterType === 'person' ? filterValue : ''}
                      onChange={e => {
                        if (e.target.value) { setFilterType('person'); setFilterValue(e.target.value); }
                        else { setFilterType(null); setFilterValue(''); }
                      }}
                    >
                      <option value="">All</option>
                      {sortedPeople.map((p, i) => <option key={i} value={p.name}>{p.name}</option>)}
                    </select>
                  </div>
                  <div style={styles.filterGroup}>
                    <label style={styles.filterLabel}>Filter by complex</label>
                    <select
                      style={styles.filterSelect}
                      value={filterType === 'complex' ? filterValue : ''}
                      onChange={e => {
                        if (e.target.value) { setFilterType('complex'); setFilterValue(e.target.value); }
                        else { setFilterType(null); setFilterValue(''); }
                      }}
                    >
                      <option value="">All</option>
                      {sortedComplexes.map((c, i) => <option key={i} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>
                  {filterType && (
                    <button style={styles.filterClear} onClick={() => { setFilterType(null); setFilterValue(''); }}>
                      Clear filter
                    </button>
                  )}
                  {filterType && (
                    <span style={styles.filterCount}>
                      {filteredDreams.length} match{filteredDreams.length === 1 ? '' : 'es'}
                    </span>
                  )}
                </div>
                {filteredDreams.length === 0 && filterType && (
                  <div style={{ textAlign: 'center', padding: '60px 40px', color: '#8BAFC8', fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '14px' }}>
                    No dreams match this filter.
                  </div>
                )}
                {yearKeys.map(yearKey => (
                  <div key={yearKey} style={{ marginBottom: '48px' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '16px', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid rgba(142,196,224,0.15)' }}>
                      <div style={{
                        fontFamily: 'Georgia, serif',
                        fontSize: yearKey === 'Undated' ? '20px' : '26px',
                        fontWeight: '300',
                        color: '#8BAFC8',
                        letterSpacing: '2px',
                        fontStyle: yearKey === 'Undated' ? 'italic' : 'normal',
                      }}>{yearKey}</div>
                      <span style={{ fontSize: '10px', color: '#8BAFC8', letterSpacing: '2px', textTransform: 'uppercase' }}>{groups[yearKey].length} dream{groups[yearKey].length > 1 ? 's' : ''}</span>
                    </div>
                    <div style={styles.dreamList}>
                      {groups[yearKey].map(({ dream: d, realIdx }, rowI) => {
                        const ppl = Array.isArray(d.people) ? d.people : [];
                        return (
                          <div
                            key={realIdx}
                            style={{ ...styles.dreamRow, borderTop: rowI === 0 ? 'none' : '1px solid rgba(142,196,224,0.06)' }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(142,196,224,0.03)'; e.currentTarget.querySelector('.row-actions').style.opacity = '1'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.querySelector('.row-actions').style.opacity = '0'; }}
                            onClick={(e) => { if (!e.target.closest('button')) setViewDreamIdx(realIdx); }}
                          >
                            <div style={styles.dreamRowTitle}>
                              {d.title || 'Untitled Dream'}
                            </div>
                            <div style={styles.dreamRowPeople}>
                              {ppl.length > 0 ? ppl.join(' · ') : ''}
                            </div>
                            <div className="row-actions" style={styles.dreamRowActions}>
                              <button style={styles.smallBtn} onClick={e => { e.stopPropagation(); openDreamForm(realIdx); }}>Edit</button>
                              <button style={{ ...styles.smallBtn, color: '#C87878', borderColor: 'rgba(176,90,90,0.3)' }} onClick={e => { e.stopPropagation(); deleteDream(realIdx); }}>Delete</button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            );
          })()
        )}

        {tab === 'free' && (
          freeEntries.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 40px' }}>
              <div style={{ fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', color: '#8BAFC8', marginBottom: '12px' }}>No entries yet</div>
              <div style={{ fontSize: '13px', color: '#8BAFC8', lineHeight: 1.7, fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>This space is yours. Write freely.</div>
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
                  <div key={realIdx} style={styles.freeCard} onClick={() => openFreeForm(realIdx)}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <div>
                        <div style={{ fontSize: '10px', fontWeight: '600', letterSpacing: '3px', textTransform: 'uppercase', color: '#8BAFC8', marginBottom: '4px' }}>{dateStr}</div>
                        <div style={{ fontSize: '9px', letterSpacing: '1px', color: '#8BAFC8', opacity: 0.7 }}>{timeStr}</div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }} onClick={ev => ev.stopPropagation()}>
                        <button style={styles.smallBtn} onClick={() => openFreeForm(realIdx)}>Edit</button>
                        <button style={{ ...styles.smallBtn, color: '#C87878', borderColor: 'rgba(176,90,90,0.3)' }} onClick={() => deleteFree(realIdx)}>Delete</button>
                      </div>
                    </div>
                    <div style={{ fontSize: '14px', color: '#A0C4D8', lineHeight: 1.7, fontFamily: 'Georgia, serif' }}>{preview}</div>
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
  header: { display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 32px', borderBottom: '1px solid rgba(142,196,224,0.15)', background: '#0f2236' },
  backBtn: { background: 'none', border: 'none', color: '#8BAFC8', fontSize: '12px', fontWeight: '600', letterSpacing: '1px', cursor: 'pointer', padding: 0 },
  screenTitle: { fontFamily: 'Georgia, serif', fontSize: '18px', fontWeight: '300', color: '#D8E6F0', letterSpacing: '2px', flex: 1 },
  body: { maxWidth: '900px', margin: '0 auto', padding: '40px 32px 80px', width: '100%' },
  tabBtn: { background: 'none', border: 'none', borderBottom: '2px solid transparent', padding: '12px 24px', color: '#8BAFC8', fontSize: '10px', fontWeight: '600', letterSpacing: '3px', textTransform: 'uppercase', cursor: 'pointer', marginBottom: '-1px' },
  tabBtnActive: { color: '#8EC4E0', borderBottomColor: '#8EC4E0' },
  dreamGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' },
  dreamCard: { background: '#162534', border: '1px solid rgba(142,196,224,0.2)', borderRadius: '3px', padding: '20px', cursor: 'pointer', transition: 'border-color 0.2s' },
  filterBar: { display: 'flex', alignItems: 'flex-end', gap: '20px', marginBottom: '32px', paddingBottom: '20px', borderBottom: '1px solid rgba(142,196,224,0.1)', flexWrap: 'wrap' },
  filterGroup: { display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '200px' },
  filterLabel: { fontSize: '9px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', color: '#8BAFC8' },
  filterSelect: { background: '#0f2236', border: '1px solid rgba(142,196,224,0.2)', borderRadius: '3px', padding: '8px 12px', color: '#D8E6F0', fontSize: '13px', outline: 'none', cursor: 'pointer', minWidth: '200px' },
  filterClear: { background: 'none', border: 'none', color: '#8EC4E0', fontSize: '11px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer', padding: '8px 0' },
  filterCount: { fontSize: '11px', color: '#8BAFC8', letterSpacing: '1px', marginLeft: 'auto', alignSelf: 'center' },
  dreamList: { display: 'grid', gridTemplateColumns: '1fr' },
  dreamRow: { display: 'grid', gridTemplateColumns: '2fr 1.5fr 110px', alignItems: 'center', gap: '32px', padding: '11px 12px', cursor: 'pointer', transition: 'background 0.15s', background: 'transparent' },
  dreamRowTitle: { fontFamily: 'Georgia, serif', fontSize: '14px', fontWeight: '300', color: '#D8E6F0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', letterSpacing: '0.3px' },
  dreamRowPeople: { fontSize: '12px', color: '#A0C4D8', fontFamily: 'Georgia, serif', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', letterSpacing: '0.3px' },
  dreamRowActions: { display: 'flex', gap: '6px', justifyContent: 'flex-end', opacity: 0, transition: 'opacity 0.15s' },
  freeCard: { background: '#162534', border: '1px solid rgba(142,196,224,0.2)', borderRadius: '3px', padding: '24px 28px', marginBottom: '12px', cursor: 'pointer', transition: 'border-color 0.2s' },
  cardFooter: { display: 'flex', gap: '6px', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(142,196,224,0.08)' },
  smallBtn: { background: 'none', border: '1px solid rgba(142,196,224,0.2)', borderRadius: '2px', padding: '4px 10px', color: '#8BAFC8', fontSize: '10px', cursor: 'pointer' },
  btn: { background: 'rgba(142,196,224,0.15)', border: '1px solid rgba(142,196,224,0.4)', borderRadius: '3px', padding: '10px 20px', color: '#8EC4E0', fontSize: '11px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer', whiteSpace: 'nowrap' },
  cancelBtn: { background: 'none', border: '1px solid rgba(142,196,224,0.2)', borderRadius: '3px', padding: '10px 20px', color: '#8BAFC8', fontSize: '11px', cursor: 'pointer' },
  card: { background: '#162534', border: '1px solid rgba(142,196,224,0.15)', borderRadius: '4px', padding: '32px' },
  formGroup: { marginBottom: '20px' },
  label: { display: 'block', fontSize: '10px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', color: '#8BAFC8', marginBottom: '8px' },
  input: { width: '100%', background: '#0f2236', border: '1px solid rgba(142,196,224,0.2)', borderRadius: '3px', padding: '10px 14px', color: '#D8E6F0', fontSize: '14px', outline: 'none', boxSizing: 'border-box' },
  textarea: { width: '100%', background: '#0f2236', border: '1px solid rgba(142,196,224,0.2)', borderRadius: '3px', padding: '10px 14px', color: '#D8E6F0', fontSize: '14px', outline: 'none', boxSizing: 'border-box', resize: 'vertical', fontFamily: 'inherit' },
  formFooter: { display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' },
  modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 200, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', overflowY: 'auto', padding: '40px 20px' },
  modal: { background: '#162534', border: '1px solid rgba(142,196,224,0.3)', borderRadius: '4px', width: '100%', boxShadow: '0 0 40px rgba(0,0,0,0.6)', margin: 'auto' },
  modalHeader: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '28px 32px 20px', borderBottom: '1px solid rgba(142,196,224,0.15)' },
  modalClose: { background: 'none', border: 'none', color: '#8BAFC8', cursor: 'pointer', fontSize: '18px' },
  modalBody: { padding: '24px 32px' },
  modalFooter: { display: 'flex', gap: '10px', padding: '16px 32px 24px', borderTop: '1px solid rgba(142,196,224,0.1)' },
};

export default Journal;