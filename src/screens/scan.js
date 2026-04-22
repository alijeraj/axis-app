import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = 'https://axis-backend-production-5e9b.up.railway.app';

const ISM_DIMS = [
  { id: 'attention', label: 'Attention', liberated: 'Focused',    burdened: 'Distracted',   questions: [
    { text: 'Can you direct your attention where you choose right now?', positive: true },
    { text: 'How fully is your attention available to what matters right now?', positive: true },
    { text: 'How free is your mind from distracting thoughts, past or future?', positive: true },
  ]},
  { id: 'location',  label: 'Location',  liberated: 'Presence',   burdened: 'Absence',      questions: [
    { text: 'Can you feel yourself present in your body?', positive: true },
    { text: 'Is your mind here in the now, or is it elsewhere?', positive: true },
    { text: 'Do you feel connected to what is happening around you right now?', positive: true },
  ]},
  { id: 'drive',     label: 'Drive',     liberated: 'Purposeful', burdened: 'Compulsive',   questions: [
    { text: 'Is your energy deployed towards meaningful and important tasks?', positive: true },
    { text: 'How purposefully is your energy directing itself right now?', positive: true },
    { text: 'Does your energy feel like it comes from intention, or from restlessness and anxiety?', positive: true },
  ]},
  { id: 'emotions',  label: 'Emotions',  liberated: 'Regulated',  burdened: 'Dysregulated', questions: [
    { text: 'How emotionally stable do you feel right now?', positive: true },
    { text: 'How calm and at ease do you feel right now?', positive: true },
    { text: 'How well are you able to hold your emotions without being swept away?', positive: true },
  ]},
];

const ESM_DIMS = [
  { id: 'fear',   label: 'Survival',   liberated: 'Secure',    burdened: 'Fear',   right: 'The right to feel safe', questions: [
    { text: 'How do you feel vs the uncertainties in your life right now?', positive: true },
    { text: 'How do you feel about your short term future?', positive: true },
    { text: 'Do you trust that life will provide what you need?', positive: true },
    { text: 'How safe and stable does your environment feel right now?', positive: true },
    { text: 'How settled does your nervous system feel in your daily life?', positive: true },
  ]},
  { id: 'guilt',  label: 'Action',     liberated: 'Free',      burdened: 'Guilt',  right: 'The right to autonomous expression', questions: [
    { text: 'How kind and compassionate is your internal dialog?', positive: true },
    { text: 'How at peace are you with your past actions and choices?', positive: true },
    { text: 'How free do you feel from any sense of debt toward others?', positive: true },
    { text: 'How freely do you move in your life?', positive: true },
    { text: 'How free do you feel from the expectations of others?', positive: true },
  ]},
  { id: 'shame',  label: 'Identity',   liberated: 'Empowered', burdened: 'Shame',  right: 'The right to be', questions: [
    { text: 'How much willpower do you have to accomplish what is necessary?', positive: true },
    { text: 'How worthy do you feel of the things you desire?', positive: true },
    { text: 'How confident do you feel in your own voice and presence?', positive: true },
    { text: 'How do you feel about who you are?', positive: true },
    { text: 'How comfortable are you being seen and known by others?', positive: true },
  ]},
  { id: 'anger',  label: 'Boundary',   liberated: 'At Peace',  burdened: 'Anger',  right: 'The right to be respected', questions: [
    { text: 'How much respect do you show to yourself?', positive: true },
    { text: 'How free do you feel from a victim mindset?', positive: true },
    { text: 'How free do you feel from the need for amends or justice from others?', positive: true },
    { text: 'How able are you to let go of those who have trespassed against you?', positive: true },
    { text: 'How calm and settled do you feel in your body right now?', positive: true },
  ]},
  { id: 'envy',   label: 'Comparison', liberated: 'Abundant',  burdened: 'Envy',   right: 'The right to be seen', questions: [
    { text: 'How enough do you feel just as you are right now?', positive: true },
    { text: 'How genuine is the joy you feel for others who are succeeding?', positive: true },
    { text: 'How secure do you feel in your own worth without needing to measure it against others?', positive: true },
    { text: 'How free do you feel from the need to prove yourself today?', positive: true },
    { text: 'How abundant does your life feel to you right now?', positive: true },
  ]},
  { id: 'grief',  label: 'Love',       liberated: 'Connected', burdened: 'Grief',  right: 'The right to love and be loved', questions: [
    { text: 'How whole and complete do you feel within yourself?', positive: true },
    { text: 'How full and alive does your inner world feel right now?', positive: true },
    { text: 'Can you genuinely connect with yourself?', positive: true },
    { text: 'Can you genuinely connect with others?', positive: true },
    { text: 'To which degree do you feel love on a day to day?', positive: true },
  ]},
];

