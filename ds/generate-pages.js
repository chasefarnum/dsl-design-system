#!/usr/bin/env node
// Generates components/[name]/index.html for each component
// and foundations pages + root index.html

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const COMPONENTS = [
  'accordion','avatar','badge','button','calendar','card',
  'dialog','forms','icons','inputs','menu','navigation',
  'notification','pagination','sections','tabs','text','tooltip'
];

const COMPONENT_ICONS = {
  accordion: '↕', avatar: '👤', badge: '🏷', button: '🔘',
  calendar: '📅', card: '🃏', dialog: '💬', forms: '📝',
  icons: '✦', inputs: '🖊', menu: '☰', navigation: '🧭',
  notification: '🔔', pagination: '📄', sections: '▤', tabs: '📑',
  text: '🔤', tooltip: '💭'
};

function extractBodyContent(html) {
  // Remove <script> tags
  html = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  // Extract content between <body> and </body>
  const match = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  return match ? match[1].trim() : '';
}

function buildTokenTable(tokens) {
  if (!tokens || Object.keys(tokens).length === 0) return '<p style="color:var(--ds-text-muted);font-size:var(--typography-font-size-sm)">No token bindings defined.</p>';
  let rows = Object.keys(tokens).map(name => `
    <tr>
      <td><code class="ds-token-name">${name}</code></td>
      <td style="color:var(--ds-text-secondary);font-family:var(--typography-font-family-mono,monospace);font-size:var(--typography-font-size-xs)">${tokens[name]}</td>
    </tr>`).join('');
  return `<table class="ds-token-table">
    <thead><tr><th>Token</th><th>Value</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>`;
}

function buildVariantsSection(variants) {
  if (!variants || Object.keys(variants).length === 0) return '';
  let rows = Object.entries(variants).map(([key, val]) => {
    const opts = Array.isArray(val.options) ? val.options.join(', ') : '';
    const def = val.default !== undefined ? String(val.default) : '';
    const mod = val.cssModifier || val.dataAttribute || '';
    return `<tr>
      <td style="color:var(--ds-text-primary);font-weight:var(--typography-font-weight-semibold)">${key}</td>
      <td><code style="font-size:var(--typography-font-size-xs);color:var(--color-brand-primary)">${opts}</code></td>
      <td style="color:var(--ds-text-muted)">${def}</td>
      <td><code style="font-size:var(--typography-font-size-xs);color:var(--ds-text-muted)">${mod}</code></td>
    </tr>`;
  }).join('');
  return `<section class="ds-section">
    <h2 class="ds-section-title">Props</h2>
    <table class="ds-token-table">
      <thead><tr><th>Prop</th><th>Options</th><th>Default</th><th>Modifier</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  </section>`;
}

function componentPage(name, contract, demoBody, hasJS) {
  const jsPath = hasJS ? `../../components/${name}/${name}.js` : null;
  const title = name.charAt(0).toUpperCase() + name.slice(1);
  const description = contract.description || '';
  return `<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title} — DSL Design System</title>
  <link rel="stylesheet" href="../../output/variables.css" />
  <link rel="stylesheet" href="../../ds/ds.css" />
  <link rel="stylesheet" href="../../components/${name}/${name}.css" />
</head>
<body>
<script>window.DS_BASE = '../../';</script>
<script src="../../ds/theme-toggle.js"></script>

<header id="header"></header>
<div class="ds-shell">
  <aside id="sidebar"></aside>
  <main class="ds-main">

    <div class="ds-page-header">
      <h1>${title}</h1>
      <p class="ds-page-description">${description}</p>
    </div>

    <section class="ds-section">
      <h2 class="ds-section-title">Variants</h2>
      <style>
        .demo-section { margin-bottom: var(--spacing-6); }
        .demo-section h2 { font-size: var(--typography-font-size-xs); font-weight: var(--typography-font-weight-semibold); color: var(--ds-text-muted); text-transform: uppercase; letter-spacing: var(--typography-letter-spacing-wide); margin: 0 0 var(--spacing-3); }
        .demo-row { display: flex; align-items: center; gap: var(--spacing-4); flex-wrap: wrap; margin-bottom: var(--spacing-3); }
        #selected-date { margin-top: var(--spacing-4); font-size: var(--typography-font-size-sm); color: var(--ds-text-secondary); }
      </style>
      ${demoBody}
    </section>

    ${buildVariantsSection(contract.variants)}

    <section class="ds-section">
      <h2 class="ds-section-title">Token Reference</h2>
      ${buildTokenTable(contract.tokens)}
    </section>

  </main>
</div>

<script src="../../ds/sidebar-nav.js"></script>
${jsPath ? `<script src="${jsPath}"></script>` : ''}
</body>
</html>`;
}

