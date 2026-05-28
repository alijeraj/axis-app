import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Page, AppHeader, PageBody } from '../components/Layout';

const API = 'https://axis-backend-production-5e9b.up.railway.app';

const todayKey = () => {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
};

// 12 AUC bands, base (widest) -> tip (narrowest). min inclusive, max exclusive.
const BANDS = [
  { label: '50–150', min: 50, max: 200 },
  { label: '200–300', min: 200, max: 400 },
  { label: '400–600', min: 400, max: 600 },
  { label: '600–800', min: 600, max: 800 },
  { label: '800–1000', min: 800, max: 1000 },
  { label: '1000–1500', min: 1000, max: 1500 },
  { label: '1500–2000', min: 1500, max: 2000 },
  { label: '2000–3000', min: 2000, max: 3000 },
  { label: '3000–4000', min: 3000, max: 5000 },
  { label: '5000–6000', min: 5000, max: 7000 },
  { label: '7000–8000', min: 7000, max: 8000 },
  { label: '8K+', min: 8000, max: Infinity },
];

// Returns band index for a given load (0 = base). null if below 50.
const bandFor = (load) => {
  if (load < 50) return null;
  for (let i = 0; i < BANDS.length; i++) {
    if (load >= BANDS[i].min && load < BANDS[i].max) return i;
  }
  return BANDS.length - 1;
};

