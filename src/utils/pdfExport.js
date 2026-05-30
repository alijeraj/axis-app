import jsPDF from 'jspdf';
// eslint-disable-next-line no-unused-vars
import html2canvas from 'html2canvas';

// ===== HELPERS =====
async function loadImageAsBase64(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      resolve({ dataUrl: canvas.toDataURL('image/png'), width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = reject;
    img.src = url;
  });
}

// ===== PAGE TEMPLATE =====
async function startNewPage(pdf, pageNumber, orientation = 'portrait') {
  pdf.addPage(orientation === 'landscape' ? [297, 210] : [210, 297], orientation);

  const pageWidth = orientation === 'landscape' ? 297 : 210;
  const pageHeight = orientation === 'landscape' ? 210 : 297;

  pdf.setFillColor(255, 255, 255);
  pdf.rect(0, 0, pageWidth, pageHeight, 'F');

  try {
    const logo = await loadImageAsBase64('/introspection-logo.png');
    const logoH = 22;
    const aspect = logo.width / logo.height;
    const logoW = logoH * aspect;
    pdf.addImage(logo.dataUrl, 'PNG', 12, -1, logoW, logoH);
  } catch (e) {
    pdf.setFont('times', 'normal');
    pdf.setFontSize(12);
    pdf.setTextColor(107, 163, 200);
    pdf.text('Introspection', 15, 13);
  }

  pdf.setDrawColor(200, 215, 225);
  pdf.setLineWidth(0.2);
  pdf.line(15, 17, pageWidth - 15, 17);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(140, 165, 185);
  pdf.text(String(pageNumber), pageWidth - 15, pageHeight - 10, { align: 'right' });

  return { pageWidth, pageHeight, contentTop: 27, contentBottom: pageHeight - 18 };
}

// ===== COVER PAGE =====
async function drawCoverPage(pdf) {
  pdf.setFillColor(255, 255, 255);
  pdf.rect(0, 0, 210, 297, 'F');

  try {
    const logo = await loadImageAsBase64('/introspection-logo.png');
    const targetHeightMm = 50;
    const aspectRatio = logo.width / logo.height;
    const targetWidthMm = targetHeightMm * aspectRatio;
    const logoX = 105 - targetWidthMm / 2;
    pdf.addImage(logo.dataUrl, 'PNG', logoX, 100, targetWidthMm, targetHeightMm);
  } catch (e) {
    pdf.setFont('times', 'normal');
    pdf.setTextColor(26, 32, 44);
    pdf.setFontSize(36);
    pdf.text('Introspection', 105, 130, { align: 'center' });
  }

  pdf.setDrawColor(192, 200, 208);
  pdf.setLineWidth(0.3);
  pdf.line(100, 168, 110, 168);

  pdf.setFont('times', 'italic');
  pdf.setFontSize(13);
  pdf.setTextColor(74, 85, 104);
  pdf.text('The art of inner mapping', 105, 182, { align: 'center' });

  pdf.setFont('times', 'normal');
  pdf.setFontSize(20);
  pdf.setTextColor(26, 32, 44);
  pdf.text('Navigate your inner world.', 105, 200, { align: 'center' });

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.setTextColor(160, 175, 190);
  const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  pdf.text(today, 105, 275, { align: 'center' });
}

// ===== CONTENTS PAGE =====
async function drawContentsPage(pdf, config, pageNumber) {
  const { pageWidth } = await startNewPage(pdf, pageNumber);
  const centerX = pageWidth / 2;

  const sections = [];
  if (config.progress) {
    const labels = { '7d': '7 Days', '4w': '4 Weeks', '12m': '12 Months' };
    sections.push('Progress · ' + (labels[config.progressTimeframe] || ''));
  }
  if (config.complexes) sections.push('Complexes');
  if (config.cbmSummary) sections.push('Behavior Log');

  let y = 110;

  pdf.setFont('times', 'normal');
  pdf.setFontSize(32);
  pdf.setTextColor(26, 50, 80);
  pdf.text('Personal Report', centerX, y, { align: 'center' });

  y += 10;
  pdf.setDrawColor(107, 163, 200);
  pdf.setLineWidth(0.4);
  pdf.line(centerX - 12, y, centerX + 12, y);

  y += 18;

  if (config.name && config.name.trim()) {
    pdf.setFont('times', 'normal');
    pdf.setFontSize(16);
    pdf.setTextColor(60, 95, 130);
    pdf.text(config.name.trim(), centerX, y, { align: 'center' });
    y += 12;
  }

  pdf.setFont('times', 'italic');
  pdf.setFontSize(12);
  pdf.setTextColor(107, 163, 200);
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  pdf.text(today, centerX, y, { align: 'center' });

  y += 25;

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.setTextColor(107, 163, 200);
  pdf.text('C O N T E N T S', centerX, y, { align: 'center' });

  y += 12;

  pdf.setFont('times', 'normal');
  pdf.setFontSize(13);
  pdf.setTextColor(40, 70, 100);

  sections.forEach(s => {
    pdf.text(s, centerX, y, { align: 'center' });
    y += 9;
  });
}

// ===== SHARED CONSTANTS =====
const ESM_ROWS = [
  { dimension: 'Survival',   burden: 'Fear',  liberated: 'Secure',     right: 'The right to feel safe' },
  { dimension: 'Action',     burden: 'Guilt', liberated: 'Free',       right: 'The right to autonomous expression' },
  { dimension: 'Identity',   burden: 'Shame', liberated: 'Empowered',  right: 'The right to be' },
  { dimension: 'Boundary',   burden: 'Anger', liberated: 'At Peace',   right: 'The right to be respected' },
  { dimension: 'Comparison', burden: 'Envy',  liberated: 'Abundant',   right: 'The right to be seen' },
  { dimension: 'Love',       burden: 'Grief', liberated: 'Connected',  right: 'The right to love and be loved' },
];

const BURDEN_RGB = {
  Fear:  [139, 90, 60],
  Guilt: [180, 160, 60],
  Shame: [200, 120, 50],
  Anger: [176, 90, 90],
  Envy:  [130, 90, 180],
  Grief: [160, 120, 130],
};
const LIBERATED_RGB = [74, 174, 136];
const COMPLEX_BURDEN_RGB = [200, 100, 100];
const COMPLEX_BLUE_RGB = [107, 163, 200];

