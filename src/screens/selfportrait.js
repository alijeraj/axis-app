import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = 'https://axis-backend-production-5e9b.up.railway.app';

const ESM = [
  { dimension: 'Survival',   burden: 'Fear',  liberated: 'Secure',     right: 'The right to feel safe' },
  { dimension: 'Action',     burden: 'Guilt', liberated: 'Free',        right: 'The right to autonomous expression' },
  { dimension: 'Identity',   burden: 'Shame', liberated: 'Empowered',   right: 'The right to be' },
  { dimension: 'Boundary',   burden: 'Anger', liberated: 'At Peace',    right: 'The right to be respected' },
  { dimension: 'Comparison', burden: 'Envy',  liberated: 'Abundant',    right: 'The right to be seen' },
  { dimension: 'Love',       burden: 'Grief', liberated: 'Connected',   right: 'The right to love and be loved' },
];

const BURDEN_COLORS = {
  Fear:  { border: 'rgba(139,90,60,0.5)',   text: '#C8A87A', bg: 'rgba(139,90,60,0.08)' },
  Guilt: { border: 'rgba(180,160,60,0.5)',  text: '#D4C060', bg: 'rgba(180,160,60,0.08)' },
  Shame: { border: 'rgba(200,120,50,0.5)',  text: '#E8955A', bg: 'rgba(200,120,50,0.08)' },
  Anger: { border: 'rgba(176,90,90,0.5)',   text: '#E08080', bg: 'rgba(176,90,90,0.08)' },
  Envy:  { border: 'rgba(130,90,180,0.5)',  text: '#B07ED4', bg: 'rgba(130,90,180,0.08)' },
  Grief: { border: 'rgba(160,120,130,0.5)', text: '#D4A0B0', bg: 'rgba(160,120,130,0.08)' },
};

