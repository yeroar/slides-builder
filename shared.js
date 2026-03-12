/* ══════════════════════════════════════════════════════════════
   Slide Builder — Shared Preview JS
   Reusable utilities for all preview files
   ══════════════════════════════════════════════════════════════ */

// ── Footer HTML helper ──
function footerHTML(title, copy, page) {
  return `<div class="footer"><span class="footer-title">${title}</span><span class="footer-copy">${copy}</span><span class="footer-page">${page}</span></div>`;
}

// ── VariableCard HTML builder ──
function varCard(title, value, large) {
  const styled = value.replace(/[\$><]/g, m => `<span class="dollar">${m}</span>`);
  const cls = large ? 'var-card large' : 'var-card';
  return `<div class="${cls}"><span class="var-card-title">${title}</span><div class="var-card-spacer"></div><span class="var-card-value">${styled}</span></div>`;
}

// ── Stat cell HTML builder ──
function statCell(title, value, w, h, valueClass) {
  const styledValue = value.replace(/[\$><]/g, m => `<span style="color:rgba(60,49,43,0.24);">${m}</span>`);
  const wStyle = w ? `width:${w}px;` : '';
  return `<div class="stat-cell" style="${wStyle} flex:1;"><div class="h5 c-primary">${title}</div><div class="${valueClass} c-primary">${styledValue}</div></div>`;
}

// ── VariableCard table builder ──
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

// ── HTML escape ──
function escHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// ── Carousel drag-to-scroll ──
function initDrag(el) {
  const inner = el.firstElementChild;
  let dragging = false, startX = 0, scrollLeft = 0;
  el.addEventListener('mousedown', e => {
    dragging = true; startX = e.clientX;
    scrollLeft = parseInt(inner.style.transform.replace(/[^-\d]/g, '') || '0');
    el.style.cursor = 'grabbing';
  });
  window.addEventListener('mousemove', e => {
    if (!dragging) return;
    const dx = (e.clientX - startX) * 2; // scale factor for 0.5x slide
    const newX = Math.min(0, scrollLeft + dx);
    inner.style.transform = `translateX(${newX}px)`;
  });
  window.addEventListener('mouseup', () => {
    if (!dragging) return;
    dragging = false; el.style.cursor = 'grab';
  });
}

// ── Presentation mode ──
let _presActive = false, _presIndex = 0, _presSlides = [];

function initPresentation(slideSelector) {
  document.addEventListener('keydown', e => {
    if (!_presActive) {
      if (e.key === 'F5') { e.preventDefault(); startPresentation(slideSelector); }
      return;
    }
    switch (e.key) {
      case 'Escape': stopPresentation(); break;
      case 'ArrowRight': case 'ArrowDown': case ' ': case 'PageDown':
        e.preventDefault(); presNav(1); break;
      case 'ArrowLeft': case 'ArrowUp': case 'PageUp':
        e.preventDefault(); presNav(-1); break;
      case 'Home': e.preventDefault(); _presIndex = 0; presShow(); break;
      case 'End': e.preventDefault(); _presIndex = _presSlides.length - 1; presShow(); break;
    }
  });
  window.addEventListener('resize', () => { if (_presActive) presShow(); });
}

function startPresentation(slideSelector) {
  _presSlides = Array.from(document.querySelectorAll(slideSelector || '.slide'));
  if (!_presSlides.length) return;
  _presIndex = 0;

  let overlay = document.getElementById('pres-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'pres-overlay';
    overlay.className = 'pres-overlay';
    overlay.innerHTML = '<div class="pres-progress"></div><div class="pres-slide"></div><div class="pres-counter"></div>';
    document.body.appendChild(overlay);
    overlay.addEventListener('click', e => { if (e.button === 0) presNav(1); });
    overlay.addEventListener('contextmenu', e => { e.preventDefault(); presNav(-1); });
  }

  overlay.classList.add('active');
  _presActive = true;
  document.body.style.overflow = 'hidden';
  presShow();

  // Esc hint toast
  let toast = document.getElementById('pres-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'pres-toast';
    toast.className = 'pres-toast';
    toast.textContent = 'Press Esc to exit';
    overlay.appendChild(toast);
  }
  toast.classList.add('show');
  // Hold fully visible for 0.8s, then fade out over 1.5s
  setTimeout(() => toast.classList.remove('show'), 400);
}

function stopPresentation() {
  const overlay = document.getElementById('pres-overlay');
  if (overlay) overlay.classList.remove('active');
  _presActive = false;
  document.body.style.overflow = '';
}

function presNav(dir) {
  const next = _presIndex + dir;
  if (next < 0 || next >= _presSlides.length) return;
  _presIndex = next;
  presShow();
}

function presShow() {
  const overlay = document.getElementById('pres-overlay');
  const container = overlay.querySelector('.pres-slide');
  const counter = overlay.querySelector('.pres-counter');
  const progress = overlay.querySelector('.pres-progress');
  const source = _presSlides[_presIndex];
  const inner = source.querySelector('.slide-inner');
  if (!inner) return;

  const clone = inner.cloneNode(true);
  container.innerHTML = '';
  container.appendChild(clone);

  const vw = window.innerWidth, vh = window.innerHeight;
  const scale = Math.min(vw / 1920, vh / 1080);
  clone.style.transform = `scale(${scale})`;
  clone.style.transformOrigin = 'top left';
  container.style.width = 1920 * scale + 'px';
  container.style.height = 1080 * scale + 'px';

  counter.textContent = `${_presIndex + 1} / ${_presSlides.length}`;
  progress.style.width = ((_presIndex + 1) / _presSlides.length * 100) + '%';
}

// ── Grid overlay toggle ──
function toggleGrid(btn) {
  const on = btn.classList.toggle('active');
  document.querySelectorAll('.grid-overlay').forEach(el => {
    el.classList.toggle('visible', on);
  });
}

// ── Chip click delegation (auto-activate clicked chip in its group) ──
document.addEventListener('click', (e) => {
  const chip = e.target.closest('.chip');
  if (!chip) return;
  chip.parentElement.querySelectorAll('.chip').forEach(s => s.classList.remove('active'));
  chip.classList.add('active');
});

// ── Chip variant switcher ──
function switchChip(group, variant) {
  document.querySelectorAll(`[data-chip-group="${group}"] .chip`).forEach(c => c.classList.remove('active'));
  event.target.classList.add('active');
  document.querySelectorAll(`[data-variant="${group}"]`).forEach(el => {
    el.style.display = el.dataset.variantName === variant ? '' : 'none';
  });
}