function Pyramid({ title, accent, items }) {
  // items: [{name, load}]
  // Build rows top (11) -> bottom (0)
  const rows = [];
  for (let i = BANDS.length - 1; i >= 0; i--) {
    const band = BANDS[i];
    const inBand = items.filter(it => bandFor(it.load) === i);
    rows.push({ i, band, inBand });
  }

  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ textAlign: 'center', fontSize: '10px', fontWeight: '600', letterSpacing: '3px', textTransform: 'uppercase', color: accent, marginBottom: '12px' }}>{title}</div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
        {rows.map(({ i, band, inBand }) => {
          // rows are tip-first (i=11) down to base (i=0). Base widest.
          const widthPct = 38 + ((BANDS.length - 1 - i) / (BANDS.length - 1)) * 62;
          return (
            <div key={i} style={{
              width: widthPct + '%',
              minHeight: '22px',
              border: `1px solid ${accent}40`,
              background: inBand.length ? `${accent}1A` : 'rgba(142,196,224,0.03)',
              borderRadius: '2px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              padding: '4px 6px',
              boxSizing: 'border-box',
            }}>
              <span style={{ position: 'absolute', left: '-46px', fontSize: '7px', color: '#8BAFC8', whiteSpace: 'nowrap', letterSpacing: '0.5px' }}>{band.label}</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', justifyContent: 'center' }}>
                {inBand.map((it, k) => (
                  <span key={k} style={{ fontSize: '9px', padding: '2px 6px', borderRadius: '8px', background: `${accent}33`, color: '#D8E6F0', whiteSpace: 'nowrap' }}>
                    {it.name}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CBMResults() {
  const navigate = useNavigate();
  const token = localStorage.getItem('axis_token');
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get(`${API}/api/cbm-log`, { headers: { Authorization: `Bearer ${token}` } });
        const arr = Array.isArray(res.data) ? res.data : [];
        const k = todayKey();
        const today = arr.find(e => {
          if (!e || !e.date || typeof e.dTotal !== 'number') return false;
          const d = new Date(e.date);
          const ek = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
          return ek === k;
        });
        setEntry(today || null);
      } catch (err) { console.log(err); }
      finally { setLoading(false); }
    };
    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return <div style={{ color: '#8BAFC8', padding: '48px', textAlign: 'center' }}>Loading...</div>;

  const dateStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  if (!entry) {
    return (
      <Page>
        <AppHeader backLabel="← Behavior Log" onBack={() => navigate('/cbm')} title="Behavior Result" />
        <PageBody width="content">
          <div style={{ textAlign: 'center', padding: '80px 32px', color: '#8BAFC8', fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>
            Nothing logged today yet.
          </div>
        </PageBody>
      </Page>
    );
  }

  const { dTotal, rTotal, score } = entry;
  const items = Array.isArray(entry.items) ? entry.items : [];
  const dItems = items.filter(it => it.side === 'D');
  const rItems = items.filter(it => it.side === 'R');
  const positive = score >= 0;

  return (
    <Page>
      <AppHeader
        backLabel="← Behavior Log"
        onBack={() => navigate('/cbm')}
        title="Behavior Result"
        right={<button style={styles.btn} onClick={() => navigate('/progress?tab=behavior')}>View Progress →</button>}
      />
      <PageBody width="content">

        {/* Banner matching scan results style */}
        <div style={styles.banner}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '10px', fontWeight: '600', letterSpacing: '3px', textTransform: 'uppercase', color: '#8BAFC8', marginBottom: '10px' }}>{dateStr}</div>
            <div style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '4px', textTransform: 'uppercase', color: '#8EC4E0', marginBottom: '4px' }}>Daily Score · R − D</div>
            <div style={{ fontFamily: 'Georgia, serif', fontSize: '40px', fontWeight: '300', lineHeight: 1, color: positive ? '#4AAE88' : '#C87878' }}>
              {positive ? '+' : ''}{score}
            </div>
          </div>
          <div style={{ ...styles.bannerCol, borderLeft: '1px solid rgba(142,196,224,0.15)' }}>
            <div style={{ ...styles.bannerColLabel, color: '#C87878' }}>Dysregulated</div>
            <div style={{ ...styles.bannerColNum, color: '#C87878' }}>{dTotal}</div>
            <div style={styles.bannerColSub}>AUC load</div>
          </div>
          <div style={styles.bannerCol}>
            <div style={{ ...styles.bannerColLabel, color: '#4AAE88' }}>Regulated</div>
            <div style={{ ...styles.bannerColNum, color: '#4AAE88' }}>{rTotal}</div>
            <div style={styles.bannerColSub}>AUC load</div>
          </div>
        </div>

        {/* Pyramids */}
        <div style={{ display: 'flex', gap: '56px', marginTop: '28px', paddingLeft: '40px' }}>
          <Pyramid title="Dysregulating" accent="#C87878" items={dItems} />
          <Pyramid title="Regulating" accent="#4AAE88" items={rItems} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '32px' }}>
          <button style={styles.secondaryBtn} onClick={() => navigate('/cbm')}>← Back to Log</button>
          <button style={styles.btn} onClick={() => navigate('/progress?tab=behavior')}>View Progress →</button>
        </div>

      </PageBody>
    </Page>
  );
}

const styles = {
  btn: { background: 'rgba(142,196,224,0.15)', border: '1px solid rgba(142,196,224,0.4)', borderRadius: '3px', padding: '10px 20px', color: '#8EC4E0', fontSize: '11px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer', whiteSpace: 'nowrap' },
  secondaryBtn: { background: 'none', border: '1px solid rgba(142,196,224,0.2)', borderRadius: '3px', padding: '10px 20px', color: '#8BAFC8', fontSize: '11px', cursor: 'pointer' },
  dash: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', border: '1px solid rgba(142,196,224,0.3)', borderRadius: '4px', background: '#162534', padding: '24px', maxWidth: '480px', margin: '0 auto' },
  banner: { display: 'flex', alignItems: 'center', border: '1px solid rgba(142,196,224,0.5)', borderRadius: '4px', background: '#162534', padding: '20px 32px', marginBottom: '8px', boxShadow: '0 0 24px rgba(142,196,224,0.12)' },
  bannerCol: { textAlign: 'center', padding: '0 28px' },
  bannerColLabel: { fontSize: '10px', fontWeight: '600', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '8px' },
  bannerColNum: { fontFamily: 'Georgia, serif', fontSize: '34px', fontWeight: '300', lineHeight: 1 },
  bannerColSub: { fontSize: '10px', color: '#8BAFC8', marginTop: '6px' },
  dashCol: { textAlign: 'center', padding: '0 16px' },
  dashLabel: { fontSize: '10px', fontWeight: '600', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '8px' },
  dashNum: { fontFamily: 'Georgia, serif', fontSize: '40px', fontWeight: '300', lineHeight: 1 },
  dashSub: { fontSize: '10px', color: '#8BAFC8', marginTop: '6px' },
};

export default CBMResults;