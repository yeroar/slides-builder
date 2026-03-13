/* ══════════════════════════════════════════════════════════════
   Slide Renderer — Server-safe module
   Takes a template ID + slot data and returns HTML for a slide-inner.
   ══════════════════════════════════════════════════════════════ */

// ── Helpers (inline, no shared.js dependency) ──

function escHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function footerHTML(title, copy, page) {
  return `<div class="footer"><span class="footer-title">${title}</span><span class="footer-copy">${copy}</span><span class="footer-page">${page}</span></div>`;
}

function deEmph(value) {
  return String(value).replace(/[\$><]/g, m => `<span style="color:rgba(60,49,43,0.24);">${m}</span>`);
}

function statCell(title, value, w, h, valueClass) {
  const styledValue = deEmph(value);
  const wStyle = w ? `width:${w}px;` : '';
  return `<div class="stat-cell" style="${wStyle} flex:1;"><div class="h5 c-primary">${title}</div><div class="${valueClass} c-primary">${styledValue}</div></div>`;
}

function varCard(title, value, large) {
  const styled = deEmph(value);
  const cls = large ? 'var-card large' : 'var-card';
  return `<div class="${cls}"><span class="var-card-title">${title}</span><div class="var-card-spacer"></div><span class="var-card-value">${styled}</span></div>`;
}

const GRID_CSS = {
  '2x1': 'grid-template-columns:1fr 1fr; grid-template-rows:1fr;',
  '2x2': 'grid-template-columns:1fr 1fr; grid-template-rows:1fr 1fr;',
  '2x3': 'grid-template-columns:1fr 1fr; grid-template-rows:1fr 1fr 1fr;',
  '3x1': 'grid-template-columns:1fr 1fr 1fr; grid-template-rows:1fr;',
  '3x2': 'grid-template-columns:1fr 1fr 1fr; grid-template-rows:1fr 1fr;',
  '3x3': 'grid-template-columns:1fr 1fr 1fr; grid-template-rows:1fr 1fr 1fr;',
};

function varTable(type, title, items, opts) {
  opts = opts || {};
  const gridStyle = GRID_CSS[type] || GRID_CSS['2x3'];
  const colorClass = opts.color || (type.startsWith('2') ? 'yellow' : 'blue');
  const cols = parseInt(type[0]);
  const rows = parseInt(type[2]);
  const count = cols * rows;
  const visibleItems = items.slice(0, count);
  const isLarge = rows === 1;
  let cards = '';
  for (const item of visibleItems) cards += varCard(item[0], item[1], isLarge);
  const style = opts.height ? `style="height:${opts.height}px;"` : '';
  return `<div class="var-table ${colorClass}" ${style}><div class="var-table-title">${title}</div><div class="var-table-grid" style="${gridStyle} display:grid; gap:12px; flex:1;">${cards}</div></div>`;
}

function cardNoImg(title, items) {
  return `
    <div class="feature-card-noimg" style="flex:1; width:auto;">
      <div class="tl-featurecol">
        <div class="h5">${escHtml(title)}</div>
        <div class="list">${items.map(item => `<div class="h5">${escHtml(item)}</div>`).join('')}</div>
      </div>
    </div>`;
}

function cardImg(title, items) {
  return `
    <div class="feature-card" style="flex:1; width:auto; height:100%;">
      <div class="feature-card-img" style="flex:1; height:auto;"></div>
      <div class="tl-featurecol">
        <div class="h6">${escHtml(title)}</div>
        <div class="list">${items.map(item => `<div class="h6 c-secondary">${escHtml(item)}</div>`).join('')}</div>
      </div>
    </div>`;
}

function statsHeader(yellow, primary, body, disclaimer, titleWidth) {
  return `<div class="content-frame">
      <div class="tl-stats">
        <div class="tl-stats-top">
          <div class="tl-stats-title" style="width:${titleWidth || 683}px;">
            <div class="h3 c-yellow">${yellow}</div>
            <div class="h3 c-primary">${primary}</div>
          </div>
          ${body ? `<div class="h5 c-secondary" style="width:589px;">${body}</div>` : ''}
        </div>
        ${disclaimer ? `<div class="p3 c-tertiary" style="width:792px; line-height:16px;">${disclaimer}</div>` : ''}
      </div>
    </div>`;
}

function threeColHeader(label, heading, body) {
  return `
    <div class="content-frame">
      <div class="tl-stats" style="width:auto;">
        <div class="tl-stats-top">
          <div class="tl-stats-title">
            <div class="h3 c-yellow">${escHtml(label)}</div>
            <div class="h3 c-primary">${escHtml(heading)}</div>
          </div>
          ${body ? `<div class="h5 c-secondary" style="width:589px;">${escHtml(body)}</div>` : ''}
        </div>
      </div>
    </div>`;
}