// ══════════════════════════════════════════════════════════════
// Deck Settings — accordion with footer fields
// Call initDeckSettings() from presentation files
// ══════════════════════════════════════════════════════════════

function initDeckSettings() {
  // Derive file key from page URL path
  const _deckFile = location.pathname.replace(/^\//, '') || 'index.html';

  const setup = async () => {
    // Find insertion point — after .page-desc or .page-title, before first slide
    const anchor = document.querySelector('.page-desc') || document.querySelector('.page-title');
    if (!anchor) return;

    // Read current footer values from first footer in deck
    const firstFooter = document.querySelector('.footer');
    const curTitle = firstFooter?.querySelector('.footer-title')?.textContent || '';
    const curCopy = firstFooter?.querySelector('.footer-copy')?.textContent || '';

    // Load saved settings from server
    let saved = {};
    try {
      const resp = await fetch('/deck-settings?file=' + encodeURIComponent(_deckFile));
      if (resp.ok) { const t = await resp.text(); if (t && t[0] === '{') saved = JSON.parse(t); }
    } catch {}

    const el = document.createElement('div');
    el.className = 'deck-settings';
    el.innerHTML = `
      <button type="button" class="deck-settings-toggle">
        <span class="deck-settings-arrow">&#x25B6;</span> Deck Settings
      </button>
      <div class="deck-settings-body">
        <div class="deck-settings-form">
          <div class="deck-settings-field grow">
            <label>Footer title</label>
            <input type="text" id="deckFooterTitle" placeholder="Company Name" value="${escHtml(saved.title ?? curTitle)}">
          </div>
          <div class="deck-settings-field grow">
            <label>Copyright</label>
            <input type="text" id="deckFooterCopy" placeholder="&copy; 2026 &middot; Confidential" value="${escHtml(saved.copy ?? curCopy)}">
          </div>
          <div class="deck-settings-field">
            <label>Start page</label>
            <input type="number" id="deckFooterStart" placeholder="1" value="${saved.start ?? 1}" style="width:60px;">
          </div>
        </div>
      </div>`;
    anchor.after(el);

    // Toggle accordion
    el.querySelector('.deck-settings-toggle').addEventListener('click', () => {
      el.classList.toggle('open');
    });

    // Live update footers on input
    const titleInput = document.getElementById('deckFooterTitle');
    const copyInput = document.getElementById('deckFooterCopy');
    const startInput = document.getElementById('deckFooterStart');

    function updateFooters() {
      const title = titleInput.value;
      const copy = copyInput.value;
      const start = parseInt(startInput.value) || 1;
      document.querySelectorAll('.slide-inner').forEach((inner, i) => {
        const footer = inner.querySelector('.footer');
        if (!footer) return;
        const ft = footer.querySelector('.footer-title');
        const fc = footer.querySelector('.footer-copy');
        const fp = footer.querySelector('.footer-page');
        if (ft) ft.textContent = title;
        if (fc) fc.innerHTML = copy;
        if (fp) fp.textContent = start + i;
      });
    }

    // Apply saved settings on load
    if (saved.title || saved.copy || saved.start) updateFooters();

    // Debounced save to server
    let _saveTimer = null;
    function saveSettings() {
      clearTimeout(_saveTimer);
      _saveTimer = setTimeout(() => {
        fetch('/deck-settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            file: _deckFile,
            title: titleInput.value,
            copy: copyInput.value,
            start: parseInt(startInput.value) || 1,
          }),
        }).catch(() => {});
      }, 500);
    }

    titleInput.addEventListener('input', () => { updateFooters(); saveSettings(); });
    copyInput.addEventListener('input', () => { updateFooters(); saveSettings(); });
    startInput.addEventListener('input', () => { updateFooters(); saveSettings(); });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setup, { once: true });
  } else {
    setup();
  }
}

// ══════════════════════════════════════════════════════════════
// Unified Annotation System (FAB + panel)
// Works for both presentation pages and storybook pages
// Call initAnnotations('storage-key', opts) from each page
// ══════════════════════════════════════════════════════════════
let _annKey = '';
let _annActive = false;
let _annMulti = [];
let _annOpts = {};

function initAnnotations(storageKey, opts) {
  _annKey = storageKey;
  _annOpts = Object.assign({
    containerSelector: '.slide',   // what to position pins relative to
    groupBy: 'index',              // 'index' (slide number) or 'id' (element id)
    syncToServer: false,
  }, opts);

  const ready = () => {
    _annCreateDOM();
    _annBindEvents();
    _annUpdateBadge();
    _annRenderAll();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ready, { once: true });
  } else {
    ready();
  }
}

function _annLoad() {
  try { return JSON.parse(localStorage.getItem(_annKey) || '{}'); } catch { return {}; }
}

function _annSave(data) {
  localStorage.setItem(_annKey, JSON.stringify(data));
  _annUpdateBadge();
  if (typeof _navUpdatePins === 'function') _navUpdatePins();
  if (_annOpts.syncToServer) {
    // Enrich with human-readable labels for the JSON file
    const out = {};
    for (const [key, pins] of Object.entries(data)) {
      const label = _annGetGroupLabel(key);
      out[key] = {
        story: label,
        pins: pins.map((pin, i) => ({
          id: i + 1,
          element: pin.selector,
          text: pin.elText || '',
          note: pin.note || '',
        })),
      };
    }
    fetch('/annotations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(out, null, 2),
    }).catch(() => {});
  }
}

// Alias for nav system compatibility
function _pinLoad() { return _annLoad(); }
let _pinStorageKey = ''; // kept for nav compat
Object.defineProperty(window, '_pinStorageKey', { get() { return _annKey; } });