function foundationPage(title, description, content, base) {
  return `<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title} — DSL Design System</title>
  <link rel="stylesheet" href="${base}output/variables.css" />
  <link rel="stylesheet" href="${base}ds/ds.css" />
</head>
<body>
<script>window.DS_BASE = '${base}';</script>
<script src="${base}ds/theme-toggle.js"></script>

<header id="header"></header>
<div class="ds-shell">
  <aside id="sidebar"></aside>
  <main class="ds-main">
    <div class="ds-page-header">
      <h1>${title}</h1>
      <p class="ds-page-description">${description}</p>
    </div>
    ${content}
  </main>
</div>

<script src="${base}ds/sidebar-nav.js"></script>
</body>
</html>`;
}

// ── Generate component pages ──────────────────────────────────────────────────

COMPONENTS.forEach(name => {
  const contractPath = join(ROOT, 'contracts', `${name}.contract.json`);
  const htmlPath = join(ROOT, 'components', name, `${name}.html`);
  const jsPath = join(ROOT, 'components', name, `${name}.js`);
  const outDir = join(ROOT, 'components', name);
  const outPath = join(outDir, 'index.html');

  const contract = JSON.parse(readFileSync(contractPath, 'utf8'));
  const html = readFileSync(htmlPath, 'utf8');
  const demoBody = extractBodyContent(html);
  const hasJS = existsSync(jsPath);

  writeFileSync(outPath, componentPage(name, contract, demoBody, hasJS));
  console.log(`✓ components/${name}/index.html`);
});

// ── Generate foundations pages ────────────────────────────────────────────────

// Read variables.css to extract color tokens
const varsCss = readFileSync(join(ROOT, 'output', 'variables.css'), 'utf8');
const colorMatches = [...varsCss.matchAll(/--color-([\w-]+):\s*([^;]+);/g)];

const colorGroups = {};
colorMatches.forEach(([, name, value]) => {
  const group = name.split('-')[0] + '-' + name.split('-')[1];
  if (!colorGroups[group]) colorGroups[group] = [];
  colorGroups[group].push({ name: `--color-${name}`, value: value.trim() });
});

const swatchHtml = Object.entries(colorGroups).map(([group, colors]) => {
  const title = group.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  const swatches = colors.map(c => `
    <div class="ds-swatch">
      <div class="ds-swatch__color" style="background:${c.value}"></div>
      <div class="ds-swatch__info">
        <p class="ds-swatch__name">${c.name.replace('--color-', '')}</p>
        <p class="ds-swatch__value">${c.value}</p>
      </div>
    </div>`).join('');
  return `<h2 class="ds-section-title" style="margin-top:var(--spacing-7)">${title}</h2>
  <div class="ds-swatch-grid">${swatches}</div>`;
}).join('');

mkdirSync(join(ROOT, 'foundations', 'colors'), { recursive: true });
writeFileSync(join(ROOT, 'foundations', 'colors', 'index.html'),
  foundationPage('Colors', 'All color tokens in the DSL palette.', `<section class="ds-section">${swatchHtml}</section>`, '../../'));
console.log('✓ foundations/colors/index.html');

// Typography page
const typeScaleItems = [
  ['5xl','72px'],['4xl','60px'],['3xl','48px'],['2xl','36px'],['xl','24px'],
  ['lg','20px'],['md','16px'],['sm','14px'],['xs','12px']
];
const typographyContent = `
<section class="ds-section">
  <h2 class="ds-section-title">Heading Scale (Lora)</h2>
  ${typeScaleItems.slice(0,6).map(([size,px]) => `
  <div style="margin-bottom:var(--spacing-5);padding-bottom:var(--spacing-4);border-bottom:1px solid var(--ds-border)">
    <p style="font-family:var(--typography-font-family-heading);font-size:var(--typography-font-size-${size});line-height:var(--typography-line-height-tight);color:var(--ds-text-primary);margin:0 0 var(--spacing-1)">The quick brown fox</p>
    <code style="font-size:10px;color:var(--ds-text-muted)">--typography-font-size-${size} · ${px}</code>
  </div>`).join('')}
</section>
<section class="ds-section">
  <h2 class="ds-section-title">Body Scale (Montserrat)</h2>
  ${typeScaleItems.map(([size,px]) => `
  <div style="margin-bottom:var(--spacing-4);display:flex;align-items:baseline;gap:var(--spacing-6)">
    <code style="font-size:10px;color:var(--ds-text-muted);min-width:120px">--font-size-${size} · ${px}</code>
    <p style="font-family:var(--typography-font-family-body);font-size:var(--typography-font-size-${size});color:var(--ds-text-primary);margin:0">The quick brown fox jumps over the lazy dog</p>
  </div>`).join('')}
</section>`;

mkdirSync(join(ROOT, 'foundations', 'typography'), { recursive: true });
writeFileSync(join(ROOT, 'foundations', 'typography', 'index.html'),
  foundationPage('Typography', 'Type scale — Lora for headings, Montserrat for body.', typographyContent, '../../'));
console.log('✓ foundations/typography/index.html');

