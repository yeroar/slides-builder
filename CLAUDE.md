# Slide Presentations

Generate professional slide decks from free-text outlines, bullet points, or pasted content. Claude reads your content, picks the best template for each slide, and outputs a self-contained HTML file using a design system.

## Commands

```
npm start            # Preview server on :3456
npm run validate     # Check HTML files for design rule violations
```

## How it works

1. User pastes content (outline, bullet points, PDF text, meeting notes)
2. Claude analyzes item count, density, and content shape
3. Claude selects templates from the composition catalog (see below)
4. Claude generates an HTML file using `shared.css` + `shared.js`
5. User previews at `http://localhost:3456/your-file.html` (F5 = presentation mode)

## Key references (read on-demand)

- `templates.html` — **Source of truth** for all slide compositions. Open in browser to see every template rendered.
- `examples/credit-card.html` — 23-slide real presentation with chip variant switchers
- `examples/cryptoswitch.html` — 18-slide presentation (simpler reference)
- `COMPONENTS.md` — 22 components, layer hierarchy, all APIs
- `DESIGN_RULES.md` — 32 design rules (typography, layout, color, spacing, density)
- `AGENT_ONBOARDING.md` — Quick-start guide with patterns and code snippets

## Generated file structure

Every generated presentation HTML file MUST include:
1. **Annotation toolbar** — pin/comment buttons + clipboard export (provided by `initAnnotations`)
2. **Presentation mode** — F5 fullscreen slide viewer (provided by `initPresentation`)