function _annCreateDOM() {
  // Only create if not already in HTML (storybook pages have it pre-rendered)
  if (!document.getElementById('annFab')) {
    const fab = document.createElement('div');
    fab.className = 'ann-fab'; fab.id = 'annFab'; fab.title = 'Toggle annotation mode';
    fab.innerHTML = '<span id="annFabIcon">\u{1F4CC}</span><span class="badge" id="annBadge"></span>';
    document.body.appendChild(fab);
  }
  if (!document.getElementById('annCopyFab')) {
    const copyFab = document.createElement('button');
    copyFab.className = 'ann-copy-fab'; copyFab.id = 'annCopyFab';
    copyFab.title = 'Copy notes to clipboard';
    document.body.appendChild(copyFab);
  }
  if (!document.getElementById('annClearFab')) {
    const clearFab = document.createElement('button');
    clearFab.className = 'ann-clear-fab'; clearFab.id = 'annClearFab';
    clearFab.title = 'Clear all annotations';
    clearFab.textContent = 'Clear pins';
    document.body.appendChild(clearFab);
  }
  if (!document.getElementById('annPanel')) {
    const panel = document.createElement('div');
    panel.className = 'ann-panel'; panel.id = 'annPanel';
    panel.innerHTML = `
      <div class="ann-panel-header">
        <div class="ann-panel-title" id="annPanelTitle">Notes</div>
        <div class="ann-panel-actions">
          <button type="button" id="copyNotesButton" title="Copy notes to clipboard">\u{1F4CB}</button>
          <button type="button" id="clearNotesButton" title="Clear all">\u{1F5D1}</button>
        </div>
      </div>
      <div class="ann-panel-list" id="annList">
        <div class="ann-panel-empty">Click elements to annotate</div>
      </div>
      <div class="ann-multi" id="annMulti">
        <span class="ann-multi-count" id="annMultiCount">0</span>
        <input type="text" id="annMultiInput" placeholder="Note for all selected...">
        <button type="button" class="ann-multi-add" id="annMultiAdd">Add</button>
        <button type="button" class="ann-multi-cancel" id="annMultiCancel">&times;</button>
      </div>`;
    document.body.appendChild(panel);
  }
  // Drag rect
  if (!document.querySelector('.ann-drag-rect')) {
    const dragRect = document.createElement('div');
    dragRect.className = 'ann-drag-rect';
    document.body.appendChild(dragRect);
  }

  // Wrap slides in slide-wrapper for pin positioning (presentations only)
  if (_annOpts.groupBy === 'index') {
    const labels = document.querySelectorAll('.slide-label');
    labels.forEach((label, i) => {
      const slideEl = label.nextElementSibling;
      if (!slideEl || !slideEl.classList.contains('slide')) return;
      const wrapper = document.createElement('div');
      wrapper.className = 'slide-wrapper';
      wrapper.dataset.slide = i + 1;
      wrapper.style.position = 'relative';
      label.parentNode.insertBefore(wrapper, label);
      wrapper.appendChild(label);
      wrapper.appendChild(slideEl);
    });
  }
}

function _annGetGroupKey(containerEl) {
  if (_annOpts.groupBy === 'id') return containerEl.id;
  // For presentations: find slide index
  const wrapper = containerEl.closest('.slide-wrapper');
  if (wrapper) return wrapper.dataset.slide;
  const slides = [...document.querySelectorAll('.slide')];
  const slide = containerEl.classList.contains('slide') ? containerEl : containerEl.querySelector('.slide');
  const idx = slides.indexOf(slide);
  return idx >= 0 ? String(idx + 1) : null;
}

function _annGetGroupLabel(key) {
  if (_annOpts.groupBy === 'id') {
    const el = document.getElementById(key);
    return el?.querySelector('.story-title')?.textContent || key;
  }
  const label = document.querySelectorAll('.slide-label')[parseInt(key) - 1];
  if (!label) return `#${key}`;
  const text = label.textContent || '';
  const match = text.match(/—\s*(.+)/);
  return match ? `Slide ${key} — ${match[1].trim()}` : `Slide ${key}`;
}

function _annGetContainer(target) {
  if (_annOpts.groupBy === 'id') return target.closest('.story');
  return target.closest('.slide-wrapper') || target.closest('.slide');
}

function _annGetPositionParent(target) {
  if (_annOpts.groupBy === 'id') return target.closest('.story');
  return target.closest('.slide-wrapper');
}

function _annToggle() {
  _annActive = !_annActive;
  document.body.classList.toggle('annotating', _annActive);
  document.getElementById('annFab').classList.toggle('active', _annActive);
  document.getElementById('annPanel').classList.toggle('open', _annActive);
  if (_annActive) _annRenderAll();
  if (!_annActive) _annClearMulti();
  const copyFab = document.getElementById('annCopyFab');
  const clearFab = document.getElementById('annClearFab');
  if (_annActive) {
    if (copyFab) copyFab.classList.remove('visible');
    if (clearFab) clearFab.classList.remove('visible');
  } else {
    _annUpdateBadge();
  }
}

function _annUpdateBadge() {
  const data = _annLoad();
  let total = 0;
  for (const k in data) total += data[k].length;
  const badge = document.getElementById('annBadge');
  const title = document.getElementById('annPanelTitle');
  const copyFab = document.getElementById('annCopyFab');
  const clearFab = document.getElementById('annClearFab');
  if (total > 0) {
    if (badge) { badge.textContent = total; badge.classList.add('visible'); }
    if (title) title.textContent = `Notes (${total})`;
    if (copyFab && !_annActive) {
      copyFab.textContent = 'Copy pins';
      copyFab.classList.add('visible');
    }
    if (clearFab && !_annActive) clearFab.classList.add('visible');
  } else {
    if (badge) badge.classList.remove('visible');
    if (title) title.textContent = 'Notes';
    if (copyFab) copyFab.classList.remove('visible');
    if (clearFab) clearFab.classList.remove('visible');
  }
  // Update toolbar pin count if present
  const pc = document.getElementById('pinCount');
  if (pc) pc.textContent = total > 0 ? `${total} pins` : '';
}

function _annUpdateMulti() {
  const bar = document.getElementById('annMulti');
  const count = document.getElementById('annMultiCount');
  if (_annMulti.length > 0) {
    bar.classList.add('visible');
    count.textContent = `${_annMulti.length} selected`;
    document.getElementById('annMultiInput').focus();
  } else {
    bar.classList.remove('visible');
  }
}

function _annClearMulti() {
  _annMulti.forEach(s => s.el.classList.remove('ann-selected'));
  _annMulti = [];
  _annUpdateMulti();
}

function _annCommitMulti() {
  const input = document.getElementById('annMultiInput');
  const note = input.value.trim();
  if (!_annMulti.length) return;
  const data = _annLoad();

  if (_annMulti.length === 1) {
    // Single selection — save as flat pin
    const sel = _annMulti[0];
    if (!data[sel.groupKey]) data[sel.groupKey] = [];
    data[sel.groupKey].push({
      x: sel.x, y: sel.y, note,
      selector: sel.elInfo.selector, elText: sel.elInfo.text,
      classes: sel.elInfo.classes, name: sel.elInfo.name || '',
      styles: sel.elInfo.styles || '', nearby: sel.elInfo.nearby || '',
    });
  } else {
    // Multi-selection — group into one pin with children
    // Use first element's position for the marker
    const first = _annMulti[0];
    if (!data[first.groupKey]) data[first.groupKey] = [];
    data[first.groupKey].push({
      x: first.x, y: first.y, note,
      name: `${_annMulti.length} elements`,
      children: _annMulti.map(sel => ({
        selector: sel.elInfo.selector, elText: sel.elInfo.text,
        classes: sel.elInfo.classes, name: sel.elInfo.name || '',
        styles: sel.elInfo.styles || '', nearby: sel.elInfo.nearby || '',
      })),
    });
  }

  _annSave(data);
  _annClearMulti();
  input.value = '';
  _annRenderAll();
}

