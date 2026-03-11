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
// Pin / Annotation system
// Call initAnnotations('storage-key') from each page
// ══════════════════════════════════════════════════════════════
let _pinStorageKey = '';
let _placingSlide = null;
let _multiSelectEls = []; // multi-select buffer

function initAnnotations(storageKey) {
  _pinStorageKey = storageKey;

  document.addEventListener('DOMContentLoaded', () => {
    const labels = document.querySelectorAll('.slide-label');
    labels.forEach((label, i) => {
      const slideNum = i + 1;
      const slideEl = label.nextElementSibling;
      if (!slideEl || !slideEl.classList.contains('slide')) return;

      const wrapper = document.createElement('div');
      wrapper.className = 'slide-wrapper';
      wrapper.dataset.slide = slideNum;
      label.parentNode.insertBefore(wrapper, label);
      wrapper.appendChild(label);
      wrapper.appendChild(slideEl);

      const btn = document.createElement('button');
      btn.className = 'pin-btn';
      btn.id = 'pinbtn-' + slideNum;
      btn.title = 'Click to place a pin · ⇧⌘+Click for multi-select';
      btn.onclick = (e) => { e.stopPropagation(); _togglePlacing(slideNum); };
      label.style.position = 'relative';
      label.style.paddingRight = '36px';
      label.appendChild(btn);

      const pinList = document.createElement('div');
      pinList.className = 'pin-list';
      pinList.id = 'pinlist-' + slideNum;
      wrapper.appendChild(pinList);

      slideEl.addEventListener('mouseover', (e) => {
        if (_placingSlide !== slideNum) return;
        const t = e.target;
        if (t === slideEl || t.classList.contains('slide-inner') || t.classList.contains('pin')) return;
        t.classList.add('hover-highlight');
      });
      slideEl.addEventListener('mouseout', (e) => {
        if (e.target.classList) e.target.classList.remove('hover-highlight');
      });

      // Drag area selection
      let _dragStart = null, _dragActive = false, _justDragged = false;
      const _dragRect = document.createElement('div');
      _dragRect.className = 'drag-select-rect';
      slideEl.appendChild(_dragRect);

      slideEl.addEventListener('mousedown', (e) => {
        if (_placingSlide !== slideNum || e.button !== 0) return;
        if (e.target.classList.contains('pin')) return;
        _dragStart = { x: e.clientX, y: e.clientY };
        _dragActive = false;
      });
      slideEl.addEventListener('mousemove', (e) => {
        if (!_dragStart || _placingSlide !== slideNum) return;
        const dx = e.clientX - _dragStart.x, dy = e.clientY - _dragStart.y;
        if (!_dragActive && (dx * dx + dy * dy) < 64) return;
        _dragActive = true;
        const sr = slideEl.getBoundingClientRect();
        const left = Math.min(_dragStart.x, e.clientX) - sr.left;
        const top = Math.min(_dragStart.y, e.clientY) - sr.top;
        _dragRect.style.display = 'block';
        _dragRect.style.left = left + 'px';
        _dragRect.style.top = top + 'px';
        _dragRect.style.width = Math.abs(dx) + 'px';
        _dragRect.style.height = Math.abs(dy) + 'px';
        // Highlight elements in rect
        _dragHighlightSlide(slideEl, Math.min(_dragStart.x, e.clientX), Math.min(_dragStart.y, e.clientY),
          Math.max(_dragStart.x, e.clientX), Math.max(_dragStart.y, e.clientY));
      });
      slideEl.addEventListener('mouseup', (e) => {
        if (!_dragStart) return;
        const wasDrag = _dragActive;
        _dragStart = null; _dragActive = false;
        _dragRect.style.display = 'none';
        if (!wasDrag) return;
        _justDragged = true;
        e.stopPropagation();
        // Collect highlighted elements as pins
        const highlighted = slideEl.querySelectorAll('.drag-highlight');
        highlighted.forEach(el => {
          el.classList.remove('drag-highlight');
          const elInfo = _identifyElement(el, slideEl);
          if (!elInfo.selector) return;
          const rect = slideEl.getBoundingClientRect();
          const er = el.getBoundingClientRect();
          const x = +(((er.left + er.width / 2 - rect.left) / rect.width) * 100).toFixed(1);
          const y = +(((er.top + er.height / 2 - rect.top) / rect.height) * 100).toFixed(1);
          _addPin(slideNum, x, y, '', elInfo);
        });
      });
      slideEl.addEventListener('click', (e) => {
        if (_placingSlide !== slideNum) return;
        if (_justDragged) { _justDragged = false; return; }
        e.stopPropagation();
        e.target.classList.remove('hover-highlight');
        if (e.target.classList.contains('pin')) return;

        const rect = slideEl.getBoundingClientRect();
        const x = +((e.clientX - rect.left) / rect.width * 100).toFixed(1);
        const y = +((e.clientY - rect.top) / rect.height * 100).toFixed(1);
        const elInfo = _identifyElement(e.target, slideEl);
        if (!elInfo.selector) return;

        // Capture text selection if any
        const sel = window.getSelection();
        if (sel && sel.toString().trim().length > 0) {
          elInfo.selectedText = sel.toString().trim().slice(0, 200);
          sel.removeAllRanges();
        }

        // Multi-select: Cmd+Shift+Click toggles elements in buffer
        if ((e.metaKey || e.ctrlKey) && e.shiftKey) {
          const existing = _multiSelectEls.findIndex(m => m.selector === elInfo.selector);
          if (existing >= 0) {
            e.target.classList.remove('multi-highlight');
            _multiSelectEls.splice(existing, 1);
          } else {
            e.target.classList.add('multi-highlight');
            _multiSelectEls.push({ x, y, elInfo, el: e.target });
          }
          _updateMultiCount(slideNum);
          return;
        }

        // If there are buffered multi-select elements, commit them all as pins
        if (_multiSelectEls.length > 0) {
          _multiSelectEls.push({ x, y, elInfo, el: e.target });
          const names = _multiSelectEls.map(m => m.elInfo.name).join(' + ');
          _multiSelectEls.forEach(m => {
            if (m.el) m.el.classList.remove('multi-highlight');
            m.elInfo.multiGroup = names;
            _addPin(slideNum, m.x, m.y, '', m.elInfo);
          });
          _multiSelectEls = [];
          _updateMultiCount(slideNum);
          return;
        }

        _addPin(slideNum, x, y, '', elInfo);
      });

      _renderPins(slideNum);
    });

    _updatePinCount();
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (_multiSelectEls.length) {
          _multiSelectEls.forEach(m => { if (m.el) m.el.classList.remove('multi-highlight'); });
          _multiSelectEls = [];
          if (_placingSlide) _updateMultiCount(_placingSlide);
        }
        if (_placingSlide) _togglePlacing(_placingSlide);
      }
    });
  });
}

