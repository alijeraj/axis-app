import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Page, AppHeader, PageBody } from '../components/Layout';

const API = 'https://axis-backend-production-5e9b.up.railway.app';

const LEVELS = [
  { value: 1, label: 'Level 1 — Grandparents' },
  { value: 2, label: 'Level 2 — Parents, aunts, uncles' },
  { value: 3, label: 'Level 3 — Self, siblings, cousins' },
  { value: 4, label: 'Level 4 — Children, nieces, nephews, godchildren' },
];



const MAP_VIEWS = [
  { id: 'family', label: 'Family Tree' },
  { id: 'romantic', label: 'Romantic History' },
  { id: 'friendships', label: 'Friendships' },
  { id: 'none', label: 'None — Unassigned' },
];

const ROMANTIC_ROLES = [
  { value: '', label: '-- None --' },
  { value: 'current', label: 'Current Partner' },
  { value: 'past', label: 'Past Partner' },
  { value: 'fling', label: 'Fling' },
  { value: 'interest', label: 'Romantic Interest' },
];

const LIFE_STAGES = [
  { value: 'adolescence', label: 'Adolescence (13–17)' },
  { value: 'earlyAdulthood', label: 'Early Adulthood (18–26)' },
  { value: 'midAdulthood', label: 'Mid Adulthood (27–39)' },
  { value: 'matureAdulthood', label: 'Mature Adulthood (40+)' },
];

const PATTERN_COLORS = [
  '#E8B84A', // yellow
  '#E89048', // orange
  '#E87878', // red
  '#D88AB0', // pink
  '#A07AC4', // purple
  '#7DA8E0', // blue
  '#5DB8A6', // teal
  '#7DB860', // green
  '#A88860', // brown
  '#D8D8D8', // white/silver
  '#5C5C5C', // dark gray
  '#000000', // black
];

const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

const NODE_W = 140;
const NODE_H = 60;
const GRID = 20;
const snap = (v) => Math.round(v / GRID) * GRID;

// Romantic view layout constants
const STAGE_COL_W = 320;
const STAGE_HEADER_H = 40;
const SELF_ANCHOR_W = 160;

const getCurrentPartner = (p) => p.currentPartner || p.partner || null;
const getPastPartners = (p) => Array.isArray(p.pastPartners) ? p.pastPartners : [];