function _annIdentify(target, container) {
  const inner = container.querySelector('.slide-inner') || container;
  if (target.classList.contains('ann-pin')) return { selector: '', name: '', text: '', classes: '' };
  const rawText = (target.textContent || '').trim();
  const text = rawText.length > 60 ? rawText.slice(0, 57) + '...' : rawText;

  const parts = [];
  let cur = target;
  const skipCls = new Set(['slide-inner', 'bg-brand', 'bg-warning', 'bg-layer', 'bg-warning-subtle',
    'story', 'story-header', 'story-desc', 'variants', 'variant', 'row']);
  while (cur && cur !== inner && cur !== container) {
    let seg = cur.tagName ? cur.tagName.toLowerCase() : '';
    const classes = [...(cur.classList || [])].filter(c => !skipCls.has(c) && !c.startsWith('ann-'));
    if (classes.length) seg = '.' + classes.join('.');
    else if (cur.tagName === 'DIV' && cur.style.cssText) seg = 'div[style]';
    parts.unshift(seg);
    cur = cur.parentElement;
  }
  const selector = parts.join(' > ');
  const classes = [...(target.classList || [])].filter(c => !c.startsWith('ann-')).join(' ');
  const name = _annElementName(target, container);

  const s = window.getComputedStyle(target);
  const styleParts = [];
  const bg = s.backgroundColor;
  if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') styleParts.push('bg:' + bg);
  if (s.color && s.color !== 'rgb(0, 0, 0)') styleParts.push('color:' + s.color);
  if (s.fontSize) styleParts.push('font:' + s.fontSize);
  if (s.fontWeight && s.fontWeight !== '400' && s.fontWeight !== 'normal') styleParts.push('weight:' + s.fontWeight);
  const styles = styleParts.join(', ');

  const parent = target.parentElement;
  let nearby = '';
  if (parent) {
    const siblings = [...parent.children].filter(s => s !== target && s.tagName && !s.classList.contains('ann-pin'));
    if (siblings.length) {
      const names = siblings.slice(0, 3).map(s => {
        const t = (s.textContent || '').trim();
        return (t.length > 20 ? t.slice(0, 17) + '...' : t) || s.tagName.toLowerCase();
      });
      nearby = names.map(n => `"${n}"`).join(', ') + (siblings.length > 3 ? ` (+${siblings.length - 3} more)` : '');
    }
  }

  return { selector, name, text, classes, styles, nearby };
}

function _annElementName(el, container) {
  const allCls = [...(el.classList || [])].filter(c => !c.startsWith('ann-'));
  const tag = el.tagName.toLowerCase();

  const typoMap = { 'h1': 'Display', 'h2': 'Large Title', 'h3': 'Section Title',
    'h4': 'Subtitle', 'h5': 'Label', 'h6': 'Small Label',
    'p1': 'Body', 'p2': 'Body Small', 'p3': 'Caption', 'p5': 'Micro' };
  for (const c of allCls) { if (typoMap[c]) return _annWithContext(el, container, typoMap[c]); }

  const dsMap = {
    'stat-cell': 'Stat Cell', 'var-card': 'Variable Card', 'var-table': 'Variable Table',
    'feature-card-noimg': 'Feature Card', 'feature-card': 'Feature Card',
    'proof-panel': 'Proof Panel', 'proof-grid': 'Proof Grid', 'proof-stat': 'Proof Stat',
    'compare-block': 'Compare Block', 'footer': 'Footer', 'content-frame': 'Content Frame',
    'tl-stats': 'Header Zone', 'tl-stats-title': 'Header Title', 'tl-stats-top': 'Header',
    'carousel-track': 'Carousel', 'carousel-card': 'Carousel Card',
    'logo-line-item': 'Partner Row', 'logo-line-item-body': 'Partner Info',
    'data-table': 'Data Table', 'list': 'Bullet List', 'slot-tables-row': 'Side-by-Side' };
  for (const c of allCls) { if (dsMap[c]) return dsMap[c]; }

  if (/^h[1-6]$/.test(tag)) return tag.toUpperCase() + ' Heading';
  if (tag === 'img') return 'Image';
  if (tag === 'span' || tag === 'p' || tag === 'label') return 'Text';

  const skip = new Set(['c-primary', 'c-secondary', 'c-tertiary', 'c-yellow', 'c-disabled', 'c-accent']);
  const meaningful = allCls.filter(c => c.length > 2 && !skip.has(c));
  if (tag === 'div' && meaningful.length) {
    const words = meaningful[0].split(/[-_]/).filter(w => w.length > 2).slice(0, 2);
    if (words.length) return words.map(w => w[0].toUpperCase() + w.slice(1)).join(' ');
  }
  return tag === 'div' ? 'Container' : tag;
}

function _annWithContext(el, container, name) {
  const dsComponents = new Set(['stat-cell', 'var-card', 'var-table', 'feature-card-noimg',
    'feature-card', 'proof-panel', 'proof-grid', 'proof-stat', 'compare-block',
    'tl-stats', 'carousel-card', 'logo-line-item', 'data-table', 'slot-tables-row']);
  const nameMap = { 'stat-cell': 'Stat', 'var-card': 'Card', 'var-table': 'Table',
    'feature-card-noimg': 'Feature', 'feature-card': 'Feature', 'proof-panel': 'Proof',
    'proof-grid': 'Proof Grid', 'proof-stat': 'Proof Stat', 'compare-block': 'Compare',
    'tl-stats': 'Header', 'carousel-card': 'Carousel', 'logo-line-item': 'Partner',
    'data-table': 'Table', 'slot-tables-row': 'Side-by-Side' };
  let cur = el.parentElement;
  while (cur && cur !== container) {
    const match = [...(cur.classList || [])].find(c => dsComponents.has(c));
    if (match) return (nameMap[match] || match) + ' \u2192 ' + name;
    cur = cur.parentElement;
  }
  return name;
}

