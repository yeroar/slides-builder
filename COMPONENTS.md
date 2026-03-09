# Slide Presentation System — Component Documentation

## Overview

A Figma Slides plugin component system for programmatically building slide presentations. Components are organized in three layers:

```
Start / End Slides
    |
Templates (ContentTemplate, TwoColLeft, TwoColRight, ThreeCol, FourCol)
    |
Slots (AgendaSlot, SectionSlot)
    |
Text Layouts (InfoText, MarCom, QuoteText, Stats, Vertical, Compact, HeaderStack, FeatureCol, TextSlide)
    |
Primitives (Line, Bullet, Section, Footer)
```

All components create Figma nodes and return them — the caller is responsible for appending to a parent. Font: **Geist** family throughout. Slide canvas: **1920 x 1080**.

---

## Color Tokens

Defined in `src/plugin/tokenColors.ts`. All values are RGB 0-1 range for Figma API.

| Token | Hex | Usage |
|-------|-----|-------|
| `face.primary` | `#383323` | Main text |
| `face.secondary` | `#593A3A` | Subtitle text |
| `face.tertiary` | `#7A6E53` | Tertiary / list items |
| `face.disabled` | `#BBAF93` | Inactive elements |
| `face.accentBold` | `#0066FF` | Active / accent text |
| `face.inversePrimary` | `#FCFAF2` | Inverse text |
| `yellow.500` | `#D1A300` | Accent highlights |
| `object.accent.bold` | `#2F91FF` | Accent line |
| `object.accent.subtle` | `#E6F7FF` | Subtle blue bg |
| `object.secondary.default` | `#ECE7D8` | Beige |
| `bg.warningSubtle` | `#FFF7D6` | Light yellow bg |
| `layer.background` | `#FCFAF2` | Slide background |
| `layer.brand` | `#FFDD33` | Brand yellow |
| `grayAlpha.800` | `rgba(89,80,58,0.24)` | Transparent brown |
| `grayAlpha.900` | `rgba(56,51,35,0.24)` | Footer text |

Helpers: `toSolidPaint(color)` and `toRGB(color)`.

---

## Primitives

### Line

```typescript
createLine(opts?: { variant?: "accent" | "default"; width?: number; height?: number }): RectangleNode
```

Horizontal decorative dash. Rounded corners (`cornerRadius = height / 2`).

| Param | Default | Description |
|-------|---------|-------------|
| `variant` | `"accent"` | `"accent"` = blue (`object.accent.bold`), `"default"` = gray (`face.disabled`) |
| `width` | `105` | Rectangle width |
| `height` | `10` | Rectangle height |

**Figma node:** `9kV4myLYtBd44bUPy7gdBu` → `1:1886`

---

### Bullet

```typescript
createBullet(opts: { text: string; variant?: "accent" | "default" }): Promise<BulletResult>
```

Line + large heading text in a horizontal row.

| Param | Default | Description |
|-------|---------|-------------|
| `text` | *required* | Bullet text |
| `variant` | `"accent"` | `"accent"` = blue text, `"default"` = gray text |

**Returns:** `{ frame: FrameNode, line: RectangleNode, text: TextNode }`

**Typography:** Geist Regular 128px / 120px line-height

**Layout:** Horizontal, gap 6px, cross-axis centered

**Figma node:** `1:1807`

---

### Section

```typescript
createSection(opts: { text: string; variant?: "accent" | "default"; width?: number }): Promise<TextNode>
```

Large section heading text.

| Param | Default | Description |
|-------|---------|-------------|
| `text` | *required* | Heading text |
| `variant` | `"accent"` | `"accent"` = `face.primary`, `"default"` = `grayAlpha.800` |
| `width` | `1803` | Text node width |

**Typography:** Geist Regular 128px / 120px line-height, auto-resize HEIGHT

**Figma node:** `1:1822`

---

### Footer

```typescript
createFooter(opts?: { width?: number; presentationTitle?: string; pageNumber?: number }): Promise<FrameNode>
```

3-column slide footer: title | copyright | page number.

| Param | Default | Description |
|-------|---------|-------------|
| `width` | `1792` | Footer width |
| `presentationTitle` | `"Presentation title"` | Left column text |
| `pageNumber` | `1` | Right column number |

**Fixed:** Copyright always `"© Fold Holdings, Inc. 2026"`