function ScoreSlider({ value, onChange }) {
  const trackRef = React.useRef(null);
  const isDragging = React.useRef(false);

  const displayPct = ((-value + 5) / 10) * 100;
  const handleLeft = `${displayPct}%`;
  const color = value > 0 ? '#4AAE88' : value < 0 ? '#B05A5A' : '#6BA3C8';
  const borderColor = value > 0 ? '#4AAE88' : value < 0 ? '#B05A5A' : '#6BA3C8';
  const glow = value > 0 ? 'rgba(74,174,136,0.5)' : value < 0 ? 'rgba(176,90,90,0.5)' : 'rgba(107,163,200,0.4)';

  const applyPct = (clientX) => {
    const track = trackRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    let p = (clientX - rect.left) / rect.width;
    p = Math.max(0, Math.min(1, p));
    const raw = Math.round(5 - p * 10);
    onChange(raw);
  };

  React.useEffect(() => {
    const onMove = (e) => { if (isDragging.current) applyPct(e.touches ? e.touches[0].clientX : e.clientX); };
    const onUp = () => { isDragging.current = false; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fillStyle = value === 0
    ? { left: '45%', width: '10%', background: 'rgba(107,163,200,0.2)' }
    : value > 0
      ? { left: `${displayPct}%`, width: `${100 - displayPct}%`, background: 'rgba(74,174,136,0.5)' }
      : { left: '0%', width: `${displayPct}%`, background: 'rgba(176,90,90,0.5)' };

  return (
    <div style={{ padding: '8px 16px', minWidth: '180px' }}>
      <div
        ref={trackRef}
        style={{ position: 'relative', height: '10px', background: 'linear-gradient(to right, rgba(74,174,136,0.4), rgba(107,163,200,0.15) 50%, rgba(176,90,90,0.4))', borderRadius: '5px', cursor: 'pointer', border: '1px solid rgba(107,163,200,0.2)', margin: '8px 0' }}
        onMouseDown={(e) => { isDragging.current = true; applyPct(e.clientX); e.preventDefault(); }}
        onTouchStart={(e) => { isDragging.current = true; applyPct(e.touches[0].clientX); }}
        onClick={(e) => applyPct(e.clientX)}
      >
        <div style={{ position: 'absolute', top: 0, bottom: 0, borderRadius: '5px', pointerEvents: 'none', ...fillStyle }} />
        <div style={{ position: 'absolute', top: '50%', left: handleLeft, transform: 'translate(-50%, -50%)', width: '22px', height: '22px', borderRadius: '50%', background: '#1a2d3d', border: `2.5px solid ${borderColor}`, boxShadow: `0 0 8px ${glow}`, cursor: 'grab', zIndex: 2, pointerEvents: 'none' }} />
      </div>
      <div style={{ textAlign: 'center', fontFamily: 'Georgia, serif', fontSize: '28px', fontWeight: '300', color, marginTop: '8px', lineHeight: 1 }}>
        {value > 0 ? '+' : ''}{value}
      </div>
    </div>
  );
}

function QuestionnaireMode({ ismScores, esmScores, onIsmChange, onEsmChange, onComplete }) {
  const [phase, setPhase] = useState('ism');
  const [ismDimIdx, setIsmDimIdx] = useState(0);
  const [ismQIdx, setIsmQIdx] = useState(0);
  const [esmDimIdx, setEsmDimIdx] = useState(0);
  const [esmQIdx, setEsmQIdx] = useState(0);
  const [ismQAnswers, setIsmQAnswers] = useState({});
  const [esmQAnswers, setEsmQAnswers] = useState({});

  const calcDimScore = (dimId, answers, dims) => {
    const dim = dims.find(d => d.id === dimId);
    const vals = dim.questions.map((q, i) => {
      const v = answers[`${dimId}-${i}`];
      return v === undefined ? null : (q.positive ? v : -v);
    }).filter(v => v !== null);
    if (vals.length === 0) return 0;
    return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
  };

  if (phase === 'ism') {
    const dim = ISM_DIMS[ismDimIdx];
    const q = dim.questions[ismQIdx];
    const answerKey = `${dim.id}-${ismQIdx}`;
    const currentAnswer = ismQAnswers[answerKey];
    const isLastQ = ismQIdx === dim.questions.length - 1;
    const isLastDim = ismDimIdx === ISM_DIMS.length - 1;

    const handleAnswer = (val) => {
      const newAnswers = { ...ismQAnswers, [answerKey]: val };
      setIsmQAnswers(newAnswers);
      const dimScore = calcDimScore(dim.id, newAnswers, ISM_DIMS);
      onIsmChange({ ...ismScores, [dim.id]: dimScore });
    };

    const handleNext = () => {
      if (!isLastQ) { setIsmQIdx(ismQIdx + 1); }
      else if (!isLastDim) { setIsmDimIdx(ismDimIdx + 1); setIsmQIdx(0); }
      else { setPhase('esm'); }
    };

    return (
      <div style={styles.qWrap}>
        <div style={styles.qProgress}>ISM · Dimension {ismDimIdx + 1} of {ISM_DIMS.length} — Question {ismQIdx + 1} of {dim.questions.length}</div>
        <div style={styles.qDimHeader}>
          <span style={styles.qDimLabel}>{dim.label}</span>
          <span style={styles.qDimLib}>{dim.liberated}</span>
          <span style={styles.qVs}>vs</span>
          <span style={styles.qDimBur}>{dim.burdened}</span>
        </div>
        <div style={styles.qText}>{q.text}</div>
        <div style={{ marginBottom: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontSize: '11px', color: '#4AAE88', fontWeight: '600' }}>{dim.liberated}</span>
            <span style={{ fontSize: '11px', color: '#B05A5A', fontWeight: '600' }}>{dim.burdened}</span>
          </div>
          <ScoreSlider value={currentAnswer !== undefined ? currentAnswer : 0} onChange={v => handleAnswer(v)} />
        </div>
        <div style={styles.qNav}>
          {ismQIdx > 0 && <button style={styles.secondaryBtn} onClick={() => setIsmQIdx(ismQIdx - 1)}>Back</button>}
          {ismDimIdx > 0 && ismQIdx === 0 && <button style={styles.secondaryBtn} onClick={() => { setIsmDimIdx(ismDimIdx - 1); setIsmQIdx(ISM_DIMS[ismDimIdx - 1].questions.length - 1); }}>Back</button>}
          <div style={{ flex: 1 }} />
          <button style={styles.primaryBtn} onClick={handleNext} disabled={currentAnswer === undefined}>
            {isLastQ && isLastDim ? 'Continue to ESM →' : isLastQ ? 'Next Dimension →' : 'Next →'}
          </button>
        </div>
      </div>
    );
  }

  const dim = ESM_DIMS[esmDimIdx];
  const q = dim.questions[esmQIdx];
  const answerKey = `${dim.id}-${esmQIdx}`;
  const currentAnswer = esmQAnswers[answerKey];
  const isLastQ = esmQIdx === dim.questions.length - 1;
  const isLastDim = esmDimIdx === ESM_DIMS.length - 1;

  const handleAnswer = (val) => {
    const newAnswers = { ...esmQAnswers, [answerKey]: val };
    setEsmQAnswers(newAnswers);
    const dimScore = calcDimScore(dim.id, newAnswers, ESM_DIMS);
    onEsmChange({ ...esmScores, [dim.id]: dimScore });
  };

  const handleNext = () => {
    if (!isLastQ) { setEsmQIdx(esmQIdx + 1); }
    else if (!isLastDim) { setEsmDimIdx(esmDimIdx + 1); setEsmQIdx(0); }
    else { onComplete(); }
  };

  return (
    <div style={styles.qWrap}>
      <div style={styles.qProgress}>ESM · Dimension {esmDimIdx + 1} of {ESM_DIMS.length} — Question {esmQIdx + 1} of {dim.questions.length}</div>
      <div style={styles.qDimHeader}>
        <span style={styles.qDimLabel}>{dim.label}</span>
        <span style={styles.qDimLib}>{dim.liberated}</span>
        <span style={styles.qVs}>vs</span>
        <span style={styles.qDimBur}>{dim.burdened}</span>
      </div>
      <div style={styles.qText}>{q.text}</div>
      <div style={{ marginBottom: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span style={{ fontSize: '11px', color: '#4AAE88', fontWeight: '600' }}>{dim.liberated}</span>
          <span style={{ fontSize: '11px', color: '#B05A5A', fontWeight: '600' }}>{dim.burdened}</span>
        </div>
        <ScoreSlider value={currentAnswer !== undefined ? currentAnswer : 0} onChange={v => handleAnswer(v)} />
      </div>
      <div style={styles.qNav}>
        {esmQIdx > 0 && <button style={styles.secondaryBtn} onClick={() => setEsmQIdx(esmQIdx - 1)}>Back</button>}
        {esmDimIdx > 0 && esmQIdx === 0 && <button style={styles.secondaryBtn} onClick={() => { setEsmDimIdx(esmDimIdx - 1); setEsmQIdx(ESM_DIMS[esmDimIdx - 1].questions.length - 1); }}>Back</button>}
        <div style={{ flex: 1 }} />
        <button style={styles.primaryBtn} onClick={handleNext} disabled={currentAnswer === undefined}>
          {isLastQ && isLastDim ? 'Complete →' : isLastQ ? 'Next Dimension →' : 'Next →'}
        </button>
      </div>
    </div>
  );
}

function Scan() {
  const navigate = useNavigate();
  const token = localStorage.getItem('axis_token');
  const [mode, setMode] = useState('custom');
  const [ism, setIsm] = useState({ attention: 0, location: 0, drive: 0, emotions: 0 });
  const [esm, setEsm] = useState({ fear: 0, guilt: 0, shame: 0, anger: 0, envy: 0, grief: 0 });
  const [saving, setSaving] = useState(false);
  const [alreadyLogged, setAlreadyLogged] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [error, setError] = useState('');
  const [qComplete, setQComplete] = useState(false);

  const ismScore = Math.round((Object.values(ism).reduce((a, b) => a + b, 0) / 4) + 5);
  const esmScore = Math.round((Object.values(esm).reduce((a, b) => a + b, 0) / 6) + 5);
  const axisScore = Math.round((ismScore + esmScore) / 2);

  useEffect(() => {
    const checkToday = async () => {
      try {
        const res = await axios.get(`${API}/api/entries`, { headers: { Authorization: `Bearer ${token}` } });
        const today = new Date().toISOString().split('T')[0];
        if (res.data && res.data[today]) setAlreadyLogged(true);
      } catch (err) {
        console.log(err);
      }
    };
    checkToday();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const today = new Date().toISOString().split('T')[0];
      await axios.post(`${API}/api/entries`, {
        date: today,
        data: { ism, esm, ismScore, esmScore, axisScore }
      }, { headers: { Authorization: `Bearer ${token}` } });
      setAlreadyLogged(true);
      setJustSaved(true);
    } catch (err) {
      setError('Failed to save. Try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate('/')}>← Home</button>
        <span style={styles.screenTitle}>Scan</span>
      </div>

      <div style={styles.body}>
        <div style={styles.modeBar}>
          <button style={{ ...styles.modePill, ...(mode === 'custom' ? styles.modePillActive : {}) }} onClick={() => { setMode('custom'); setQComplete(false); }}>Custom</button>
          <button style={{ ...styles.modePill, ...(mode === 'questionnaire' ? styles.modePillActive : {}) }} onClick={() => { setMode('questionnaire'); setQComplete(false); }}>Questionnaire</button>
        </div>

        {mode === 'questionnaire' && !qComplete ? (
          <QuestionnaireMode
            ismScores={ism} esmScores={esm}
            onIsmChange={setIsm} onEsmChange={setEsm}
            onComplete={() => setQComplete(true)}
          />
        ) : (
          <>
            <div style={styles.dimHeader}>
              <span style={styles.badge}>ISM</span>
              <span style={styles.dimTitle}>Internal State Map</span>
              <span style={styles.dimSub}>Neurological Dimension</span>
            </div>
            <div style={styles.scanTable}>
              {ISM_DIMS.map(dim => (
                <div key={dim.id} style={styles.scanRow}>
                  <span style={styles.scanLabel}>{dim.label}</span>
                  <span style={styles.scanLib}>{dim.liberated}</span>
                  <span style={styles.scanVs}>vs</span>
                  <span style={styles.scanBur}>{dim.burdened}</span>
                  <ScoreSlider value={ism[dim.id]} onChange={v => setIsm({ ...ism, [dim.id]: v })} />
                </div>
              ))}
            </div>

            <div style={{ ...styles.dimHeader, marginTop: '48px' }}>
              <span style={{ ...styles.badge, color: '#B088D4', background: 'rgba(176,136,212,0.1)' }}>ESM</span>
              <span style={styles.dimTitle}>Emotional Spectrum Map</span>
              <span style={styles.dimSub}>Emotional Dimension</span>
            </div>
            <div style={styles.esmHeaders}>
              <span style={styles.esmHeaderCell}>Dimension</span>
              <span style={{ ...styles.esmHeaderCell, color: '#4AAE88', background: 'rgba(74,174,136,0.06)' }}>Liberated</span>
              <span style={styles.esmHeaderCell}></span>
              <span style={{ ...styles.esmHeaderCell, color: '#B05A5A', background: 'rgba(176,90,90,0.06)' }}>Burden</span>
              <span style={styles.esmHeaderCell}>Fundamental Right / Score</span>
            </div>
            <div style={styles.scanTable}>
              {ESM_DIMS.map(dim => (
                <div key={dim.id} style={styles.scanRow}>
                  <span style={styles.scanLabel}>{dim.label}</span>
                  <span style={styles.scanLib}>{dim.liberated}</span>
                  <span style={styles.scanVs}>vs</span>
                  <span style={styles.scanBur}>{dim.burdened}</span>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <ScoreSlider value={esm[dim.id]} onChange={v => setEsm({ ...esm, [dim.id]: v })} />
                    <span style={styles.esmRight}>{dim.right}</span>
                  </div>
                </div>
              ))}
            </div>

            <div style={styles.logRow}>
              <button style={styles.primaryBtn} onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : alreadyLogged ? "Re-Log Today's Entry" : "Log Today's Entry"}
              </button>
              {alreadyLogged && (
                <button style={styles.secondaryBtn} onClick={() => navigate('/results', { state: { origin: 'scan' } })}>
                  View Results →
                </button>
              )}
              {justSaved && <span style={styles.logSuccess}>✓ Entry logged</span>}
              {error && <span style={styles.error}>{error}</span>}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', background: '#0d1b2a', display: 'flex', flexDirection: 'column' },
  header: { display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 32px', borderBottom: '1px solid rgba(107,163,200,0.15)', background: '#0f2236' },
  backBtn: { background: 'none', border: 'none', color: '#5A7A94', fontSize: '12px', fontWeight: '600', letterSpacing: '1px', cursor: 'pointer', padding: 0 },
  screenTitle: { fontFamily: 'Georgia, serif', fontSize: '18px', fontWeight: '300', color: '#D8E6F0', letterSpacing: '2px' },
  body: { maxWidth: '960px', margin: '0 auto', padding: '40px 32px 80px', width: '100%' },
  modeBar: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px', padding: '16px 20px', border: '1px solid rgba(107,163,200,0.15)', background: '#0f2236' },
  modePill: { fontFamily: '-apple-system, sans-serif', fontSize: '10px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', padding: '8px 20px', border: '1px solid rgba(107,163,200,0.2)', background: 'none', color: '#5A7A94', cursor: 'pointer', borderRadius: '2px' },
  modePillActive: { borderColor: '#6BA3C8', background: 'rgba(107,163,200,0.1)', color: '#D8E6F0' },
  dimHeader: { display: 'flex', alignItems: 'baseline', gap: '16px', marginBottom: '16px', paddingBottom: '12px', borderBottom: '2px solid rgba(107,163,200,0.25)' },
  badge: { fontSize: '11px', fontWeight: '600', letterSpacing: '3px', color: '#6BA3C8', background: 'rgba(107,163,200,0.1)', padding: '5px 12px', borderRadius: '2px' },
  dimTitle: { fontFamily: 'Georgia, serif', fontSize: '22px', fontWeight: '300', color: '#D8E6F0' },
  dimSub: { fontSize: '10px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', color: '#5A7A94', marginLeft: 'auto' },
  scanTable: { borderTop: '1px solid rgba(107,163,200,0.15)' },
  scanRow: { display: 'grid', gridTemplateColumns: '140px 160px 32px 160px 1fr', alignItems: 'center', borderBottom: '1px solid rgba(107,163,200,0.1)', minHeight: '52px' },
  scanLabel: { fontSize: '11px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', color: '#8BAFC8', padding: '14px 12px 14px 0' },
  scanLib: { fontSize: '13px', fontWeight: '500', color: '#4AAE88', background: 'rgba(74,174,136,0.08)', padding: '14px', borderLeft: '2px solid rgba(74,174,136,0.2)' },
  scanVs: { fontSize: '9px', fontWeight: '600', letterSpacing: '2px', color: '#5A7A94', textAlign: 'center' },
  scanBur: { fontSize: '13px', fontWeight: '600', color: '#B05A5A', background: 'rgba(176,90,90,0.08)', padding: '14px', borderRight: '2px solid rgba(176,90,90,0.2)' },
  esmHeaders: { display: 'grid', gridTemplateColumns: '140px 160px 32px 160px 1fr', paddingBottom: '8px', marginBottom: '4px', borderBottom: '2px solid rgba(107,163,200,0.25)' },
  esmHeaderCell: { fontSize: '9px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', color: '#5A7A94', padding: '0 8px' },
  esmRight: { fontSize: '11px', fontStyle: 'italic', color: '#5A7A94', paddingLeft: '8px' },
  logRow: { marginTop: '40px', display: 'flex', alignItems: 'center', gap: '16px', paddingTop: '24px', borderTop: '1px solid rgba(107,163,200,0.15)' },
  primaryBtn: { background: 'rgba(107,163,200,0.15)', border: '1px solid rgba(107,163,200,0.4)', borderRadius: '3px', padding: '14px 32px', color: '#6BA3C8', fontSize: '11px', fontWeight: '600', letterSpacing: '3px', textTransform: 'uppercase', cursor: 'pointer' },
  secondaryBtn: { background: 'none', border: '1px solid rgba(107,163,200,0.3)', borderRadius: '3px', padding: '14px 24px', color: '#6BA3C8', fontSize: '11px', fontWeight: '600', letterSpacing: '2px', cursor: 'pointer' },
  logSuccess: { fontSize: '12px', color: '#4AAE88', letterSpacing: '2px' },
  error: { color: '#B05A5A', fontSize: '12px' },
  qWrap: { background: '#162534', border: '1px solid rgba(107,163,200,0.15)', borderRadius: '3px', padding: '40px', maxWidth: '600px' },
  qProgress: { fontSize: '9px', fontWeight: '600', letterSpacing: '3px', textTransform: 'uppercase', color: '#5A7A94', marginBottom: '20px' },
  qDimHeader: { display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid rgba(107,163,200,0.15)' },
  qDimLabel: { fontSize: '11px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', color: '#8BAFC8', minWidth: '100px' },
  qDimLib: { fontSize: '13px', color: '#4AAE88' },
  qVs: { fontSize: '9px', color: '#5A7A94' },
  qDimBur: { fontSize: '13px', color: '#B05A5A' },
  qText: { fontFamily: 'Georgia, serif', fontSize: '18px', fontWeight: '300', color: '#D8E6F0', lineHeight: 1.6, marginBottom: '32px' },
  qSlider: { display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' },
  qNav: { display: 'flex', alignItems: 'center', gap: '12px', marginTop: '24px' },
};

export default Scan;