function _annRenderAll() {
  document.querySelectorAll('.ann-pin').forEach(p => p.remove());
  const data = _annLoad();
  const list = document.getElementById('annList');
  if (!list) return;
  list.innerHTML = '';
  let globalIndex = 0, hasNotes = false;

  const sortedKeys = Object.keys(data).sort((a, b) => {
    const na = parseInt(a), nb = parseInt(b);
    if (!isNaN(na) && !isNaN(nb)) return na - nb;
    return a.localeCompare(b);
  });

  for (const groupKey of sortedKeys) {
    const pins = data[groupKey];
    if (!pins || !pins.length) continue;
    hasNotes = true;

    // Find the container to place pin markers
    let posParent;
    if (_annOpts.groupBy === 'id') {
      posParent = document.getElementById(groupKey);
    } else {
      posParent = document.querySelector(`[data-slide="${groupKey}"]`);
    }
    if (posParent) posParent.style.position = 'relative';

    const groupLabel = _annGetGroupLabel(groupKey);

    pins.forEach((pin, index) => {
      globalIndex++;
      // Pin marker on slide
      if (posParent) {
        const marker = document.createElement('div');
        marker.className = 'ann-pin';
        marker.textContent = globalIndex;
        marker.style.left = pin.x + '%';
        marker.style.top = pin.y + '%';
        marker.title = (pin.name || pin.selector || '') + (pin.note ? '\n' + pin.note : '');
        posParent.appendChild(marker);
      }

      // Note in panel
      const note = document.createElement('div');
      note.className = 'ann-note';

      const num = document.createElement('div');
      num.className = 'ann-note-num';
      num.textContent = globalIndex;

      const body = document.createElement('div');
      body.className = 'ann-note-body';

      const story = document.createElement('div');
      story.className = 'ann-note-story';
      story.textContent = groupLabel;
      body.appendChild(story);

      const elLabel = pin.name || pin.classes || pin.selector?.split(' > ').pop() || 'element';
      const element = document.createElement('span');
      element.className = 'ann-note-el';
      element.textContent = elLabel;
      body.appendChild(element);

      // Render children list for grouped multi-select pins
      if (pin.children && pin.children.length) {
        const childList = document.createElement('div');
        childList.className = 'ann-note-children';
        pin.children.forEach(child => {
          const childEl = document.createElement('div');
          childEl.className = 'ann-note-child';
          const childName = child.name || child.classes || child.selector?.split(' > ').pop() || 'element';
          const childText = child.elText ? `: "${child.elText}"` : '';
          childEl.textContent = childName + childText;
          childList.appendChild(childEl);
        });
        body.appendChild(childList);
      } else if (pin.nearby) {
        const nearbyEl = document.createElement('span');
        nearbyEl.className = 'ann-note-nearby';
        nearbyEl.textContent = 'nearby: ' + pin.nearby;
        body.appendChild(nearbyEl);
      }

      const input = document.createElement('input');
      input.type = 'text';
      input.value = pin.note || pin.text || '';
      input.placeholder = 'What to change...';
      input.addEventListener('input', () => {
        const d = _annLoad();
        if (d[groupKey] && d[groupKey][index]) {
          d[groupKey][index].note = input.value;
          _annSave(d);
        }
      });
      body.appendChild(input);

      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'ann-note-delete';
      remove.textContent = '\u00d7';
      remove.addEventListener('click', () => {
        const d = _annLoad();
        if (d[groupKey]) {
          d[groupKey].splice(index, 1);
          if (d[groupKey].length === 0) delete d[groupKey];
          _annSave(d);
          _annRenderAll();
        }
      });

      note.appendChild(num);
      note.appendChild(body);
      note.appendChild(remove);
      list.appendChild(note);
    });
  }

  if (!hasNotes) {
    list.innerHTML = '<div class="ann-panel-empty">Click elements to annotate</div>';
  }
  _annUpdateBadge();
}

function _annCopyAll() {
  const data = _annLoad();
  let text = '';
  const sortedKeys = Object.keys(data).sort((a, b) => {
    const na = parseInt(a), nb = parseInt(b);
    if (!isNaN(na) && !isNaN(nb)) return na - nb;
    return a.localeCompare(b);
  });
  for (const key of sortedKeys) {
    const pins = data[key];
    if (!pins || !pins.length) continue;
    text += `## ${_annGetGroupLabel(key)}\n`;
    pins.forEach((pin, i) => {
      const label = pin.name || pin.classes || pin.selector?.split(' > ').pop() || 'element';
      const content = pin.elText && !label.includes((pin.elText || '').slice(0, 15)) ? ` "${pin.elText}"` : '';
      let line = `  ${i + 1}. [${label}]${content}`;
      if (pin.note) line += ` -- ${pin.note}`;
      line += '\n';
      if (pin.children && pin.children.length) {
        pin.children.forEach(child => {
          const cName = child.name || child.classes || child.selector?.split(' > ').pop() || 'element';
          const cText = child.elText ? ` "${child.elText}"` : '';
          line += `     - ${cName}${cText}\n`;
          if (child.styles) line += `       css: ${child.styles}\n`;
        });
      } else {
        if (pin.styles) line += `     css: ${pin.styles}\n`;
        if (pin.nearby) line += `     nearby: ${pin.nearby}\n`;
      }
      text += line;
    });
    text += '\n';
  }
  navigator.clipboard.writeText(text.trim() || '(No annotations yet)').then(() => {
    const title = document.getElementById('annPanelTitle');
    if (title) { const prev = title.textContent; title.textContent = 'Copied!'; setTimeout(() => title.textContent = prev, 1500); }
  });
}

function _annClearAll() {
  if (!confirm('Clear all annotations?')) return;
  localStorage.removeItem(_annKey);
  _annRenderAll();
  if (typeof _navUpdatePins === 'function') _navUpdatePins();
}

