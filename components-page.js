(function () {
  const F = footerHTML('Presentation title', '&copy; Company 2026', '5');

  // ── Primitives ──

  function renderLine(variant) {
    const cls = variant === 'accent' ? 'line-accent' : 'line-default';
    return `<div class="line ${cls}" style="width:105px;"></div>`;
  }

  function renderBullet(text, variant) {
    const cls = variant === 'accent' ? 'line-accent' : 'line-default';
    const textCls = variant === 'accent' ? 'c-accent' : 'c-disabled';
    return `<div class="bullet"><div class="line ${cls}"></div><div class="h1 ${textCls}">${text}</div></div>`;
  }

  function renderSection(text, variant) {
    const cls = variant === 'accent' ? '' : ' active';
    const color = variant === 'accent' ? 'color: var(--face-primary);' : 'color: var(--face-disabled);';
    return `<div style="font-size:128px; line-height:120px; font-weight:400; letter-spacing:-2.56px; ${color}">${text}</div>`;
  }

  function renderFooter() {
    return `<div class="footer" style="position:relative; bottom:auto; left:auto;">
      <span class="footer-title">Presentation title</span>
      <span class="footer-copy">&copy; Fold Holdings, Inc. 2026</span>
      <span class="footer-page">5</span>
    </div>`;
  }

  // ── Typography ──

  const TYPO_SCALE = [
    { cls: 'h1', label: 'H1', spec: '128/120 Regular', sample: 'Pack my box with five dozen liquor jugs' },
    { cls: 'h2', label: 'H2', spec: '88/80 Regular', sample: 'Pack my box with five dozen liquor jugs' },
    { cls: 'h3', label: 'H3', spec: '64/64 Regular', sample: 'Pack my box with five dozen liquor jugs' },
    { cls: 'h4', label: 'H4', spec: '48/48 Regular', sample: 'Pack my box with five dozen liquor jugs' },
    { cls: 'h5', label: 'H5', spec: '32/32 Regular', sample: 'Pack my box with five dozen liquor jugs' },
    { cls: 'h6', label: 'H6', spec: '24/24 Medium', sample: 'Pack my box with five dozen liquor jugs' },
    { cls: 'p1', label: 'P1', spec: '21/24 Regular', sample: 'Pack my box with five dozen liquor jugs' },
    { cls: 'p2', label: 'P2', spec: '16/20 Regular', sample: 'Pack my box with five dozen liquor jugs' },
    { cls: 'p3', label: 'P3', spec: '12/16 Regular', sample: 'Pack my box with five dozen liquor jugs' },
    { cls: 'p5', label: 'P5', spec: '10/12 Medium', sample: 'Pack my box with five dozen liquor jugs' },
  ];

  // ── Color tokens ──

  // ── Color primitives (from Figma tokenColors.ts) ──
  const COLOR_SCALES = {
    yellow: [
      { step: '000', hex: '#FFF6D4' }, { step: '100', hex: '#FFEC9D' }, { step: '200', hex: '#FFE466' },
      { step: '300', hex: '#FFDD33' }, { step: '400', hex: '#E8BE11' }, { step: '500', hex: '#D1A300' },
      { step: '600', hex: '#BA8D00' }, { step: '700', hex: '#936B00' }, { step: '800', hex: '#6C4C00' },
      { step: '900', hex: '#462F00' }, { step: '1000', hex: '#1F1400' },
    ],
    red: [
      { step: '000', hex: '#FFEBEB' }, { step: '100', hex: '#FFD9D9' }, { step: '200', hex: '#FFA4A3' },
      { step: '300', hex: '#FF8A87' }, { step: '400', hex: '#FF716B' }, { step: '500', hex: '#FF594F' },
      { step: '600', hex: '#FF4133' }, { step: '700', hex: '#C7281B' }, { step: '800', hex: '#8F140A' },
      { step: '900', hex: '#570701' }, { step: '1000', hex: '#1F0200' },
    ],
    green: [
      { step: '000', hex: '#DAFFEA' }, { step: '100', hex: '#A4EFC7' }, { step: '200', hex: '#74DEAC' },
      { step: '300', hex: '#4BCE97' }, { step: '400', hex: '#31BE84' }, { step: '500', hex: '#1FAE73' },
      { step: '600', hex: '#0F9E63' }, { step: '700', hex: '#007E4C' }, { step: '800', hex: '#005E39' },
      { step: '900', hex: '#003F25' }, { step: '1000', hex: '#001F12' },
    ],
    blue: [
      { step: '000', hex: '#E6F7FF' }, { step: '100', hex: '#C9ECFF' }, { step: '200', hex: '#ABDFFF' },
      { step: '300', hex: '#8DCFFF' }, { step: '400', hex: '#6EBCFF' }, { step: '500', hex: '#4FA8FF' },
      { step: '600', hex: '#2F91FF' }, { step: '700', hex: '#0066FF' }, { step: '800', hex: '#084DB4' },
      { step: '900', hex: '#093169' }, { step: '1000', hex: '#040F1F' },
    ],
    gray: [
      { step: '000', hex: '#FCFAF2' }, { step: '100', hex: '#ECE7D8' }, { step: '200', hex: '#DBD4BF' },
      { step: '300', hex: '#CBC2A8' }, { step: '400', hex: '#BBAF93' }, { step: '500', hex: '#AB9E81' },
      { step: '600', hex: '#9A8C70' }, { step: '700', hex: '#7A6E53' }, { step: '800', hex: '#59503A' },
      { step: '900', hex: '#383323' }, { step: '1000', hex: '#17150E' },
    ],
  };

  const SEMANTIC_TOKENS = {
    face: [
      { name: 'primary', from: 'gray.900', hex: '#383323' },
      { name: 'secondary', from: 'gray.800', hex: '#59503A' },
      { name: 'tertiary', from: 'gray.700', hex: '#7A6E53' },
      { name: 'disabled', from: 'gray.400', hex: '#BBAF93' },
      { name: 'inversePrimary', from: 'gray.000', hex: '#FCFAF2' },
      { name: 'inverseSecondary', from: 'gray.200', hex: '#DBD4BF' },
      { name: 'inverseTertiary', from: 'gray.300', hex: '#CBC2A8' },
      { name: 'accentBold', from: 'blue.700', hex: '#0066FF' },
      { name: 'negativeBold', from: 'red.700', hex: '#C7281B' },
      { name: 'positiveBold', from: 'green.700', hex: '#007E4C' },
    ],
    layer: [
      { name: 'background', from: 'gray.000', hex: '#FCFAF2' },
      { name: 'brand', from: 'yellow.300', hex: '#FFDD33' },
      { name: 'primary', from: 'grayAlpha.100', hex: 'rgba(236,231,216,0.24)' },
      { name: 'warningSubtle', from: 'yellow.000', hex: '#FFF6D4' },
    ],
    object: [
      { name: 'primary.bold', from: 'yellow.300', hex: '#FFDD33' },
      { name: 'primary.subtle', from: 'yellow.100', hex: '#FFEC9D' },
      { name: 'secondary', from: 'gray.100', hex: '#ECE7D8' },
      { name: 'accent.bold', from: 'blue.600', hex: '#2F91FF' },
      { name: 'accent.subtle', from: 'blue.000', hex: '#E6F7FF' },
      { name: 'negative.bold', from: 'red.600', hex: '#FF4133' },
      { name: 'positive.bold', from: 'green.500', hex: '#1FAE73' },
      { name: 'inverse', from: 'gray.1000', hex: '#17150E' },
      { name: 'disabled', from: 'grayAlpha.300', hex: 'rgba(203,194,168,0.24)' },
    ],
    border: [
      { name: 'primary', from: 'yellow.400', hex: '#E8BE11' },
      { name: 'secondary', from: 'gray.200', hex: '#DBD4BF' },
      { name: 'tertiary', from: 'gray.100', hex: '#ECE7D8' },
      { name: 'focused', from: 'blue.700', hex: '#0066FF' },
      { name: 'negative', from: 'red.700', hex: '#C7281B' },
      { name: 'positive', from: 'green.700', hex: '#007E4C' },
    ],
  };

  // ── Stories ──

  window.COMPONENTS_PAGE = {
    title: 'Components',
    navGroups: [
      { label: 'Foundations', storyIds: ['colors', 'typography'] },
      { label: 'Primitives', storyIds: ['bullet-section', 'footer-prim'] },
      { label: 'Layout', storyIds: ['stat-cell', 'feature-card', 'var-card', 'logo-card'] },
      { label: 'Compositions', storyIds: ['proof-comp', 'compare-comp', 'data-table-comp'] },
      { label: 'Pages', links: [
        { label: 'Templates', href: '/templates.html', external: true },
        { label: 'Credit Card', href: '/examples/credit-card.html', external: true },
      ] },
    ],
    stories: [
      // ──────── Colors ────────
      {
        id: 'colors',
        title: 'Color tokens',
        tag: 'foundation',
        desc: 'Full color system: 5 primitive scales (000–1000) and 4 semantic token categories.',
        initialState: { view: 'yellow' },
        getControls() {
          return [{
            key: 'view',
            options: [
              { value: 'yellow', label: 'Yellow' },
              { value: 'red', label: 'Red' },
              { value: 'green', label: 'Green' },
              { value: 'blue', label: 'Blue' },
              { value: 'gray', label: 'Gray' },
              { value: 'face', label: 'Face' },
              { value: 'layer', label: 'Layer' },
              { value: 'object', label: 'Object' },
              { value: 'border', label: 'Border' },
            ],
          }];
        },
        render(state) {
          const v = state.view;
          // Primitive scale
          if (COLOR_SCALES[v]) {
            const scale = COLOR_SCALES[v];
            const swatches = scale.map(c => {
              const lightText = parseInt(c.step) >= 500;
              const textColor = lightText ? '#FCFAF2' : '#383323';
              return `<div style="display:flex; align-items:center; gap:0; height:84px;">
                <div style="width:84px; height:84px; border-radius:8px; background:${c.hex}; flex-shrink:0; display:flex; align-items:center; justify-content:center;">
                  <span style="font-size:12px; font-weight:500; color:${textColor};">${c.step}</span>
                </div>
                <div style="display:flex; flex-direction:column; gap:2px; padding-left:16px;">
                  <div class="h6 c-primary">${v}.${c.step}</div>
                  <div class="p3 c-tertiary">${c.hex}</div>
                </div>
              </div>`;
            }).join('');
            return {
              bg: 'bg-warning',
              label: `Color primitives — ${v} scale (11 steps)`,
              html: `<div style="position:absolute; top:64px; left:64px; right:64px; bottom:64px; display:grid; grid-template-columns:1fr 1fr; gap:12px 64px; align-content:start;">${swatches}</div>`,
            };
          }
          // Semantic tokens
          const tokens = SEMANTIC_TOKENS[v] || [];
          const swatches = tokens.map(t => {
            const isLight = ['#FCFAF2', '#FFF6D4', '#FFDD33', '#FFE466', '#FFEC9D', '#E6F7FF', '#ECE7D8', '#DBD4BF', '#CBC2A8'].includes(t.hex);
            const textColor = isLight ? '#383323' : '#FCFAF2';
            return `<div style="display:flex; align-items:center; gap:0; height:72px;">
              <div style="width:72px; height:72px; border-radius:8px; background:${t.hex}; flex-shrink:0; display:flex; align-items:center; justify-content:center; border:1px solid rgba(0,0,0,0.08);"></div>
              <div style="display:flex; flex-direction:column; gap:2px; padding-left:16px;">
                <div class="h6 c-primary">${v}.${t.name}</div>
                <div class="p3 c-tertiary">${t.hex} · ${t.from}</div>
              </div>
            </div>`;
          }).join('');
          return {
            bg: 'bg-warning',
            label: `Semantic tokens — ${v} (${tokens.length} tokens)`,
            html: `<div style="position:absolute; top:64px; left:64px; right:64px; bottom:64px; display:grid; grid-template-columns:1fr 1fr; gap:16px 64px; align-content:start;">${swatches}</div>`,
          };
        },
      },
      // ──────── Typography ────────
      {
        id: 'typography',
        title: 'Type scale',
        tag: 'foundation',
        desc: 'The 10-level type scale with Geist. Each level has a fixed role in the design system.',
        initialState: { variant: 'scale' },
        getControls() {
          return [{
            key: 'variant',
            options: [
              { value: 'scale', label: 'Scale' },
              { value: 'weights', label: 'Weights' },
              { value: 'colors', label: 'Colors' },
            ],
          }];
        },
        render(state) {
          if (state.variant === 'weights') {
            const weights = [
              { w: 400, label: 'Regular 400', sample: 'The quick brown fox jumps over the lazy dog' },
              { w: 500, label: 'Medium 500', sample: 'The quick brown fox jumps over the lazy dog' },
              { w: 600, label: 'SemiBold 600', sample: 'The quick brown fox jumps over the lazy dog' },
            ];
            const html = weights.map(w =>
              `<div style="display:flex; flex-direction:column; gap:16px;">
                <div class="p3 c-tertiary">${w.label}</div>
                <div class="h4 c-primary" style="font-weight:${w.w};">${w.sample}</div>
              </div>`
            ).join('<div style="height:48px;"></div>');
            return {
              bg: 'bg-warning',
              label: 'Font weights — Regular, Medium, SemiBold',
              html: `<div style="position:absolute; top:64px; left:64px; width:1792px; display:flex; flex-direction:column;">${html}</div>${F}`,
            };
          }
          if (state.variant === 'colors') {
            const textColors = [
              { cls: 'c-primary', label: 'face.primary', desc: 'Main text, headings' },
              { cls: 'c-secondary', label: 'face.secondary', desc: 'Subtitle, body text' },
              { cls: 'c-tertiary', label: 'face.tertiary', desc: 'Author names, card titles, disclaimers' },
              { cls: 'c-disabled', label: 'face.disabled', desc: 'Inactive items' },
              { cls: 'c-yellow', label: 'yellow.500', desc: 'Accent highlights, labels' },
              { cls: 'c-accent', label: 'face.accentBold', desc: 'Active bullet, accent line' },
            ];
            const html = textColors.map(c =>
              `<div style="display:flex; align-items:baseline; gap:24px;">
                <div class="p3 c-tertiary" style="width:200px; flex-shrink:0;">${c.label}</div>
                <div class="h4 ${c.cls}">Pack my box with five dozen liquor jugs</div>
              </div>`
            ).join('<div style="height:32px;"></div>');
            return {
              bg: 'bg-warning',
              label: 'Text colors — 6 semantic roles',
              html: `<div style="position:absolute; top:64px; left:64px; width:1792px; display:flex; flex-direction:column;">${html}</div>${F}`,
            };
          }
          // Default: scale
          const html = TYPO_SCALE.map(t =>
            `<div style="display:flex; align-items:baseline; gap:24px;">
              <div class="p3 c-tertiary" style="white-space:nowrap; flex-shrink:0; width:200px;">${t.label} · ${t.spec}</div>
              <div class="${t.cls} c-primary" style="white-space:nowrap; text-wrap:nowrap;">${t.sample}</div>
            </div>`
          ).join('<div style="height:16px;"></div>');
          return {
            bg: 'bg-warning',
            label: 'Type scale — H1 through P5, 10 levels',
            html: `<div style="position:absolute; top:64px; left:64px; right:64px; bottom:64px; display:flex; align-items:flex-start;"><div style="width:1792px; display:flex; flex-direction:column;">${html}</div></div>${F}`,
          };
        },
      },
      // ──────── Line ────────
      {
        id: 'bullet-section',
        title: 'Bullet / Section',
        tag: 'primitive',
        tagClass: 'template',
        desc: 'Agenda list items. Line = decorative dash, Bullet = line + H1, Section = plain H1.',
        initialState: { style: 'bullet' },
        getControls(state) {
          return [{
            key: 'style',
            options: [
              { value: 'bullet', label: 'Bullet' },
              { value: 'section', label: 'Section' },
            ],
          }];
        },
        render(state) {
          if (state.style === 'section') {
            return {
              bg: 'bg-warning',
              label: 'Section — active + inactive items',
              html: `
                <div style="position:absolute; top:64px; left:64px; width:1760px; display:flex; flex-direction:column;">
                  <div class="section-slot">
                    <div class="section-item">Introduction</div>
                    <div class="section-item active">Market Analysis</div>
                    <div class="section-item">Product Strategy</div>
                    <div class="section-item">Financial Overview</div>
                  </div>
                </div>
                ${F}`,
            };
          }
          if (state.style === 'line') {
            return {
              bg: 'bg-warning',
              label: 'Line — accent + default variants',
              html: `
                <div style="position:absolute; top:64px; left:64px; display:flex; flex-direction:column; gap:48px; width:1792px;">
                  <div style="display:flex; flex-direction:column; gap:16px;">
                    <div class="p3 c-tertiary">Accent (blue)</div>
                    ${renderLine('accent')}
                  </div>
                  <div style="display:flex; flex-direction:column; gap:16px;">
                    <div class="p3 c-tertiary">Default (gray)</div>
                    ${renderLine('default')}
                  </div>
                  <div style="display:flex; flex-direction:column; gap:16px;">
                    <div class="p3 c-tertiary">Custom widths</div>
                    <div style="display:flex; gap:24px; align-items:center;">
                      <div class="line line-accent" style="width:50px;"></div>
                      <div class="line line-accent" style="width:105px;"></div>
                      <div class="line line-accent" style="width:200px;"></div>
                      <div class="line line-accent" style="width:400px;"></div>
                    </div>
                  </div>
                </div>
                ${F}`,
            };
          }
          return {
            bg: 'bg-warning',
            label: 'Bullet — accent + default variants',
            html: `
              <div style="position:absolute; top:64px; left:64px; width:1760px; display:flex; flex-direction:column; gap:12px;">
                ${renderBullet('Introduction', 'accent')}
                ${renderBullet('Market Analysis', 'default')}
                ${renderBullet('Product Strategy', 'default')}
                ${renderBullet('Next Steps', 'default')}
              </div>
              ${F}`,
          };
        },
      },
      // ──────── Footer ────────
      {
        id: 'footer-prim',
        title: 'Footer',
        tag: 'primitive',
        tagClass: 'template',
        desc: '3-column footer: title | copyright | page number. P5 10/12 Medium, gray-alpha-900.',
        initialState: {},
        render() {
          return {
            bg: 'bg-warning',
            label: 'Footer — 3-column with title, copyright, page',
            html: `
              <div style="position:absolute; top:64px; left:64px; width:1792px; display:flex; flex-direction:column; gap:64px;">
                <div style="display:flex; flex-direction:column; gap:16px;">
                  <div class="p3 c-tertiary">Default footer</div>
                  <div style="background:var(--layer-background); padding:24px; border-radius:8px;">
                    ${renderFooter()}
                  </div>
                </div>
                <div style="display:flex; flex-direction:column; gap:16px;">
                  <div class="p3 c-tertiary">In-slide position (bottom, y=1041)</div>
                  <div class="p2 c-secondary">Footer is always positioned at absolute bottom of content slides. Width: 1792px. Not used on Start/End slides.</div>
                </div>
              </div>
              ${F}`,
          };
        },
      },
      // ──────── Stat Cell ────────
      {
        id: 'stat-cell',
        title: 'Statistics',
        tag: 'component',
        tagClass: 'composition',
        desc: 'Yellow stat cards in 3 grid layouts: 2x1 (H1), 2x2 (H1), 3x1 (H2). With stats header zone.',
        initialState: { variant: '2x1' },
        getControls() {
          return [{
            key: 'variant',
            options: [
              { value: '2x1', label: '2×1' },
              { value: '2x2', label: '2×2' },
              { value: '3x1', label: '3×1' },
            ],
          }];
        },
        render(state) {
          const footer = footerHTML('Title', '&copy; Company', '5');
          if (state.variant === '2x2') {
            const grid = `
              <div class="stat-grid-row">${statCell('Stat title', '$2.08T', 0, 0, 'h1')}${statCell('Stat title', '65M', 0, 0, 'h1')}</div>
              <div class="stat-grid-row">${statCell('Stat title', '$324.5B', 0, 0, 'h1')}${statCell('Stat title', '$200B+', 0, 0, 'h1')}</div>`;
            return {
              bg: 'bg-warning',
              label: 'Stats 2×2 — Four stat cells in 2 rows, H1 values',
              html: `<div class="stat-grid" style="position:absolute; top:64px; left:64px; right:64px; bottom:64px;">${grid}</div>${footer}`,
            };
          }
          if (state.variant === '3x1') {
            const grid = `<div class="stat-grid-3" style="flex:1;">${statCell('Stat title', 'Value', 0, 0, 'h2')}${statCell('Stat title', 'Value', 0, 0, 'h2')}${statCell('Stat title', 'Value', 0, 0, 'h2')}</div>`;
            return {
              bg: 'bg-warning',
              label: 'Stats 3×1 — Three stat cells, H2 values',
              html: `<div class="stat-grid" style="position:absolute; top:64px; left:64px; right:64px; bottom:64px;">${grid}</div>${footer}`,
            };
          }
          // 2x1
          const grid = `<div class="stat-grid-row">${statCell('Stat title', '$2.08T', 0, 0, 'h1')}${statCell('Stat title', '$111,980', 0, 0, 'h1')}</div>`;
          return {
            bg: 'bg-warning',
            label: 'Stats 2×1 — Two stat cells, H1 values',
            html: `<div class="stat-grid" style="position:absolute; top:64px; left:64px; right:64px; bottom:64px;">${grid}</div>${footer}`,
          };
        },
      },
      // ──────── Feature Card ────────
      {
        id: 'feature-card',
        title: 'Feature card',
        tag: 'component',
        tagClass: 'composition',
        desc: 'Cards for product features. Two modes: with image (img + H6 title/list) or no image (H5 title + bulleted list).',
        initialState: { variant: 'noimg' },
        getControls() {
          return [{
            key: 'variant',
            options: [
              { value: 'noimg', label: 'No image' },
              { value: 'img', label: 'With image' },
            ],
          }];
        },
        render(state) {
          const items = ['Unified REST & GraphQL', 'Real-time webhooks', '99.99% uptime SLA'];
          if (state.variant === 'img') {
            const card = (title) => `
              <div class="feature-card" style="flex:1; width:auto; height:100%;">
                <div class="feature-card-img" style="flex:1; height:auto;"></div>
                <div class="tl-featurecol">
                  <div class="h6">${title}</div>
                  <div class="list">${items.map(i => `<div class="h6 c-secondary">${i}</div>`).join('')}</div>
                </div>
              </div>`;
            return {
              bg: 'bg-warning',
              label: 'Feature Card — with image (H6 title + list)',
              html: `<div style="position:absolute; top:305px; left:64px; right:64px; bottom:64px; display:flex; gap:13px;">${card('API Platform')}${card('Security')}${card('Analytics')}</div>${F}`,
            };
          }
          const card = (title) => `
            <div class="feature-card-noimg" style="flex:1; width:auto;">
              <div class="tl-featurecol">
                <div class="h5">${title}</div>
                <div class="list">${items.map(i => `<div class="h5">${i}</div>`).join('')}</div>
              </div>
            </div>`;
          return {
            bg: 'bg-warning',
            label: 'Feature Card — no image (H5 title + bulleted list)',
            html: `<div style="position:absolute; top:305px; left:64px; right:64px; bottom:64px; display:flex; gap:13px;">${card('API Platform')}${card('Security')}${card('Analytics')}</div>${F}`,
          };
        },
      },
      // ──────── Variable Card ────────
      {
        id: 'var-card',
        title: 'Variable card / table',
        tag: 'component',
        tagClass: 'composition',
        desc: 'Side-by-side colored tables (yellow + blue) with title + grid of value cards. Always shown as a pair in a 2-column template.',
        initialState: { leftGrid: '2x3', rightGrid: '3x2' },
        getControls() {
          return [
            {
              key: 'leftGrid',
              options: [
                { value: '2x3', label: 'Left 2×3' },
                { value: '2x2', label: 'Left 2×2' },
                { value: '2x1', label: 'Left 2×1' },
              ],
            },
            {
              key: 'rightGrid',
              options: [
                { value: '3x2', label: 'Right 3×2' },
                { value: '2x2', label: 'Right 2×2' },
                { value: '2x1', label: 'Right 2×1' },
              ],
            },
          ];
        },
        render(state) {
          const yellowItems = [['Enterprise', '$4.2M'], ['Mid-market', '$2.8M'], ['SMB', '$1.5M'], ['Self-serve', '$890K'], ['Partnerships', '$620K'], ['Other', '$340K']];
          const blueItems = [['NPS score', '72'], ['Retention', '94%'], ['Avg deal size', '$48K'], ['Active users', '12.4K'], ['Expansion', '127%'], ['Time to value', '14d']];
          const bothSingleRow = state.leftGrid.endsWith('x1') && state.rightGrid.endsWith('x1');
          const top = bothSingleRow ? 'calc(37.5% + 24px)' : '64px';
          return {
            bg: 'bg-warning',
            label: `Side-by-side — yellow ${state.leftGrid} + blue ${state.rightGrid}`,
            html: `
              <div class="slot-tables-row" style="position:absolute; top:${top}; left:64px; right:64px; bottom:64px;">
                ${varTable(state.leftGrid, 'Section title', yellowItems, { color: 'yellow' })}
                ${varTable(state.rightGrid, 'Section title', blueItems, { color: 'blue' })}
              </div>
              ${footerHTML('Title', '&copy; Company', '5')}`,
          };
        },
      },
      // ──────── Logo Card ────────
      {
        id: 'logo-card',
        title: 'Logo card / partners',
        tag: 'component',
        tagClass: 'composition',
        desc: 'Logo placeholder + brand name + chip. Used in partner grid layouts. Gold border, layer/secondary bg.',
        initialState: { variant: 'grid' },
        getControls() {
          return [{
            key: 'variant',
            options: [
              { value: 'grid', label: 'Grid' },
              { value: 'lineItem', label: 'Line item' },
            ],
          }];
        },
        render(state) {
          if (state.variant === 'lineItem') {
            const brands = [
              { name: 'Burger King', desc: 'Fast food rewards partner' },
              { name: 'Target', desc: 'Retail shopping rewards' },
              { name: 'Whole Foods', desc: 'Organic grocery rewards' },
              { name: 'Nike', desc: 'Athletic apparel rewards' },
            ];
            const rows = brands.map(b =>
              `<div class="logo-line-item">
                <div class="logo-line-item-card"><div class="img-placeholder"></div></div>
                <div class="logo-line-item-body">
                  <div class="h5 c-secondary">${b.name}</div>
                  <div class="logo-line-item-body-wrap"><div class="p1 c-secondary">${b.desc}</div></div>
                </div>
              </div>`
            );
            return {
              bg: 'bg-warning',
              label: 'Logo — line item variant (image + title + description)',
              html: `
                <div style="position:absolute; top:305px; left:64px;">
                  <div class="logo-line-grid" style="height:auto;">
                    <div class="logo-line-row" style="height:170px;">${rows[0]}${rows[1]}</div>
                    <div class="logo-line-row" style="height:170px;">${rows[2]}${rows[3]}</div>
                  </div>
                </div>
                ${F}`,
            };
          }
          // Grid
          const brands = ['Burger King', 'Target', 'Whole Foods', 'Nike', 'Starbucks', 'Amazon', 'Costco', 'Uber'];
          function logoCard(name) {
            return `<div class="logo-card"><div class="logo-card-img"><div class="img-placeholder"></div></div><div class="logo-card-footer"><span class="p1 c-tertiary">${name}</span><span class="logo-chip">4% back</span></div></div>`;
          }
          return {
            bg: 'bg-warning',
            label: 'Logo — grid variant (2x4 with chips)',
            html: `
              <div style="position:absolute; top:64px; right:64px;">
                <div class="logo-grid half">
                  <div class="logo-grid-row">${logoCard(brands[0])}${logoCard(brands[1])}</div>
                  <div class="logo-grid-row">${logoCard(brands[2])}${logoCard(brands[3])}</div>
                  <div class="logo-grid-row">${logoCard(brands[4])}${logoCard(brands[5])}</div>
                  <div class="logo-grid-row">${logoCard(brands[6])}${logoCard(brands[7])}</div>
                </div>
              </div>
              ${F}`,
          };
        },
      },
      // ──────── Proof ────────
      {
        id: 'proof-comp',
        title: 'Proof layout',
        tag: 'composition',
        tagClass: 'composition',
        desc: 'Yellow panel left with narrative text + 2x2 stat grid right. For backing up claims with data.',
        initialState: {},
        render() {
          const stats = [
            { value: '20+', desc: 'Orgs trust the platform' },
            { value: '60%', desc: 'Reduction in reporting time' },
            { value: '91%', desc: 'Less manual data cleanup' },
            { value: '3.5\u00d7', desc: 'Increase in actionable insights' },
          ];
          const grid = stats.map(s =>
            `<div class="proof-stat"><div class="h1 c-primary">${s.value}</div><div class="h5 c-secondary">${s.desc}</div></div>`
          ).join('');
          return {
            bg: 'bg-warning',
            label: 'Proof — yellow panel + 2x2 stat grid',
            html: `
              <div class="proof-layout">
                <div class="proof-panel">
                  <div class="proof-panel-inner">
                    <div class="h3 c-primary">Proof and momentum</div>
                    <div class="h5 c-secondary">Our platform turns complex data into clarity, empowering teams to act faster and make lasting impact.</div>
                  </div>
                </div>
                <div class="proof-grid">${grid}</div>
              </div>
              ${footerHTML('Company', '\u00a9 2026', '6')}`,
          };
        },
      },
      // ──────── Comparison ────────
      {
        id: 'compare-comp',
        title: 'Comparison',
        tag: 'composition',
        tagClass: 'composition',
        desc: 'Two compare blocks (yellow + blue) with label and breakdown chips. For A vs B comparisons.',
        initialState: {},
        render() {
          function block(variant, label, breakdown) {
            const chipBreakdown = breakdown ? `<div class="compare-chip breakdown">${breakdown}</div>` : '';
            return `<div class="compare-block ${variant}"><div class="compare-block-content"><div class="compare-block-img"></div><div class="compare-chip label">${label}</div>${chipBreakdown}</div></div>`;
          }
          return {
            bg: 'bg-warning',
            label: 'Comparison — yellow vs blue blocks with chips',
            html: `
              <div class="content-frame">
                <div class="tl-vertical-header">
                  <div class="h4 c-primary">Overlapping geographies</div>
                  <div class="tl-vh-body">Users are evenly spread with significant overlap in key markets.</div>
                </div>
              </div>
              <div style="position:absolute; top:305px; left:64px; width:1792px; height:708px; display:flex; gap:12px; align-items:stretch;">
                ${block('yellow', 'Option A', 'Most preferred')}
                ${block('blue', 'Option B', '')}
              </div>
              ${footerHTML('Company', '\u00a9 2026', '19')}`,
          };
        },
      },
      // ──────── Data Table ────────
      {
        id: 'data-table-comp',
        title: 'Data table',
        tag: 'composition',
        tagClass: 'composition',
        desc: 'Full-width light table with header row and data rows. Highlight row for emphasis.',
        initialState: {},
        render() {
          return {
            bg: 'bg-warning',
            label: 'DataTable — full-width light table',
            html: `
              <div style="position:absolute; top:64px; left:64px;">
                <div class="h6 c-tertiary">Q1 Financial Review</div>
              </div>
              <div style="position:absolute; top:192px; left:64px; right:64px; bottom:64px; display:flex; flex-direction:column;">
                <table class="data-table" style="width:100%; height:100%; table-layout:fixed;">
                  <colgroup><col style="width:33.33%"><col style="width:16.67%"><col style="width:16.67%"><col style="width:16.67%"><col style="width:16.67%"></colgroup>
                  <thead><tr><th>Metric</th><th class="num">Q1 2026</th><th class="num">Q4 2025</th><th class="num">QoQ</th><th class="num">YoY</th></tr></thead>
                  <tbody>
                    <tr><td class="highlight">Total Revenue</td><td class="num highlight">$48.2M</td><td class="num highlight">$40.8M</td><td class="num highlight">+18%</td><td class="num highlight">+34%</td></tr>
                    <tr><td>Gross Profit</td><td class="num">$34.9M</td><td class="num">$28.8M</td><td class="num">+21%</td><td class="num">+42%</td></tr>
                    <tr><td>EBITDA</td><td class="num">$8.8M</td><td class="num">$6.4M</td><td class="num">+38%</td><td class="num">+156%</td></tr>
                    <tr><td>Net Income</td><td class="num">$6.1M</td><td class="num">$4.2M</td><td class="num">+44%</td><td class="num">N/A</td></tr>
                    <tr><td>Free Cash Flow</td><td class="num">$5.2M</td><td class="num">$3.9M</td><td class="num">+32%</td><td class="num">+89%</td></tr>
                  </tbody>
                </table>
              </div>
              ${footerHTML('Acme Corp', '\u00a9 2026', '12')}`,
          };
        },
      },
    ],
  };
})();