function _updateMultiCount(slideNum) {
  const btn = document.getElementById('pinbtn-' + slideNum);
  if (!btn || !btn.classList.contains('placing')) return;
  btn.textContent = _multiSelectEls.length > 0 ? _multiSelectEls.length + '⊕' : '\u00d7';
}

function _pinLoad() {
  try { return JSON.parse(localStorage.getItem(_pinStorageKey) || '{}'); } catch { return {}; }
}
function _pinSave(data) {
  localStorage.setItem(_pinStorageKey, JSON.stringify(data));
  _updatePinCount();
}
function _updatePinCount() {
  const data = _pinLoad();
  let total = 0;
  for (const s in data) total += data[s].length;
  const el = document.getElementById('pinCount');
  if (el) el.textContent = total > 0 ? `${total} pins` : '';
}

function _togglePlacing(num) {
  const wrapper = document.querySelector(`[data-slide="${num}"]`);
  const slideEl = wrapper.querySelector('.slide');
  const btn = document.getElementById('pinbtn-' + num);
  if (_placingSlide === num) {
    _placingSlide = null;
    slideEl.classList.remove('placing-mode');
    btn.classList.remove('placing');
    _updateBtnState(num);
  } else {
    if (_placingSlide) _togglePlacing(_placingSlide);
    _placingSlide = num;
    slideEl.classList.add('placing-mode');
    btn.classList.add('placing');
    btn.textContent = '\u00d7';
  }
}

function _updateBtnState(num) {
  const btn = document.getElementById('pinbtn-' + num);
  if (!btn || btn.classList.contains('placing')) return;
  const data = _pinLoad();
  const pins = data[num] || [];
  if (pins.length > 0) { btn.classList.add('has-pins'); btn.textContent = pins.length; }
  else { btn.classList.remove('has-pins'); btn.textContent = '+'; }
}

