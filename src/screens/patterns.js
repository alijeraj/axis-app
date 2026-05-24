import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Page, AppHeader, PageBody } from '../components/Layout';

const API = 'https://axis-backend-production-5e9b.up.railway.app';

const PATTERN_COLORS = [
  '#E8B84A', '#E89048', '#E87878', '#D88AB0', '#A07AC4', '#7DA8E0',
  '#5DB8A6', '#7DB860', '#A88860', '#D8D8D8', '#5C5C5C', '#000000',
];

const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

// Preset library. Content is illustrative scaffolding — the owner will author
// the final wording. Structure mirrors custom: category -> colored items.
const PRESETS = [
  {
    key: 'attachment',
    name: 'Attachment Theory',
    blurb: 'How you bond, seek closeness, and respond to distance in relationships.',
    items: [
      { name: 'Secure', color: '#7DB860' },
      { name: 'Anxious', color: '#E8B84A' },
      { name: 'Avoidant', color: '#7DA8E0' },
      { name: 'Disorganized', color: '#E87878' },
    ],
  },
  {
    key: 'familyroles',
    name: 'Family Roles',
    blurb: 'The role you were assigned in your family system growing up.',
    items: [
      { name: 'Golden Child', color: '#E8B84A' },
      { name: 'Scapegoat', color: '#E87878' },
      { name: 'Lost Child', color: '#7DA8E0' },
      { name: 'Mascot', color: '#5DB8A6' },
      { name: 'Caretaker', color: '#D88AB0' },
    ],
  },
  {
    key: 'personality',
    name: 'Personality Disorders',
    blurb: 'Clinically described personality structures, used as a lens — not a diagnosis.',
    items: [
      { name: 'Narcissistic', color: '#E89048' },
      { name: 'Borderline', color: '#E87878' },
      { name: 'Histrionic', color: '#D88AB0' },
      { name: 'Antisocial', color: '#5C5C5C' },
      { name: 'Avoidant', color: '#7DA8E0' },
      { name: 'Dependent', color: '#5DB8A6' },
    ],
  },
  {
    key: 'mbti',
    name: 'MBTI',
    blurb: 'Sixteen types grouped by four temperaments. Color marks the temperament; the code names the type.',
    items: [
      { name: 'INTJ', color: '#A07AC4' }, { name: 'INTP', color: '#A07AC4' }, { name: 'ENTJ', color: '#A07AC4' }, { name: 'ENTP', color: '#A07AC4' },
      { name: 'INFJ', color: '#5DB8A6' }, { name: 'INFP', color: '#5DB8A6' }, { name: 'ENFJ', color: '#5DB8A6' }, { name: 'ENFP', color: '#5DB8A6' },
      { name: 'ISTJ', color: '#7DA8E0' }, { name: 'ISFJ', color: '#7DA8E0' }, { name: 'ESTJ', color: '#7DA8E0' }, { name: 'ESFJ', color: '#7DA8E0' },
      { name: 'ISTP', color: '#E8B84A' }, { name: 'ISFP', color: '#E8B84A' }, { name: 'ESTP', color: '#E8B84A' }, { name: 'ESFP', color: '#E8B84A' },
    ],
  },
];

