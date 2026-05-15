import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ExportModal from '../components/ExportModal';
import { generatePDF } from '../utils/pdfExport';

const API = 'https://axis-backend-production-5e9b.up.railway.app';

function Home(props) {
  const navigate = useNavigate();
  const token = localStorage.getItem('axis_token');
  const [showExport, setShowExport] = useState(false);
  const [patternCategories, setPatternCategories] = useState([]);
  const [patterns, setPatterns] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [catsRes, patternsRes] = await Promise.all([
          axios.get(API + '/api/pattern-categories', { headers: { Authorization: 'Bearer ' + token } }),
          axios.get(API + '/api/patterns', { headers: { Authorization: 'Bearer ' + token } }),
        ]);
        setPatternCategories(catsRes.data || []);
        setPatterns(patternsRes.data || []);
      } catch (e) {
        console.log(e);
      }
    };
    loadData();
  }, [token]);

  const handleExport = async (config) => {
    await generatePDF(config);
    setShowExport(false);
  };

  const menuItems = [
    {
      id: 'scan', label: 'Daily\nScan',
      svg: (
        <svg width="64" height="64" viewBox="0 0 80 80" fill="none">
          <path d="M4 20 L4 4 L20 4" stroke="#8EC4E0" strokeWidth="4" fill="none" strokeLinecap="square"/>
          <path d="M60 4 L76 4 L76 20" stroke="#8EC4E0" strokeWidth="4" fill="none" strokeLinecap="square"/>
          <path d="M4 60 L4 76 L20 76" stroke="#8EC4E0" strokeWidth="4" fill="none" strokeLinecap="square"/>
          <path d="M60 76 L76 76 L76 60" stroke="#8EC4E0" strokeWidth="4" fill="none" strokeLinecap="square"/>
          <rect x="18" y="18" width="44" height="44" stroke="#8EC4E0" strokeWidth="1.5" fill="none" opacity="0.6"/>
          <rect x="26" y="26" width="28" height="28" stroke="#8EC4E0" strokeWidth="1.5" fill="none" opacity="0.8"/>
          <rect x="34" y="34" width="12" height="12" stroke="#8EC4E0" strokeWidth="1.5" fill="none" opacity="0.95"/>
          <rect x="38" y="38" width="4" height="4" fill="#8EC4E0"/>
          <line x1="10" y1="40" x2="70" y2="40" stroke="#8EC4E0" strokeWidth="1.2" opacity="0.6"/>
        </svg>
      )
    },
    {
      id: 'cpm', label: 'Complex\nMap',
      svg: (
        <svg width="64" height="64" viewBox="0 0 80 80" fill="none">
          <rect x="4" y="4" width="72" height="72" stroke="#8EC4E0" strokeWidth="1.5" fill="none" opacity="0.3"/>
          <line x1="40" y1="4" x2="40" y2="76" stroke="#8EC4E0" strokeWidth="0.75" opacity="0.25"/>
          <line x1="4" y1="40" x2="76" y2="40" stroke="#8EC4E0" strokeWidth="0.75" opacity="0.25"/>
          <rect x="18" y="18" width="44" height="44" stroke="#8EC4E0" strokeWidth="1.5" fill="none" opacity="0.5"/>
          <rect x="28" y="28" width="24" height="24" stroke="#8EC4E0" strokeWidth="2" fill="rgba(142,196,224,0.1)" opacity="0.9"/>
          <circle cx="40" cy="36" r="5.5" fill="#8EC4E0" opacity="0.9"/>
          <circle cx="40" cy="36" r="2.5" fill="#0F1A24"/>
          <path d="M 37,40 Q 40,50 40,50 Q 40,50 43,40" fill="#8EC4E0" opacity="0.9"/>
        </svg>
      )
    },
    {
      id: 'cbm', label: 'Behavior\nMap',
      svg: (
        <svg width="64" height="64" viewBox="0 0 80 80" fill="none">
          <rect x="24" y="66" width="32" height="8" rx="1" stroke="#8EC4E0" strokeWidth="1.5" fill="rgba(142,196,224,0.1)"/>
          <rect x="30" y="54" width="20" height="8" rx="1" stroke="#8EC4E0" strokeWidth="1.5" fill="rgba(142,196,224,0.1)" opacity="0.9"/>
          <rect x="34" y="42" width="12" height="8" rx="1" stroke="#8EC4E0" strokeWidth="1.5" fill="rgba(142,196,224,0.1)" opacity="0.8"/>
          <rect x="37" y="30" width="6" height="8" rx="1" stroke="#8EC4E0" strokeWidth="1.5" fill="rgba(142,196,224,0.1)" opacity="0.65"/>
          <rect x="38.5" y="18" width="3" height="8" rx="1" stroke="#8EC4E0" strokeWidth="1.5" fill="rgba(142,196,224,0.1)" opacity="0.5"/>
        </svg>
      )
    },
    {
      id: 'people', label: 'Relational\nMap',
      svg: (
        <svg width="64" height="64" viewBox="0 0 80 80" fill="none">
          <line x1="40" y1="22" x2="20" y2="44" stroke="#8EC4E0" strokeWidth="1.5" opacity="0.55"/>
          <line x1="40" y1="22" x2="40" y2="44" stroke="#8EC4E0" strokeWidth="1.5" opacity="0.55"/>
          <line x1="40" y1="22" x2="60" y2="44" stroke="#8EC4E0" strokeWidth="1.5" opacity="0.55"/>
          <line x1="20" y1="44" x2="12" y2="64" stroke="#8EC4E0" strokeWidth="1.2" opacity="0.4"/>
          <line x1="20" y1="44" x2="28" y2="64" stroke="#8EC4E0" strokeWidth="1.2" opacity="0.4"/>
          <line x1="60" y1="44" x2="52" y2="64" stroke="#8EC4E0" strokeWidth="1.2" opacity="0.4"/>
          <line x1="60" y1="44" x2="68" y2="64" stroke="#8EC4E0" strokeWidth="1.2" opacity="0.4"/>
          <circle cx="40" cy="18" r="6" stroke="#8EC4E0" strokeWidth="2" fill="rgba(142,196,224,0.2)" opacity="1"/>
          <circle cx="20" cy="44" r="4.5" stroke="#8EC4E0" strokeWidth="1.5" fill="rgba(142,196,224,0.15)" opacity="0.85"/>
          <circle cx="40" cy="44" r="4.5" stroke="#8EC4E0" strokeWidth="1.5" fill="rgba(142,196,224,0.15)" opacity="0.85"/>
          <circle cx="60" cy="44" r="4.5" stroke="#8EC4E0" strokeWidth="1.5" fill="rgba(142,196,224,0.15)" opacity="0.85"/>
          <circle cx="12" cy="66" r="3.5" stroke="#8EC4E0" strokeWidth="1.2" fill="rgba(142,196,224,0.1)" opacity="0.7"/>
          <circle cx="28" cy="66" r="3.5" stroke="#8EC4E0" strokeWidth="1.2" fill="rgba(142,196,224,0.1)" opacity="0.7"/>
          <circle cx="52" cy="66" r="3.5" stroke="#8EC4E0" strokeWidth="1.2" fill="rgba(142,196,224,0.1)" opacity="0.7"/>
          <circle cx="68" cy="66" r="3.5" stroke="#8EC4E0" strokeWidth="1.2" fill="rgba(142,196,224,0.1)" opacity="0.7"/>
        </svg>
      )
    },
    {
      id: 'progress', label: 'View\nProgress',
      svg: (
        <svg width="64" height="64" viewBox="0 0 80 80" fill="none">
          <rect x="4" y="62" width="11" height="14" fill="#8EC4E0" opacity="0.4"/>
          <rect x="18" y="50" width="11" height="26" fill="#8EC4E0" opacity="0.55"/>
          <rect x="32" y="38" width="11" height="38" fill="#8EC4E0" opacity="0.7"/>
          <rect x="46" y="24" width="11" height="52" fill="#8EC4E0" opacity="0.85"/>
          <rect x="60" y="10" width="11" height="66" fill="#8EC4E0" opacity="1"/>
          <line x1="4" y1="76" x2="71" y2="76" stroke="#8EC4E0" strokeWidth="2" opacity="0.5" strokeLinecap="round"/>
        </svg>
      )
    },
    {
      id: 'journal', label: 'Dream\nJournal',
      svg: (
        <svg width="64" height="64" viewBox="0 0 80 80" fill="none">
          <path d="M 40,12 L 8,16 L 8,68 L 40,64 Z" fill="#8EC4E0" opacity="0.15" stroke="#8EC4E0" strokeWidth="1.5" strokeOpacity="0.6"/>
          <path d="M 40,12 L 72,16 L 72,68 L 40,64 Z" fill="#8EC4E0" opacity="0.22" stroke="#8EC4E0" strokeWidth="1.5" strokeOpacity="0.6"/>
          <line x1="40" y1="12" x2="40" y2="64" stroke="#8EC4E0" strokeWidth="2.5" opacity="0.9" strokeLinecap="round"/>
          <line x1="14" y1="28" x2="36" y2="27" stroke="#8EC4E0" strokeWidth="1.2" opacity="0.6" strokeLinecap="round"/>
          <line x1="14" y1="38" x2="36" y2="37" stroke="#8EC4E0" strokeWidth="1.2" opacity="0.5" strokeLinecap="round"/>
          <line x1="14" y1="48" x2="36" y2="47" stroke="#8EC4E0" strokeWidth="1.2" opacity="0.4" strokeLinecap="round"/>
          <line x1="44" y1="27" x2="66" y2="28" stroke="#8EC4E0" strokeWidth="1.2" opacity="0.6" strokeLinecap="round"/>
          <line x1="44" y1="37" x2="66" y2="38" stroke="#8EC4E0" strokeWidth="1.2" opacity="0.5" strokeLinecap="round"/>
          <line x1="44" y1="47" x2="66" y2="48" stroke="#8EC4E0" strokeWidth="1.2" opacity="0.4" strokeLinecap="round"/>
        </svg>
      )
    },
    
    {
      id: 'tutorial', label: 'App\nTutorial',
      svg: (
        <svg width="64" height="64" viewBox="0 0 80 80" fill="none">
          <circle cx="40" cy="40" r="34" stroke="#8EC4E0" strokeWidth="2.5" fill="none" opacity="0.65"/>
          <circle cx="40" cy="40" r="26" stroke="#8EC4E0" strokeWidth="1" fill="none" opacity="0.3"/>
          <circle cx="40" cy="26" r="3.5" fill="#8EC4E0" opacity="0.9"/>
          <line x1="40" y1="34" x2="40" y2="58" stroke="#8EC4E0" strokeWidth="4.5" strokeLinecap="round" opacity="0.9"/>
        </svg>
      )
    },
  ];

  return (
    <div style={styles.container}>
      <div style={styles.logo}>AX<span style={styles.logoSpan}>IS</span></div>
      <div style={styles.sub}>Navigate your inner world</div>

      <div style={styles.iconsRow}>
        {menuItems.map(item => {
          const isDisabled = item.id === 'tutorial';
          return (
            <button
              key={item.id}
              style={{ ...styles.iconBtn, cursor: isDisabled ? 'not-allowed' : 'pointer', opacity: isDisabled ? 0.35 : 1 }}
              disabled={isDisabled}
              onClick={() => { if (!isDisabled) navigate('/' + item.id); }}
              onMouseEnter={e => {
                if (isDisabled) return;
                e.currentTarget.querySelector('.icon-wrap').style.transform = 'translateY(-4px)';
                e.currentTarget.querySelector('.icon-wrap').style.opacity = '1';
                e.currentTarget.querySelector('.icon-label').style.color = '#8EC4E0';
              }}
              onMouseLeave={e => {
                if (isDisabled) return;
                e.currentTarget.querySelector('.icon-wrap').style.transform = 'translateY(0)';
                e.currentTarget.querySelector('.icon-wrap').style.opacity = '0.85';
                e.currentTarget.querySelector('.icon-label').style.color = 'rgba(216,230,240,0.85)';
              }}
            >
              <div className="icon-wrap" style={styles.iconWrap}>{item.svg}</div>
              <span className="icon-label" style={styles.iconLabel}>
                {item.label.split('\n').map((line, i) => (
                  <span key={i}>{line}{i === 0 && <br />}</span>
                ))}
              </span>
            </button>
          );
        })}
      </div>

      <div style={styles.footer}>
        <button style={styles.exportBtn} onClick={() => setShowExport(true)}>Export PDF</button>
        <button style={styles.signOutBtn} onClick={props.onLogout}>Sign Out</button>
      </div>

      {showExport && (
        <ExportModal
          patternCategories={patternCategories}
          patterns={patterns}
          onClose={() => setShowExport(false)}
          onExport={handleExport}
        />
      )}
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: 'var(--navy-1)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 40px',
  },
  logo: {
    fontFamily: 'Georgia, serif',
    fontSize: '64px',
    fontWeight: '300',
    color: '#D8E6F0',
    letterSpacing: '-3px',
    marginBottom: '8px',
    lineHeight: 1,
  },
  logoSpan: {
    color: '#8EC4E0',
    fontWeight: '600',
  },
  sub: {
    fontFamily: 'Georgia, serif',
    fontSize: '18px',
    fontStyle: 'italic',
    color: '#7A9CB8',
    letterSpacing: '3px',
    marginBottom: '64px',
  },
  iconsRow: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: '32px',
    flexWrap: 'nowrap',
    maxWidth: '900px',
    margin: '0 auto',
  },
  iconBtn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    width: '100px',
  },
  iconWrap: {
    width: '72px',
    height: '72px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: '0.85',
    transition: 'all 0.25s ease',
  },
  iconLabel: {
    fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
    fontSize: '9px',
    fontWeight: '600',
    letterSpacing: '2px',
    textTransform: 'uppercase',
    color: 'rgba(216,230,240,0.85)',
    textAlign: 'center',
    lineHeight: 1.5,
    transition: 'color 0.2s',
  },
  footer: {
    marginTop: '48px',
    paddingTop: '24px',
    borderTop: '1px solid rgba(107,163,200,0.2)',
    display: 'flex',
    justifyContent: 'center',
    gap: '32px',
  },
  exportBtn: {
    background: 'rgba(74,174,136,0.1)',
    border: '1px solid rgba(74,174,136,0.4)',
    borderRadius: '3px',
    padding: '8px 16px',
    cursor: 'pointer',
    fontSize: '9px',
    fontWeight: '600',
    letterSpacing: '3px',
    textTransform: 'uppercase',
    color: '#4AAE88',
  },
  signOutBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '9px',
    fontWeight: '600',
    letterSpacing: '3px',
    textTransform: 'uppercase',
    color: 'rgba(142,196,224,0.55)',
  },
};

export default Home;