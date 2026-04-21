import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Tutorial() {
  const navigate = useNavigate();
  const [section, setSection] = useState(null);

  if (section === 'philosophy') {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <button style={styles.backBtn} onClick={() => setSection(null)}>← Tutorial</button>
          <div style={styles.title}>Framework & Philosophy</div>
        </div>
        <div style={styles.content}>
          <p style={styles.p}>AXIS is an internal navigating system — a tool, a guide, a framework, a direction and a philosophy. It is intended to allow you to make profound self-discoveries and transformations. AXIS is an ecosystem of four conceptual models, each dealing with a different dimension: neurological, emotional, cognitive and behavioral. They interrelate and interconnect.</p>

          <div style={styles.sectionLabel}>Neurological Dimension — ISM</div>
          <p style={styles.p}>The Internal State Map allows you to locate your operating mode on a spectrum of two main regions of the brain. When operating from the Prefrontal Cortex, you can mobilize resources of planning, decision-making, reasoning, problem solving, focus, memory and impulse control. When the Limbic System takes over, this region becomes overstimulated, causing emotional instability, mood swings, poor concentration and fatigue.</p>
          <p style={styles.p}>When operating from the Limbic System, our emotional burdens come up to the surface. We feel the weight of the emotions we carry.</p>

          <div style={styles.sectionLabel}>Emotional Dimension — ESM</div>
          <p style={styles.p}>An emotional burden will create patterns of beliefs and thoughts that take input from the emotion, and a cycle of behaviors that act as the emotional output, as the dysregulated system attempts to find relief. These burdens are wounds we carry. They can also be transferred. A parent who humiliates a child burdens that child with their own shame. The child carries it. Later, the child goes to school and mocks their classmate, and now the classmate carries the weight.</p>
          <p style={styles.p}>Not all emotions are burdens. When they serve their purpose, like fear asking us to act in a dangerous situation, or guilt calling us to modify a behavior that is hurtful to someone, these are signals. A complex is produced by a burden, never by a signal. Each burden has a liberated counterpart. By untying the knots associated with an emotional burden, the burden can be lifted and its liberated state progressively accessed.</p>

          <div style={styles.sectionLabel}>Cognitive Dimension — CPM</div>
          <p style={styles.p}>The cognitive patterns that form as a result of emotional burdens are called complexes — psychological knots that create tension. A complex is a cluster that works in patterns, becoming repetitive. It has its emotional burden at the root. The beliefs and thoughts take the emotional input while the behavior is the emotional output. Each complex has its triggers that activate it.</p>
          <p style={styles.p}>Awareness is what allows a complex to dissolve. The art of mapping the complexes is what allows the transformation to happen.</p>

          <div style={styles.sectionLabel}>Behavioral Dimension — CBM</div>
          <p style={styles.p}>Under dysregulation the system looks for an output — to relieve the tension. The higher the dysregulation, the higher the relief it will seek. The Compulsive Behavior Map allows you to place your relief-seeking behaviors on a hierarchy and to see the regulated version of yourself reflected back. For every compulsive behavior, there is an alternative.</p>

          <div style={styles.closing}>These four dimensions form one coherent system. The neurological state determines what emotional weight surfaces. The emotional weight generates the cognitive patterns. The cognitive patterns express themselves through behavior. Awareness of the behavior leads to the pattern. The pattern reveals the burden. Lifting the burden shifts the operating system. This is the full arc of AXIS.</div>
        </div>
      </div>
    );
  }

  if (section === 'methodology') {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <button style={styles.backBtn} onClick={() => setSection(null)}>← Tutorial</button>
          <div style={styles.title}>Application & Methodology</div>
        </div>
        <div style={styles.content}>
          <p style={styles.p}>The purpose of AXIS is to allow you to map your inner world in order to understand yourself more deeply and make real transformation possible. The tools work together. None of them are complete alone.</p>

          <div style={styles.sectionLabel}>The Daily Scan</div>
          <p style={styles.p}>Begin here every day. The scan takes a few minutes. It is not a mood log — it is a calibration. You are locating yourself on two spectrums: the neurological (ISM) and the emotional (ESM). Over time, the scan reveals patterns that are invisible in the moment.</p>

          <div style={styles.sectionLabel}>The Complex Pattern Map</div>
          <p style={styles.p}>The CPM is where the deepest work happens. Complexes can be built during dedicated introspective sessions or in real time, when something is lived or felt. The entry point method allows you to begin from wherever you have access, and let the rest reveal itself from there.</p>
          <p style={styles.p}>The Original Wound deserves its own attention. When you write the counter belief for an Original Wound, you are not reframing a cognitive pattern. You are speaking to the version of yourself that formed the belief in the first place.</p>

          <div style={styles.sectionLabel}>The Compulsive Behavior Map</div>
          <p style={styles.p}>Build your pyramid as a foundational mapping exercise. For each behavior, define its alternative. Link each behavior to its complex. When you tap See Insight at a moment of impulse, the app shows you the pattern driving the behavior, its root, and the counter behavior you mapped.</p>

          <div style={styles.sectionLabel}>The Dream Journal</div>
          <p style={styles.p}>Dreams carry the language of the unconscious. Record the dream as close to waking as possible. The link between a dream and a complex creates a bridge between what the unconscious reveals at night and the patterns being mapped in the waking mind.</p>

          <div style={styles.closing}>The practice does not require perfection. It requires honesty and return. The map keeps growing. The tree keeps branching. The patterns keep becoming visible. The inner world does not transform through a single insight. It transforms through accumulated awareness, applied over time.</div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate('/')}>← Home</button>
        <div style={styles.title}>Tutorial</div>
      </div>
      <div style={styles.p}>Two sections. One for the framework. One for the practice.</div>
      <div style={styles.grid}>
        <div style={styles.card} onClick={() => setSection('philosophy')}>
          <div style={styles.cardTitle}>Framework & Philosophy</div>
          <div style={styles.cardDesc}>The conceptual foundation of AXIS. Understand the model, the dimensions, and the philosophy behind the inner mapping system.</div>
        </div>
        <div style={styles.card} onClick={() => setSection('methodology')}>
          <div style={styles.cardTitle}>Application & Methodology</div>
          <div style={styles.cardDesc}>How to use AXIS in practice. A guide through each section of the app and how the tools work together.</div>
        </div>
      </div>
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
    marginBottom: '40px',
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
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
    marginTop: '24px',
  },
  card: {
    background: 'var(--navy-3)',
    border: '1px solid var(--border)',
    borderRadius: '4px',
    padding: '32px 24px',
    cursor: 'pointer',
  },
  cardTitle: {
    fontFamily: 'Georgia, serif',
    fontSize: '18px',
    fontWeight: '300',
    color: 'var(--text-dark)',
    marginBottom: '12px',
  },
  cardDesc: {
    fontSize: '13px',
    color: 'var(--text-light)',
    lineHeight: 1.7,
  },
  content: {
    maxWidth: '680px',
  },
  p: {
    fontFamily: 'Georgia, serif',
    fontSize: '15px',
    color: 'var(--steel-blue)',
    lineHeight: 1.9,
    marginBottom: '24px',
  },
  sectionLabel: {
    fontSize: '9px',
    fontWeight: '700',
    letterSpacing: '4px',
    textTransform: 'uppercase',
    color: 'var(--text-light)',
    marginBottom: '16px',
    marginTop: '40px',
    paddingTop: '40px',
    borderTop: '1px solid var(--border)',
  },
  closing: {
    fontFamily: 'Georgia, serif',
    fontSize: '16px',
    color: 'var(--text-dark)',
    lineHeight: 1.9,
    fontStyle: 'italic',
    marginTop: '48px',
    paddingTop: '48px',
    borderTop: '1px solid var(--border)',
  },
};

export default Tutorial;