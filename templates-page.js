(function () {
  const ANN_KEY = 'templates-annotations';
  let shell = null;
  let annotating = false;
  let multiAnn = [];
  let overlapActive = false;

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
    if (total > 0) {
      badge.textContent = total;
      badge.classList.add('visible');
      title.textContent = `Notes (${total})`;
      return;
    }

    badge.classList.remove('visible');
    title.textContent = 'Notes';
  }

  function annIdentify(target, storyEl) {
    const parts = [];
    let current = target;
    while (current && current !== storyEl) {
      let segment = current.tagName ? current.tagName.toLowerCase() : '';
      const skip = new Set(['story', 'story-header', 'story-desc', 'variants', 'variant', 'row']);
      const classes = [...(current.classList || [])].filter((className) => !skip.has(className) && !className.startsWith('ann-'));
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
    const classes = [...(target.classList || [])].filter((className) => !className.startsWith('ann-')).join(' ');
    return { selector, text, classes };
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
        marker.title = (pin.classes || pin.selector || '') + (pin.note ? `\n${pin.note}` : '');
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

        const label = pin.classes || pin.selector?.split(' > ').pop() || 'element';
        if (pin.classes) {
          const element = document.createElement('span');
          element.className = 'ann-note-el';
          element.textContent = label;
          body.appendChild(element);
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
        const element = pin.classes || pin.selector?.split(' > ').pop() || '';
        text += `  ${index + 1}. [${element}] ${pin.note || '(no note)'}`;
        if (pin.elText) text += ` — "${pin.elText}"`;
        text += '\n';
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
  }

  function getSlideElements(slideInner) {
    const elements = [];
    const walk = (node, depth) => {
      if (!node || !node.getBoundingClientRect) return;
      if (node.classList && (
        node.classList.contains('grid-overlay') ||
        node.classList.contains('overlap-marker') ||
        node.classList.contains('ann-pin')
      )) return;

      const style = getComputedStyle(node);
      if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return;

      const isLeaf = node.children.length === 0 ||
        node.classList.contains('footer') ||
        node.classList.contains('stat-cell') ||
        node.classList.contains('img-placeholder') ||
        node.classList.contains('section-item') ||
        node.classList.contains('slot-quarter-img') ||
        node.classList.contains('feature-card-noimg');

      if (isLeaf && node !== slideInner) {
        const rect = node.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) elements.push({ node, rect });
        return;
      }

      if (depth > 0 && node !== slideInner && (
        style.position === 'absolute' ||
        node.classList.contains('content-1col') ||
        node.classList.contains('content-2col') ||
        node.classList.contains('content-3col') ||
        node.classList.contains('content-4col') ||
        node.classList.contains('footer') ||
        node.classList.contains('start-title') ||
        node.classList.contains('end-text')
      )) {
        const rect = node.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) elements.push({ node, rect });
      }

      for (const child of node.children) walk(child, depth + 1);
    };

    walk(slideInner, 0);
    return elements;
  }

  function rectsOverlap(a, b) {
    return !(a.right <= b.left || a.left >= b.right || a.bottom <= b.top || a.top >= b.bottom);
  }

  function overlapArea(a, b) {
    const width = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
    const height = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
    return width * height;
  }

  function checkOverlaps() {
    document.querySelectorAll('.overlap-marker').forEach((marker) => marker.remove());
    let totalOverlaps = 0;

    document.querySelectorAll('.slide-inner').forEach((slideInner) => {
      const slide = slideInner.parentElement;
      const slideRect = slide.getBoundingClientRect();
      const blocks = [];

      for (const child of slideInner.children) {
        if (child.classList.contains('grid-overlay') || child.classList.contains('overlap-marker')) continue;
        const rect = child.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) blocks.push({ node: child, rect });
      }

      for (let i = 0; i < blocks.length; i += 1) {
        for (let j = i + 1; j < blocks.length; j += 1) {
          const a = blocks[i];
          const b = blocks[j];
          if (!rectsOverlap(a.rect, b.rect)) continue;

          const area = overlapArea(a.rect, b.rect);
          const minArea = Math.min(a.rect.width * a.rect.height, b.rect.width * b.rect.height);
          const pct = area / minArea * 100;
          if (pct < 5) continue;

          totalOverlaps += 1;

          const marker = document.createElement('div');
          marker.className = 'overlap-marker';
          marker.style.left = `${Math.max(a.rect.left, b.rect.left) - slideRect.left}px`;
          marker.style.top = `${Math.max(a.rect.top, b.rect.top) - slideRect.top}px`;
          marker.style.width = `${Math.min(a.rect.right, b.rect.right) - Math.max(a.rect.left, b.rect.left)}px`;
          marker.style.height = `${Math.min(a.rect.bottom, b.rect.bottom) - Math.max(a.rect.top, b.rect.top)}px`;

          const badge = document.createElement('div');
          badge.className = 'overlap-badge';
          badge.textContent = `${Math.round(pct)}% overlap`;
          marker.appendChild(badge);
          slide.appendChild(marker);
        }
      }
    });

    return totalOverlaps;
  }

  function toggleOverlap() {
    const button = document.getElementById('overlapToggle');
    overlapActive = !overlapActive;
    button.classList.toggle('active', overlapActive);

    if (overlapActive) {
      const count = checkOverlaps();
      button.textContent = count > 0 ? `Overlap (${count})` : 'Overlap (0)';
      return;
    }

    document.querySelectorAll('.overlap-marker').forEach((marker) => marker.remove());
    button.textContent = 'Overlap';
  }

  function bindEvents() {
    document.getElementById('annFab').addEventListener('click', toggleAnnotating);
    document.getElementById('copyNotesButton').addEventListener('click', copyAllNotes);
    document.getElementById('clearNotesButton').addEventListener('click', clearAllAnnotations);
    document.getElementById('annMultiAdd').addEventListener('click', commitMultiAnn);
    document.getElementById('annMultiCancel').addEventListener('click', clearMultiAnn);
    document.getElementById('annMultiInput').addEventListener('keydown', (event) => {
      if (event.key === 'Enter') commitMultiAnn();
    });
    document.getElementById('overlapToggle').addEventListener('click', toggleOverlap);

    document.addEventListener('click', (event) => {
      if (!annotating) return;
      if (event.target.closest('.sidebar') || event.target.closest('.ann-fab') || event.target.closest('.ann-panel') || event.target.closest('.toolbar')) return;

      const storyEl = event.target.closest('.story');
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
      const storyEl = event.target.closest('.story');
      if (!storyEl || event.target === storyEl || event.target.classList.contains('ann-pin')) return;
      if (event.target.closest('.sidebar') || event.target.closest('.ann-panel')) return;
      event.target.classList.add('ann-hover');
    });

    document.addEventListener('mouseout', (event) => {
      if (event.target.classList) event.target.classList.remove('ann-hover');
    });

    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape') return;
      if (multiAnn.length > 0) {
        clearMultiAnn();
        return;
      }
      if (annotating) toggleAnnotating();
    });

    document.addEventListener('storybook:story-rendered', () => {
      if (overlapActive) {
        setTimeout(() => {
          const count = checkOverlaps();
          document.getElementById('overlapToggle').textContent = count > 0 ? `Overlap (${count})` : 'Overlap (0)';
        }, 50);
      }
      if (annotating) annRenderAll();
    });
  }

  function init() {
    shell = initStorybookShell(window.TEMPLATE_PAGE, {
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