Both are **required** in every generated file. Template:

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Presentation Title</title>
<link rel="stylesheet" href="shared.css">
<style>
  body { background: #1a1a1a; font-family: 'Geist', sans-serif; padding: 40px;
         display: flex; flex-direction: column; align-items: center; gap: 32px; }
  h1.page-title { color: #fff; font-size: 24px; font-weight: 500; margin-bottom: 8px; }
  .page-desc { color: #888; font-size: 14px; margin-bottom: 16px; width: 960px; }
</style>
</head>
<body>
<h1 class="page-title">Title</h1>
<div class="page-desc">Description</div>
<!-- Toolbar: pin count + annotation buttons. Always include this. -->
<div class="toolbar">
  <span id="pinCount" style="font-size:13px; color:#666;"></span>
  <span style="flex:1"></span>
  <button class="toolbar-btn" onclick="copyNotes()" title="Copy notes to clipboard" id="exportBtn">&#x1f4cb;</button>
  <button class="toolbar-btn" onclick="clearAllNotes()" title="Clear all annotations">&#x1f5d1;</button>
  <button class="toolbar-btn" onclick="startPresentation('.slide')" title="Present (F5)">&#x25B6;</button>
</div>

<!-- Slides go here -->
<div class="slide-label">#1 — <code>StartSlide</code></div>
<div class="slide"><div class="slide-inner bg-brand">...</div></div>

<script src="shared.js"></script>
<script>
// REQUIRED: enables per-slide + pin buttons for annotation
initAnnotations('presentation-name-pins');
// REQUIRED: enables F5 fullscreen presentation mode
initPresentation('.slide');
</script>
</body>
</html>
```

For files in `examples/`, use `href="../shared.css"` and `src="../shared.js"`.

**Never omit** `initAnnotations` or `initPresentation` — every presentation needs both.

## Hard constraints

- **Canvas**: 1920x1080 slides, rendered at 50% in preview (960x540)
- **Font**: Geist only (Regular 400, Medium 500, SemiBold 600)
- **Grid**: 12 columns, 64px margin, 12px gutter. Widths: 3col=439, 4col=589, 5col=740, 6col=890, 12col=1792
- **Weight rules**: H1-H5 Regular, H6 Medium, P1-P3 Regular/SemiBold, P5 Medium
- **Backgrounds**: `bg-brand` (#FFDD33) for Start/End slides ONLY. `bg-warning` (#FFF6D4) for ALL content slides.

## Vertical zones

```
y=64   → top margin / header start
y=305  → content zone start (header = 241px)
y=1016 → content zone end
y=1041 → footer start
y=1080 → slide bottom
```

## Content density limits

| Slide type | Max content |
|-----------|-------------|
| Start/End | 1 heading + 1 subtitle |
| TwoCol | 1 heading + 1 body + 1 visual |
| Cards (no image) | 1 header + 2-4 cards (max 4 bullets each), max 5 cols |
| Cards+Img | 1 header + 2-4 cards with images, **max 4 cols** (images need height) |
| Stats | 1 header + max 6 stat cells |
| DataTable | max 8 rows x 5 columns |
| TextSlide | 1 title + 1 body block |

Exceeds limits → split into multiple slides. Never cram.

## Composition catalog (22 templates)

| # | Group | Template | When to use |
|---|-------|----------|-------------|
| 1 | Structural | **Start** | Opening slide, brand yellow bg |
| 2 | Structural | **End** | Closing slide, brand yellow bg |
| 3 | Structural | **Agenda** | Section overview with bullet lines |
| 4 | Structural | **Section** | Between major sections, active/inactive items |
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

## Template selection heuristics

| Content shape | Best templates | Avoid |
|---|---|---|
| Short labels + big numbers | Stats, Proof | Cards (wastes space) |
| Bullets/descriptions per topic | Cards (2-4 col) | Stats (no room) |
| 2 topics with bullets | Cards 2col, Comparison | ThreeCol (odd number) |
| 2 opposing things | Comparison, Proof | ThreeCol (odd number) |
| Narrative + data | Side-by-side, Proof | Cards (can't do paragraphs) |
| Process/flow (4+ steps) | Carousel | Stats 3x1 (<4 items) |
| 3 milestones + descriptions | Stats 3x1 | Carousel (no peek) |
| Dense table data | DataTable | Cards (wrong shape) |
| Definitions by category | ThreeCol Cards (2 slides) | DataTable (too many rows) |

## Content processing principles

- **Don't overcomplicate** — stat cells just need title + number
- **Move context to header** — long text → `tl-stats` header H5 description
- **Simplify aggressively** — "U.S.-based waitlist signups" → title "Waitlist" + value "50k+"
- **Dense content → multiple slides**: 8+ bullet points → always split
- **Carousel needs 4+ items** (4th peeks off-screen). 3 items → Stats 3x1
- `$`, `>`, `<` symbols get de-emphasis color in stat cells and varCards
- **Partners LineItem**: show description OR chip, never both. 3 rows = description (no chip), 4 rows = chip (no description)
- **Side-by-side single row**: when both columns are `*x1` grids, position tables at `top: calc(37.5% + 24px)` instead of `top: 192px` — gives more header breathing room and taller cards
- **Text balance**: `text-wrap: balance` is set globally on `.slide-inner` — all text distributes line breaks evenly, no spiky orphan lines. Do not override with `text-wrap: pretty` or `wrap`
- **Consistent formatting**: Normalize all text to sentence case, straight quotes, consistent dash style (see DESIGN_RULES.md §34–37). No inline `<b>`/`<i>`/`<strong>`/`<em>` — use DS typography classes. Strip markdown and paste artifacts from user input.

## Variant chip pairing rules

When generating presentations with chip switchers, templates within the same group are offered as switchable variants on the same slide:

| Group | Variant chips | When to use |
|-------|---------------|-------------|
| **Thoughts** | Thoughts, Quote, TextSlide | Thoughts = short/sweet, Quote = attribution, TextSlide = detailed |
| **Product** | Cards, Cards 2col, Cards+Img, Cards 2col+Img, Features | Feature showcases with bullets/images |
| **Data** | Proof, Stats 2×1, Stats 3×1, Stats 2×2, Side-by-side, DataTable | Proof = descriptive narrative + numbers, Stats = short/punchy |

Never mix groups — a Proof slide should offer Stats variants, not Cards. A Cards slide should offer Features, not Stats.

### Description auto-follow-up rule

**Description** is a follow-up slide (N+1) after a high-level template. It adds detailed narrative for the preceding summary. Auto-generate when source content has both summary points and detailed explanation.

### Storytelling chain hints

Soft suggestions for what template follows naturally. Each template has a `suggestNext` array in the registry. The narrative logic:

| Story beat | Template role | Suggests next |
|---|---|---|
| **Open** | Start | → Agenda, Section, Thoughts |
| **Frame** | Agenda, Section | → Thoughts, TextSlide, Cards |
| **Claim** | Thoughts, TextSlide, Quote | → Cards, Features, Proof (claim → evidence) |
| **Explain** | Cards, Features, Description | → Proof, Stats (explain → prove) |
| **Prove** | Proof, Stats, DataTable | → Cards, Features, Section (data → next topic) |
| **Showcase** | Partners, Comparison | → Stats, Proof, TextSlide, End |
| **Flow** | Carousel | → Proof, Stats, Partners |

Key patterns:
- **Claim → Evidence**: Thoughts/TextSlide naturally flows into Proof/Stats
- **Explain → Prove**: Cards/Features followed by Proof/Stats backs up the feature story
- **Prove → Pivot**: After data slides, pivot to a new section or shift to product detail
- **Quote → Expand**: Quote sets the tone → Cards/Features break down the idea
- **Compare → Quantify**: Comparison shows A vs B → Stats/DataTable quantifies the gap
- **Showcase → Close**: Partners/Carousel near the end → TextSlide wrap-up → End
- **Deep Dive**: Section → Description → Cards → Proof (full topic arc within a section)
- These are hints, not rules — content always wins over sequencing suggestions

## Typography scale

| Style | Size | LH | Weight |
|-------|------|----|--------|
| H1 | 128 | 120 | Regular |
| H2 | 88 | 80 | Regular |
| H3 | 64 | 64 | Regular |
| H4 | 48 | 48 | Regular |
| H5 | 32 | 32 | Regular |
| H6 | 24 | 24 | Medium |
| P1 | 21 | 24 | Regular |
| P2 | 16 | 20 | Regular |
| P3 | 12 | 16 | Regular |
| P5 | 10 | 12 | Medium |
