import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = 'https://axis-backend-production-5e9b.up.railway.app';

const EMOTION_ORDER = ['Fear', 'Guilt', 'Shame', 'Anger', 'Envy', 'Grief'];

const EMOTION_COLORS = {
  Fear:  { bg: 'rgba(101,67,33,0.35)',   border: 'rgba(139,90,43,0.6)',   text: '#C8A87A' },
  Guilt: { bg: 'rgba(180,150,0,0.25)',   border: 'rgba(210,180,0,0.5)',   text: '#D4C060' },
  Shame: { bg: 'rgba(180,80,0,0.28)',    border: 'rgba(210,100,0,0.5)',   text: '#E8955A' },
  Anger: { bg: 'rgba(176,40,40,0.28)',   border: 'rgba(200,60,60,0.5)',   text: '#E08080' },
  Envy:  { bg: 'rgba(100,40,160,0.28)',  border: 'rgba(130,60,190,0.5)',  text: '#B07ED4' },
  Grief: { bg: 'rgba(180,100,120,0.25)', border: 'rgba(200,130,145,0.5)', text: '#D4A0B0' },
};

const TREE_COLORS = {
  Fear:  { bg: 'rgba(139,90,60,0.15)',   border: 'rgba(139,90,60,0.5)',   dot: '#8B5A3C' },
  Guilt: { bg: 'rgba(180,160,60,0.15)',  border: 'rgba(180,160,60,0.5)',  dot: '#B4A03C' },
  Shame: { bg: 'rgba(200,120,50,0.15)',  border: 'rgba(200,120,50,0.5)',  dot: '#C87832' },
  Anger: { bg: 'rgba(176,90,90,0.15)',   border: 'rgba(176,90,90,0.5)',   dot: '#B05A5A' },
  Envy:  { bg: 'rgba(130,90,180,0.15)',  border: 'rgba(130,90,180,0.5)',  dot: '#825AB4' },
  Grief: { bg: 'rgba(160,120,130,0.15)', border: 'rgba(160,120,130,0.5)', dot: '#A07882' },
};
const DEFAULT_TREE_COLORS = { bg: 'rgba(107,163,200,0.08)', border: 'rgba(107,163,200,0.3)', dot: '#6BA3C8' };

const BTF_COLORS = {
  Fear:  { bg: 'rgba(139,90,60,0.1)',   border: 'rgba(139,90,60,0.4)',   dot: '#8B5A3C',  label: '#8B5A3C' },
  Guilt: { bg: 'rgba(180,160,60,0.1)',  border: 'rgba(180,160,60,0.4)',  dot: '#B4A03C',  label: '#B4A03C' },
  Shame: { bg: 'rgba(200,120,50,0.1)',  border: 'rgba(200,120,50,0.4)',  dot: '#C87832',  label: '#C87832' },
  Anger: { bg: 'rgba(176,90,90,0.1)',   border: 'rgba(176,90,90,0.4)',   dot: '#B05A5A',  label: '#B05A5A' },
  Envy:  { bg: 'rgba(130,90,180,0.1)',  border: 'rgba(130,90,180,0.4)',  dot: '#825AB4',  label: '#825AB4' },
  Grief: { bg: 'rgba(160,120,130,0.1)', border: 'rgba(160,120,130,0.4)', dot: '#A07882',  label: '#A07882' },
};
const DEFAULT_BTF = { bg: 'rgba(107,163,200,0.06)', border: 'rgba(107,163,200,0.2)', dot: '#6BA3C8', label: '#6BA3C8' };

const ArrowLeft = () => (
  <span style={{ fontSize: '10px', color: '#5A7A94', marginLeft: '6px' }}>← <span style={{ fontStyle: 'italic', fontWeight: 400, letterSpacing: '1px', textTransform: 'none' }}>emotional input</span></span>
);
const ArrowRight = () => (
  <span style={{ fontSize: '10px', color: '#5A7A94', marginLeft: '6px' }}>→ <span style={{ fontStyle: 'italic', fontWeight: 400, letterSpacing: '1px', textTransform: 'none' }}>emotional output</span></span>
);

// Guided builder sequences — exactly from HTML
const SEQUENCES = {
  trigger:   ['name','trigger','behaviors','thoughts','feelings','beliefs','burden','counter','counterBehavior'],
  behaviors: ['name','behaviors','trigger','thoughts','feelings','beliefs','burden','counter','counterBehavior'],
  burden:    ['name','burden','beliefs','thoughts','feelings','behaviors','trigger','counter','counterBehavior'],
  beliefs:   ['name','beliefs','thoughts','feelings','behaviors','trigger','burden','counter','counterBehavior'],
};