function _annBindEvents() {
  document.getElementById('annFab').addEventListener('click', _annToggle);
  document.getElementById('annCopyFab')?.addEventListener('click', () => {
    _annCopyAll();
    const btn = document.getElementById('annCopyFab');
    if (btn) { btn.textContent = 'Copied!'; setTimeout(() => btn.textContent = 'Copy pins', 1500); }
  });
  document.getElementById('annClearFab')?.addEventListener('click', _annClearAll);
  document.getElementById('copyNotesButton')?.addEventListener('click', _annCopyAll);
  document.getElementById('clearNotesButton')?.addEventListener('click', _annClearAll);
  document.getElementById('annMultiAdd')?.addEventListener('click', _annCommitMulti);
  document.getElementById('annMultiCancel')?.addEventListener('click', _annClearMulti);
  document.getElementById('annMultiInput')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') _annCommitMulti();
  });

  let justFinishedDrag = false;

  // Click to annotate
  document.addEventListener('click', (event) => {
    if (!_annActive) return;
    if (justFinishedDrag) { justFinishedDrag = false; return; }
    if (event.target.closest('.sidebar') || event.target.closest('.ann-fab') ||
        event.target.closest('.ann-panel') || event.target.closest('.toolbar') ||
        event.target.closest('.slide-nav')) return;

    const slideEl = event.target.closest('.slide');
    if (!slideEl) { _annToggle(); return; }

    const container = _annGetContainer(event.target);
    if (!container) return;
    event.preventDefault();
    event.stopPropagation();

    const target = event.target;
    if (target.classList.contains('ann-pin')) return;
    target.classList.remove('ann-hover');

    // Toggle selection
    const existing = _annMulti.findIndex(s => s.el === target);
    if (existing >= 0) {
      target.classList.remove('ann-selected');
      _annMulti.splice(existing, 1);
      _annUpdateMulti();
      return;
    }

    const elInfo = _annIdentify(target, container);
    if (!elInfo.selector) return;
    const posParent = _annGetPositionParent(target) || container;
    const rect = posParent.getBoundingClientRect();
    const x = +(((event.clientX - rect.left) / rect.width) * 100).toFixed(1);
    const y = +(((event.clientY - rect.top) / rect.height) * 100).toFixed(1);
    const groupKey = _annGetGroupKey(container);

    target.classList.add('ann-selected');
    _annMulti.push({ el: target, groupKey, elInfo, x, y });
    _annUpdateMulti();
  }, true);

  // Hover highlight
  document.addEventListener('mouseover', (event) => {
    if (!_annActive) return;
    if (!event.target.closest('.slide')) return;
    if (event.target.classList.contains('ann-pin')) return;
    if (event.target.closest('.sidebar') || event.target.closest('.ann-panel') || event.target.closest('.slide-nav')) return;
    event.target.classList.add('ann-hover');
  });
  document.addEventListener('mouseout', (event) => {
    if (event.target.classList) event.target.classList.remove('ann-hover');
  });

  // Drag selection
  let dragStart = null, dragActive = false;
  const dragRect = document.querySelector('.ann-drag-rect');

  document.addEventListener('mousedown', (e) => {
    if (!_annActive || e.button !== 0) return;
    if (e.target.closest('.sidebar') || e.target.closest('.ann-fab') ||
        e.target.closest('.ann-panel') || e.target.closest('.toolbar') ||
        e.target.closest('.slide-nav')) return;
    if (!e.target.closest('.slide')) return;
    const container = _annGetContainer(e.target);
    if (!container) return;
    dragStart = { x: e.clientX, y: e.clientY, container };
    dragActive = false;
  });

  document.addEventListener('mousemove', (e) => {
    if (!dragStart) return;
    const dx = e.clientX - dragStart.x, dy = e.clientY - dragStart.y;
    if (!dragActive && (dx * dx + dy * dy) < 64) return;
    dragActive = true;
    const left = Math.min(dragStart.x, e.clientX), top = Math.min(dragStart.y, e.clientY);
    dragRect.style.display = 'block';
    dragRect.style.left = left + 'px';
    dragRect.style.top = top + 'px';
    dragRect.style.width = Math.abs(dx) + 'px';
    dragRect.style.height = Math.abs(dy) + 'px';
    _annDragHighlight(dragStart.container, left, top, left + Math.abs(dx), top + Math.abs(dy));
  });

  document.addEventListener('mouseup', (e) => {
    if (!dragStart) return;
    const wasDrag = dragActive;
    const container = dragStart.container;
    dragStart = null; dragActive = false;
    dragRect.style.display = 'none';
    if (!wasDrag) return;
    justFinishedDrag = true;

    const highlighted = container.querySelectorAll('.ann-drag-highlight');
    const posParent = _annGetPositionParent(highlighted[0]) || container;
    highlighted.forEach(el => {
      el.classList.remove('ann-drag-highlight');
      if (_annMulti.findIndex(m => m.el === el) >= 0) return;
      const elInfo = _annIdentify(el, container);
      if (!elInfo.selector) return;
      const rect = posParent.getBoundingClientRect();
      const er = el.getBoundingClientRect();
      const cx = er.left + er.width / 2, cy = er.top + er.height / 2;
      const x = +(((cx - rect.left) / rect.width) * 100).toFixed(1);
      const y = +(((cy - rect.top) / rect.height) * 100).toFixed(1);
      el.classList.add('ann-selected');
      _annMulti.push({ el, groupKey: _annGetGroupKey(container), elInfo, x, y });
    });
    _annUpdateMulti();
  });

  // Escape
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (_annMulti.length > 0) { _annClearMulti(); return; }
    if (_annActive) _annToggle();
  });

  // Re-render on storybook story change
  document.addEventListener('storybook:story-rendered', () => {
    if (_annActive) _annRenderAll();
  });
}

function _annDragHighlight(container, left, top, right, bottom) {
  container.querySelectorAll('.ann-drag-highlight').forEach(el => el.classList.remove('ann-drag-highlight'));
  const inners = container.querySelectorAll('.slide-inner');
  if (!inners.length) return;
  const selectors = '.h1,.h2,.h3,.h4,.h5,.h6,.p1,.p2,.p3,.stat-cell,.var-card,.feature-card-noimg,.feature-card,.proof-panel,.proof-stat,.compare-block,.logo-line-item,.carousel-card,img,.data-table td,.data-table th';
  const skip = new Set(['ann-pin', 'grid-overlay', 'footer', 'ann-drag-rect']);
  inners.forEach(inner => {
    for (const el of inner.querySelectorAll(selectors)) {
      if ([...el.classList].some(c => skip.has(c))) continue;
      const r = el.getBoundingClientRect();
      if (r.width < 3 || r.height < 3) continue;
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      if (cx >= left && cx <= right && cy >= top && cy <= bottom) el.classList.add('ann-drag-highlight');
    }
  });
}

// Legacy aliases for backward compatibility
function copyNotes() { _annCopyAll(); }
function clearAllNotes() { _annClearAll(); }

// ══════════════════════════════════════════════════════════════
// Slide Navigator — left panel with thumbnails
// Call initSlideNav() from presentation files
// ══════════════════════════════════════════════════════════════
let _navEl = null;
let _navItems = [];

function initSlideNav() {
  document.addEventListener('DOMContentLoaded', () => {
    _buildSlideNav();
    _navTrackScroll();
    _navUpdatePins();
  });
}

