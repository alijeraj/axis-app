import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ESM_DIMS = [
  { label: 'Survival',   liberated: 'Secure',    burden: 'Fear',   right: 'The right to feel safe' },
  { label: 'Action',     liberated: 'Free',       burden: 'Guilt',  right: 'The right to autonomous expression' },
  { label: 'Identity',   liberated: 'Empowered',  burden: 'Shame',  right: 'The right to be' },
  { label: 'Boundary',   liberated: 'At Peace',   burden: 'Anger',  right: 'The right to be respected' },
  { label: 'Comparison', liberated: 'Abundant',   burden: 'Envy',   right: 'The right to be seen' },
  { label: 'Love',       liberated: 'Connected',  burden: 'Grief',  right: 'The right to love and be loved' },
];

const CBM_LEVELS = [
  { label: 'Severe',   color: 'rgba(176,90,90,0.28)',  border: 'rgba(176,90,90,0.5)',   width: '32%', num: '5' },
  { label: 'Intense',  color: 'rgba(200,126,80,0.22)', border: 'rgba(200,126,80,0.4)',  width: '50%', num: '4' },
  { label: 'Moderate', color: 'rgba(155,126,200,0.2)', border: 'rgba(155,126,200,0.35)',width: '68%', num: '3' },
  { label: 'Low',      color: 'rgba(107,163,200,0.2)', border: 'rgba(107,163,200,0.35)',width: '85%', num: '2' },
  { label: 'Mild',     color: 'rgba(74,174,136,0.25)', border: 'rgba(74,174,136,0.4)',  width: '100%',num: '1' },
];

const Connector = () => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 0', gap: '4px' }}>
    <div style={{ width: '1px', height: '32px', background: 'rgba(107,163,200,0.25)' }} />
    <svg width="12" height="8" viewBox="0 0 12 8"><path d="M6 8 L0 0 L12 0 Z" fill="rgba(107,163,200,0.35)" /></svg>
  </div>
);

