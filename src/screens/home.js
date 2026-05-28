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
  const [profiles, setProfiles] = useState([]);
  const [activeProfileId, setActiveProfileId] = useState(parseInt(localStorage.getItem('axis_profile_id'), 10) || null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileModalMode, setProfileModalMode] = useState('create');
  const [profileModalTarget, setProfileModalTarget] = useState(null);
  const [profileNameInput, setProfileNameInput] = useState('');
  const [tier, setTier] = useState('regular');
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [profilesRes, catsRes, patternsRes, statusRes] = await Promise.all([
          axios.get(API + '/api/profiles', { headers: { Authorization: 'Bearer ' + token } }),
          axios.get(API + '/api/pattern-categories', { headers: { Authorization: 'Bearer ' + token } }),
          axios.get(API + '/api/patterns', { headers: { Authorization: 'Bearer ' + token } }),
          axios.get(API + '/api/stripe/status', { headers: { Authorization: 'Bearer ' + token } }),
        ]);
        const profs = profilesRes.data || [];
        setProfiles(profs);
        if (profs.length > 0) {
          const storedId = parseInt(localStorage.getItem('axis_profile_id'), 10);
          const valid = profs.find(p => p.id === storedId);
          if (valid) {
            setActiveProfileId(valid.id);
          } else {
            setActiveProfileId(profs[0].id);
            localStorage.setItem('axis_profile_id', String(profs[0].id));
          }
        }
        setPatternCategories(catsRes.data || []);
        setPatterns(patternsRes.data || []);
        setTier(statusRes.data?.tier || 'regular');
      } catch (e) {
        console.log(e);
      }
    };
    loadData();
  }, [token]);

  const isPro = tier === 'pro' || tier === 'complimentary';

  const handleExport = async (config) => {
    await generatePDF(config);
    setShowExport(false);
  };

  const switchProfile = (id) => {
    localStorage.setItem('axis_profile_id', String(id));
    setActiveProfileId(id);
    setShowProfileMenu(false);
    window.location.reload();
  };

  const openCreate = () => {
    if (!isPro && profiles.length >= 1) {
      setShowProfileMenu(false);
      setShowUpgradePrompt('profiles');
      return;
    }
    setProfileModalMode('create');
    setProfileNameInput('');
    setProfileModalTarget(null);
    setShowProfileMenu(false);
    setShowProfileModal(true);
  };

  const openRename = (p) => {
    setProfileModalMode('rename');
    setProfileNameInput(p.name);
    setProfileModalTarget(p);
    setShowProfileMenu(false);
    setShowProfileModal(true);
  };

  const openDelete = (p) => {
    setProfileModalMode('delete');
    setProfileModalTarget(p);
    setShowProfileMenu(false);
    setShowProfileModal(true);
  };

  const handleExportClick = async () => {
    try {
      const res = await axios.get(API + '/api/stripe/status', { headers: { Authorization: 'Bearer ' + token } });
      const t = res.data?.tier;
      if (t !== 'pro' && t !== 'complimentary') {
        setShowUpgradePrompt('export');
        return;
      }
      setShowExport(true);
    } catch (e) {
      setShowUpgradePrompt('export');
    }
  };

  const submitProfileAction = async () => {
    try {
      if (profileModalMode === 'create') {
        if (!profileNameInput.trim()) return;
        const res = await axios.post(API + '/api/profiles', { name: profileNameInput.trim() }, { headers: { Authorization: 'Bearer ' + token } });
        const newProfiles = [...profiles, res.data];
        setProfiles(newProfiles);
        localStorage.setItem('axis_profile_id', String(res.data.id));
        setActiveProfileId(res.data.id);
        setShowProfileModal(false);
        window.location.reload();
      } else if (profileModalMode === 'rename') {
        if (!profileNameInput.trim() || !profileModalTarget) return;
        const res = await axios.patch(API + '/api/profiles/' + profileModalTarget.id, { name: profileNameInput.trim() }, { headers: { Authorization: 'Bearer ' + token } });
        setProfiles(profiles.map(p => p.id === profileModalTarget.id ? res.data : p));
        setShowProfileModal(false);
      } else if (profileModalMode === 'delete') {
        if (!profileModalTarget) return;
        await axios.delete(API + '/api/profiles/' + profileModalTarget.id, { headers: { Authorization: 'Bearer ' + token } });
        const remaining = profiles.filter(p => p.id !== profileModalTarget.id);
        setProfiles(remaining);
        if (profileModalTarget.id === activeProfileId && remaining.length > 0) {
          localStorage.setItem('axis_profile_id', String(remaining[0].id));
          setActiveProfileId(remaining[0].id);
          setShowProfileModal(false);
          window.location.reload();
        } else {
          setShowProfileModal(false);
        }
      }
    } catch (e) {
      console.log(e);
      alert(e.response?.data?.error || 'Action failed');
    }
  };

  const activeProfile = profiles.find(p => p.id === activeProfileId);

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
      id: 'cbm', label: 'Behavior\nLog',
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
      id: 'patterns', label: 'Pattern\nLibrary',
      svg: (
        <svg width="64" height="64" viewBox="0 0 80 80" fill="none">
          <circle cx="30" cy="30" r="9" fill="#8EC4E0" opacity="0.9"/>
          <circle cx="50" cy="30" r="9" fill="#C49FDA" opacity="0.9"/>
          <circle cx="30" cy="50" r="9" fill="#4AAE88" opacity="0.9"/>
          <circle cx="50" cy="50" r="9" fill="#E0B070" opacity="0.9"/>
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

  const byId = (id) => menuItems.find(m => m.id === id);
  const measureRow = [byId('scan'), byId('cbm'), byId('progress')];
  const mapRow = [byId('cpm'), byId('people')];
  const reflectRow = [byId('patterns'), byId('journal')];

  return (
    <div style={styles.container} onClick={() => setShowProfileMenu(false)}>
      <div style={styles.logo}>AX<span style={styles.logoSpan}>IS</span></div>
      <div style={styles.sub}>Navigate your inner world</div>

      <div style={styles.iconsRow}>
        {[...measureRow, 'divider', ...mapRow, 'divider', ...reflectRow].map((item, idx) => {
          if (item === 'divider') return <div key={'div' + idx} style={styles.groupDivider} />;
          return (
            <button
              key={item.id}
              style={styles.iconBtn}
              onClick={() => navigate('/' + item.id)}
              onMouseEnter={e => {
                e.currentTarget.querySelector('.icon-wrap').style.transform = 'translateY(-4px)';
                e.currentTarget.querySelector('.icon-wrap').style.opacity = '1';
                e.currentTarget.querySelector('.icon-label').style.color = '#8EC4E0';
              }}
              onMouseLeave={e => {
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

      <div style={styles.footer} onClick={e => e.stopPropagation()}>
        <div style={{ position: 'relative' }}>
          <button style={styles.profileBtn} onClick={() => setShowProfileMenu(!showProfileMenu)}>
            <span style={{ opacity: 0.6, marginRight: '6px' }}>Profile:</span>
            <span style={{ color: '#8EC4E0' }}>{activeProfile ? activeProfile.name : '...'}</span>
            <span style={{ marginLeft: '6px', opacity: 0.5 }}>{showProfileMenu ? '▲' : '▼'}</span>
          </button>
          {showProfileMenu && (
            <div style={styles.profileMenu}>
              {profiles.map(p => (
                <div key={p.id} style={{ ...styles.profileMenuRow, background: p.id === activeProfileId ? 'rgba(142,196,224,0.1)' : 'none' }}>
                  <span style={styles.profileMenuName} onClick={() => switchProfile(p.id)}>
                    {p.id === activeProfileId && <span style={{ color: '#4AAE88', marginRight: '6px' }}>●</span>}
                    {p.name}
                  </span>
                  <span style={styles.profileMenuActions}>
                    <button style={styles.profileMenuAction} onClick={() => openRename(p)}>Rename</button>
                    {profiles.length > 1 && <button style={{ ...styles.profileMenuAction, color: '#C87878' }} onClick={() => openDelete(p)}>Delete</button>}
                  </span>
                </div>
              ))}
              <div style={{ borderTop: '1px solid rgba(142,196,224,0.15)' }}>
                <button
                  style={{ ...styles.profileMenuAction, padding: '12px 16px', color: isPro ? '#4AAE88' : 'rgba(74,174,136,0.4)', width: '100%', textAlign: 'left' }}
                  onClick={openCreate}
                >
                  + New Profile {!isPro && <span style={{ fontSize: '8px', marginLeft: '6px', color: '#9B7EC8' }}>PRO</span>}
                </button>
              </div>
            </div>
          )}
        </div>
        <button style={styles.exportBtn} onClick={handleExportClick}>
          Export PDF {!isPro && <span style={{ fontSize: '8px', marginLeft: '6px', color: '#9B7EC8' }}>PRO</span>}
        </button>
        <button style={styles.billingBtn} onClick={() => navigate('/billing')}>Billing</button>
        <button style={{ ...styles.billingBtn, opacity: 0.4, cursor: 'not-allowed' }} disabled title="Coming soon">App Tutorial</button>
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

      {showProfileModal && (
        <div style={styles.modalOverlay} onClick={() => setShowProfileModal(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <div style={styles.modalTitle}>
              {profileModalMode === 'create' && 'New Profile'}
              {profileModalMode === 'rename' && 'Rename Profile'}
              {profileModalMode === 'delete' && 'Delete Profile'}
            </div>
            {profileModalMode === 'delete' ? (
              <div style={{ color: '#D8E6F0', fontSize: '14px', marginBottom: '20px' }}>
                Delete profile <strong>{profileModalTarget?.name}</strong>? All its data will be permanently removed.
              </div>
            ) : (
              <input
                style={styles.modalInput}
                value={profileNameInput}
                onChange={e => setProfileNameInput(e.target.value)}
                placeholder="Profile name..."
                autoFocus
              />
            )}
            <div style={styles.modalFooter}>
              <button style={styles.cancelBtn} onClick={() => setShowProfileModal(false)}>Cancel</button>
              <button
                style={{ ...styles.confirmBtn, ...(profileModalMode === 'delete' ? { background: 'rgba(200,120,120,0.15)', borderColor: 'rgba(200,120,120,0.4)', color: '#C87878' } : {}) }}
                onClick={submitProfileAction}
              >
                {profileModalMode === 'create' && 'Create'}
                {profileModalMode === 'rename' && 'Save'}
                {profileModalMode === 'delete' && 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showUpgradePrompt && (
        <div style={styles.modalOverlay} onClick={() => setShowUpgradePrompt(null)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <div style={styles.modalTitle}>Upgrade to Pro</div>
            <div style={{ color: '#A0C4D8', fontSize: '14px', marginBottom: '20px', lineHeight: 1.6 }}>
              {showUpgradePrompt === 'profiles' && 'Multiple profiles are a Pro feature. Manage multiple clients or contexts from one account.'}
              {showUpgradePrompt === 'export' && 'PDF export is a Pro feature. Share your inner mapping report with practitioners or keep it for your records.'}
            </div>
            <div style={styles.modalFooter}>
              <button style={styles.cancelBtn} onClick={() => setShowUpgradePrompt(null)}>Not now</button>
              <button
                style={{ ...styles.confirmBtn, background: 'rgba(155,126,200,0.15)', borderColor: 'rgba(155,126,200,0.4)', color: '#9B7EC8' }}
                onClick={() => { setShowUpgradePrompt(null); navigate('/billing'); }}
              >
                View Plans
              </button>
            </div>
          </div>
        </div>
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
    position: 'relative',
  },
  profileBtn: {
    background: 'rgba(142,196,224,0.08)',
    border: '1px solid rgba(142,196,224,0.4)',
    borderRadius: '3px',
    padding: '8px 16px',
    color: '#8BAFC8',
    fontSize: '9px',
    fontWeight: '600',
    letterSpacing: '3px',
    textTransform: 'uppercase',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
  },
  profileMenu: {
    position: 'absolute',
    bottom: 'calc(100% + 6px)',
    left: 0,
    background: '#162534',
    border: '1px solid rgba(142,196,224,0.25)',
    borderRadius: '3px',
    minWidth: '280px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
    overflow: 'hidden',
  },
  profileMenuRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 14px',
    borderBottom: '1px solid rgba(142,196,224,0.08)',
  },
  profileMenuName: {
    fontSize: '13px',
    color: '#D8E6F0',
    cursor: 'pointer',
    flex: 1,
    fontFamily: 'Georgia, serif',
  },
  profileMenuActions: {
    display: 'flex',
    gap: '8px',
  },
  profileMenuAction: {
    background: 'none',
    border: 'none',
    color: '#8BAFC8',
    fontSize: '10px',
    fontWeight: '600',
    letterSpacing: '1px',
    cursor: 'pointer',
    textTransform: 'uppercase',
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
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: '24px',
    flexWrap: 'nowrap',
    width: 'max-content',
    maxWidth: '100%',
    margin: '0 auto',
  },
  groupDivider: {
    width: '2px',
    height: '60px',
    background: 'linear-gradient(to bottom, rgba(142,196,224,0), rgba(142,196,224,0.65) 50%, rgba(142,196,224,0))',
    alignSelf: 'center',
    marginBottom: '24px',
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
    flexShrink: 0,
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
    gap: '24px',
    alignItems: 'center',
  },
  exportBtn: {
    background: 'rgba(142,196,224,0.08)',
    border: '1px solid rgba(142,196,224,0.4)',
    borderRadius: '3px',
    padding: '8px 16px',
    cursor: 'pointer',
    fontSize: '9px',
    fontWeight: '600',
    letterSpacing: '3px',
    textTransform: 'uppercase',
    color: '#8EC4E0',
    display: 'flex',
    alignItems: 'center',
  },
  billingBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '9px',
    fontWeight: '600',
    letterSpacing: '3px',
    textTransform: 'uppercase',
    color: '#8BAFC8',
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
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.75)',
    zIndex: 200,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modal: {
    background: '#162534',
    border: '1px solid rgba(142,196,224,0.3)',
    borderRadius: '4px',
    width: '100%',
    maxWidth: '420px',
    padding: '28px',
    boxShadow: '0 0 40px rgba(0,0,0,0.6)',
  },
  modalTitle: {
    fontFamily: 'Georgia, serif',
    fontSize: '22px',
    fontWeight: '300',
    color: '#D8E6F0',
    marginBottom: '20px',
  },
  modalInput: {
    width: '100%',
    background: '#0f2236',
    border: '1px solid rgba(142,196,224,0.2)',
    borderRadius: '3px',
    padding: '10px 14px',
    color: '#D8E6F0',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
    marginBottom: '20px',
  },
  modalFooter: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
  },
  cancelBtn: {
    background: 'none',
    border: '1px solid rgba(142,196,224,0.2)',
    borderRadius: '3px',
    padding: '8px 18px',
    color: '#8BAFC8',
    fontSize: '11px',
    cursor: 'pointer',
  },
  confirmBtn: {
    background: 'rgba(142,196,224,0.15)',
    border: '1px solid rgba(142,196,224,0.4)',
    borderRadius: '3px',
    padding: '8px 18px',
    color: '#8EC4E0',
    fontSize: '11px',
    fontWeight: '600',
    letterSpacing: '2px',
    textTransform: 'uppercase',
    cursor: 'pointer',
  },
};

export default Home;