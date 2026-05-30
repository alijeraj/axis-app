import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Page, AppHeader, PageBody } from '../components/Layout';

const API = 'https://axis-backend-production-5e9b.up.railway.app';

// Fixed dopamine database (per-unit AUC). Auto-generated from AXIS_Dopamine_Database.
const DB_DYS = [
  { name: 'Methamphetamine', category: 'Substance', unit: '1 dose (10-30mg)', auc: 8000, tier: 'firsthand' },
  { name: 'Amphetamine', category: 'Substance', unit: '1 dose (~20mg)', auc: 4000, tier: 'firsthand' },
  { name: 'MDMA', category: 'Substance', unit: '1 pill (~100mg)', auc: 2800, tier: 'secondhand' },
  { name: 'Morphine / Opioids', category: 'Substance', unit: '1 dose (10mg morphine eq)', auc: 540, tier: 'firsthand' },
  { name: 'Cocaine', category: 'Substance', unit: '1 line (~30-50mg)', auc: 400, tier: 'firsthand' },
  { name: 'Alcohol', category: 'Substance', unit: '1 standard drink', auc: 368, tier: 'firsthand' },
  { name: 'THC', category: 'Substance', unit: '0.5g / 1 joint', auc: 350, tier: 'estimate' },
  { name: 'Porn', category: 'Digital', unit: '30 min session', auc: 300, tier: 'estimate' },
  { name: 'Gambling', category: 'Behavioral', unit: '30 min session', auc: 200, tier: 'estimate' },
  { name: 'Fatty / Fried Food', category: 'Food', unit: '1 meal', auc: 155, tier: 'firsthand' },
  { name: 'Video Games', category: 'Digital', unit: '30 min', auc: 150, tier: 'estimate' },
  { name: 'Caffeine', category: 'Substance', unit: '1 cup of coffee', auc: 150, tier: 'firsthand' },
  { name: 'Social Media / Doomscrolling', category: 'Digital', unit: '30 min', auc: 130, tier: 'estimate' },
  { name: 'Binge-Watching', category: 'Digital', unit: '30 min', auc: 120, tier: 'estimate' },
  { name: 'Processed Sugar', category: 'Food', unit: '1 snack (~30g sugar)', auc: 80, tier: 'firsthand' },
  { name: 'Nicotine', category: 'Substance', unit: '1 cigarette', auc: 51, tier: 'firsthand' },
];
const DB_REG = [
  { name: 'Hiking', category: 'Behavioral', unit: '3h outing', auc: 700, tier: 'estimate' },
  { name: 'Cold Exposure / Ice Bath', category: 'Behavioral', unit: '1 immersion (3-10 min)', auc: 500, tier: 'estimate' },
  { name: 'Running / Jogging', category: 'Behavioral', unit: '30 min', auc: 360, tier: 'firsthand' },
  { name: 'Strength Training', category: 'Behavioral', unit: '30 min', auc: 300, tier: 'estimate' },
  { name: 'Yoga', category: 'Behavioral', unit: '30 min', auc: 280, tier: 'estimate' },
  { name: 'High Impact Sports', category: 'Behavioral', unit: '1h', auc: 250, tier: 'estimate' },
  { name: 'Matcha', category: 'Nutrient', unit: '1 cup (~50mg L-theanine)', auc: 195, tier: 'estimate' },
  { name: 'Walking', category: 'Behavioral', unit: '30 min', auc: 180, tier: 'estimate' },
  { name: 'Meditation', category: 'Behavioral', unit: '15 min', auc: 165, tier: 'firsthand' },
  { name: 'Green Tea', category: 'Nutrient', unit: '1 cup (~15mg L-theanine)', auc: 158, tier: 'estimate' },
  { name: 'Black Tea', category: 'Nutrient', unit: '1 cup (~5mg L-theanine)', auc: 150, tier: 'estimate' },
  { name: 'Low Impact Sports', category: 'Behavioral', unit: '1h', auc: 140, tier: 'estimate' },
  { name: 'Breathing Exercises', category: 'Behavioral', unit: '10 min', auc: 125, tier: 'estimate' },
];