function _identifyElement(target, slideEl) {
  const inner = slideEl.querySelector('.slide-inner');
  if (!inner || target.classList.contains('pin')) return { selector: '', name: '', text: '', classes: '', path: '', styles: '' };
  const rawText = (target.textContent || '').trim();
  const text = rawText.length > 60 ? rawText.slice(0, 57) + '...' : rawText;

  // Build CSS path (for export)
  const parts = [];
  let cur = target;
  const skipClasses = new Set(['slide-inner', 'bg-brand', 'bg-warning', 'bg-layer', 'bg-warning-subtle']);
  while (cur && cur !== inner && cur !== slideEl) {
    let seg = cur.tagName ? cur.tagName.toLowerCase() : '';
    const classes = [...(cur.classList || [])].filter(c => !skipClasses.has(c));
    if (classes.length) seg = '.' + classes.join('.');
    else if (cur.tagName === 'DIV' && cur.style.cssText) seg = 'div[style]';
    parts.unshift(seg);
    cur = cur.parentElement;
  }
  const selector = parts.join(' > ');

  // Human-readable name + parent context
  const elName = _elementName(target, slideEl);
  const context = _parentContext(target, inner);
  const name = context ? context + ' → ' + elName : elName;

  // Key computed styles snapshot
  const styles = _styleSnapshot(target);

  // Nearby siblings for context
  const nearby = _nearbySiblings(target);

  return { selector, name, text, classes: [...(target.classList || [])].join(' '), styles, nearby };
}

function _nearbySiblings(el) {
  const parent = el.parentElement;
  if (!parent) return '';
  const siblings = [...parent.children].filter(s => s !== el && s.tagName && !s.classList.contains('pin'));
  if (!siblings.length) return '';
  const names = siblings.slice(0, 3).map(s => {
    const txt = (s.textContent || '').trim();
    const short = txt.length > 20 ? txt.slice(0, 17) + '...' : txt;
    return short ? '"' + short + '"' : s.tagName.toLowerCase();
  });
  const suffix = siblings.length > 3 ? ' (+' + (siblings.length - 3) + ' more)' : '';
  return names.join(', ') + suffix;
}

function _dragHighlightSlide(slideEl, left, top, right, bottom) {
  slideEl.querySelectorAll('.drag-highlight').forEach(el => el.classList.remove('drag-highlight'));
  const inner = slideEl.querySelector('.slide-inner');
  if (!inner) return;
  const selectors = '.h1,.h2,.h3,.h4,.h5,.h6,.p1,.p2,.p3,.stat-cell,.var-card,.feature-card-noimg,.feature-card,.proof-panel,.proof-stat,.compare-block,.logo-line-item,.carousel-card,img,.data-table td,.data-table th';
  const candidates = inner.querySelectorAll(selectors);
  for (const el of candidates) {
    if (el.classList.contains('pin') || el.classList.contains('footer') || el.classList.contains('drag-select-rect')) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 3 || r.height < 3) continue;
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    if (cx >= left && cx <= right && cy >= top && cy <= bottom) {
      el.classList.add('drag-highlight');
    }
  }
}

function _elementName(el, slideEl) {
  const tag = el.tagName.toLowerCase();
  const allCls = [...(el.classList || [])];

  // Typography classes → role name (check FIRST — h5, p2 etc are only 2 chars)
  const typoMap = { 'h1': 'Display', 'h2': 'Large Title', 'h3': 'Section Title',
    'h4': 'Subtitle', 'h5': 'Label', 'h6': 'Small Label',
    'p1': 'Body', 'p2': 'Body Small', 'p3': 'Caption', 'p5': 'Micro' };
  for (const c of allCls) { if (typoMap[c]) return typoMap[c]; }

  // Design system component map → human name
  const dsMap = {
    'stat-cell': 'Stat Cell', 'var-card': 'Variable Card', 'var-table': 'Variable Table',
    'feature-card-noimg': 'Feature Card', 'feature-card': 'Feature Card',
    'proof-panel': 'Proof Panel', 'proof-grid': 'Proof Grid', 'proof-stat': 'Proof Stat',
    'compare-block': 'Compare Block', 'footer': 'Footer', 'content-frame': 'Content Frame',
    'tl-stats': 'Header Zone', 'tl-stats-title': 'Header Title', 'tl-stats-top': 'Header',
    'carousel-track': 'Carousel', 'carousel-card': 'Carousel Card',
    'logo-line-item': 'Partner Row', 'logo-line-item-body': 'Partner Info',
    'data-table': 'Data Table', 'list': 'Bullet List',
    'slot-tables-row': 'Side-by-Side' };
  for (const c of allCls) { if (dsMap[c]) return dsMap[c]; }

  // Color hint from utility classes
  const colorMap = { 'c-primary': '', 'c-secondary': '(secondary)', 'c-tertiary': '(muted)',
    'c-yellow': '(accent)', 'c-disabled': '(disabled)' };
  const colorHint = allCls.map(c => colorMap[c]).find(v => v !== undefined) || '';

  // HTML tags
  if (/^h[1-6]$/.test(tag)) return tag.toUpperCase() + ' Heading';
  if (tag === 'img') return 'Image';
  if (tag === 'span' || tag === 'p' || tag === 'label') return 'Text' + (colorHint ? ' ' + colorHint : '');

  // Containers with meaningful class
  const skip = new Set(['c-primary', 'c-secondary', 'c-tertiary', 'c-yellow', 'c-disabled', 'c-accent']);
  const meaningful = allCls.filter(c => c.length > 2 && !skip.has(c));
  if (tag === 'div' && meaningful.length) {
    const words = meaningful[0].split(/[-_]/).filter(w => w.length > 2).slice(0, 2);
    if (words.length) return words.map(w => w[0].toUpperCase() + w.slice(1)).join(' ');
  }

  return tag === 'div' ? 'Container' : tag;
}