function _buildSlideNav() {
  // Create nav panel
  const nav = document.createElement('div');
  nav.className = 'slide-nav';
  nav.innerHTML = `
    <div class="slide-nav-header">
      <span class="slide-nav-title">Slides</span>
      <button class="slide-nav-btn" id="navGridBtn" title="Toggle grid overlay">Grid</button>
      <button class="slide-nav-btn" id="navPlayBtn" title="Present (F5)">&#x25B6;</button>
    </div>
    <div class="slide-nav-list" id="navList"></div>
  `;
  document.body.prepend(nav);
  _navEl = nav;

  // Grid button — inject overlays on first use, then toggle
  document.getElementById('navGridBtn').onclick = function () {
    const on = this.classList.toggle('active');
    // Create grid overlays if they don't exist yet
    document.querySelectorAll('.slide-inner').forEach(inner => {
      if (!inner.querySelector('.grid-overlay')) {
        const overlay = document.createElement('div');
        overlay.className = 'grid-overlay';
        const cols = document.createElement('div');
        cols.className = 'grid-cols';
        for (let c = 0; c < 12; c++) { const col = document.createElement('div'); col.className = 'grid-col'; cols.appendChild(col); }
        overlay.appendChild(cols);
        const rows = document.createElement('div');
        rows.className = 'grid-rows';
        for (let r = 0; r < 12; r++) { const row = document.createElement('div'); row.className = 'grid-row'; rows.appendChild(row); }
        overlay.appendChild(rows);
        inner.appendChild(overlay);
      }
    });
    document.querySelectorAll('.grid-overlay').forEach(el => el.classList.toggle('visible', on));
  };

  // Play button
  document.getElementById('navPlayBtn').onclick = () => startPresentation('.slide');

  // Build thumbnail list
  const list = document.getElementById('navList');
  const slides = document.querySelectorAll('.slide');
  const labels = document.querySelectorAll('.slide-label');
  const dividers = document.querySelectorAll('.section-divider');

  // Map divider positions (which slide index they precede)
  const dividerMap = new Map();
  dividers.forEach(d => {
    // Find the next slide after this divider (may be wrapped in .slide-wrapper)
    let el = d.nextElementSibling;
    while (el) {
      if (el.classList.contains('slide')) { break; }
      if (el.classList.contains('slide-wrapper')) { break; }
      if (el.classList.contains('slide-label')) { break; }
      const inner = el.querySelector('.slide');
      if (inner) { el = inner; break; }
      el = el.nextElementSibling;
    }
    if (!el) return;
    // Resolve to the actual .slide element
    const slideEl = el.classList.contains('slide') ? el
      : el.querySelector('.slide') || el;
    const idx = [...slides].indexOf(slideEl);
    if (idx >= 0) dividerMap.set(idx, d.textContent.trim());
  });

  _navItems = [];
  slides.forEach((slide, i) => {
    // Insert section divider label if applicable
    if (dividerMap.has(i)) {
      const sec = document.createElement('div');
      sec.className = 'slide-nav-section';
      sec.textContent = dividerMap.get(i);
      list.appendChild(sec);
    }

    const item = document.createElement('div');
    item.className = 'slide-nav-item';
    item.dataset.index = i;

    const thumb = document.createElement('div');
    thumb.className = 'slide-nav-thumb';

    // Clone the slide-inner for thumbnail
    const inner = slide.querySelector('.slide-inner');
    if (inner) {
      const clone = inner.cloneNode(true);
      // Remove pins and drag rects from clone
      clone.querySelectorAll('.pin, .drag-select-rect, .grid-overlay').forEach(el => el.remove());
      thumb.appendChild(clone);
    }

    // Extract slide title from label (e.g. "#1 — StartSlide" → "StartSlide")
    const labelEl = labels[i];
    const labelText = labelEl ? labelEl.textContent : '';
    const titleMatch = labelText.match(/—\s*(.+)/);
    const slideTitle = titleMatch ? titleMatch[1].trim() : '';

    const caption = document.createElement('div');
    caption.className = 'slide-nav-caption';
    caption.textContent = slideTitle || `Slide ${i + 1}`;

    const num = document.createElement('div');
    num.className = 'slide-nav-num';
    num.textContent = i + 1;

    const pin = document.createElement('div');
    pin.className = 'slide-nav-pin';
    pin.id = 'navpin-' + (i + 1);

    item.appendChild(thumb);
    item.appendChild(caption);
    item.appendChild(num);
    item.appendChild(pin);

    item.onclick = () => {
      // Find the actual slide wrapper or slide element to scroll to
      const wrapper = slide.closest('.slide-wrapper') || slide;
      wrapper.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    list.appendChild(item);
    _navItems.push({ el: item, slide });
  });

  document.body.classList.add('has-slide-nav');
}

function _navTrackScroll() {
  if (!_navItems.length) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const item = _navItems.find(n => n.slide === entry.target);
      if (item) item.el.classList.toggle('active', entry.isIntersecting);
    });
    // Scroll the active nav item into view in the list
    const active = _navItems.find(n => n.el.classList.contains('active'));
    if (active) {
      const list = document.getElementById('navList');
      const itemTop = active.el.offsetTop - list.offsetTop;
      const itemBottom = itemTop + active.el.offsetHeight;
      const scrollTop = list.scrollTop;
      const listHeight = list.clientHeight;
      if (itemTop < scrollTop) list.scrollTop = itemTop - 8;
      else if (itemBottom > scrollTop + listHeight) list.scrollTop = itemBottom - listHeight + 8;
    }
  }, { threshold: 0.3 });

  _navItems.forEach(n => observer.observe(n.slide));
}

function _navUpdatePins() {
  if (!_navItems.length || !_pinStorageKey) return;
  const data = _pinLoad();
  _navItems.forEach((n, i) => {
    const slideNum = i + 1;
    const pins = data[slideNum] || [];
    const pinBadge = document.getElementById('navpin-' + slideNum);
    if (pinBadge) {
      if (pins.length > 0) {
        pinBadge.textContent = pins.length;
        n.el.classList.add('has-pins');
      } else {
        pinBadge.textContent = '';
        n.el.classList.remove('has-pins');
      }
    }
  });
}

// ══════════════════════════════════════════════════════════════
// Inline Editing — edit slide text in browser, save to disk
// Call initInlineEdit('path/to/file.html') for presentations
// Call initInlineEdit({ storybook: true, shell }) for storybook pages
// ══════════════════════════════════════════════════════════════
let _editActive = false;
let _editFile = '';
let _editStorybook = false;
let _editShell = null;
let _editDirty = new Set(); // slide indices (presentations) or elements (storybook)
let _editDirtyEls = new Map(); // element → { storyId, selector, text } for storybook

// Editable text selectors inside .slide-inner
const EDITABLE_SELECTORS = '.h1,.h2,.h3,.h4,.h5,.h6,.p1,.p2,.p3,.p5,.footer-title,.footer-copy,.footer-page,.var-card-title,.var-card-value,.var-table-title,.compare-chip,.logo-chip,.tl-vh-body,.section-item,.stat-cell .h5,.stat-cell .h1,.stat-cell .h2,.proof-stat .h5,.proof-stat .h3';