function logoCard(name, chip) {
  return `<div class="logo-card"><div class="logo-card-img"><div class="img-placeholder"></div></div><div class="logo-card-footer"><span class="p1 c-tertiary">${escHtml(name)}</span>${chip ? `<span class="logo-chip">${escHtml(chip)}</span>` : ''}</div></div>`;
}

function logoGrid(data, c, sizeClass) {
  let html = `<div class="logo-grid ${sizeClass}">`;
  const r = Math.ceil(data.length / c);
  for (let i = 0; i < r; i++) {
    html += '<div class="logo-grid-row">';
    for (let j = 0; j < c; j++) {
      const item = data[i * c + j];
      html += logoCard(item ? item.name : '', item ? item.chip : '');
    }
    html += '</div>';
  }
  html += '</div>';
  return html;
}

function logoLineItem(name, desc, chip) {
  const bodyClass = chip && !desc ? 'logo-line-item-body compact' : 'logo-line-item-body';
  const chipHtml = chip ? `<span class="logo-line-chip">${escHtml(chip)}</span>` : '';
  const descHtml = desc ? `<div class="p1 c-secondary">${desc}</div>` : '';
  return `<div class="logo-line-item"><div class="logo-line-item-card"><div class="img-placeholder"></div></div><div class="${bodyClass}"><div class="h5 c-secondary">${escHtml(name)}</div><div class="logo-line-item-body-wrap">${descHtml}${chipHtml}</div></div></div>`;
}

function logoLineGrid(data, c, r) {
  const useChips = r >= 4;
  let html = '<div class="logo-line-grid">';
  for (let i = 0; i < r; i++) {
    html += '<div class="logo-line-row">';
    for (let j = 0; j < c; j++) {
      const item = data[i * c + j];
      const desc = useChips ? '' : (item ? item.desc || '' : '');
      const chip = useChips ? (item ? item.chip || '' : '') : '';
      html += logoLineItem(item ? item.name : '', desc, chip);
    }
    html += '</div>';
  }
  html += '</div>';
  return html;
}

function compareBlock(variant, label, breakdown) {
  const breakdownChip = breakdown ? `<div class="compare-chip breakdown">${escHtml(breakdown)}</div>` : '';
  return `<div class="compare-block ${variant}"><div class="compare-block-content"><div class="compare-block-img"></div><div class="compare-chip label">${escHtml(label)}</div>${breakdownChip}</div></div>`;
}


// ── Render functions by template ID ──