**Typography:** Geist Medium 10px / 12px line-height, color `grayAlpha.900`

**Layout:** Horizontal, gap 12px. Title 890px fixed, copyright fill, page number auto.

**Figma node:** `3:928`

---

## Start & End Slides

Special-purpose slides for the beginning and end of a presentation. Both use `layer.brand` (bright yellow) background.

### StartSlide

```typescript
applyStartSlide(slide: SlideNode, opts?: { title?: string; date?: string }): Promise<void>
```

Opening slide with presentation title and date.

| Param | Default | Typography |
|-------|---------|------------|
| `title` | `"Presentation title"` | H1: Geist Regular 128px / 120px, ls -2.56px, `face.primary` |
| `date` | `""` | H1: Geist Regular 128px / 120px, ls -2.56px, `yellow.500` |

**Layout:** Title frame at (53, 805), width 1803px, vertical gap 20px. Background: `layer.brand` (yellow).

**Figma node:** `17:1020`

---

### EndSlide

```typescript
applyEndSlide(slide: SlideNode): Promise<void>
```

Closing slide with fixed "Thank you" text.

**Typography:** Geist Medium 128px / 120px, ls -2.56px, `face.primary`

**Layout:** Text at (53, 875). Background: `layer.brand` (yellow). No configurable props.

**Figma node:** `17:1021`

---

## Slide Templates

Templates apply layout to a `SlideNode`. They set the background, create content slots, and add a footer. All accept `{ presentationTitle?, pageNumber? }`.

### ContentTemplate (1-column)

```typescript
applyContentTemplate(slide: SlideNode, opts?): Promise<ContentTemplateResult>
// Returns: { slot: FrameNode, footer: FrameNode }
```

Single full-width slot.

| Property | Value |
|----------|-------|
| Background | `bg.warningSubtle` (light yellow) |
| Slot position | (64, 64) |
| Slot width | 1792px |
| Footer position | (64, 1041) |

**Figma node:** `5:888`

---

### TwoColLeftTemplate

```typescript
applyTwoColLeftTemplate(slide: SlideNode, opts?): Promise<TwoColLeftTemplateResult>
// Returns: { textSlot: FrameNode, contentSlot: FrameNode, footer: FrameNode }
```

Text on left (fixed 740px), content on right (fill).

| Property | Value |
|----------|-------|
| Background | `layer.background` (off-white) |
| Content area | (64, 64), 1793 x 952 |
| Gap | 162px |
| Left (textSlot) | 740px fixed |
| Right (contentSlot) | Fill remaining |

**Figma node:** `17:1018`

---

### TwoColRightTemplate

```typescript
applyTwoColRightTemplate(slide: SlideNode, opts?): Promise<TwoColRightTemplateResult>
// Returns: { contentSlot: FrameNode, textSlot: FrameNode, footer: FrameNode }
```

Content on left (fill), text on right (fixed 740px).

| Property | Value |
|----------|-------|
| Background | `layer.background` (off-white) |
| Content area | (64, 64), 1793 x 952 |
| Gap | 162px |
| Left (contentSlot) | Fill remaining |
| Right (textSlot) | 740px fixed |

**Figma node:** `17:1019`

---

### SlideTemplate (2col / 3col / 4col)

```typescript
applySlideTemplate(slide: SlideNode, opts?: { colNumber?: "2col" | "3col" | "4col" }): Promise<SlideTemplateResult>
// Returns: { slots: FrameNode[], header: FrameNode, footer: FrameNode }
```

Unified multi-column template with integrated `textLayout/headers` section. All variants include a header zone (yellow H4 label + primary H4 subheader + H5 description + P3 footnotes) and equal-width columns.

| Variant | Columns | Column height | Gap |
|---------|---------|--------------|-----|
| `"2col"` | 2 x fill | 711px | 12px |
| `"3col"` | 3 x fill | 711px | 12px |
| `"4col"` | 4 x fill | 711px | 12px |