const MULTIPLIERS = [
  { key: 'occasional', label: 'Occasional', value: 1.0 },
  { key: 'regular', label: 'Regular', value: 0.5 },
  { key: 'heavy', label: 'Heavy', value: 0.25 },
];

const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const todayKey = () => {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
};

// ---------- Add-habit picker ----------
function AddHabitModal({ side, existingNames, onAdd, onClose }) {
  const [query, setQuery] = useState('');
  const list = side === 'D' ? DB_DYS : DB_REG;
  const filtered = list.filter(e =>
    e.name.toLowerCase().includes(query.toLowerCase()) && !existingNames.has(e.name)
  );
  const accent = side === 'D' ? '#C87878' : '#4AAE88';
  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div style={{ fontFamily: 'Georgia, serif', fontSize: '20px', fontWeight: '300', color: '#D8E6F0' }}>
            Add {side === 'D' ? 'Dysregulating' : 'Regulating'} Habit
          </div>
          <button style={styles.x} onClick={onClose}>✕</button>
        </div>
        <input
          style={styles.input}
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search…"
          autoFocus
        />
        <div style={{ marginTop: '12px', maxHeight: '340px', overflowY: 'auto' }}>
          {filtered.length === 0 && <div style={{ fontSize: '12px', color: '#8BAFC8', fontStyle: 'italic', padding: '16px', textAlign: 'center' }}>Nothing left to add.</div>}
          {filtered.map(e => (
            <div key={e.name} style={styles.pickRow} onClick={() => onAdd(e)}>
              <div>
                <div style={{ fontSize: '14px', color: '#D8E6F0' }}>{e.name}</div>
                <div style={{ fontSize: '10px', color: '#8BAFC8', marginTop: '2px' }}>{e.unit} · {e.category}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '15px', fontFamily: 'Georgia, serif', color: accent }}>{e.auc}</span>
                <span style={{ fontSize: '8px', color: '#8BAFC8', textTransform: 'uppercase', letterSpacing: '1px' }}>{e.tier}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function InfoModal({ onClose }) {
  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button style={styles.x} onClick={onClose}>✕</button>
        </div>

        <h3 style={styles.infoHead}>How It Works</h3>
        <p style={styles.infoP}>
          Every substance and behavior triggers a dopamine response with two dimensions: <em>peak</em> (how high it spikes) and <em>duration</em> (how long it lasts). Multiply them and you get the <strong style={styles.infoStrong}>AUC index</strong>, the dopamine load from a single use.
        </p>
        <p style={styles.infoP}>
          Your usage level decides how strongly your receptors still respond. Someone who rarely uses something feels close to the full spike (Occasional, 100%). A heavy daily user feels only a fraction (Heavy, 25%). Chronic use has downregulated their receptors, so it's the same cigarette for far less reward.
        </p>

        <h3 style={styles.infoHead}>The Logic</h3>
        <p style={styles.infoP}>
          A dysregulated system is always seeking dopamine. Think of it as a currency the brain spends trying to feel balanced, and you can earn it through compulsive habits or through healthy ones. Compulsive behaviors spike high but fade fast; healthy behaviors give a gentler rise that lasts much longer. The Behavior Log shows you, in one number, which way your day leans.
        </p>

        <h3 style={styles.infoHead}>The Formula</h3>
        <div style={styles.infoFormula}>Daily load = AUC × Quantity × Receptor multiplier</div>
        <ul style={styles.infoList}>
          <li style={styles.infoLi}><strong style={styles.infoStrong}>AUC</strong>: fixed per item</li>
          <li style={styles.infoLi}><strong style={styles.infoStrong}>Quantity</strong>: units you log per day</li>
          <li style={styles.infoLi}><strong style={styles.infoStrong}>Receptor multiplier</strong>: Occasional (100%) / Regular (50%) / Heavy (25%)</li>
        </ul>
      </div>
    </div>
  );
}

function CBM() {
  const navigate = useNavigate();
  const token = localStorage.getItem('axis_token');
  const [habits, setHabits] = useState([]);     // {id,name,side,auc,unit,tier,quantity,multiplier}
  const [todayLog, setTodayLog] = useState({}); // habitId -> quantity for today
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(null);   // 'D' | 'R' | null
  const [showInfo, setShowInfo] = useState(false);
  const [logStatus, setLogStatus] = useState(''); // '', 'saving', 'saved', 'error'
  const [loggedToday, setLoggedToday] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get(`${API}/api/cbm`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.data && Array.isArray(res.data.habits)) {
          setHabits(res.data.habits);
          if (res.data.todayLog && res.data.todayLogDate === todayKey()) {
            setTodayLog(res.data.todayLog);
          }
        }
        const logRes = await axios.get(`${API}/api/cbm-log`, { headers: { Authorization: `Bearer ${token}` } });
        const arr = Array.isArray(logRes.data) ? logRes.data : [];
        const k = todayKey();
        setLoggedToday(arr.some(e => {
          if (!e || !e.date || typeof e.dTotal !== 'number') return false;
          const d = new Date(e.date);
          return (d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')) === k;
        }));
      } catch (err) { console.log(err); }
      finally { setLoading(false); }
    };
    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const persist = async (nextHabits, nextLog) => {
    const payload = { habits: nextHabits, todayLog: nextLog, todayLogDate: todayKey() };
    await axios.post(`${API}/api/cbm`, { data: payload }, { headers: { Authorization: `Bearer ${token}` } });
  };

  const addHabit = (entry, side) => {
    const h = { id: newId(), name: entry.name, side, auc: entry.auc, unit: entry.unit, tier: entry.tier, quantity: 1, multiplier: 1.0 };
    const next = [...habits, h];
    setHabits(next);
    persist(next, todayLog);
    setAdding(null);
  };

  const updateHabit = (id, field, val) => {
    const next = habits.map(h => h.id === id ? { ...h, [field]: val } : h);
    setHabits(next);
    persist(next, todayLog);
  };

  const removeHabit = (id) => {
    const next = habits.filter(h => h.id !== id);
    const nextLog = { ...todayLog }; delete nextLog[id];
    setHabits(next); setTodayLog(nextLog);
    persist(next, nextLog);
  };

  const setQty = (id, qty) => {
    const nextLog = { ...todayLog, [id]: qty };
    setTodayLog(nextLog);
    persist(habits, nextLog);
  };

  const resetDay = () => {
    if (!window.confirm('Reset all quantities to 0? Your habits and Usage settings stay.')) return;
    const nextLog = {};
    habits.forEach(h => { nextLog[h.id] = 0; });
    setTodayLog(nextLog);
    persist(habits, nextLog);
  };

  // load for a habit today = auc * quantity(today, default its saved quantity) * multiplier
  const qtyFor = (h) => (todayLog[h.id] !== undefined ? todayLog[h.id] : h.quantity);
  const loadFor = (h) => Math.round(h.auc * qtyFor(h) * (h.side === 'D' ? h.multiplier : 1));

  const dHabits = habits.filter(h => h.side === 'D');
  const rHabits = habits.filter(h => h.side === 'R');
  const dTotal = dHabits.reduce((a, h) => a + loadFor(h), 0);
  const rTotal = rHabits.reduce((a, h) => a + loadFor(h), 0);
  const score = rTotal - dTotal;

  const logToday = async () => {
    setLogStatus('saving');
    const k = todayKey();
    const items = habits
      .filter(h => qtyFor(h) > 0)
      .map(h => ({ name: h.name, side: h.side, load: loadFor(h) }));
    const entry = { date: new Date(k + 'T12:00:00').toISOString(), dTotal, rTotal, score, items };
    try {
      let existing = [];
      try {
        const res = await axios.get(`${API}/api/cbm-log`, { headers: { Authorization: `Bearer ${token}` } });
        if (Array.isArray(res.data)) {
          // keep only valid new-shape entries that aren't today
          existing = res.data.filter(e => {
            if (!e || !e.date || typeof e.dTotal !== 'number') return false;
            const d = new Date(e.date);
            const ek = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
            return ek !== k;
          });
        }
      } catch (e) { existing = []; }
      await axios.post(`${API}/api/cbm-log`, { data: [...existing, entry] }, { headers: { Authorization: `Bearer ${token}` } });
      navigate('/cbmresults');
    } catch (err) {
      console.log(err);
      setLogStatus('error');
      setTimeout(() => setLogStatus(''), 3000);
    }
  };

  if (loading) return <div style={{ color: '#8BAFC8', padding: '48px', textAlign: 'center' }}>Loading...</div>;

  const existingD = new Set(dHabits.map(h => h.name));
  const existingR = new Set(rHabits.map(h => h.name));

  const HabitRow = ({ h }) => {
    const accent = h.side === 'D' ? '#C87878' : '#4AAE88';
    const multIdx = MULTIPLIERS.findIndex(m => m.value === h.multiplier);
    const curMult = multIdx >= 0 ? MULTIPLIERS[multIdx] : MULTIPLIERS[0];
    const cycleMult = () => {
      const next = MULTIPLIERS[(multIdx + 1) % MULTIPLIERS.length];
      updateHabit(h.id, 'multiplier', next.value);
    };
    return (
      <div style={styles.habitRow}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '13px', color: '#D8E6F0' }}>{h.name}</div>
          <div style={{ fontSize: '9px', color: '#8BAFC8', marginTop: '2px' }}>{h.auc}/unit · {h.unit}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {/* Quantity */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
            <span style={styles.fieldTag}>Qty</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button style={styles.stepBtn} onClick={() => setQty(h.id, Math.max(0, qtyFor(h) - 1))}>−</button>
              <span style={{ minWidth: '22px', textAlign: 'center', fontSize: '14px', color: '#D8E6F0' }}>{qtyFor(h)}</span>
              <button style={styles.stepBtn} onClick={() => setQty(h.id, qtyFor(h) + 1)}>+</button>
            </div>
          </div>
          {/* Usage / receptor multiplier — dysregulating only; tap to cycle */}
          {h.side === 'D' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
              <span style={styles.fieldTag}>Usage</span>
              <button style={styles.usageBtn} onClick={cycleMult}>
                {curMult.label} · {Math.round(curMult.value * 100)}%
              </button>
            </div>
          )}
          {/* Load */}
          <span style={{ minWidth: '54px', textAlign: 'right', fontSize: '15px', fontFamily: 'Georgia, serif', color: accent }}>{loadFor(h)}</span>
          {/* Remove */}
          <button style={styles.removeBtn} onClick={() => removeHabit(h.id)}>✕</button>
        </div>
      </div>
    );
  };

  return (
    <Page>
      <AppHeader
        title="Behavior Log"
      />
      <PageBody width="content">

        {/* SCORE DASHBOARD */}
        <div style={styles.dash}>
          <div style={styles.dashCol}>
            <div style={{ ...styles.dashLabel, color: '#C87878' }}>Dysregulated</div>
            <div style={{ ...styles.dashNum, color: '#C87878' }}>{dTotal}</div>
            <div style={styles.dashSub}>AUC load</div>
          </div>
          <div style={styles.dashCol}>
            <div style={{ ...styles.dashLabel, color: '#4AAE88' }}>Regulated</div>
            <div style={{ ...styles.dashNum, color: '#4AAE88' }}>{rTotal}</div>
            <div style={styles.dashSub}>AUC load</div>
          </div>
          <div style={{ ...styles.dashCol, borderLeft: '1px solid rgba(142,196,224,0.15)' }}>
            <div style={{ ...styles.dashLabel, color: '#8EC4E0' }}>Score</div>
            <div style={{ ...styles.dashNum, color: score >= 0 ? '#4AAE88' : '#C87878' }}>{score >= 0 ? '+' : ''}{score}</div>
            <div style={styles.dashSub}>R − D</div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
          <button style={styles.infoTrigger} onClick={() => setShowInfo(true)}>
            <span style={styles.infoTriggerIcon}>i</span> How it works
          </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '32px' }}>
          <button style={styles.logBtn} onClick={logToday}>
            {logStatus === 'saving' ? 'Saving…' : logStatus === 'error' ? 'Failed — retry' : loggedToday ? 'Update Today' : 'Log Today'}
          </button>
          {loggedToday && (
            <button style={styles.resultsBtn} onClick={() => navigate('/cbmresults')}>View Today's Results</button>
          )}
          <button style={styles.resultsBtn} onClick={() => navigate('/progress?tab=behavior')}>View Progress</button>
        </div>

        {/* TWO COLUMNS */}
        <div style={styles.cols}>
          <div>
            <div style={styles.colHead}>
              <span style={{ color: '#C87878' }}>Dysregulating</span>
              <button style={styles.addBtn} onClick={() => setAdding('D')}>+ Add</button>
            </div>
            {dHabits.length === 0 ? <div style={styles.emptyCol}>No dysregulating habits yet.</div> : dHabits.map(h => <HabitRow key={h.id} h={h} />)}
          </div>
          <div>
            <div style={styles.colHead}>
              <span style={{ color: '#4AAE88' }}>Regulating</span>
              <button style={styles.addBtn} onClick={() => setAdding('R')}>+ Add</button>
            </div>
            {rHabits.length === 0 ? <div style={styles.emptyCol}>No regulating habits yet.</div> : rHabits.map(h => <HabitRow key={h.id} h={h} />)}
          </div>
        </div>

        {habits.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '36px' }}>
            <button style={styles.resetBtn} onClick={resetDay}>Reset Day</button>
          </div>
        )}

      </PageBody>

      {showInfo && <InfoModal onClose={() => setShowInfo(false)} />}

      {adding && (
        <AddHabitModal
          side={adding}
          existingNames={adding === 'D' ? existingD : existingR}
          onAdd={(entry) => addHabit(entry, adding)}
          onClose={() => setAdding(null)}
        />
      )}
    </Page>
  );
}