function PhilosophySection() {
  const p = { fontFamily: 'Georgia, serif', fontSize: '15px', color: '#6BA3C8', lineHeight: 1.9, marginBottom: '24px' };
  const pWrap = { maxWidth: '780px', marginBottom: '48px' };

  const nodeStyle = { border: '1px solid rgba(107,163,200,0.2)', borderLeft: '2px solid rgba(107,163,200,0.4)', background: '#162534', padding: '10px 16px', width: '260px', boxSizing: 'border-box', display: 'inline-flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' };
  const burdenStyle = { border: '1px solid rgba(176,90,90,0.3)', borderLeft: '2px solid rgba(176,90,90,0.6)', background: 'rgba(176,90,90,0.05)', padding: '10px 16px', width: '260px', boxSizing: 'border-box', display: 'inline-flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' };
  const counterStyle = { border: '1px solid rgba(74,174,136,0.25)', borderLeft: '2px solid rgba(74,174,136,0.5)', background: 'rgba(74,174,136,0.04)', padding: '10px 16px', width: '200px', boxSizing: 'border-box', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' };
  const labelStyle = { fontSize: '10px', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', color: '#D8E6F0', whiteSpace: 'nowrap' };
  const tagStyle = { fontSize: '11px', fontStyle: 'italic', color: '#5A7A94', whiteSpace: 'nowrap' };
  const counterLabelStyle = { fontSize: '10px', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', color: '#4AAE88', whiteSpace: 'nowrap' };

  const ArrD = () => (
    <>
      <div style={{ paddingLeft: '20px' }}><div style={{ width: '1px', height: '18px', background: 'rgba(107,163,200,0.35)' }} /></div>
      <div style={{ paddingLeft: '14px' }}><svg width="12" height="8" viewBox="0 0 12 8"><path d="M6 8 L0 0 L12 0 Z" fill="rgba(107,163,200,0.45)" /></svg></div>
    </>
  );
  const ArrU = () => (
    <>
      <div style={{ paddingLeft: '20px' }}><div style={{ width: '1px', height: '18px', background: 'rgba(107,163,200,0.35)' }} /></div>
      <div style={{ paddingLeft: '14px' }}><svg width="12" height="8" viewBox="0 0 12 8"><path d="M6 0 L0 8 L12 8 Z" fill="rgba(107,163,200,0.45)" /></svg></div>
    </>
  );
  const ConnH = () => (
    <div style={{ display: 'flex', alignItems: 'center', paddingLeft: '16px' }}>
      <svg width="48" height="12" viewBox="0 0 48 12">
        <line x1="0" y1="6" x2="43" y2="6" stroke="rgba(107,163,200,0.4)" strokeWidth="1.5" />
        <path d="M39 3 L44 6 L39 9" fill="none" stroke="rgba(107,163,200,0.4)" strokeWidth="1.5" />
      </svg>
    </div>
  );

  return (
    <div>
      {/* Opening */}
      <div style={pWrap}>
        <p style={p}>AXIS is an internal navigating system — a tool, a guide, a framework, a direction and a philosophy. It is intended to allow you to make profound self-discoveries and transformations. AXIS is an ecosystem of four conceptual models, each dealing with a different dimension: neurological, emotional, cognitive and behavioral. They interrelate and interconnect.</p>
      </div>

      <Connector />

      {/* ISM */}
      <div style={{ maxWidth: '780px', marginBottom: '48px' }}>
        <div style={{ fontSize: '9px', fontWeight: '600', letterSpacing: '3px', textTransform: 'uppercase', color: '#5A7A94', marginBottom: '12px' }}>Neurological Dimension</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', paddingBottom: '16px', marginBottom: '4px', borderBottom: '1px solid rgba(107,163,200,0.15)' }}>
          <span style={{ fontSize: '10px', fontWeight: '600', letterSpacing: '3px', color: '#6BA3C8', background: 'rgba(107,163,200,0.1)', padding: '4px 10px' }}>ISM</span>
          <span style={{ fontFamily: 'Georgia, serif', fontSize: '18px', fontWeight: '400', letterSpacing: '3px', textTransform: 'uppercase', color: '#D8E6F0' }}>Internal State Map</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0', borderBottom: '2px solid rgba(107,163,200,0.25)', paddingBottom: '8px', marginBottom: '4px' }}>
          <span style={{ fontSize: '9px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', color: '#4AAE88', background: 'rgba(74,174,136,0.08)', padding: '0 10px', textAlign: 'right' }}>Liberated</span>
          <span style={{ fontSize: '9px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', color: '#B05A5A', background: 'rgba(176,90,90,0.08)', padding: '0 10px' }}>Burdened</span>
        </div>
        {[
          { liberated: 'Focused', burden: 'Distracted', label: 'Attention' },
          { liberated: 'Presence', burden: 'Absence', label: 'Location' },
          { liberated: 'Purposeful', burden: 'Compulsive', label: 'Drive' },
          { liberated: 'Regulated', burden: 'Dysregulated', label: 'Emotions' },
        ].map(dim => (
          <div key={dim.label} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', alignItems: 'center', borderBottom: '1px solid rgba(107,163,200,0.1)', minHeight: '52px' }}>
            <span style={{ fontSize: '14px', fontWeight: '500', color: '#E8F4FF', background: 'rgba(74,174,136,0.2)', padding: '14px', textAlign: 'right' }}>{dim.liberated}</span>
            <span style={{ fontSize: '14px', fontWeight: '600', color: '#F0D8D8', background: 'rgba(176,90,90,0.2)', padding: '14px' }}>{dim.burden}</span>
          </div>
        ))}
        <p style={{ ...p, marginTop: '32px', marginBottom: 0 }}>The Internal State Map allows you to locate your operating mode on a spectrum of two main regions of the brain. When operating from the Prefrontal Cortex, you can mobilize resources of planning, decision-making, reasoning, problem solving, focus, memory and impulse control. When the Limbic System takes over, this region becomes overstimulated, causing emotional instability, mood swings, poor concentration and fatigue.</p>
        <p style={{ ...p, marginBottom: 0, marginTop: '24px' }}>When operating from the Limbic System, our emotional burdens come up to the surface. We feel the weight of the emotions we carry.</p>
      </div>

      <Connector />

      {/* ESM */}
      <div style={{ maxWidth: '780px', marginBottom: '16px' }}>
        <div style={{ fontSize: '9px', fontWeight: '600', letterSpacing: '3px', textTransform: 'uppercase', color: '#5A7A94', marginBottom: '12px' }}>Emotional Dimension</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', paddingBottom: '16px', marginBottom: '4px', borderBottom: '1px solid rgba(107,163,200,0.15)' }}>
          <span style={{ fontSize: '10px', fontWeight: '600', letterSpacing: '3px', color: '#B088D4', background: 'rgba(176,136,212,0.1)', padding: '4px 10px' }}>ESM</span>
          <span style={{ fontFamily: 'Georgia, serif', fontSize: '18px', fontWeight: '400', letterSpacing: '3px', textTransform: 'uppercase', color: '#D8E6F0' }}>Emotional Spectrum Map</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 160px 1fr 220px', paddingBottom: '8px', marginBottom: '4px', borderBottom: '2px solid rgba(107,163,200,0.25)' }}>
          <span style={{ fontSize: '9px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', color: '#4AAE88', background: 'rgba(74,174,136,0.08)', padding: '0 10px', textAlign: 'right' }}>Liberated</span>
          <span style={{ fontSize: '9px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', color: '#5A7A94', textAlign: 'center' }}>Dimension</span>
          <span style={{ fontSize: '9px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', color: '#B05A5A', background: 'rgba(176,90,90,0.08)', padding: '0 10px' }}>Burden</span>
          <span style={{ fontSize: '9px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', color: '#6BA3C8', padding: '0 10px' }}>Fundamental Right</span>
        </div>
        {ESM_DIMS.map(dim => (
          <div key={dim.label} style={{ display: 'grid', gridTemplateColumns: '1fr 160px 1fr 220px', alignItems: 'center', borderBottom: '1px solid rgba(107,163,200,0.1)', minHeight: '56px' }}>
            <span style={{ fontSize: '14px', fontWeight: '500', color: '#E8F4FF', background: 'rgba(74,174,136,0.3)', padding: '16px 14px', textAlign: 'right' }}>{dim.liberated}</span>
            <span style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#8BAFC8', padding: '16px 12px', textAlign: 'center' }}>{dim.label}</span>
            <span style={{ fontSize: '14px', fontWeight: '600', color: '#F0D8D8', background: 'rgba(176,90,90,0.3)', padding: '16px 14px' }}>{dim.burden}</span>
            <span style={{ fontFamily: 'Georgia, serif', fontSize: '13px', fontStyle: 'italic', color: '#6BA3C8', padding: '16px 10px' }}>{dim.right}</span>
          </div>
        ))}
        <div style={{ ...pWrap, marginTop: '32px' }}>
          <p style={p}>An emotional burden will create patterns of beliefs and thoughts that take input from the emotion, and a cycle of behaviors that act as the emotional output, as the dysregulated system attempts to find relief. These burdens are wounds we carry. They can also be transferred. A parent who humiliates a child burdens that child with their own shame. The child carries it. Later, the child goes to school and mocks their classmate, and now the classmate carries the weight.</p>
          <p style={p}>Not all emotions are burdens. When they serve their purpose, fear asking us to act in a dangerous situation, guilt calling us to modify a behavior that is hurtful to someone, these are signals. A complex is produced by a burden, never by a signal.</p>
          <p style={{ ...p, marginBottom: 0 }}>Each burden has a liberated counterpart. By untying the knots associated with an emotional burden, the burden can be lifted, and its liberated state progressively accessed.</p>
        </div>
      </div>

      <Connector />

      {/* CPM */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ fontSize: '9px', fontWeight: '600', letterSpacing: '3px', textTransform: 'uppercase', color: '#5A7A94', marginBottom: '12px' }}>Cognitive Dimension</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', paddingBottom: '16px', marginBottom: '32px', borderBottom: '1px solid rgba(107,163,200,0.15)' }}>
          <span style={{ fontSize: '10px', fontWeight: '600', letterSpacing: '3px', color: '#6BA3C8', background: 'rgba(107,163,200,0.1)', padding: '4px 10px' }}>CPM</span>
          <span style={{ fontFamily: 'Georgia, serif', fontSize: '18px', fontWeight: '400', letterSpacing: '3px', textTransform: 'uppercase', color: '#D8E6F0' }}>Complex Pattern Map</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', paddingLeft: '60px' }}>
          <div style={{ ...burdenStyle }}><span style={{ ...labelStyle, color: '#E08080' }}>Emotional Burden</span><span style={tagStyle}>the root wound</span></div>
          <ArrD />
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={nodeStyle}><span style={labelStyle}>Beliefs</span><span style={tagStyle}>emotional input</span></div>
            <ConnH />
            <div style={counterStyle}><span style={counterLabelStyle}>Counter Belief</span></div>
          </div>
          <ArrD />
          <div style={nodeStyle}><span style={labelStyle}>Thoughts</span><span style={tagStyle}>emotional input</span></div>
          <ArrD />
          <div style={nodeStyle}><span style={labelStyle}>Feelings</span><span style={tagStyle}>felt sense</span></div>
          <ArrD />
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={nodeStyle}><span style={labelStyle}>Behaviors</span><span style={tagStyle}>emotional output</span></div>
            <ConnH />
            <div style={counterStyle}><span style={counterLabelStyle}>Counter Behavior</span></div>
          </div>
          <ArrU />
          <div style={{ ...nodeStyle, borderColor: 'rgba(107,163,200,0.3)', borderLeftColor: 'rgba(107,163,200,0.6)' }}><span style={{ ...labelStyle, color: '#6BA3C8' }}>Trigger</span><span style={tagStyle}>activates upward</span></div>
        </div>
        <div style={{ ...pWrap, marginTop: '32px' }}>
          <p style={p}>The cognitive patterns that form as a result of emotional burdens are called complexes, psychological knots that create tension. A complex is a cluster that works in patterns, becoming repetitive. It has its emotional burden at the root. The beliefs and thoughts take the emotional input while the behavior is the emotional output. Each complex has its triggers that activate it.</p>
          <p style={{ ...p, marginBottom: 0 }}>Awareness is what allows a complex to dissolve. The art of mapping the complexes is what allows the transformation to happen.</p>
        </div>
      </div>

      <Connector />

      {/* CBM */}
      <div style={{ marginBottom: '48px' }}>
        <div style={{ fontSize: '9px', fontWeight: '600', letterSpacing: '3px', textTransform: 'uppercase', color: '#5A7A94', marginBottom: '12px' }}>Behavioral Dimension</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', paddingBottom: '16px', marginBottom: '32px', borderBottom: '1px solid rgba(107,163,200,0.15)' }}>
          <span style={{ fontSize: '10px', fontWeight: '600', letterSpacing: '3px', color: 'rgba(200,126,80,0.9)', background: 'rgba(200,126,80,0.1)', padding: '4px 10px' }}>CBM</span>
          <span style={{ fontFamily: 'Georgia, serif', fontSize: '18px', fontWeight: '400', letterSpacing: '3px', textTransform: 'uppercase', color: '#D8E6F0' }}>Compulsive Behavior Map</span>
        </div>
        <div style={{ fontSize: '9px', fontWeight: '600', letterSpacing: '3px', textTransform: 'uppercase', color: '#5A7A94', textAlign: 'center', marginBottom: '16px', opacity: 0.6 }}>Higher Dysregulation</div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', maxWidth: '600px', margin: '0 auto' }}>
          {CBM_LEVELS.map((lvl, i) => (
            <React.Fragment key={lvl.label}>
              <div style={{ width: lvl.width, background: lvl.color, border: `1px solid ${lvl.border}`, padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxSizing: 'border-box' }}>
                <span style={{ fontSize: '10px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)' }}>{lvl.label}</span>
                <span style={{ fontSize: '12px', fontWeight: '600', color: 'rgba(255,255,255,0.4)' }}>{lvl.num}</span>
              </div>
              {lvl.num !== '1' && <div style={{ width: lvl.width, height: '3px', background: `linear-gradient(to bottom, ${lvl.border}, transparent)`, boxSizing: 'border-box' }} />}
            </React.Fragment>
          ))}
        </div>
        <div style={{ fontSize: '9px', fontWeight: '600', letterSpacing: '3px', textTransform: 'uppercase', color: '#5A7A94', textAlign: 'center', marginTop: '16px', opacity: 0.6 }}>Lower Dysregulation</div>
        <div style={{ ...pWrap, marginTop: '32px' }}>
          <p style={{ ...p, marginBottom: 0 }}>Under dysregulation the system looks for an output, to relieve the tension. The higher the dysregulation, the higher the relief it will seek. The Compulsive Behavior Map allows you to place your behaviors on a hierarchy and to see the regulated version of yourself reflected back. For every compulsive behavior, there is an alternative.</p>
        </div>
      </div>

      {/* Closing */}
      <div style={{ paddingTop: '48px', borderTop: '1px solid rgba(107,163,200,0.15)', maxWidth: '780px' }}>
        <p style={{ fontFamily: 'Georgia, serif', fontSize: '16px', color: '#D8E6F0', lineHeight: 1.9, fontStyle: 'italic' }}>These four dimensions form one coherent system. The neurological state determines what emotional weight surfaces. The emotional weight generates the cognitive patterns. The cognitive patterns express themselves through behavior. Awareness of the behavior leads to the pattern. The pattern reveals the burden. Lifting the burden shifts the operating system. This is the full arc of AXIS.</p>
      </div>
    </div>
  );
}

function MethodologySection() {
  const p = { fontFamily: 'Georgia, serif', fontSize: '15px', color: '#6BA3C8', lineHeight: 1.9, marginBottom: '28px' };
  const mWrap = { maxWidth: '780px' };
  const Header = ({ children }) => (
    <div style={{ fontSize: '9px', fontWeight: '700', letterSpacing: '4px', textTransform: 'uppercase', color: '#5A7A94', marginBottom: '16px', marginTop: '48px', paddingTop: '48px', borderTop: '1px solid rgba(107,163,200,0.15)' }}>{children}</div>
  );

  return (
    <div style={mWrap}>
      <p style={p}>The purpose of AXIS is to allow you to map your inner world in order to understand yourself more deeply and make real transformation possible. The tools work together. None of them are complete alone.</p>

      <Header>The Daily Scan</Header>
      <p style={p}>Begin here every day. The scan takes a few minutes. It is not a mood log, it is a calibration. You are locating yourself on two spectrums: the neurological (ISM) and the emotional (ESM). The result is your AXIS score for the day.</p>
      <p style={p}>Over time, the scan reveals patterns that are invisible in the moment. These patterns do not announce themselves. They accumulate quietly and become visible only through consistent practice. Use Custom mode when you want speed and rely on your own felt sense. Use Questionnaire mode when you want objectivity, when you are unsure of your state and want the questions to surface it for you.</p>

      <Header>The Complex Pattern Map</Header>
      <p style={p}>The CPM is where the deepest work happens. Complexes can be built during dedicated introspective sessions, where you sit with yourself and consciously map the pattern. They can also emerge in real time, when something is lived, felt, or when you notice a behavior in yourself that troubles you. In those moments, the entry point method allows you to begin from wherever you have access, and let the rest reveal itself from there.</p>
      <p style={p}>The Original Wound deserves its own attention. When you write the counter belief for an Original Wound, you are not reframing a cognitive pattern. You are speaking to the version of yourself that formed the belief in the first place. Enter that space with care.</p>
      <p style={p}>The Tree View shows the genealogy of your complexes, how they connect, where they originated, how the same wound expressed itself through different people and different contexts across your life. The BTF Map extracts all beliefs, thoughts and feelings across your active complexes, organized by emotional burden. Seeing that architecture in one place is its own kind of revelation.</p>

      <Header>The Compulsive Behavior Map</Header>
      <p style={p}>Build your pyramid as a foundational mapping exercise. Place each behavior at the level that honestly reflects your experience. For each behavior, define its alternative, not a generic prescription, but a specific substitute that meets the same underlying need through a cleaner channel. The Regulated Self pyramid is the vision of yourself operating without compulsion. It is worth knowing what that looks like in concrete terms.</p>
      <p style={p}>Link each behavior to its complex. When you tap See Insight at a moment of impulse, the app shows you the pattern driving the behavior, its root, and the counter behavior you mapped. That is the intervention, the map reflected back to you in the moment you need it most.</p>

      <Header>The Dream Journal</Header>
      <p style={p}>Dreams carry the language of the unconscious. They often surface what the waking mind has not yet organized into language. Record the dream as close to waking as possible. The link between a dream and a complex is one of the most powerful connections in the app, it creates a bridge between what the unconscious reveals at night and the patterns being mapped in the waking mind.</p>

      <div style={{ paddingTop: '48px', borderTop: '1px solid rgba(107,163,200,0.15)', marginTop: '48px' }}>
        <p style={{ fontFamily: 'Georgia, serif', fontSize: '16px', color: '#D8E6F0', lineHeight: 1.9, fontStyle: 'italic', marginBottom: 0 }}>The practice does not require perfection. It requires honesty and return. The map keeps growing. The tree keeps branching. The patterns keep becoming visible. The inner world does not transform through a single insight. It transforms through accumulated awareness, applied over time.</p>
      </div>
    </div>
  );
}

function Tutorial() {
  const navigate = useNavigate();
  const [section, setSection] = useState(null);

  if (section) {
    const title = section === 'philosophy' ? 'Framework & Philosophy' : 'Application & Methodology';
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <button style={styles.backBtn} onClick={() => setSection(null)}>← Tutorial</button>
          <span style={styles.screenTitle}>{title}</span>
        </div>
        <div style={styles.body}>
          <div style={{ fontFamily: 'Georgia, serif', fontSize: '36px', fontWeight: '300', color: '#D8E6F0', marginBottom: '12px' }}>{title}</div>
          <div style={{ width: '48px', height: '2px', background: '#6BA3C8', marginBottom: '56px' }} />
          {section === 'philosophy' ? <PhilosophySection /> : <MethodologySection />}
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate('/')}>← Home</button>
        <span style={styles.screenTitle}>Tutorial</span>
      </div>
      <div style={styles.body}>
        <div style={{ fontFamily: 'Georgia, serif', fontSize: '42px', fontWeight: '300', color: '#D8E6F0', marginBottom: '12px' }}>Tutorial</div>
        <div style={{ fontSize: '13px', color: '#5A7A94', marginBottom: '48px', letterSpacing: '0.5px' }}>Two sections. One for the framework. One for the practice.</div>
        <div style={styles.grid}>
          <div style={styles.card} onClick={() => setSection('philosophy')}>
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" style={{ marginBottom: '20px', opacity: 0.8 }}>
              <circle cx="24" cy="10" r="6" stroke="#6BA3C8" strokeWidth="1.5" fill="none" />
              <circle cx="24" cy="10" r="2.5" fill="#6BA3C8" opacity="0.6" />
              <line x1="24" y1="16" x2="24" y2="32" stroke="#6BA3C8" strokeWidth="1.5" opacity="0.5" />
              <line x1="24" y1="22" x2="14" y2="32" stroke="#6BA3C8" strokeWidth="1.5" opacity="0.5" />
              <line x1="24" y1="22" x2="34" y2="32" stroke="#6BA3C8" strokeWidth="1.5" opacity="0.5" />
              <circle cx="14" cy="36" r="4" stroke="#6BA3C8" strokeWidth="1.5" fill="none" opacity="0.7" />
              <circle cx="34" cy="36" r="4" stroke="#6BA3C8" strokeWidth="1.5" fill="none" opacity="0.7" />
              <circle cx="24" cy="36" r="4" stroke="#6BA3C8" strokeWidth="1.5" fill="none" opacity="0.7" />
            </svg>
            <div style={styles.cardLabel}>Framework & Philosophy</div>
            <div style={styles.cardDesc}>The conceptual foundation of AXIS. Understand the model, the dimensions, and the philosophy behind the inner mapping system.</div>
            <div style={{ marginTop: '24px' }}>
              <button style={styles.btn} onClick={() => setSection('philosophy')}>Enter</button>
            </div>
          </div>
          <div style={styles.card} onClick={() => setSection('methodology')}>
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" style={{ marginBottom: '20px', opacity: 0.8 }}>
              <rect x="6" y="8" width="36" height="32" rx="2" stroke="#6BA3C8" strokeWidth="1.5" fill="none" opacity="0.4" />
              <line x1="6" y1="16" x2="42" y2="16" stroke="#6BA3C8" strokeWidth="1" opacity="0.4" />
              <line x1="13" y1="24" x2="28" y2="24" stroke="#6BA3C8" strokeWidth="1.5" opacity="0.6" strokeLinecap="round" />
              <line x1="13" y1="30" x2="24" y2="30" stroke="#6BA3C8" strokeWidth="1.5" opacity="0.4" strokeLinecap="round" />
              <circle cx="10" cy="12" r="1.5" fill="#6BA3C8" opacity="0.5" />
              <circle cx="15" cy="12" r="1.5" fill="#6BA3C8" opacity="0.5" />
              <circle cx="20" cy="12" r="1.5" fill="#6BA3C8" opacity="0.5" />
            </svg>
            <div style={styles.cardLabel}>Application & Methodology</div>
            <div style={styles.cardDesc}>How to use AXIS in practice. A guide through each section of the app, how the tools work together, and how to get the most from your practice.</div>
            <div style={{ marginTop: '24px' }}>
              <button style={styles.btn} onClick={() => setSection('methodology')}>Enter</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', background: '#0d1b2a', display: 'flex', flexDirection: 'column' },
  header: { display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 32px', borderBottom: '1px solid rgba(107,163,200,0.15)', background: '#0f2236' },
  backBtn: { background: 'none', border: 'none', color: '#5A7A94', fontSize: '12px', fontWeight: '600', letterSpacing: '1px', cursor: 'pointer', padding: 0 },
  screenTitle: { fontFamily: 'Georgia, serif', fontSize: '18px', fontWeight: '300', color: '#D8E6F0', letterSpacing: '2px', flex: 1 },
  body: { maxWidth: '1000px', margin: '0 auto', padding: '60px 32px 80px', width: '100%' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' },
  card: { background: '#162534', border: '1px solid rgba(107,163,200,0.25)', borderRadius: '3px', padding: '36px', display: 'flex', flexDirection: 'column', cursor: 'pointer', transition: 'border-color 0.2s' },
  cardLabel: { fontSize: '11px', fontWeight: '600', letterSpacing: '4px', textTransform: 'uppercase', color: '#6BA3C8', marginBottom: '16px' },
  cardDesc: { fontSize: '13px', color: '#5A7A94', lineHeight: 1.7, flex: 1 },
  btn: { background: 'rgba(107,163,200,0.15)', border: '1px solid rgba(107,163,200,0.4)', borderRadius: '3px', padding: '10px 24px', color: '#6BA3C8', fontSize: '11px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer' },
};

export default Tutorial;