import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = 'https://axis-backend-production-5e9b.up.railway.app';

function People() {
  const navigate = useNavigate();
  const token = localStorage.getItem('axis_token');
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editIdx, setEditIdx] = useState(null);
  const [form, setForm] = useState({ name: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadData(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadData = async () => {
    try {
      const res = await axios.get(`${API}/api/people`, { headers: { Authorization: `Bearer ${token}` } });
      setPeople(res.data || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const savePeople = async (updated) => {
    await axios.post(`${API}/api/people`, { data: updated }, { headers: { Authorization: `Bearer ${token}` } });
    setPeople(updated);
  };

  const openForm = (idx = null) => {
    if (idx !== null) {
      setForm({ ...people[idx] });
      setEditIdx(idx);
    } else {
      setForm({ name: '' });
      setEditIdx(null);
    }
    setShowForm(true);
  };

  const savePerson = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      let updated;
      if (editIdx !== null) {
        updated = [...people];
        updated[editIdx] = form;
      } else {
        updated = [...people, form];
      }
      await savePeople(updated);
      setShowForm(false);
    } finally {
      setSaving(false);
    }
  };

  const deletePerson = async (idx) => {
    const name = people[idx]?.name || 'this person';
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    const updated = people.filter((_, i) => i !== idx);
    await savePeople(updated);
  };

  if (loading) return <div style={{ color: '#8BAFC8', padding: '48px', textAlign: 'center' }}>Loading...</div>;

  if (showForm) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <button style={styles.backBtn} onClick={() => setShowForm(false)}>← Cancel</button>
          <span style={styles.screenTitle}>{editIdx !== null ? 'Edit Person' : 'Add Person'}</span>
        </div>
        <div style={styles.body}>
          <div style={styles.card}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Name</label>
              <input
                style={styles.input}
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="Who is this person?"
                autoFocus
                onKeyDown={e => { if (e.key === 'Enter') savePerson(); }}
              />
            </div>
            <div style={styles.formFooter}>
              <button style={styles.cancelBtn} onClick={() => setShowForm(false)}>Cancel</button>
              <button style={styles.btn} onClick={savePerson} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate('/')}>← Home</button>
        <span style={styles.screenTitle}>Constellation</span>
        <button style={styles.btn} onClick={() => openForm()}>+ Add Person</button>
      </div>

      <div style={styles.body}>
        {people.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 40px', color: '#8BAFC8' }}>
            <div style={{ fontSize: '13px', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '12px' }}>No people yet</div>
            <div style={{ fontSize: '13px', color: '#8BAFC8', lineHeight: 1.6, fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>
              The people who shaped you.<br />Add the ones who matter.
            </div>
          </div>
        ) : (
          <div style={styles.grid}>
            {people.slice().sort((a, b) => (a.name || '').localeCompare(b.name || '')).map((p) => {
              const realIdx = people.indexOf(p);
              return (
                <div key={realIdx} style={styles.card2} onClick={(e) => { if (!e.target.closest('button')) openForm(realIdx); }}>
                  <div style={{ fontFamily: 'Georgia, serif', fontSize: '16px', fontWeight: '300', color: '#D8E6F0', lineHeight: 1.4 }}>{p.name}</div>
                  <div style={styles.cardFooter}>
                    <button style={styles.smallBtn} onClick={e => { e.stopPropagation(); openForm(realIdx); }}>Edit</button>
                    <button style={{ ...styles.smallBtn, color: '#C87878', borderColor: 'rgba(176,90,90,0.3)', marginLeft: 'auto' }} onClick={e => { e.stopPropagation(); deletePerson(realIdx); }}>Delete</button>
                  </div>
                </div>
              );
            })}
          </div>
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
  grid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' },
  card2: { background: '#162534', border: '1px solid rgba(142,196,224,0.2)', borderRadius: '3px', padding: '20px', cursor: 'pointer', transition: 'border-color 0.2s' },
  cardFooter: { display: 'flex', gap: '6px', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(142,196,224,0.08)' },
  smallBtn: { background: 'none', border: '1px solid rgba(142,196,224,0.2)', borderRadius: '2px', padding: '4px 10px', color: '#8BAFC8', fontSize: '10px', cursor: 'pointer' },
  btn: { background: 'rgba(142,196,224,0.15)', border: '1px solid rgba(142,196,224,0.4)', borderRadius: '3px', padding: '10px 20px', color: '#8EC4E0', fontSize: '11px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer', whiteSpace: 'nowrap' },
  cancelBtn: { background: 'none', border: '1px solid rgba(142,196,224,0.2)', borderRadius: '3px', padding: '10px 20px', color: '#8BAFC8', fontSize: '11px', cursor: 'pointer' },
  card: { background: '#162534', border: '1px solid rgba(142,196,224,0.15)', borderRadius: '4px', padding: '32px' },
  formGroup: { marginBottom: '20px' },
  label: { display: 'block', fontSize: '10px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', color: '#8BAFC8', marginBottom: '8px' },
  input: { width: '100%', background: '#0f2236', border: '1px solid rgba(142,196,224,0.2)', borderRadius: '3px', padding: '10px 14px', color: '#D8E6F0', fontSize: '14px', outline: 'none', boxSizing: 'border-box' },
  formFooter: { display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' },
};

export default People;