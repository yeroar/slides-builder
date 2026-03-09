# Design Rules

Rules discovered and established while building the slide system. These override general defaults.

---

## Typography

### 1. Heading text balance
**Rule**: All display headings (H1–H4) use `text-wrap: balance`.
**Why**: Prevents short orphan lines when headings wrap. Distributes text evenly across lines.
**Scope**: H1–H4. Not H5/H6 (single-line labels).

- ✅ **Do**: `"Strategy & growth outlook for the next quarter"` balanced across 2 even lines
- ❌ **Don't**: `"Strategy & growth outlook for the` / `next quarter"` — short orphan second line

### 2. Currency/unit symbols are de-emphasized
**Rule**: `$` signs in stat values render at `rgba(60, 49, 43, 0.24)` (#3C312B @ 24%).
**Why**: The number is the data — the symbol is decoration. De-emphasizing it directs attention to the value.
**Scope**: All statistics components.

- ✅ **Do**: <span style="opacity:0.24">$</span>**4.2M** — faded symbol, bold number
- ❌ **Don't**: **$4.2M** — symbol competes with value for attention

---

## Layout

### 3. Background by slide type
**Rule**: Start and End slides use `--layer-brand` (yellow). All other slides use `--bg-warning-subtle`.
**Why**: Brand slides bookend the deck with full color. Content slides use a subtle warm tone to reduce visual fatigue.

- ✅ **Do**: Yellow Start slide → warm beige content slides → yellow End slide
- ❌ **Don't**: Yellow background on a data-heavy content slide — too much visual noise

### 4. textLayout/stats adapts per grid variant
**Rule**:
- **2x1** (default): Title column 683px + body column 589px, bottom-aligned. Disclaimer visible.
- **3x1**: Same header layout. Disclaimer hidden (cells are tall, need vertical space).
- **2x2**: Body hidden, title spans full 1792px width. More horizontal to match the wide 2×2 grid below.

**Why**: The header density should match the content density beneath it.

- ✅ **Do**: 2×2 grid → single-line full-width title (matches horizontal card layout)
- ❌ **Don't**: 2×2 grid → two-column title+body header (too dense above a wide grid)

---

## Spacing & Composition

### 5. Overlap threshold
**Rule**: Elements overlapping more than 5% of the smaller element's area are flagged.
**Why**: Small overlaps (< 5%) from rounding are acceptable. Larger overlaps indicate layout collision.

- ✅ **Do**: 2px overlap from rounding on a 400px card — 0.1%, acceptable
- ❌ **Don't**: Footer text overlapping a stat card by 30px — layout collision, fix positioning

### 6. Proximity ratio
**Rule**: Between-group spacing should be ≥ 2× within-group spacing.
**Why**: Gestalt proximity — related items cluster, distinct groups separate. 2× is our minimum (research says 2.5× but our size hierarchy compensates).

- ✅ **Do**: 16px between list items, 48px between sections (3× ratio)
- ❌ **Don't**: 16px between list items, 20px between sections — groups blur together

---

## Grid

### 7. Standard column spans
**Rule**: Use only these widths (derived from 12-col grid: 64px margin, 12px gutter):
```
3-col:  439px    4-col:  589px    5-col:  740px
6-col:  890px    7-col:  985px    12-col: 1792px
```
**Why**: Consistent widths across all templates. Formula: N × 138.33 + (N−1) × 12.

- ✅ **Do**: Text block at 740px (5-col) — snaps to grid
- ❌ **Don't**: Text block at 700px — arbitrary width, doesn't align to column boundaries

### 8. Statistics cell dimensions
**Rule**: Three stat cell variants, fixed sizes:
- **Horizontal**: 890 × 306px (H1 value) — used in 2×2
- **Large**: 890 × 590px (H1 value) — used in 2×1
- **Vertical**: flex × 711px (H2 value) — used in 3×1

**Why**: Matched to Figma component specs. Cell size determines value typography scale.

- ✅ **Do**: 2×1 layout → large cells (890×590) with H1-scale values
- ❌ **Don't**: 2×1 layout → horizontal cells (890×306) — too much empty space, wrong value scale

---

## TextLayout Width Assignment

### 9. Content type determines column width
**Rule**: Each TextLayout is locked to a grid-derived width:
- **5-col (740px)**: InfoText, MarCom — narrative text that needs line length control
- **6-col (890px)**: QuoteText — wider for dramatic pull quotes
- **4-col (589px)**: Compact, Vertical — sidebar/supporting text
- **7-col (985px)**: HeaderStack — display headers that need room to breathe
- **12-col (1792px)**: TextSlide — full-width statement slides

**Why**: Width is a function of content role, not container. Narrative text stays at 75–85 CPL. Display text goes wider. Support text goes narrower.

- ✅ **Do**: InfoText narrative at 740px — body text hits ~80 CPL
- ❌ **Don't**: InfoText narrative at 1792px — body text hits ~180 CPL, unreadable line length

---

## Gap Hierarchy

### 10. Three-tier gap system
**Rule**: Gaps between elements follow three tiers:
- **Tight (0–16px)**: Grouped items — author name + title (0px), list items (16px), compact paragraphs (8px)
- **Standard (40–128px)**: Title → body separation — HeaderStack (40px), Vertical (48px), InfoText/MarCom (128px)
- **Structural (162–205px)**: Major section breaks — TwoCol column gap (162px), TextSlide (192px), QuoteText quote→author (205px)

**Why**: Three tiers create clear visual grouping without arbitrary values. Tight binds related items, standard separates hierarchy levels, structural divides independent sections.

- ✅ **Do**: Author name + title at 0px gap, then 205px to the quote above — clear grouping
- ❌ **Don't**: Author name + title at 48px gap, then 64px to the quote — everything equidistant, no grouping

---

## Color Roles

### 11. Yellow.500 is accent-only
**Rule**: `yellow.500` (#D1A300) is reserved for:
- Accent headings in MarCom (second H2 line)
- Quote marks (`"` `"`) in QuoteText
- Author title/role text in QuoteText
- Stats accent line decoration
- **Short category labels** in header zones (see Rule 11a)

**Never** for: body text, disclaimers, primary headings, or backgrounds (that's `layer.brand`).

**Why**: Yellow.500 is a semantic signal for "accent highlight." Overuse dilutes its purpose.

- ✅ **Do**: `"CEO, Acme Corp"` in yellow.500 — small accent label under author name
- ❌ **Don't**: An entire body paragraph in yellow.500 — accent color loses its signal

### 11a. Header zone: short yellow label + descriptive primary title
**Rule**: Multi-column content slides (ThreeCol, FourCol, Stats, Comparison) use a two-line header zone at y=64:
- **Line 1** (H3, yellow.500): Short category label — 1–2 words (e.g., "Markets", "Investment", "Platform")
- **Line 2** (H3, face.primary): Descriptive title — fits on one line, states the slide's point

The yellow label is always shorter than the primary title. They are **not** balanced in length — the label categorizes, the title communicates.

**Why**: The yellow label acts as a section tag that orients the viewer before they read the title. If both lines are similar length, the hierarchy collapses — the viewer doesn't know which line to read first. A short label + longer title creates instant scan order.

- ✅ **Do**: `"Markets"` (yellow) / `"Stablecoins vs investment focus"` (primary) — label categorizes, title explains
- ✅ **Do**: `"Investment"` (yellow) / `"$758,020 initial capital required"` (primary) — 1 word vs full statement
- ❌ **Don't**: `"Market approach overview"` (yellow) / `"Stablecoins vs investment"` (primary) — similar lengths, no scan hierarchy
- ❌ **Don't**: Both lines balanced at ~5 words each — looks like two equal titles, not label + title

### 12. Face.tertiary is attribution/meta
**Rule**: `face.tertiary` (#7A6E53) is reserved for:
- Author names (QuoteText)
- VariableCard titles (label above value)
- Disclaimer/source text

**Never** for: primary headings, body text, or interactive elements.

**Why**: Tertiary color signals "supporting information" — read if you want, skip if you don't.

- ✅ **Do**: `"Source: Internal analytics, Q1 2026."` in face.tertiary — clearly secondary
- ❌ **Don't**: Slide title in face.tertiary — looks broken, hierarchy is inverted

---

## Typography Pairing

### 13. Minimum one scale step between paired sizes
**Rule**: When pairing header + body in a TextLayout, maintain ≥1 step gap in the type scale:
- ✅ H2 (96) + H4 (48) — InfoText, QuoteText
- ✅ H4 (48) + P1 (24) — Vertical default
- ✅ H5 (32) + P3 (16) — Vertical small
- ⚠️ H2 (88) + H2 (88) — only MarCom (differentiated by color) or Thoughts (same color, differentiated by content)
- ❌ H3 (64) + H4 (48) — too close, no clear hierarchy

**Why**: Adjacent scale steps lack sufficient contrast to establish visual hierarchy. The eye needs a clear size jump to parse structure.

- ✅ **Do**: H2 title (96px) with H4 body (48px) — 2:1 ratio, instant hierarchy
- ❌ **Don't**: H3 title (64px) with H4 body (48px) — 1.33:1 ratio, looks like two titles

---

## Slot & Template Patterns

### 14. TwoCol asymmetric split
**Rule**: TwoCol always uses 5-col text (740px) + 6-col fill (890px) with a 1-col gap (162px).
- Text side gets the narrower slot (better line length)
- Visual/data side gets the wider slot (more room for tables, cards, images)

**Why**: Asymmetry creates visual interest. The narrower text column keeps CPL in the 75–85 range.

- ✅ **Do**: Left text 740px + right table 890px — text is readable, table has room
- ❌ **Don't**: Two equal 890px columns — text lines are too long, table is unnecessarily cramped

### 15. ThreeCol / FourCol share a vertical start line
**Rule**: Both ThreeCol and FourCol templates start content at **y=305** with **711px** card height.
- Header zone: y=64 → y=305 (241px)
- Content zone: y=305 → y=1016 (711px)

**Why**: Consistent vertical alignment across multi-column layouts. Mixing start positions breaks visual rhythm when slides are adjacent in a deck.

- ✅ **Do**: ThreeCol cards start at y=305, FourCol cards start at y=305 — aligned in deck
- ❌ **Don't**: ThreeCol at y=230, FourCol at y=305 — jarring jump when slides are adjacent

### 15a. Cards composition — header + feature cards
**Rule**: The Cards composition combines a `tl-stats` header zone (Rule 11a) with TwoCol, ThreeCol, or FourCol `feature-card-noimg` cards below y=305. Structure:
- **Header** (y=64): Yellow label (H3) + primary title (H3), optional description (H5) and disclaimer (P3)
- **Cards** (y=305, 711px): 3 or 4 `feature-card-noimg` columns, each with H5 title + bulleted H5 list items

This is the standard layout for enumerating categories, capabilities, cost breakdowns, or differentiators. Each card represents one concept with 1–4 supporting bullets.

**Why**: Cards partition qualitative information into scannable groups. The header provides context (what these cards are about), while each card is self-contained and can be read independently.

- ✅ **Do**: "Revenue streams" header + 3 cards (Interchange, Interest, Subscriptions) — each card is one revenue type
- ✅ **Do**: "Differentiation" header + 4 cards — one differentiator per card, 1–2 bullets each
- ❌ **Don't**: 5+ cards on one slide — split into two slides
- ❌ **Don't**: Cards with 6+ bullets — condense or split the concept

### 16. Footer is universal on content slides
**Rule**: Every content slide (ContentTemplate, TwoCol, ThreeCol, FourCol) includes a Footer at **y=1041**, spanning 1792px.
- Start and End slides: **no footer** (brand slides stand alone)

**Why**: Footer anchors the bottom of every content slide with consistent metadata (title, copyright, page number). Brand slides are intentionally clean.

- ✅ **Do**: Content slide with footer at y=1041 — consistent bottom anchor
- ❌ **Don't**: Content slide without footer — bottom feels unfinished, no page number

---

## Typography Fundamentals

Universal typography principles applied to our slide system.

### 17. One typeface, multiple weights
**Rule**: Use only Geist across the entire system. Differentiate hierarchy through weight (Regular 400, Medium 500, SemiBold 600), size, and color — never by switching typefaces.

**Why**: One well-designed typeface with weight variation creates cohesion. Multiple typefaces compete for attention and rarely improve readability. Decorative fonts are never appropriate in data-driven presentations.

- ✅ **Do**: Geist Regular for headings, Geist Medium for labels, Geist SemiBold for emphasis
- ❌ **Don't**: Geist for headings + Roboto for body + Playfair for quotes — three typefaces fighting

### 18. Contrast through size, not decoration
**Rule**: Create font contrast through size jumps (≥2× between primary and tertiary levels), weight shifts (Regular → SemiBold), or color changes. Never through decoration (underline, shadow, outline, stretched text).

**Why**: Size and weight contrast preserves the typeface's designed proportions. Decorative effects distort letterforms and reduce legibility at slide scale.

- ✅ **Do**: H2 (96px Regular) → P1 (24px Regular) — size alone creates hierarchy
- ❌ **Don't**: Same size text with underline + shadow + outline to create emphasis

### 19. Left alignment by default
**Rule**: All body text, headings, and labels use left alignment.
- **Center alignment**: only for Start/End slide titles (single-line, central composition)
- **Justified alignment**: never used — it creates uneven word spacing
- **Right alignment**: only for numeric columns in tables

**Why**: Left-aligned text creates a consistent left edge that the eye returns to naturally. Slides are scanned, not read — a ragged right edge is preferable to uneven spacing.

- ✅ **Do**: Left-aligned body text with natural ragged right edge
- ❌ **Don't**: Justified body text with rivers of white space between words

### 20. Characters per line (CPL) targets
**Rule**: Line lengths must stay within these bounds:
- **Title/heading**: 30–45 characters (H1–H3)
- **Body text**: 55–85 characters (P1–P2 in 5-col or 6-col)
- **Support text**: 40–60 characters (P3–P4 in 4-col)

Column widths (Rule 9) are designed to hit these targets at their respective font sizes.

**Why**: Lines too short break reading rhythm. Lines too long cause the eye to lose its place returning to the left edge. 40–70 CPL is the established readable range; slides skew shorter because they're projected, not held.

- ✅ **Do**: P1 body at 740px → ~78 CPL — comfortable reading
- ❌ **Don't**: P1 body at 1792px → ~190 CPL — eye loses its place on return

### 21. Leading ratio varies by role
**Rule**: Line height follows the element's function:
- **Display headers** (H1–H5): 1:1 ratio (size = leading) or tighter — tight leading for visual impact
- **Body text** (P1–P2): 1.3–1.5× — generous leading for readability
- **Small text** (P3–P5): 1.4–1.5× — needs even more air at small sizes

Headers at 1.5× leading look disconnected. Body at 1:1 leading is unreadable. Match the ratio to the role.

**Why**: Display type is read as a shape (tight = punchy). Body type is read word-by-word (loose = comfortable). The 150% "default" only works for body; applying it everywhere creates lifeless hierarchy.

- ✅ **Do**: H2 at 96/88 (0.92×) — tight, punchy display. P1 at 24/32 (1.33×) — open, readable body
- ❌ **Don't**: H2 at 96/144 (1.5×) — floaty disconnected header. P1 at 24/24 (1×) — cramped body

### 22. No widows, orphans, or hanging prepositions
**Rule**: Slide text must avoid:
- **Widows**: a single word alone on the last line of a paragraph
- **Orphans**: a paragraph's first line stranded at the bottom of a column
- **Hanging prepositions**: short words (a, an, the, of, in, to) alone at the end of a line before a break

Use `text-wrap: balance` for headings (Rule 1). For body text, rewrite or adjust line breaks manually.

**Why**: These artifacts signal careless typesetting. On slides (where every line is visible at once), widows and orphans are especially noticeable and break the visual rhythm.

- ✅ **Do**: `"Revenue grew 52% driven by` / `enterprise and mid-market segments"` — balanced
- ❌ **Don't**: `"Revenue grew 52% driven by enterprise and mid-market` / `segments"` — widow

### 23. White space is structural, not empty
**Rule**: Unused space in a slide is intentional. Do not fill gaps with decorative elements, unnecessary text, or stretched content.
- The three-tier gap system (Rule 10) creates deliberate white space
- Margins (64px) and structural gaps (162–205px) are load-bearing — they separate meaning

**Why**: White space gives the eye a place to rest and creates contrast with dense elements. Filling it reduces the signal-to-noise ratio. A slide with breathing room communicates more confidently than one packed with content.

- ✅ **Do**: TwoCol with 162px gap between text and visual — breathing room
- ❌ **Don't**: Filling the 162px gap with a decorative line or extra label — cluttered

### 24. Never deform letterforms
**Rule**: Never stretch, compress, skew, or artificially bold text. Use only the weights and styles provided by Geist (Regular, Medium, SemiBold).
- No horizontal/vertical scaling
- No faux bold (CSS `stroke` or Figma stroke on text)
- No faux italic (skew transform)

**Why**: Type designers spend months optimizing letter proportions. Stretching destroys optical spacing, x-height relationships, and stroke contrast. If you need wider text, use a larger size. If you need heavier text, use a heavier weight.

- ✅ **Do**: Switch from Regular to SemiBold for emphasis — proper weight
- ❌ **Don't**: Add 1px stroke to Regular to fake bold — uneven stroke destroys letterforms

### 25. Em dash, en dash, hyphen
**Rule**: Use the correct dash for each context:
- **Hyphen** (-): compound words, hyphenation (e.g., "year-over-year")
- **En dash** (–): numeric ranges (e.g., "Q1–Q4", "2024–2026")
- **Em dash** (—): sentence breaks (e.g., "Revenue grew — driven by enterprise")

**Why**: Correct punctuation is a signal of quality. In data-heavy slides, en dashes in ranges vs hyphens in words prevents misreading (is "10-12" a range or a code?).

- ✅ **Do**: `"Q1–Q4 2026"` with en dash — clearly a range
- ❌ **Don't**: `"Q1-Q4 2026"` with hyphen — ambiguous, looks like a code or typo

### 26. Avoid all-caps except labels
**Rule**: ALL CAPS text is reserved for:
- Tiny labels and tags (P5 scale, 10px) — e.g., "REVENUE", "Q1 2026"
- Table column headers at small sizes

**Never** for: headings, body text, or any text longer than ~3 words.

**Why**: All-caps reduces reading speed by ~15% because word shapes become uniform rectangles. At small label sizes this is acceptable (short, scannable). At heading scale it's aggressive and hard to parse.

- ✅ **Do**: `"REVENUE"` as a 10px table header — short, scannable label
- ❌ **Don't**: `"STRATEGY & GROWTH OUTLOOK FOR THE NEXT QUARTER"` as H2 — wall of rectangles

---

## Type Scale Roles

Each level in the scale has a declared purpose. Choosing a size means choosing a role — not just "making it bigger."

### 27. Scale categories have fixed roles
**Rule**: Every type level maps to a specific content role:

| Level | Size/Leading | Weight | Role | Used for |
|-------|-------------|--------|------|----------|
| H1 | 128/120 | Regular | Display | Start/End slide titles only |
| H2 | 96/88 | Regular | Headline | Primary slide heading, pull quotes |
| H3 | 64/64 | Regular | Title | Stat values (large), accent titles |
| H4 | 48/48 | Regular | Subtitle | Secondary headings, InfoText body, author text |
| H5 | 32/32 | Regular | Label (lg) | Card headers, stat labels, section names |
| P1 | 24/32 | Regular | Body | Narrative paragraphs, Vertical body |
| P2 | 20/28 | Regular | Body (sm) | Compact body, VariableCard titles |
| P3 | 16/24 | Regular | Caption | Disclaimers, source lines, Compact body |
| P4 | 14/20 | Regular | Overline | Fine print, legal, footnotes |
| P5 | 10/12 | Medium | Micro | Footer copyright, table column headers |

**Why**: Consistent role mapping prevents ad-hoc size picking. When a designer sees H4, they know it's a subtitle — not "48px because it looked right." Material Design's 13-level scale works the same way: each category carries meaning, not just measurements.

- ✅ **Do**: Use H5 (32px) for a card header label — that's its defined role
- ❌ **Don't**: Use H3 (64px) for a card header because "it needs to be bigger" — H3 is for stat values/titles

### 28. Hierarchy cues: max 3 per level
**Rule**: Each text level is differentiated from adjacent levels using a combination of these cues (max 3):
1. **Size** — primary differentiator (always present)
2. **Weight** — Regular vs Medium vs SemiBold
3. **Color** — face.primary vs face.tertiary vs yellow.500
4. **Case** — sentence case vs uppercase (P5 labels only)
5. **Letter spacing** — tighter for display, neutral for body

Never use more than 3 cues simultaneously. If size alone creates sufficient contrast (≥2× jump), additional cues are unnecessary.

**Why**: Too many simultaneous changes between levels (size + weight + color + case + spacing) create visual noise instead of hierarchy. Three cues is the maximum the eye can process as "one level shift."

- ✅ **Do**: H2→P1 differentiated by size (96→24) + color (primary→secondary) — 2 cues, clear
- ❌ **Don't**: H2→P1 with size + weight + color + case + spacing all changing — overwhelming

### 29. Expressive treatment restricted to display scale
**Rule**: Creative typographic treatment (split-color text, hanging punctuation, asymmetric sizing) is only permitted at the **display scale** (H1–H2):
- ✅ MarCom split H2 — primary + yellow accent
- ✅ QuoteText hanging `"` marks at H2 scale
- ✅ Start slide H1 with brand background

At body scale (P1–P3) and label scale (H5, P4–P5): strictly Regular weight, single color, no decoration.

**Why**: Display type is read as a visual landmark — expressive treatment draws the eye. Body and caption text is read linearly — any decoration becomes distraction. Material Design applies the same boundary: expressive fonts for headlines only, never for body or caption.

- ✅ **Do**: Yellow `"` marks on H2 quote text — expressive at display scale
- ❌ **Don't**: Yellow `"` marks on P3 disclaimer text — decoration at caption scale, distracting

### 30. Letter spacing tightens with size
**Rule**: Tracking follows an inverse relationship with size:
- **H1** (128px): -2.56px (-0.02em)
- **H2** (96px): -1.92px (-0.02em)
- **H3** (64px): -1.28px (-0.02em)
- **H5** (32px): -0.64px (-0.02em)
- **P1** (24px): -0.24px (-0.01em)
- **P3** (16px): -0.16px (-0.01em)
- **P5** (10px): 0 (neutral)

Large text needs tighter spacing because letterforms at display size have optically wide sidebearings. Small text needs neutral or positive spacing for legibility.

**Why**: Type designers optimize metrics for ~12–16px reading size. At 96px+ those same metrics create visible gaps between letters. Negative tracking at display size restores visual density without sacrificing readability.

- ✅ **Do**: H2 at -1.92px tracking — letters sit together as a cohesive word shape
- ❌ **Don't**: H2 at 0 tracking — visible gaps between letters, looks spaced out

---

## Content & Weight

### 31. Content density limits per slide
**Rule**: Each slide type has a maximum content budget:

| Slide type | Max content |
|-----------|-------------|
| Start/End | 1 heading + 1 subtitle |
| TwoCol | 1 heading + 1 body paragraph + 1 visual |
| TwoCol Features | 1 heading + 1 body + max 3 feature rows (image + title + desc) |
| ThreeCol/FourCol Cards | 1 header (yellow label + title) + 3–4 feature cards (title + max 4 bullets each) |
| Stats | 1 header + max 6 stat cells |
| DataTable | max 8 rows × 5 columns |
| TextSlide | 1 title + 1 body block |
| Comparison | 1 header + 2 compare blocks with chips |

Exceeds limits → split into multiple slides. Never cram, never scroll.

**Why**: Slides are projected at distance and scanned in seconds. Overloaded slides force the audience to read instead of listen. Splitting preserves pacing and lets each idea land.

- ✅ **Do**: 7 stats → split into two slides (4 + 3) with clear titles
- ❌ **Don't**: 7 stats crammed into one slide with tiny text — audience can't parse it

### 32. Weight assignment by scale
**Rule**: Font weight follows a fixed mapping:
- **H1–H5**: Regular 400 always — display/heading type relies on size for hierarchy, not weight
- **H6**: Medium 500 — micro label role, needs slight weight boost for legibility at 24px
- **P1–P4**: Regular 400 default, SemiBold 600 for emphasis spans
- **P5**: Medium 500 — footer/micro text, same rationale as H6

**Why**: Regular headings let size do the work. Medium at H6/P5 compensates for small size — at 24px and below, Regular 400 looks thin on projected slides. SemiBold 600 is reserved for inline emphasis within body text, never for full blocks.

- ✅ **Do**: H3 (64px) in Regular 400 — size alone commands attention
- ❌ **Don't**: H3 (64px) in SemiBold 600 — heavy weight at display size feels aggressive
