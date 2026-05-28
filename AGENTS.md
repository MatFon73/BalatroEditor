# BalatroEditor — AGENTS.md

## Stack

- **Vanilla JS SPA** — no framework, no build step, no bundler, no package.json
- Zero server required. Open `index.html` directly in browser (or serve with any static server)
- External deps (CDN): Font Awesome 7.1, Inter font, Pako 2.1.0

## Entrypoint

`index.html` loads scripts in order:
1. `pako.min.js` (deflate/inflate for .jkr files)
2. `public/js/jkr-converter.js` (Lua↔JSON parser + compression)
3. `public/js/utils.js` (shared: notifications, format, export, debounce)
4. `public/js/image-loader.js` (multi-CDN image load + localStorage cache)
5. `public/js/meta.js` (meta.jkr editor — collection view)
6. `public/js/profile.js` (profile.jkr editor — stats view)

## Architecture

### State model (all global, mutable — no data layer)

- `metaData: { unlocked, discovered, alerted }` — collection state
- `profileData` — profile stats (loaded from .jkr, null until import)
- `currentCategory`, `searchTerm`, `editMode` — UI state globals

### Rendering

Imperative via `container.innerHTML = html`. No vdom, no diffing.
- `renderCategory(category)` recreates entire items grid
- `renderProfile()` recreates entire profile view
- `toggleItem(id)` mutates metaData + patches DOM directly + calls `updateStats()`

### JKR format

Balatro saves use Lua-serialized tables, deflate-raw compressed.
- `jkr-converter.js` implements: Lua tokenizer → recursive descent parser → JSON
- Encode/decode hacks: `\t\f` prefix for numeric keys (Lua→JSON roundtrip)

## Key files

| File | Role |
|---|---|
| `public/js/jkr-converter.js` | Lua parser + deflate/inflate Raw (pako) |
| `public/js/utils.js` | Notification singleton, `formatName`, `exportBlob`, `debounce` |
| `public/js/image-loader.js` | URL chain fallback + localStorage cache with version key |
| `public/js/meta.js` | Collection view: skeleton loading, item cards, unlock/lock, import/export |
| `public/js/profile.js` | Profile view: stats editing, challenge toggle, import/export |
| `public/css/style.css` | Full design system via CSS custom properties |
| `data/meta.json` | Default/demo save data (~1077 lines of collection state) |

## Image loading

- `getImageUrl()` → `getImageUrls()[0]` (unified, no duplicate logic)
- Falls back through filename patterns (special cases → wiki name → fallback name)
- `localStorage` cache with `IMAGE_CACHE_VERSION` — bump version to invalidate all users' cache
- States: `.loading` (pulse), `.loaded` (opacity 1), `.error` (faded + broken icon)
- `PLACEHOLDER_SVG` constant is the fallback `src` — shows visible image icon on dark bg

## Known quirks & conventions

- **Categories share prefix `c_`**: tarots, planets, and spectrals are differentiated by explicit `filter` arrays in `CATEGORIES` (utils.js). Update these lists when Balatro adds new cards.
- **Skeleton loading**: fixed 300ms minimum + computation time. Images load async after skeleton is replaced. Not a bug — the new `loading`/`error` CSS states handle the visual gap.
- **Profile validation** checks `unlocked`/`discovered`/`alerted` keys to reject meta.jkr files uploaded to the profile tab.
- **Focus/keyboard**: all interactive elements have `tabindex="0"` + `role="button"` + Enter/Space handlers.
- **Notification**: singleton — only one visible at a time, replaced on new call.
- **Export guard**: `_exportingMeta` / `_exportingProfile` flags prevent concurrent exports.

## Commands

Nothing to install or build. Open `index.html` in a browser.
