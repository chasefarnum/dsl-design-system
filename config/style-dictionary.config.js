/**
 * DSL Design System — Style Dictionary v4 Config + Build Script
 *
 * Usage:
 *   node config/style-dictionary.config.js           # one-time build
 *   node config/style-dictionary.config.js --watch   # watch + rebuild
 *
 * Outputs:
 *   output/variables.css       — CSS custom properties on :root
 *   output/hubspot-fields.json — HubSpot theme fields.json array
 *   output/tokens.js           — ES module named exports (camelCase)
 *
 * Token format: W3C DTCG — $value + $type
 * In SD v4 DTCG mode, the resolved value lives in token.$value (not token.value).
 */

import StyleDictionary from 'style-dictionary';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');

// ─── Custom name transform ────────────────────────────────────────────────────
// Joins full token path with hyphens: ["color","brand","primary"] → "color-brand-primary"

StyleDictionary.registerTransform({
  name: 'name/dsl-kebab',
  type: 'name',
  transform: (token) => token.path.join('-'),
});

// ─── Custom px transform ──────────────────────────────────────────────────────
// Appends "px" to numeric dimension token values (SD v4 DTCG mode: filter/transform use $value).

StyleDictionary.registerTransform({
  name: 'size/dsl-px',
  type: 'value',
  filter: (token) => token.$type === 'dimension' && typeof token.$value === 'number',
  transform: (token) => `${token.$value}px`,
});

// ─── Transform groups ─────────────────────────────────────────────────────────

// CSS + JS output: includes px conversion for dimension values
StyleDictionary.registerTransformGroup({
  name: 'dsl-css',
  transforms: ['name/dsl-kebab', 'color/css', 'size/dsl-px'],
});

// HubSpot output: NO px transform — dimension defaults stay as raw numbers
StyleDictionary.registerTransformGroup({
  name: 'dsl-hubspot',
  transforms: ['name/dsl-kebab', 'color/css'],
});

// ─── Helpers shared by formats ────────────────────────────────────────────────

function tokenValue(token) {
  // In SD v4 DTCG mode, resolved value is in $value; legacy fallback to value.
  return token.$value ?? token.value;
}

// ─── Format: CSS custom properties on :root ───────────────────────────────────

StyleDictionary.registerFormat({
  name: 'css/dsl-root',
  format: ({ dictionary }) => {
    const timestamp = new Date().toISOString();
    const vars = dictionary.allTokens
      .map((t) => `  --${t.name}: ${tokenValue(t)};`)
      .join('\n');
    const base = `\nbody {\n  -webkit-font-smoothing: antialiased;\n  -moz-osx-font-smoothing: grayscale;\n}\n`;
    return `/* AUTO-GENERATED — ${timestamp} — run npm run build to update */\n:root {\n${vars}\n}\n${base}`;
  },
});

// ─── Format: HubSpot theme fields.json ───────────────────────────────────────
//
// HubSpot field group structure:
//   [ { name, label, type: "group", children: [ { name, label, type, default } ] } ]
//
// HubSpot field types:
//   color  → "color",  default: { color: "#hex" }
//   font   → "font",   default: { font: "Family Name", font_set: "GOOGLE" }
//   number → "number", default: <number>
//   text   → "text",   default: "<string>" (for em/string values)
//
// Note: dimension tokens use the dsl-hubspot platform (no px transform),
//       so their $value is still a raw number here.