function Patterns() {
  const navigate = useNavigate();
  const token = localStorage.getItem('axis_token');
  const [categories, setCategories] = useState([]);
  const [patterns, setPatterns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [catsRes, patternsRes] = await Promise.all([
          axios.get(`${API}/api/pattern-categories`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API}/api/patterns`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        setCategories(catsRes.data || []);
        setPatterns(patternsRes.data || []);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const saveCategories = async (updated) => {
    await axios.post(`${API}/api/pattern-categories`, { data: updated }, { headers: { Authorization: `Bearer ${token}` } });
    setCategories(updated);
  };
  const savePatterns = async (updated) => {
    await axios.post(`${API}/api/patterns`, { data: updated }, { headers: { Authorization: `Bearer ${token}` } });
    setPatterns(updated);
  };

  const adoptPreset = async (preset) => {
    const exists = categories.some(c => c.name.toLowerCase() === preset.name.toLowerCase());
    if (exists && !window.confirm(`You already have a "${preset.name}" category. Add another copy?`)) return;
    const catId = newId();
    const newCat = { id: catId, name: preset.name, order: categories.length };
    const newPatterns = preset.items.map(it => ({ id: newId(), categoryId: catId, name: it.name, color: it.color }));
    await saveCategories([...categories, newCat]);
    await savePatterns([...patterns, ...newPatterns]);
  };

  if (loading) return <div style={{ color: '#8BAFC8', padding: '48px', textAlign: 'center' }}>Loading...</div>;

  const adoptedNames = new Set(categories.map(c => c.name.toLowerCase()));

  return (
    <Page>
      <AppHeader title="Pattern Library" />
      <PageBody width="content">

        {/* YOUR PATTERNS */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <div style={styles.sectionTitle}>Your Patterns</div>
            <div style={styles.sectionSub}>The pattern categories you've built. Assigned to people on the Relational Map.</div>
          </div>
        </div>

        {categories.length === 0 ? (
          <div style={styles.empty}>
            No patterns yet. Build your own below, or adopt one from the Library.
          </div>
        ) : (
          <div style={styles.cardGrid}>
            {categories.map(cat => {
              const items = patterns.filter(p => p.categoryId === cat.id);
              return (
                <div key={cat.id} style={styles.card}>
                  <div style={styles.cardName}>{cat.name}</div>
                  <div style={styles.chipWrap}>
                    {items.length === 0 ? (
                      <span style={styles.emptyChip}>No items yet</span>
                    ) : items.map(it => (
                      <span key={it.id} style={styles.chip}>
                        <span style={{ ...styles.chipDot, background: it.color }} />
                        {it.name}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* PATTERN LIBRARY */}
        <div style={{ marginTop: '56px', marginBottom: '20px' }}>
          <div style={styles.sectionTitle}>Pattern Library</div>
          <div style={styles.sectionSub}>Established frameworks, read through the AXIS lens. Adopt one to add it to your patterns, then tailor it.</div>
        </div>

        <div style={styles.cardGrid}>
          {PRESETS.map(preset => {
            const adopted = adoptedNames.has(preset.name.toLowerCase());
            return (
              <div key={preset.key} style={{ ...styles.card, ...styles.presetCard }}>
                <div style={styles.cardName}>{preset.name}</div>
                <div style={styles.presetBlurb}>{preset.blurb}</div>
                <div style={styles.chipWrap}>
                  {preset.items.map((it, i) => (
                    <span key={i} style={styles.chip}>
                      <span style={{ ...styles.chipDot, background: it.color }} />
                      {it.name}
                    </span>
                  ))}
                </div>
                <div style={{ marginTop: '16px' }}>
                  <button style={adopted ? styles.adoptedBtn : styles.adoptBtn} onClick={() => adoptPreset(preset)}>
                    {adopted ? '✓ Adopted — add again' : '+ Adopt'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </PageBody>
    </Page>
  );
}

const styles = {
  sectionTitle: { fontFamily: 'Georgia, serif', fontSize: '24px', fontWeight: '300', color: '#D8E6F0' },
  sectionSub: { fontSize: '12px', color: '#8BAFC8', marginTop: '6px', lineHeight: 1.5 },
  empty: { border: '1px dashed rgba(142,196,224,0.2)', borderRadius: '3px', padding: '40px', textAlign: 'center', fontSize: '13px', color: '#8BAFC8', fontStyle: 'italic', fontFamily: 'Georgia, serif' },
  cardGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' },
  card: { background: '#162534', border: '1px solid rgba(142,196,224,0.2)', borderRadius: '4px', padding: '20px 22px' },
  presetCard: { background: 'rgba(22,37,52,0.5)', borderStyle: 'dashed', borderColor: 'rgba(142,196,224,0.18)' },
  cardName: { fontFamily: 'Georgia, serif', fontSize: '17px', fontWeight: '300', color: '#D8E6F0', marginBottom: '8px' },
  presetBlurb: { fontSize: '11px', color: '#8BAFC8', lineHeight: 1.5, marginBottom: '14px', fontStyle: 'italic' },
  chipWrap: { display: 'flex', flexWrap: 'wrap', gap: '8px' },
  chip: { display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 10px', borderRadius: '12px', background: 'rgba(142,196,224,0.06)', border: '1px solid rgba(142,196,224,0.15)', fontSize: '11px', color: '#D8E6F0' },
  chipDot: { width: '9px', height: '9px', borderRadius: '50%', flexShrink: 0 },
  emptyChip: { fontSize: '11px', color: '#8BAFC8', fontStyle: 'italic' },
  adoptBtn: { background: 'rgba(142,196,224,0.15)', border: '1px solid rgba(142,196,224,0.4)', borderRadius: '3px', padding: '8px 18px', color: '#8EC4E0', fontSize: '10px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer' },
  adoptedBtn: { background: 'none', border: '1px solid rgba(74,174,136,0.3)', borderRadius: '3px', padding: '8px 18px', color: '#4AAE88', fontSize: '10px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer' },
};

export default Patterns;