// CBM AUC bands (must match cbmresults.js)
const CBM_BANDS = [
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

const bandForLoad = (load) => {
  if (load < 50) return null;
  for (let i = 0; i < CBM_BANDS.length; i++) {
    if (load >= CBM_BANDS[i].min && load < CBM_BANDS[i].max) return i;
  }
  return CBM_BANDS.length - 1;
};

async function fetchComplexes() {
  const token = localStorage.getItem('axis_token');
  const axios = (await import('axios')).default;
  const API = 'https://axis-backend-production-5e9b.up.railway.app';
  const res = await axios.get(API + '/api/complexes', { headers: { Authorization: 'Bearer ' + token } });
  return res.data || [];
}

// ===== COMPLEXES (flow chart per complex) =====
async function drawComplexes(pdf, pageNumber) {
  const complexes = await fetchComplexes();
  if (!complexes.length) return pageNumber;

  let { pageWidth, contentTop, contentBottom } = await startNewPage(pdf, pageNumber);
  pageNumber++;

  const margin = 18;
  const contentWidth = pageWidth - margin * 2;

  let y = contentTop + 8;
  pdf.setFont('times', 'normal');
  pdf.setFontSize(26);
  pdf.setTextColor(26, 50, 80);
  pdf.text('Complexes', pageWidth / 2, y + 8, { align: 'center' });

  pdf.setDrawColor(107, 163, 200);
  pdf.setLineWidth(0.4);
  pdf.line(pageWidth / 2 - 12, y + 13, pageWidth / 2 + 12, y + 13);

  y += 22;

  const splitLines = (text, w, fontSize) => {
    pdf.setFontSize(fontSize);
    return pdf.splitTextToSize(text || '', w);
  };

  for (const row of ESM_ROWS) {
    const burdenComplexes = complexes.filter(c => c.burden && c.burden.toLowerCase() === row.burden.toLowerCase());
    if (burdenComplexes.length === 0) continue;

    const burdenRgb = BURDEN_RGB[row.burden] || [100, 100, 100];

    if (y + 30 > contentBottom) {
      ({ pageWidth, contentTop, contentBottom } = await startNewPage(pdf, pageNumber));
      pageNumber++;
      y = contentTop + 8;
    }

    pdf.setFont('times', 'bold');
    pdf.setFontSize(16);
    pdf.setTextColor(burdenRgb[0], burdenRgb[1], burdenRgb[2]);
    pdf.text(row.burden.toUpperCase(), margin, y);

    pdf.setFont('times', 'italic');
    pdf.setFontSize(10);
    pdf.setTextColor(140, 155, 170);
    pdf.text(row.right, margin + contentWidth, y, { align: 'right' });

    y += 3;
    pdf.setDrawColor(burdenRgb[0], burdenRgb[1], burdenRgb[2]);
    pdf.setLineWidth(0.3);
    pdf.line(margin, y, margin + contentWidth, y);

    y += 8;

    const byPerson = {};
    const unassigned = [];
    burdenComplexes.forEach(c => {
      if (c.person) {
        if (!byPerson[c.person]) byPerson[c.person] = [];
        byPerson[c.person].push(c);
      } else {
        unassigned.push(c);
      }
    });
    const personNames = Object.keys(byPerson).sort((a, b) => a.localeCompare(b));
    const personGroups = personNames.map(name => ({ person: name, complexes: byPerson[name] }));
    if (unassigned.length > 0) personGroups.push({ person: null, complexes: unassigned });

    for (const group of personGroups) {
      if (y + 12 > contentBottom) {
        ({ pageWidth, contentTop, contentBottom } = await startNewPage(pdf, pageNumber));
        pageNumber++;
        y = contentTop + 8;
      }

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(9);
      pdf.setTextColor(120, 145, 170);
      const personLabel = group.person ? group.person.toUpperCase() : 'UNASSIGNED';
      pdf.text(personLabel, margin, y);

      y += 6;

      for (const c of group.complexes) {
        const hasCounter = c.counter && c.counter.trim();
        const hasCounterBehavior = c.counterBehavior && c.counterBehavior.trim();
        const hasFeelings = c.feelings && c.feelings.trim();
        const hasTrigger = c.trigger && c.trigger.trim();
        const hasBehaviors = c.behaviors && (Array.isArray(c.behaviors) ? c.behaviors.length : c.behaviors.trim());
        const hasNotes = c.notes && c.notes.trim();

        const behaviorsText = Array.isArray(c.behaviors) ? c.behaviors.join('\n') : (c.behaviors || '');

        const boxW = 76;
        const gapH = 8;
        const arrowH = 7;
        const padding = 6;
        const leftBoxX = margin;
        const rightBoxX = margin + boxW + gapH;
        const centerBoxX = leftBoxX;
        const centerArrowX = leftBoxX + boxW / 2;


        const measureBox = (text, fontSize, w = boxW) => {
          if (!text) return 16;
          const lines = splitLines(text, w - padding * 2, fontSize);
          return 10 + lines.length * 4.2 + padding;
        };

        const drawBox = (x, boxY, label, text, rgb, italic = false, width = boxW, sideLabel = null, cornerLabel = null) => {
          const lines = splitLines(text || '', width - padding * 2, 10);
          const h = 10 + lines.length * 4.2 + padding;
          const tintRgb = [
            Math.round(255 - (255 - rgb[0]) * 0.10),
            Math.round(255 - (255 - rgb[1]) * 0.10),
            Math.round(255 - (255 - rgb[2]) * 0.10),
          ];
          pdf.setFillColor(tintRgb[0], tintRgb[1], tintRgb[2]);
          pdf.setDrawColor(rgb[0], rgb[1], rgb[2]);
          pdf.setLineWidth(0.3);
          pdf.roundedRect(x, boxY, width, h, 1.5, 1.5, 'FD');

          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(7);
          pdf.setTextColor(rgb[0], rgb[1], rgb[2]);
          pdf.text(label, x + padding, boxY + 5);

          if (cornerLabel) {
            pdf.setFont('helvetica', 'italic');
            pdf.setFontSize(6);
            pdf.setTextColor(150, 165, 180);
            pdf.text(cornerLabel, x + width - padding, boxY + 5, { align: 'right' });
          }

          pdf.setFont('times', italic ? 'italic' : 'normal');
          pdf.setFontSize(10);
          pdf.setTextColor(50, 60, 75);
          pdf.text(lines, x + padding, boxY + 10);

          if (sideLabel) {
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(7);
            pdf.setTextColor(140, 155, 170);
            pdf.text(sideLabel, x + width + 4, boxY + h / 2 + 1);
          }

          return h;
        };

        const drawArrowDown = (x, startY, endY) => {
          pdf.setDrawColor(140, 155, 170);
          pdf.setLineWidth(0.4);
          pdf.line(x, startY, x, endY);
          pdf.line(x - 1.5, endY - 2, x, endY);
          pdf.line(x + 1.5, endY - 2, x, endY);
        };

        const drawArrowUp = (x, startY, endY) => {
          pdf.setDrawColor(140, 155, 170);
          pdf.setLineWidth(0.4);
          pdf.line(x, startY, x, endY);
          pdf.line(x - 1.5, endY + 2, x, endY);
          pdf.line(x + 1.5, endY + 2, x, endY);
        };

        const drawHorizontalConnector = (leftEndX, rightStartX, lineY) => {
          pdf.setDrawColor(140, 155, 170);
          pdf.setLineWidth(0.4);
          pdf.line(leftEndX, lineY, rightStartX, lineY);
          pdf.line(leftEndX + 2, lineY - 1.5, leftEndX, lineY);
          pdf.line(leftEndX + 2, lineY + 1.5, leftEndX, lineY);
          pdf.line(rightStartX - 2, lineY - 1.5, rightStartX, lineY);
          pdf.line(rightStartX - 2, lineY + 1.5, rightStartX, lineY);
        };

        const burdenH = measureBox(c.burden || '', 10);
        const beliefsH = Math.max(measureBox(c.beliefs || '', 10), hasCounter ? measureBox(c.counter, 10) : 0);
        const thoughtsH = measureBox(c.thoughts || '', 10);
        const feelingsH = hasFeelings ? measureBox(c.feelings, 10) : 0;
        const behaviorsH = Math.max(measureBox(behaviorsText, 10), hasCounterBehavior ? measureBox(c.counterBehavior, 10) : 0);
        const triggerH = hasTrigger ? measureBox(c.trigger, 10) : 0;
        const notesH = hasNotes ? measureBox(c.notes, 10) : 0;

        const titleRowH = 10;
        const flowH = titleRowH
          + burdenH + arrowH
          + beliefsH + arrowH
          + thoughtsH
          + (hasFeelings ? arrowH + feelingsH : 0)
          + arrowH + behaviorsH
          + (hasTrigger ? arrowH + triggerH : 0)
          + (hasNotes ? 6 + notesH : 0)
          + 8;

        if (y + flowH > contentBottom) {
          ({ pageWidth, contentTop, contentBottom } = await startNewPage(pdf, pageNumber));
          pageNumber++;
          y = contentTop + 8;
        }

        pdf.setFont('times', 'bold');
        pdf.setFontSize(13);
        pdf.setTextColor(40, 55, 75);
        pdf.text(c.name || '(unnamed)', margin + 4, y + 6);

        let badgeX = margin + contentWidth - 4;
        if (c.originalWound) {
          const tagText = 'ORIGINAL WOUND';
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(7);
          const tagW = pdf.getTextWidth(tagText) + 4;
          pdf.setFillColor(252, 240, 210);
          pdf.setDrawColor(200, 170, 80);
          pdf.setLineWidth(0.2);
          pdf.roundedRect(badgeX - tagW, y + 1, tagW, 5.5, 0.8, 0.8, 'FD');
          pdf.setTextColor(150, 110, 30);
          pdf.text(tagText, badgeX - tagW / 2, y + 4.7, { align: 'center' });
          badgeX = badgeX - tagW - 3;
        }

        const status = (c.status || 'active').toUpperCase();
        const isResolved = status === 'RESOLVED';
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(7);
        const statusW = pdf.getTextWidth(status) + 4;
        if (isResolved) {
          pdf.setFillColor(232, 245, 240);
          pdf.setDrawColor(74, 174, 136);
        } else {
          pdf.setFillColor(248, 234, 234);
          pdf.setDrawColor(200, 120, 120);
        }
        pdf.setLineWidth(0.2);
        pdf.roundedRect(badgeX - statusW, y + 1, statusW, 5.5, 0.8, 0.8, 'FD');
        pdf.setTextColor(isResolved ? 50 : 140, isResolved ? 120 : 50, isResolved ? 95 : 50);
        pdf.text(status, badgeX - statusW / 2, y + 4.7, { align: 'center' });

        y += titleRowH;

        const actualBurdenH = drawBox(centerBoxX, y, 'EMOTIONAL BURDEN', c.burden || row.burden, COMPLEX_BURDEN_RGB);
        y += actualBurdenH;

        drawArrowDown(centerArrowX, y, y + arrowH - 1);
        y += arrowH;

        const beliefsY = y;
        if (hasCounter) {
          const leftH = drawBox(leftBoxX, beliefsY, 'BELIEFS', c.beliefs || '', COMPLEX_BLUE_RGB, false, boxW, null, 'EMOTIONAL INPUT');
          const rightH = drawBox(rightBoxX, beliefsY, 'COUNTER BELIEFS', c.counter, LIBERATED_RGB);
          const rowH = Math.max(leftH, rightH);
          drawHorizontalConnector(leftBoxX + boxW, rightBoxX, beliefsY + rowH / 2);
          y += rowH;
        } else {
          const h = drawBox(centerBoxX, beliefsY, 'BELIEFS', c.beliefs || '', COMPLEX_BLUE_RGB, false, boxW, null, 'EMOTIONAL INPUT');
          y += h;
        }

        drawArrowDown(centerArrowX, y, y + arrowH - 1);
        y += arrowH;

        const thoughtsActualH = drawBox(centerBoxX, y, 'THOUGHTS', c.thoughts || '', COMPLEX_BLUE_RGB, false, boxW, null, 'EMOTIONAL INPUT');
        y += thoughtsActualH;

        if (hasFeelings) {
          drawArrowDown(centerArrowX, y, y + arrowH - 1);
          y += arrowH;
          const feelingsActualH = drawBox(centerBoxX, y, 'FEELINGS', c.feelings, COMPLEX_BLUE_RGB, false, boxW, null, 'EMOTIONAL INPUT');
          y += feelingsActualH;
        }

        drawArrowDown(centerArrowX, y, y + arrowH - 1);
        y += arrowH;

        const behaviorsY = y;
        if (hasCounterBehavior) {
          const leftH = drawBox(leftBoxX, behaviorsY, 'BEHAVIORS', behaviorsText, COMPLEX_BLUE_RGB, false, boxW, null, 'EMOTIONAL OUTPUT');
          const rightH = drawBox(rightBoxX, behaviorsY, 'COUNTER BEHAVIORS', c.counterBehavior, LIBERATED_RGB);
          const rowH = Math.max(leftH, rightH);
          drawHorizontalConnector(leftBoxX + boxW, rightBoxX, behaviorsY + rowH / 2);
          y += rowH;
        } else if (hasBehaviors) {
          const h = drawBox(centerBoxX, behaviorsY, 'BEHAVIORS', behaviorsText, COMPLEX_BLUE_RGB, false, boxW, null, 'EMOTIONAL OUTPUT');
          y += h;
        }

        if (hasTrigger) {
          drawArrowUp(centerArrowX, y + arrowH - 1, y);
          y += arrowH;
          const triggerActualH = drawBox(centerBoxX, y, 'TRIGGERS', c.trigger, [200, 168, 80]);
          y += triggerActualH;
        }

        if (hasNotes) {
          y += 6;
          const notesActualH = drawBox(centerBoxX, y, 'NOTES', c.notes, [140, 155, 170], true);
          y += notesActualH;
        }

        y += 10;
      }

      y += 4;
    }

    y += 8;
  }

  return pageNumber;
}

// ===== PROGRESS =====
async function fetchEntries() {
  const token = localStorage.getItem('axis_token');
  const axios = (await import('axios')).default;
  const API = 'https://axis-backend-production-5e9b.up.railway.app';
  const res = await axios.get(API + '/api/entries', { headers: { Authorization: 'Bearer ' + token } });
  return res.data || {};
}

async function fetchCBMLog() {
  const token = localStorage.getItem('axis_token');
  const axios = (await import('axios')).default;
  const API = 'https://axis-backend-production-5e9b.up.railway.app';
  const res = await axios.get(API + '/api/cbm-log', { headers: { Authorization: 'Bearer ' + token } });
  return res.data || [];
}

function getEntryPct(e) {
  if (!e) return null;
  if (e.ismPct !== undefined) return e;
  const ism = e.ism || {};
  const esm = e.esm || {};
  const ismRaw = Object.values(ism).reduce((a, b) => a + b, 0);
  const esmRaw = Object.values(esm).reduce((a, b) => a + b, 0);
  const totalRaw = ismRaw + esmRaw;
  return {
    ismPct: Math.round(((ismRaw + 20) / 40) * 100),
    esmPct: Math.round(((esmRaw + 30) / 60) * 100),
    totalPct: Math.round(((totalRaw + 50) / 100) * 100),
    ismRaw,
  };
}

const validCbmEntry = (e) => e && e.date && typeof e.dTotal === 'number' && typeof e.rTotal === 'number';

async function drawProgress(pdf, pageNumber, timeframe) {
  const entries = await fetchEntries();
  let { pageWidth, contentTop } = await startNewPage(pdf, pageNumber);
  pageNumber++;

  const margin = 18;
  const contentWidth = pageWidth - margin * 2;
  const today = new Date();
  const dk = (d) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');

  const tfLabels = { '7d': '7 Days', '4w': '4 Weeks', '12m': '12 Months' };
  const tfLabel = tfLabels[timeframe] || '7 Days';

  let y = contentTop + 8;
  pdf.setFont('times', 'normal');
  pdf.setFontSize(26);
  pdf.setTextColor(26, 50, 80);
  pdf.text('Progress', pageWidth / 2, y + 8, { align: 'center' });

  pdf.setDrawColor(107, 163, 200);
  pdf.setLineWidth(0.4);
  pdf.line(pageWidth / 2 - 12, y + 13, pageWidth / 2 + 12, y + 13);

  pdf.setFont('times', 'italic');
  pdf.setFontSize(11);
  pdf.setTextColor(120, 135, 150);
  pdf.text(tfLabel, pageWidth / 2, y + 22, { align: 'center' });

  y += 28;

  const buildChartData = () => {
    if (timeframe === '7d') {
      const data = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today); d.setDate(today.getDate() - i);
        const key = dk(d);
        const lbl = d.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0) + d.getDate();
        data.push({ label: lbl, key, entry: entries[key] ? getEntryPct(entries[key]) : null });
      }
      return data;
    } else if (timeframe === '4w') {
      const data = [];
      for (let i = 29; i >= 0; i--) {
        const d = new Date(today); d.setDate(today.getDate() - i);
        const key = dk(d);
        const lbl = (d.getMonth() + 1) + '/' + d.getDate();
        data.push({ label: lbl, key, entry: entries[key] ? getEntryPct(entries[key]) : null });
      }
      return data;
    } else {
      const data = [];
      const keys = Object.keys(entries).sort();
      for (let i = 11; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const prefix = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
        const monthEntries = keys.filter(k => k.startsWith(prefix)).map(k => getEntryPct(entries[k]));
        const lbl = d.toLocaleDateString('en-US', { month: 'short' });
        if (monthEntries.length > 0) {
          data.push({
            label: lbl,
            entry: {
              ismPct: Math.round(monthEntries.reduce((a, e) => a + e.ismPct, 0) / monthEntries.length),
              esmPct: Math.round(monthEntries.reduce((a, e) => a + e.esmPct, 0) / monthEntries.length),
              totalPct: Math.round(monthEntries.reduce((a, e) => a + e.totalPct, 0) / monthEntries.length),
            }
          });
        } else { data.push({ label: lbl, entry: null }); }
      }
      return data;
    }
  };

  const days = timeframe === '7d' ? 7 : timeframe === '4w' ? 28 : 365;
  const periodEntries = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(today); d.setDate(today.getDate() - i);
    const key = dk(d);
    if (entries[key]) periodEntries.push(getEntryPct(entries[key]));
  }
  const n = periodEntries.length;
  const avgISM = n ? Math.round(periodEntries.reduce((a, e) => a + e.ismPct, 0) / n) : null;
  const avgESM = n ? Math.round(periodEntries.reduce((a, e) => a + e.esmPct, 0) / n) : null;
  const avgAXIS = n ? Math.round(periodEntries.reduce((a, e) => a + e.totalPct, 0) / n) : null;
  const avgISMRaw = n ? Math.round(periodEntries.reduce((a, e) => a + (e.ismRaw || 0), 0) / n) : 0;
  const osTendency = avgISMRaw > 2 ? 'Prefrontal Dominant' : avgISMRaw < -2 ? 'Limbic Dominant' : 'Balanced';
  const osRgb = avgISMRaw > 2 ? [74, 174, 136] : avgISMRaw < -2 ? [200, 120, 120] : [120, 145, 170];

  let streak = 0;
  const checkDate = new Date(today);
  while (true) {
    if (entries[dk(checkDate)]) { streak++; checkDate.setDate(checkDate.getDate() - 1); } else break;
  }

  let bestScore = 0; let bestKey = null;
  Object.keys(entries).forEach(k => {
    const e = getEntryPct(entries[k]);
    if (e && e.totalPct > bestScore) { bestScore = e.totalPct; bestKey = k; }
  });
  let bestDate = '';
  if (bestKey) {
    const bp = bestKey.split('-');
    bestDate = new Date(bp[0], bp[1] - 1, bp[2]).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  const osBlockH = 32;
  pdf.setFillColor(248, 250, 252);
  pdf.setDrawColor(220, 230, 240);
  pdf.setLineWidth(0.3);
  pdf.roundedRect(margin, y, contentWidth, osBlockH, 2, 2, 'FD');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  pdf.setTextColor(107, 163, 200);
  pdf.text('OPERATING SYSTEM', margin + 8, y + 9);

  pdf.setFont('times', 'normal');
  pdf.setFontSize(18);
  pdf.setTextColor(osRgb[0], osRgb[1], osRgb[2]);
  pdf.text(osTendency, margin + 8, y + 21);

  pdf.setFont('times', 'italic');
  pdf.setFontSize(8);
  pdf.setTextColor(120, 135, 150);
  pdf.text(tfLabel + ' tendency', margin + 8, y + 27);

  const scoreColW = 26;
  const scoresStartX = margin + contentWidth - (scoreColW * 3) - 6;
  const scoreLabels = [
    { label: 'ISM', value: avgISM, rgb: [107, 163, 200] },
    { label: 'ESM', value: avgESM, rgb: [180, 140, 200] },
    { label: 'AXIS', value: avgAXIS, rgb: [74, 174, 136] },
  ];
  scoreLabels.forEach((s, i) => {
    const sx = scoresStartX + i * scoreColW;
    pdf.setDrawColor(s.rgb[0], s.rgb[1], s.rgb[2]);
    pdf.setLineWidth(0.8);
    pdf.line(sx, y + 6, sx, y + osBlockH - 6);

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8);
    pdf.setTextColor(s.rgb[0], s.rgb[1], s.rgb[2]);
    pdf.text(s.label, sx + scoreColW / 2 + 1, y + 11, { align: 'center' });

    pdf.setFont('times', 'normal');
    pdf.setFontSize(17);
    pdf.text(s.value !== null ? s.value + '%' : '--', sx + scoreColW / 2 + 1, y + 22, { align: 'center' });

    pdf.setFont('times', 'italic');
    pdf.setFontSize(8);
    pdf.setTextColor(140, 155, 170);
    pdf.text('avg', sx + scoreColW / 2 + 1, y + 28, { align: 'center' });
  });

  y += osBlockH + 8;

  const statBoxW = (contentWidth - 8) / 2;
  const statBoxH = 24;

  pdf.setFillColor(252, 253, 254);
  pdf.setDrawColor(220, 230, 240);
  pdf.setLineWidth(0.3);
  pdf.roundedRect(margin, y, statBoxW, statBoxH, 2, 2, 'FD');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  pdf.setTextColor(107, 163, 200);
  pdf.text('STREAK', margin + 8, y + 8);

  pdf.setFont('times', 'normal');
  pdf.setFontSize(22);
  pdf.setTextColor(60, 95, 130);
  pdf.text(String(streak), margin + 8, y + 19);

  pdf.setFont('times', 'italic');
  pdf.setFontSize(9);
  pdf.setTextColor(120, 135, 150);
  pdf.text(streak === 1 ? 'consecutive day' : 'consecutive days', margin + 24, y + 19);

  if (bestKey) {
    pdf.setFillColor(252, 253, 254);
    pdf.setDrawColor(220, 230, 240);
    pdf.roundedRect(margin + statBoxW + 8, y, statBoxW, statBoxH, 2, 2, 'FD');

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8);
    pdf.setTextColor(74, 174, 136);
    pdf.text('PERSONAL BEST', margin + statBoxW + 8 + 8, y + 8);

    pdf.setFont('times', 'normal');
    pdf.setFontSize(22);
    pdf.setTextColor(74, 174, 136);
    pdf.text(bestScore + '%', margin + statBoxW + 8 + 8, y + 19);

    pdf.setFont('times', 'italic');
    pdf.setFontSize(9);
    pdf.setTextColor(120, 135, 150);
    pdf.text(bestDate, margin + statBoxW + 8 + 30, y + 19);
  }

  y += statBoxH + 8;

  const chartData = buildChartData();
  const chartW = contentWidth;
  const chartH = 62;
  const chartPad = { top: 8, right: 12, bottom: 16, left: 22 };

  pdf.setFillColor(252, 253, 254);
  pdf.setDrawColor(220, 230, 240);
  pdf.setLineWidth(0.3);
  pdf.roundedRect(margin, y, chartW, chartH, 2, 2, 'FD');

  const legend = [
    { label: 'ISM', rgb: [107, 163, 200] },
    { label: 'ESM', rgb: [180, 140, 200] },
    { label: 'AXIS', rgb: [74, 174, 136] },
  ];
  let lx = margin + chartPad.left;
  legend.forEach(item => {
    pdf.setFillColor(item.rgb[0], item.rgb[1], item.rgb[2]);
    pdf.circle(lx, y + 3, 1.2, 'F');
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(100, 115, 130);
    pdf.text(item.label, lx + 3, y + 4);
    lx += 18;
  });

  const chartTop = y + 6;
  const chartLeft = margin + chartPad.left;
  const chartBottom = y + chartH - chartPad.bottom;
  const chartRight = margin + chartW - chartPad.right;
  const innerW = chartRight - chartLeft;
  const innerH = chartBottom - chartTop;

  const xPos = (i) => chartLeft + (chartData.length > 1 ? (i / (chartData.length - 1)) * innerW : innerW / 2);
  const yPos = (pct) => chartTop + innerH - (pct / 100) * innerH;

  pdf.setDrawColor(230, 235, 240);
  pdf.setLineWidth(0.15);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(6.5);
  pdf.setTextColor(150, 165, 180);
  [0, 25, 50, 75, 100].forEach(pct => {
    const yLine = yPos(pct);
    pdf.line(chartLeft, yLine, chartRight, yLine);
    pdf.text(String(pct), chartLeft - 2, yLine + 1.5, { align: 'right' });
  });

  pdf.setFontSize(6.5);
  pdf.setTextColor(140, 155, 170);
  chartData.forEach((d, i) => {
    pdf.text(d.label, xPos(i), chartBottom + 5, { align: 'center' });
  });

  const drawLine = (key, rgb) => {
    const pts = chartData.map((d, i) => d.entry ? { x: xPos(i), y: yPos(d.entry[key]) } : null).filter(Boolean);
    pdf.setDrawColor(rgb[0], rgb[1], rgb[2]);
    pdf.setLineWidth(0.8);
    for (let i = 1; i < pts.length; i++) {
      pdf.line(pts[i - 1].x, pts[i - 1].y, pts[i].x, pts[i].y);
    }
    pdf.setFillColor(rgb[0], rgb[1], rgb[2]);
    pts.forEach(p => {
      pdf.circle(p.x, p.y, 1.2, 'F');
    });
  };

  drawLine('ismPct', [107, 163, 200]);
  drawLine('esmPct', [180, 140, 200]);
  drawLine('totalPct', [74, 174, 136]);

  // ===== New page for Behavior Log =====
  ({ pageWidth, contentTop } = await startNewPage(pdf, pageNumber));
  pageNumber++;

  y = contentTop + 8;
  pdf.setFont('times', 'normal');
  pdf.setFontSize(26);
  pdf.setTextColor(26, 50, 80);
  pdf.text('Behavior Log', pageWidth / 2, y + 8, { align: 'center' });

  pdf.setDrawColor(107, 163, 200);
  pdf.setLineWidth(0.4);
  pdf.line(pageWidth / 2 - 12, y + 13, pageWidth / 2 + 12, y + 13);

  pdf.setFont('times', 'italic');
  pdf.setFontSize(11);
  pdf.setTextColor(120, 135, 150);
  pdf.text(tfLabel, pageWidth / 2, y + 22, { align: 'center' });

  y += 28;

  // ===== BEHAVIOR LOG CHART (D / R / AXIS) =====
  const cbmLog = (await fetchCBMLog()).filter(validCbmEntry);

  const buildCBMSeries = () => {
    const cbmByDate = {};
    cbmLog.forEach(e => { cbmByDate[dk(new Date(e.date))] = e; });

    if (timeframe === '7d') {
      const out = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today); d.setDate(today.getDate() - i);
        const key = dk(d);
        const lbl = d.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0) + d.getDate();
        const e = cbmByDate[key];
        out.push({ label: lbl, d: e ? e.dTotal : null, r: e ? e.rTotal : null, score: e ? e.score : null });
      }
      return out;
    } else if (timeframe === '4w') {
      const out = [];
      for (let i = 29; i >= 0; i--) {
        const d = new Date(today); d.setDate(today.getDate() - i);
        const key = dk(d);
        const lbl = (d.getMonth() + 1) + '/' + d.getDate();
        const e = cbmByDate[key];
        out.push({ label: lbl, d: e ? e.dTotal : null, r: e ? e.rTotal : null, score: e ? e.score : null });
      }
      return out;
    } else {
      const out = [];
      for (let i = 11; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const monthPrefix = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
        const lbl = d.toLocaleDateString('en-US', { month: 'short' });
        const monthEntries = Object.keys(cbmByDate).filter(k => k.startsWith(monthPrefix)).map(k => cbmByDate[k]);
        if (monthEntries.length > 0) {
          out.push({
            label: lbl,
            d: Math.round(monthEntries.reduce((a, e) => a + e.dTotal, 0) / monthEntries.length),
            r: Math.round(monthEntries.reduce((a, e) => a + e.rTotal, 0) / monthEntries.length),
            score: Math.round(monthEntries.reduce((a, e) => a + e.score, 0) / monthEntries.length),
          });
        } else {
          out.push({ label: lbl, d: null, r: null, score: null });
        }
      }
      return out;
    }
  };

  const cbmSeries = buildCBMSeries();
  const hasCbmData = cbmSeries.some(p => p.d !== null);

  // Period averages for behavior dashboard
  const periodCbm = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(today); d.setDate(today.getDate() - i);
    const key = dk(d);
    const e = cbmLog.find(x => dk(new Date(x.date)) === key);
    if (e) periodCbm.push(e);
  }
  const cn = periodCbm.length;
  const avgD = cn ? Math.round(periodCbm.reduce((a, e) => a + e.dTotal, 0) / cn) : null;
  const avgR = cn ? Math.round(periodCbm.reduce((a, e) => a + e.rTotal, 0) / cn) : null;
  const avgAxisScore = cn ? Math.round(periodCbm.reduce((a, e) => a + e.score, 0) / cn) : null;

  // Streak + best for behavior dashboard
  const cbmByDate = {};
  cbmLog.forEach(e => { cbmByDate[dk(new Date(e.date))] = e; });
  let cbmStreak = 0;
  const cbmCheck = new Date(today);
  while (cbmByDate[dk(cbmCheck)]) { cbmStreak++; cbmCheck.setDate(cbmCheck.getDate() - 1); }
  let cbmBest = null; let cbmBestKey = null;
  Object.keys(cbmByDate).forEach(k => {
    const sc = cbmByDate[k].score;
    if (cbmBest === null || sc > cbmBest) { cbmBest = sc; cbmBestKey = k; }
  });
  let cbmBestDate = '';
  if (cbmBestKey) {
    const bp = cbmBestKey.split('-');
    cbmBestDate = new Date(bp[0], bp[1] - 1, bp[2]).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  // ===== Behavior dashboard =====
  const cbmOsBlockH = 32;
  pdf.setFillColor(248, 250, 252);
  pdf.setDrawColor(220, 230, 240);
  pdf.setLineWidth(0.3);
  pdf.roundedRect(margin, y, contentWidth, cbmOsBlockH, 2, 2, 'FD');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  pdf.setTextColor(107, 163, 200);
  pdf.text('AVERAGE AXIS', margin + 8, y + 9);

  const cbmSign = avgAxisScore !== null && avgAxisScore >= 0 ? '+' : '';
  const cbmScoreRgb = avgAxisScore === null ? [120, 135, 150] : (avgAxisScore >= 0 ? [74, 174, 136] : [200, 120, 120]);
  pdf.setFont('times', 'normal');
  pdf.setFontSize(18);
  pdf.setTextColor(cbmScoreRgb[0], cbmScoreRgb[1], cbmScoreRgb[2]);
  pdf.text(avgAxisScore !== null ? cbmSign + avgAxisScore : '--', margin + 8, y + 21);

  pdf.setFont('times', 'italic');
  pdf.setFontSize(8);
  pdf.setTextColor(120, 135, 150);
  pdf.text(tfLabel + ' average', margin + 8, y + 27);

  const cbmScoreColW = 38;
  const cbmScoresStartX = margin + contentWidth - (cbmScoreColW * 2) - 6;
  const cbmCols = [
    { label: 'Dysregulated', value: avgD, rgb: [200, 120, 120] },
    { label: 'Regulated', value: avgR, rgb: [74, 174, 136] },
  ];
  cbmCols.forEach((s, i) => {
    const sx = cbmScoresStartX + i * cbmScoreColW;
    pdf.setDrawColor(s.rgb[0], s.rgb[1], s.rgb[2]);
    pdf.setLineWidth(0.8);
    pdf.line(sx, y + 6, sx, y + cbmOsBlockH - 6);

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8);
    pdf.setTextColor(s.rgb[0], s.rgb[1], s.rgb[2]);
    pdf.text(s.label, sx + cbmScoreColW / 2 + 1, y + 11, { align: 'center' });

    pdf.setFont('times', 'normal');
    pdf.setFontSize(17);
    pdf.text(s.value !== null ? String(s.value) : '--', sx + cbmScoreColW / 2 + 1, y + 22, { align: 'center' });

    pdf.setFont('times', 'italic');
    pdf.setFontSize(8);
    pdf.setTextColor(140, 155, 170);
    pdf.text('avg AUC', sx + cbmScoreColW / 2 + 1, y + 28, { align: 'center' });
  });

  y += cbmOsBlockH + 8;

  const cbmStatBoxW = (contentWidth - 8) / 2;
  const cbmStatBoxH = 24;

  pdf.setFillColor(252, 253, 254);
  pdf.setDrawColor(220, 230, 240);
  pdf.setLineWidth(0.3);
  pdf.roundedRect(margin, y, cbmStatBoxW, cbmStatBoxH, 2, 2, 'FD');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  pdf.setTextColor(107, 163, 200);
  pdf.text('STREAK', margin + 8, y + 8);

  pdf.setFont('times', 'normal');
  pdf.setFontSize(22);
  pdf.setTextColor(60, 95, 130);
  pdf.text(String(cbmStreak), margin + 8, y + 19);

  pdf.setFont('times', 'italic');
  pdf.setFontSize(9);
  pdf.setTextColor(120, 135, 150);
  pdf.text(cbmStreak === 1 ? 'consecutive day' : 'consecutive days', margin + 24, y + 19);

  if (cbmBestKey) {
    pdf.setFillColor(252, 253, 254);
    pdf.setDrawColor(220, 230, 240);
    pdf.roundedRect(margin + cbmStatBoxW + 8, y, cbmStatBoxW, cbmStatBoxH, 2, 2, 'FD');

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8);
    pdf.setTextColor(74, 174, 136);
    pdf.text('BEST AXIS', margin + cbmStatBoxW + 8 + 8, y + 8);

    const bestSign = cbmBest >= 0 ? '+' : '';
    pdf.setFont('times', 'normal');
    pdf.setFontSize(22);
    pdf.setTextColor(cbmBest >= 0 ? 74 : 200, cbmBest >= 0 ? 174 : 120, cbmBest >= 0 ? 136 : 120);
    pdf.text(bestSign + cbmBest, margin + cbmStatBoxW + 8 + 8, y + 19);

    pdf.setFont('times', 'italic');
    pdf.setFontSize(9);
    pdf.setTextColor(120, 135, 150);
    pdf.text(cbmBestDate, margin + cbmStatBoxW + 8 + 36, y + 19);
  }

  y += cbmStatBoxH + 8;

  const cbmChartW = contentWidth;
  const cbmChartH = 58;
  const cbmPad = { top: 8, right: 12, bottom: 14, left: 22 };

  pdf.setFillColor(252, 253, 254);
  pdf.setDrawColor(220, 230, 240);
  pdf.setLineWidth(0.3);
  pdf.roundedRect(margin, y, cbmChartW, cbmChartH, 2, 2, 'FD');

  // Legend
  const cbmLegend = [
    { label: 'Dysregulated', rgb: [200, 120, 120] },
    { label: 'Regulated', rgb: [74, 174, 136] },
    { label: 'AXIS', rgb: [142, 196, 224] },
  ];
  let clx = margin + cbmPad.left;
  cbmLegend.forEach(item => {
    pdf.setFillColor(item.rgb[0], item.rgb[1], item.rgb[2]);
    pdf.circle(clx, y + 3, 1.2, 'F');
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(100, 115, 130);
    pdf.text(item.label, clx + 3, y + 4);
    clx += pdf.getTextWidth(item.label) + 9;
  });

  const cbmTop = y + 6;
  const cbmLeft = margin + cbmPad.left;
  const cbmBottom = y + cbmChartH - cbmPad.bottom;
  const cbmRight = margin + cbmChartW - cbmPad.right;
  const cbmInnerW = cbmRight - cbmLeft;
  const cbmInnerH = cbmBottom - cbmTop;

  if (hasCbmData) {
    const allVals = [];
    cbmSeries.forEach(p => { if (p.d !== null) { allVals.push(p.d, p.r, p.score); } });
    const maxVal = Math.max(...allVals, 1);
    const minVal = Math.min(...allVals, 0);
    const range = (maxVal - minVal) || 1;

    const cbmXPos = (i) => cbmLeft + (cbmSeries.length > 1 ? (i / (cbmSeries.length - 1)) * cbmInnerW : cbmInnerW / 2);
    const cbmYPos = (val) => cbmTop + cbmInnerH - ((val - minVal) / range) * cbmInnerH;

    // Gridlines + y labels (5 ticks)
    pdf.setDrawColor(230, 235, 240);
    pdf.setLineWidth(0.15);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(6.5);
    pdf.setTextColor(150, 165, 180);
    for (let g = 0; g <= 4; g++) {
      const yLine = cbmTop + (g / 4) * cbmInnerH;
      const val = Math.round(maxVal - (g / 4) * range);
      pdf.line(cbmLeft, yLine, cbmRight, yLine);
      pdf.text(String(val), cbmLeft - 2, yLine + 1.5, { align: 'right' });
    }

    // Zero baseline if range crosses zero
    if (minVal < 0) {
      const zeroY = cbmYPos(0);
      pdf.setDrawColor(180, 195, 210);
      pdf.setLineWidth(0.3);
      const dashLen = 1.8; const gapLen = 1.2;
      let cx = cbmLeft;
      while (cx < cbmRight) {
        const ex = Math.min(cx + dashLen, cbmRight);
        pdf.line(cx, zeroY, ex, zeroY);
        cx = ex + gapLen;
      }
    }

    pdf.setFontSize(6.5);
    pdf.setTextColor(140, 155, 170);
    cbmSeries.forEach((p, i) => {
      pdf.text(p.label, cbmXPos(i), cbmBottom + 5, { align: 'center' });
    });

    const drawCbmLine = (key, rgb) => {
      const pts = cbmSeries.map((p, i) => p[key] !== null ? { x: cbmXPos(i), y: cbmYPos(p[key]) } : null).filter(Boolean);
      if (pts.length === 0) return;
      pdf.setDrawColor(rgb[0], rgb[1], rgb[2]);
      pdf.setLineWidth(0.8);
      for (let i = 1; i < pts.length; i++) {
        pdf.line(pts[i - 1].x, pts[i - 1].y, pts[i].x, pts[i].y);
      }
      pdf.setFillColor(rgb[0], rgb[1], rgb[2]);
      pts.forEach(p => { pdf.circle(p.x, p.y, 1.2, 'F'); });
    };

    drawCbmLine('d', [200, 120, 120]);
    drawCbmLine('r', [74, 174, 136]);
    drawCbmLine('score', [142, 196, 224]);
  } else {
    pdf.setFont('times', 'italic');
    pdf.setFontSize(10);
    pdf.setTextColor(160, 175, 190);
    pdf.text('No behavior logs in this period.', margin + cbmChartW / 2, y + cbmChartH / 2 + 2, { align: 'center' });
  }

  return pageNumber;
}