StyleDictionary.registerFormat({
  name: 'json/dsl-hubspot-fields',
  format: ({ dictionary }) => {
    const tokens = dictionary.allTokens;

    function toSnakeCase(str) {
      return str.replace(/-/g, '_');
    }

    function toLabel(name) {
      return name
        .split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
    }

    function hubspotFieldType(token) {
      const type = token.$type;
      if (type === 'color') return 'color';
      if (type === 'fontFamily') return 'font';
      if (type === 'number') return 'number';
      if (type === 'dimension') return 'number'; // raw numeric in this platform
      if (type === 'string') return 'text';
      return 'text';
    }

    function hubspotDefault(token) {
      const type = token.$type;
      const val = tokenValue(token);
      if (type === 'color') {
        // Skip transparent / rgba(0,0,0,0) — not valid for HubSpot color picker default
        if (val === 'transparent' || val === 'rgba(0, 0, 0, 0)') return null;
        return { color: val };
      }
      if (type === 'fontFamily') {
        const primaryFont = String(val).split(',')[0].trim();
        return { font: primaryFont, font_set: 'GOOGLE' };
      }
      if (type === 'dimension') {
        // In dsl-hubspot platform, dimension $value is still a raw number (no px transform)
        return Number(token.original?.$value ?? val);
      }
      return val;
    }

    // Classify token to a group by its path
    function groupKey(token) {
      const p = token.path;
      if (p[0] === 'color') return 'colors';
      if (p[0] === 'typography') return 'typography';
      if (p[0] === 'spacing') return 'spacing';
      if (p[0] === 'shape' && (p[1] === 'radius' || p[1] === 'border-width')) return 'borders';
      if (p[0] === 'button') return 'buttons';
      if (p[0] === 'form') return 'forms';
      return null; // skip shape.shadow and anything unclassified
    }

    const GROUP_CONFIG = [
      { key: 'colors',     label: 'Colors' },
      { key: 'typography', label: 'Typography' },
      { key: 'spacing',    label: 'Spacing' },
      { key: 'borders',    label: 'Borders' },
      { key: 'buttons',    label: 'Buttons' },
      { key: 'forms',      label: 'Forms' },
    ];

    const buckets = Object.fromEntries(GROUP_CONFIG.map((g) => [g.key, []]));

    tokens.forEach((token) => {
      const key = groupKey(token);
      if (key && buckets[key]) buckets[key].push(token);
    });

    const groups = GROUP_CONFIG.filter((g) => buckets[g.key].length > 0).map((g) => ({
      name: toSnakeCase(g.key),
      label: g.label,
      type: 'group',
      children: buckets[g.key]
        .map((token) => {
          const defaultVal = hubspotDefault(token);
          if (defaultVal === null) return null;
          return {
            name: toSnakeCase(token.name),
            label: toLabel(token.name),
            type: hubspotFieldType(token),
            default: defaultVal,
          };
        })
        .filter(Boolean),
    }));

    return JSON.stringify(groups, null, 2) + '\n';
  },
});

// ─── Format: ES module with camelCase named exports ───────────────────────────

StyleDictionary.registerFormat({
  name: 'js/dsl-esm',
  format: ({ dictionary }) => {
    const timestamp = new Date().toISOString();

    function toCamelCase(hyphenated) {
      return hyphenated.replace(/-([a-z0-9])/gi, (_, c) => c.toUpperCase());
    }

    const exports = dictionary.allTokens
      .map((t) => {
        const key = toCamelCase(t.name);
        const val = tokenValue(t);
        const serialized = typeof val === 'string' ? `'${val.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'` : JSON.stringify(val);
        return `export const ${key} = ${serialized};`;
      })
      .join('\n');

    return `// AUTO-GENERATED — ${timestamp} — run npm run build to update\n\n${exports}\n`;
  },
});

// ─── Style Dictionary config ──────────────────────────────────────────────────

const sdConfig = {
  source: [
    'tokens/primitive/**/*.tokens.json',
    'tokens/semantic/semantic.tokens.json',
  ],
  platforms: {
    css: {
      transformGroup: 'dsl-css',
      buildPath: 'output/',
      files: [
        {
          destination: 'variables.css',
          format: 'css/dsl-root',
        },
      ],
    },
    hubspot: {
      transformGroup: 'dsl-hubspot',
      buildPath: 'output/',
      files: [
        {
          destination: 'hubspot-fields.json',
          format: 'json/dsl-hubspot-fields',
        },
      ],
    },
    esm: {
      transformGroup: 'dsl-css', // same as CSS: px-converted values in tokens.js
      buildPath: 'output/',
      files: [
        {
          destination: 'tokens.js',
          format: 'js/dsl-esm',
        },
      ],
    },
  },
};

// ─── Build ────────────────────────────────────────────────────────────────────

async function build() {
  console.log('\nBuilding DSL tokens...');
  try {
    const sd = new StyleDictionary(sdConfig);
    await sd.buildAllPlatforms();
    console.log('  ✓ output/variables.css');
    console.log('  ✓ output/hubspot-fields.json');
    console.log('  ✓ output/tokens.js');
    console.log('Done.\n');
  } catch (err) {
    console.error('Build failed:', err.message);
    process.exitCode = 1;
    throw err;
  }
}

const isWatch = process.argv.includes('--watch');

if (isWatch) {
  const { default: chokidar } = await import('chokidar');
  console.log('Watching tokens/ for changes...');
  await build();

  const watcher = chokidar.watch(`${rootDir}/tokens/**/*.tokens.json`, {
    ignoreInitial: true,
    awaitWriteFinish: { stabilityThreshold: 150, pollInterval: 50 },
  });

  watcher.on('change', async (filePath) => {
    console.log(`Changed: ${filePath.replace(rootDir + '/', '')}`);
    await build();
  });

  watcher.on('add', async (filePath) => {
    console.log(`Added: ${filePath.replace(rootDir + '/', '')}`);
    await build();
  });

  process.on('SIGINT', () => {
    watcher.close();
    process.exit(0);
  });
} else {
  await build();
}