function initInlineEdit(opts) {
  if (typeof opts === 'string') {
    _editFile = opts;
  } else {
    _editStorybook = opts.storybook || false;
    _editShell = opts.shell || null;
  }

  const setup = () => {
    if (document.getElementById('editToggle')) return; // already initialized
    const toggle = document.createElement('button');
    toggle.className = 'edit-toggle';
    toggle.id = 'editToggle';
    toggle.title = 'Edit mode (E)';
    toggle.textContent = '\u270F\uFE0F';
    document.body.appendChild(toggle);

    const toast = document.createElement('div');
    toast.className = 'edit-save-toast';
    toast.id = 'editToast';
    document.body.appendChild(toast);

    toggle.addEventListener('click', () => _toggleEdit());

    document.addEventListener('keydown', (e) => {
      if ((e.key === 'e' || e.key === 'E') && !e.target.getAttribute('contenteditable') && !e.target.matches('input,textarea')) {
        e.preventDefault();
        _toggleEdit();
      }
      if (_editActive && (e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        _saveAllEdits();
      }
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setup, { once: true });
  } else {
    setup();
  }
}

function _toggleEdit() {
  _editActive = !_editActive;
  const toggle = document.getElementById('editToggle');
  toggle.classList.toggle('active', _editActive);

  const slides = document.querySelectorAll('.slide');
  slides.forEach(slide => {
    slide.classList.toggle('edit-mode', _editActive);
    const inner = slide.querySelector('.slide-inner');
    if (!inner) return;

    if (_editActive) {
      const editables = inner.querySelectorAll(EDITABLE_SELECTORS);
      editables.forEach(el => {
        if (el.querySelector(EDITABLE_SELECTORS)) return;
        el.setAttribute('contenteditable', 'true');
        el.dataset.editOriginal = el.textContent;
        el.addEventListener('input', _onEditInput);
        el.addEventListener('blur', _onEditBlur);
      });
    } else {
      inner.querySelectorAll('[contenteditable]').forEach(el => {
        el.removeAttribute('contenteditable');
        delete el.dataset.editOriginal;
        el.removeEventListener('input', _onEditInput);
        el.removeEventListener('blur', _onEditBlur);
      });
    }
  });

  if (!_editActive && (_editDirty.size > 0 || _editDirtyEls.size > 0)) {
    _saveAllEdits();
  }
}

function _onEditInput(e) {
  if (_editStorybook) {
    _trackStorybookEdit(e.target);
  } else {
    const slide = e.target.closest('.slide');
    if (!slide) return;
    const slides = [...document.querySelectorAll('.slide')];
    const idx = slides.indexOf(slide);
    if (idx >= 0) _editDirty.add(idx);
  }
}

function _onEditBlur() {
  setTimeout(() => {
    if (_editDirty.size > 0 || _editDirtyEls.size > 0) _saveAllEdits();
  }, 500);
}

function _trackStorybookEdit(el) {
  const inner = el.closest('[data-story-slide]');
  if (!inner) return;
  const storyId = inner.dataset.storySlide;
  const selector = _editSelector(el, inner);
  if (!selector) return;
  _editDirtyEls.set(el, { storyId, selector, text: el.textContent });
}

// Build a CSS selector path from el to its slide-inner container
function _editSelector(el, container) {
  const parts = [];
  let cur = el;
  while (cur && cur !== container) {
    let seg = '';
    const classes = [...cur.classList].filter(c => c !== 'edit-mode' && !c.startsWith('ann-'));
    if (classes.length) {
      seg = '.' + classes.join('.');
    } else {
      seg = cur.tagName.toLowerCase();
    }
    // Add nth-of-type if needed for uniqueness
    const parent = cur.parentElement;
    if (parent) {
      const siblings = [...parent.children].filter(s => {
        if (classes.length) return [...s.classList].join('.') === classes.join('.');
        return s.tagName === cur.tagName;
      });
      if (siblings.length > 1) {
        const idx = siblings.indexOf(cur) + 1;
        seg += `:nth-of-type(${idx})`;
      }
    }
    parts.unshift(seg);
    cur = cur.parentElement;
  }
  return parts.join(' > ') || null;
}

async function _saveAllEdits() {
  const toast = document.getElementById('editToast');

  // Storybook mode: save per-element overrides
  if (_editStorybook && _editDirtyEls.size > 0) {
    for (const [el, info] of _editDirtyEls) {
      if (el.textContent === el.dataset.editOriginal) continue;
      const state = _editShell ? _editShell.getState(info.storyId) : {};
      const key = _editShell ? _editShell.overrideKey(info.storyId, state) : info.storyId;
      try {
        const resp = await fetch('/edit-storybook', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key, selector: info.selector, text: info.text }),
        });
        const result = await resp.json();
        if (result.ok) {
          _showToast(toast, 'Saved');
        } else {
          _showToast(toast, `Error: ${result.error}`);
        }
      } catch (err) {
        _showToast(toast, `Save failed: ${err.message}`);
      }
    }
    _editDirtyEls.clear();
    return;
  }

  // Presentation mode: save full slide HTML (local dev only)
  if (!_editFile || _editDirty.size === 0) return;
  const isLocal = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
  if (!isLocal) {
    _showToast(toast, 'Editing saves locally only');
    _editDirty.clear();
    return;
  }
  const slides = document.querySelectorAll('.slide');

  for (const idx of _editDirty) {
    const slide = slides[idx];
    if (!slide) continue;
    const inner = slide.querySelector('.slide-inner');
    if (!inner) continue;

    const clone = inner.cloneNode(true);
    clone.querySelectorAll('[contenteditable]').forEach(el => el.removeAttribute('contenteditable'));
    clone.querySelectorAll('[data-edit-original]').forEach(el => el.removeAttribute('data-edit-original'));
    clone.querySelectorAll('.pin, .drag-select-rect, .grid-overlay, .hover-highlight').forEach(el => el.remove());

    const html = clone.innerHTML.trim();
    try {
      const resp = await fetch('/edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file: _editFile, slideIndex: idx, html }),
      });
      const result = await resp.json();
      if (result.ok) {
        _showToast(toast, `Slide ${idx + 1} saved`);
      } else {
        _showToast(toast, `Error: ${result.error}`);
      }
    } catch (err) {
      _showToast(toast, `Save failed: ${err.message}`);
    }
  }
  _editDirty.clear();
}

function _showToast(toast, msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2000);
}

