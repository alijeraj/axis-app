import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = 'https://axis-backend-production-5e9b.up.railway.app';

const ISM_DIMS = [
  { id: 'attention', label: 'Attention', left: 'Focused', right: 'Distracted' },
  { id: 'location', label: 'Location', left: 'Presence', right: 'Absence' },
  { id: 'drive', label: 'Drive', left: 'Purposeful', right: 'Compulsive' },
  { id: 'emotions', label: 'Emotions', left: 'Regulated', right: 'Dysregulated' },
];

const ESM_DIMS = [
  { id: 'fear', label: 'Fear', left: 'Secure', right: 'Fear' },
  { id: 'guilt', label: 'Guilt', left: 'Free', right: 'Guilt' },
  { id: 'shame', label: 'Shame', left: 'Empowered', right: 'Shame' },
  { id: 'anger', label: 'Anger', left: 'At Peace', right: 'Anger' },
  { id: 'envy', label: 'Envy', left: 'Abundant', right: 'Envy' },
  { id: 'grief', label: 'Grief', left: 'Connected', right: 'Grief' },
];

function Scan() {
  const navigate = useNavigate();
  const token = localStorage.getItem('axis_token');

  const [step, setStep] = useState('ism'); // ism, esm, done
  const [ism, setIsm] = useState({ attention: 5, location: 5, drive: 5, emotions: 5 });
  const [esm, setEsm] = useState({ fear: 5, guilt: 5, shame: 5, anger: 5, envy: 5, grief: 5 });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const ismScore = Math.round(Object.values(ism).reduce((a, b) => a + b, 0) / 4);
  const esmScore = Math.round(Object.values(esm).reduce((a, b) => a + b, 0) / 6);
  const axisScore = Math.round((ismScore + esmScore) / 2);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const today = new Date().toISOString().split('T')[0];
      await axios.post(`${API}/api/entries`, {
        date: today,
        data: { ism, esm, ismScore, esmScore, axisScore }
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStep('done');
    } catch (err) {
      setError('Failed to save. Try again.');
    } finally {
      setSaving(false);
    }
  };

  if (step === 'done') {
    return (
      <div style={styles.container}>
        <div style={styles.doneCard}>
          <div style={styles.doneTitle}>Scan Complete</div>
          <div style={styles.scores}>
            <div style={styles.scoreItem}>
              <div style={styles.scoreVal}>{ismScore}</div>
              <div style={styles.scoreLabel}>ISM</div>
            </div>
            <div style={styles.scoreItem}>
              <div style={styles.scoreVal}>{esmScore}</div>
              <div style={styles.scoreLabel}>ESM</div>
            </div>
            <div style={styles.scoreItem}>
              <div style={styles.scoreVal}>{axisScore}</div>
              <div style={styles.scoreLabel}>AXIS</div>
            </div>
          </div>
          <button style={styles.btn} onClick={() => navigate('/')}>Back to Home</button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate('/')}>← Home</button>
        <div style={styles.title}>{step === 'ism' ? 'Internal State Map' : 'Emotional Spectrum Map'}</div>
      </div>

      <div style={styles.card}>
        {step === 'ism' && ISM_DIMS.map(dim => (
          <div key={dim.id} style={styles.dimRow}>
            <div style={styles.dimLabel}>{dim.label}</div>
            <div style={styles.sliderRow}>
              <span style={styles.sliderLeft}>{dim.left}</span>
              <input
                type="range"
                min="1"
                max="10"
                value={ism[dim.id]}
                onChange={e => setIsm({ ...ism, [dim.id]: parseInt(e.target.value) })}
                style={styles.slider}
              />
              <span style={styles.sliderRight}>{dim.right}</span>
            </div>
            <div style={styles.sliderVal}>{ism[dim.id]}</div>
          </div>
        ))}

        {step === 'esm' && ESM_DIMS.map(dim => (
          <div key={dim.id} style={styles.dimRow}>
            <div style={styles.dimLabel}>{dim.label}</div>
            <div style={styles.sliderRow}>
              <span style={styles.sliderLeft}>{dim.left}</span>
              <input
                type="range"
                min="1"
                max="10"
                value={esm[dim.id]}
                onChange={e => setEsm({ ...esm, [dim.id]: parseInt(e.target.value) })}
                style={styles.slider}
              />
              <span style={styles.sliderRight}>{dim.right}</span>
            </div>
            <div style={styles.sliderVal}>{esm[dim.id]}</div>
          </div>
        ))}

        {error && <div style={styles.error}>{error}</div>}

        <div style={styles.footer}>
          {step === 'ism' && (
            <button style={styles.btn} onClick={() => setStep('esm')}>Next — ESM</button>
          )}
          {step === 'esm' && (
            <>
              <button style={styles.backBtn} onClick={() => setStep('ism')}>← Back</button>
              <button style={styles.btn} onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save Scan'}
              </button>
            </>
          )}
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
    maxWidth: '700px',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
    marginBottom: '32px',
  },
  title: {
    fontFamily: 'Georgia, serif',
    fontSize: '24px',
    fontWeight: '300',
    color: 'var(--text-dark)',
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
  card: {
    background: 'var(--navy-3)',
    border: '1px solid var(--border)',
    borderRadius: '4px',
    padding: '32px',
  },
  dimRow: {
    marginBottom: '28px',
  },
  dimLabel: {
    fontSize: '10px',
    fontWeight: '600',
    letterSpacing: '3px',
    textTransform: 'uppercase',
    color: 'var(--text-light)',
    marginBottom: '12px',
  },
  sliderRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  sliderLeft: {
    fontSize: '12px',
    color: 'var(--regulated)',
    width: '90px',
    textAlign: 'right',
    flexShrink: 0,
  },
  sliderRight: {
    fontSize: '12px',
    color: 'var(--burdened)',
    width: '90px',
    flexShrink: 0,
  },
  slider: {
    flex: 1,
    accentColor: 'var(--steel-blue)',
  },
  sliderVal: {
    fontSize: '13px',
    color: 'var(--steel-blue)',
    textAlign: 'center',
    marginTop: '6px',
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '32px',
  },
  btn: {
    background: 'rgba(107,163,200,0.15)',
    border: '1px solid rgba(107,163,200,0.4)',
    borderRadius: '3px',
    padding: '12px 24px',
    color: 'var(--steel-blue)',
    fontSize: '11px',
    fontWeight: '600',
    letterSpacing: '3px',
    textTransform: 'uppercase',
    cursor: 'pointer',
  },
  error: {
    color: 'var(--burdened)',
    fontSize: '12px',
    marginTop: '16px',
  },
  doneCard: {
    background: 'var(--navy-3)',
    border: '1px solid var(--border)',
    borderRadius: '4px',
    padding: '48px',
    textAlign: 'center',
    marginTop: '80px',
  },
  doneTitle: {
    fontFamily: 'Georgia, serif',
    fontSize: '28px',
    fontWeight: '300',
    color: 'var(--text-dark)',
    marginBottom: '40px',
  },
  scores: {
    display: 'flex',
    justifyContent: 'center',
    gap: '48px',
    marginBottom: '40px',
  },
  scoreItem: {
    textAlign: 'center',
  },
  scoreVal: {
    fontFamily: 'Georgia, serif',
    fontSize: '48px',
    fontWeight: '300',
    color: 'var(--steel-blue)',
    marginBottom: '8px',
  },
  scoreLabel: {
    fontSize: '10px',
    letterSpacing: '3px',
    textTransform: 'uppercase',
    color: 'var(--text-light)',
  },
};

export default Scan;