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

const PRESETS = [
  {
    key: 'attachment',
    name: 'Attachment Theory',
    blurb: 'How you bond, seek closeness, and respond to distance in relationships.',
    items: [
      { name: 'Secure', color: '#7DB860', description: 'Comfortable with intimacy and autonomy; trusts others and is able to depend and be depended on.' },
      { name: 'Anxious', color: '#E8B84A', description: 'Craves closeness, fears abandonment, and is sensitive to a partner\u2019s availability.' },
      { name: 'Avoidant', color: '#7DA8E0', description: 'Values independence highly, tends to suppress emotional needs and keep distance.' },
      { name: 'Disorganized', color: '#E87878', description: 'Wants closeness yet fears it; behavior toward intimacy can feel contradictory.' },
    ],
  },
  {
    key: 'clusterb',
    name: 'Personality Disorders (Cluster B)',
    blurb: 'Cluster B personality structures',
    sources: 'Sources: DSM-5-TR; Sperry, Handbook of Diagnosis and Treatment of DSM-5-TR Personality Disorders. Narcissistic subtypes also draw on Pincus, Miller, Gebauer, Kernberg, and Vaknin.',
    items: [
      {
        name: 'Antisocial', color: '#9AA0A6',
        details: [
          { label: 'Trigger', value: 'Social standards and rules' },
          { label: 'Behavioral Style', value: 'Self-reliant, cunning, and forceful; risk-taking and thrill-seeking; glib and shallow' },
          { label: 'Interpersonal Style', value: 'Deceitful; irritable and aggressive; reckless disregard for others; lacks empathy; distrustful of others' },
          { label: 'Cognitive Style', value: 'Impulsive; externally oriented and realistic' },
          { label: 'Feeling Style', value: 'Avoids “softer” emotions which connote weakness; shows little guilt, remorse, or shame' },
          { label: 'Temperament', value: 'Ill-tempered infantile pattern and an aggressive, impulsive adult pattern' },
          { label: 'Self-View', value: '“I\'m cunning and I\'m entitled to get what I want”' },
          { label: 'World View', value: '“Life is devious and hostile and rules keep me from fulfilling my needs. Therefore, I\'ll bend or break them because my needs come first, and I\'ll defend any efforts to be controlled or degraded.”' },
          { label: 'Maladaptive Schemas', value: 'Mistrust/Abuse; Entitlement; Insufficient Self-Control; Defectiveness; Emotional Deprivation; Abandonment; Social Isolation' },
          { label: 'Optimal Diagnostic Criteria', value: 'Criminal, aggressive, impulsive, irresponsible behavior' },
        ],
      },
      {
        name: 'Borderline', color: '#7DB860',
        details: [
          { label: 'Trigger', value: 'Expectation of meeting personal goals and/or maintaining close relationships' },
          { label: 'Behavioral Style', value: 'Impulsivity; acting-out behaviors; helpless, empty “void”; unstable, intense relationships; fear of abandonment' },
          { label: 'Interpersonal Style', value: 'Alternates between extremes of idealization and devaluation' },
          { label: 'Cognitive Style', value: 'Inflexible, rigid thinking; failure to learn from experience; external locus of control' },
          { label: 'Feeling Style', value: 'Emotionally reactive and dysregulated; extreme lability of mood and affect; intense anger' },
          { label: 'Temperament', value: 'Dependent type: passive infantile pattern—low autonomic reactivity; Histrionic type: hyperresponsive—high autonomic reactivity; Passive-Aggressive type: “difficult”—affect irritability' },
          { label: 'Self-View', value: '“I don\'t know who I am or where I\'m going” — identity problems; fluctuates with current emotion, loyalties, values; unstable self-esteem' },
          { label: 'World View', value: '“People are great, no they\'re not. Having goals is good, no it\'s not. If life doesn\'t go my way, I can\'t tolerate it. Don\'t commit to anything.”' },
          { label: 'Maladaptive Schemas', value: 'Abandonment; Defectiveness; Abuse/Mistrust; Insufficient Self-Control; Emotional Deprivation; Social Isolation' },
          { label: 'Optimal Diagnostic Criteria', value: 'Frantic efforts to avoid real or imagined abandonment' },
        ],
      },
      {
        name: 'Histrionic', color: '#7DA8E0',
        details: [
          { label: 'Trigger', value: 'Demands to be the center of attention / situations where not noticed' },
          { label: 'Behavioral Style', value: 'Self-dramatization; suggestibility; charming and excitement-seeking; needs to attract others\' attention' },
          { label: 'Interpersonal Style', value: 'Seductive or provocative interactions; exhibitionistic and/or flirtatious; misreads intimacy of relationships' },
          { label: 'Cognitive Style', value: 'Impulsive; thematic, field-dependent; impressionistic style of speech' },
          { label: 'Feeling Style', value: 'Rapidly shifting, shallow expression of emotions; exaggerated emotional display' },
          { label: 'Temperament', value: 'Hyperresponsive infantile pattern; externally oriented for gratification' },
          { label: 'Self-View', value: '“I need to be noticed”' },
          { label: 'World View', value: '“Life makes me so nervous, so I\'m entitled to special care and consideration”' },
          { label: 'Maladaptive Schemas', value: 'Approval-Seeking; Emotional Deprivation; Defectiveness' },
          { label: 'Optimal Diagnostic Criteria', value: 'Is uncomfortable in situations in which he or she is not the center of attention' },
        ],
      },
      {
        name: 'Overt Narcissist', color: '#E05858',
        details: [
          { label: 'Trigger', value: 'Challenges to grandiosity or status' },
          { label: 'Behavioral Style', value: 'Openly grandiose; dominant, self-assured, exhibitionistic; requires admiration' },
          { label: 'Interpersonal Style', value: 'Oblivious to others\' needs; exploitative; immodest; refuses to comply with authority; high-risk, face-to-face aggression toward high-ranking targets' },
          { label: 'Cognitive Style', value: 'Superiority, self-confidence, optimism; expansiveness and exaggeration' },
          { label: 'Feeling Style', value: 'High self-esteem; low anxiety/depression; narcissistic rage when challenged' },
          { label: 'Temperament', value: 'Agentic extraversion (high-energy, dominant)' },
          { label: 'Self-View', value: '“I am superior, exceptional, and admired”' },
          { label: 'World View', value: 'The world is a stage for my specialness; people owe me admiration' },
          { label: 'Maladaptive Schemas', value: 'Entitlement; Unrelenting Standards; Insufficient Self-Control' },
          { label: 'Optimal Diagnostic Criteria', value: 'Grandiose, dominant, openly exploitative and attention-seeking presentation' },
        ],
      },
      {
        name: 'Covert Narcissist', color: '#E08AB8',
        details: [
          { label: 'Trigger', value: 'Perceived slights, criticism, or evaluation by others' },
          { label: 'Behavioral Style', value: 'Inhibited, shy, self-effacing outwardly; defensive; introverted' },
          { label: 'Interpersonal Style', value: 'Hypersensitive to slights; distrustful, hostile interpersonal style; withdraws; reactive/anonymous aggression' },
          { label: 'Cognitive Style', value: 'Covertly grandiose; preoccupied with possible failure; self-doubt; constant comparison to others' },
          { label: 'Feeling Style', value: 'Inadequacy, diffidence; chronic envy; high neuroticism, negative affect, anxiety, depression' },
          { label: 'Temperament', value: 'Neurotic, introverted, hyperreactive-to-evaluation pattern' },
          { label: 'Self-View', value: 'Outwardly inadequate, inwardly entitled/special; fragile, low self-esteem' },
          { label: 'World View', value: 'Others judge and fail to recognize my hidden specialness' },
          { label: 'Maladaptive Schemas', value: 'Defectiveness; Emotional Deprivation; Entitlement (covert); Vulnerability to Harm' },
          { label: 'Optimal Diagnostic Criteria', value: 'Hypersensitive, socially withdrawn presentation masking covert grandiosity' },
        ],
      },
      {
        name: 'Inverted Narcissist', color: '#E89048',
        details: [
          { label: 'Trigger', value: 'Absence of a narcissist to attach to; threatened abandonment by the narcissistic partner' },
          { label: 'Behavioral Style', value: 'Needy, demanding, submissive; clinging; immature behaviors to preserve the bond; remains despite abuse' },
          { label: 'Interpersonal Style', value: 'Depends EXCLUSIVELY on narcissists; actively seeks only narcissistic partners; feels empty/unhappy with non-narcissists' },
          { label: 'Cognitive Style', value: 'Derives all self-worth from outside; preempts the narcissist by berating her own achievements' },
          { label: 'Feeling Style', value: 'Pathologically envious; chronic low self-esteem; more emotionally level than the classic narcissist; intermittent aggression' },
          { label: 'Temperament', value: 'Stable but low self-worth (does NOT fluctuate like the overt narcissist\'s)' },
          { label: 'Self-View', value: 'Rigid, stable sense of LACK of self-worth; devalues self as a sacrifice/offering to the narcissist' },
          { label: 'World View', value: 'I exist through and for the narcissist; abuse is the price of the bond' },
          { label: 'Maladaptive Schemas', value: 'Subjugation; Self-Sacrifice; Abandonment; Defectiveness' },
          { label: 'Optimal Diagnostic Criteria', value: 'Covert narcissism organized around exclusive codependent attachment to a narcissist (mirror-image: self-devaluation in place of grandiosity)' },
        ],
      },
      {
        name: 'Communal Narcissist', color: '#E8C84A',
        details: [
          { label: 'Trigger', value: 'Challenges to one\'s image as exceptionally caring, moral, or helpful' },
          { label: 'Behavioral Style', value: 'Grandiosity expressed through prosocial display; conspicuous helping, generosity, virtue-signalling' },
          { label: 'Interpersonal Style', value: 'Seeks admiration via communal roles (“most caring/giving”); uses warmth and goodness as status; underlying entitlement and low concern for others' },
          { label: 'Cognitive Style', value: '“I am the most helpful / trustworthy / moral person”; inflated communal self-view' },
          { label: 'Feeling Style', value: 'Gratified by moral admiration; rage/withdrawal when virtue is unrecognized or questioned' },
          { label: 'Temperament', value: 'Agentic drive channeled into communal arena' },
          { label: 'Self-View', value: '“I am extraordinarily kind, generous, and good”' },
          { label: 'World View', value: 'People should recognize and reward my exceptional goodness' },
          { label: 'Maladaptive Schemas', value: 'Self-Sacrifice (as display); Approval-Seeking; Entitlement' },
          { label: 'Optimal Diagnostic Criteria', value: 'Narcissism with same entitlement/admiration-need core, expressed through communal rather than agentic means' },
        ],
      },
      {
        name: 'Malignant Narcissist', color: '#9A6FC0',
        details: [
          { label: 'Trigger', value: 'Challenges to dominance, control, or superiority' },
          { label: 'Behavioral Style', value: 'Typical NPD symptoms plus prominent antisocial behavior; chronic lying and intimidation' },
          { label: 'Interpersonal Style', value: 'Sadism toward others; pursues financial/interpersonal secondary gains; paranoid features' },
          { label: 'Cognitive Style', value: 'Grandiose and suspicious; paranoid interpretation of others\' motives' },
          { label: 'Feeling Style', value: 'Narcissistic rage fused with sadistic gratification (pleasure in domination)' },
          { label: 'Temperament', value: 'Aggressive, dominant, low-empathy pattern' },
          { label: 'Self-View', value: '“I am superior and entitled to dominate”' },
          { label: 'World View', value: 'The world is hostile and beneath me; dominate or be dominated' },
          { label: 'Maladaptive Schemas', value: 'Entitlement; Mistrust/Abuse; Punitiveness' },
          { label: 'Optimal Diagnostic Criteria', value: 'NPD + antisocial behavior + paranoid features + sadism (Kernberg\'s “malignant narcissism”)' },
        ],
      },
    ],
  },
  {
    key: 'mbti',
    name: 'MBTI',
    blurb: 'Sixteen types grouped by four temperaments. Color marks the temperament; the code names the type.',
    items: [
      { name: 'INTJ', color: '#A07AC4', description: 'The Architect \u2014 strategic, independent, driven by long-range vision.' },
      { name: 'INTP', color: '#A07AC4', description: 'The Logician \u2014 analytical, curious, drawn to ideas and systems.' },
      { name: 'ENTJ', color: '#A07AC4', description: 'The Commander \u2014 decisive, organized, natural at leading toward goals.' },
      { name: 'ENTP', color: '#A07AC4', description: 'The Debater \u2014 inventive, quick, energized by intellectual challenge.' },
      { name: 'INFJ', color: '#5DB8A6', description: 'The Advocate \u2014 insightful, idealistic, quietly principled.' },
      { name: 'INFP', color: '#5DB8A6', description: 'The Mediator \u2014 values-driven, imaginative, deeply empathetic.' },
      { name: 'ENFJ', color: '#5DB8A6', description: 'The Protagonist \u2014 warm, inspiring, attuned to others\u2019 growth.' },
      { name: 'ENFP', color: '#5DB8A6', description: 'The Campaigner \u2014 enthusiastic, expressive, full of possibility.' },
      { name: 'ISTJ', color: '#7DA8E0', description: 'The Logistician \u2014 reliable, thorough, grounded in duty.' },
      { name: 'ISFJ', color: '#7DA8E0', description: 'The Defender \u2014 loyal, caring, steady in support of others.' },
      { name: 'ESTJ', color: '#7DA8E0', description: 'The Executive \u2014 orderly, dependable, a natural organizer.' },
      { name: 'ESFJ', color: '#7DA8E0', description: 'The Consul \u2014 sociable, attentive, devoted to harmony.' },
      { name: 'ISTP', color: '#E8B84A', description: 'The Virtuoso \u2014 practical, hands-on, calm under pressure.' },
      { name: 'ISFP', color: '#E8B84A', description: 'The Adventurer \u2014 gentle, spontaneous, aesthetically attuned.' },
      { name: 'ESTP', color: '#E8B84A', description: 'The Entrepreneur \u2014 bold, energetic, thrives in the moment.' },
      { name: 'ESFP', color: '#E8B84A', description: 'The Entertainer \u2014 lively, generous, loves shared experience.' },
    ],
  },
];

