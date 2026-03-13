(function () {
  let pageConfig = null;
  let storyMap = new Map();
  let storyState = new Map();
  let gridEnabled = false;
  let sidebarObserver = null;
  let _overrides = {};

  function getStory(storyId) {
    return storyMap.get(storyId);
  }

  function cloneInitialState(initialState) {
    if (!initialState) return {};
    return typeof initialState === 'function'
      ? structuredClone(initialState())
      : structuredClone(initialState);
  }

  const PAGE_NAV = [
    { label: 'New chat', href: '/chat.html' },
    { label: 'Templates', href: '/templates.html' },
    { label: 'Components', href: '/components.html' },
  ];

  function renderPageNav() {
    const currentPath = location.pathname.replace(/\/$/, '') || '/templates.html';
    return `<nav class="page-nav">
      <div style="font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:1.5px; color:#555; padding:0 0 8px;">Design System</div>
      ${PAGE_NAV.map((p) => {
        const isActive = currentPath === p.href || (currentPath === '/' && p.href === '/templates.html');
        return `<a class="page-nav-link${isActive ? ' active' : ''}" href="${p.href}"><span class="page-nav-dot"></span>${p.label}</a>`;
      }).join('')}</nav>`;
  }

  function renderSidebar(root) {
    root.innerHTML = `
      ${renderPageNav()}
      <div class="sidebar-title"><span>${pageConfig.title}</span><button type="button" id="gridToggle" class="sidebar-grid-btn">Grid</button></div>
      ${pageConfig.navGroups.map((group) => {
        const storyLinks = (group.storyIds || []).map((storyId) => {
          const story = getStory(storyId);
          return `<a class="sidebar-item" href="#${story.id}">${story.title}</a>`;
        }).join('');
        const externalLinks = (group.links || []).map((link) => {
          const externalClass = link.external ? ' external' : '';
          return `<a class="sidebar-item${externalClass}" href="${link.href}">${link.label}</a>`;
        }).join('');
        return `
          <div class="sidebar-group">${group.label}</div>
          ${storyLinks}${externalLinks}`;
      }).join('')}`;
  }

  function renderStorySection(story) {
    const tag = story.tag ? `<div class="story-tag${story.tagClass ? ` ${story.tagClass}` : ''}">${story.tag}</div>` : '';
    return `
      <div class="story" id="${story.id}">
        <div class="story-header">
          <div class="story-title">${story.title}</div>
          ${tag}
        </div>
        <div class="story-desc">${story.desc}</div>
        <div class="chips" data-story-controls="${story.id}"></div>
        <div class="slide">
          <div class="slide-inner bg-warning" data-story-slide="${story.id}"></div>
        </div>
        <div class="story-label" data-story-label="${story.id}"></div>
      </div>`;
  }

  function renderMain(root) {
    root.innerHTML = pageConfig.stories.map(renderStorySection).join('');
  }

  function createControlGroup(storyId, control, state) {
    const activeValue = state[control.key];
    return `
      <div class="chip-group" data-story="${storyId}" data-control="${control.key}">
        ${control.options.map((option, index) => {
          const isActive = String(activeValue ?? control.defaultValue ?? control.options[0]?.value) === String(option.value);
          const activeClass = isActive ? ' active' : '';
          const buttonType = index === 0 ? 'button' : 'button';
          return `<button type="${buttonType}" class="chip${activeClass}" data-story="${storyId}" data-control="${control.key}" data-value="${option.value}">${option.label}</button>`;
        }).join('')}
      </div>`;
  }

  function renderControls(storyId) {
    const story = getStory(storyId);
    const state = storyState.get(storyId);
    const controlsHost = document.querySelector(`[data-story-controls="${storyId}"]`);
    if (!controlsHost) return;

    const controls = story.getControls ? story.getControls(state) : [];
    const visible = controls.filter((control) => control.visible !== false);

    // Group by row (default row 1)
    const rows = new Map();
    for (const control of visible) {
      const row = control.row || 1;
      if (!rows.has(row)) rows.set(row, []);
      rows.get(row).push(control);
    }

    let html = '';
    for (const [row, ctrls] of [...rows.entries()].sort((a, b) => a[0] - b[0])) {
      const groups = ctrls.map((c) => createControlGroup(storyId, c, state)).join('');
      if (row === 1) {
        html += groups;
      } else {
        html += `<div class="chips-row-end">${groups}</div>`;
      }
    }
    controlsHost.innerHTML = html;

    // Set --chips-row-width from the first chip-group's row width
    if (rows.size > 1) {
      requestAnimationFrame(() => {
        const firstGroup = controlsHost.querySelector('.chip-group');
        if (firstGroup) {
          // Measure total width of all row-1 chip groups
          const row1Groups = [...controlsHost.children].filter(c => !c.classList.contains('chips-row-end'));
          if (row1Groups.length) {
            const last = row1Groups[row1Groups.length - 1];
            const width = last.offsetLeft - controlsHost.offsetLeft + last.offsetWidth;
            controlsHost.style.setProperty('--chips-row-width', width + 'px');
          }
        }
      });
    }
  }

  function createGridOverlay() {
    return document.getElementById('grid-tpl').content.cloneNode(true);
  }

  function _overrideKey(storyId, state) {
    const keys = Object.keys(state || {}).sort();
    const statePart = keys.map(k => `${k}=${state[k]}`).join(',');
    return statePart ? `${storyId}:${statePart}` : storyId;
  }

  function _applyOverrides(slide, storyId, state) {
    const key = _overrideKey(storyId, state);
    const map = _overrides[key];
    if (!map) return;
    for (const [selector, text] of Object.entries(map)) {
      const el = slide.querySelector(selector);
      if (el) el.textContent = text;
    }
  }

  function renderStory(storyId) {
    const story = getStory(storyId);
    if (!story) return;

    const state = storyState.get(storyId);
    renderControls(storyId);

    const result = story.render(state);
    const slide = document.querySelector(`[data-story-slide="${storyId}"]`);
    const label = document.querySelector(`[data-story-label="${storyId}"]`);
    if (!slide || !label) return;

    slide.className = `slide-inner ${result.bg || 'bg-warning'}`;
    slide.innerHTML = result.html;
    _applyOverrides(slide, storyId, state);
    slide.appendChild(createGridOverlay());
    if (gridEnabled) {
      slide.querySelector('.grid-overlay')?.classList.add('visible');
    }
    label.textContent = result.label || '';

    if (typeof result.afterRender === 'function') {
      result.afterRender(slide, state);
    }

    document.dispatchEvent(new CustomEvent('storybook:story-rendered', {
      detail: { storyId, state: structuredClone(state) },
    }));
  }

  function renderAllStories() {
    pageConfig.stories.forEach((story) => renderStory(story.id));
    document.dispatchEvent(new CustomEvent('storybook:all-rendered'));
  }

  function bindControls() {
    document.addEventListener('click', (event) => {
      const chip = event.target.closest('.chip[data-story][data-control][data-value]');
      if (!chip) return;

      const { story: storyId, control, value } = chip.dataset;
      const state = storyState.get(storyId);
      if (!state || state[control] === value) return;

      state[control] = value;
      renderStory(storyId);
    });
  }

  function bindSidebar() {
    const items = document.querySelectorAll('.sidebar-item[href^="#"]');
    const stories = document.querySelectorAll('.story');

    sidebarObserver?.disconnect();
    sidebarObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        items.forEach((item) => item.classList.remove('active'));
        const link = document.querySelector(`.sidebar-item[href="#${entry.target.id}"]`);
        link?.classList.add('active');
      });
    }, { rootMargin: '-20% 0px -70% 0px' });

    stories.forEach((story) => sidebarObserver.observe(story));

    items.forEach((item) => {
      item.addEventListener('click', (event) => {
        event.preventDefault();
        const target = document.querySelector(item.getAttribute('href'));
        target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  function setGridEnabled(nextValue) {
    gridEnabled = nextValue;
    document.querySelectorAll('.grid-overlay').forEach((overlay) => {
      overlay.classList.toggle('visible', gridEnabled);
    });
  }

  function bindGridButton(button) {
    if (!button) return;
    button.addEventListener('click', () => {
      const nextValue = !gridEnabled;
      button.classList.toggle('active', nextValue);
      setGridEnabled(nextValue);
    });
  }

  async function init(page, options) {
    pageConfig = page;
    storyMap = new Map(page.stories.map((story) => [story.id, story]));
    storyState = new Map(page.stories.map((story) => [story.id, cloneInitialState(story.initialState)]));

    // Load text overrides
    try {
      const resp = await fetch('/edit-storybook');
      if (resp.ok) {
        const text = await resp.text();
        if (text && text[0] === '{') _overrides = JSON.parse(text);
      }
    } catch {}

    const sidebarRoot = document.querySelector(options.sidebarRootSelector);
    const mainRoot = document.querySelector(options.mainRootSelector);
    if (!sidebarRoot || !mainRoot) {
      throw new Error('Storybook shell root elements are missing.');
    }

    renderSidebar(sidebarRoot);
    renderMain(mainRoot);
    bindSidebar();
    bindControls();
    bindGridButton(document.querySelector(options.gridButtonSelector));
    renderAllStories();

    return {
      renderStory,
      renderAllStories,
      getState(storyId) {
        return structuredClone(storyState.get(storyId));
      },
      setState(storyId, nextState) {
        storyState.set(storyId, structuredClone(nextState));
        renderStory(storyId);
      },
      setGridEnabled,
      isGridEnabled() {
        return gridEnabled;
      },
      stories: page.stories.map((story) => story.id),
      overrideKey: _overrideKey,
    };
  }

  window.initStorybookShell = init;
})();