const renderers = {

  start(slots, footer) {
    const html = `
        <div class="start-title">
          <div class="h1 c-primary">${escHtml(slots.heading)}</div>
          ${slots.subheading ? `<div class="h1 c-yellow">${escHtml(slots.subheading)}</div>` : ''}
        </div>`;
    return { bg: 'bg-brand', html };
  },

  end(slots, footer) {
    const html = `
        <div class="end-text">
          <div class="h1 c-primary">${escHtml(slots.text)}</div>
        </div>`;
    return { bg: 'bg-brand', html };
  },

  agenda(slots, footer) {
    const bullets = slots.items.map(item => {
      const lineClass = item.active ? 'line line-accent' : 'line line-default';
      const textClass = item.active ? 'h1 c-accent' : 'h1 c-disabled';
      return `<div class="bullet"><div class="${lineClass}"></div><div class="${textClass}">${escHtml(item.text)}</div></div>`;
    }).join('');
    const html = `
        <div class="content-1col">
          <div class="slot-agenda" style="width:1760px">
            ${bullets}
          </div>
        </div>
        ${footerHTML(footer.title, footer.copy, footer.page)}`;
    return { bg: 'bg-warning', html };
  },

  section(slots, footer) {
    const items = slots.items.map(item => {
      const cls = item.active ? 'h1 c-primary' : 'h1 c-disabled';
      return `<div class="${cls}">${escHtml(item.text)}</div>`;
    }).join('');
    const html = `
        <div class="section-items">
          ${items}
        </div>
        ${footerHTML(footer.title, footer.copy, footer.page)}`;
    return { bg: 'bg-warning', html };
  },

  thoughts(slots, footer) {
    const align = slots.align || 'left';
    const text = `<div class="slot slot-text-740"><div style="display:flex; flex-direction:column; width:740px;"><div class="h2 c-primary">${escHtml(slots.primaryText)}</div><div class="h2 c-yellow" style="margin-top:48px;">${escHtml(slots.accentText)}</div></div></div>`;
    const img = `<div class="slot slot-fill"><div class="img-placeholder"></div></div>`;
    const inner = align === 'right' ? `${img}${text}` : `${text}${img}`;
    const html = `<div class="content-2col" style="align-items:stretch;">${inner}</div>${footerHTML(footer.title, footer.copy, footer.page)}`;
    return { bg: 'bg-warning', html };
  },

  quote(slots, footer) {
    const align = slots.align || 'left';
    const text = `<div class="slot slot-text-740" style="justify-content:space-between;"><div class="h2 c-primary" style="position:relative;"><span style="position:absolute; right:100%; color:var(--yellow-500);">&ldquo;</span>${escHtml(slots.quote)}<span style="color:var(--yellow-500);">&rdquo;</span></div><div class="author"><div class="h4 c-tertiary">${escHtml(slots.author)}</div><div class="h4 c-yellow">${escHtml(slots.authorTitle)}</div></div></div>`;
    const img = `<div class="slot slot-fill"><div class="img-placeholder"></div></div>`;
    const inner = align === 'right' ? `${img}${text}` : `${text}${img}`;
    const html = `<div class="content-2col" style="align-items:stretch;">${inner}</div>${footerHTML(footer.title, footer.copy, footer.page)}`;
    return { bg: 'bg-warning', html };
  },

  textslide(slots, footer) {
    const html = `
        <div class="content-frame" style="width:890px;">
          <div class="h4 c-yellow">${escHtml(slots.label)}</div>
        </div>
        <div style="position:absolute; top:305px; left:64px; width:1191px;">
          <div class="c-primary" style="font-size:72px; line-height:64px; font-weight:400;">${escHtml(slots.body)}</div>
        </div>
        ${footerHTML(footer.title, footer.copy, footer.page)}`;
    return { bg: 'bg-warning', html };
  },

  cards(slots, footer) {
    const header = threeColHeader(slots.label, slots.heading, slots.body);
    const cardsHtml = slots.cards.map(c => cardNoImg(c.title, c.bullets)).join('');
    const html = `${header}<div class="content-3col" style="top:305px; height:711px;">${cardsHtml}</div>${footerHTML(footer.title, footer.copy, footer.page)}`;
    return { bg: 'bg-warning', html };
  },

  'cards-2col'(slots, footer) {
    const header = threeColHeader(slots.label, slots.heading, slots.body);
    const cardsHtml = slots.cards.map(c => cardNoImg(c.title, c.bullets)).join('');
    const html = `${header}<div style="position:absolute; top:305px; left:64px; right:64px; bottom:64px; display:flex; gap:12px;">${cardsHtml}</div>${footerHTML(footer.title, footer.copy, footer.page)}`;
    return { bg: 'bg-warning', html };
  },

  'cards-img'(slots, footer) {
    const header = threeColHeader(slots.label, slots.heading, slots.body);
    const cardsHtml = slots.cards.map(c => cardImg(c.title, c.bullets)).join('');
    const html = `${header}<div class="content-3col" style="top:305px; height:711px;">${cardsHtml}</div>${footerHTML(footer.title, footer.copy, footer.page)}`;
    return { bg: 'bg-warning', html };
  },

  'cards-2col-img'(slots, footer) {
    const header = threeColHeader(slots.label, slots.heading, slots.body);
    const cardsHtml = slots.cards.map(c => cardImg(c.title, c.bullets)).join('');
    const html = `${header}<div style="position:absolute; top:305px; left:64px; right:64px; bottom:64px; display:flex; gap:12px;">${cardsHtml}</div>${footerHTML(footer.title, footer.copy, footer.page)}`;
    return { bg: 'bg-warning', html };
  },

  features(slots, footer) {
    const rows = slots.features.map(item => `
          <div style="display:flex; gap:24px; align-items:center;">
            <div style="width:330px; height:180px; flex-shrink:0; border-radius:8px; background:var(--layer-brand);"></div>
            <div style="display:flex; flex-direction:column; gap:8px; max-width:580px;">
              <div class="h5 c-primary" style="white-space:nowrap;">${escHtml(item.title)}</div>
              <div class="h6 c-secondary">${escHtml(item.desc)}</div>
            </div>
          </div>`).join('');
    const html = `
          <div class="content-2col" style="align-items:stretch;">
            <div class="slot" style="width:589px; justify-content:center;">
              <div style="display:flex; flex-direction:column; gap:24px; width:589px;">
                <div class="h3 c-primary">${escHtml(slots.heading)}</div>
                ${slots.label ? `<div class="h5 c-secondary">${escHtml(slots.label)}</div>` : ''}
              </div>
            </div>
            <div class="slot slot-fill" style="display:flex; flex-direction:column; justify-content:center; gap:32px; padding:48px 0;">
              ${rows}
            </div>
          </div>
          ${footerHTML(footer.title, footer.copy, footer.page)}`;
    return { bg: 'bg-warning', html };
  },

  description(slots, footer) {
    const align = slots.align || 'left';
    const text = `<div style="width:740px; flex-shrink:0; display:flex; flex-direction:column; gap:154px; padding-top:0;"><div class="h2 c-primary">${escHtml(slots.title)}</div><div class="h4 c-secondary">${escHtml(slots.body)}</div></div>`;
    const image = `<div style="flex:1; min-width:0; background:var(--layer-brand); border-radius:12px;"></div>`;
    const inner = align === 'right' ? `${image}${text}` : `${text}${image}`;
    const html = `<div style="position:absolute; top:64px; left:64px; right:64px; bottom:64px; display:flex; gap:162px; align-items:stretch;">${inner}</div>${footerHTML(footer.title, footer.copy, footer.page)}`;
    return { bg: 'bg-warning', html };
  },

  'partners-desc'(slots, footer) {
    const data = slots.partners.map(p => ({ name: p.name, chip: p.chip || '' }));
    const grid = logoGrid(data, 2, 'half');
    const html = `
            <div style="position:absolute; top:64px; left:64px; width:740px; display:flex; flex-direction:column; gap:154px;">
              <div class="h2 c-primary">${escHtml(slots.title)}</div>
              <div class="h4 c-secondary">${escHtml(slots.body)}</div>
            </div>
            <div style="position:absolute; top:64px; right:64px;">
              ${grid}
            </div>
            ${footerHTML(footer.title, footer.copy, footer.page)}`;
    return { bg: 'bg-warning', html };
  },

  'partners-full'(slots, footer) {
    const cols = slots.cols || 4;
    const rows = slots.rows || 4;
    const data = slots.partners.map(p => ({ name: p.name, chip: p.chip || '' }));
    // Pad data to fill grid
    while (data.length < cols * rows) data.push({ name: '', chip: '' });
    const header = statsHeader(escHtml(slots.label), escHtml(slots.heading), '');
    const grid = logoGrid(data.slice(0, cols * rows), cols, 'full compact');
    const html = `
            ${header}
            <div style="position:absolute; top:305px; left:64px;">
              ${grid}
            </div>
            ${footerHTML(footer.title, footer.copy, footer.page)}`;
    return { bg: 'bg-warning', html };
  },

  'partners-lineitem'(slots, footer) {
    const data = slots.partners.map(p => ({
      name: p.name,
      desc: p.desc || '',
      chip: p.chip || '',
    }));
    const r = Math.min(Math.ceil(data.length / 2), 4);
    const header = statsHeader(escHtml(slots.label), escHtml(slots.heading), '');
    const grid = logoLineGrid(data, 2, r);
    const html = `
            ${header}
            <div style="position:absolute; top:305px; left:64px;">
              ${grid}
            </div>
            ${footerHTML(footer.title, footer.copy, footer.page)}`;
    return { bg: 'bg-warning', html };
  },

  comparison(slots, footer) {
    const html = `
          <div class="content-frame">
            <div class="tl-vertical-header">
              <div class="h4 c-primary">${escHtml(slots.title)}</div>
              <div class="tl-vh-body">${escHtml(slots.body)}</div>
            </div>
          </div>
          <div style="position:absolute; top:305px; left:64px; width:1792px; height:708px; display:flex; gap:12px; align-items:stretch;">
            ${compareBlock('yellow', slots.blockA.label, slots.blockA.breakdown || '')}
            ${compareBlock('blue', slots.blockB.label, slots.blockB.breakdown || '')}
          </div>
          ${footerHTML(footer.title, footer.copy, footer.page)}`;
    return { bg: 'bg-warning', html };
  },

  proof(slots, footer) {
    const grid = slots.stats.map(stat => `
          <div class="proof-stat">
            <div class="h1 c-primary">${deEmph(stat.value)}</div>
            <div class="h5 c-secondary">${escHtml(stat.desc)}</div>
          </div>`).join('');
    const html = `
          <div class="proof-layout">
            <div class="proof-panel">
              <div class="proof-panel-inner">
                <div class="h3 c-primary">${escHtml(slots.title)}</div>
                <div class="h5 c-secondary">${escHtml(slots.body)}</div>
              </div>
            </div>
            <div class="proof-grid">
              ${grid}
            </div>
          </div>
          ${footerHTML(footer.title, footer.copy, footer.page)}`;
    return { bg: 'bg-warning', html };
  },

  'stats-2x1'(slots, footer) {
    const header = statsHeader(escHtml(slots.label), escHtml(slots.heading), slots.body ? escHtml(slots.body) : '');
    const grid = `<div class="stat-grid-row">${slots.stats.map(s => statCell(escHtml(s.title), s.value, 0, 0, 'h1')).join('')}</div>`;
    const html = `${header}<div class="stat-grid" style="position:absolute; top:305px; left:64px; right:64px; bottom:64px;">${grid}</div>${footerHTML(footer.title, footer.copy, footer.page)}`;
    return { bg: 'bg-warning', html };
  },

  'stats-3x1'(slots, footer) {
    const header = statsHeader(escHtml(slots.label), escHtml(slots.heading), slots.body ? escHtml(slots.body) : '');
    const grid = `<div class="stat-grid-3" style="flex:1;">${slots.stats.map(s => statCell(escHtml(s.title), s.value, 0, 0, 'h2')).join('')}</div>`;
    const html = `${header}<div class="stat-grid" style="position:absolute; top:305px; left:64px; right:64px; bottom:64px;">${grid}</div>${footerHTML(footer.title, footer.copy, footer.page)}`;
    return { bg: 'bg-warning', html };
  },

  'stats-2x2'(slots, footer) {
    const header = statsHeader(escHtml(slots.label), escHtml(slots.heading), slots.body ? escHtml(slots.body) : '', null, 1792);
    const row1 = `<div class="stat-grid-row">${statCell(escHtml(slots.stats[0].title), slots.stats[0].value, 0, 0, 'h1')}${statCell(escHtml(slots.stats[1].title), slots.stats[1].value, 0, 0, 'h1')}</div>`;
    const row2 = `<div class="stat-grid-row">${statCell(escHtml(slots.stats[2].title), slots.stats[2].value, 0, 0, 'h1')}${statCell(escHtml(slots.stats[3].title), slots.stats[3].value, 0, 0, 'h1')}</div>`;
    const html = `${header}<div class="stat-grid" style="position:absolute; top:305px; left:64px; right:64px; bottom:64px;">${row1}${row2}</div>${footerHTML(footer.title, footer.copy, footer.page)}`;
    return { bg: 'bg-warning', html };
  },

  datatable(slots, footer) {
    const colCount = slots.headers.length;
    const firstColWidth = colCount > 1 ? (100 / colCount * 2).toFixed(2) : 100;
    const otherColWidth = colCount > 1 ? ((100 - firstColWidth) / (colCount - 1)).toFixed(2) : 0;
    const colgroup = `<colgroup><col style="width:${firstColWidth}%">${slots.headers.slice(1).map(() => `<col style="width:${otherColWidth}%">`).join('')}</colgroup>`;
    const thead = `<thead><tr>${slots.headers.map((h, i) => `<th${i > 0 ? ' class="num"' : ''}>${escHtml(h)}</th>`).join('')}</tr></thead>`;
    const tbody = slots.rows.map((row, ri) => {
      const cells = row.map((cell, ci) => {
        const cls = ri === 0 ? (ci > 0 ? ' class="num highlight"' : ' class="highlight"') : (ci > 0 ? ' class="num"' : '');
        return `<td${cls}>${escHtml(cell)}</td>`;
      }).join('');
      return `<tr>${cells}</tr>`;
    }).join('');
    const header = statsHeader(escHtml(slots.label), escHtml(slots.heading), '');
    const html = `
        ${header}
        <div style="position:absolute; top:192px; left:64px; right:64px; bottom:64px; display:flex; flex-direction:column;">
          <table class="data-table" style="width:100%; height:100%; table-layout:fixed;">
            ${colgroup}
            ${thead}
            <tbody>
              ${tbody}
            </tbody>
          </table>
        </div>
        ${footerHTML(footer.title, footer.copy, footer.page)}`;
    return { bg: 'bg-warning', html };
  },

  'side-by-side'(slots, footer) {
    const bothSingleRow = slots.leftGrid.endsWith('x1') && slots.rightGrid.endsWith('x1');
    const top = bothSingleRow ? 'calc(37.5% + 24px)' : '192px';
    const header = `<div class="content-frame">
            <div style="display:flex; flex-direction:column; width:890px;">
              <div class="h5" style="color:var(--face-tertiary);">${escHtml(slots.label)}</div>
              <div class="h3 c-primary">${escHtml(slots.heading)}</div>
            </div>
          </div>`;
    const leftTable = varTable(slots.leftGrid, escHtml(slots.leftTitle), slots.leftItems, { color: 'yellow' });
    const rightTable = varTable(slots.rightGrid, escHtml(slots.rightTitle), slots.rightItems, { color: 'blue' });
    const html = `
          ${header}
          <div class="slot-tables-row" style="position:absolute; top:${top}; left:64px; right:64px; bottom:64px;">
            ${leftTable}
            ${rightTable}
          </div>
          ${footerHTML(footer.title, footer.copy, footer.page)}`;
    return { bg: 'bg-warning', html };
  },

  carousel(slots, footer) {
    const header = statsHeader(escHtml(slots.label), escHtml(slots.heading), slots.body ? escHtml(slots.body) : '');
    let cells = '';
    slots.steps.forEach(step => {
      const styled = deEmph(step.value);
      cells += `<div class="stat-cell" style="flex:none; width:589px; scroll-snap-align:start;"><div class="h5 c-primary">${escHtml(step.title)}</div><div class="h2 c-primary">${styled}</div></div>`;
    });
    const html = `
          ${header}
          <div class="carousel-track" style="position:absolute; top:305px; left:64px; right:0; height:711px; overflow:hidden; cursor:grab;">
            <div style="display:flex; gap:12px; height:100%; padding-right:64px; transform:translateX(0); transition:none; user-select:none;">
              ${cells}
            </div>
          </div>
          ${footerHTML(footer.title, footer.copy, footer.page)}`;
    return { bg: 'bg-warning', html };
  },
};