function BuilderModal({ initialCategory, initialItems, onClose, onSave }) {
  const [catName, setCatName] = useState(initialCategory ? initialCategory.name : '');
  const [items, setItems] = useState(
    initialItems && initialItems.length ? initialItems.map(it => ({ ...it })) : []
  );

  const addItem = () => setItems([...items, { id: newId(), name: '', color: PATTERN_COLORS[items.length % PATTERN_COLORS.length], description: '' }]);
  const updateItem = (id, field, val) => setItems(items.map(it => it.id === id ? { ...it, [field]: val } : it));
  const removeItem = (id) => setItems(items.filter(it => it.id !== id));

  const canSave = catName.trim() && items.length > 0 && items.every(it => it.name.trim());

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ fontFamily: 'Georgia, serif', fontSize: '22px', fontWeight: '300', color: '#D8E6F0' }}>
            {initialCategory ? 'Edit Pattern' : 'New Pattern'}
          </div>
          <button style={styles.x} onClick={onClose}></button>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <div style={styles.fieldLabel}>Category name</div>
          <input style={styles.input} value={catName} onChange={e => setCatName(e.target.value)} placeholder="e.g. Attachment Theory" autoFocus />
        </div>

        <div style={styles.fieldLabel}>Items</div>
        {items.length === 0 && <div style={styles.itemsEmpty}>No items yet. Add the first one below.</div>}

        {items.map(it => (
          <div key={it.id} style={styles.itemBlock}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '10px' }}>
              <input style={{ ...styles.input, flex: 1 }} value={it.name} onChange={e => updateItem(it.id, 'name', e.target.value)} placeholder="Item name (e.g. Secure)" />
              <button style={styles.removeItemBtn} onClick={() => removeItem(it.id)}>Remove</button>
            </div>
            <div style={styles.miniLabel}>Color</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
              {PATTERN_COLORS.map(c => (
                <div key={c} onClick={() => updateItem(it.id, 'color', c)}
                  style={{ width: '22px', height: '22px', borderRadius: '50%', background: c, cursor: 'pointer',
                    border: it.color === c ? '2px solid #D8E6F0' : '2px solid transparent',
                    boxShadow: it.color === c ? '0 0 6px rgba(216,230,240,0.4)' : 'none' }} />
              ))}
            </div>
            <div style={styles.miniLabel}>Description <span style={{ textTransform: 'none', letterSpacing: 0, fontWeight: 400 }}>\u2014 optional</span></div>
            <textarea style={{ ...styles.input, minHeight: '54px', resize: 'vertical', fontFamily: 'Georgia, serif' }}
              value={it.description || ''} onChange={e => updateItem(it.id, 'description', e.target.value)}
              placeholder="A short description shown when this item is tapped." />
          </div>
        ))}

        <button style={styles.addItemBtn} onClick={addItem}>+ Add item</button>

        <div style={styles.modalFooter}>
          <button style={styles.cancelBtn} onClick={onClose}>Cancel</button>
          <button style={{ ...styles.confirmBtn, opacity: canSave ? 1 : 0.4, cursor: canSave ? 'pointer' : 'not-allowed' }} disabled={!canSave} onClick={() => onSave(catName.trim(), items)}>Save</button>
        </div>
      </div>
    </div>
  );
}

