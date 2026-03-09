#!/usr/bin/env node
/**
 * Slide template validator
 * Checks preview HTML files against the design system templates.
 *
 * Usage:  node preview/validate.mjs [file.html ...]
 *         (defaults to all preview HTML with slide content)
 */
import { readFileSync, readdirSync } from 'fs';
import { join, basename } from 'path';

const DIR = new URL('.', import.meta.url).pathname;

// ── Rules ──────────────────────────────────────────────────────

const ALLOWED_BG = ['bg-brand', 'bg-layer', 'bg-warning'];
const STRUCTURAL_BG = { 'start-title': 'bg-brand', 'end-text': 'bg-brand' };

const BANNED_CLASSES = [
  { cls: 'feature-card-simple', fix: 'Use feature-card-noimg + tl-featurecol' },
  { cls: 'data-table-dark', fix: 'Use data-table (light) on bg-warning' },
];

const REQUIRED_PATTERNS = [
  {
    name: 'DataTable must start at top:192px',
    test: (html) => {
      const tables = [...html.matchAll(/class="data-table"/g)];
      if (!tables.length) return [];
      const issues = [];
      // Find all containers with data-table inside
      const blocks = html.split('class="data-table"');
      for (let i = 1; i < blocks.length; i++) {
        // Look backwards for the position container
        const before = blocks[i - 1].slice(-400);
        const topMatch = before.match(/top:\s*(\d+)px/g);
        if (topMatch) {
          const last = topMatch[topMatch.length - 1];
          const val = last.match(/(\d+)/)[1];
          if (val !== '192') {
            issues.push(`DataTable container uses top:${val}px (expected 192px)`);
          }
        }
      }
      return issues;
    },
  },
  {
    name: 'DataTable must use table-layout:fixed',
    test: (html) => {
      const issues = [];
      const re = /class="data-table"[^>]*style="([^"]*)"/g;
      let m;
      while ((m = re.exec(html))) {
        if (!m[1].includes('table-layout:fixed')) {
          issues.push('DataTable missing table-layout:fixed');
        }
      }
      return issues;
    },
  },
  {
    name: 'FeatureCard must use tl-featurecol inside',
    test: (html) => {
      const issues = [];
      const cards = html.split('feature-card-noimg');
      for (let i = 1; i < cards.length; i++) {
        const next = cards[i].slice(0, 500);
        if (!next.includes('tl-featurecol')) {
          issues.push('feature-card-noimg without tl-featurecol inside');
        }
      }
      return issues;
    },
  },
  {
    name: 'Stats header uses tl-stats pattern',
    test: (html) => {
      const issues = [];
      // If we have stat-grid or stat-grid-3, check for tl-stats header
      if (html.includes('stat-grid') || html.includes('stat-grid-3')) {
        const slides = html.split('slide-inner');
        for (let i = 1; i < slides.length; i++) {
          const slide = slides[i].split('slide-inner')[0] || slides[i];
          if ((slide.includes('stat-grid-row') || slide.includes('stat-grid-3')) && !slide.includes('tl-stats')) {
            // Check if it's a stat slide without proper header
            if (!slide.includes('stat-layout-2x2') && !slide.includes('stat-layout-3x1')) {
              issues.push('Stat grid without tl-stats header pattern');
            }
          }
        }
      }
      return issues;
    },
  },
  {
    name: 'Footer uses standard structure',
    test: (html) => {
      const issues = [];
      const footers = [...html.matchAll(/class="footer">(.*?)<\/div>/gs)];
      for (const f of footers) {
        const inner = f[1];
        if (!inner.includes('footer-title') || !inner.includes('footer-page')) {
          issues.push('Footer missing footer-title or footer-page spans');
        }
      }
      return issues;
    },
  },
  {
    name: 'Typography uses design system classes only',
    test: (html) => {
      const issues = [];
      // Check for raw font-size that doesn't match known tokens
      const KNOWN_SIZES = [10, 12, 16, 21, 24, 32, 48, 64, 72, 88, 128];
      const sizeRe = /font-size:\s*(\d+)px/g;
      let m;
      while ((m = sizeRe.exec(html))) {
        const size = parseInt(m[1]);
        // Skip page chrome (body styles, labels, etc.)
        const before = html.slice(Math.max(0, m.index - 200), m.index);
        if (before.includes('<style>') || before.includes('page-title') ||
            before.includes('page-desc') || before.includes('slide-label') ||
            before.includes('pin') || before.includes('toolbar')) continue;
        if (!KNOWN_SIZES.includes(size)) {
          issues.push(`Non-standard font-size: ${size}px (allowed: ${KNOWN_SIZES.join(', ')})`);
        }
      }
      return issues;
    },
  },
];

