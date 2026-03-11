# Slide Presentations — Agent Onboarding

You are generating HTML slide presentations using a design system. This document tells you how to get productive fast.

---

## 1. Read these first (in order)

| Priority | File | What you learn |
|----------|------|----------------|
| 1 | `CLAUDE.md` | Project summary, commands, hard constraints (canvas, font, grid, density limits) |
| 2 | `COMPONENTS.md` | All 22 components — their APIs, layer hierarchy |
| 3 | `DESIGN_RULES.md` | 32 design rules — typography, layout, color, spacing |
| 4 | `templates.html` | **Source of truth** for all slide compositions — open in browser via `node server.mjs` on port 3456 |

---

## 2. The preview system

```bash
node server.mjs    # http://localhost:3456
```

| File | Purpose |
|------|---------|
| `templates.html` | Component storybook — every composition variant. **This is the source of truth.** |
| `examples/credit-card.html` | 23-slide real presentation with chip switchers for variant comparison |
| `examples/cryptoswitch.html` | 18-slide crypto presentation |
| `shared.css` | All shared styles — tokens, typography classes, component CSS |
| `shared.js` | Shared JS — footerHTML(), varCard(), annotation system, chip event delegation |
| `validate.mjs` | Runs validation checks against HTML (backgrounds, typography, footer, DataTable) |

---

## 3. Hard constraints (memorize these)

### Canvas
- 1920x1080 slides, rendered at 50% in a `.slide` container
- Font: **Geist** only (Regular 400, Medium 500, SemiBold 600)

### Grid
- 12 columns, 64px margin, 12px gutter
- Column widths: `3col=439, 4col=589, 5col=740, 6col=890, 7col=985, 12col=1792`
- Formula: `N x 138.33 + (N-1) x 12`

### Vertical zones
```
y=64    → top margin / header start
y=305   → content zone start (header zone = 241px tall)
y=1016  → content zone end
y=1041  → footer start
y=1080  → slide bottom
```

### Typography scale
| Style | Size/LH | Weight | Role |
|-------|---------|--------|------|
| H1 | 128/120 | Regular | Hero display: big stat values, start/end titles, agenda |
| H2 | 88/80 | Regular | Large emphasis: stat values (3x1), proof/description titles |
| H3 | 64/64 | Regular | Header zone: yellow label + primary title pair |
| H4 | 48/48 | Regular | Medium emphasis: section labels, proof body, author credit |
| H5 | 32/32 | Regular | Component titles: stat titles, card titles, descriptions |
| H6 | 24/24 | Medium | Small labels: image-card titles, table headers, feature descriptions |
| P1 | 21/24 | Regular | Body text (large) |
| P2 | 16/20 | Regular | Body text (standard) |
| P3 | 12/16 | Regular | Footnotes, disclaimers, compact labels |
| P5 | 10/12 | Medium | Micro: footer text only |

