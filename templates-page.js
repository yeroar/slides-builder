(function () {
  const pageConfig = window.TEMPLATE_PAGE || window.COMPONENTS_PAGE;
  const ANN_KEY = window.TEMPLATE_PAGE ? 'templates-annotations' : 'components-annotations';
  let shell = null;
  let annotating = false;
  let multiAnn = [];

  function annLoad() {
    try {
      return JSON.parse(localStorage.getItem(ANN_KEY) || '{}');
    } catch {
      return {};
    }
  }

  function annSave(data) {
    localStorage.setItem(ANN_KEY, JSON.stringify(data));
    annUpdateBadge();
    annSyncFile(data);
  }

  function annSyncFile(data) {
    const out = {};
    for (const [storyId, pins] of Object.entries(data)) {
      const storyEl = document.getElementById(storyId);
      const title = storyEl ? storyEl.querySelector('.story-title')?.textContent : storyId;
      out[storyId] = {
        story: title,
        pins: pins.map((pin, index) => ({
          id: index + 1,
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

  function annUpdateBadge() {
    const data = annLoad();
    let total = 0;
    for (const key in data) total += data[key].length;

    const badge = document.getElementById('annBadge');
    const title = document.getElementById('annPanelTitle');
    const copyFab = document.getElementById('annCopyFab');
    if (total > 0) {
      badge.textContent = total;
      badge.classList.add('visible');
      title.textContent = `Notes (${total})`;
      if (copyFab && !annotating) {
        copyFab.textContent = 'Copy pins';
        copyFab.title = `Copy ${total} pin${total > 1 ? 's' : ''} to clipboard`;
        copyFab.classList.add('visible');
      }
      return;
    }

    badge.classList.remove('visible');
    title.textContent = 'Notes';
    if (copyFab) copyFab.classList.remove('visible');
  }

  function annIdentify(target, storyEl) {
    const parts = [];
    let current = target;
    const skipCls = new Set(['story', 'story-header', 'story-desc', 'variants', 'variant', 'row',
      'slide-inner', 'bg-brand', 'bg-warning', 'bg-layer', 'bg-warning-subtle']);
    while (current && current !== storyEl) {
      let segment = current.tagName ? current.tagName.toLowerCase() : '';
      const classes = [...(current.classList || [])].filter(c => !skipCls.has(c) && !c.startsWith('ann-'));
      if (classes.length) {
        segment = '.' + classes.join('.');
      } else if (current.tagName === 'DIV' && current.style.cssText) {
        segment = 'div[style]';
      }
      parts.unshift(segment);
      current = current.parentElement;
    }

    const selector = parts.join(' > ');
    const rawText = (target.textContent || '').trim();
    const text = rawText.length > 60 ? `${rawText.slice(0, 57)}...` : rawText;
    const classes = [...(target.classList || [])].filter(c => !c.startsWith('ann-')).join(' ');

    // Human-readable name
    const name = _annElementName(target, storyEl);

    // Computed styles snapshot
    const s = window.getComputedStyle(target);
    const styleParts = [];
    const bg = s.backgroundColor;
    if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') styleParts.push('bg:' + bg);
    if (s.color && s.color !== 'rgb(0, 0, 0)') styleParts.push('color:' + s.color);
    if (s.fontSize) styleParts.push('font:' + s.fontSize);
    if (s.fontWeight && s.fontWeight !== '400' && s.fontWeight !== 'normal') styleParts.push('weight:' + s.fontWeight);
    const styles = styleParts.join(', ');

    // Nearby siblings for context
    const nearby = _annNearbySiblings(target);

    return { selector, text, classes, name, styles, nearby };
  }

  // Nearby sibling elements for structural context
  function _annNearbySiblings(el) {
    const parent = el.parentElement;
    if (!parent) return '';
    const siblings = [...parent.children].filter(s => s !== el && s.tagName && !s.classList.contains('ann-pin') && !s.classList.contains('pin'));
    if (!siblings.length) return '';
    const names = siblings.slice(0, 3).map(s => {
      const txt = (s.textContent || '').trim();
      const short = txt.length > 20 ? txt.slice(0, 17) + '...' : txt;
      return short ? '"' + short + '"' : s.tagName.toLowerCase();
    });
    const suffix = siblings.length > 3 ? ` (+${siblings.length - 3} more)` : '';
    return names.join(', ') + suffix;
  }

  // Human-readable element name for annotations
  function _annElementName(el, container) {
    const allCls = [...(el.classList || [])].filter(c => !c.startsWith('ann-'));
    const tag = el.tagName.toLowerCase();

    // Typography classes first (h5, p2 etc are short)
    const typoMap = { 'h1': 'Display', 'h2': 'Large Title', 'h3': 'Section Title',
      'h4': 'Subtitle', 'h5': 'Label', 'h6': 'Small Label',
      'p1': 'Body', 'p2': 'Body Small', 'p3': 'Caption', 'p5': 'Micro' };
    for (const c of allCls) { if (typoMap[c]) return _annWithContext(el, container, typoMap[c]); }

    // Design system components
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

  // Walk up to find parent component context
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
      if (match) return (nameMap[match] || match) + ' → ' + name;
      cur = cur.parentElement;
    }
    return name;
  }

  function annUpdateMulti() {
    const bar = document.getElementById('annMulti');
    const count = document.getElementById('annMultiCount');
    if (multiAnn.length > 0) {
      bar.classList.add('visible');
      count.textContent = `${multiAnn.length} selected`;
      document.getElementById('annMultiInput').focus();
      return;
    }
    bar.classList.remove('visible');
  }

  function clearMultiAnn() {
    multiAnn.forEach((selection) => selection.el.classList.remove('ann-selected'));
    multiAnn = [];
    annUpdateMulti();
  }

  function annDeletePin(storyId, index) {
    const data = annLoad();
    if (!data[storyId]) return;
    data[storyId].splice(index, 1);
    if (data[storyId].length === 0) delete data[storyId];
    annSave(data);
    annRenderAll();
  }

  function annUpdateNote(storyId, index, note) {
    const data = annLoad();
    if (!data[storyId] || !data[storyId][index]) return;
    data[storyId][index].note = note;
    annSave(data);
  }

  function annRenderAll() {
    document.querySelectorAll('.ann-pin').forEach((pin) => pin.remove());
    const data = annLoad();
    const list = document.getElementById('annList');
    list.innerHTML = '';

    let globalIndex = 0;
    let hasNotes = false;

    for (const storyId in data) {
      const pins = data[storyId];
      const storyEl = document.getElementById(storyId);
      if (!storyEl || !pins.length) continue;
      hasNotes = true;
      storyEl.style.position = 'relative';

      const storyTitle = storyEl.querySelector('.story-title')?.textContent || storyId;
      pins.forEach((pin, index) => {
        globalIndex += 1;

        const marker = document.createElement('div');
        marker.className = 'ann-pin';
        marker.textContent = globalIndex;
        marker.style.left = `${pin.x}%`;
        marker.style.top = `${pin.y}%`;
        const tipName = pin.name || pin.classes || pin.selector || '';
        marker.title = tipName + (pin.nearby ? '\nnearby: ' + pin.nearby : '') + (pin.note ? '\n' + pin.note : '');
        storyEl.appendChild(marker);

        const note = document.createElement('div');
        note.className = 'ann-note';

        const number = document.createElement('div');
        number.className = 'ann-note-num';
        number.textContent = globalIndex;

        const body = document.createElement('div');
        body.className = 'ann-note-body';

        const story = document.createElement('div');
        story.className = 'ann-note-story';
        story.textContent = storyTitle;
        body.appendChild(story);

        const elLabel = pin.name || pin.classes || pin.selector?.split(' > ').pop() || 'element';
        const element = document.createElement('span');
        element.className = 'ann-note-el';
        element.textContent = elLabel;
        body.appendChild(element);

        if (pin.nearby) {
          const nearbyEl = document.createElement('span');
          nearbyEl.className = 'ann-note-nearby';
          nearbyEl.textContent = 'nearby: ' + pin.nearby;
          body.appendChild(nearbyEl);
        }

        const input = document.createElement('input');
        input.type = 'text';
        input.value = pin.note || '';
        input.placeholder = 'What to change...';
        input.addEventListener('input', () => annUpdateNote(storyId, index, input.value));
        body.appendChild(input);

        const remove = document.createElement('button');
        remove.type = 'button';
        remove.className = 'ann-note-delete';
        remove.textContent = '×';
        remove.addEventListener('click', () => annDeletePin(storyId, index));

        note.appendChild(number);
        note.appendChild(body);
        note.appendChild(remove);
        list.appendChild(note);
      });
    }

    if (!hasNotes) {
      list.innerHTML = '<div class="ann-panel-empty">Click elements to annotate</div>';
    }

    annUpdateBadge();
  }

  function commitMultiAnn() {
    const input = document.getElementById('annMultiInput');
    const note = input.value.trim();
    if (multiAnn.length === 0) return;

    const data = annLoad();
    for (const selection of multiAnn) {
      if (!data[selection.storyId]) data[selection.storyId] = [];
      data[selection.storyId].push({
        x: selection.x,
        y: selection.y,
        note,
        selector: selection.elInfo.selector,
        elText: selection.elInfo.text,
        classes: selection.elInfo.classes,
        name: selection.elInfo.name || '',
        styles: selection.elInfo.styles || '',
        nearby: selection.elInfo.nearby || '',
      });
    }

    annSave(data);
    clearMultiAnn();
    input.value = '';
    annRenderAll();
  }

  function copyAllNotes() {
    const data = annLoad();
    let text = '';
    for (const storyId in data) {
      const storyEl = document.getElementById(storyId);
      const title = storyEl ? storyEl.querySelector('.story-title')?.textContent : storyId;
      text += `## ${title}\n`;
      data[storyId].forEach((pin, index) => {
        const label = pin.name || pin.classes || pin.selector?.split(' > ').pop() || 'element';
        const content = pin.elText && !label.includes(pin.elText.slice(0, 15)) ? ` "${pin.elText}"` : '';
        let line = `  ${index + 1}. [${label}]${content}`;
        if (pin.note) line += ` -- ${pin.note}`;
        line += '\n';
        if (pin.styles) line += `     css: ${pin.styles}\n`;
        if (pin.nearby) line += `     nearby: ${pin.nearby}\n`;
        text += line;
      });
      text += '\n';
    }

    navigator.clipboard.writeText(text.trim()).then(() => {
      const title = document.getElementById('annPanelTitle');
      const previous = title.textContent;
      title.textContent = 'Copied!';
      setTimeout(() => {
        title.textContent = previous;
      }, 1500);
    });
  }

  function clearAllAnnotations() {
    if (!confirm('Clear all annotations?')) return;
    localStorage.removeItem(ANN_KEY);
    annRenderAll();
  }

  function toggleAnnotating() {
    annotating = !annotating;
    document.body.classList.toggle('annotating', annotating);
    document.getElementById('annFab').classList.toggle('active', annotating);
    document.getElementById('annPanel').classList.toggle('open', annotating);
    if (annotating) annRenderAll();
    if (!annotating) clearMultiAnn();
    // Hide copy FAB when annotating, show when not (if has notes)
    const copyFab = document.getElementById('annCopyFab');
    if (copyFab) {
      if (annotating) copyFab.classList.remove('visible');
      else annUpdateBadge();
    }
  }

  function bindEvents() {
    document.getElementById('annFab').addEventListener('click', toggleAnnotating);
    document.getElementById('annCopyFab').addEventListener('click', () => {
      copyAllNotes();
      const btn = document.getElementById('annCopyFab');
      btn.textContent = 'Copied!';
      setTimeout(() => { btn.textContent = 'Copy pins'; }, 1500);
    });
    document.getElementById('copyNotesButton').addEventListener('click', copyAllNotes);
    document.getElementById('clearNotesButton').addEventListener('click', clearAllAnnotations);
    document.getElementById('annMultiAdd').addEventListener('click', commitMultiAnn);
    document.getElementById('annMultiCancel').addEventListener('click', clearMultiAnn);
    document.getElementById('annMultiInput').addEventListener('keydown', (event) => {
      if (event.key === 'Enter') commitMultiAnn();
    });
    let justFinishedDrag = false;

    document.addEventListener('click', (event) => {
      if (!annotating) return;
      if (justFinishedDrag) { justFinishedDrag = false; return; }
      if (event.target.closest('.sidebar') || event.target.closest('.ann-fab') || event.target.closest('.ann-panel') || event.target.closest('.toolbar')) return;

      const slideEl = event.target.closest('.slide');
      if (!slideEl) {
        toggleAnnotating();
        return;
      }

      const storyEl = slideEl.closest('.story');
      if (!storyEl) return;
      event.preventDefault();
      event.stopPropagation();

      const target = event.target;
      if (target.classList.contains('ann-pin')) return;
      target.classList.remove('ann-hover');

      const existingIndex = multiAnn.findIndex((selection) => selection.el === target);
      if (existingIndex >= 0) {
        target.classList.remove('ann-selected');
        multiAnn.splice(existingIndex, 1);
        annUpdateMulti();
        return;
      }

      const elInfo = annIdentify(target, storyEl);
      if (!elInfo.selector) return;
      const rect = storyEl.getBoundingClientRect();
      const x = +(((event.clientX - rect.left) / rect.width) * 100).toFixed(1);
      const y = +(((event.clientY - rect.top) / rect.height) * 100).toFixed(1);
      target.classList.add('ann-selected');
      multiAnn.push({ el: target, storyId: storyEl.id, elInfo, x, y });
      annUpdateMulti();
    }, true);

    document.addEventListener('mouseover', (event) => {
      if (!annotating) return;
      if (!event.target.closest('.slide')) return;
      if (event.target.classList.contains('ann-pin')) return;
      if (event.target.closest('.sidebar') || event.target.closest('.ann-panel')) return;
      event.target.classList.add('ann-hover');
    });

    document.addEventListener('mouseout', (event) => {
      if (event.target.classList) event.target.classList.remove('ann-hover');
    });

    // ── Drag area selection ──
    let dragStart = null;
    let dragActive = false;
    const dragRect = document.createElement('div');
    dragRect.className = 'ann-drag-rect';
    document.body.appendChild(dragRect);
    const DRAG_THRESHOLD = 8;

    document.addEventListener('mousedown', (e) => {
      if (!annotating || e.button !== 0) return;
      if (e.target.closest('.sidebar') || e.target.closest('.ann-fab') || e.target.closest('.ann-panel') || e.target.closest('.toolbar')) return;
      if (!e.target.closest('.slide')) return;
      const storyEl = e.target.closest('.story');
      if (!storyEl) return;
      dragStart = { x: e.clientX, y: e.clientY, storyEl };
      dragActive = false;
    });

    document.addEventListener('mousemove', (e) => {
      if (!dragStart) return;
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      if (!dragActive && (dx * dx + dy * dy) < DRAG_THRESHOLD * DRAG_THRESHOLD) return;
      dragActive = true;

      const left = Math.min(dragStart.x, e.clientX);
      const top = Math.min(dragStart.y, e.clientY);
      const w = Math.abs(dx);
      const h = Math.abs(dy);
      dragRect.style.display = 'block';
      dragRect.style.left = left + 'px';
      dragRect.style.top = top + 'px';
      dragRect.style.width = w + 'px';
      dragRect.style.height = h + 'px';

      // Highlight elements inside the drag area
      _dragHighlight(dragStart.storyEl, left, top, left + w, top + h);
    });

    document.addEventListener('mouseup', (e) => {
      if (!dragStart) return;
      const wasDragging = dragActive;
      const storyEl = dragStart.storyEl;
      dragStart = null;
      dragActive = false;
      dragRect.style.display = 'none';

      if (!wasDragging) return;
      justFinishedDrag = true;

      // Clear drag highlights and select all highlighted elements
      const highlighted = storyEl.querySelectorAll('.ann-drag-highlight');
      highlighted.forEach(el => {
        el.classList.remove('ann-drag-highlight');
        // Add to multi-select if not already there
        if (multiAnn.findIndex(m => m.el === el) >= 0) return;
        const elInfo = annIdentify(el, storyEl);
        if (!elInfo.selector) return;
        const rect = storyEl.getBoundingClientRect();
        const elRect = el.getBoundingClientRect();
        const cx = elRect.left + elRect.width / 2;
        const cy = elRect.top + elRect.height / 2;
        const x = +(((cx - rect.left) / rect.width) * 100).toFixed(1);
        const y = +(((cy - rect.top) / rect.height) * 100).toFixed(1);
        el.classList.add('ann-selected');
        multiAnn.push({ el, storyId: storyEl.id, elInfo, x, y });
      });
      annUpdateMulti();
    });

    function _dragHighlight(storyEl, left, top, right, bottom) {
      // Clear previous highlights
      storyEl.querySelectorAll('.ann-drag-highlight').forEach(el => el.classList.remove('ann-drag-highlight'));

      // Find meaningful elements within the story's slide(s)
      const inners = storyEl.querySelectorAll('.slide-inner');
      if (!inners.length) return;

      // Meaningful selectors — elements worth selecting
      const selectors = '.h1,.h2,.h3,.h4,.h5,.h6,.p1,.p2,.p3,.stat-cell,.var-card,.feature-card-noimg,.feature-card,.proof-panel,.proof-stat,.compare-block,.logo-line-item,.carousel-card,img,.data-table td,.data-table th';
      const skip = new Set(['ann-pin', 'pin', 'grid-overlay', 'footer', 'ann-drag-rect']);

      inners.forEach(inner => {
        const candidates = inner.querySelectorAll(selectors);
        for (const el of candidates) {
          if ([...el.classList].some(c => skip.has(c))) continue;
          const r = el.getBoundingClientRect();
          if (r.width < 3 || r.height < 3) continue;
          const cx = r.left + r.width / 2;
          const cy = r.top + r.height / 2;
          if (cx >= left && cx <= right && cy >= top && cy <= bottom) {
            el.classList.add('ann-drag-highlight');
          }
        }
      });
    }

    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape') return;
      if (multiAnn.length > 0) {
        clearMultiAnn();
        return;
      }
      if (annotating) toggleAnnotating();
    });

    document.addEventListener('storybook:story-rendered', () => {
      if (annotating) annRenderAll();
    });
  }

  function init() {
    shell = initStorybookShell(pageConfig, {
      sidebarRootSelector: '#sidebarRoot',
      mainRootSelector: '#mainRoot',
      gridButtonSelector: '#gridToggle',
    });
    bindEvents();
    annUpdateBadge();
    initPresentation('.slide');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
