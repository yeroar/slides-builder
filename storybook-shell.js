(function () {
  let pageConfig = null;
  let storyMap = new Map();
  let storyState = new Map();
  let gridEnabled = false;
  let sidebarObserver = null;

  function getStory(storyId) {
    return storyMap.get(storyId);
  }

  function cloneInitialState(initialState) {
    if (!initialState) return {};
    return typeof initialState === 'function'
      ? structuredClone(initialState())
      : structuredClone(initialState);
  }

  function renderSidebar(root) {
    root.innerHTML = `
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
    controlsHost.innerHTML = controls
      .filter((control) => control.visible !== false)
      .map((control) => createControlGroup(storyId, control, state))
      .join('');
  }

  function createGridOverlay() {
    return document.getElementById('grid-tpl').content.cloneNode(true);
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

  function init(page, options) {
    pageConfig = page;
    storyMap = new Map(page.stories.map((story) => [story.id, story]));
    storyState = new Map(page.stories.map((story) => [story.id, cloneInitialState(story.initialState)]));

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
    };
  }

  window.initStorybookShell = init;
})();