// Walk up to find the parent component context
function _parentContext(el, inner) {
  const dsComponents = new Set(['stat-cell', 'var-card', 'var-table', 'feature-card-noimg',
    'feature-card', 'proof-panel', 'proof-grid', 'proof-stat', 'compare-block',
    'tl-stats', 'carousel-card', 'logo-line-item', 'data-table', 'slot-tables-row']);
  let cur = el.parentElement;
  while (cur && cur !== inner) {
    const match = [...(cur.classList || [])].find(c => dsComponents.has(c));
    if (match) {
      const nameMap = { 'stat-cell': 'Stat', 'var-card': 'Card', 'var-table': 'Table',
        'feature-card-noimg': 'Feature', 'feature-card': 'Feature', 'proof-panel': 'Proof',
        'proof-grid': 'Proof Grid', 'proof-stat': 'Proof Stat', 'compare-block': 'Compare',
        'tl-stats': 'Header', 'carousel-card': 'Carousel', 'logo-line-item': 'Partner',
        'data-table': 'Table', 'slot-tables-row': 'Side-by-Side' };
      return nameMap[match] || match;
    }
    cur = cur.parentElement;
  }
  return '';
}

function _styleSnapshot(el) {
  const s = window.getComputedStyle(el);
  const parts = [];
  const bg = s.backgroundColor;
  if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') parts.push('bg:' + bg);
  const color = s.color;
  if (color && color !== 'rgb(0, 0, 0)') parts.push('color:' + color);
  const fs = s.fontSize;
  if (fs) parts.push('font:' + fs);
  const fw = s.fontWeight;
  if (fw && fw !== '400' && fw !== 'normal') parts.push('weight:' + fw);
  const gap = s.gap;
  if (gap && gap !== 'normal' && gap !== '0px') parts.push('gap:' + gap);
  return parts.join(', ');
}

function _addPin(slideNum, x, y, text, elInfo) {
  const data = _pinLoad();
  if (!data[slideNum]) data[slideNum] = [];
  const pin = { x, y, text, selector: elInfo.selector, elText: elInfo.text, classes: elInfo.classes,
    name: elInfo.name || '', styles: elInfo.styles || '', nearby: elInfo.nearby || '' };
  if (elInfo.selectedText) pin.selectedText = elInfo.selectedText;
  if (elInfo.multiGroup) pin.multiGroup = elInfo.multiGroup;
  data[slideNum].push(pin);
  _pinSave(data);
  _renderPins(slideNum);
  const pinList = document.getElementById('pinlist-' + slideNum);
  const inputs = pinList.querySelectorAll('input');
  if (inputs.length) inputs[inputs.length - 1].focus();
}

// These must be global for inline event handlers
function updatePinText(slideNum, idx, text) {
  const data = _pinLoad();
  if (data[slideNum] && data[slideNum][idx]) { data[slideNum][idx].text = text; _pinSave(data); }
}
function deletePin(slideNum, idx) {
  const data = _pinLoad();
  if (data[slideNum]) {
    data[slideNum].splice(idx, 1);
    if (data[slideNum].length === 0) delete data[slideNum];
    _pinSave(data);
    _renderPins(slideNum);
  }
}
function highlightPin(slideNum, idx, on) {
  const wrapper = document.querySelector(`[data-slide="${slideNum}"]`);
  const markers = wrapper.querySelectorAll('.slide .pin');
  if (markers[idx]) markers[idx].classList.toggle('active', on);
}

