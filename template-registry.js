(function () {
  const F_DEFAULT = footerHTML('Title', '&copy; Company', '5');
  const F_STATS = footerHTML('Bitcoin gift card', '&copy; Fold Holdings, Inc. 2025', '12');
  const F_TABLES = footerHTML('Acme Corp', '&copy; 2026', '12');

  const CARD_NOIMG = (title, items) => `
    <div class="feature-card-noimg" style="flex:1; width:auto;">
      <div class="tl-featurecol">
        <div class="h5">${title}</div>
        <div class="list">${items.map((item) => `<div class="h5">${item}</div>`).join('')}</div>
      </div>
    </div>`;

  const CARD_IMG = (title, items) => `
    <div class="feature-card" style="flex:1; width:auto; height:100%;">
      <div class="feature-card-img" style="flex:1; height:auto;"></div>
      <div class="tl-featurecol">
        <div class="h6">${title}</div>
        <div class="list">${items.map((item) => `<div class="h6 c-secondary">${item}</div>`).join('')}</div>
      </div>
    </div>`;

  const SAMPLE_CARDS = [
    { title: 'API Platform', items: ['Unified REST &amp; GraphQL', 'Real-time webhooks', '99.99% uptime SLA'] },
    { title: 'Security', items: ['SOC 2 Type II certified', 'Enterprise SSO', 'End-to-end encryption'] },
    { title: 'Analytics', items: ['Real-time dashboards', 'Custom report builder', 'Data export &amp; API'] },
  ];

  const THREECOL_HEADER = `
    <div class="content-frame">
      <div class="tl-stats" style="width:auto;">
        <div class="tl-stats-top">
          <div class="tl-stats-title">
            <div class="h3 c-yellow">Platform</div>
            <div class="h3 c-primary">Core capabilities</div>
          </div>
          <div class="h5 c-secondary" style="width:589px;">Three core pillars that power our enterprise platform.</div>
        </div>
      </div>
    </div>`;

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

  // ── Storytelling chain hints ──
  // suggestNext: soft hints for what template works well after this one.
  // Used during deck generation to guide narrative flow, never enforced.

  const STRUCTURAL = {
    start: {
      bg: 'bg-brand',
      label: 'Start — Brand yellow bg, H1 title + subtitle at bottom-left',
      suggestNext: ['agenda', 'section', 'normal', 'textslide'],
      render: () => `
        <div class="start-title">
          <div class="h1 c-primary">Presentation Title</div>
          <div class="h1 c-yellow">Subtitle Line</div>
        </div>`,
    },
    end: {
      bg: 'bg-brand',
      label: 'End — Brand yellow bg, closing text at bottom-left',
      suggestNext: [],
      render: () => `
        <div class="end-text">
          <div class="h1 c-primary">Thank you</div>
        </div>`,
    },
    agenda: {
      bg: 'bg-warning',
      label: 'Agenda — Bullet list with accent/default lines, H1 128/120',
      suggestNext: ['section', 'normal', 'textslide', 'cards'],
      render: () => `
        <div class="content-1col">
          <div class="slot-agenda" style="width:1760px">
            <div class="bullet"><div class="line line-accent"></div><div class="h1 c-accent">Introduction</div></div>
            <div class="bullet"><div class="line line-default"></div><div class="h1 c-disabled">Market Analysis</div></div>
            <div class="bullet"><div class="line line-default"></div><div class="h1 c-disabled">Product Strategy</div></div>
            <div class="bullet"><div class="line line-default"></div><div class="h1 c-disabled">Financial Overview</div></div>
            <div class="bullet"><div class="line line-default"></div><div class="h1 c-disabled">Next Steps</div></div>
          </div>
        </div>
        ${footerHTML('Title', '&copy; Company', '2')}`,
    },
    section: {
      bg: 'bg-warning',
      label: 'Section — Active item with accent line, inactive with default line, H1 128/120',
      suggestNext: ['normal', 'textslide', 'cards', 'features'],
      render: () => `
        <div class="content-1col">
          <div class="slot-agenda" style="width:1760px">
            <div class="bullet"><div class="line line-default"></div><div class="h1 c-disabled">Introduction</div></div>
            <div class="bullet"><div class="line line-accent"></div><div class="h1 c-accent">Market Analysis</div></div>
            <div class="bullet"><div class="line line-default"></div><div class="h1 c-disabled">Product Strategy</div></div>
            <div class="bullet"><div class="line line-default"></div><div class="h1 c-disabled">Financial Overview</div></div>
            <div class="bullet"><div class="line line-default"></div><div class="h1 c-disabled">Next Steps</div></div>
          </div>
        </div>
        ${footerHTML('Title', '&copy; Company', '3')}`,
    },
  };

  const THOUGHTS = {
    normal: {
      label: 'Thoughts — H2 primary + H2 accent, 740px text + fill image, 162px gap',
      suggestNext: ['cards', 'features', 'proof', 'description'],
      render: (align) => {
        const text = `<div class="slot slot-text-740"><div style="display:flex; flex-direction:column; width:740px;"><div class="h2 c-primary">Fold drives bitcoin rewards at scale across hundreds of merchants.</div><div class="h2 c-yellow" style="margin-top:48px;">Fold drives bitcoin rewards at scale across hundreds of merchants.</div></div></div>`;
        const img = `<div class="slot slot-fill"><div class="img-placeholder"></div></div>`;
        const inner = align === 'right' ? `${img}${text}` : `${text}${img}`;
        return `<div class="content-2col" style="align-items:stretch;">${inner}</div>${footerHTML('Presentation title', '&copy; Fold Holdings, Inc. 2025', '1')}`;
      },
    },
    quote: {
      label: 'Quote — Hanging quote marks, H2 text + H4 author block, 740px',
      suggestNext: ['cards', 'features', 'proof', 'stats-3x1'],
      render: (align) => {
        const text = `<div class="slot slot-text-740" style="justify-content:space-between;"><div class="h2 c-primary" style="position:relative;"><span style="position:absolute; right:100%; color:var(--yellow-500);">“</span>Innovation distinguishes between a leader and a follower.<span style="color:var(--yellow-500);">”</span></div><div class="author"><div class="h4 c-tertiary">Steve Jobs</div><div class="h4 c-yellow">Co-founder, Apple</div></div></div>`;
        const img = `<div class="slot slot-fill"><div class="img-placeholder"></div></div>`;
        const inner = align === 'right' ? `${img}${text}` : `${text}${img}`;
        return `<div class="content-2col" style="align-items:stretch;">${inner}</div>${footerHTML('Presentation title', '&copy; Fold Holdings, Inc. 2025', '1')}`;
      },
    },
    textslide: {
      label: 'TextSlide — H4 yellow title + 72/64 body text at 1191px',
      suggestNext: ['cards', 'features', 'proof', 'stats-2x1'],
      render: () => `
        <div class="content-frame" style="width:890px;">
          <div class="h4 c-yellow">Slide title</div>
        </div>
        <div style="position:absolute; top:305px; left:64px; width:1191px;">
          <div class="c-primary" style="font-size:72px; line-height:64px; font-weight:400;">This partnership turns every transaction into a growth engine—earning loyalty from the fastest-growing consumer demographic while generating new profit centers.<br><br>It’s not just about scale. It’s about owning the moment—and capturing its cultural and financial upside.</div>
        </div>
        ${footerHTML('Presentation title', '&copy; Fold Holdings, Inc. 2025', '11')}`,
    },
  };

  const PRODUCT = {
    cards: {
      bg: 'bg-warning',
      label: 'Cards — ThreeCol feature cards, no image',
      suggestNext: ['proof', 'stats-2x2', 'description', 'features'],
      render: () => `${THREECOL_HEADER}<div class="content-3col" style="top:305px; height:711px;">${SAMPLE_CARDS.map((card) => CARD_NOIMG(card.title, card.items)).join('')}</div>${F_DEFAULT}`,
    },
    'cards-2col': {
      bg: 'bg-warning',
      label: 'Cards 2col — TwoCol equal-width feature cards, no image',
      suggestNext: ['proof', 'stats-2x1', 'comparison', 'description'],
      render: () => `${THREECOL_HEADER}<div style="position:absolute; top:305px; left:64px; right:64px; bottom:64px; display:flex; gap:12px;">${SAMPLE_CARDS_2.map((card) => CARD_NOIMG(card.title, card.items)).join('')}</div>${F_DEFAULT}`,
    },
    features: {
      bg: 'bg-warning',
      label: 'Features — TwoCol title left + 3 stacked feature rows with thumbnails',
      suggestNext: ['proof', 'stats-3x1', 'description', 'carousel'],
      render: () => {
        const rows = [
          { title: 'ESG data aggregation', desc: 'Unify scattered data into one reliable source of truth—clean, structured, and ready for analysis.' },
          { title: 'AI-assisted carbon accounting', desc: 'Automatically identify, calculate, and validate emissions data using intelligent models.' },
          { title: 'Scenario modeling', desc: 'Explore what-if projections with flexible, transparent models that help teams understand trade-offs.' },
        ].map((item) => `
          <div style="display:flex; gap:24px; align-items:center;">
            <div style="width:330px; height:180px; flex-shrink:0; border-radius:8px; background:var(--layer-brand);"></div>
            <div style="display:flex; flex-direction:column; gap:8px; max-width:580px;">
              <div class="h5 c-primary" style="white-space:nowrap;">${item.title}</div>
              <div class="h6 c-secondary">${item.desc}</div>
            </div>
          </div>`).join('');
        return `
          <div class="content-2col" style="align-items:stretch;">
            <div class="slot" style="width:589px; justify-content:center;">
              <div style="display:flex; flex-direction:column; gap:24px; width:589px;">
                <div class="h3 c-primary">Key features</div>
                <div class="h5 c-secondary">From complex data to confident decisions</div>
              </div>
            </div>
            <div class="slot slot-fill" style="display:flex; flex-direction:column; justify-content:center; gap:32px; padding:48px 0;">
              ${rows}
            </div>
          </div>
          ${footerHTML('Aetherfield', '&copy; 2026', '7')}`;
      },
    },
    'cards-img': {
      bg: 'bg-warning',
      label: 'Cards+Img — ThreeCol feature cards with image slot',
      suggestNext: ['proof', 'stats-2x2', 'description', 'features'],
      render: () => `${THREECOL_HEADER}<div class="content-3col" style="top:305px; height:711px;">${SAMPLE_CARDS.map((card) => CARD_IMG(card.title, card.items)).join('')}</div>${F_DEFAULT}`,
    },
    'cards-2col-img': {
      bg: 'bg-warning',
      label: 'Cards 2col+Img — TwoCol feature cards with image slot',
      suggestNext: ['proof', 'stats-2x1', 'comparison', 'description'],
      render: () => `${THREECOL_HEADER}<div style="position:absolute; top:305px; left:64px; right:64px; bottom:64px; display:flex; gap:12px;">${SAMPLE_CARDS_2.map((card) => CARD_IMG(card.title, card.items)).join('')}</div>${F_DEFAULT}`,
    },
    description: {
      bg: 'bg-warning',
      label: 'Description — H2 title + H4 body + full-height image, left/right',
      suggestNext: ['cards', 'features', 'proof', 'stats-3x1'],
      render: (state) => {
        const align = state && state.align || state;
        const text = `<div style="width:740px; flex-shrink:0; display:flex; flex-direction:column; gap:154px; padding-top:0;"><div class="h2 c-primary">Product overview</div><div class="h4 c-secondary">Fold (NASDAQ: FLD) is the first publicly traded Bitcoin financial services company, on a mission to make Bitcoin simple, rewarding, and accessible to all. With over 600,000 users and more than $75 million in Bitcoin rewards earned, Fold is the #1 Bitcoin rewards platform in the world.</div></div>`;
        const image = `<div style="flex:1; min-width:0; background:var(--layer-brand); border-radius:12px;"></div>`;
        const inner = align === 'right' ? `${image}${text}` : `${text}${image}`;
        return `<div style="position:absolute; top:64px; left:64px; right:64px; bottom:64px; display:flex; gap:162px; align-items:stretch;">${inner}</div>${footerHTML('Presentation title', '&copy; Fold Holdings, Inc. 2025', '21')}`;
      },
    },
    partners: {
      bg: 'bg-warning',
      label: 'Partners — Logo grids: card, lineItem, description, full-width, or with header',
      suggestNext: ['stats-3x1', 'proof', 'textslide', 'end'],
      render: (state) => {
        const rows = Number(state.partnerRows) || 4;
        const cols = Number(state.partnerCols) || 2;
        function logoCard(name, chip) {
          return `<div class="logo-card"><div class="logo-card-img"><div class="img-placeholder"></div></div><div class="logo-card-footer"><span class="p1 c-tertiary">${name}</span>${chip ? `<span class="logo-chip">${chip}</span>` : ''}</div></div>`;
        }
        function logoGrid(data, c, sizeClass) {
          let html = `<div class="logo-grid ${sizeClass}">`;
          const r = Math.ceil(data.length / c);
          for (let i = 0; i < r; i++) {
            html += '<div class="logo-grid-row">';
            for (let j = 0; j < c; j++) {
              const item = data[i * c + j];
              html += logoCard(item ? item.name : 'Brand', item ? item.chip : '');
            }
            html += '</div>';
          }
          html += '</div>';
          return html;
        }
        function logoLineItem(name, desc, chip) {
          const bodyClass = chip && !desc ? 'logo-line-item-body compact' : 'logo-line-item-body';
          const chipHtml = chip ? `<span class="logo-line-chip">${chip}</span>` : '';
          const descHtml = desc ? `<div class="p1 c-secondary">${desc}</div>` : '';
          return `<div class="logo-line-item"><div class="logo-line-item-card"><div class="img-placeholder"></div></div><div class="${bodyClass}"><div class="h5 c-secondary">${name}</div><div class="logo-line-item-body-wrap">${descHtml}${chipHtml}</div></div></div>`;
        }
        function logoLineGrid(data, c, r) {
          // 4 rows: compact — title + category chip, no description
          // 2–3 rows: spacious — title + 2-line description, no chip
          const useChips = r >= 4;
          let html = '<div class="logo-line-grid">';
          for (let i = 0; i < r; i++) {
            html += '<div class="logo-line-row">';
            for (let j = 0; j < c; j++) {
              const item = data[i * c + j];
              const desc = useChips ? '' : (item ? item.desc : 'Description text');
              const chip = useChips ? (item ? item.cat : '') : '';
              html += logoLineItem(item ? item.name : 'Brand', desc, chip);
            }
            html += '</div>';
          }
          html += '</div>';
          return html;
        }
        const brands = [
          { name: 'Burger King', chip: '4% back', cat: 'Fast food', desc: 'Fast food rewards partner<br>with locations across all 50 states' },
          { name: 'Target', chip: '3% back', cat: 'Retail', desc: 'Retail shopping rewards<br>at 1,900+ locations nationwide' },
          { name: 'Whole Foods', chip: '5% back', cat: 'Grocery', desc: 'Organic grocery rewards<br>with premium health-focused selection' },
          { name: 'Nike', chip: '2% back', cat: 'Apparel', desc: 'Athletic apparel rewards<br>across retail and online stores' },
          { name: 'Starbucks', chip: '6% back', cat: 'Food &amp; beverage', desc: 'Coffee &amp; beverages rewards<br>at 16,000+ US locations' },
          { name: 'Amazon', chip: '3% back', cat: 'Marketplace', desc: 'Online marketplace rewards<br>across all product categories' },
          { name: 'Costco', chip: '4% back', cat: 'Wholesale club', desc: 'Wholesale club rewards<br>with bulk savings and member perks' },
          { name: 'Uber', chip: '5% back', cat: 'Rideshare', desc: 'Rideshare &amp; delivery rewards<br>for rides and Uber Eats' },
          { name: 'Home Depot', chip: '3% back', cat: 'Home improvement', desc: 'Home improvement rewards<br>for DIY and contractor supplies' },
          { name: 'Spotify', chip: '4% back', cat: 'Streaming', desc: 'Music streaming rewards<br>on premium subscriptions' },
          { name: 'Netflix', chip: '2% back', cat: 'Entertainment', desc: 'Entertainment streaming rewards<br>on monthly plans' },
          { name: 'Apple', chip: '5% back', cat: 'Electronics', desc: 'Consumer electronics rewards<br>on devices and services' },
          { name: 'Sephora', chip: '4% back', cat: 'Beauty', desc: 'Beauty &amp; cosmetics rewards<br>at retail and online' },
          { name: 'DoorDash', chip: '3% back', cat: 'Delivery', desc: 'Food delivery rewards<br>on all restaurant orders' },
          { name: 'Airbnb', chip: '6% back', cat: 'Travel', desc: 'Travel accommodation rewards<br>worldwide listings' },
          { name: 'Lyft', chip: '4% back', cat: 'Rideshare', desc: 'Rideshare transportation rewards<br>in 600+ cities' },
        ];
        const mode = state.partnerLayout || 'desc';
        if (mode === 'desc') {
          const grid = logoGrid(brands.slice(0, rows * 2), 2, 'half');
          return `
            <div style="position:absolute; top:64px; left:64px; width:740px; display:flex; flex-direction:column; gap:154px;">
              <div class="h2 c-primary">Slide title</div>
              <div class="h4 c-secondary">Fold (NASDAQ: FLD) is the first publicly traded Bitcoin financial services company, on a mission to make Bitcoin simple, rewarding, and accessible to all. With over 600,000 users and more than $75 million in Bitcoin rewards earned, Fold is the #1 Bitcoin rewards platform in the world.</div>
            </div>
            <div style="position:absolute; top:64px; right:64px;">
              ${grid}
            </div>
            ${footerHTML('Presentation title', '&copy; Fold Holdings, Inc. 2025', '1')}`;
        }
        if (mode === 'lineItem') {
          const lineRows = Math.min(rows, 4);
          const grid = logoLineGrid(brands.slice(0, lineRows * 2), 2, lineRows);
          return `
            ${statsHeader('Kroger.com', 'Subheader', 'We are committed to promoting the Fold Bitcoin Gift Card through paid promotions.')}
            <div style="position:absolute; top:305px; left:64px;">
              ${grid}
            </div>
            ${footerHTML('Bitcoin gift card', '&copy; Fold Holdings, Inc. 2025', '23')}`;
        }
        if (mode === 'header') {
          const grid = logoGrid(brands.slice(0, rows * cols), cols, 'full compact');
          return `
            ${statsHeader('Kroger.com', 'Subheader', 'We are committed to promoting the Fold Bitcoin Gift Card through paid promotions.')}
            <div style="position:absolute; top:305px; left:64px;">
              ${grid}
            </div>
            ${footerHTML('Bitcoin gift card', '&copy; Fold Holdings, Inc. 2025', '23')}`;
        }
        const grid = logoGrid(brands.slice(0, rows * cols), cols, 'full');
        return `
          <div style="position:absolute; top:64px; left:64px;">
            ${grid}
          </div>
          ${footerHTML('Presentation title', '&copy; Fold Holdings, Inc. 2025', '1')}`;
      },
    },
    comparison: {
      bg: 'bg-warning',
      label: 'Comparison — Two compare blocks (yellow + blue) with label chips',
      suggestNext: ['stats-2x1', 'proof', 'datatable', 'cards'],
      render: () => {
        function compareBlock(variant, label, breakdown, imgUrl) {
          const breakdownChip = breakdown ? `<div class="compare-chip breakdown">${breakdown}</div>` : '';
          const imageStyle = imgUrl ? `background-image:url(${imgUrl}); background-size:cover; background-position:center; background-repeat:no-repeat;` : '';
          return `<div class="compare-block ${variant}"><div class="compare-block-content"><div class="compare-block-img" style="${imageStyle}"></div><div class="compare-chip label">${label}</div>${breakdownChip}</div></div>`;
        }
        return `
          <div class="content-frame">
            <div class="tl-vertical-header">
              <div class="h4 c-primary">Fold and Kroger overlapping geographies</div>
              <div class="tl-vh-body">Fold users are evenly spread across the country with significant concentrated overlap of a high number of Kroger stores in California and Texas.</div>
            </div>
          </div>
          <div style="position:absolute; top:305px; left:64px; width:1792px; height:708px; display:flex; gap:12px; align-items:stretch;">
            ${compareBlock('yellow', 'Fold users', 'The most preferred grocery option for gift card', 'map-yellow.png')}
            ${compareBlock('blue', 'Kroger', '', 'map-blue.png')}
          </div>
          ${footerHTML('Bitcoin gift card', '&copy; Fold Holdings, Inc. 2025', '19')}`;
      },
    },
  };

  const TABLE_YELLOW = [
    ['Enterprise', '$4.2M'], ['Mid-market', '$2.8M'],
    ['SMB', '$1.5M'], ['Self-serve', '$890K'],
    ['Partnerships', '$620K'], ['Other', '$340K'],
  ];

  const TABLE_BLUE = [
    ['NPS score', '72'], ['Retention', '94%'], ['Avg deal size', '$48K'],
    ['Active users', '12.4K'], ['Expansion', '127%'], ['Time to value', '14d'],
  ];

  const SAMPLE_CARDS_2 = [
    { title: 'Infrastructure', items: ['Multi-region deployment', 'Auto-scaling clusters', '99.99% uptime SLA'] },
    { title: 'Observability', items: ['Real-time metrics', 'Distributed tracing', 'Alerting &amp; on-call'] },
  ];

  const CHARTS = {
    proof: {
      bg: 'bg-warning',
      label: 'Proof — yellow panel left + 2×2 stat grid right',
      suggestNext: ['cards', 'features', 'section', 'textslide'],
      render: () => {
        const stats = [
          { value: '20+', desc: 'Climate-forward orgs trust Aetherfield' },
          { value: '60%', desc: 'Reduction in reporting time for sustainability teams' },
          { value: '91%', desc: 'Less manual data cleanup compared to competitors' },
          { value: '3.5×', desc: 'Increase in actionable insights per reporting cycle' },
        ];
        const grid = stats.map((stat) => `
          <div class="proof-stat">
            <div class="h1 c-primary">${stat.value}</div>
            <div class="h5 c-secondary">${stat.desc}</div>
          </div>`).join('');
        return `
          <div class="proof-layout">
            <div class="proof-panel">
              <div class="proof-panel-inner">
                <div class="h3 c-primary">Proof and momentum</div>
                <div class="h5 c-secondary">Aetherfield is trusted by leading organizations driving measurable climate progress. Our platform turns complex sustainability data into clarity—empowering teams to act faster, report smarter, and make lasting impact.</div>
              </div>
            </div>
            <div class="proof-grid">
              ${grid}
            </div>
          </div>
          ${footerHTML('Aetherfield', '&copy; 2026', '6')}`;
      },
    },
    'stats-2x1': {
      bg: 'bg-warning',
      label: 'Stats 2×1 — Two stat cells, H1 values',
      suggestNext: ['cards', 'features', 'description', 'section'],
      render: () => {
        const disclaimer = '5. Forbes, https://www.forbes.com/digital-assets/crypto-prices<br>6. Clark Moody Bitcoin Dashboard, https://bitcoin.clarkmoody.com/dashboard/';
        const grid = `<div class="stat-grid-row">${statCell('Bitcoin market cap', '$2.08T', 0, 0, 'h1')}${statCell('Bitcoin price touched', '$111,980', 0, 0, 'h1')}</div>`;
        return `${statsHeader('Kroger.com', 'promotion participation', 'We are committed to promoting the Fold Bitcoin Gift Card through paid promotions.', disclaimer)}<div class="stat-grid" style="position:absolute; top:305px; left:64px; right:64px; bottom:64px;">${grid}</div>${F_STATS}`;
      },
    },
    'stats-3x1': {
      bg: 'bg-warning',
      label: 'Stats 3×1 — Three stat cells, H2 values',
      suggestNext: ['cards', 'carousel', 'description', 'section'],
      render: () => {
        const grid = `<div class="stat-grid-3" style="flex:1;">${statCell('June', 'Sizzling summer promo', 0, 0, 'h2')}${statCell('August', 'Deal days', 0, 0, 'h2')}${statCell('September', 'Birthday', 0, 0, 'h2')}</div>`;
        return `${statsHeader('Kroger.com', 'promotion participation', 'We are committed to promoting the Fold Bitcoin Gift Card through paid promotions.')}<div class="stat-grid" style="position:absolute; top:305px; left:64px; right:64px; bottom:64px;">${grid}</div>${F_STATS}`;
      },
    },
    'stats-2x2': {
      bg: 'bg-warning',
      label: 'Stats 2×2 — Four stat cells in 2 rows, H1 values',
      suggestNext: ['cards', 'features', 'description', 'section'],
      render: () => {
        const grid = `<div class="stat-grid-row">${statCell('Bitcoin market cap', '$2.08T', 0, 0, 'h1')}${statCell('Bitcoin buyers in the US', '65M', 0, 0, 'h1')}</div><div class="stat-grid-row">${statCell('US gift card market', '$324.5B', 0, 0, 'h1')}${statCell('Bitcoin gift card opportunity', '$200B+', 0, 0, 'h1')}</div>`;
        return `${statsHeader('Volume forecast', 'Bitcoin’s macro tailwinds and the scale of gift cards create a major opportunity.', null, null, 1792)}<div class="stat-grid" style="position:absolute; top:305px; left:64px; right:64px; bottom:64px;">${grid}</div>${F_STATS}`;
      },
    },
    'side-by-side': {
      bg: 'bg-warning',
      label: 'Side-by-side — Two VariableCard tables',
      suggestNext: ['cards', 'proof', 'textslide', 'section'],
      render: (state) => {
        const bothSingleRow = state.leftGrid.endsWith('x1') && state.rightGrid.endsWith('x1');
        const top = bothSingleRow ? 'calc(37.5% + 24px)' : '192px';
        return `
          <div class="content-frame">
            <div style="display:flex; flex-direction:column; width:890px;">
              <div class="h5" style="color:var(--face-tertiary);">Performance</div>
              <div class="h3 c-primary">Revenue breakdown</div>
            </div>
          </div>
          <div class="slot-tables-row" style="position:absolute; top:${top}; left:64px; right:64px; bottom:64px;">
            ${varTable(state.leftGrid, 'Q1 Revenue by segment', TABLE_YELLOW, { color: 'yellow' })}
            ${varTable(state.rightGrid, 'Customer highlights', TABLE_BLUE, { color: 'blue' })}
          </div>
          ${F_TABLES}`;
      },
    },
    datatable: {
      bg: 'bg-warning',
      label: 'DataTable — Full-width light table',
      suggestNext: ['textslide', 'proof', 'cards', 'section'],
      render: () => `
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
              <tr><td>ARR</td><td class="num">$192M</td><td class="num">$167M</td><td class="num">+15%</td><td class="num">+34%</td></tr>
              <tr><td>Net Revenue Retention</td><td class="num">127%</td><td class="num">125%</td><td class="num">+2pp</td><td class="num">+8pp</td></tr>
            </tbody>
          </table>
        </div>
        ${footerHTML('Acme Corp', '&copy; 2026', '12')}`,
    },
  };

  const ROADMAP = {
    carousel: {
      bg: 'bg-warning',
      label: 'Carousel — 3×1 stat cards + 4th peeking off-screen',
      suggestNext: ['proof', 'stats-2x2', 'partners', 'textslide'],
      render: () => {
        const cells = [
          { title: 'June', value: 'Sizzling summer promo' },
          { title: 'August', value: 'Deal days' },
          { title: 'September', value: 'Birthday' },
          { title: 'November', value: 'Holiday blitz' },
        ];
        let html = `
          <div class="content-frame">
            <div class="tl-stats" style="width:auto;">
              <div class="tl-stats-top">
                <div class="tl-stats-title" style="width:683px;">
                  <div class="h3 c-yellow">Kroger.com</div>
                  <div class="h3 c-primary">promotion participation</div>
                </div>
                <div class="h5 c-secondary" style="width:589px;">We are committed to promoting the Fold Bitcoin Gift Card through paid promotions.</div>
              </div>
            </div>
          </div>
          <div class="carousel-track" style="position:absolute; top:305px; left:64px; right:0; height:711px; overflow:hidden; cursor:grab;">
            <div style="display:flex; gap:12px; height:100%; padding-right:64px; transform:translateX(0); transition:none; user-select:none;">`;
        cells.forEach((cell) => {
          const styled = cell.value.replace(/\$/g, '<span style="color:rgba(60,49,43,0.24);">$</span>');
          html += `<div class="stat-cell" style="flex:none; width:589px; scroll-snap-align:start;"><div class="h5 c-primary">${cell.title}</div><div class="h2 c-primary">${styled}</div></div>`;
        });
        html += `</div></div>${footerHTML('Presentation title', '&copy; Fold Holdings, Inc. 2025', '7')}`;
        return html;
      },
      afterRender: (slide) => {
        const track = slide.querySelector('.carousel-track');
        if (track) initDrag(track);
      },
    },
  };

  const TEXT_LAYOUTS = {
    rhythm: {
      name: 'Typography Rhythm',
      desc: 'Full type scale · H1→P5 · all sizes, weights, line-heights',
      width: 1792,
      gap: 24,
      fixedText: true,
      layers: [
        { cls: 'h1', color: 'c-primary', text: 'Pack my box with five dozen liquor jugs', meta: '128/120 · Regular 400' },
        { cls: 'h2', color: 'c-primary', text: 'Pack my box with five dozen liquor jugs', meta: '88/80 · Regular 400' },
        { cls: 'h3', color: 'c-primary', text: 'Pack my box with five dozen liquor jugs', meta: '64/64 · Regular 400' },
        { cls: 'h4', color: 'c-primary', text: 'Pack my box with five dozen liquor jugs', meta: '48/48 · Regular 400' },
        { cls: 'h5', color: 'c-primary', text: 'Pack my box with five dozen liquor jugs', meta: '32/32 · Regular 400' },
        { cls: 'h6', color: 'c-primary', text: 'Pack my box with five dozen liquor jugs', meta: '24/24 · Medium 500' },
        { cls: 'p1', color: 'c-primary', text: 'Pack my box with five dozen liquor jugs', meta: '21/24 · Regular 400' },
        { cls: 'p2', color: 'c-primary', text: 'Pack my box with five dozen liquor jugs', meta: '16/20 · Regular 400' },
        { cls: 'p3', color: 'c-primary', text: 'Pack my box with five dozen liquor jugs', meta: '12/16 · Regular 400' },
        { cls: 'p5', color: 'c-primary', text: 'Pack my box with five dozen liquor jugs', meta: '10/12 · Medium 500' },
      ],
    },
    infoText: {
      name: 'InfoText',
      desc: 'H2 + H4 · 740px · gap 128px',
      width: 740,
      gap: 128,
      layers: [
        { cls: 'h2', color: 'c-primary', role: 'title' },
        { cls: 'h4', color: 'c-secondary', role: 'body' },
      ],
    },
    marCom: {
      name: 'MarCom',
      desc: 'H2 primary + H2 accent · 740px · gap 128px',
      width: 740,
      gap: 128,
      variants: [
        {
          name: 'marCom',
          layers: [
            { cls: 'h2', color: 'c-primary', role: 'title' },
            { cls: 'h2', color: 'c-yellow', role: 'accent' },
          ],
        },
        {
          name: 'thoughts',
          layers: [
            { cls: 'h2', color: 'c-primary', role: 'title' },
            { cls: 'h2', color: 'c-primary', role: 'accent' },
          ],
        },
      ],
      layers: [
        { cls: 'h2', color: 'c-primary', role: 'title' },
        { cls: 'h2', color: 'c-yellow', role: 'accent' },
      ],
    },
    quoteText: {
      name: 'QuoteText',
      desc: 'H2 quote + H4 author block · 890px · gap 205px',
      width: 890,
      gap: 205,
      layers: [
        { cls: 'h2', color: 'c-primary', role: 'quote', hangingQuote: true },
        {
          group: true,
          gap: 0,
          items: [
            { cls: 'h4', color: 'c-tertiary', role: 'author' },
            { cls: 'h4', color: 'c-yellow', role: 'authorTitle' },
          ],
        },
      ],
    },
    vertical: {
      name: 'Vertical',
      desc: 'H4 + P1 · 589px · gap 48px',
      width: 589,
      gap: 48,
      variants: [
        {
          label: 'Default (589px)',
          width: 589,
          gap: 48,
          layers: [
            { cls: 'h4', color: 'c-primary', role: 'title' },
            { cls: 'p1', color: 'c-primary', role: 'body' },
          ],
        },
        {
          label: 'Small (439px)',
          width: 439,
          gap: 32,
          layers: [
            { cls: 'h5', color: 'c-primary', role: 'title' },
            { cls: 'p3', color: 'c-primary', role: 'body' },
          ],
        },
      ],
    },
    compact: {
      name: 'Compact',
      desc: 'Title + body · 590px · gap 16px',
      width: 590,
      gap: 16,
      variants: [
        {
          label: 'Large',
          width: 590,
          gap: 16,
          layers: [
            { cls: 'h5', color: 'c-primary', role: 'title' },
            { cls: 'p2', color: 'c-primary', role: 'body' },
          ],
        },
        {
          label: 'Default',
          width: 590,
          gap: 16,
          layers: [
            { cls: 'p3', color: 'c-primary', role: 'title', weight: 600 },
            { cls: 'p2', color: 'c-primary', role: 'body' },
          ],
        },
        {
          label: 'Small',
          width: 590,
          gap: 16,
          layers: [
            { cls: 'p3', color: 'c-primary', role: 'title', weight: 600 },
            { cls: 'p4', color: 'c-primary', role: 'body' },
          ],
        },
      ],
    },
    textSlide: {
      name: 'TextSlide',
      desc: 'H4 accent + 72px body · 1191px · gap 192px',
      width: 1191,
      gap: 192,
      layers: [
        { cls: 'h4', color: 'c-yellow', role: 'title' },
        { cls: '', color: 'c-primary', role: 'body', customStyle: 'font-size:72px; line-height:64px;' },
      ],
    },
    headerStack: {
      name: 'HeaderStack',
      desc: 'H1 → H4 scale · 985px · gap 40px',
      width: 985,
      gap: 40,
      layers: [
        { cls: 'h1', color: 'c-primary', role: 'h1' },
        { cls: 'h2', color: 'c-primary', role: 'h2' },
        { cls: 'h3', color: 'c-primary', role: 'h3' },
        { cls: 'h4', color: 'c-primary', role: 'h4' },
      ],
    },
  };

  const TYPO_TEXTS = {
    title: [
      'Strategy & growth outlook for the next quarter',
      'Why enterprise is our fastest-growing segment',
      'Building durable competitive advantage',
      'Three levers that drive margin expansion',
      'Customer retention as a growth engine',
      'The path to $200M ARR',
      'Product-led growth in practice',
      'Revenue diversification strategy',
      'What our customers are telling us',
      'A framework for smart expansion',
    ],
    body: [
      'We exceeded targets across all segments with enterprise leading at 52% YoY growth. Margin expansion and product-market fit signal strong momentum heading into Q2.',
      'Net revenue retention reached 127%, reflecting deep product stickiness and successful land-and-expand across mid-market accounts.',
      'Gross margin improved 340 basis points through a combination of infrastructure optimization and pricing discipline.',
      'Free cash flow turned positive for the first time in company history, giving us optionality without dilution.',
      'Pipeline coverage stands at 3.2x with enterprise deals averaging 48 days shorter in cycle time versus last year.',
      'We shipped 14 major features this quarter while reducing P0 incidents by 60% — velocity and stability together.',
    ],
    accent: ['FY 2026', 'Q1 Results', '$48.2M revenue', '+34% YoY', 'Record quarter'],
    quote: [
      'The best way to predict the future is to build it, one quarter at a time.',
      'Customer obsession isn’t a strategy — it’s the only strategy.',
      'Growth without discipline is just a more expensive way to fail.',
    ],
    author: ['Sarah Chen', 'Marcus Rivera', 'Priya Patel', 'David Kim'],
    authorTitle: ['CEO, Acme Corp', 'VP Engineering', 'Chief Revenue Officer', 'Head of Product'],
    h1: ['Q1 Financial Review', 'Growth at Scale', 'The Next Chapter'],
    h2: ['Revenue acceleration', 'Customer health', 'Operational excellence'],
    h3: ['Enterprise grew 52%', 'Margin expansion', 'Record retention'],
    h4: ['Key metrics and trends', 'What the data shows', 'A closer look at Q1'],
  };

  function pick(values) {
    return values[Math.floor(Math.random() * values.length)];
  }

  function getTypoRenderState(layoutKey, variantIndex) {
    const definition = TEXT_LAYOUTS[layoutKey];
    const variant = definition.variants ? definition.variants[variantIndex ?? 0] : definition;
    const layers = variant.layers || definition.layers;
    const content = layers.map((layer) => {
      if (layer.group) {
        return {
          ...layer,
          items: layer.items.map((item) => ({
            ...item,
            text: pick(TYPO_TEXTS[item.role] || TYPO_TEXTS.title),
          })),
        };
      }
      return {
        ...layer,
        text: layer.text || pick(TYPO_TEXTS[layer.role] || TYPO_TEXTS.title),
      };
    });

    return {
      definition,
      variantLabel: variant.label || null,
      width: variant.width || definition.width,
      gap: variant.gap || definition.gap,
      content,
    };
  }

  function renderTypoLayer(layer) {
    if (layer.group) {
      const inner = layer.items.map((item) => renderTypoLayer(item)).join(
        layer.gap === 0 ? '' : `<div style="height:${layer.gap}px;"></div>`
      );
      return `<div style="display:flex; flex-direction:column;">${inner}</div>`;
    }

    const weight = layer.weight ? `font-weight:${layer.weight};` : '';
    const customStyle = layer.customStyle || '';
    if (layer.hangingQuote) {
      return `<div class="${layer.cls} ${layer.color}" style="position:relative;${weight}${customStyle}"><span style="position:absolute; right:100%; color:var(--yellow-500);">“</span>${layer.text}<span style="color:var(--yellow-500);">”</span></div>`;
    }

    if (layer.meta) {
      return `<div style="display:flex; align-items:baseline; gap:24px;${weight}${customStyle}"><div class="p3 c-tertiary" style="white-space:nowrap; flex-shrink:0; width:200px;">${layer.cls.toUpperCase()} · ${layer.meta}</div><div class="${layer.cls} ${layer.color}" style="white-space:nowrap; text-wrap:nowrap;">${layer.text}</div></div>`;
    }

    return `<div class="${layer.cls} ${layer.color}" style="${weight}${customStyle}">${layer.text}</div>`;
  }

  window.TEMPLATE_PAGE = {
    title: 'Templates',
    navGroups: [
      { label: 'Base', storyIds: ['structural'] },
      { label: 'Layout', storyIds: ['thoughts', 'product', 'charts', 'roadmap', 'typo-layouts'] },
      { label: 'Pages', links: [
        { label: 'Components', href: '/components.html', external: true },
      ] },
    ],
    stories: [
      {
        id: 'structural',
        title: 'Structural',
        desc: 'Start, end, agenda, and section divider templates.',
        initialState: { variant: 'start' },
        getControls() {
          return [{
            key: 'variant',
            options: [
              { value: 'start', label: 'Start' },
              { value: 'end', label: 'End' },
              { value: 'agenda', label: 'Agenda' },
              { value: 'section', label: 'Section' },
            ],
          }];
        },
        render(state) {
          const entry = STRUCTURAL[state.variant];
          return { bg: entry.bg, label: entry.label, html: entry.render() };
        },
      },
      {
        id: 'thoughts',
        title: 'Thoughts and quotes',
        desc: 'TwoCol text+image layouts and full-width text slides for statements and quotes.',
        initialState: { variant: 'normal', align: 'left' },
        getControls(state) {
          return [
            {
              key: 'variant',
              options: [
                { value: 'normal', label: 'Thoughts' },
                { value: 'quote', label: 'Quote' },
                { value: 'textslide', label: 'TextSlide' },
              ],
            },
            {
              key: 'align',
              visible: state.variant !== 'textslide',
              options: [
                { value: 'left', label: 'Left' },
                { value: 'right', label: 'Right' },
              ],
            },
          ];
        },
        render(state) {
          const entry = THOUGHTS[state.variant];
          return { bg: 'bg-warning', label: entry.label, html: entry.render(state.align) };
        },
      },
      {
        id: 'product',
        title: 'Product',
        desc: 'Feature showcases, cards, and product-focused layouts. Description follows high-level slides.',
        initialState: { variant: 'cards', align: 'left', partnerRows: '4', partnerCols: '2', partnerLayout: 'desc' },
        getControls(state) {
          return [
            {
              key: 'variant',
              options: [
                { value: 'cards', label: 'Cards' },
                { value: 'cards-2col', label: 'Cards 2col' },
                { value: 'cards-img', label: 'Cards+Img' },
                { value: 'cards-2col-img', label: 'Cards 2col+Img' },
                { value: 'features', label: 'Features' },
                { value: 'description', label: 'Description' },
                { value: 'partners', label: 'Partners' },
                { value: 'comparison', label: 'Comparison' },
              ],
            },
            {
              key: 'partnerLayout',
              visible: state.variant === 'partners',
              options: [
                { value: 'desc', label: 'Desc+Grid' },
                { value: 'full', label: 'Full Width' },
                { value: 'header', label: 'Header+Grid' },
                { value: 'lineItem', label: 'LineItem' },
              ],
            },
            {
              key: 'partnerRows',
              visible: state.variant === 'partners',
              options: [
                { value: '4', label: '4 rows' },
                { value: '3', label: '3 rows' },
                { value: '2', label: '2 rows' },
              ],
            },
            {
              key: 'partnerCols',
              visible: state.variant === 'partners' && state.partnerLayout !== 'desc' && state.partnerLayout !== 'lineItem',
              options: [
                { value: '4', label: '4 cols' },
                { value: '3', label: '3 cols' },
                { value: '2', label: '2 cols' },
              ],
            },
            {
              key: 'align',
              visible: state.variant === 'description',
              options: [
                { value: 'left', label: 'Left' },
                { value: 'right', label: 'Right' },
              ],
            },
          ];
        },
        render(state) {
          const entry = PRODUCT[state.variant];
          const html = entry.render(state);
          const result = { bg: entry.bg || 'bg-warning', label: entry.label, html };
          return result;
        },
      },
      {
        id: 'charts',
        title: 'Chart and numbers',
        desc: 'Proof (descriptive data), stats (short/punchy), tables — data-heavy layouts.',
        initialState: { variant: 'proof', leftGrid: '2x3', rightGrid: '3x2' },
        getControls(state) {
          return [
            {
              key: 'variant',
              options: [
                { value: 'proof', label: 'Proof' },
                { value: 'stats-2x1', label: 'Stats 2×1' },
                { value: 'stats-3x1', label: 'Stats 3×1' },
                { value: 'stats-2x2', label: 'Stats 2×2' },
                { value: 'side-by-side', label: 'Side-by-side' },
                { value: 'datatable', label: 'DataTable' },
              ],
            },
            {
              key: 'leftGrid',
              visible: state.variant === 'side-by-side',
              options: [
                { value: '2x3', label: '2×3' },
                { value: '2x2', label: '2×2' },
                { value: '2x1', label: '2×1' },
              ],
            },
            {
              key: 'rightGrid',
              visible: state.variant === 'side-by-side',
              options: [
                { value: '3x2', label: '3×2' },
                { value: '2x2', label: '2×2' },
                { value: '2x1', label: '2×1' },
              ],
            },
          ];
        },
        render(state) {
          const entry = CHARTS[state.variant];
          return { bg: entry.bg, label: entry.label, html: entry.render(state) };
        },
      },
      {
        id: 'roadmap',
        title: 'Roadmap',
        desc: 'Timelines, milestones, and sequential planning layouts.',
        initialState: { variant: 'carousel' },
        getControls() {
          return [{
            key: 'variant',
            options: [
              { value: 'carousel', label: 'Carousel' },
            ],
          }];
        },
        render(state) {
          const entry = ROADMAP[state.variant];
          return {
            bg: entry.bg,
            label: entry.label,
            html: entry.render(state),
            afterRender: entry.afterRender,
          };
        },
      },
      {
        id: 'typo-layouts',
        title: 'Typography Layouts',
        tag: 'library',
        desc: 'Mapped text layout components at their native widths and typography specs.',
        initialState: { layout: 'rhythm', variantIndex: '0' },
        getControls(state) {
          const definition = TEXT_LAYOUTS[state.layout];
          return [
            {
              key: 'layout',
              options: [
                { value: 'rhythm', label: 'Rhythm' },
                { value: 'infoText', label: 'InfoText' },
                { value: 'marCom', label: 'MarCom' },
                { value: 'quoteText', label: 'QuoteText' },
                { value: 'vertical', label: 'Vertical' },
                { value: 'compact', label: 'Compact' },
                { value: 'textSlide', label: 'TextSlide' },
                { value: 'headerStack', label: 'HeaderStack' },
              ],
            },
            {
              key: 'variantIndex',
              visible: Boolean(definition.variants),
              options: (definition.variants || []).map((variant, index) => ({
                value: String(index),
                label: variant.label,
              })),
            },
          ];
        },
        render(state) {
          const variantIndex = Number(state.variantIndex || 0);
          const { definition, variantLabel, width, gap, content } = getTypoRenderState(state.layout, variantIndex);
          const layersHtml = content.map((layer) => renderTypoLayer(layer)).join(`<div style="height:${gap}px;"></div>`);
          return {
            bg: 'bg-warning',
            label: `${definition.name} · ${variantLabel || definition.desc}`,
            html: `
              <div style="position:absolute; top:64px; left:64px; right:64px; bottom:64px; display:flex; align-items:flex-start;">
                <div style="width:${width}px; display:flex; flex-direction:column;">${layersHtml}</div>
              </div>
              <div class="footer"><span class="footer-title">Acme Corp</span><span class="footer-copy">&copy; 2026</span><span class="footer-page">—</span></div>`,
          };
        },
      },
    ],
  };
})();
