# Slide Presentations

Generate professional slide decks using [Claude Code](https://claude.ai/claude-code). Paste your content — outlines, bullet points, meeting notes — and Claude builds a polished HTML presentation using a comprehensive design system.

## Quick Start

```bash
git clone <this-repo>
cd slide-presentations
```

Open the folder with Claude Code, then:

```
> Here's my presentation content: [paste your outline/bullets/notes]
> Build me a slide deck from this.
```

Claude will analyze your content, select the best template for each slide, and generate an HTML file.

## Preview

```bash
npm start
# → http://localhost:3456
```

- **F5** — fullscreen presentation mode (arrow keys to navigate, Esc to exit)
- **Pin annotations** — click the + button on any slide to leave notes
- Generated files go in the root directory alongside `shared.css`

## What's included

| File | Purpose |
|------|---------|
| `shared.css` | Design system — tokens, typography, all component styles |
| `shared.js` | Utilities — footer, varCard, statCell, annotations, presentation mode |
| `templates.html` | Source of truth — every composition rendered |
| `CLAUDE.md` | Instructions Claude reads to generate presentations |
| `COMPONENTS.md` | All 22 components with APIs |
| `DESIGN_RULES.md` | 32 design rules |
| `examples/` | Reference presentations |

## Design System

- **1920x1080** slide canvas (Geist font family)
- **13 template types**: Cards, Stats, DataTable, Carousel, Comparison, Proof, TextSlide, Timeline, and more
- **12-column grid** with 64px margins
- Automatic template selection based on content shape and density

## Examples

- `examples/credit-card.html` — 23 slides with variant switchers
- `examples/cryptoswitch.html` — 18-slide crypto exchange presentation

## Requirements

- [Claude Code](https://claude.ai/claude-code) (CLI)
- Node.js 18+ (for preview server, zero npm dependencies)