function _renderPins(slideNum) {
  const data = _pinLoad();
  const pins = data[slideNum] || [];
  const wrapper = document.querySelector(`[data-slide="${slideNum}"]`);
  if (!wrapper) return;
  const slideEl = wrapper.querySelector('.slide');
  const pinList = document.getElementById('pinlist-' + slideNum);
  slideEl.querySelectorAll('.pin').forEach(p => p.remove());
  pinList.innerHTML = '';
  pins.forEach((pin, idx) => {
    const num = idx + 1;
    const marker = document.createElement('div');
    marker.className = 'pin' + (pin.multiGroup ? ' multi' : '');
    marker.textContent = num;
    marker.style.left = pin.x + '%';
    marker.style.top = pin.y + '%';
    const tip = [pin.name || pin.classes || pin.selector, pin.nearby ? 'nearby: ' + pin.nearby : '', pin.styles, pin.text].filter(Boolean).join('\n');
    marker.title = tip;
    marker.onclick = (e) => {
      e.stopPropagation();
      const input = pinList.querySelector(`[data-idx="${idx}"] input`);
      if (input) { input.focus(); input.select(); }
    };
    slideEl.appendChild(marker);

    const item = document.createElement('div');
    item.className = 'pin-item';
    item.dataset.idx = idx;
    const elLabel = pin.name || pin.classes || pin.selector.split(' > ').pop() || 'slide';
    const elText = pin.elText && !elLabel.includes(pin.elText.slice(0, 15)) ? pin.elText : '';
    const textPreview = elText ? `<span class="pin-text-preview">"${escHtml(elText.length > 30 ? elText.slice(0, 27) + '...' : elText)}"</span>` : '';
    const selTextHtml = pin.selectedText ? `<span class="pin-sel-text" title="Selected text">\u201c${escHtml(pin.selectedText.slice(0, 50))}\u201d</span>` : '';
    const stylesHtml = pin.styles ? `<span class="pin-styles" title="Computed styles">${escHtml(pin.styles)}</span>` : '';
    const nearbyHtml = pin.nearby ? `<span class="pin-nearby" title="Nearby elements">${escHtml(pin.nearby)}</span>` : '';
    item.innerHTML = `<div class="pin-item-num">${num}</div><span class="pin-el">${escHtml(elLabel)}</span>${textPreview}${selTextHtml}<input type="text" value="${escHtml(pin.text || '')}" placeholder="What to change..." oninput="updatePinText(${slideNum},${idx},this.value)" onmouseenter="highlightPin(${slideNum},${idx},true)" onmouseleave="highlightPin(${slideNum},${idx},false)">${nearbyHtml}${stylesHtml}<button class="pin-delete" onclick="deletePin(${slideNum},${idx})" title="Delete pin">\u00d7</button>`;
    pinList.appendChild(item);
  });
  _updateBtnState(slideNum);
}

function copyNotes() {
  const data = _pinLoad();
  const labels = document.querySelectorAll('.slide-label');
  let output = '';
  let hasAny = false;
  Object.keys(data).map(Number).sort((a, b) => a - b).forEach(num => {
    const pins = data[num];
    if (!pins || !pins.length) return;
    hasAny = true;
    const label = labels[num - 1];
    const desc = label ? label.textContent.trim() : '#' + num;
    output += `Slide ${num}  ${desc}\n`;
    pins.forEach((pin, i) => {
      const label = pin.name || pin.classes || pin.selector || 'element';
      const content = pin.elText && !label.includes(pin.elText.slice(0, 15)) ? ` "${pin.elText}"` : '';
      let line = `  ${i + 1}. [${label}]${content}`;
      if (pin.text) line += ` -- ${pin.text}`;
      line += '\n';
      if (pin.selectedText) line += `     selected: "${pin.selectedText}"\n`;
      if (pin.styles) line += `     css: ${pin.styles}\n`;
      if (pin.nearby) line += `     nearby: ${pin.nearby}\n`;
      output += line;
    });
    output += '\n';
  });
  navigator.clipboard.writeText(hasAny ? output : '(No annotations yet)');
  const btn = document.getElementById('exportBtn');
  if (btn) { const prev = btn.textContent; btn.textContent = 'Copied!'; setTimeout(() => btn.textContent = prev, 1500); }
}

function clearAllNotes() {
  if (!confirm('Clear all annotations?')) return;
  localStorage.removeItem(_pinStorageKey);
  document.querySelectorAll('.slide-wrapper').forEach(w => {
    const num = +w.dataset.slide;
    if (num) _renderPins(num);
  });
  _updatePinCount();
}
