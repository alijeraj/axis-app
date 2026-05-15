import React, { useState } from 'react';

function ExportModal({ patternCategories, patterns, onClose, onExport }) {
  const [config, setConfig] = useState({
    name: '',
    progress: true,
    progressTimeframe: '7d',
    complexes: true,
    cbmSummary: false,
  });
  const [generating, setGenerating] = useState(false);

  const handleExport = async () => {
    setGenerating(true);
    try {
      await onExport(config);
    } finally {
      setGenerating(false);
    }
  };

  const Toggle = ({ label, checked, onChange }) => (
    <div
      onClick={() => onChange(!checked)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 16px',
        border: '1px solid ' + (checked ? 'rgba(142,196,224,0.4)' : 'rgba(142,196,224,0.15)'),
        borderRadius: '3px',
        background: checked ? 'rgba(142,196,224,0.06)' : 'rgba(142,196,224,0.02)',
        cursor: 'pointer',
        marginBottom: '10px',
      }}
    >
      <div style={{
        width: '16px', height: '16px', borderRadius: '2px',
        border: '2px solid ' + (checked ? 'rgba(142,196,224,0.7)' : 'rgba(142,196,224,0.3)'),
        background: checked ? 'rgba(142,196,224,0.6)' : 'transparent',
        flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {checked && <span style={{ color: '#0d1b2a', fontSize: '11px', fontWeight: '700', lineHeight: 1 }}>✓</span>}
      </div>
      <span style={{ fontSize: '13px', color: checked ? '#D8E6F0' : '#A0C4D8', fontFamily: 'Georgia, serif' }}>{label}</span>
    </div>
  );

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 300, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', overflowY: 'auto', padding: '40px 20px' }}>
      <div style={{ background: '#162534', border: '1px solid rgba(142,196,224,0.3)', borderRadius: '4px', width: '100%', maxWidth: '560px', padding: '32px', boxShadow: '0 0 40px rgba(0,0,0,0.6)', margin: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div>
            <div style={{ fontFamily: 'Georgia, serif', fontSize: '24px', fontWeight: '300', color: '#D8E6F0' }}>Export PDF</div>
            <div style={{ fontSize: '11px', color: '#8BAFC8', marginTop: '4px' }}>Select what to include in your export.</div>
          </div>
          <button style={{ background: 'none', border: 'none', color: '#8BAFC8', cursor: 'pointer', fontSize: '18px' }} onClick={onClose}>✕</button>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '10px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', color: '#8BAFC8', marginBottom: '8px' }}>Name <span style={{ color: '#8BAFC8', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>— optional, appears on the contents page</span></label>
          <input
            style={{ width: '100%', background: '#0f2236', border: '1px solid rgba(142,196,224,0.2)', borderRadius: '3px', padding: '10px 14px', color: '#D8E6F0', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
            value={config.name}
            onChange={e => setConfig({ ...config, name: e.target.value })}
            placeholder="Your name (optional)"
          />
        </div>

        <Toggle label="Progress" checked={config.progress} onChange={v => setConfig({ ...config, progress: v })} />
        {config.progress && (
          <select
            style={{ background: '#0f2236', border: '1px solid rgba(142,196,224,0.2)', borderRadius: '3px', padding: '6px 10px', color: '#D8E6F0', fontSize: '11px', outline: 'none', cursor: 'pointer', marginLeft: '28px', marginTop: '-4px', marginBottom: '12px' }}
            value={config.progressTimeframe}
            onChange={e => setConfig({ ...config, progressTimeframe: e.target.value })}
          >
            <option value="7d">7 Days</option>
            <option value="4w">4 Weeks</option>
            <option value="12m">12 Months</option>
          </select>
        )}

        <Toggle label="Complexes" checked={config.complexes} onChange={v => setConfig({ ...config, complexes: v })} />

        <Toggle label="Behavioral Map (summary)" checked={config.cbmSummary} onChange={v => setConfig({ ...config, cbmSummary: v })} />

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '28px', paddingTop: '16px', borderTop: '1px solid rgba(142,196,224,0.15)' }}>
          <button style={{ background: 'none', border: '1px solid rgba(142,196,224,0.2)', borderRadius: '3px', padding: '10px 20px', color: '#8BAFC8', fontSize: '11px', cursor: 'pointer' }} onClick={onClose}>Cancel</button>
          <button
            style={{ background: 'rgba(142,196,224,0.15)', border: '1px solid rgba(142,196,224,0.4)', borderRadius: '3px', padding: '10px 24px', color: '#8EC4E0', fontSize: '11px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer' }}
            onClick={handleExport}
            disabled={generating}
          >
            {generating ? 'Generating...' : 'Generate PDF'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ExportModal;