// ===== BEHAVIOR LOG SUMMARY (dual 12-band AUC pyramid, landscape) =====
async function drawCBMSummary(pdf, pageNumber) {
  const cbmLog = (await fetchCBMLog()).filter(validCbmEntry);

  // Find today's log entry
  const today = new Date();
  const dk = (d) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  const todayKey = dk(today);
  const todayEntry = cbmLog.find(e => dk(new Date(e.date)) === todayKey);

  const { pageWidth, pageHeight, contentTop } = await startNewPage(pdf, pageNumber, 'landscape');
  pageNumber++;

  const margin = 18;
  const contentWidth = pageWidth - margin * 2;

  let y = contentTop + 8;
  pdf.setFont('times', 'normal');
  pdf.setFontSize(26);
  pdf.setTextColor(26, 50, 80);
  pdf.text('Behavior Log', pageWidth / 2, y + 8, { align: 'center' });

  pdf.setDrawColor(107, 163, 200);
  pdf.setLineWidth(0.4);
  pdf.line(pageWidth / 2 - 12, y + 13, pageWidth / 2 + 12, y + 13);

  y += 22;

  if (!todayEntry) {
    pdf.setFont('times', 'italic');
    pdf.setFontSize(12);
    pdf.setTextColor(140, 155, 170);
    pdf.text('No log recorded for today.', pageWidth / 2, y + 20, { align: 'center' });
    return pageNumber;
  }

  // Date + score banner
  const dateStr = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const score = todayEntry.score;
  const positive = score >= 0;

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.setTextColor(140, 155, 170);
  pdf.text(dateStr.toUpperCase(), pageWidth / 2, y, { align: 'center' });

  y += 7;

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.setTextColor(107, 163, 200);
  pdf.text('DAILY SCORE', pageWidth / 2, y, { align: 'center' });

  y += 9;

  pdf.setFont('times', 'normal');
  pdf.setFontSize(28);
  pdf.setTextColor(positive ? 74 : 200, positive ? 174 : 120, positive ? 136 : 120);
  pdf.text((positive ? '+' : '') + score, pageWidth / 2, y, { align: 'center' });

  y += 6;

  // D and R subtotals
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.setTextColor(200, 120, 120);
  pdf.text('Dysregulated: ' + todayEntry.dTotal, pageWidth / 2 - 30, y, { align: 'right' });
  pdf.setTextColor(74, 174, 136);
  pdf.text('Regulated: ' + todayEntry.rTotal, pageWidth / 2 + 30, y, { align: 'left' });

  y += 8;

  const items = Array.isArray(todayEntry.items) ? todayEntry.items : [];
  const dItems = items.filter(it => it.side === 'D');
  const rItems = items.filter(it => it.side === 'R');

  // Two pyramids side by side
  const colGap = 16;
  const colWidth = (contentWidth - colGap) / 2;
  const leftColX = margin;
  const rightColX = margin + colWidth + colGap;

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.setTextColor(200, 120, 120);
  pdf.text('DYSREGULATING', leftColX + colWidth / 2, y, { align: 'center' });

  pdf.setTextColor(74, 174, 136);
  pdf.text('REGULATING', rightColX + colWidth / 2, y, { align: 'center' });

  y += 6;

  const pyramidTop = y;
  const pyramidBottom = pageHeight - 16;
  const availH = pyramidBottom - pyramidTop;
  const rowGap = 1.5;
  const bandCount = CBM_BANDS.length;
  const rowH = (availH - rowGap * (bandCount - 1)) / bandCount;

  const drawPyramid = (colX, isReg) => {
    const rgb = isReg ? [74, 174, 136] : [200, 120, 120];
    const fillRgb = isReg ? [240, 250, 245] : [250, 240, 240];
    const itemsForCol = isReg ? rItems : dItems;

    // i is band index (0 = base widest, 11 = tip narrowest)
    // We render top-to-bottom: tip first (i=11), base last (i=0)
    for (let displayIdx = 0; displayIdx < bandCount; displayIdx++) {
      const bandIdx = (bandCount - 1) - displayIdx;
      const band = CBM_BANDS[bandIdx];
      // Width: tip narrowest (38%), base widest (100%)
      const widthPct = 0.38 + ((bandCount - 1 - bandIdx) / (bandCount - 1)) * 0.62;
      const rowWidth = colWidth * widthPct;
      const rowX = colX + (colWidth - rowWidth) / 2;
      const rowY = pyramidTop + displayIdx * (rowH + rowGap);

      pdf.setFillColor(fillRgb[0], fillRgb[1], fillRgb[2]);
      pdf.setDrawColor(rgb[0], rgb[1], rgb[2]);
      pdf.setLineWidth(0.3);
      pdf.roundedRect(rowX, rowY, rowWidth, rowH, 1.2, 1.2, 'FD');

      // Band label on the left (outside the band, in the column gutter)
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(6.5);
      pdf.setTextColor(140, 155, 170);
      pdf.text(band.label, rowX - 2, rowY + rowH / 2 + 1.5, { align: 'right' });

      // Items in this band
      const inBand = itemsForCol.filter(it => bandForLoad(it.load) === bandIdx);
      if (inBand.length === 0) continue;

      const pillPadX = 3;
      const pillH = rowH * 0.6;
      const pillGap = 2;
      const fontSize = 7;

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(fontSize);

      // Lay out pills (single row, wrap not needed for typical band counts)
      const pillData = inBand.map(it => ({
        text: it.name,
        w: pdf.getTextWidth(it.name) + pillPadX * 2,
      }));

      const maxRowW = rowWidth - 8;
      const totalW = pillData.reduce((s, p) => s + p.w, 0) + (pillData.length - 1) * pillGap;

      if (totalW <= maxRowW) {
        let px = rowX + (rowWidth - totalW) / 2;
        const py = rowY + (rowH - pillH) / 2;
        for (const p of pillData) {
          pdf.setFillColor(255, 255, 255);
          pdf.setDrawColor(rgb[0], rgb[1], rgb[2]);
          pdf.setLineWidth(0.2);
          pdf.roundedRect(px, py, p.w, pillH, 0.8, 0.8, 'FD');
          pdf.setTextColor(60, 75, 90);
          pdf.text(p.text, px + p.w / 2, py + pillH / 2 + 1.5, { align: 'center' });
          px += p.w + pillGap;
        }
      } else {
        // Too many to fit one row: render a count
        pdf.setFont('helvetica', 'italic');
        pdf.setFontSize(7);
        pdf.setTextColor(100, 115, 130);
        pdf.text(inBand.map(it => it.name).join(', '), rowX + rowWidth / 2, rowY + rowH / 2 + 1.5, { align: 'center', maxWidth: rowWidth - 6 });
      }
    }
  };

  drawPyramid(leftColX, false);
  drawPyramid(rightColX, true);

  return pageNumber;
}

// ===== MAIN EXPORT =====
export async function generatePDF(config) {
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  await drawCoverPage(pdf);

  let pageNumber = 2;

  await drawContentsPage(pdf, config, pageNumber);
  pageNumber++;

  if (config.progress) {
    pageNumber = await drawProgress(pdf, pageNumber, config.progressTimeframe);
  }

  if (config.complexes) {
    pageNumber = await drawComplexes(pdf, pageNumber);
  }

  if (config.cbmSummary) {
    pageNumber = await drawCBMSummary(pdf, pageNumber);
  }

  const filename = 'axis-export-' + new Date().toISOString().slice(0, 10) + '.pdf';
  pdf.save(filename);
}