const STEP_CONFIGS = {
  name: {
    label: 'Name',
    q: 'Give this pattern a name.',
    hint: 'A name you will recognize. It can be simple.',
    type: 'input',
  },
  trigger: {
    label: 'Trigger',
    q: 'What triggered you? Describe what happened.',
    hint: 'It can be a situation, a word, a moment — whatever activated this.',
    type: 'textarea',
  },
  behaviors: {
    label: 'Behavior',
    q: 'How are you acting or reacting when this complex is triggered?',
    hint: 'What are you doing, avoiding, or compelled toward?',
    type: 'textarea',
  },
  thoughts: {
    label: 'Thoughts',
    q: 'What thoughts are arising?',
    hint: 'What is the mind saying? Follow the thread.',
    type: 'textarea',
  },
  feelings: {
    label: 'Feelings',
    q: 'What do you feel as these thoughts arise?',
    hint: 'Optional. Name the felt sense — not the thought, not the action. The raw feeling.',
    type: 'textarea',
    optional: true,
  },
  beliefs: {
    label: 'Beliefs',
    q: 'What do you believe when this pattern is active?',
    hint: 'Write it in the first person. What feels true in this moment?',
    type: 'textarea',
  },
  burden: {
    label: 'Underlying Emotional Burden',
    q: 'What is the underlying emotion at the root of this?',
    hint: 'This is the emotional wound the complex is built around.',
    type: 'select',
  },
  counter: {
    label: 'Counter Belief',
    q: 'What else could also be true?',
    hint: 'Optional. Give this belief an honest opposing voice.',
    type: 'textarea',
    optional: true,
  },
  counterBehavior: {
    label: 'Counter Behavior',
    q: 'When that counter belief is active, how do you act differently?',
    hint: 'Optional. The conscious alternative to your pattern.',
    type: 'textarea',
    optional: true,
  },
};

const ENTRY_POINTS = [
  { id: 'trigger',   label: 'Trigger',   desc: 'Something just happened. I know what set this off.' },
  { id: 'burden',    label: 'Emotion',   desc: 'I can name the emotion that is present right now.' },
  { id: 'behaviors', label: 'Behavior',  desc: 'I can see how I am acting or reacting right now.' },
  { id: 'beliefs',   label: 'Belief',    desc: 'I am aware of a deep rooted belief I carry.' },
];

// Guided Builder Component
function GuidedBuilder({ onSave, onCancel, editData }) {
  const [phase, setPhase] = useState('entry'); // 'entry' | 'steps'
  const [entryPoint, setEntryPoint] = useState(null);
  const [sequence, setSequence] = useState([]);
  const [stepIdx, setStepIdx] = useState(0);
  const [data, setData] = useState(editData || {});

  const selectEntry = (id) => {
    setEntryPoint(id);
    setSequence(SEQUENCES[id]);
    setStepIdx(0);
    setPhase('steps');
  };

  const currentKey = sequence[stepIdx];
  const cfg = STEP_CONFIGS[currentKey] || {};
  const isLast = stepIdx === sequence.length - 1;

  const handleNext = () => {
    if (isLast) {
      onSave({ ...data, status: data.status || 'active', originalWound: data.originalWound || false });
    } else {
      setStepIdx(stepIdx + 1);
    }
  };

  const handleBack = () => {
    if (stepIdx === 0) {
      setPhase('entry');
      setEntryPoint(null);
    } else {
      setStepIdx(stepIdx - 1);
    }
  };

  if (phase === 'entry') {
    return (
      <div>
        <div style={{ fontFamily: 'Georgia, serif', fontSize: '26px', fontWeight: '300', color: '#D8E6F0', marginBottom: '32px' }}>Where are you right now?</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '8px' }}>
          {ENTRY_POINTS.map(ep => (
            <button
              key={ep.id}
              style={{ background: 'rgba(107,163,200,0.04)', border: '1px solid rgba(107,163,200,0.2)', borderRadius: '3px', padding: '18px 16px', textAlign: 'left', cursor: 'pointer', transition: 'all 0.15s' }}
              onClick={() => selectEntry(ep.id)}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(107,163,200,0.5)'; e.currentTarget.style.background = 'rgba(107,163,200,0.08)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(107,163,200,0.2)'; e.currentTarget.style.background = 'rgba(107,163,200,0.04)'; }}
            >
              <div style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', color: '#6BA3C8', marginBottom: '6px' }}>{ep.label}</div>
              <div style={{ fontSize: '13px', color: '#5A7A94', lineHeight: 1.5 }}>{ep.desc}</div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Progress */}
      <div style={{ fontSize: '9px', fontWeight: '600', letterSpacing: '3px', textTransform: 'uppercase', color: '#5A7A94', marginBottom: '20px' }}>
        {stepIdx + 1} of {sequence.length}
      </div>

      {/* Step label */}
      <div style={{ fontSize: '9px', fontWeight: '600', letterSpacing: '3px', textTransform: 'uppercase', color: cfg.optional ? '#5A7A94' : '#6BA3C8', marginBottom: '8px' }}>
        {cfg.label}{cfg.optional && <span style={{ marginLeft: '8px', fontStyle: 'italic', fontWeight: 400 }}>optional</span>}
      </div>

      {/* Question */}
      <div style={{ fontFamily: 'Georgia, serif', fontSize: '20px', fontWeight: '300', color: '#D8E6F0', lineHeight: 1.5, marginBottom: '20px' }}>{cfg.q}</div>

      {/* Input */}
      {cfg.type === 'input' && (
        <input
          style={styles.input}
          value={data[currentKey] || ''}
          onChange={e => setData({ ...data, [currentKey]: e.target.value })}
          placeholder="..."
          autoFocus
          onKeyDown={e => { if (e.key === 'Enter') handleNext(); }}
        />
      )}
      {cfg.type === 'textarea' && (
        <textarea
          style={{ ...styles.textarea, minHeight: '100px' }}
          value={data[currentKey] || ''}
          onChange={e => setData({ ...data, [currentKey]: e.target.value })}
          placeholder="..."
          autoFocus
          rows={4}
        />
      )}
      {cfg.type === 'select' && (
        <select style={styles.input} value={data[currentKey] || ''} onChange={e => setData({ ...data, [currentKey]: e.target.value })} autoFocus>
          <option value="">-- Select the emotion --</option>
          {EMOTION_ORDER.map(e => <option key={e} value={e}>{e}</option>)}
          <option value="unsure">I'm not sure</option>
        </select>
      )}

      {/* Hint */}
      <div style={{ fontSize: '11px', color: 'rgba(107,163,200,0.5)', marginTop: '10px', fontStyle: 'italic' }}>{cfg.hint}</div>

      {/* Nav */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '32px', paddingTop: '20px', borderTop: '1px solid rgba(107,163,200,0.1)' }}>
        <button style={styles.cancelBtn} onClick={handleBack}>{stepIdx === 0 ? 'Entry Point' : 'Back'}</button>
        <button style={styles.btn} onClick={handleNext}>
          {isLast ? 'Save to Map' : 'Next →'}
        </button>
      </div>
    </div>
  );
}