### Colors
- `bg-brand` (#FFDD33): Start/End slides ONLY
- `bg-layer` (#FCFAF2): ALL content slides
- `c-primary` = face.primary (dark), `c-secondary`, `c-tertiary`, `c-yellow` = yellow.500, `c-accent`, `c-disabled`

### Content density (when to split)
| Slide type | Max content |
|---|---|
| Start/End | 1 heading + 1 subtitle |
| TwoCol | 1 heading + 1 body + 1 visual |
| ThreeCol/FourCol | 1 header + 3-4 cards (max 4 bullets each) |
| Stats | 1 header + max 6 stat cells |
| DataTable | max 8 rows x 5 columns |
| TextSlide | 1 title + 1 body block |

Exceeds limits → split into multiple slides. Never cram.

---

## 4. Composition catalog (22 templates)

Open `templates.html` to see all of these rendered.

| # | Group | Template | When to use |
|---|-------|----------|-------------|
| 1 | Structural | **Start** | Opening slide, brand yellow bg |
| 2 | Structural | **End** | Closing slide, brand yellow bg |
| 3 | Structural | **Agenda** | Section overview with bullet lines |
| 4 | Structural | **Section** | Between major sections |
| 5 | Thoughts | **Thoughts** | Bold statement + image, short/sweet |
| 6 | Thoughts | **Quote** | Hanging quote marks + author attribution |
| 7 | Thoughts | **TextSlide** | Big statement, 72px body text |
| 8 | Product | **Cards** | ThreeCol feature cards, no image |
| 9 | Product | **Cards 2col** | TwoCol feature cards, no image |
| 10 | Product | **Cards+Img** | ThreeCol feature cards with image |
| 11 | Product | **Cards 2col+Img** | TwoCol feature cards with image |
| 12 | Product | **Features** | Title left + 3 stacked feature rows with thumbnails |
| 13 | Product | **Description** | H2 title + H4 body + full-height image (auto follow-up) |
| 14 | Product | **Partners** | Logo grids with multiple layout modes |
| 15 | Product | **Comparison** | A vs B (yellow + blue blocks) |
| 16 | Data | **Proof** | Yellow panel left + 2×2 stat grid right |
| 17 | Data | **Stats 2×1** | Two stat cells, H1 values |
| 18 | Data | **Stats 3×1** | Three stat cells, H2 values |
| 19 | Data | **Stats 2×2** | Four stat cells in 2 rows, H1 values |
| 20 | Data | **Side-by-side** | Two VariableCard tables |
| 21 | Data | **DataTable** | Full-width light table |
| 22 | Roadmap | **Carousel** | 4+ sequential steps (needs peek effect) |

### Template selection cheat sheet
| Content shape | Best template | Avoid |
|---|---|---|
| Short labels + big numbers | Stats, Proof | Cards |
| Bullets per topic | Cards (2-4 col) | Stats |
| 2 topics with bullets | Cards 2col, Comparison | ThreeCol |
| 2 opposing things | Comparison, Proof | ThreeCol |
| Narrative + data | Side-by-side, Proof | Cards |
| 4+ sequential steps | Carousel | Stats 3x1 (<4 items) |
| 3 milestones + descriptions | Stats 3x1 | Carousel (no peek) |
| Dense table data | DataTable | Cards |
| Definitions by category | ThreeCol Cards (2 slides) | DataTable |
| Attribution/credibility | Quote | TextSlide (no author) |

### Storytelling chain hints (soft)
Each template has `suggestNext` in the registry. Key patterns:
- **Claim → Evidence**: Thoughts/Quote/TextSlide → Proof/Stats
- **Explain → Prove**: Cards/Features → Proof/Stats
- **Compare → Quantify**: Comparison → Stats/DataTable
- **Quote → Expand**: Quote → Cards/Features (break down the idea)
- **Deep Dive**: Section → Description → Cards → Proof (full topic arc)
- **Showcase → Close**: Partners/Carousel → TextSlide → End

---

## 5. Key patterns

### Header zone (most content slides)
```html
<div class="content-frame">
  <div class="tl-stats" style="width:auto;">
    <div class="tl-stats-top">
      <div class="tl-stats-title">
        <div class="h3 c-yellow">Category label</div>
        <div class="h3 c-primary">Descriptive title</div>
      </div>
      <div class="h5 c-secondary" style="width:589px;">Optional description</div>
    </div>
  </div>
</div>
```

### Stat cell (Stats, Carousel)
```html
<div class="stat-cell">
  <div class="h5 c-primary">Title</div>
  <div class="h1 c-primary"><span style="color:rgba(56,51,35,0.24);">$</span>4.2M</div>
</div>
```
**Only** title + value. No descriptions inside stat cells. Context → header zone.

### Feature card (ThreeCol/FourCol)
```html
<div class="feature-card-noimg" style="flex:1; width:auto;">
  <div class="tl-featurecol">
    <div class="h5">Card title</div>
    <div class="list">
      <div class="h5 c-secondary">Bullet item</div>
    </div>
  </div>
</div>
```

### Footer (every slide except Start/End)
```html
<div class="footer">
  <span class="footer-title">Presentation Title</span>
  <span class="footer-copy">&copy; Company 2025</span>
  <span class="footer-page">3</span>
</div>
```

### Chip switchers (for variant comparison)
Preview files use `chip-group` with `data-val` buttons to swap between layout variants for the same content. Useful for exploring which template fits best.

---

## 6. Working on presentation HTML

When creating or editing presentation HTML files:

1. **Use shared.css** — All component styles live there. File-specific CSS goes in a `<style>` block.
2. **Use shared.js** — `footerHTML()`, `varCard()`, `statCell()`, `varTable()` are helpers. Chip event delegation is automatic.
3. **Validate** — Run `node validate.mjs your-file.html` to check backgrounds, typography, DataTable structure, etc.
4. **Test in browser** — `node server.mjs` → `http://localhost:3456`

### Common mistakes to avoid
- Using `bg-warning` (not a valid background token)
- Adding descriptions inside stat cells (use header zone instead)
- Carousel with <4 items (no peek effect — use Stats 3x1)
- Missing footer on content slides
- Wrong background: `bg-brand` on content slides or `bg-layer` on Start/End
- Inline font sizes that don't match the type scale (except TextSlide 72px body)
