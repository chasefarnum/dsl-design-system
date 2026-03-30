# DSL Design System

Token-first design system for Discovery Senior Living HubSpot landing pages.

## Stack

- **Tokens** — Style Dictionary v4, W3C DTCG format (`$value` + `$type`)
- **Output** — Plain CSS custom properties, HubSpot `fields.json`, ES module
- **Components** — Vanilla HTML + CSS (no framework, no bundler)

## Quick Start

```bash
npm install
npm run build        # generates output/
npm run build:watch  # rebuild on token file changes
```

## Architecture

```
tokens/primitive/    ← raw scale values (color, typography, spacing, shape)
tokens/semantic/     ← semantic aliases — references primitive tokens
  ↓ npm run build (Style Dictionary v4)
output/variables.css        ← CSS custom properties → HubSpot theme CSS
output/hubspot-fields.json  ← HubSpot theme fields.json → drop into theme
output/tokens.js            ← ES module for tooling / <script type="module">
  ↓ "Sync tokens to Figma"
Figma Variable Collections  ← Primitives + Semantic (cc-figma-tokens skill)
  ↓ "Build [component] in Figma"
Figma Component Library     ← built from contracts/
```

## Workflow

```
1. Edit any file in tokens/primitive/ or tokens/semantic/
2. Run: npm run build
   → Regenerates output/variables.css, output/hubspot-fields.json, output/tokens.js
3. Tell Claude Code: "Sync tokens to Figma"
   → cc-figma-tokens skill pushes updates to Figma Variable Collections
4. To add a component: write the contract in contracts/ first,
   then build HTML/CSS, then tell Claude Code to build it in Figma
```

## Outputs

| File | Purpose |
|------|---------|
| `output/variables.css` | Link in HubSpot theme CSS or `<link rel="stylesheet">` |
| `output/hubspot-fields.json` | Copy into your HubSpot theme `fields.json` |
| `output/tokens.js` | Import via `<script type="module">` in raw HTML |

## HubSpot Integration

```html
<!-- In your HubSpot theme base template -->
<link rel="stylesheet" href="{{ get_asset_url('../../output/variables.css') }}" />

<!-- In any module CSS -->
.my-module { color: var(--color-brand-primary); }
```

## CSS Variable Reference

All variables are generated from `tokens/` and follow the pattern:
```
--{token-path-joined-with-hyphens}: {resolved-value};
```

Examples:
```css
--color-brand-primary:           #00549e;
--color-brand-secondary:         #ec881d;
--typography-font-family-heading: Manrope, sans-serif;
--typography-font-size-md:       16px;
--spacing-5:                     24px;
--shape-radius-md:               8px;
--button-primary-bg:             #00549e;
--button-primary-bg-hover:       #002c76;
--form-input-border-focus:       #00549e;
```

## Adding a Component

1. Write `contracts/{name}.contract.json` — defines variants, slots, token bindings
2. Create `components/{name}/{name}.html` — self-contained usage example
3. Create `components/{name}/{name}.css` — uses only `var(--token-name)`, no hardcoded values
4. Tell Claude Code: "Build the {Name} Figma component" to push to Figma

## Token Architecture

**Primitives** (`tokens/primitive/`) — raw scale values, never referenced directly in components:
- `color.tokens.json` — brand, neutral, semantic, overlay palettes
- `typography.tokens.json` — font families, sizes, weights, line heights, letter spacing
- `spacing.tokens.json` — spacing scale (4px–120px)
- `shape.tokens.json` — border radius, border width, shadows

**Semantic** (`tokens/semantic/semantic.tokens.json`) — named aliases that reference primitives:
- `color.text.*` — text color roles
- `color.bg.*` — background color roles
- `color.border.*` — border color roles
- `button.*` — button-specific tokens per variant
- `form.*` — form input and label tokens

**Rule:** Component CSS must only reference semantic tokens where possible. Primitive tokens are a fallback when no semantic alias exists.