function SelfPortrait() {
  const navigate = useNavigate();
  const token = localStorage.getItem('axis_token');
  const [complexes, setComplexes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(API + '/api/complexes', { headers: { Authorization: 'Bearer ' + token } })
      .then(res => setComplexes(res.data || []))
      .catch(err => console.log(err))
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return <div style={{ color: '#8BAFC8', padding: '48px', textAlign: 'center', background: '#0d1b2a', minHeight: '100vh' }}>Loading...</div>;

  return (
    <div style={{ minHeight: '100vh', background: '#0d1b2a', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 32px', borderBottom: '1px solid rgba(142,196,224,0.15)', background: '#0f2236', flexShrink: 0 }}>
        <button style={{ background: 'none', border: 'none', color: '#8BAFC8', fontSize: '12px', fontWeight: '600', letterSpacing: '1px', cursor: 'pointer', padding: 0 }} onClick={() => navigate('/')}>← Home</button>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <span style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '4px', textTransform: 'uppercase', color: '#8BAFC8' }}>Self Portrait</span>
        </div>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', width: '100%', padding: '40px 32px 0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '8px' }}>
          <div style={{ textAlign: 'center', fontSize: '10px', fontWeight: '700', letterSpacing: '4px', textTransform: 'uppercase', color: 'rgba(176,90,90,0.85)', paddingBottom: '12px', borderBottom: '1px solid rgba(176,90,90,0.25)' }}>Burdened</div>
          <div style={{ textAlign: 'center', fontSize: '10px', fontWeight: '700', letterSpacing: '4px', textTransform: 'uppercase', color: 'rgba(74,174,136,0.85)', paddingBottom: '12px', borderBottom: '1px solid rgba(74,174,136,0.25)' }}>Liberated</div>
        </div>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', width: '100%', padding: '24px 32px 80px' }}>
        {ESM.map(row => {
          const burden = row.burden;
          const colors = BURDEN_COLORS[burden] || { border: 'rgba(142,196,224,0.3)', text: '#8EC4E0', bg: 'rgba(142,196,224,0.06)' };

          const matching = complexes.filter(c => c.burden && c.burden.toLowerCase() === burden.toLowerCase());
          if (matching.length === 0) return null;

          const allBeliefs = matching.map(c => c.beliefs).filter(Boolean).join('\n\n');
          const allBehaviors = matching.map(c => c.behaviors).filter(Boolean).join('\n\n');
          const allCounterBeliefs = matching.map(c => c.counter).filter(Boolean).join('\n\n');
          const allCounterBehaviors = matching.map(c => c.counterBehavior).filter(Boolean).join('\n\n');

          const hasAnyContent = allBeliefs || allBehaviors || allCounterBeliefs || allCounterBehaviors;
          if (!hasAnyContent) return null;

          return (
            <div key={burden} style={{ marginBottom: '48px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '16px' }}>
                <div style={{ padding: '12px 16px', background: colors.bg, border: '1px solid ' + colors.border, borderRadius: '3px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '8px', fontWeight: '700', letterSpacing: '3px', textTransform: 'uppercase', color: '#8BAFC8', marginBottom: '4px' }}>{row.dimension}</div>
                    <div style={{ fontSize: '16px', fontWeight: '600', color: colors.text }}>{burden}</div>
                  </div>
                  <div style={{ fontSize: '10px', color: '#8BAFC8', fontStyle: 'italic', textAlign: 'right', maxWidth: '120px', lineHeight: 1.5 }}>{row.right}</div>
                </div>
                <div style={{ padding: '12px 16px', background: 'rgba(74,174,136,0.06)', border: '1px solid rgba(74,174,136,0.3)', borderRadius: '3px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '8px', fontWeight: '700', letterSpacing: '3px', textTransform: 'uppercase', color: '#8BAFC8', marginBottom: '4px' }}>{row.dimension}</div>
                    <div style={{ fontSize: '16px', fontWeight: '600', color: '#4AAE88' }}>{row.liberated}</div>
                  </div>
                  <div style={{ fontSize: '10px', color: '#8BAFC8', fontStyle: 'italic', textAlign: 'right', maxWidth: '120px', lineHeight: 1.5 }}>{row.right}</div>
                </div>
              </div>

              {(allBeliefs || allCounterBeliefs) && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '12px' }}>
                  <div>
                    <div style={{ fontSize: '8px', fontWeight: '700', letterSpacing: '3px', textTransform: 'uppercase', color: colors.text, marginBottom: '8px', opacity: 0.85 }}>Beliefs</div>
                    {allBeliefs ? (
                      <div style={{ padding: '12px 16px', background: colors.bg, border: '1px solid ' + colors.border, borderRadius: '3px', fontSize: '13px', color: '#A0C4D8', fontFamily: 'Georgia, serif', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{allBeliefs}</div>
                    ) : (
                      <div style={{ padding: '12px 16px', border: '1px dashed rgba(142,196,224,0.12)', borderRadius: '3px', fontSize: '12px', color: '#8BAFC8', fontStyle: 'italic' }}>—</div>
                    )}
                  </div>
                  <div>
                    <div style={{ fontSize: '8px', fontWeight: '700', letterSpacing: '3px', textTransform: 'uppercase', color: 'rgba(74,174,136,0.85)', marginBottom: '8px' }}>Counter Beliefs</div>
                    {allCounterBeliefs ? (
                      <div style={{ padding: '12px 16px', background: 'rgba(74,174,136,0.06)', border: '1px solid rgba(74,174,136,0.25)', borderRadius: '3px', fontSize: '13px', color: '#A0C4D8', fontFamily: 'Georgia, serif', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{allCounterBeliefs}</div>
                    ) : (
                      <div style={{ padding: '12px 16px', border: '1px dashed rgba(74,174,136,0.12)', borderRadius: '3px', fontSize: '12px', color: '#8BAFC8', fontStyle: 'italic' }}>Not yet defined</div>
                    )}
                  </div>
                </div>
              )}

              {(allBehaviors || allCounterBehaviors) && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  <div>
                    <div style={{ fontSize: '8px', fontWeight: '700', letterSpacing: '3px', textTransform: 'uppercase', color: colors.text, marginBottom: '8px', opacity: 0.85 }}>Behaviors</div>
                    {allBehaviors ? (
                      <div style={{ padding: '12px 16px', background: colors.bg, border: '1px solid ' + colors.border, borderRadius: '3px', fontSize: '13px', color: '#A0C4D8', fontFamily: 'Georgia, serif', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{allBehaviors}</div>
                    ) : (
                      <div style={{ padding: '12px 16px', border: '1px dashed rgba(142,196,224,0.12)', borderRadius: '3px', fontSize: '12px', color: '#8BAFC8', fontStyle: 'italic' }}>—</div>
                    )}
                  </div>
                  <div>
                    <div style={{ fontSize: '8px', fontWeight: '700', letterSpacing: '3px', textTransform: 'uppercase', color: 'rgba(74,174,136,0.85)', marginBottom: '8px' }}>Counter Behaviors</div>
                    {allCounterBehaviors ? (
                      <div style={{ padding: '12px 16px', background: 'rgba(74,174,136,0.06)', border: '1px solid rgba(74,174,136,0.25)', borderRadius: '3px', fontSize: '13px', color: '#A0C4D8', fontFamily: 'Georgia, serif', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{allCounterBehaviors}</div>
                    ) : (
                      <div style={{ padding: '12px 16px', border: '1px dashed rgba(74,174,136,0.12)', borderRadius: '3px', fontSize: '12px', color: '#8BAFC8', fontStyle: 'italic' }}>Not yet defined</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default SelfPortrait;