// Spacing page
const spacingItems = [
  ['1','4px'],['2','8px'],['3','12px'],['4','16px'],['5','24px'],
  ['6','32px'],['7','40px'],['8','64px'],['9','80px'],['10','120px']
];
const spacingContent = `<section class="ds-section">
  <h2 class="ds-section-title">Spacing Scale</h2>
  ${spacingItems.map(([n,px]) => `
  <div class="ds-spacing-row">
    <div class="ds-spacing-bar" style="width:var(--spacing-${n})"></div>
    <span class="ds-spacing-label"><strong>--spacing-${n}</strong> · ${px}</span>
  </div>`).join('')}
</section>`;

mkdirSync(join(ROOT, 'foundations', 'spacing'), { recursive: true });
writeFileSync(join(ROOT, 'foundations', 'spacing', 'index.html'),
  foundationPage('Spacing', 'The 10-step spacing scale used across all components.', spacingContent, '../../'));
console.log('✓ foundations/spacing/index.html');

// Shadows page
const shadowItems = [
  ['sm','Subtle elevation'],['md','Card and popover'],['lg','Dropdown panel'],['xl','Modal / dialog']
];
const shadowContent = `<section class="ds-section">
  <h2 class="ds-section-title">Shadow Scale</h2>
  <div class="ds-shadow-row">
    ${shadowItems.map(([n,desc]) => `
    <div>
      <div class="ds-shadow-box" style="box-shadow:var(--shape-shadow-${n})">
        <span class="ds-shadow-box__label">--shape-shadow-${n}</span>
      </div>
      <p style="font-size:var(--typography-font-size-xs);color:var(--ds-text-muted);margin:var(--spacing-2) 0 0;text-align:center">${desc}</p>
    </div>`).join('')}
  </div>
</section>`;

mkdirSync(join(ROOT, 'foundations', 'shadows'), { recursive: true });
writeFileSync(join(ROOT, 'foundations', 'shadows', 'index.html'),
  foundationPage('Shadows', 'Box shadow tokens for elevation and depth.', shadowContent, '../../'));
console.log('✓ foundations/shadows/index.html');

// ── Generate home index.html ──────────────────────────────────────────────────

const foundationCards = [
  { name: 'Colors', icon: '🎨', desc: 'Brand, semantic, and neutral palette', href: 'foundations/colors/index.html' },
  { name: 'Typography', icon: '🔤', desc: 'Lora headings + Montserrat body scale', href: 'foundations/typography/index.html' },
  { name: 'Spacing', icon: '↔', desc: '10-step spacing scale (4px–120px)', href: 'foundations/spacing/index.html' },
  { name: 'Shadows', icon: '🌑', desc: 'Elevation tokens sm → xl', href: 'foundations/shadows/index.html' }
];

const componentDescs = {
  accordion:'Collapsible content panels', avatar:'User image, initials, or icon',
  badge:'Compact status and tag labels', button:'CTA and form submit buttons',
  calendar:'Month-view date picker', card:'Content surface containers',
  dialog:'Modal dialogs with focus trap', forms:'Complete form layout',
  icons:'SVG symbol+use icon system', inputs:'Text input variants',
  menu:'Trigger + dropdown panel', navigation:'Responsive horizontal navbar',
  notification:'Alert, toast, and banner', pagination:'Prev/next page controls',
  sections:'Landing page containers', tabs:'Tabbed panel interface',
  text:'Typography scale demo', tooltip:'Hover/focus tooltip'
};

const homeContent = `
<div class="ds-home-hero">
  <h1>DSL Design System</h1>
  <p>Tokens, components, and foundations for Discovery Senior Living HubSpot pages. Plain HTML, CSS vars, vanilla JS — no frameworks.</p>
</div>

<h2 class="ds-home-grid-title">Foundations</h2>
<div class="ds-component-grid">
  ${foundationCards.map(c => `
  <a class="ds-component-card" href="${c.href}">
    <span class="ds-component-card__icon">${c.icon}</span>
    <p class="ds-component-card__name">${c.name}</p>
    <p class="ds-component-card__desc">${c.desc}</p>
  </a>`).join('')}
</div>

<h2 class="ds-home-grid-title">Components</h2>
<div class="ds-component-grid">
  ${COMPONENTS.map(name => {
    const title = name.charAt(0).toUpperCase() + name.slice(1);
    return `<a class="ds-component-card" href="components/${name}/index.html">
    <span class="ds-component-card__icon">${COMPONENT_ICONS[name]}</span>
    <p class="ds-component-card__name">${title}</p>
    <p class="ds-component-card__desc">${componentDescs[name]}</p>
  </a>`;
  }).join('')}
</div>`;

const homeHtml = `<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>DSL Design System</title>
  <link rel="stylesheet" href="output/variables.css" />
  <link rel="stylesheet" href="ds/ds.css" />
</head>
<body>
<script>window.DS_BASE = './';</script>
<script src="ds/theme-toggle.js"></script>

<header id="header"></header>
<div class="ds-shell">
  <aside id="sidebar"></aside>
  <main class="ds-main">
    ${homeContent}
  </main>
</div>

<script src="ds/sidebar-nav.js"></script>
</body>
</html>`;

writeFileSync(join(ROOT, 'index.html'), homeHtml);
console.log('✓ index.html');
console.log('\nAll pages generated.');