// View Modal
function ViewModal({ complex, onClose, onEdit }) {
  if (!complex) return null;
  const c = complex;
  const hasCounter = c.counter && c.counter.trim();
  const hasCounterBehavior = c.counterBehavior && c.counterBehavior.trim();
  const W = 220; const CW = 180; const GAP = 16;

  const Arrow = ({ up, color }) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '28px' }}>
      {up && <div style={{ borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderBottom: `7px solid ${color || 'rgba(107,163,200,0.35)'}` }} />}
      <div style={{ width: '2px', flex: 1, background: color || 'rgba(107,163,200,0.35)' }} />
      {!up && <div style={{ borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: `7px solid ${color || 'rgba(107,163,200,0.35)'}` }} />}
    </div>
  );

  const FlowNode = ({ label, text, isBurden, isTrigger, isCounter }) => (
    <div style={{ border: `1px solid ${isCounter ? 'rgba(74,174,136,0.3)' : isBurden ? 'rgba(176,90,90,0.35)' : isTrigger ? 'rgba(200,168,80,0.3)' : 'rgba(107,163,200,0.2)'}`, borderRadius: '3px', padding: '12px 14px', background: isCounter ? 'rgba(74,174,136,0.06)' : isBurden ? 'rgba(176,90,90,0.08)' : isTrigger ? 'rgba(200,168,80,0.06)' : 'rgba(107,163,200,0.04)', width: '100%', boxSizing: 'border-box' }}>
      <div style={{ fontSize: '8px', fontWeight: '700', letterSpacing: '3px', textTransform: 'uppercase', color: isCounter ? '#4AAE88' : isBurden ? '#B05A5A' : isTrigger ? '#C8A840' : '#6BA3C8', marginBottom: '6px' }}>{label}</div>
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
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 200, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', overflowY: 'auto', padding: '40px 20px' }}>
      <div style={{ background: '#162534', border: '1px solid rgba(107,163,200,0.3)', borderRadius: '4px', width: '100%', maxWidth: '560px', padding: '32px', boxShadow: '0 0 40px rgba(0,0,0,0.6)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div>
            <div style={{ fontFamily: 'Georgia, serif', fontSize: '22px', fontWeight: '300', color: '#D8E6F0' }}>{c.name}</div>
            {c.originalWound && <span style={{ fontSize: '9px', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', color: '#C8A840', border: '1px dashed #C8A840', padding: '2px 7px', borderRadius: '2px' }}>Original Wound</span>}
          </div>
          <button style={{ background: 'none', border: 'none', color: '#5A7A94', cursor: 'pointer', fontSize: '18px' }} onClick={onClose}>✕</button>
        </div>
        <div style={{ overflowX: 'auto', paddingBottom: '8px', marginTop: '16px' }}>
          <Row main={<FlowNode label="Underlying Emotional Burden" text={c.burden || ''} isBurden />} counter={<div />} connector={<div />} />
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
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid rgba(107,163,200,0.15)' }}>
          <button style={styles.cancelBtn} onClick={onClose}>Close</button>
          <button style={styles.btn} onClick={onEdit}>Edit</button>
        </div>
      </div>
    </div>
  );
}

// Tree View
function TreeView({ complexes, onViewComplex }) {
  const viewportRef = useRef(null);
  const treeRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [panX, setPanX] = useState(20);
  const [panY, setPanY] = useState(20);
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const panStart = useRef({ x: 20, y: 20 });

  const NODE_W = 180; const NODE_H = 56; const H_GAP = 32; const V_GAP = 72;

  const nameToIdx = {};
  complexes.forEach((c, i) => { nameToIdx[c.name] = i; });

  const subtreeWidth = (node) => {
    if (node.children.length === 0) return NODE_W;
    let total = 0;
    node.children.forEach((child, i) => { total += subtreeWidth(child); if (i < node.children.length - 1) total += H_GAP; });
    return Math.max(NODE_W, total);
  };

  const assignPositions = (node, x, y) => {
    const sw = subtreeWidth(node);
    node.x = x + sw / 2 - NODE_W / 2;
    node.y = y;
    if (node.children.length > 0) {
      let cx = x;
      node.children.forEach(child => { const csw = subtreeWidth(child); assignPositions(child, cx, y + NODE_H + V_GAP); cx += csw + H_GAP; });
    }
  };

  const collectNodes = (node, arr) => { arr.push(node); node.children.forEach(c => collectNodes(c, arr)); };

  const buildNode = (name, visited = {}) => {
    if (visited[name]) return null;
    visited[name] = true;
    const children = [];
    complexes.forEach(c => {
      const roots = Array.isArray(c.rootComplex) ? c.rootComplex : (c.rootComplex ? [c.rootComplex] : []);
      if (roots.indexOf(name) !== -1 && !visited[c.name] && roots[0] === name) { const child = buildNode(c.name, visited); if (child) children.push(child); }
    });
    return { name, children };
  };

  const rootSet = {};
  const roots = [];
  complexes.forEach(c => {
    let cur = c;
    const visited = {};
    while (cur) {
      const curRoots = Array.isArray(cur.rootComplex) ? cur.rootComplex : (cur.rootComplex ? [cur.rootComplex] : []);
      if (curRoots.length === 0) break;
      if (visited[cur.name]) break;
      visited[cur.name] = true;
      const parent = complexes[nameToIdx[curRoots[0]]];
      if (parent) { cur = parent; } else break;
    }
    if (!rootSet[cur.name]) { rootSet[cur.name] = true; roots.push(cur.name); }
  });

  const trees = roots.map(rootName => {
    const tree = buildNode(rootName, {});
    if (!tree) return null;
    assignPositions(tree, 0, 0);
    const allNodes = [];
    collectNodes(tree, allNodes);
    let maxX = 0, maxY = 0;
    allNodes.forEach(n => { if (n.x + NODE_W > maxX) maxX = n.x + NODE_W; if (n.y + NODE_H > maxY) maxY = n.y + NODE_H; });
    return { tree, allNodes, W: maxX + 20, H: maxY + 20 };
  }).filter(Boolean);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const onMouseDown = (e) => { isDragging.current = true; dragStart.current = { x: e.clientX, y: e.clientY }; panStart.current = { x: panX, y: panY }; viewport.style.cursor = 'grabbing'; e.preventDefault(); };
    const onMouseMove = (e) => { if (!isDragging.current) return; setPanX(panStart.current.x + (e.clientX - dragStart.current.x)); setPanY(panStart.current.y + (e.clientY - dragStart.current.y)); };
    const onMouseUp = () => { isDragging.current = false; viewport.style.cursor = 'grab'; };
    const onWheel = (e) => {
      e.preventDefault();
      const rect = viewport.getBoundingClientRect();
      const mouseX = e.clientX - rect.left; const mouseY = e.clientY - rect.top;
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setScale(prev => {
        const newScale = Math.min(3, Math.max(0.2, prev + delta));
        setPanX(px => mouseX - (mouseX - px) * (newScale / prev));
        setPanY(py => mouseY - (mouseY - py) * (newScale / prev));
        return newScale;
      });
    };
    viewport.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    viewport.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      viewport.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      viewport.removeEventListener('wheel', onWheel);
    };
  }, [panX, panY]); // eslint-disable-line react-hooks/exhaustive-deps

  if (complexes.length === 0) return <div style={{ textAlign: 'center', padding: '48px', fontFamily: 'Georgia, serif', fontStyle: 'italic', color: '#5A7A94' }}>No complexes yet. Build your first complex to begin mapping.</div>;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        <button style={styles.treeCtrlBtn} onClick={() => setScale(s => Math.min(3, s + 0.2))}>+</button>
        <button style={styles.treeCtrlBtn} onClick={() => setScale(s => Math.max(0.2, s - 0.2))}>−</button>
        <button style={{ ...styles.treeCtrlBtn, fontSize: '9px', letterSpacing: '2px', padding: '0 12px' }} onClick={() => { setScale(1); setPanX(20); setPanY(20); }}>Fit</button>
        <span style={{ fontSize: '10px', color: '#5A7A94', letterSpacing: '2px' }}>{Math.round(scale * 100)}%</span>
      </div>
      <div ref={viewportRef} style={{ width: '100%', height: '600px', overflow: 'hidden', border: '1px solid rgba(107,163,200,0.1)', borderRadius: '3px', background: 'rgba(107,163,200,0.02)', cursor: 'grab', position: 'relative' }}>
        <div ref={treeRef} style={{ position: 'absolute', transformOrigin: '0 0', transform: `translate(${panX}px,${panY}px) scale(${scale})`, willChange: 'transform' }}>
          {trees.map((t, ti) => {
            const lines = [];
            const drawLines = (node) => {
              node.children.forEach(child => {
                const px = node.x + NODE_W / 2; const py = node.y + NODE_H;
                const cx = child.x + NODE_W / 2; const cy = child.y;
                const my = py + (cy - py) / 2;
                lines.push(`M${px},${py} L${px},${my} L${cx},${my} L${cx},${cy}`);
                drawLines(child);
              });
            };
            drawLines(t.tree);
            return (
              <div key={ti} style={{ marginBottom: '48px', position: 'relative', width: t.W, height: t.H }}>
                <svg style={{ position: 'absolute', top: 0, left: 0, width: t.W, height: t.H, overflow: 'visible' }}>
                  {lines.map((d, i) => <path key={i} d={d} fill="none" stroke="rgba(107,163,200,0.3)" strokeWidth="1.5" />)}
                </svg>
                {t.allNodes.map((node, ni) => {
                  const c = complexes[nameToIdx[node.name]];
                  const colors = (c && TREE_COLORS[c.burden]) || DEFAULT_TREE_COLORS;
                  const isWound = c && c.originalWound === true;
                  const resolved = c && c.status === 'resolved';
                  return (
                    <div key={ni} onClick={() => c && onViewComplex(nameToIdx[node.name])} style={{ position: 'absolute', left: node.x, top: node.y, width: NODE_W, height: NODE_H, border: `1px solid ${colors.border}`, borderLeft: `3px solid ${colors.border}`, background: colors.bg, borderRadius: '3px', padding: '8px 12px', cursor: 'pointer', boxSizing: 'border-box', overflow: 'hidden' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                        <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: colors.dot, flexShrink: 0 }} />
                        <span style={{ fontSize: '12px', fontWeight: '600', color: '#D8E6F0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', opacity: resolved ? 0.6 : 1, textDecoration: resolved ? 'line-through' : 'none' }}>{node.name}</span>
                        {isWound && <span style={{ color: '#C8A840', fontSize: '13px', flexShrink: 0 }}>◉</span>}
                      </div>
                      {c && c.burden && <div style={{ fontSize: '8px', letterSpacing: '2px', textTransform: 'uppercase', color: colors.dot, marginLeft: '13px' }}>{c.burden}</div>}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// BTF View
function BTFView({ complexes }) {
  const active = complexes.filter(c => c.status !== 'resolved');
  if (active.length === 0) return <div style={{ textAlign: 'center', padding: '48px', fontFamily: 'Georgia, serif', fontStyle: 'italic', color: '#5A7A94' }}>No active complexes yet. Build your first complex to begin.</div>;
  const groups = {};
  active.forEach(c => { const b = c.burden || 'Other'; if (!groups[b]) groups[b] = []; groups[b].push(c); });
  const orderedBurdens = [...EMOTION_ORDER.filter(b => groups[b]), ...Object.keys(groups).filter(b => !EMOTION_ORDER.includes(b))];
  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <div style={{ fontFamily: 'Georgia, serif', fontSize: '22px', fontWeight: '300', color: '#D8E6F0', marginBottom: '4px' }}>BTF Map</div>
        <div style={{ fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', color: '#5A7A94' }}>Beliefs · Thoughts · Feelings, extracted from {active.length} active complex{active.length === 1 ? '' : 'es'}</div>
      </div>
      {orderedBurdens.map(burden => {
        const group = groups[burden];
        if (!group) return null;
        const colors = BTF_COLORS[burden] || DEFAULT_BTF;
        return (
          <div key={burden} style={{ marginBottom: '40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', paddingBottom: '10px', borderBottom: `1px solid ${colors.border}` }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: colors.dot }} />
              <div style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '4px', textTransform: 'uppercase', color: colors.label }}>{burden}</div>
              <div style={{ fontSize: '10px', color: '#5A7A94' }}>{group.length} complex{group.length === 1 ? '' : 'es'}</div>
            </div>
            {group.map((c, i) => {
              const hasContent = (c.beliefs && c.beliefs.trim()) || (c.thoughts && c.thoughts.trim()) || (c.feelings && c.feelings.trim());
              if (!hasContent) return null;
              return (
                <div key={i} style={{ marginBottom: '20px', padding: '16px 20px', border: `1px solid ${colors.border}`, borderRadius: '3px', background: colors.bg }}>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: '#D8E6F0', letterSpacing: '1px', marginBottom: '14px', paddingBottom: '10px', borderBottom: '1px solid rgba(107,163,200,0.1)' }}>{c.name}</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                    {['beliefs', 'thoughts', 'feelings'].map(field => (
                      <div key={field}>
                        <div style={{ fontSize: '8px', fontWeight: '700', letterSpacing: '3px', textTransform: 'uppercase', color: '#6BA3C8', marginBottom: '8px' }}>{field.charAt(0).toUpperCase() + field.slice(1)}</div>
                        {c[field] && c[field].trim() ? <div style={{ fontSize: '13px', color: '#8BAFC8', fontFamily: 'Georgia, serif', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{c[field]}</div> : <div style={{ fontSize: '12px', color: '#5A7A94', fontStyle: 'italic' }}>—</div>}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

function CPM() {
  const navigate = useNavigate();
  const token = localStorage.getItem('axis_token');
  const [complexes, setComplexes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('emotion');
  const [filter, setFilter] = useState('active');
  const [showBuilder, setShowBuilder] = useState(false);
  const [builderMode, setBuilderMode] = useState('guided'); // 'guided' | 'custom'
  const [editIdx, setEditIdx] = useState(null);
  const [viewIdx, setViewIdx] = useState(null);
  const [form, setForm] = useState({
    name: '', burden: '', beliefs: '', thoughts: '',
    feelings: '', behaviors: '', trigger: '',
    counter: '', counterBehavior: '', notes: '',
    status: 'active', originalWound: false
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadComplexes(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadComplexes = async () => {
    try {
      const res = await axios.get(`${API}/api/complexes`, { headers: { Authorization: `Bearer ${token}` } });
      setComplexes(res.data || []);
    } catch (err) { console.log(err); }
    finally { setLoading(false); }
  };

  const saveComplex = async (data) => {
    const payload = data || form;
    if (!payload.name || !payload.name.trim()) return;
    setSaving(true);
    try {
      let updated;
      if (editIdx !== null) { updated = [...complexes]; updated[editIdx] = payload; }
      else { updated = [...complexes, { ...payload }]; }
      await axios.post(`${API}/api/complexes`, { data: updated }, { headers: { Authorization: `Bearer ${token}` } });
      setComplexes(updated);
      closeBuilder();
    } catch (err) { console.log(err); }
    finally { setSaving(false); }
  };

  const deleteComplex = async (idx) => {
    const name = complexes[idx]?.name || 'this complex';
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    const updated = complexes.filter((_, i) => i !== idx);
    await axios.post(`${API}/api/complexes`, { data: updated }, { headers: { Authorization: `Bearer ${token}` } });
    setComplexes(updated);
    if (viewIdx === idx) setViewIdx(null);
  };

  const toggleStatus = async (idx, status) => {
    const updated = [...complexes];
    updated[idx] = { ...updated[idx], status };
    await axios.post(`${API}/api/complexes`, { data: updated }, { headers: { Authorization: `Bearer ${token}` } });
    setComplexes(updated);
  };

  const openBuilder = (idx = null) => {
    if (idx !== null) {
      setForm({ ...complexes[idx] });
      setEditIdx(idx);
      setBuilderMode('custom'); // edits always go to custom
    } else {
      setForm({ name: '', burden: '', beliefs: '', thoughts: '', feelings: '', behaviors: '', trigger: '', counter: '', counterBehavior: '', notes: '', status: 'active', originalWound: false });
      setEditIdx(null);
      setBuilderMode('guided');
    }
    setShowBuilder(true);
  };

  const closeBuilder = () => { setShowBuilder(false); setEditIdx(null); };

  const groups = {};
  EMOTION_ORDER.forEach(e => { groups[e] = []; });
  const filtered = complexes.filter(c => {
    if (filter === 'active') return c.status === 'active';
    if (filter === 'resolved') return c.status === 'resolved';
    return true;
  });
  filtered.forEach(c => {
    const realIdx = complexes.indexOf(c);
    const b = c.burden ? (c.burden.charAt(0).toUpperCase() + c.burden.slice(1)) : null;
    const key = b && groups[b] !== undefined ? b : null;
    if (key) groups[key].push({ ...c, _idx: realIdx });
  });

  if (loading) return <div style={{ color: '#5A7A94', padding: '48px', textAlign: 'center' }}>Loading...</div>;

  if (showBuilder) {
    const isEdit = editIdx !== null;
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <button style={styles.backBtn} onClick={closeBuilder}>← Cancel</button>
          <div style={styles.title}>{isEdit ? 'Edit Complex' : 'Build Complex'}</div>
        </div>
        <div style={{ maxWidth: '700px', margin: '0 auto', padding: '40px 32px' }}>

          {/* Mode tabs — only show when not editing */}
          {!isEdit && (
            <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid rgba(107,163,200,0.15)', marginBottom: '36px' }}>
              {['guided', 'custom'].map(m => (
                <button key={m} style={{ ...styles.tabBtn, ...(builderMode === m ? styles.tabBtnActive : {}) }} onClick={() => setBuilderMode(m)}>
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </button>
              ))}
            </div>
          )}

          {/* Guided mode */}
          {builderMode === 'guided' && !isEdit && (
            <GuidedBuilder
              onSave={saveComplex}
              onCancel={closeBuilder}
              editData={null}
            />
          )}

          {/* Custom mode */}
          {(builderMode === 'custom' || isEdit) && (
            <div style={styles.card}>
              {/* Name */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Name</label>
                <input style={styles.input} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Give this complex a name..." autoFocus />
              </div>

              {/* Underlying Emotional Burden */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Underlying Emotional Burden</label>
                <select style={styles.input} value={form.burden} onChange={e => setForm({ ...form, burden: e.target.value })}>
                  <option value="">-- Select burden --</option>
                  {EMOTION_ORDER.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>

              {/* Beliefs */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Beliefs <ArrowLeft /></label>
                <textarea style={styles.textarea} value={form.beliefs} onChange={e => setForm({ ...form, beliefs: e.target.value })} placeholder="What are beliefs you hold while this complex is active?" rows={3} />
              </div>

              {/* Thoughts */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Thoughts <ArrowLeft /></label>
                <textarea style={styles.textarea} value={form.thoughts} onChange={e => setForm({ ...form, thoughts: e.target.value })} placeholder="What thoughts go through your mind while this complex is active?" rows={3} />
              </div>

              {/* Feelings */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Feelings <ArrowLeft /></label>
                <textarea style={styles.textarea} value={form.feelings} onChange={e => setForm({ ...form, feelings: e.target.value })} placeholder="What do you feel while this complex is active?" rows={3} />
              </div>

              {/* Behaviors */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Behaviors <ArrowRight /></label>
                <textarea style={styles.textarea} value={form.behaviors} onChange={e => setForm({ ...form, behaviors: e.target.value })} placeholder="How do you act while this complex is active? What behaviors can you observe?" rows={3} />
              </div>

              {/* Trigger */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Trigger</label>
                <input style={styles.input} value={form.trigger} onChange={e => setForm({ ...form, trigger: e.target.value })} placeholder="What activates this complex?" />
              </div>

              {/* Counter Belief */}
              <div style={styles.formGroup}>
                <label style={{ ...styles.label, color: '#4AAE88' }}>Counter Belief</label>
                <textarea style={{ ...styles.textarea, borderColor: 'rgba(74,174,136,0.2)' }} value={form.counter} onChange={e => setForm({ ...form, counter: e.target.value })} placeholder="What else could also be true?" rows={3} />
              </div>

              {/* Counter Behavior */}
              <div style={styles.formGroup}>
                <label style={{ ...styles.label, color: '#4AAE88' }}>Counter Behavior</label>
                <textarea style={{ ...styles.textarea, borderColor: 'rgba(74,174,136,0.2)' }} value={form.counterBehavior} onChange={e => setForm({ ...form, counterBehavior: e.target.value })} placeholder="What would be alternative behaviors?" rows={3} />
              </div>

              {/* Notes */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Notes</label>
                <textarea style={styles.textarea} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Any additional observations..." rows={3} />
              </div>

              {/* Original Wound */}
              <div style={{ ...styles.woundToggle, ...(form.originalWound ? styles.woundActive : {}) }} onClick={() => setForm({ ...form, originalWound: !form.originalWound })}>
                <div style={{ ...styles.woundDot, ...(form.originalWound ? styles.woundDotActive : {}) }} />
                <div>
                  <div style={styles.woundLabel}>Original Wound</div>
                  <div style={styles.woundDesc}>Mark this complex as the origin — where the pattern first formed.</div>
                </div>
              </div>

              <div style={styles.formFooter}>
                <button style={styles.cancelBtn} onClick={closeBuilder}>Cancel</button>
                <button style={styles.btn} onClick={() => saveComplex(form)} disabled={saving}>{saving ? 'Saving...' : 'Save to Map'}</button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {viewIdx !== null && (
        <ViewModal complex={complexes[viewIdx]} onClose={() => setViewIdx(null)} onEdit={() => { openBuilder(viewIdx); setViewIdx(null); }} />
      )}

      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate('/')}>← Home</button>
        <span style={styles.toolbarTitle}>Complex Pattern Map</span>
        <button style={styles.btn} onClick={() => openBuilder()}>+ Build Complex</button>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 32px 80px', width: '100%' }}>
        <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid rgba(107,163,200,0.15)', marginBottom: '24px' }}>
          {[{ id: 'emotion', label: 'By Emotion' }, { id: 'tree', label: 'Tree View' }, { id: 'btf', label: 'BTF' }].map(t => (
            <button key={t.id} style={{ ...styles.tabBtn, ...(tab === t.id ? styles.tabBtnActive : {}) }} onClick={() => setTab(t.id)}>{t.label}</button>
          ))}
        </div>

        {tab === 'emotion' && (
          <>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
              {['all', 'active', 'resolved'].map(f => (
                <button key={f} style={{ ...styles.filterTab, ...(filter === f ? styles.filterTabActive : {}) }} onClick={() => setFilter(f)}>
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
            {filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 24px', fontFamily: 'Georgia, serif', fontStyle: 'italic', color: '#5A7A94' }}>
                {filter === 'all' ? 'No complexes yet. Build your first complex pattern to begin mapping your inner world.' : `No ${filter} complexes.`}
              </div>
            ) : (
              EMOTION_ORDER.map(emotion => {
                const group = groups[emotion];
                if (!group || group.length === 0) return null;
                const col = EMOTION_COLORS[emotion];
                return (
                  <div key={emotion} style={{ marginBottom: '40px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '32px 0 16px' }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: col.text, flexShrink: 0 }} />
                      <span style={{ fontSize: '10px', fontWeight: '600', letterSpacing: '3px', textTransform: 'uppercase', color: col.text }}>{emotion}</span>
                      <div style={{ flex: 1, height: '1px', background: col.border, opacity: 0.4 }} />
                      <span style={{ fontSize: '10px', color: '#5A7A94' }}>{group.length} complex{group.length > 1 ? 'es' : ''}</span>
                    </div>
                    <div style={styles.complexGrid}>
                      {group.map(c => (
                        <div key={c._idx} style={{ ...styles.complexCard, borderLeftColor: col.border, background: col.bg, opacity: c.status === 'resolved' ? 0.45 : 1, ...(c.originalWound ? { borderStyle: 'dashed', borderLeftStyle: 'solid', borderWidth: '2px', borderLeftWidth: '3px' } : {}) }} onClick={(e) => { if (!e.target.closest('button')) setViewIdx(c._idx); }}>
                          <div style={styles.complexCardHeader}>
                            <div style={styles.complexCardName}>
                              {c.name}
                              {c.originalWound && <span style={{ color: '#C8A840', fontSize: '14px' }}> ◉</span>}
                            </div>
                            {c.originalWound && <span style={{ fontSize: '8px', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', color: col.text, border: `1px dashed ${col.border}`, padding: '2px 7px', borderRadius: '2px', whiteSpace: 'nowrap' }}>Original Wound</span>}
                          </div>
                          <div style={{ ...styles.cardBurden, color: col.text }}>{c.burden}</div>
                          <div style={styles.cardFooter}>
                            <button style={styles.smallBtn} onClick={e => { e.stopPropagation(); openBuilder(c._idx); }}>Edit</button>
                            {c.status === 'active'
                              ? <button style={styles.smallBtn} onClick={e => { e.stopPropagation(); toggleStatus(c._idx, 'resolved'); }}>Mark Resolved</button>
                              : <button style={styles.smallBtn} onClick={e => { e.stopPropagation(); toggleStatus(c._idx, 'active'); }}>Reopen</button>
                            }
                            <button style={{ ...styles.smallBtn, color: '#B05A5A', borderColor: 'rgba(176,90,90,0.3)', marginLeft: 'auto' }} onClick={e => { e.stopPropagation(); deleteComplex(c._idx); }}>Delete</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </>
        )}

        {tab === 'tree' && <TreeView complexes={complexes} onViewComplex={(idx) => setViewIdx(idx)} />}
        {tab === 'btf' && <BTFView complexes={complexes} />}
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', background: '#0d1b2a', display: 'flex', flexDirection: 'column' },
  header: { display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 32px', borderBottom: '1px solid rgba(107,163,200,0.15)', background: '#0f2236' },
  backBtn: { background: 'none', border: 'none', color: '#5A7A94', fontSize: '12px', fontWeight: '600', letterSpacing: '1px', cursor: 'pointer', padding: 0 },
  title: { fontFamily: 'Georgia, serif', fontSize: '24px', fontWeight: '300', color: '#D8E6F0', flex: 1 },
  toolbarTitle: { fontSize: '11px', fontWeight: '600', letterSpacing: '4px', textTransform: 'uppercase', color: '#5A7A94', flex: 1, textAlign: 'center' },
  btn: { background: 'rgba(107,163,200,0.15)', border: '1px solid rgba(107,163,200,0.4)', borderRadius: '3px', padding: '10px 20px', color: '#6BA3C8', fontSize: '11px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer' },
  tabBtn: { background: 'none', border: 'none', borderBottom: '2px solid transparent', padding: '12px 20px', color: '#5A7A94', fontSize: '10px', fontWeight: '600', letterSpacing: '3px', textTransform: 'uppercase', cursor: 'pointer', marginBottom: '-1px' },
  tabBtnActive: { color: '#D8E6F0', borderBottomColor: '#6BA3C8' },
  filterTab: { fontSize: '10px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', padding: '6px 16px', border: '1px solid rgba(107,163,200,0.2)', background: 'none', color: '#5A7A94', cursor: 'pointer', borderRadius: '2px' },
  filterTabActive: { background: 'rgba(107,163,200,0.1)', borderColor: 'rgba(107,163,200,0.5)', color: '#6BA3C8' },
  complexGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' },
  complexCard: { border: '1px solid rgba(107,163,200,0.1)', borderLeft: '3px solid', borderRadius: '3px', padding: '14px 16px', cursor: 'pointer', transition: 'opacity 0.2s' },
  complexCardHeader: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '6px' },
  complexCardName: { fontFamily: 'Georgia, serif', fontSize: '15px', fontWeight: '300', color: '#D8E6F0', lineHeight: 1.4 },
  cardBurden: { fontSize: '9px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px' },
  cardFooter: { display: 'flex', gap: '6px', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid rgba(107,163,200,0.08)' },
  smallBtn: { background: 'none', border: '1px solid rgba(107,163,200,0.2)', borderRadius: '2px', padding: '4px 10px', color: '#5A7A94', fontSize: '10px', cursor: 'pointer' },
  card: { background: '#162534', border: '1px solid rgba(107,163,200,0.15)', borderRadius: '4px', padding: '32px' },
  formGroup: { marginBottom: '20px' },
  label: { display: 'flex', alignItems: 'center', fontSize: '10px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', color: '#5A7A94', marginBottom: '8px' },
  input: { width: '100%', background: '#0f2236', border: '1px solid rgba(107,163,200,0.2)', borderRadius: '3px', padding: '10px 14px', color: '#D8E6F0', fontSize: '14px', outline: 'none', boxSizing: 'border-box' },
  textarea: { width: '100%', background: '#0f2236', border: '1px solid rgba(107,163,200,0.2)', borderRadius: '3px', padding: '10px 14px', color: '#D8E6F0', fontSize: '14px', outline: 'none', boxSizing: 'border-box', resize: 'vertical', fontFamily: 'inherit' },
  woundToggle: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', border: '1px solid rgba(200,168,80,0.2)', borderRadius: '3px', background: 'rgba(200,168,80,0.03)', cursor: 'pointer', marginBottom: '24px' },
  woundActive: { borderColor: 'rgba(200,168,80,0.5)', background: 'rgba(200,168,80,0.07)' },
  woundDot: { width: '16px', height: '16px', borderRadius: '50%', border: '2px solid rgba(200,168,80,0.4)', flexShrink: 0 },
  woundDotActive: { background: 'rgba(200,168,80,0.8)', borderColor: 'rgba(200,168,80,0.9)' },
  woundLabel: { fontSize: '9px', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(200,168,80,0.7)' },
  woundDesc: { fontSize: '11px', color: '#5A7A94', marginTop: '2px' },
  formFooter: { display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' },
  cancelBtn: { background: 'none', border: '1px solid rgba(107,163,200,0.2)', borderRadius: '3px', padding: '10px 20px', color: '#5A7A94', fontSize: '11px', cursor: 'pointer' },
  treeCtrlBtn: { background: 'none', border: '1px solid rgba(107,163,200,0.2)', color: '#5A7A94', cursor: 'pointer', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', borderRadius: '2px', padding: 0 },
};

export default CPM;