function ItemDetailModal({ item, categoryName, onClose }) {
  if (!item) return null;
  const hasDetails = Array.isArray(item.details) && item.details.length > 0;
  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={{ ...styles.modal, maxWidth: '480px' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <div style={{ fontSize: '9px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', color: '#8BAFC8', marginBottom: '6px' }}>{categoryName}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ width: '14px', height: '14px', borderRadius: '50%', background: item.color, flexShrink: 0 }} />
              <span style={{ fontFamily: 'Georgia, serif', fontSize: '22px', fontWeight: '300', color: '#D8E6F0' }}>{item.name}</span>
            </div>
          </div>
          <button style={styles.x} onClick={onClose}></button>
        </div>

        {hasDetails ? (
          <div style={{ marginTop: '8px' }}>
            {item.details.map((d, i) => (
              (d.value && d.value.trim()) ? (
                <div key={i} style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '9px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', color: '#8BAFC8', marginBottom: '5px' }}>{d.label}</div>
                  <div style={{ fontSize: '13px', color: '#D8E6F0', fontFamily: 'Georgia, serif', lineHeight: 1.65 }}>{d.value}</div>
                </div>
              ) : null
            ))}
          </div>
        ) : (
          <div style={{ fontSize: '14px', color: '#D8E6F0', fontFamily: 'Georgia, serif', lineHeight: 1.7, marginTop: '8px' }}>
            {item.description && item.description.trim() ? item.description : <span style={{ color: '#8BAFC8', fontStyle: 'italic' }}>No description yet.</span>}
          </div>
        )}
      </div>
    </div>
  );
}