| Property | Value |
|----------|-------|
| Background | `layer.background` (#FCFAF2) |
| Header zone | y=64, width 1792px (H4 yellow label + H4 primary title + H5 description + P3 footnotes) |
| Column zone | y=305, height 711px |
| Footer | y=1041, width 1792px |

**Figma nodes:** `88:1518` (2col), `67:1103` (3col), `18:1317` (4col)

> **Note**: The existing `ThreeColTemplate` and `FourColTemplate` APIs still work. The 2col variant is new.

---

### ThreeColTemplate (legacy)

```typescript
applyThreeColTemplate(slide: SlideNode, opts?): Promise<ThreeColTemplateResult>
// Returns: { slots: [FrameNode, FrameNode, FrameNode], footer: FrameNode }
```

Three equal-width columns. Now part of the unified SlideTemplate (colNumber="3col").

| Property | Value |
|----------|-------|
| Background | `layer.background` (off-white) |
| Content area | (64, 64), 1793 x 952 |
| Gap | 13px |
| Columns | 3 x fill |

**Figma node:** `67:1103`

---

### FourColTemplate (legacy)

```typescript
applyFourColTemplate(slide: SlideNode, opts?): Promise<FourColTemplateResult>
// Returns: { slots: [FrameNode, FrameNode, FrameNode, FrameNode], footer: FrameNode }
```

Four equal-width columns with a section header at top.

| Property | Value |
|----------|-------|
| Background | `layer.background` (off-white) |
| Section header | (64, 64), 1160px wide, yellow accent + primary title (H4 48px) |
| Slot size | 439 x 711px each |
| Slot gap | 12px |
| Slot Y | ~305px |
| Disclaimer | Optional 10px caption below header |

**Figma node:** (no Code Connect)

---

## Slots

Slots are list components designed to fill a ContentTemplate slot.

### AgendaSlot

```typescript
createAgendaSlot(opts: { items: string[]; activeIndex?: number; width?: number }): Promise<FrameNode>
```

Vertical stack of `Bullet` components with active state.

| Param | Default | Description |
|-------|---------|-------------|
| `items` | *required* | Array of bullet strings |
| `activeIndex` | `0` | Which item is highlighted (accent) |
| `width` | `1760` | Frame width |

**Layout:** Vertical, gap 12px. Active bullet = "accent", others = "default".

**Figma node:** `5:910`

---

### SectionSlot

```typescript
createSectionSlot(opts: { items: string[]; activeIndex?: number; width?: number }): Promise<FrameNode>
```

Vertical stack of `Section` components with active state.

| Param | Default | Description |
|-------|---------|-------------|
| `items` | *required* | Array of heading strings |
| `activeIndex` | `0` | Which item is highlighted |
| `width` | `1760` | Frame width |

**Layout:** Vertical, gap 12px. Active section = "accent", others = "default".

**Figma node:** `8:1022`

---

## Text Layouts

Reusable text blocks for placing inside template slots. All in `src/plugin/components/textLayout/`.

### InfoText

```typescript
createInfoText(opts?: { slideTitle?: string; body?: string; width?: number }): Promise<FrameNode>
```

Title + body with large spacing.

| Param | Default | Typography |
|-------|---------|------------|
| `slideTitle` | `""` | H2: Geist Regular 96px / 88px, `face.primary` |
| `body` | `""` | H4: Geist Regular 48px / 48px, `face.secondary` |

**Layout:** Vertical, gap 128px, width 740px

**Figma node:** `8:1074`

---

### MarCom (TextLayoutH2Pair)

```typescript
createMarCom(opts?: { body?: string; accentText?: string; variant?: "marCom" | "thoughts"; width?: number }): Promise<FrameNode>
```

Two large headings in a vertical stack. Two variants:

| Variant | Body color | Accent color | Use case |
|---------|-----------|-------------|----------|
| `"marCom"` (default) | `face.primary` | `yellow.500` | Marketing headline with yellow accent |
| `"thoughts"` | `face.primary` | `face.primary` | Two-paragraph statement, same color |

| Param | Default | Typography |
|-------|---------|------------|
| `body` | `""` | H2: Geist Regular 88px / 80px, ls -2.2px |
| `accentText` | `""` | H2: Geist Regular 88px / 80px, ls -2.2px |

**Layout:** Vertical, gap 128px, width 740px

**Figma nodes:** `9:1098` (marCom), `88:1175` (thoughts)

---

### QuoteText

```typescript
createQuoteText(opts?: { quote?: string; fullName?: string; titles?: string; width?: number }): Promise<FrameNode>
```

Large quote with author attribution.

| Param | Default | Typography |
|-------|---------|------------|
| `quote` | `""` | H2: Geist Regular 96px / 88px, `face.primary`, indent -43px |
| `fullName` | `""` | H4: Geist Regular 48px / 48px, `face.primary` |
| `titles` | `""` | H4: Geist Regular 48px / 48px, `yellow.500` |

**Layout:** Vertical, gap 205px, width 890px. Author block is a nested vertical frame (no gap) containing fullName + titles.

**Figma node:** `9:1102`

---

### Stats

```typescript
createStats(opts?: { accentTitle?: string; slideTitle?: string; body?: string; footnotes?: string; layout?: "horizontal" | "columns"; width?: number; titleWidth?: number }): Promise<FrameNode>
```

Section header with optional body and footnotes. Two layout modes:

| Layout | Description |
|--------|-------------|
| `"columns"` (default) | Accent (yellow H3) + title (primary H3) stacked in left column (683px), body (H5, secondary) in right column (589px), bottom-aligned |
| `"horizontal"` | Accent + title inline in one H3 text node, full width |

Both layouts share a 64px gap to optional footnotes (P3 12px, tertiary, 792px).

**Typography:** Geist Regular/Medium 64px / 64px, ls -1.28px
**Figma node:** `31:711` (component set with `variant` enum: full → columns, horizontal → horizontal)

---

### TextSlide

```typescript
createTextSlide(opts?: { title?: string; body?: string; subtitle?: string; width?: number }): Promise<FrameNode>
```

Full-width statement slide with yellow accent title, H3 primary body, and optional H3 secondary subtitle.

| Property | Style | Details |
|----------|-------|---------|
| `title` | H4 48px Regular | yellow/500 accent label |
| `body` | H3 64px Regular | face/primary, main statement |
| `subtitle` | H3 64px Regular | face/secondary, supporting text |

**Layout:** Vertical, gap 48px, width 1792px (full content area)

**Figma node:** `18-1225`

**Example (slide 12):**
- title: "Differentiation"
- body: "No points. No miles. No categories to track.\nJust Bitcoin, directly to your account."
- subtitle: "Flat-rate simplicity meets long-term growth.\nEvery swipe builds wealth that can appreciate over time."

---

### Chip

```typescript
createChip(opts?: { label?: string }): Promise<FrameNode>
```

Small blue pill label. P2 16px/20px, 8px horizontal padding, 24px height, 3px radius.

| Property | Style |
|----------|-------|
| Background | `#e9f2ff` (blue subtle) |
| Text | `#0c66e4` (blue accent), P2 16px Regular |

**Figma node:** `83:1314`

---

### LogoCard

```typescript
createLogoCard(opts?: { name?: string; chipLabel?: string; width?: number; height?: number }): Promise<FrameNode>
```

Logo placeholder + brand name + chip. 445×238px, 24px padding, gold border, layer/secondary bg.

| Property | Style |
|----------|-------|
| `name` | P2 16px Regular, face/tertiary |
| `chipLabel` | Chip component |
| Border | 0.5px yellow/500 |

**Figma node:** `83:1120`

---

### Partners (template)

```typescript
applyPartnersTemplate(slide, opts?: { items?: LogoCardOpts[]; footer?: FooterOpts }): Promise<PartnersTemplateResult>
```

Two side-by-side panels (890×952px) at y=64, each with a 2×4 grid of LogoCards. White bg, gold border, 12px radius. Up to 16 items (8 per panel).

**Figma node:** `1:759`

---

### Vertical

```typescript
createVertical(opts?: { title?: string; body?: string; size?: "default" | "small"; width?: number }): Promise<FrameNode>
```

Title + long-form body. Two size presets.

| | Default | Small |
|---|---------|-------|
| **Width** | 589px | 439px |
| **Gap** | 48px | 32px |
| **Padding right** | 48px | 24px |
| **Title** | 48px / 48px | 32px / 32px, ls -0.64px |
| **Body** | 24px / 32px, ls -0.24px, para 16px | 16px / 24px, ls -0.16px, para 8px |
| **Align** | MIN (left) | MAX (right) |

**Font:** Geist Regular. **Color:** `face.primary` for both.

**Figma node:** `9:1175`

---

### Compact

```typescript
createCompact(opts?: { title?: string; body?: string; size?: "large" | "default" | "small"; width?: number }): Promise<FrameNode>
```

Compact title + body. Three size presets.

| | Large | Default | Small |
|---|-------|---------|-------|
| **Title font** | Regular 32px / 32px, ls -0.64px | SemiBold 16px / 20px | SemiBold 16px / 20px |
| **Body font** | Regular 20px / 28px | Regular 20px / 28px | Regular 14px / 20px, ls -0.14px |

**Layout:** Vertical, gap 16px, width 590px. **Color:** `face.primary` for both.

**Figma node:** `9:1191`

---

### HeaderStack

```typescript
createHeaderStack(opts?: { h1?: string; h2?: string; h3?: string; h4?: string; width?: number }): Promise<FrameNode>
```

Typographic scale — 4 heading levels stacked.

| Level | Size | Line Height | Letter Spacing |
|-------|------|-------------|----------------|
| H1 | 128px | 120px | 0 |
| H2 | 96px | 88px | 0 |
| H3 | 64px | 64px | -1.28px |
| H4 | 48px | 48px | 0 |

**Layout:** Vertical, gap 40px, width 985px. **Font:** Geist Regular. **Color:** `face.primary`.

**Figma node:** `9:1194`

---

### FeatureCol

```typescript
createFeatureCol(opts?: { title?: string; items?: string[]; li1?: string; li2?: string; li3?: string; size?: "default" | "small"; width?: number }): Promise<FrameNode>
```

Feature column with title + bulleted list items. Accepts `items[]` array (preferred) or individual `li1`/`li2`/`li3` props.

| Param | Default | Typography |
|-------|---------|------------|
| `title` | `""` | H6: Geist Medium 24px / 24px, ls -0.48px, `face.primary` |
| `items` / `li1-li3` | `[]` | H6: Geist Medium 24px / 24px, ls -0.48px, `face.tertiary` |
| `size` | `"default"` | `"small"` uses smaller text |

**Layout:** Vertical, gap 24px, width 357px. List items in nested frame with 12px gap. Empty items are filtered out.

**Figma node:** `18:978` (component set with `size` enum)

---

## Statistics

### Statistics (cell)

```typescript
createStatistics(opts?: { title?: string; dataValue?: string; variant?: "large" | "horizontal" | "vertical" }): Promise<FrameNode>
```

Yellow card with title at top, data value at bottom. Brand yellow bg, rounded 12px, padding 48px.

| Variant | Size | Data Font |
|---------|------|-----------|
| `large` | 890 x 590 | H1: 128px / 120px, ls -2.56px |
| `horizontal` | 890 x 306 | H1: 128px / 120px, ls -2.56px |
| `vertical` | 589 x 711 | H2: 88px / 80px, ls -1.936px |

**Title:** H5 Geist Regular 32px / 32px, ls -0.64px, `face.primary`
**Data:** Geist Regular, `face.primary`
**Background:** `layer.brand` (yellow)

**Figma node:** `18:903`

---

### StatisticsLayout

```typescript
createStatisticsLayout(opts: { variant?: "2x1" | "2x2" | "3x1"; items: StatisticsOpts[] }): Promise<FrameNode>
```

Grid layouts for Statistics cells. Width: 1792px.

| Variant | Layout | Cell Variant | Items |
|---------|--------|-------------|-------|
| `2x1` | 2 side-by-side, space-between | `large` | 2 |
| `2x2` | 2 rows x 2 cols, gap 12px | `horizontal` | 4 |
| `3x1` | 3 side-by-side, gap 12px, fill | `vertical` | 3 |

**Figma node:** `18:942`

---

## Cards

### FeatureCard

```typescript
createFeatureCard(opts?: { title?: string; items?: string[]; li1?: string; li2?: string; li3?: string; hasImage?: boolean; width?: number }): Promise<FrameNode>
```

Two variants controlled by `hasImage`:

| `hasImage` | Layout | Height | Text Style |
|------------|--------|--------|------------|
| `true` (default) | Image (588px, rounded 12px) + FeatureCol below | Auto | H6 Medium 24px, `face.secondary` / `face.tertiary` |
| `false` | Solid `bg.warningSubtle` card, title top, list bottom | 710px fixed | H5 Regular 32px, `face.primary`, bulleted |

**Layout:** Vertical, width 589px. With image: gap 40px, 24px left padding on content. Without image: padding 32px/40px, space-between.

**Figma node:** `18:987`

---

## Composition Examples

### Full presentation flow

```typescript
// Start slide
const start = figma.createSlide();
await applyStartSlide(start, { title: "Bitcoin Whitepaper", date: "Oct 31, 2008" });

// ... content slides ...

// End slide
const end = figma.createSlide();
await applyEndSlide(end);
```

### Agenda slide

```typescript
const slide = figma.createSlide();
const { slot, footer } = await applyContentTemplate(slide, { presentationTitle: "Bitcoin", pageNumber: 2 });
const agenda = await createAgendaSlot({ items: ["Introduction", "Protocol", "Mining"], activeIndex: 0 });
slot.appendChild(agenda);
agenda.layoutSizingHorizontal = "FILL";
```

### Two-column with text left

```typescript
const slide = figma.createSlide();
const { textSlot, contentSlot } = await applyTwoColLeftTemplate(slide, { presentationTitle: "Bitcoin" });

const text = await createInfoText({ slideTitle: "What is Bitcoin?", body: "A peer-to-peer electronic cash system." });
textSlot.appendChild(text);
text.layoutSizingHorizontal = "FILL";

// contentSlot can hold an image, chart, etc.
```

### TwoCol Features (thumbnail rows)

TwoCol template with H3 heading + H5 body on the left, and up to **3 stacked feature rows** on the right. Each row has a 330×180 thumbnail image + H5 title + H6 description.

```typescript
const slide = figma.createSlide();
const { textSlot, contentSlot } = await applyTwoColLeftTemplate(slide, { presentationTitle: "Bitcoin" });

// Left: heading + body
const text = await createInfoText({ slideTitle: "How It Works", body: "Three core mechanisms power the network." });
textSlot.appendChild(text);
text.layoutSizingHorizontal = "FILL";

// Right: 3 feature rows (image + title + description), stacked vertically with 32px gap
// Each row: 330×180 image (rounded 8px) + text column (H5 title + H6 description, 8px gap)
// Max 3 rows per slide
```

**Typography:** Left side uses H3 (title) + H5 (body). Right side uses H5 (feature title) + H6 (feature description).

**Figma node:** `52:709`

### Cards — ThreeCol/FourCol with feature cards

The Cards composition: `tl-stats` header (yellow label H3 + primary title H3) at y=64, then 3 or 4 `feature-card-noimg` columns at y=305 (711px height). Each card has an H5 title + bulleted H5 list. Used for enumerating categories, capabilities, costs, or differentiators.

```typescript
const slide = figma.createSlide();
const { slots } = await applyThreeColTemplate(slide);

// Header is part of the template header zone (tl-stats pattern)
const features = [
  { title: "Interchange", items: ["Merchant pays a fee on every swipe", "Fold earns a portion after Visa's cut"] },
  { title: "Interest & fees", items: ["Users carrying a balance pay interest", "Late, foreign transaction fees"] },
  { title: "Subscriptions", items: ["Fold+ members pay $250/year", "Ecosystem engagement"] },
];

for (let i = 0; i < 3; i++) {
  const card = await createFeatureCard({ ...features[i], hasImage: false });
  slots[i].appendChild(card);
  card.layoutSizingHorizontal = "FILL";
}
```

**Density:** Max 3 cards (ThreeCol) or 4 cards (FourCol), max 4 bullets per card. Exceeds → split across slides.

### Three-column features (standalone)

```typescript
const slide = figma.createSlide();
const { slots } = await applyThreeColTemplate(slide);

const features = [
  { title: "Fast", li1: "Sub-second", li2: "Global reach", li3: "Low latency" },
  { title: "Secure", li1: "End-to-end", li2: "Zero-knowledge", li3: "Audited" },
  { title: "Simple", li1: "One API", li2: "Auto-scaling", li3: "No config" },
];

for (let i = 0; i < 3; i++) {
  const col = await createFeatureCol(features[i]);
  slots[i].appendChild(col);
  col.layoutSizingHorizontal = "FILL";
}
```

---

## Code Connect

Each component has a `.figma.tsx` mapping file for Figma Code Connect. All mappings target file `9kV4myLYtBd44bUPy7gdBu` (Slides-MCP).

Publish with:
```bash
npx figma connect publish --token <FIGMA_ACCESS_TOKEN>
```

Dry-run:
```bash
npx figma connect publish --dry-run
```

Config: `figma.config.json` with include glob `src/plugin/components/**/*.figma.tsx`.