function ComplexViewModal({ complex, onClose }) {
  if (!complex) return null;
  const c = complex;
  const hasCounter = c.counter && c.counter.trim();
  const hasCounterBehavior = c.counterBehavior && c.counterBehavior.trim();
  const W = 220; const CW = 180; const GAP = 16;

  const Arrow = ({ up, color }) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '28px' }}>
      {up && <div style={{ borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderBottom: `7px solid ${color || 'rgba(142,196,224,0.35)'}` }} />}
      <div style={{ width: '2px', flex: 1, background: color || 'rgba(142,196,224,0.35)' }} />
      {!up && <div style={{ borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: `7px solid ${color || 'rgba(142,196,224,0.35)'}` }} />}
    </div>
  );

  const FlowNode = ({ label, text, isBurden, isTrigger, isCounter }) => (
    <div style={{ border: `1px solid ${isCounter ? 'rgba(74,174,136,0.3)' : isBurden ? 'rgba(176,90,90,0.35)' : isTrigger ? 'rgba(200,168,80,0.3)' : 'rgba(142,196,224,0.2)'}`, borderRadius: '3px', padding: '12px 14px', background: isCounter ? 'rgba(74,174,136,0.06)' : isBurden ? 'rgba(176,90,90,0.08)' : isTrigger ? 'rgba(200,168,80,0.06)' : 'rgba(142,196,224,0.04)', width: '100%', boxSizing: 'border-box' }}>
      <div style={{ fontSize: '8px', fontWeight: '700', letterSpacing: '3px', textTransform: 'uppercase', color: isCounter ? '#4AAE88' : isBurden ? '#C87878' : isTrigger ? '#C8A840' : '#8EC4E0', marginBottom: '6px' }}>{label}</div>
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
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 400, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', overflowY: 'auto', padding: '40px 20px' }}>
      <div style={{ background: '#162534', border: '1px solid rgba(142,196,224,0.3)', borderRadius: '4px', width: '100%', maxWidth: '560px', padding: '32px', boxShadow: '0 0 40px rgba(0,0,0,0.6)', margin: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div>
            <div style={{ fontFamily: 'Georgia, serif', fontSize: '22px', fontWeight: '300', color: '#D8E6F0' }}>{c.name}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
              <span style={{ fontSize: '8px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', padding: '3px 8px', borderRadius: '2px', color: c.status === 'resolved' ? '#4AAE88' : '#C87878', background: c.status === 'resolved' ? 'rgba(74,174,136,0.12)' : 'rgba(176,90,90,0.12)', border: c.status === 'resolved' ? '1px solid rgba(74,174,136,0.3)' : '1px solid rgba(176,90,90,0.3)' }}>{c.status || 'active'}</span>
              {c.originalWound && <span style={{ fontSize: '9px', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', color: '#C8A840', border: '1px dashed #C8A840', padding: '2px 7px', borderRadius: '2px' }}>Original Wound</span>}
            </div>
          </div>
          <button style={{ background: 'none', border: 'none', color: '#8BAFC8', cursor: 'pointer', fontSize: '18px' }} onClick={onClose}>✕</button>
        </div>
        <div style={{ overflowX: 'auto', paddingBottom: '8px', marginTop: '24px' }}>
          <Row main={<FlowNode label="Emotional Burden" text={c.burden || ''} isBurden />} counter={<div />} connector={<div />} />
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
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid rgba(142,196,224,0.15)' }}>
          <button style={{ background: 'rgba(142,196,224,0.15)', border: '1px solid rgba(142,196,224,0.4)', borderRadius: '3px', padding: '10px 24px', color: '#8EC4E0', fontSize: '11px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer' }} onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

function PatternManagementModal({ categories, patterns, onClose, onUpdateCategories, onUpdatePatterns }) {
  const [editingCatId, setEditingCatId] = React.useState(null);
  const [editingCatName, setEditingCatName] = React.useState('');
  const [editingPatternId, setEditingPatternId] = React.useState(null);
  const [editingPatternName, setEditingPatternName] = React.useState('');
  const [editingPatternColor, setEditingPatternColor] = React.useState('');

  const startEditCategory = (cat) => {
    setEditingCatId(cat.id);
    setEditingCatName(cat.name);
  };

  const saveEditCategory = async () => {
    if (!editingCatName.trim()) return;
    const updated = categories.map(c => c.id === editingCatId ? { ...c, name: editingCatName.trim() } : c);
    await onUpdateCategories(updated);
    setEditingCatId(null);
    setEditingCatName('');
  };

  const deleteCategory = async (catId) => {
    const cat = categories.find(c => c.id === catId);
    const catPatterns = patterns.filter(p => p.categoryId === catId);
    const msg = catPatterns.length > 0
      ? `Delete "${cat.name}" and its ${catPatterns.length} pattern${catPatterns.length > 1 ? 's' : ''}? This cannot be undone.`
      : `Delete "${cat.name}"? This cannot be undone.`;
    if (!window.confirm(msg)) return;
    const updatedCats = categories.filter(c => c.id !== catId);
    const updatedPatterns = patterns.filter(p => p.categoryId !== catId);
    await onUpdateCategories(updatedCats);
    if (catPatterns.length > 0) await onUpdatePatterns(updatedPatterns);
  };

  const startEditPattern = (pat) => {
    setEditingPatternId(pat.id);
    setEditingPatternName(pat.name);
    setEditingPatternColor(pat.color);
  };

  const saveEditPattern = async () => {
    if (!editingPatternName.trim()) return;
    const updated = patterns.map(p => p.id === editingPatternId ? { ...p, name: editingPatternName.trim(), color: editingPatternColor } : p);
    await onUpdatePatterns(updated);
    setEditingPatternId(null);
    setEditingPatternName('');
    setEditingPatternColor('');
  };

  const deletePattern = async (patId) => {
    const pat = patterns.find(p => p.id === patId);
    if (!window.confirm(`Delete pattern "${pat.name}"? People assigned to this pattern will lose their assignment. This cannot be undone.`)) return;
    const updated = patterns.filter(p => p.id !== patId);
    await onUpdatePatterns(updated);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 250, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', overflowY: 'auto', padding: '40px 20px' }}>
      <div style={{ background: '#162534', border: '1px solid rgba(142,196,224,0.3)', borderRadius: '4px', width: '100%', maxWidth: '620px', padding: '32px', boxShadow: '0 0 40px rgba(0,0,0,0.6)', margin: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <div style={{ fontFamily: 'Georgia, serif', fontSize: '22px', fontWeight: '300', color: '#D8E6F0' }}>Manage Patterns</div>
            <div style={{ fontSize: '11px', color: '#8BAFC8', marginTop: '4px' }}>Rename, recolor, or delete pattern categories and patterns.</div>
          </div>
          <button style={{ background: 'none', border: 'none', color: '#8BAFC8', cursor: 'pointer', fontSize: '18px' }} onClick={onClose}>✕</button>
        </div>

        {categories.length === 0 && (
          <div style={{ fontSize: '13px', color: '#8BAFC8', fontStyle: 'italic', padding: '32px', border: '1px dashed rgba(142,196,224,0.15)', borderRadius: '3px', textAlign: 'center', fontFamily: 'Georgia, serif' }}>
            No pattern categories yet. Create one by editing a person.
          </div>
        )}

        {categories.map(cat => {
          const catPatterns = patterns.filter(p => p.categoryId === cat.id);
          return (
            <div key={cat.id} style={{ marginBottom: '20px', padding: '16px', border: '1px solid rgba(142,196,224,0.15)', borderRadius: '3px', background: 'rgba(142,196,224,0.02)' }}>
              {editingCatId === cat.id ? (
                <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
                  <input
                    style={{ ...styles.input, flex: 1 }}
                    value={editingCatName}
                    onChange={e => setEditingCatName(e.target.value)}
                    autoFocus
                    onKeyDown={e => { if (e.key === 'Enter') saveEditCategory(); if (e.key === 'Escape') { setEditingCatId(null); setEditingCatName(''); } }}
                  />
                  <button style={styles.smallBtn} onClick={saveEditCategory}>Save</button>
                  <button style={styles.smallBtn} onClick={() => { setEditingCatId(null); setEditingCatName(''); }}>Cancel</button>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', color: '#A0C4D8' }}>{cat.name}</div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button style={styles.smallBtn} onClick={() => startEditCategory(cat)}>Rename</button>
                    <button style={{ ...styles.smallBtn, color: '#C87878', borderColor: 'rgba(176,90,90,0.3)' }} onClick={() => deleteCategory(cat.id)}>Delete</button>
                  </div>
                </div>
              )}

              {catPatterns.length === 0 && (
                <div style={{ fontSize: '11px', color: '#8BAFC8', fontStyle: 'italic', padding: '12px', textAlign: 'center' }}>
                  No patterns in this category yet.
                </div>
              )}

              {catPatterns.map(pat => (
                <div key={pat.id} style={{ marginBottom: '8px' }}>
                  {editingPatternId === pat.id ? (
                    <div style={{ padding: '12px', background: 'rgba(142,196,224,0.06)', border: '1px solid rgba(142,196,224,0.2)', borderRadius: '3px' }}>
                      <input
                        style={{ ...styles.input, marginBottom: '10px' }}
                        value={editingPatternName}
                        onChange={e => setEditingPatternName(e.target.value)}
                        autoFocus
                        onKeyDown={e => { if (e.key === 'Enter') saveEditPattern(); if (e.key === 'Escape') { setEditingPatternId(null); } }}
                      />
                      <div style={{ fontSize: '9px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', color: '#8BAFC8', marginBottom: '6px' }}>Color</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
                        {PATTERN_COLORS.map(c => (
                          <div
                            key={c}
                            onClick={() => setEditingPatternColor(c)}
                            style={{
                              width: '24px', height: '24px', borderRadius: '50%',
                              background: c, cursor: 'pointer',
                              border: editingPatternColor === c ? '2px solid #D8E6F0' : '2px solid transparent',
                              boxShadow: editingPatternColor === c ? '0 0 6px rgba(216,230,240,0.4)' : 'none',
                            }}
                          />
                        ))}
                      </div>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button style={styles.smallBtn} onClick={saveEditPattern}>Save</button>
                        <button style={styles.smallBtn} onClick={() => setEditingPatternId(null)}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(142,196,224,0.04)', border: '1px solid rgba(142,196,224,0.15)', borderRadius: '3px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ width: '14px', height: '14px', borderRadius: '50%', background: pat.color, flexShrink: 0 }} />
                        <span style={{ fontSize: '13px', color: '#D8E6F0', fontFamily: 'Georgia, serif' }}>{pat.name}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button style={styles.smallBtn} onClick={() => startEditPattern(pat)}>Edit</button>
                        <button style={{ ...styles.smallBtn, color: '#C87878', borderColor: 'rgba(176,90,90,0.3)' }} onClick={() => deletePattern(pat.id)}>Delete</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          );
        })}

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid rgba(142,196,224,0.15)' }}>
          <button style={styles.btn} onClick={onClose}>Done</button>
        </div>
      </div>
    </div>
  );
}

function PatternPickerSection({ categories, patterns, personPatterns, onChange, onAddCategory, onAddPattern }) {
  const [addingCategory, setAddingCategory] = React.useState(false);
  const [newCatName, setNewCatName] = React.useState('');
  const [addingPatternFor, setAddingPatternFor] = React.useState(null);
  const [newPatternName, setNewPatternName] = React.useState('');
  const [newPatternColor, setNewPatternColor] = React.useState(PATTERN_COLORS[0]);

  const handleAddCategory = async () => {
    const trimmed = newCatName.trim();
    if (!trimmed) return;
    await onAddCategory(trimmed);
    setNewCatName('');
    setAddingCategory(false);
  };

  const handleAddPattern = async (categoryId) => {
    const trimmed = newPatternName.trim();
    if (!trimmed) return;
    const newPattern = await onAddPattern(categoryId, trimmed, newPatternColor);
    if (newPattern) {
      onChange({ ...personPatterns, [categoryId]: newPattern.id });
    }
    setNewPatternName('');
    setNewPatternColor(PATTERN_COLORS[0]);
    setAddingPatternFor(null);
  };

  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        <label style={{ fontSize: '10px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', color: '#8BAFC8' }}>Patterns <span style={{ color: '#8BAFC8', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>— optional</span></label>
        {!addingCategory && (
          <button type="button" style={{ background: 'none', border: '1px solid rgba(142,196,224,0.2)', borderRadius: '2px', padding: '4px 10px', color: '#8BAFC8', fontSize: '10px', cursor: 'pointer' }} onClick={() => setAddingCategory(true)}>+ Category</button>
        )}
      </div>

      {addingCategory && (
        <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
          <input
            style={{ ...styles.input, flex: 1 }}
            value={newCatName}
            onChange={e => setNewCatName(e.target.value)}
            placeholder="New category name (e.g., 'Personality Disorder', 'MBTI')..."
            autoFocus
            onKeyDown={e => { if (e.key === 'Enter') handleAddCategory(); if (e.key === 'Escape') { setAddingCategory(false); setNewCatName(''); } }}
          />
          <button type="button" style={styles.smallBtn} onClick={handleAddCategory}>Add</button>
          <button type="button" style={styles.smallBtn} onClick={() => { setAddingCategory(false); setNewCatName(''); }}>Cancel</button>
        </div>
      )}

      {categories.length === 0 && !addingCategory && (
        <div style={{ fontSize: '11px', color: '#8BAFC8', fontStyle: 'italic', padding: '12px', border: '1px dashed rgba(142,196,224,0.15)', borderRadius: '3px', textAlign: 'center' }}>
          No pattern categories yet. Add one to start tagging patterns.
        </div>
      )}

      {categories.map(cat => {
        const catPatterns = patterns.filter(p => p.categoryId === cat.id);
        const selectedId = personPatterns[cat.id] || '';
        return (
          <div key={cat.id} style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '9px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', color: '#A0C4D8', marginBottom: '6px' }}>{cat.name}</div>
            <select
              style={styles.input}
              value={selectedId === '__new__' ? '' : selectedId}
              onChange={e => {
                if (e.target.value === '__new__') {
                  setAddingPatternFor(cat.id);
                } else {
                  const updated = { ...personPatterns };
                  if (e.target.value) updated[cat.id] = e.target.value;
                  else delete updated[cat.id];
                  onChange(updated);
                }
              }}
            >
              <option value="">-- None --</option>
              {catPatterns.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
              <option value="__new__">+ New pattern in {cat.name}...</option>
            </select>

            {addingPatternFor === cat.id && (
              <div style={{ marginTop: '8px', padding: '12px', background: 'rgba(142,196,224,0.04)', border: '1px solid rgba(142,196,224,0.2)', borderRadius: '3px' }}>
                <input
                  style={{ ...styles.input, marginBottom: '10px' }}
                  value={newPatternName}
                  onChange={e => setNewPatternName(e.target.value)}
                  placeholder={`New pattern in ${cat.name}...`}
                  autoFocus
                  onKeyDown={e => { if (e.key === 'Enter') handleAddPattern(cat.id); if (e.key === 'Escape') { setAddingPatternFor(null); setNewPatternName(''); } }}
                />
                <div style={{ fontSize: '9px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', color: '#8BAFC8', marginBottom: '6px' }}>Color</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
                  {PATTERN_COLORS.map(c => (
                    <div
                      key={c}
                      onClick={() => setNewPatternColor(c)}
                      style={{
                        width: '24px', height: '24px', borderRadius: '50%',
                        background: c, cursor: 'pointer',
                        border: newPatternColor === c ? '2px solid #D8E6F0' : '2px solid transparent',
                        boxShadow: newPatternColor === c ? '0 0 6px rgba(216,230,240,0.4)' : 'none',
                      }}
                    />
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button type="button" style={styles.smallBtn} onClick={() => handleAddPattern(cat.id)}>Save</button>
                  <button type="button" style={styles.smallBtn} onClick={() => { setAddingPatternFor(null); setNewPatternName(''); }}>Cancel</button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function DirectoryGroup({ label, count, children }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div style={{ marginBottom: '32px' }}>
      <div
        onClick={() => setOpen(!open)}
        style={{
          fontFamily: 'Georgia, serif',
          fontSize: '24px',
          fontWeight: '300',
          color: '#8EC4E0',
          marginBottom: '16px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          userSelect: 'none',
          padding: '12px 0',
          borderBottom: '1px solid rgba(142,196,224,0.15)',
        }}
      >
        <span style={{ fontSize: '14px', display: 'inline-block', transition: 'transform 0.15s', transform: open ? 'rotate(90deg)' : 'rotate(0deg)', color: '#8EC4E0' }}>▶</span>
        <span>{label}</span>
        <span style={{ fontSize: '13px', color: '#8BAFC8', fontFamily: 'system-ui, sans-serif', fontWeight: '400', letterSpacing: '1px' }}>{count}</span>
      </div>
      {open && <div style={{ marginTop: '8px' }}>{children}</div>}
    </div>
  );
}

function CollapsibleSection({ label, color, defaultOpen, children }) {
  const [open, setOpen] = React.useState(defaultOpen);
  return (
    <div style={{ marginTop: '20px' }}>
      <div
        onClick={() => setOpen(!open)}
        style={{
          fontSize: '9px',
          fontWeight: '600',
          letterSpacing: '3px',
          textTransform: 'uppercase',
          color: color,
          marginBottom: '8px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          userSelect: 'none',
        }}
      >
        <span style={{ fontSize: '10px', display: 'inline-block', transition: 'transform 0.15s', transform: open ? 'rotate(90deg)' : 'rotate(0deg)' }}>▶</span>
        {label}
      </div>
      {open && <div>{children}</div>}
    </div>
  );
}

function PersonDetailModal({ person, complexes, dreams, patternCategories, patterns, onClose, onEdit, onOpenComplex, onOpenDream }) {
  const [viewingDream, setViewingDream] = React.useState(null);
  if (!person) return null;
  const linkedComplexes = complexes.filter(c => c.person === person.name);
  const linkedDreams = dreams.filter(d => {
    const ppl = Array.isArray(d.people) ? d.people : [];
    return ppl.includes(person.name);
  });
  const sortedDreams = linkedDreams.slice().sort((a, b) => {
    const ay = a.year ? parseInt(a.year) : 0;
    const by = b.year ? parseInt(b.year) : 0;
    return by - ay;
  });
  const cur = getCurrentPartner(person);
  const past = getPastPartners(person);

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 200, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', overflowY: 'auto', padding: '40px 20px' }}>
      <div style={{ background: '#162534', border: '1px solid rgba(142,196,224,0.3)', borderRadius: '4px', width: '100%', maxWidth: '560px', padding: '32px', boxShadow: '0 0 40px rgba(0,0,0,0.6)', margin: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div>
            <div style={{ fontFamily: 'Georgia, serif', fontSize: '24px', fontWeight: '300', color: '#D8E6F0' }}>
              {person.name}
              {person.isSelf && <span style={{ color: '#C8A840', marginLeft: '8px', fontSize: '16px' }}>◉</span>}
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '6px', flexWrap: 'wrap' }}>
              {person.level && <span style={{ fontSize: '10px', color: '#8BAFC8', letterSpacing: '1px' }}>Level {person.level}</span>}
              {person.familyOrigin && person.familyOrigin !== 'none' && <span style={{ fontSize: '10px', color: '#8BAFC8', letterSpacing: '1px', textTransform: 'uppercase' }}>· {person.familyOrigin}</span>}
              {person.romanticRole && <span style={{ fontSize: '10px', color: '#C8A840', letterSpacing: '1px', textTransform: 'uppercase' }}>· {person.romanticRole}</span>}
              {person.lifeStage && <span style={{ fontSize: '10px', color: '#8BAFC8', letterSpacing: '1px' }}>· {LIFE_STAGES.find(s => s.value === person.lifeStage)?.label || ''}</span>}
              {cur && <span style={{ fontSize: '10px', color: '#C8A840', letterSpacing: '1px' }}>· ↔ {cur}</span>}
              {past.length > 0 && <span style={{ fontSize: '10px', color: '#8BAFC8', letterSpacing: '1px', fontStyle: 'italic' }}>· past: {past.join(', ')}</span>}
            </div>
            {person.patterns && Object.keys(person.patterns).length > 0 && patternCategories && patterns && (
              <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {Object.entries(person.patterns).map(([catId, patternId], i) => {
                  const cat = patternCategories.find(c => c.id === catId);
                  const pat = patterns.find(pp => pp.id === patternId);
                  if (!cat || !pat) return null;
                  return (
                    <div key={i} style={{ fontSize: '12px', color: '#A0C4D8', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: pat.color, flexShrink: 0 }} />
                      <span>{cat.name}: <strong style={{ color: '#D8E6F0', fontStyle: 'normal' }}>{pat.name}</strong></span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <button style={{ background: 'none', border: 'none', color: '#8BAFC8', cursor: 'pointer', fontSize: '18px' }} onClick={onClose}>✕</button>
        </div>

        {linkedComplexes.length > 0 && (
          <CollapsibleSection label={`Complexes (${linkedComplexes.length})`} color="#8BAFC8" defaultOpen={true}>
            {linkedComplexes.map((c, i) => (
              <div key={i} onClick={() => onOpenComplex(c)} style={{ border: '1px solid rgba(74,174,136,0.25)', borderRadius: '3px', padding: '10px 14px', background: 'rgba(74,174,136,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', marginBottom: '6px' }}>
                <div>
                  <div style={{ fontSize: '13px', color: '#D8E6F0', fontFamily: 'Georgia, serif' }}>{c.name}</div>
                  {c.burden && <div style={{ fontSize: '9px', color: '#8BAFC8', letterSpacing: '1px', marginTop: '2px', textTransform: 'uppercase' }}>{c.burden}</div>}
                </div>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M4 2 L9 6 L4 10" stroke="rgba(74,174,136,0.5)" strokeWidth="1.5" strokeLinecap="round" /></svg>
              </div>
            ))}
          </CollapsibleSection>
        )}

        {sortedDreams.length > 0 && (
          <CollapsibleSection label={`Dreams (${sortedDreams.length})`} color="#B07ED4" defaultOpen={false}>
            {sortedDreams.map((d, i) => (
              <div key={i} onClick={() => setViewingDream(d)} style={{ border: '1px solid rgba(176,126,212,0.2)', borderRadius: '3px', padding: '10px 14px', background: 'rgba(176,126,212,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', marginBottom: '6px' }}>
                <div>
                  <div style={{ fontSize: '13px', color: '#D8E6F0', fontFamily: 'Georgia, serif' }}>{d.title || 'Untitled Dream'}</div>
                  {d.year && <div style={{ fontSize: '9px', color: '#8BAFC8', letterSpacing: '1px', marginTop: '2px' }}>{d.year}</div>}
                </div>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M4 2 L9 6 L4 10" stroke="rgba(176,126,212,0.5)" strokeWidth="1.5" strokeLinecap="round" /></svg>
              </div>
            ))}
          </CollapsibleSection>
        )}

        {viewingDream && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 300, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', overflowY: 'auto', padding: '40px 20px' }}>
            <div style={{ background: '#162534', border: '1px solid rgba(176,126,212,0.3)', borderRadius: '4px', width: '100%', maxWidth: '520px', padding: '32px', boxShadow: '0 0 40px rgba(0,0,0,0.6)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div style={{ fontFamily: 'Georgia, serif', fontSize: '22px', fontWeight: '300', color: '#D8E6F0' }}>{viewingDream.title || 'Untitled Dream'}</div>
                <button style={{ background: 'none', border: 'none', color: '#8BAFC8', cursor: 'pointer', fontSize: '18px' }} onClick={() => setViewingDream(null)}>✕</button>
              </div>
              {viewingDream.date && <div style={{ fontSize: '10px', fontWeight: '600', letterSpacing: '3px', textTransform: 'uppercase', color: '#8BAFC8', marginBottom: '20px' }}>{new Date(viewingDream.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</div>}
              {[
                { key: 'narrative', label: 'Narrative' },
                { key: 'people', label: 'Who Appeared' },
                { key: 'symbols', label: 'Symbols & Recurring Themes' },
                { key: 'reflection', label: 'Reflection' },
              ].map(field => {
                const val = viewingDream[field.key];
                if (!val) return null;
                const display = Array.isArray(val) ? val.join(', ') : val;
                if (!display || (typeof display === 'string' && !display.trim())) return null;
                return (
                  <div key={field.key} style={{ marginBottom: '20px' }}>
                    <div style={{ fontSize: '9px', fontWeight: '600', letterSpacing: '3px', textTransform: 'uppercase', color: '#8BAFC8', marginBottom: '8px' }}>{field.label}</div>
                    <div style={{ fontSize: '13px', color: '#D8E6F0', fontFamily: 'Georgia, serif', lineHeight: 1.7, whiteSpace: 'pre-line' }}>{display}</div>
                  </div>
                );
              })}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button style={{ background: 'rgba(176,126,212,0.1)', border: '1px solid rgba(176,126,212,0.3)', borderRadius: '3px', padding: '10px 24px', color: '#B07ED4', fontSize: '11px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer' }} onClick={() => setViewingDream(null)}>Close</button>
              </div>
            </div>
          </div>
        )}

        {linkedComplexes.length === 0 && sortedDreams.length === 0 && (
          <div style={{ marginTop: '24px', padding: '24px', textAlign: 'center', color: '#8BAFC8', fontSize: '13px', fontStyle: 'italic', fontFamily: 'Georgia, serif' }}>
            No complexes or dreams linked yet.
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '28px', paddingTop: '16px', borderTop: '1px solid rgba(142,196,224,0.15)' }}>
          <button style={{ background: 'none', border: '1px solid rgba(142,196,224,0.2)', borderRadius: '3px', padding: '10px 20px', color: '#8BAFC8', fontSize: '11px', cursor: 'pointer' }} onClick={onClose}>Close</button>
          <button style={{ background: 'rgba(142,196,224,0.15)', border: '1px solid rgba(142,196,224,0.4)', borderRadius: '3px', padding: '10px 20px', color: '#8EC4E0', fontSize: '11px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer' }} onClick={onEdit}>Edit</button>
        </div>
      </div>
    </div>
  );
}

function MapCanvas({ people, mapView, selfPerson, patternCategories, patterns, activeCategoryId, onPersonClick, onSavePositions }) {
  const viewportRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [panX, setPanX] = useState(20);
  const [panY, setPanY] = useState(20);
  const [positions, setPositions] = useState({});
  const isDragging = useRef(false);
  const isPanning = useRef(false);
  const dragPerson = useRef(null);
  const dragOffset = useRef({ x: 0, y: 0 });
  const panStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const hasMoved = useRef(false);
  const dragStartXY = useRef({ x: 0, y: 0 });

  // Filter people to those that belong on this map view
  const onMap = people.filter(p => {
    if (mapView === 'family') {
      if (!p.level) return false;
      return !p.mapView || p.mapView === 'family';
    }
    if (mapView === 'romantic') {
      if (p.isSelf) return true;
      if (p.romanticRole) return true;
      // Backwards compat: if marked as past partner of self, include
      if (selfPerson) {
        const cur = getCurrentPartner(selfPerson);
        const past = getPastPartners(selfPerson);
        if (cur === p.name || past.includes(p.name)) return true;
      }
      return false;
    }
    if (mapView === 'friendships') {
      return p.mapView === 'friendships';
    }
    return false;
  });

  const posKey = mapView === 'family' ? 'mapX' : `mapX_${mapView}`;
  const posKeyY = mapView === 'family' ? 'mapY' : `mapY_${mapView}`;

  // Default position generators per view
  const defaultPositionFor = (p, idx) => {
    if (mapView === 'romantic') {
      if (p.isSelf) {
        return { x: 20, y: 200 };
      }
      const stageIdx = LIFE_STAGES.findIndex(s => s.value === p.lifeStage);
      const col = stageIdx >= 0 ? stageIdx : 0;
      const baseX = SELF_ANCHOR_W + 60 + col * STAGE_COL_W + 40;
      const sameStageBefore = onMap.filter((other, i) => i < idx && other.lifeStage === p.lifeStage && !other.isSelf).length;
      return { x: baseX, y: STAGE_HEADER_H + 40 + sameStageBefore * (NODE_H + 20) };
    }
    if (mapView === 'friendships') {
      // Place in earliest life stage column, centered horizontally within the column
      const stages = Array.isArray(p.lifeStages) ? p.lifeStages : [];
      const earliestIdx = stages.length > 0
        ? Math.min(...stages.map(s => LIFE_STAGES.findIndex(ls => ls.value === s)).filter(i => i >= 0))
        : 0;
      const colCenter = 40 + earliestIdx * STAGE_COL_W + (STAGE_COL_W / 2);
      const baseX = colCenter - (NODE_W / 2);
      const sameStageBefore = onMap.filter((other, i) => {
        if (i >= idx) return false;
        const otherStages = Array.isArray(other.lifeStages) ? other.lifeStages : [];
        const otherEarliest = otherStages.length > 0
          ? Math.min(...otherStages.map(s => LIFE_STAGES.findIndex(ls => ls.value === s)).filter(i => i >= 0))
          : 0;
        return otherEarliest === earliestIdx;
      }).length;
      return { x: baseX, y: STAGE_HEADER_H + 40 + sameStageBefore * (NODE_H + 20) };
    }
    return { x: 40 + (idx % 6) * (NODE_W + 20), y: ((p.level - 1) * (NODE_H + 40)) + 40 };
  };

  useEffect(() => {
    const pos = {};
    onMap.forEach((p, i) => {
      const x = p[posKey];
      const y = p[posKeyY];
      if (typeof x === 'number' && typeof y === 'number') {
        pos[p.name] = { x, y };
      } else {
        pos[p.name] = defaultPositionFor(p, i);
      }
    });
    setPositions(pos);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [people.length, mapView]);

  let totalW = 1000, totalH = 600;
  if (mapView === 'romantic') {
    totalW = SELF_ANCHOR_W + 60 + LIFE_STAGES.length * STAGE_COL_W + 100;
    totalH = 700;
  }
  if (mapView === 'friendships') {
    totalW = 40 + LIFE_STAGES.length * STAGE_COL_W + 100;
    totalH = 700;
  }
  Object.values(positions).forEach(p => {
    if (p.x + NODE_W + 100 > totalW) totalW = p.x + NODE_W + 100;
    if (p.y + NODE_H + 100 > totalH) totalH = p.y + NODE_H + 100;
  });

  // Pairings (only for family view)
  const pairings = [];
  const drawnPairs = new Set();
  if (mapView === 'family') {
    onMap.forEach(p => {
      const cur = getCurrentPartner(p);
      if (cur && positions[p.name] && positions[cur]) {
        const key = [p.name, cur].sort().join('|');
        if (!drawnPairs.has(key)) {
          drawnPairs.add(key);
          pairings.push({ a: p.name, b: cur, current: true });
        }
      }
    });
  }

  // Parent-child only on family view
  const parentChildLinks = [];
  if (mapView === 'family') {
    onMap.forEach(p => {
      const parents = Array.isArray(p.parents) ? p.parents : [];
      parents.forEach(parentName => {
        if (positions[p.name] && positions[parentName]) {
          parentChildLinks.push({ parent: parentName, child: p.name });
        }
      });
    });
  }

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const onMouseDown = (e) => {
      const personEl = e.target.closest('[data-person]');
      if (personEl) {
        const personName = personEl.getAttribute('data-person');
        const pos = positions[personName];
        if (!pos) return;
        isDragging.current = true;
        hasMoved.current = false;
        dragStartXY.current = { x: e.clientX, y: e.clientY };
        dragPerson.current = personName;
        const rect = viewport.getBoundingClientRect();
        const mouseX = (e.clientX - rect.left - panX) / scale;
        const mouseY = (e.clientY - rect.top - panY) / scale;
        dragOffset.current = { x: mouseX - pos.x, y: mouseY - pos.y };
        e.preventDefault();
      } else {
        isPanning.current = true;
        panStart.current = { x: e.clientX, y: e.clientY, panX, panY };
        viewport.style.cursor = 'grabbing';
        e.preventDefault();
      }
    };

    const onMouseMove = (e) => {
      if (isDragging.current && dragPerson.current) {
        const dx = e.clientX - dragStartXY.current.x;
        const dy = e.clientY - dragStartXY.current.y;
        if (Math.abs(dx) > 3 || Math.abs(dy) > 3) hasMoved.current = true;
        const rect = viewport.getBoundingClientRect();
        const mouseX = (e.clientX - rect.left - panX) / scale;
        const mouseY = (e.clientY - rect.top - panY) / scale;
        const newX = snap(mouseX - dragOffset.current.x);
        const newY = snap(mouseY - dragOffset.current.y);
        setPositions(prev => ({ ...prev, [dragPerson.current]: { x: newX, y: newY } }));
      } else if (isPanning.current) {
        setPanX(panStart.current.panX + (e.clientX - panStart.current.x));
        setPanY(panStart.current.panY + (e.clientY - panStart.current.y));
      }
    };

    const onMouseUp = () => {
      if (isDragging.current && dragPerson.current) {
        if (hasMoved.current) {
          onSavePositions(mapView, { ...positions });
        } else {
          const clickedPerson = onMap.find(p => p.name === dragPerson.current);
          if (clickedPerson) onPersonClick(clickedPerson);
        }
      }
      isDragging.current = false;
      isPanning.current = false;
      dragPerson.current = null;
      hasMoved.current = false;
      viewport.style.cursor = 'grab';
    };

    const onWheel = (e) => {
      e.preventDefault();
      const rect = viewport.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
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
  }, [panX, panY, scale, positions, mapView]); // eslint-disable-line react-hooks/exhaustive-deps

  if (onMap.length === 0) {
    let msg = 'No people on this map yet.';
    if (mapView === 'family') msg = 'No people on the Family Tree yet. Edit a person, set their level and Map View to Family Tree.';
    if (mapView === 'romantic') msg = 'No one on Romantic History yet. Edit a person and set their Romantic Role to Current Partner, Past Partner, or Romantic Interest.';
    if (mapView === 'friendships') msg = 'No one on Friendships yet. Edit a person and set their Map View to Friendships.';
    return (
      <div style={{ textAlign: 'center', padding: '80px 40px', fontFamily: 'Georgia, serif', fontStyle: 'italic', color: '#8BAFC8' }}>
        {msg}
      </div>
    );
  }

  // Compute nuclear family set (for silver treatment) — only on family view
  const nuclearSet = new Set();
  if (selfPerson && mapView === 'family') {
    const selfParents = Array.isArray(selfPerson.parents) ? selfPerson.parents : [];
    selfParents.forEach(n => nuclearSet.add(n));
    if (selfParents.length > 0) {
      people.forEach(p => {
        if (p.name === selfPerson.name) return;
        const pParents = Array.isArray(p.parents) ? p.parents : [];
        if (pParents.some(n => selfParents.includes(n))) nuclearSet.add(p.name);
      });
    }
    const cur = getCurrentPartner(selfPerson);
    if (cur) nuclearSet.add(cur);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', padding: '0 32px' }}>
        <button style={styles.treeCtrlBtn} onClick={() => setScale(s => Math.min(3, s + 0.2))}>+</button>
        <button style={styles.treeCtrlBtn} onClick={() => setScale(s => Math.max(0.2, s - 0.2))}>−</button>
        <button style={{ ...styles.treeCtrlBtn, fontSize: '9px', letterSpacing: '2px', padding: '0 12px' }} onClick={() => { setScale(1); setPanX(20); setPanY(20); }}>Fit</button>
        <span style={{ fontSize: '10px', color: '#8BAFC8', letterSpacing: '2px' }}>{Math.round(scale * 100)}%</span>
        <span style={{ fontSize: '9px', color: 'rgba(142,196,224,0.55)', marginLeft: '8px', letterSpacing: '1px', fontStyle: 'italic' }}>Drag people to position. Click to view.</span>
      </div>
      <div ref={viewportRef} style={{ flex: 1, overflow: 'hidden', background: 'rgba(142,196,224,0.02)', cursor: 'grab', position: 'relative', borderTop: '1px solid rgba(142,196,224,0.1)' }}>
        <div data-export-target={'people-' + mapView} data-export-width={totalW} data-export-height={totalH} style={{ position: 'absolute', transformOrigin: '0 0', transform: `translate(${panX}px,${panY}px) scale(${scale})`, willChange: 'transform', width: totalW, height: totalH }}>
          <svg style={{ position: 'absolute', top: 0, left: 0, width: totalW, height: totalH, pointerEvents: 'none' }}>
            <defs>
              <pattern id="grid" width={GRID} height={GRID} patternUnits="userSpaceOnUse">
                <path d={`M ${GRID} 0 L 0 0 0 ${GRID}`} fill="none" stroke="rgba(142,196,224,0.04)" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* Romantic view: life stage column dividers */}
            {mapView === 'romantic' && LIFE_STAGES.map((stage, i) => {
              const x = SELF_ANCHOR_W + 60 + i * STAGE_COL_W;
              return (
                <line key={`stage-divider-${i}`} x1={x} y1={STAGE_HEADER_H} x2={x} y2={totalH} stroke="rgba(142,196,224,0.1)" strokeWidth="1" />
              );
            })}
            {mapView === 'romantic' && (
              <line x1={SELF_ANCHOR_W + 60 + LIFE_STAGES.length * STAGE_COL_W} y1={STAGE_HEADER_H} x2={SELF_ANCHOR_W + 60 + LIFE_STAGES.length * STAGE_COL_W} y2={totalH} stroke="rgba(142,196,224,0.1)" strokeWidth="1" />
            )}
            {/* Friendships view: life stage column dividers */}
            {mapView === 'friendships' && LIFE_STAGES.map((stage, i) => {
              const x = 40 + i * STAGE_COL_W;
              return (
                <line key={`fs-divider-${i}`} x1={x} y1={STAGE_HEADER_H} x2={x} y2={totalH} stroke="rgba(142,196,224,0.1)" strokeWidth="1" />
              );
            })}
            {mapView === 'friendships' && (
              <line x1={40 + LIFE_STAGES.length * STAGE_COL_W} y1={STAGE_HEADER_H} x2={40 + LIFE_STAGES.length * STAGE_COL_W} y2={totalH} stroke="rgba(142,196,224,0.1)" strokeWidth="1" />
            )}

            {pairings.map((pair, i) => {
              const a = positions[pair.a];
              const b = positions[pair.b];
              if (!a || !b) return null;
              const ax = a.x + NODE_W / 2;
              const ay = a.y + NODE_H / 2;
              const bx = b.x + NODE_W / 2;
              const by = b.y + NODE_H / 2;
              const stroke = pair.current ? 'rgba(200,168,80,0.5)' : 'rgba(142,196,224,0.35)';
              const dash = pair.current ? 'none' : '4,3';
              return <line key={`pair-${i}`} x1={ax} y1={ay} x2={bx} y2={by} stroke={stroke} strokeWidth="1.5" strokeDasharray={dash} />;
            })}

            {parentChildLinks.map((link, i) => {
              const pp = positions[link.parent];
              const cp = positions[link.child];
              if (!pp || !cp) return null;
              const px = pp.x + NODE_W / 2;
              const py = pp.y + NODE_H;
              const cx = cp.x + NODE_W / 2;
              const cy = cp.y;
              const midY = py + (cy - py) / 2;
              return (
                <path
                  key={`pc-${i}`}
                  d={`M ${px} ${py} L ${px} ${midY} L ${cx} ${midY} L ${cx} ${cy}`}
                  fill="none"
                  stroke="rgba(142,196,224,0.35)"
                  strokeWidth="1.5"
                  strokeDasharray="4,3"
                />
              );
            })}
          </svg>

          {/* Romantic view: life stage column headers */}
          {mapView === 'romantic' && LIFE_STAGES.map((stage, i) => {
            const x = SELF_ANCHOR_W + 60 + i * STAGE_COL_W;
            return (
              <div key={`stage-header-${i}`} style={{ position: 'absolute', left: x, top: 0, width: STAGE_COL_W, height: STAGE_HEADER_H, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '700', letterSpacing: '3px', textTransform: 'uppercase', color: '#8EC4E0' }}>
                {stage.label}
              </div>
            );
          })}
          {/* Friendships view: life stage column headers */}
          {mapView === 'friendships' && LIFE_STAGES.map((stage, i) => {
            const x = 40 + i * STAGE_COL_W;
            return (
              <div key={`fs-header-${i}`} style={{ position: 'absolute', left: x, top: 0, width: STAGE_COL_W, height: STAGE_HEADER_H, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '700', letterSpacing: '3px', textTransform: 'uppercase', color: '#8EC4E0' }}>
                {stage.label}
              </div>
            );
          })}

          {onMap.map(p => {
            const pos = positions[p.name];
            if (!pos) return null;
            const isExt = p.familyOrigin === 'external';
            const isCurrentRomantic = mapView === 'romantic' && p.romanticRole === 'current';
            const isPastRomantic = mapView === 'romantic' && p.romanticRole === 'past';
            const isFling = mapView === 'romantic' && p.romanticRole === 'fling';
            const isInterest = mapView === 'romantic' && p.romanticRole === 'interest';

            // Pattern coloring takes priority when a category is active
            let activePattern = null;
            if (activeCategoryId && p.patterns && p.patterns[activeCategoryId]) {
              activePattern = patterns.find(pat => pat.id === p.patterns[activeCategoryId]);
            }

            let borderStyle, bgColor, textColor, nameWeight;

            if (activeCategoryId) {
              // Pattern view: only pattern colors. No gold, no silver.
              if (activePattern) {
                const c = activePattern.color;
                borderStyle = `2px solid ${c}`;
                bgColor = c + '15'; // ~8% opacity tint
                textColor = '#D8E6F0';
                nameWeight = '700';
              } else {
                // No pattern in active category — muted treatment
                borderStyle = '1px solid rgba(142,196,224,0.2)';
                bgColor = 'rgba(142,196,224,0.03)';
                textColor = 'rgba(216,230,240,0.5)';
                nameWeight = '500';
              }
            } else {
              // No category active: original gold/silver/default treatment
              const isGold = p.isSelf || isCurrentRomantic;
              const isSilver = !isGold && nuclearSet.has(p.name);

              if (isGold) {
                borderStyle = '2px solid rgba(200,168,80,0.7)';
                bgColor = 'rgba(200,168,80,0.08)';
                textColor = '#E8D08C';
                nameWeight = '700';
              } else if (isSilver) {
                borderStyle = '2px solid rgba(170,185,200,0.7)';
                bgColor = 'rgba(170,185,200,0.08)';
                textColor = '#C8D4E0';
                nameWeight = '700';
              } else if (isInterest) {
                borderStyle = '1px solid rgba(142,196,224,0.4)';
                bgColor = 'transparent';
                textColor = 'rgba(160,180,196,0.7)';
                nameWeight = '400';
              } else if (isFling) {
                borderStyle = '1px solid rgba(142,196,224,0.4)';
                bgColor = 'rgba(142,196,224,0.10)';
                textColor = '#C8D8E4';
                nameWeight = '500';
              } else if (isPastRomantic) {
                borderStyle = '1px solid rgba(142,196,224,0.4)';
                bgColor = 'rgba(142,196,224,0.22)';
                textColor = '#E4ECF4';
                nameWeight = '700';
              } else {
                borderStyle = isExt ? '1px dashed rgba(142,196,224,0.4)' : '1px solid rgba(142,196,224,0.4)';
                bgColor = 'rgba(142,196,224,0.06)';
                textColor = '#D8E6F0';
                nameWeight = '600';
              }
            }

            const mainNode = (
              <div
                key={p.name}
                data-person={p.name}
                onClick={(e) => { e.stopPropagation(); }}
                style={{
                  position: 'absolute',
                  left: pos.x,
                  top: pos.y,
                  width: NODE_W,
                  height: NODE_H,
                  border: borderStyle,
                  borderRadius: '3px',
                  background: bgColor,
                  padding: '8px 12px',
                  cursor: 'move',
                  boxSizing: 'border-box',
                  overflow: 'hidden',
                  userSelect: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
                  <span style={{ fontSize: '13px', fontWeight: nameWeight, color: textColor, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontStyle: isInterest ? 'italic' : 'normal' }}>{p.name}</span>
                  {p.isSelf && <span style={{ color: '#C8A840', fontSize: '11px', flexShrink: 0 }}>◉</span>}
                  {isCurrentRomantic && <span style={{ color: '#C8A840', fontSize: '9px', flexShrink: 0, letterSpacing: '1px' }}>NOW</span>}
                </div>
                {activeCategoryId && activePattern && <div style={{ fontSize: '9px', color: textColor, fontStyle: 'italic', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '2px' }}>{activePattern.name}</div>}
              </div>
            );

            // For friendships: render ghost copies in additional life stage columns
            const ghosts = [];
            if (mapView === 'friendships') {
              const stages = Array.isArray(p.lifeStages) ? p.lifeStages : [];
              const earliestIdx = stages.length > 0
                ? Math.min(...stages.map(s => LIFE_STAGES.findIndex(ls => ls.value === s)).filter(i => i >= 0))
                : -1;
              stages.forEach(stage => {
                const stageIdx = LIFE_STAGES.findIndex(ls => ls.value === stage);
                if (stageIdx < 0 || stageIdx === earliestIdx) return;
                const ghostColCenter = 40 + stageIdx * STAGE_COL_W + (STAGE_COL_W / 2);
                const ghostX = ghostColCenter - (NODE_W / 2);
                const ghostY = pos.y;
                ghosts.push(
                  <div
                    key={`${p.name}-ghost-${stage}`}
                    onClick={() => onPersonClick(p)}
                    style={{
                      position: 'absolute',
                      left: ghostX,
                      top: ghostY,
                      width: NODE_W,
                      height: NODE_H,
                      border: borderStyle,
                      borderRadius: '3px',
                      background: bgColor,
                      padding: '8px 12px',
                      cursor: 'pointer',
                      boxSizing: 'border-box',
                      overflow: 'hidden',
                      userSelect: 'none',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center',
                      opacity: 0.55,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
                      <span style={{ fontSize: '13px', fontWeight: nameWeight, color: textColor, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</span>
                    </div>
                  </div>
                );
              });
            }

            return [mainNode, ...ghosts];
          })}
        </div>
      </div>
    </div>
  );
}

function People() {
  const navigate = useNavigate();
  const token = localStorage.getItem('axis_token');
  const initialView = (() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('view') === 'map' ? 'map' : 'directory';
  })();
  const initialMapView = (() => {
    const params = new URLSearchParams(window.location.search);
    const m = params.get('map');
    return ['family', 'romantic', 'friendships'].includes(m) ? m : 'family';
  })();
  const initialCategory = (() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('category') || '';
  })();
  const [people, setPeople] = useState([]);
  const [complexes, setComplexes] = useState([]);
  const [dreams, setDreams] = useState([]);
  const [patternCategories, setPatternCategories] = useState([]);
  const [patterns, setPatterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editIdx, setEditIdx] = useState(null);
  const [form, setForm] = useState({ name: '', level: '', patterns: {}, currentPartner: '', pastPartners: [], familyOrigin: '', isSelf: false, parents: [], mapView: 'family', romanticRole: '', lifeStage: '', lifeStages: [] });
  const [saving, setSaving] = useState(false);
  const filterLevel = 'all';
  const [view, setView] = useState(initialView);
  const [mapView, setMapView] = useState(initialMapView);
  const [activeCategoryId, setActiveCategoryId] = useState(initialCategory);
  const [detailPerson, setDetailPerson] = useState(null);
  const [showPatternMgmt, setShowPatternMgmt] = useState(false);
  const [viewComplex, setViewComplex] = useState(null);

  useEffect(() => { loadData(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadData = async () => {
    try {
      const [peopleRes, complexRes, dreamsRes, catsRes, patternsRes] = await Promise.all([
        axios.get(`${API}/api/people`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/api/complexes`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/api/dreams`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/api/pattern-categories`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/api/patterns`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      setPeople(peopleRes.data || []);
      setComplexes(complexRes.data || []);
      setDreams(dreamsRes.data || []);
      setPatternCategories(catsRes.data || []);
      setPatterns(patternsRes.data || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const addPatternCategory = async (name) => {
    const newCat = { id: newId(), name, order: patternCategories.length };
    const updated = [...patternCategories, newCat];
    await axios.post(`${API}/api/pattern-categories`, { data: updated }, { headers: { Authorization: `Bearer ${token}` } });
    setPatternCategories(updated);
    return newCat;
  };

  const addPattern = async (categoryId, name, color) => {
    const newP = { id: newId(), categoryId, name, color };
    const updated = [...patterns, newP];
    await axios.post(`${API}/api/patterns`, { data: updated }, { headers: { Authorization: `Bearer ${token}` } });
    setPatterns(updated);
    return newP;
  };

  const updatePatternCategories = async (updated) => {
    await axios.post(`${API}/api/pattern-categories`, { data: updated }, { headers: { Authorization: `Bearer ${token}` } });
    setPatternCategories(updated);
  };

  const updatePatterns = async (updated) => {
    await axios.post(`${API}/api/patterns`, { data: updated }, { headers: { Authorization: `Bearer ${token}` } });
    setPatterns(updated);
  };

  const savePeople = async (updated) => {
    await axios.post(`${API}/api/people`, { data: updated }, { headers: { Authorization: `Bearer ${token}` } });
    setPeople(updated);
  };

  const savePositions = async (currentMapView, positions) => {
    const xKey = currentMapView === 'family' ? 'mapX' : `mapX_${currentMapView}`;
    const yKey = currentMapView === 'family' ? 'mapY' : `mapY_${currentMapView}`;
    const updated = people.map(p => {
      if (positions[p.name]) {
        return { ...p, [xKey]: positions[p.name].x, [yKey]: positions[p.name].y };
      }
      return p;
    });
    await savePeople(updated);
  };

  const openForm = (idx = null) => {
    if (idx !== null) {
      const p = people[idx];
      setForm({
        name: p.name || '',
        level: p.level || '',
        patterns: p.patterns && typeof p.patterns === 'object' ? p.patterns : {},
        currentPartner: getCurrentPartner(p) || '',
        pastPartners: getPastPartners(p),
        familyOrigin: p.familyOrigin || '',
        isSelf: !!p.isSelf,
        parents: Array.isArray(p.parents) ? p.parents : [],
        mapView: p.mapView || 'family',
        romanticRole: p.romanticRole || '',
        lifeStage: p.lifeStage || '',
        lifeStages: Array.isArray(p.lifeStages) ? p.lifeStages : [],
      });
      setEditIdx(idx);
    } else {
      setForm({ name: '', level: '', patterns: {}, currentPartner: '', pastPartners: [], familyOrigin: '', isSelf: false, parents: [], mapView: 'none', romanticRole: '', lifeStage: '', lifeStages: [] });
      setEditIdx(null);
    }
    setShowForm(true);
    setDetailPerson(null);
  };

  const savePerson = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const existing = editIdx !== null ? people[editIdx] : {};
      const oldName = existing.name;
      const newName = form.name.trim();
      const oldCurrentPartner = getCurrentPartner(existing);
      const oldPastPartners = getPastPartners(existing);
      const payload = {
        ...existing,
        name: newName,
        level: form.level ? parseInt(form.level) : null,
        patterns: form.patterns || {},
        currentPartner: form.currentPartner || null,
        pastPartners: form.pastPartners,
        familyOrigin: form.familyOrigin || null,
        isSelf: !!form.isSelf,
        parents: form.parents,
        mapView: form.mapView || 'family',
        romanticRole: form.romanticRole || null,
        lifeStage: form.lifeStage || null,
        lifeStages: form.lifeStages || [],
      };
      delete payload.partner;
      delete payload.pattern;

      const oldStages = JSON.stringify(Array.isArray(existing.lifeStages) ? existing.lifeStages : []);
      const newStages = JSON.stringify(payload.lifeStages);
      if (oldStages !== newStages) {
        delete payload.mapX_friendships;
        delete payload.mapY_friendships;
      }
      if (existing.lifeStage !== payload.lifeStage) {
        delete payload.mapX_romantic;
        delete payload.mapY_romantic;
      }
      let updated;
      if (editIdx !== null) {
        updated = [...people];
        updated[editIdx] = payload;
      } else {
        updated = [...people, payload];
      }

      // Mirror partner links bidirectionally
      if (payload.currentPartner) {
        updated = updated.map(p => {
          if (p.name === payload.currentPartner) {
            const theirPast = getPastPartners(p).filter(n => n !== newName);
            return { ...p, currentPartner: newName, pastPartners: theirPast };
          }
          return p;
        });
      }
      if (oldCurrentPartner && oldCurrentPartner !== payload.currentPartner) {
        updated = updated.map(p => {
          if (p.name === oldCurrentPartner && getCurrentPartner(p) === oldName) {
            return { ...p, currentPartner: null };
          }
          return p;
        });
      }
      payload.pastPartners.forEach(partnerName => {
        updated = updated.map(p => {
          if (p.name === partnerName) {
            const theirPast = getPastPartners(p);
            const theirCurrent = getCurrentPartner(p);
            const newPast = theirPast.includes(newName) ? theirPast : [...theirPast, newName];
            const newCurrent = theirCurrent === newName ? null : theirCurrent;
            return { ...p, pastPartners: newPast, currentPartner: newCurrent };
          }
          return p;
        });
      });
      const removedPast = oldPastPartners.filter(n => !payload.pastPartners.includes(n));
      removedPast.forEach(removedName => {
        updated = updated.map(p => {
          if (p.name === removedName) {
            return { ...p, pastPartners: getPastPartners(p).filter(n => n !== oldName) };
          }
          return p;
        });
      });

      if (payload.isSelf) {
        updated = updated.map((p, i) => {
          if ((editIdx !== null && i === editIdx) || (editIdx === null && i === updated.length - 1)) return p;
          return { ...p, isSelf: false };
        });
      }
      await savePeople(updated);
      setShowForm(false);
    } finally {
      setSaving(false);
    }
  };

  const deletePerson = async (idx) => {
    const name = people[idx]?.name || 'this person';
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    const updated = people.filter((_, i) => i !== idx);
    await savePeople(updated);
  };

  if (loading) return <div style={{ color: '#8BAFC8', padding: '48px', textAlign: 'center' }}>Loading...</div>;

  const selfPerson = people.find(p => p.isSelf);

  if (showForm) {
    const otherPeople = people.filter((_, i) => i !== editIdx).slice().sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    const eligibleParents = otherPeople.filter(p => !form.parents.includes(p.name));
    const eligiblePast = otherPeople.filter(p => !form.pastPartners.includes(p.name) && form.currentPartner !== p.name);
    return (
      <Page>
        <AppHeader backLabel="← Cancel" onBack={() => setShowForm(false)} title={editIdx !== null ? 'Edit Person' : 'Add Person'} />
        <PageBody width="reading">
          <div style={styles.card}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Name</label>
              <input style={styles.input} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Who is this person?" autoFocus />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Map View <span style={{ color: '#8BAFC8', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>— which map this person belongs to</span></label>
              <select style={styles.input} value={form.mapView} onChange={e => setForm({ ...form, mapView: e.target.value })}>
                {MAP_VIEWS.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
              </select>
            </div>

            {form.mapView === 'romantic' && !form.isSelf && (
              <>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Romantic Role <span style={{ color: '#8BAFC8', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>— what role they played romantically</span></label>
                  <select style={styles.input} value={form.romanticRole} onChange={e => setForm({ ...form, romanticRole: e.target.value })}>
                    {ROMANTIC_ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Life Stage <span style={{ color: '#8BAFC8', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>— when in your life this person was present</span></label>
                  <select style={styles.input} value={form.lifeStage} onChange={e => setForm({ ...form, lifeStage: e.target.value })}>
                    <option value="">-- Not specified --</option>
                    {LIFE_STAGES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
              </>
            )}

            {form.mapView === 'friendships' && (
              <div style={styles.formGroup}>
                <label style={styles.label}>Life Stages <span style={{ color: '#8BAFC8', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>— select every stage this person was present in your life</span></label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {LIFE_STAGES.map(s => {
                    const isSelected = form.lifeStages.includes(s.value);
                    return (
                      <button
                        key={s.value}
                        type="button"
                        onClick={() => {
                          const updated = isSelected
                            ? form.lifeStages.filter(x => x !== s.value)
                            : [...form.lifeStages, s.value];
                          // Sort by canonical order
                          const sorted = LIFE_STAGES.filter(ls => updated.includes(ls.value)).map(ls => ls.value);
                          setForm({ ...form, lifeStages: sorted });
                        }}
                        style={{
                          background: isSelected ? 'rgba(142,196,224,0.12)' : 'rgba(142,196,224,0.03)',
                          border: '1px solid ' + (isSelected ? 'rgba(142,196,224,0.6)' : 'rgba(142,196,224,0.15)'),
                          borderRadius: '3px',
                          padding: '10px 12px',
                          textAlign: 'left',
                          cursor: 'pointer',
                          color: isSelected ? '#D8E6F0' : '#A0C4D8',
                          fontSize: '12px',
                          fontWeight: '600',
                        }}
                      >
                        {s.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {form.mapView === 'family' && (
              <>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Level <span style={{ color: '#8BAFC8', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>— optional, required for family tree</span></label>
                  <select style={styles.input} value={form.level} onChange={e => setForm({ ...form, level: e.target.value })}>
                    <option value="">-- Not on family tree --</option>
                    {LEVELS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                  </select>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Current Partner <span style={{ color: '#8BAFC8', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>— optional</span></label>
                  <select style={styles.input} value={form.currentPartner} onChange={e => setForm({ ...form, currentPartner: e.target.value })}>
                    <option value="">-- None --</option>
                    {otherPeople.filter(p => !form.pastPartners.includes(p.name)).map((p, i) => <option key={i} value={p.name}>{p.name}</option>)}
                  </select>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Parents <span style={{ color: '#8BAFC8', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>— optional, who are this person's parents on the map</span></label>
                  <select style={styles.input} value="" onChange={e => { if (e.target.value) setForm({ ...form, parents: [...form.parents, e.target.value] }); }}>
                    <option value="">{form.parents.length === 0 ? '-- Add a parent --' : '-- Add another parent --'}</option>
                    {eligibleParents.map((p, i) => <option key={i} value={p.name}>{p.name}</option>)}
                  </select>
                  {form.parents.length > 0 && (
                    <div style={{ marginTop: '10px' }}>
                      {form.parents.map((name, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(142,196,224,0.06)', border: '1px solid rgba(142,196,224,0.25)', borderRadius: '3px', marginTop: '6px' }}>
                          <span style={{ fontSize: '13px', color: '#A0C4D8', fontFamily: 'Georgia, serif' }}>{name}</span>
                          <button type="button" style={{ background: 'none', border: 'none', color: '#8BAFC8', cursor: 'pointer', fontSize: '14px', padding: '0 4px' }} onClick={() => setForm({ ...form, parents: form.parents.filter(n => n !== name) })}>✕</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {(!people.some(p => p.isSelf) || form.isSelf) && (
                  <div style={{ ...styles.selfToggle, ...(form.isSelf ? styles.selfToggleActive : {}) }} onClick={() => setForm({ ...form, isSelf: !form.isSelf })}>
                    <div style={{ ...styles.selfDot, ...(form.isSelf ? styles.selfDotActive : {}) }} />
                    <div>
                      <div style={styles.selfLabel}>This is me</div>
                      <div style={styles.selfDesc}>Mark this person as the center of the map. Only one person can be marked as self.</div>
                    </div>
                  </div>
                )}
              </>
            )}

            {form.isSelf && (
              <div style={styles.formGroup}>
                <label style={styles.label}>Past Partners <span style={{ color: '#8BAFC8', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>— optional</span></label>
                <select style={styles.input} value="" onChange={e => { if (e.target.value) setForm({ ...form, pastPartners: [...form.pastPartners, e.target.value] }); }}>
                  <option value="">{form.pastPartners.length === 0 ? '-- Add a past partner --' : '-- Add another past partner --'}</option>
                  {eligiblePast.map((p, i) => <option key={i} value={p.name}>{p.name}</option>)}
                </select>
                {form.pastPartners.length > 0 && (
                  <div style={{ marginTop: '10px' }}>
                    {form.pastPartners.map((name, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(142,196,224,0.06)', border: '1px solid rgba(142,196,224,0.25)', borderRadius: '3px', marginTop: '6px' }}>
                        <span style={{ fontSize: '13px', color: '#A0C4D8', fontFamily: 'Georgia, serif' }}>{name}</span>
                        <button type="button" style={{ background: 'none', border: 'none', color: '#8BAFC8', cursor: 'pointer', fontSize: '14px', padding: '0 4px' }} onClick={() => setForm({ ...form, pastPartners: form.pastPartners.filter(n => n !== name) })}>✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <PatternPickerSection
              categories={patternCategories}
              patterns={patterns}
              personPatterns={form.patterns}
              onChange={(updated) => setForm({ ...form, patterns: updated })}
              onAddCategory={addPatternCategory}
              onAddPattern={addPattern}
            />

            <div style={styles.formFooter}>
              <button style={styles.cancelBtn} onClick={() => setShowForm(false)}>Cancel</button>
              <button style={styles.btn} onClick={savePerson} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
            </div>
          </div>
        </PageBody>
      </Page>
    );
  }

  const getPersonGroup = (p) => {
    if (p.mapView === 'none') return 'unassigned';
    if (p.mapView === 'family') return 'family';
    if (p.mapView === 'romantic') return 'romantic';
    if (p.mapView === 'friendships') return 'friendships';
    // Legacy fallback: people with a level but no mapView are family
    if (!p.mapView && p.level) return 'family';
    if (!p.mapView && p.romanticRole) return 'romantic';
    return 'unassigned';
  };

  const filtered = filterLevel === 'all'
    ? people
    : people.filter(p => getPersonGroup(p) === filterLevel);

  // Group people by map
  const grouped = { family: [], romantic: [], friendships: [], unassigned: [] };
  filtered.forEach(p => { grouped[getPersonGroup(p)].push(p); });

  // Sort each group: self first in family, then alphabetical
  Object.keys(grouped).forEach(g => {
    grouped[g].sort((a, b) => {
      if (a.isSelf && !b.isSelf) return -1;
      if (!a.isSelf && b.isSelf) return 1;
      return (a.name || '').localeCompare(b.name || '');
    });
  });

  const groupLabels = {
    family: 'Family Tree',
    romantic: 'Romantic History',
    friendships: 'Friendships',
    unassigned: 'Unassigned',
  };
  const groupOrder = ['family', 'romantic', 'friendships', 'unassigned'];

  return (
    <Page>
      {showPatternMgmt && (
        <PatternManagementModal
          categories={patternCategories}
          patterns={patterns}
          onClose={() => setShowPatternMgmt(false)}
          onUpdateCategories={updatePatternCategories}
          onUpdatePatterns={updatePatterns}
        />
      )}

      {viewComplex && (
        <ComplexViewModal complex={viewComplex} onClose={() => setViewComplex(null)} />
      )}

      {detailPerson && (
        <PersonDetailModal
          person={detailPerson}
          complexes={complexes}
          dreams={dreams}
          patternCategories={patternCategories}
          patterns={patterns}
          onClose={() => setDetailPerson(null)}
          onEdit={() => { const idx = people.findIndex(p => p.name === detailPerson.name); if (idx !== -1) openForm(idx); }}
          onOpenComplex={(c) => { setDetailPerson(null); setViewComplex(c); }}
          onOpenDream={(d) => { setDetailPerson(null); navigate('/journal'); }}
        />
      )}

      <AppHeader
        title="Relational Map"
        right={<button style={styles.btn} onClick={() => openForm()}>+ Add Person</button>}
      />

      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid rgba(142,196,224,0.15)', padding: '0 32px', flexShrink: 0 }}>
        {[{ id: 'directory', label: 'Directory' }, { id: 'map', label: 'Map' }].map(t => (
          <button key={t.id} style={{ ...styles.tabBtn, ...(view === t.id ? styles.tabBtnActive : {}) }} onClick={() => setView(t.id)}>{t.label}</button>
        ))}
      </div>

      {view === 'directory' && (
        <PageBody width="content">
          {people.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 40px', color: '#8BAFC8' }}>
              <div style={{ fontSize: '13px', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '12px' }}>No people yet</div>
              <div style={{ fontSize: '13px', color: '#8BAFC8', lineHeight: 1.6, fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>The people who shaped you.<br />Add the ones who matter.</div>
            </div>
          ) : (
            <>
              
              {groupOrder.map(g => {
                if (grouped[g].length === 0) return null;
                return (
                  <DirectoryGroup key={g} label={groupLabels[g]} count={grouped[g].length}>
                    <div style={styles.grid}>
                      {grouped[g].map((p) => {
                        const realIdx = people.indexOf(p);
                        const cur = getCurrentPartner(p);
                        return (
                          <div key={realIdx} style={{ ...styles.card2, ...(p.isSelf ? { borderColor: 'rgba(200,168,80,0.5)', background: 'rgba(200,168,80,0.04)' } : {}) }} onClick={(e) => { if (!e.target.closest('button')) setDetailPerson(p); }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px' }}>
                              <div style={{ fontFamily: 'Georgia, serif', fontSize: '16px', fontWeight: '300', color: '#D8E6F0', lineHeight: 1.4 }}>
                                {p.name}
                                {p.isSelf && <span style={{ color: '#C8A840', marginLeft: '6px', fontSize: '12px' }}>◉</span>}
                              </div>
                              {p.level && <span style={{ fontSize: '9px', fontWeight: '600', letterSpacing: '2px', color: '#8BAFC8' }}>L{p.level}</span>}
                            </div>
                            {p.patterns && Object.keys(p.patterns).length > 0 && (
                              <div style={{ marginBottom: '4px' }}>
                                {Object.entries(p.patterns).map(([catId, patternId], i) => {
                                  const cat = patternCategories.find(c => c.id === catId);
                                  const pat = patterns.find(pp => pp.id === patternId);
                                  if (!cat || !pat) return null;
                                  return (
                                    <div key={i} style={{ fontSize: '10px', color: '#A0C4D8', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: pat.color, flexShrink: 0 }} />
                                      <span>{cat.name}: {pat.name}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                            {p.romanticRole && <div style={{ fontSize: '10px', color: '#C8A840', letterSpacing: '0.5px', textTransform: 'uppercase' }}>{p.romanticRole}{p.lifeStage ? ` · ${LIFE_STAGES.find(s => s.value === p.lifeStage)?.label || ''}` : ''}</div>}
                            {cur && <div style={{ fontSize: '10px', color: '#C8A840', letterSpacing: '0.5px' }}>↔ {cur}</div>}
                            {getPastPartners(p).length > 0 && <div style={{ fontSize: '10px', color: '#8BAFC8', letterSpacing: '0.5px', fontStyle: 'italic' }}>past: {getPastPartners(p).join(', ')}</div>}
                            {p.familyOrigin && p.familyOrigin !== 'none' && <div style={{ fontSize: '9px', color: '#8BAFC8', textTransform: 'uppercase', letterSpacing: '1.5px', marginTop: '4px', opacity: 0.7 }}>{p.familyOrigin}</div>}
                            <div style={styles.cardFooter}>
                              <button style={styles.smallBtn} onClick={e => { e.stopPropagation(); openForm(realIdx); }}>Edit</button>
                              <button style={{ ...styles.smallBtn, color: '#C87878', borderColor: 'rgba(176,90,90,0.3)', marginLeft: 'auto' }} onClick={e => { e.stopPropagation(); deletePerson(realIdx); }}>Delete</button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </DirectoryGroup>
                );
              })}
            </>
          )}
        </PageBody>
      )}

      {view === 'map' && (
        <PageBody width="full">
          <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid rgba(142,196,224,0.15)', padding: '0 32px', flexShrink: 0 }}>
            {MAP_VIEWS.filter(m => m.id !== 'none').map(m => (
              <button key={m.id} style={{ ...styles.subTabBtn, ...(mapView === m.id ? styles.subTabBtnActive : {}) }} onClick={() => setMapView(m.id)}>{m.label}</button>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 32px', borderBottom: '1px solid rgba(142,196,224,0.08)', flexShrink: 0 }}>
            <span style={{ fontSize: '9px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', color: '#8BAFC8' }}>View by:</span>
            <select
              style={{ background: '#0f2236', border: '1px solid rgba(142,196,224,0.2)', borderRadius: '3px', padding: '6px 10px', color: '#D8E6F0', fontSize: '12px', outline: 'none', cursor: 'pointer' }}
              value={activeCategoryId}
              onChange={e => setActiveCategoryId(e.target.value)}
            >
              <option value="">None</option>
              {patternCategories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <button style={{ ...styles.smallBtn, marginLeft: '4px' }} onClick={() => setShowPatternMgmt(true)}>Manage</button>
            {activeCategoryId && (() => {
              const activePatterns = patterns.filter(p => p.categoryId === activeCategoryId);
              if (activePatterns.length === 0) return null;
              return (
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginLeft: '16px', flexWrap: 'wrap' }}>
                  {activePatterns.map(p => (
                    <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: p.color, flexShrink: 0 }} />
                      <span style={{ fontSize: '11px', color: '#A0C4D8' }}>{p.name}</span>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
          <MapCanvas
            people={people}
            mapView={mapView}
            selfPerson={selfPerson}
            patternCategories={patternCategories}
            patterns={patterns}
            activeCategoryId={activeCategoryId}
            onPersonClick={(p) => setDetailPerson(p)}
            onSavePositions={savePositions}
          />
        </PageBody>
      )}
    </Page>
  );
}

const styles = {
  container: { minHeight: '100vh', background: '#0d1b2a', display: 'flex', flexDirection: 'column' },
  header: { display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 32px', borderBottom: '1px solid rgba(142,196,224,0.15)', background: '#0f2236', flexShrink: 0 },
  backBtn: { background: 'none', border: 'none', color: '#8BAFC8', fontSize: '12px', fontWeight: '600', letterSpacing: '1px', cursor: 'pointer', padding: 0 },
  screenTitle: { fontFamily: 'Georgia, serif', fontSize: '18px', fontWeight: '300', color: '#D8E6F0', letterSpacing: '2px', flex: 1 },
  body: { maxWidth: '900px', margin: '0 auto', padding: '40px 32px 80px', width: '100%' },
  filterBar: { display: 'flex', alignItems: 'flex-end', gap: '20px', marginBottom: '32px', paddingBottom: '20px', borderBottom: '1px solid rgba(142,196,224,0.1)' },
  filterGroup: { display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '280px' },
  filterLabel: { fontSize: '9px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', color: '#8BAFC8' },
  filterSelect: { background: '#0f2236', border: '1px solid rgba(142,196,224,0.2)', borderRadius: '3px', padding: '8px 12px', color: '#D8E6F0', fontSize: '13px', outline: 'none', cursor: 'pointer', minWidth: '280px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' },
  card2: { background: '#162534', border: '1px solid rgba(142,196,224,0.2)', borderRadius: '3px', padding: '16px 18px', cursor: 'pointer', transition: 'border-color 0.2s' },
  cardFooter: { display: 'flex', gap: '6px', marginTop: '12px', paddingTop: '10px', borderTop: '1px solid rgba(142,196,224,0.08)' },
  smallBtn: { background: 'none', border: '1px solid rgba(142,196,224,0.2)', borderRadius: '2px', padding: '4px 10px', color: '#8BAFC8', fontSize: '10px', cursor: 'pointer' },
  btn: { background: 'rgba(142,196,224,0.15)', border: '1px solid rgba(142,196,224,0.4)', borderRadius: '3px', padding: '10px 20px', color: '#8EC4E0', fontSize: '11px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer', whiteSpace: 'nowrap' },
  cancelBtn: { background: 'none', border: '1px solid rgba(142,196,224,0.2)', borderRadius: '3px', padding: '10px 20px', color: '#8BAFC8', fontSize: '11px', cursor: 'pointer' },
  card: { background: '#162534', border: '1px solid rgba(142,196,224,0.15)', borderRadius: '4px', padding: '32px' },
  formGroup: { marginBottom: '20px' },
  label: { display: 'block', fontSize: '10px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', color: '#8BAFC8', marginBottom: '8px' },
  input: { width: '100%', background: '#0f2236', border: '1px solid rgba(142,196,224,0.2)', borderRadius: '3px', padding: '10px 14px', color: '#D8E6F0', fontSize: '14px', outline: 'none', boxSizing: 'border-box' },
  formFooter: { display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' },
  selfToggle: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', border: '1px solid rgba(200,168,80,0.2)', borderRadius: '3px', background: 'rgba(200,168,80,0.03)', cursor: 'pointer', marginBottom: '20px' },
  selfToggleActive: { borderColor: 'rgba(200,168,80,0.5)', background: 'rgba(200,168,80,0.07)' },
  selfDot: { width: '16px', height: '16px', borderRadius: '50%', border: '2px solid rgba(200,168,80,0.4)', flexShrink: 0 },
  selfDotActive: { background: 'rgba(200,168,80,0.8)', borderColor: 'rgba(200,168,80,0.9)' },
  selfLabel: { fontSize: '9px', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(200,168,80,0.8)' },
  selfDesc: { fontSize: '11px', color: '#8BAFC8', marginTop: '2px' },
  tabBtn: { background: 'none', border: 'none', borderBottom: '2px solid transparent', padding: '12px 20px', color: '#8BAFC8', fontSize: '10px', fontWeight: '600', letterSpacing: '3px', textTransform: 'uppercase', cursor: 'pointer', marginBottom: '-1px' },
  tabBtnActive: { color: '#D8E6F0', borderBottomColor: '#8EC4E0' },
  subTabBtn: { background: 'none', border: 'none', borderBottom: '2px solid transparent', padding: '10px 16px', color: '#8BAFC8', fontSize: '9px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer', marginBottom: '-1px' },
  subTabBtnActive: { color: '#8EC4E0', borderBottomColor: '#8EC4E0' },
  treeCtrlBtn: { background: 'none', border: '1px solid rgba(142,196,224,0.2)', color: '#8BAFC8', cursor: 'pointer', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', borderRadius: '2px', padding: 0 },
};

export default People;