// ── Slide parser ───────────────────────────────────────────────

function extractSlides(rawHtml) {
  // Strip <script> blocks so JS strings don't get matched as slides
  const html = rawHtml.replace(/<script[\s\S]*?<\/script>/gi, '');
  const slides = [];
  const re = /<div class="slide"><div class="slide-inner ([^"]+)">([\s\S]*?)<\/div><\/div>\s*(?=<|$)/g;
  let m;
  while ((m = re.exec(html))) {
    // Find the slide label before this slide
    const before = html.slice(Math.max(0, m.index - 300), m.index);
    const labelMatch = before.match(/class="slide-label">(.*?)<\/div>/);
    slides.push({
      bg: m[1],
      content: m[2],
      label: labelMatch ? labelMatch[1].replace(/<[^>]+>/g, '') : `Slide ${slides.length + 1}`,
    });
  }
  return slides;
}

// ── Validate ───────────────────────────────────────────────────

function validate(filePath) {
  const html = readFileSync(filePath, 'utf-8');
  const name = basename(filePath);
  const slides = extractSlides(html);
  const errors = [];
  const warnings = [];

  // Per-slide checks
  for (const slide of slides) {
    // Background check
    if (!ALLOWED_BG.includes(slide.bg)) {
      errors.push(`${slide.label}: bg "${slide.bg}" not allowed (use ${ALLOWED_BG.join(' or ')})`);
    }

    // Structural slides should use bg-brand
    for (const [cls, expectedBg] of Object.entries(STRUCTURAL_BG)) {
      if (slide.content.includes(cls) && slide.bg !== expectedBg) {
        errors.push(`${slide.label}: ${cls} should use ${expectedBg}, got ${slide.bg}`);
      }
    }

    // Content slides should use bg-warning
    const isStructural = Object.keys(STRUCTURAL_BG).some(c => slide.content.includes(c));
    if (!isStructural && slide.bg === 'bg-brand') {
      warnings.push(`${slide.label}: content slide uses bg-brand (should be bg-warning)`);
    }
    if (!isStructural && slide.bg === 'bg-layer') {
      warnings.push(`${slide.label}: content slide uses bg-layer (should be bg-warning)`);
    }
  }

  // Banned classes
  for (const { cls, fix } of BANNED_CLASSES) {
    if (html.includes(cls)) {
      // Count in slide content only (not in page chrome)
      const slideContent = slides.map(s => s.content).join('');
      if (slideContent.includes(cls)) {
        errors.push(`Banned class "${cls}" found. ${fix}`);
      }
    }
  }

  // Pattern checks
  const slideContent = slides.map(s => s.content).join('\n');
  for (const rule of REQUIRED_PATTERNS) {
    const issues = rule.test(slideContent);
    for (const issue of issues) {
      errors.push(`${rule.name}: ${issue}`);
    }
  }

  return { name, slides: slides.length, errors, warnings };
}

// ── Main ───────────────────────────────────────────────────────

let files = process.argv.slice(2);
if (!files.length) {
  // Auto-detect preview HTML files with slides
  const SKIP = ['templates.html', 'storybook.html', 'design-system.html',
                'design-system-standalone.html', 'templates-standalone.html',
                'grid-exploration.html'];
  files = readdirSync(DIR)
    .filter(f => f.endsWith('.html') && !SKIP.includes(f))
    .map(f => join(DIR, f))
    .filter(f => {
      try { return readFileSync(f, 'utf-8').includes('slide-inner'); } catch { return false; }
    });
}

let totalErrors = 0;
let totalWarnings = 0;

for (const f of files) {
  const result = validate(f);
  const icon = result.errors.length ? '\x1b[31m\u2717\x1b[0m' : '\x1b[32m\u2713\x1b[0m';
  console.log(`\n${icon} ${result.name} (${result.slides} slides)`);

  for (const e of result.errors) {
    console.log(`  \x1b[31mERROR\x1b[0m  ${e}`);
  }
  for (const w of result.warnings) {
    console.log(`  \x1b[33mWARN\x1b[0m   ${w}`);
  }
  if (!result.errors.length && !result.warnings.length) {
    console.log('  All checks passed');
  }

  totalErrors += result.errors.length;
  totalWarnings += result.warnings.length;
}

console.log(`\n${totalErrors ? '\x1b[31m' : '\x1b[32m'}${totalErrors} error(s)\x1b[0m, ${totalWarnings} warning(s)\n`);
process.exit(totalErrors > 0 ? 1 : 0);