// ── Public API ──

/**
 * Render a slide from template ID + slot data.
 * @param {string} templateId - One of the TEMPLATE_SCHEMAS keys
 * @param {object} slots - Slot data matching the template schema
 * @param {{ title: string, copy: string, page: string|number }} footer
 * @returns {{ bg: string, html: string }}
 */
export function renderSlide(templateId, slots, footer) {
  const fn = renderers[templateId];
  if (!fn) throw new Error(`Unknown template: ${templateId}`);
  footer = footer || { title: '', copy: '', page: '' };
  return fn(slots, footer);
}


// ── Template schemas (JSON-serializable) ──

export const TEMPLATE_SCHEMAS = {
  start: {
    bg: 'bg-brand',
    slots: {
      heading: { type: 'string', required: true, desc: 'Main title (H1 primary)' },
      subheading: { type: 'string', desc: 'Subtitle line (H1 yellow)' },
    },
  },
  end: {
    bg: 'bg-brand',
    slots: {
      text: { type: 'string', required: true, desc: 'Closing text (H1 primary)' },
    },
  },
  agenda: {
    bg: 'bg-warning',
    slots: {
      items: {
        type: 'array',
        required: true,
        maxItems: 5,
        desc: 'Agenda items',
        itemSchema: {
          text: { type: 'string', required: true, desc: 'Agenda item text' },
          active: { type: 'boolean', desc: 'Highlight with accent line (default false)' },
        },
      },
    },
  },
  section: {
    bg: 'bg-warning',
    slots: {
      items: {
        type: 'array',
        required: true,
        maxItems: 5,
        desc: 'Section items — first active item is primary, rest disabled',
        itemSchema: {
          text: { type: 'string', required: true, desc: 'Section item text' },
          active: { type: 'boolean', desc: 'Show as primary (default false = disabled)' },
        },
      },
    },
  },
  thoughts: {
    bg: 'bg-warning',
    slots: {
      primaryText: { type: 'string', required: true, desc: 'H2 primary text block' },
      accentText: { type: 'string', required: true, desc: 'H2 yellow accent text block' },
      align: { type: 'string', enum: ['left', 'right'], desc: 'Text side (default left, image opposite)' },
    },
  },
  quote: {
    bg: 'bg-warning',
    slots: {
      quote: { type: 'string', required: true, desc: 'Quote body text (H2, hanging quote marks)' },
      author: { type: 'string', required: true, desc: 'Author name (H4 tertiary)' },
      authorTitle: { type: 'string', required: true, desc: 'Author title/role (H4 yellow)' },
      align: { type: 'string', enum: ['left', 'right'], desc: 'Text side (default left, image opposite)' },
    },
  },
  textslide: {
    bg: 'bg-warning',
    slots: {
      label: { type: 'string', required: true, desc: 'H4 yellow title at top' },
      body: { type: 'string', required: true, desc: 'Big statement body (72px)' },
    },
  },
  cards: {
    bg: 'bg-warning',
    slots: {
      label: { type: 'string', required: true, desc: 'H3 yellow label' },
      heading: { type: 'string', required: true, desc: 'H3 primary heading' },
      body: { type: 'string', desc: 'H5 secondary description (589px)' },
      cards: {
        type: 'array',
        required: true,
        minItems: 2,
        maxItems: 3,
        desc: 'Feature cards (2-3)',
        itemSchema: {
          title: { type: 'string', required: true, desc: 'Card title (H5)' },
          bullets: { type: 'array', required: true, maxItems: 4, desc: 'Bullet points (H5)' },
        },
      },
    },
  },
  'cards-2col': {
    bg: 'bg-warning',
    slots: {
      label: { type: 'string', required: true, desc: 'H3 yellow label' },
      heading: { type: 'string', required: true, desc: 'H3 primary heading' },
      body: { type: 'string', desc: 'H5 secondary description (589px)' },
      cards: {
        type: 'array',
        required: true,
        minItems: 2,
        maxItems: 2,
        desc: 'Feature cards (exactly 2)',
        itemSchema: {
          title: { type: 'string', required: true, desc: 'Card title (H5)' },
          bullets: { type: 'array', required: true, maxItems: 4, desc: 'Bullet points (H5)' },
        },
      },
    },
  },
  'cards-img': {
    bg: 'bg-warning',
    slots: {
      label: { type: 'string', required: true, desc: 'H3 yellow label' },
      heading: { type: 'string', required: true, desc: 'H3 primary heading' },
      body: { type: 'string', desc: 'H5 secondary description (589px)' },
      cards: {
        type: 'array',
        required: true,
        minItems: 2,
        maxItems: 3,
        desc: 'Feature cards with image placeholders (2-3)',
        itemSchema: {
          title: { type: 'string', required: true, desc: 'Card title (H6)' },
          bullets: { type: 'array', required: true, maxItems: 4, desc: 'Bullet points (H6 secondary)' },
        },
      },
    },
  },
  'cards-2col-img': {
    bg: 'bg-warning',
    slots: {
      label: { type: 'string', required: true, desc: 'H3 yellow label' },
      heading: { type: 'string', required: true, desc: 'H3 primary heading' },
      body: { type: 'string', desc: 'H5 secondary description (589px)' },
      cards: {
        type: 'array',
        required: true,
        minItems: 2,
        maxItems: 2,
        desc: 'Feature cards with image placeholders (exactly 2)',
        itemSchema: {
          title: { type: 'string', required: true, desc: 'Card title (H6)' },
          bullets: { type: 'array', required: true, maxItems: 4, desc: 'Bullet points (H6 secondary)' },
        },
      },
    },
  },
  features: {
    bg: 'bg-warning',
    slots: {
      label: { type: 'string', desc: 'H5 secondary subtitle under heading' },
      heading: { type: 'string', required: true, desc: 'H3 primary heading (left column)' },
      features: {
        type: 'array',
        required: true,
        maxItems: 3,
        desc: 'Feature rows with thumbnails',
        itemSchema: {
          title: { type: 'string', required: true, desc: 'Feature title (H5)' },
          desc: { type: 'string', required: true, desc: 'Feature description (H6 secondary)' },
        },
      },
    },
  },
  description: {
    bg: 'bg-warning',
    slots: {
      title: { type: 'string', required: true, desc: 'H2 primary title' },
      body: { type: 'string', required: true, desc: 'H4 secondary body text' },
      align: { type: 'string', enum: ['left', 'right'], desc: 'Text side (default left, image opposite)' },
    },
  },
  'partners-desc': {
    bg: 'bg-warning',
    slots: {
      title: { type: 'string', required: true, desc: 'H2 primary title (left column)' },
      body: { type: 'string', required: true, desc: 'H4 secondary body (left column)' },
      partners: {
        type: 'array',
        required: true,
        desc: 'Partner logo cards (displayed in 2-col grid, right side)',
        itemSchema: {
          name: { type: 'string', required: true, desc: 'Partner name' },
          chip: { type: 'string', desc: 'Optional chip label (e.g. "4% back")' },
        },
      },
    },
  },
  'partners-full': {
    bg: 'bg-warning',
    slots: {
      label: { type: 'string', required: true, desc: 'H3 yellow label' },
      heading: { type: 'string', required: true, desc: 'H3 primary heading' },
      partners: {
        type: 'array',
        required: true,
        desc: 'Partner logo cards',
        itemSchema: {
          name: { type: 'string', required: true, desc: 'Partner name' },
          chip: { type: 'string', desc: 'Optional chip label' },
        },
      },
      cols: { type: 'number', required: true, desc: 'Number of grid columns (2-4)' },
      rows: { type: 'number', required: true, desc: 'Number of grid rows (2-4)' },
    },
  },
  'partners-lineitem': {
    bg: 'bg-warning',
    slots: {
      label: { type: 'string', required: true, desc: 'H3 yellow label' },
      heading: { type: 'string', required: true, desc: 'H3 primary heading' },
      partners: {
        type: 'array',
        required: true,
        desc: 'Partner line items (2-col, 2-4 rows). 4 rows = chip mode, 2-3 rows = description mode',
        itemSchema: {
          name: { type: 'string', required: true, desc: 'Partner name' },
          desc: { type: 'string', desc: 'Description (shown when <4 rows)' },
          chip: { type: 'string', desc: 'Category chip (shown when >=4 rows)' },
        },
      },
    },
  },
  comparison: {
    bg: 'bg-warning',
    slots: {
      title: { type: 'string', required: true, desc: 'H4 primary header title' },
      body: { type: 'string', required: true, desc: 'Body text under title' },
      blockA: {
        type: 'object',
        required: true,
        desc: 'Yellow comparison block (left)',
        schema: {
          label: { type: 'string', required: true, desc: 'Block label chip' },
          breakdown: { type: 'string', desc: 'Optional breakdown chip' },
        },
      },
      blockB: {
        type: 'object',
        required: true,
        desc: 'Blue comparison block (right)',
        schema: {
          label: { type: 'string', required: true, desc: 'Block label chip' },
          breakdown: { type: 'string', desc: 'Optional breakdown chip' },
        },
      },
    },
  },
  proof: {
    bg: 'bg-warning',
    slots: {
      title: { type: 'string', required: true, desc: 'H3 primary title (yellow panel)' },
      body: { type: 'string', required: true, desc: 'H5 secondary body (yellow panel)' },
      stats: {
        type: 'array',
        required: true,
        minItems: 4,
        maxItems: 4,
        desc: 'Exactly 4 proof stats in 2x2 grid',
        itemSchema: {
          value: { type: 'string', required: true, desc: 'Stat value (H1, supports $ > < de-emphasis)' },
          desc: { type: 'string', required: true, desc: 'Stat description (H5 secondary)' },
        },
      },
    },
  },
  'stats-2x1': {
    bg: 'bg-warning',
    slots: {
      label: { type: 'string', required: true, desc: 'H3 yellow label' },
      heading: { type: 'string', required: true, desc: 'H3 primary heading' },
      body: { type: 'string', desc: 'H5 secondary description' },
      stats: {
        type: 'array',
        required: true,
        minItems: 2,
        maxItems: 2,
        desc: 'Exactly 2 stat cells (H1 values)',
        itemSchema: {
          title: { type: 'string', required: true, desc: 'Stat label (H5)' },
          value: { type: 'string', required: true, desc: 'Stat value (H1, supports $ > < de-emphasis)' },
        },
      },
    },
  },
  'stats-3x1': {
    bg: 'bg-warning',
    slots: {
      label: { type: 'string', required: true, desc: 'H3 yellow label' },
      heading: { type: 'string', required: true, desc: 'H3 primary heading' },
      body: { type: 'string', desc: 'H5 secondary description' },
      stats: {
        type: 'array',
        required: true,
        minItems: 3,
        maxItems: 3,
        desc: 'Exactly 3 stat cells (H2 values)',
        itemSchema: {
          title: { type: 'string', required: true, desc: 'Stat label (H5)' },
          value: { type: 'string', required: true, desc: 'Stat value (H2, supports $ > < de-emphasis)' },
        },
      },
    },
  },
  'stats-2x2': {
    bg: 'bg-warning',
    slots: {
      label: { type: 'string', required: true, desc: 'H3 yellow label' },
      heading: { type: 'string', required: true, desc: 'H3 primary heading' },
      body: { type: 'string', desc: 'H5 secondary description' },
      stats: {
        type: 'array',
        required: true,
        minItems: 4,
        maxItems: 4,
        desc: 'Exactly 4 stat cells in 2 rows (H1 values)',
        itemSchema: {
          title: { type: 'string', required: true, desc: 'Stat label (H5)' },
          value: { type: 'string', required: true, desc: 'Stat value (H1, supports $ > < de-emphasis)' },
        },
      },
    },
  },
  datatable: {
    bg: 'bg-warning',
    slots: {
      label: { type: 'string', required: true, desc: 'H6 tertiary label above table' },
      heading: { type: 'string', required: true, desc: 'Part of header (H3 primary)' },
      headers: {
        type: 'array',
        required: true,
        maxItems: 5,
        desc: 'Column headers (first col is text, rest are numeric-aligned)',
      },
      rows: {
        type: 'array',
        required: true,
        maxItems: 8,
        desc: 'Table rows (arrays of cell values). First row gets highlight style.',
      },
    },
  },
  'side-by-side': {
    bg: 'bg-warning',
    slots: {
      label: { type: 'string', required: true, desc: 'H5 tertiary label' },
      heading: { type: 'string', required: true, desc: 'H3 primary heading' },
      leftTitle: { type: 'string', required: true, desc: 'Yellow table title' },
      leftItems: {
        type: 'array',
        required: true,
        desc: 'Left table items as [title, value] pairs',
      },
      leftGrid: {
        type: 'string',
        required: true,
        desc: 'Grid layout (e.g. "2x3", "3x2", "2x1")',
      },
      rightTitle: { type: 'string', required: true, desc: 'Blue table title' },
      rightItems: {
        type: 'array',
        required: true,
        desc: 'Right table items as [title, value] pairs',
      },
      rightGrid: {
        type: 'string',
        required: true,
        desc: 'Grid layout (e.g. "3x2", "2x3", "3x1")',
      },
    },
  },
  carousel: {
    bg: 'bg-warning',
    slots: {
      label: { type: 'string', required: true, desc: 'H3 yellow label' },
      heading: { type: 'string', required: true, desc: 'H3 primary heading' },
      body: { type: 'string', desc: 'H5 secondary description' },
      steps: {
        type: 'array',
        required: true,
        minItems: 4,
        desc: 'Carousel steps (4+ items, 4th peeks off-screen)',
        itemSchema: {
          title: { type: 'string', required: true, desc: 'Step label (H5)' },
          value: { type: 'string', required: true, desc: 'Step value (H2, supports $ > < de-emphasis)' },
        },
      },
    },
  },
};

// Browser global for non-module contexts (shared.js loads this via <script type="module">)
if (typeof window !== 'undefined') {
  window.renderSlide = renderSlide;
  window.TEMPLATE_SCHEMAS = TEMPLATE_SCHEMAS;
}