function Patterns() {
  // eslint-disable-next-line no-unused-vars
  const navigate = useNavigate();
  const token = localStorage.getItem('axis_token');
  const [categories, setCategories] = useState([]);
  const [patterns, setPatterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [builderOpen, setBuilderOpen] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [detailItem, setDetailItem] = useState(null);
  const [detailCatName, setDetailCatName] = useState('');

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
    const newPatterns = preset.items.map(it => ({ id: newId(), categoryId: catId, name: it.name, color: it.color, description: it.description || '', details: it.details || null }));
    await saveCategories([...categories, newCat]);
    await savePatterns([...patterns, ...newPatterns]);
  };

  const removeCategory = async (cat) => {
    const count = patterns.filter(p => p.categoryId === cat.id).length;
    if (!window.confirm(`Remove "${cat.name}" and its ${count} item${count === 1 ? '' : 's'}? People assigned to it will lose this tag. This cannot be undone.`)) return;
    await saveCategories(categories.filter(c => c.id !== cat.id));
    await savePatterns(patterns.filter(p => p.categoryId !== cat.id));
  };

  const openNewBuilder = () => { setEditingCat(null); setBuilderOpen(true); };
  const openEditBuilder = (cat) => { setEditingCat(cat); setBuilderOpen(true); };

  const handleBuilderSave = async (name, items) => {
    if (editingCat) {
      const updatedCats = categories.map(c => c.id === editingCat.id ? { ...c, name } : c);
      const others = patterns.filter(p => p.categoryId !== editingCat.id);
      const rebuilt = items.map(it => ({ id: it.id || newId(), categoryId: editingCat.id, name: it.name.trim(), color: it.color, description: it.description || '', details: it.details || null }));
      await saveCategories(updatedCats);
      await savePatterns([...others, ...rebuilt]);
    } else {
      const catId = newId();
      const newCat = { id: catId, name, order: categories.length };
      const newItems = items.map(it => ({ id: newId(), categoryId: catId, name: it.name.trim(), color: it.color, description: it.description || '', details: it.details || null }));
      await saveCategories([...categories, newCat]);
      await savePatterns([...patterns, ...newItems]);
    }
    setBuilderOpen(false);
    setEditingCat(null);
  };

  if (loading) return <div style={{ color: '#8BAFC8', padding: '48px', textAlign: 'center' }}>Loading...</div>;

  const adoptedNames = new Set(categories.map(c => c.name.toLowerCase()));

  return (
    <Page>
      <AppHeader title="Pattern Library" right={<button style={styles.addBtn} onClick={openNewBuilder}>+ New Pattern</button>} />
      <PageBody width="content">

        <div style={{ marginBottom: '20px' }}>
          <div style={styles.sectionTitle}>Your Patterns</div>
          <div style={styles.sectionSub}>The pattern categories you've built. Assigned to people on the Relational Map.</div>
        </div>

        {categories.length === 0 ? (
          <div style={styles.empty}>No patterns yet. Build your own with \u201c+ New Pattern\u201d, or adopt one from the Library below.</div>
        ) : (
          <div style={styles.cardGrid}>
            {categories.map(cat => {
              const items = patterns.filter(p => p.categoryId === cat.id);
              return (
                <div key={cat.id} style={styles.card}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div style={styles.cardName}>{cat.name}</div>
                    <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                      <button style={styles.smallBtn} onClick={() => openEditBuilder(cat)}>Edit</button>
                      <button style={{ ...styles.smallBtn, color: '#C87878', borderColor: 'rgba(176,90,90,0.3)' }} onClick={() => removeCategory(cat)}>Remove</button>
                    </div>
                  </div>
                  <div style={{ ...styles.chipWrap, marginTop: '12px' }}>
                    {items.length === 0 ? (
                      <span style={styles.emptyChip}>No items yet</span>
                    ) : items.map(it => (
                      <span key={it.id} style={styles.chip} onClick={() => { setDetailItem(it); setDetailCatName(cat.name); }}>
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
                {preset.sources && <div style={styles.presetSources}>{preset.sources}</div>}
                <div style={styles.chipWrap}>
                  {preset.items.map((it, i) => (
                    <span key={i} style={styles.chip} onClick={() => { setDetailItem(it); setDetailCatName(preset.name); }}>
                      <span style={{ ...styles.chipDot, background: it.color }} />
                      {it.name}
                    </span>
                  ))}
                </div>
                <div style={{ marginTop: '16px' }}>
                  <button style={adopted ? styles.adoptedBtn : styles.adoptBtn} onClick={() => adoptPreset(preset)}>
                    {adopted ? '\u2713 Adopted \u2014 add again' : '+ Adopt'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </PageBody>

      {builderOpen && (
        <BuilderModal initialCategory={editingCat}
          initialItems={editingCat ? patterns.filter(p => p.categoryId === editingCat.id) : []}
          onClose={() => { setBuilderOpen(false); setEditingCat(null); }} onSave={handleBuilderSave} />
      )}

      {detailItem && (
        <ItemDetailModal item={detailItem} categoryName={detailCatName} onClose={() => setDetailItem(null)} />
      )}
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
  presetBlurb: { fontSize: '11px', color: '#8BAFC8', lineHeight: 1.5, marginBottom: '8px', fontStyle: 'italic' },
  presetSources: { fontSize: '9px', color: '#6E8BA0', lineHeight: 1.5, marginBottom: '14px' },
  chipWrap: { display: 'flex', flexWrap: 'wrap', gap: '8px' },
  chip: { display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 10px', borderRadius: '12px', background: 'rgba(142,196,224,0.06)', border: '1px solid rgba(142,196,224,0.15)', fontSize: '11px', color: '#D8E6F0', cursor: 'pointer' },
  chipDot: { width: '9px', height: '9px', borderRadius: '50%', flexShrink: 0 },
  emptyChip: { fontSize: '11px', color: '#8BAFC8', fontStyle: 'italic' },
  addBtn: { background: 'rgba(142,196,224,0.15)', border: '1px solid rgba(142,196,224,0.4)', borderRadius: '3px', padding: '10px 20px', color: '#8EC4E0', fontSize: '11px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer', whiteSpace: 'nowrap' },
  adoptBtn: { background: 'rgba(142,196,224,0.15)', border: '1px solid rgba(142,196,224,0.4)', borderRadius: '3px', padding: '8px 18px', color: '#8EC4E0', fontSize: '10px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer' },
  adoptedBtn: { background: 'none', border: '1px solid rgba(74,174,136,0.3)', borderRadius: '3px', padding: '8px 18px', color: '#4AAE88', fontSize: '10px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer' },
  smallBtn: { background: 'none', border: '1px solid rgba(142,196,224,0.2)', borderRadius: '2px', padding: '4px 10px', color: '#8BAFC8', fontSize: '10px', cursor: 'pointer' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 200, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', overflowY: 'auto', padding: '40px 20px' },
  modal: { background: '#162534', border: '1px solid rgba(142,196,224,0.3)', borderRadius: '4px', width: '100%', maxWidth: '560px', padding: '32px', boxShadow: '0 0 40px rgba(0,0,0,0.6)', margin: 'auto' },
  x: { background: 'none', border: 'none', color: '#8BAFC8', cursor: 'pointer', fontSize: '18px' },
  fieldLabel: { fontSize: '10px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', color: '#8BAFC8', marginBottom: '8px' },
  miniLabel: { fontSize: '9px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', color: '#8BAFC8', marginBottom: '6px' },
  input: { width: '100%', background: '#0f2236', border: '1px solid rgba(142,196,224,0.2)', borderRadius: '3px', padding: '10px 14px', color: '#D8E6F0', fontSize: '14px', outline: 'none', boxSizing: 'border-box' },
  itemsEmpty: { fontSize: '12px', color: '#8BAFC8', fontStyle: 'italic', padding: '12px 0' },
  itemBlock: { padding: '14px', border: '1px solid rgba(142,196,224,0.15)', borderRadius: '3px', background: 'rgba(142,196,224,0.02)', marginBottom: '12px' },
  removeItemBtn: { background: 'none', border: '1px solid rgba(176,90,90,0.3)', borderRadius: '2px', padding: '6px 10px', color: '#C87878', fontSize: '10px', cursor: 'pointer', whiteSpace: 'nowrap' },
  addItemBtn: { background: 'none', border: '1px dashed rgba(142,196,224,0.3)', borderRadius: '3px', padding: '10px', color: '#8EC4E0', fontSize: '11px', cursor: 'pointer', width: '100%', marginBottom: '8px' },
  modalFooter: { display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgba(142,196,224,0.15)' },
  cancelBtn: { background: 'none', border: '1px solid rgba(142,196,224,0.2)', borderRadius: '3px', padding: '10px 20px', color: '#8BAFC8', fontSize: '11px', cursor: 'pointer' },
  confirmBtn: { background: 'rgba(142,196,224,0.15)', border: '1px solid rgba(142,196,224,0.4)', borderRadius: '3px', padding: '10px 24px', color: '#8EC4E0', fontSize: '11px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase' },
};

export default Patterns;