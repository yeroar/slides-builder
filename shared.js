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
      slideEl.addEventListener('click', (e) => {
        if (_placingSlide !== slideNum) return;
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

  // Human-readable name (inspired by agentation)
  const name = _elementName(target);

  // Readable path (max 4 ancestors)
  const pathParts = [];
  let p = target;
  let depth = 0;
  while (p && p !== inner && depth < 4) {
    const tag = p.tagName.toLowerCase();
    if (tag === 'html' || tag === 'body') break;
    const cls = [...(p.classList || [])].filter(c => c.length > 2 && !skipClasses.has(c))[0];
    pathParts.unshift(cls ? '.' + cls : tag);
    p = p.parentElement;
    depth++;
  }
  const path = pathParts.join(' > ');

  // Key computed styles snapshot
  const styles = _styleSnapshot(target);

  return { selector, name, text, classes: [...(target.classList || [])].join(' '), path, styles };
}

function _elementName(el) {
  const tag = el.tagName.toLowerCase();
  const txt = (el.textContent || '').trim();
  const short = txt.length > 35 ? txt.slice(0, 32) + '...' : txt;
  const cls = [...(el.classList || [])].filter(c => c.length > 2);

  // Design system classes → readable name
  const dsMap = { 'h1': 'H1', 'h2': 'H2', 'h3': 'H3', 'h4': 'H4', 'h5': 'H5', 'h6': 'H6',
    'stat-cell': 'stat cell', 'var-card': 'variable card', 'var-table': 'variable table',
    'feature-card-noimg': 'feature card', 'feature-card': 'feature card',
    'proof-panel': 'proof panel', 'proof-grid': 'proof grid', 'proof-stat': 'proof stat',
    'compare-block': 'compare block', 'footer': 'footer', 'content-frame': 'content frame',
    'tl-stats': 'header zone', 'tl-stats-title': 'header title', 'carousel-track': 'carousel',
    'logo-line-item': 'partner row', 'data-table': 'data table' };
  for (const c of cls) { if (dsMap[c]) return dsMap[c] + (short ? ': "' + short + '"' : ''); }

  // Typography classes
  if (cls.some(c => /^(h[1-6]|p[1-5])$/.test(c))) {
    const typo = cls.find(c => /^(h[1-6]|p[1-5])$/.test(c));
    return typo.toUpperCase() + (short ? ' "' + short + '"' : '');
  }

  // Headings
  if (/^h[1-6]$/.test(tag)) return tag + (short ? ' "' + short + '"' : '');
  // Images
  if (tag === 'img') { const alt = el.getAttribute('alt'); return alt ? 'image "' + alt.slice(0, 30) + '"' : 'image'; }
  // Text elements
  if (tag === 'span' || tag === 'p' || tag === 'label') return short ? '"' + short + '"' : tag;
  // Containers with meaningful class
  if (tag === 'div' && cls.length) {
    const words = cls[0].split(/[-_]/).filter(w => w.length > 2).slice(0, 2);
    if (words.length) return words.join(' ') + (short && short.length < 25 ? ': "' + short + '"' : '');
  }

  return tag === 'div' ? 'container' : tag;
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
    name: elInfo.name || '', path: elInfo.path || '', styles: elInfo.styles || '' };
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
    const tip = [pin.name || pin.classes || pin.selector, pin.styles, pin.text].filter(Boolean).join('\n');
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
    const hasClass = pin.classes && pin.classes.length > 0;
    const selTextHtml = pin.selectedText ? `<span class="pin-sel-text" title="Selected text">\u201c${escHtml(pin.selectedText.slice(0, 50))}\u201d</span>` : '';
    const stylesHtml = pin.styles ? `<span class="pin-styles" title="Computed styles">${escHtml(pin.styles)}</span>` : '';
    item.innerHTML = `<div class="pin-item-num">${num}</div><span class="pin-el ${hasClass ? 'has-class' : ''}">${escHtml(elLabel)}</span>${selTextHtml}<input type="text" value="${escHtml(pin.text || '')}" placeholder="What to change..." oninput="updatePinText(${slideNum},${idx},this.value)" onmouseenter="highlightPin(${slideNum},${idx},true)" onmouseleave="highlightPin(${slideNum},${idx},false)">${stylesHtml}<button class="pin-delete" onclick="deletePin(${slideNum},${idx})" title="Delete pin">\u00d7</button>`;
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
      const label = pin.name || pin.selector || '';
      const selText = pin.selectedText ? `\n     \u201c${pin.selectedText}\u201d` : '';
      const styles = pin.styles ? `\n     styles: ${pin.styles}` : '';
      output += `  ${i + 1}. ${label}${pin.elText ? ' "' + pin.elText + '"' : ''}${selText}${styles}\n     \u2192 ${pin.text || '(no description)'}\n`;
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