const styles = {
  dash: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0', border: '1px solid rgba(142,196,224,0.5)', borderRadius: '4px', background: '#162534', padding: '24px', marginBottom: '20px', boxShadow: '0 0 24px rgba(142,196,224,0.12)' },
  dashCol: { textAlign: 'center', padding: '0 16px' },
  dashLabel: { fontSize: '10px', fontWeight: '600', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '8px' },
  dashNum: { fontFamily: 'Georgia, serif', fontSize: '40px', fontWeight: '300', lineHeight: 1 },
  dashSub: { fontSize: '10px', color: '#8BAFC8', marginTop: '6px' },
  logBtn: { background: 'rgba(142,196,224,0.15)', border: '1px solid rgba(142,196,224,0.4)', borderRadius: '3px', padding: '12px 32px', color: '#8EC4E0', fontSize: '11px', fontWeight: '600', letterSpacing: '3px', textTransform: 'uppercase', cursor: 'pointer' },
  resultsBtn: { background: 'none', border: '1px solid rgba(142,196,224,0.3)', borderRadius: '3px', padding: '12px 24px', color: '#8BAFC8', fontSize: '11px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer' },
  resetBtn: { background: 'none', border: '1px solid rgba(142,196,224,0.25)', borderRadius: '3px', padding: '11px 28px', color: '#8BAFC8', fontSize: '11px', fontWeight: '600', letterSpacing: '3px', textTransform: 'uppercase', cursor: 'pointer' },
  cols: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' },
  colHead: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '12px', marginBottom: '12px', borderBottom: '1px solid rgba(142,196,224,0.15)', fontSize: '11px', fontWeight: '600', letterSpacing: '3px', textTransform: 'uppercase' },
  addBtn: { background: 'none', border: '1px solid rgba(142,196,224,0.25)', borderRadius: '2px', padding: '4px 10px', color: '#8BAFC8', fontSize: '10px', cursor: 'pointer', letterSpacing: '1px' },
  emptyCol: { fontSize: '12px', color: '#8BAFC8', fontStyle: 'italic', padding: '20px', textAlign: 'center' },
  habitRow: { display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderBottom: '1px solid rgba(142,196,224,0.08)' },
  stepBtn: { background: 'rgba(142,196,224,0.08)', border: '1px solid rgba(142,196,224,0.2)', borderRadius: '2px', width: '24px', height: '24px', color: '#8EC4E0', fontSize: '14px', cursor: 'pointer', lineHeight: 1, padding: 0 },
  qtyInput: { width: '48px', background: '#0f2236', border: '1px solid rgba(142,196,224,0.2)', borderRadius: '3px', padding: '6px', color: '#D8E6F0', fontSize: '13px', textAlign: 'center', outline: 'none' },
  miniSelect: { background: '#0f2236', border: '1px solid rgba(142,196,224,0.2)', borderRadius: '3px', padding: '5px 6px', color: '#D8E6F0', fontSize: '11px', outline: 'none', cursor: 'pointer' },
  fieldTag: { fontSize: '8px', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase', color: '#8BAFC8' },
  usageBtn: { background: 'rgba(142,196,224,0.08)', border: '1px solid rgba(142,196,224,0.25)', borderRadius: '3px', padding: '5px 10px', color: '#8EC4E0', fontSize: '11px', cursor: 'pointer', whiteSpace: 'nowrap', letterSpacing: '0.5px' },
  removeBtn: { background: 'none', border: '1px solid rgba(176,90,90,0.3)', borderRadius: '2px', width: '24px', height: '24px', color: '#C87878', fontSize: '12px', cursor: 'pointer', padding: 0 },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 200, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', overflowY: 'auto', padding: '40px 20px' },
  modal: { background: '#162534', border: '1px solid rgba(142,196,224,0.3)', borderRadius: '4px', width: '100%', maxWidth: '480px', padding: '28px', boxShadow: '0 0 40px rgba(0,0,0,0.6)', margin: 'auto' },
  x: { background: 'none', border: 'none', color: '#8BAFC8', cursor: 'pointer', fontSize: '18px' },
  input: { width: '100%', background: '#0f2236', border: '1px solid rgba(142,196,224,0.2)', borderRadius: '3px', padding: '10px 14px', color: '#D8E6F0', fontSize: '14px', outline: 'none', boxSizing: 'border-box' },
  pickRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderBottom: '1px solid rgba(142,196,224,0.08)', cursor: 'pointer' },
  infoTrigger: { display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(142,196,224,0.06)', border: '1px solid rgba(142,196,224,0.3)', borderRadius: '20px', padding: '7px 16px', color: '#8EC4E0', fontSize: '10px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer' },
  infoTriggerIcon: { width: '15px', height: '15px', borderRadius: '50%', border: '1px solid rgba(142,196,224,0.5)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '10px', lineHeight: 1 },
  infoHead: { fontFamily: 'Georgia, serif', fontSize: '17px', fontWeight: '400', color: '#8EC4E0', margin: '18px 0 8px', letterSpacing: '0.5px' },
  infoP: { fontSize: '13px', lineHeight: 1.7, color: '#B3C9DA', margin: '0 0 12px' },
  infoStrong: { color: '#D8E6F0', fontWeight: '600' },
  infoFormula: { fontFamily: 'Georgia, serif', fontSize: '14px', color: '#D8E6F0', background: '#0f2236', border: '1px solid rgba(142,196,224,0.2)', borderRadius: '3px', padding: '12px 14px', textAlign: 'center', margin: '4px 0 12px' },
  infoList: { margin: '4px 0 0', paddingLeft: '18px' },
  infoLi: { fontSize: '13px', lineHeight: 1.7, color: '#B3C9DA', marginBottom: '6px' },
};

export default CBM;