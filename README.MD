<div align="center">

# [Balatro Editor](https://matfon73.github.io/BalatroEditor) - Mateo Fonseca

![Balatro](https://img.shields.io/badge/BalatroEditor-8b5cf6?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1zbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3QgeD0iMyIgeT0iMyIgd2lkdGg9IjE4IiBoZWlnaHQ9IjE4IiByeD0iMiIgZmlsbD0iI2ZmZiIvPgo8L3N2Zz4=)
![Version](https://img.shields.io/badge/version-2.5.0-a78bfa?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-10b981?style=for-the-badge)

**A minimalist and modern visual editor to modify your Balatro meta.jkr, profile.jkr and save.jkr files. Please note that the software is under development; there is no final version.**

[Features](#features) • [Installation](#installation) • [Usage](#usage)

</div>

---

## Preview

<div align="center">
  <img src="https://i.postimg.cc/50XjBjY1/preview.jpg" alt="Balatro Meta Editor Preview" width="100%">
</div>

---

## Features

- **Collection management** — unlock, discover, or lock any card (Jokers, Tarots, Planets, Spectrals, Vouchers, Decks, Modifiers, Tags, Blinds)
- **Profile editor** — edit name, high scores, career stats, progress tracking, challenge progress, and deck statistics with win rates
- **Save editor** — full save.jkr editing with Game, Deck, Jokers, Consumables, Vouchers, and Planets tabs
- **Bulk operations** — unlock/lock all per category, bulk select and edit deck cards
- **Smart search** — real-time card filtering by name
- **Import/Export .jkr** — native Balatro format, 100% client-side, no server required
- **Responsive design** — desktop and mobile with adaptive layout and hamburger menu
- **i18n** — English and Spanish with instant toggle

---

## Installation

### Simple Setup - No Dependencies Required!

This editor runs completely in your browser with no backend or server requirements.

### Step 1: Download the Project

**Option A: Download ZIP**
1. Click the green "Code" button on GitHub
2. Select "Download ZIP"
3. Extract the ZIP file to any folder on your computer

**Option B: Clone with Git**
```bash
git clone https://github.com/MatFon73/BalatroEditor.git
```

### Step 2: Open the Editor

1. Navigate to the extracted/cloned folder
2. Double-click `index.html`
3. The editor will open in your default browser

That's it! No server, no installation, no configuration needed.

### File Structure
```
BalatroEditor/
├── .github/
│   ├── CODE_OF_CONDUCT.md     ← Collaboration rules
│   ├── CONTRIBUTING.md        ← Contribution guide
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── ISSUE_TEMPLATE/
│       ├── bug_report.md
│       ├── feature_request.md
│       └── config.yml
├── .vscode/
│   ├── extensions.json        ← Recommended extensions (Live Server)
│   └── settings.json          ← Workspace settings
├── data/
│   ├── meta.json              ← Default/demo save data
│   └── profile.json           ← Default/demo profile data
├── public/
│   ├── css/
│   │   ├── style.css          ← Full design system
│   │   ├── profile.css        ← Profile page styles
│   │   └── save-editor.css    ← Save editor specific styles
│   ├── img/
│   │   └── preview.jpg        ← Social preview image
│   └── js/
│       ├── jkr-converter.js   ← Lua ↔ JKR converter (deflate/inflate)
│       ├── utils.js           ← Shared utilities (notifications, format, export, debounce)
│       ├── translations.js    ← i18n system EN/ES with __() helper
│       ├── image-loader.js    ← Multi-source image loader with localStorage cache
│       ├── meta.js            ← Meta.jkr collection editor
│       ├── profile.js         ← Profile.jkr stats editor
│       └── save-editor.js     ← Save.jkr game editor
├── .editorconfig              ← Editor consistency
├── .gitattributes             ← Git file handling
├── .gitignore
├── AGENTS.md                  ← Dev conventions
├── favicon.ico
├── index.html
├── LICENSE
└── README.md
```

---

## Usage

### File Locations

**Windows:** `C:\Users\{User}\AppData\Roaming\Balatro\1\meta.jkr` / `save.jkr`  
**macOS:** `~/Library/Application Support/Balatro/1/meta.jkr` / `save.jkr`  
**Linux / Steam Deck:** `~/.local/share/Balatro/1/meta.jkr` / `save.jkr`  
**Profile (all OS):** `Balatro\profile.jkr` (same folder as `1/`)

### Quick Start

1. Open `index.html` in your browser
2. Import your `.jkr` file using the sidebar or tab buttons
3. Make your changes — click cards to toggle unlock state, edit fields in Profile/Save editor
4. Click **Export .jkr** (or **Save & Export** in Profile) to save
5. **Close Balatro completely**, backup your original file, then replace it with the exported one

Cards show **green** (unlocked), **yellow** (discovered), or **red** (locked) borders. Progress bars update automatically as you edit.

---

## Tech Stack

- **Vanilla JS SPA** — no framework, no build step, no bundler, no package.json
- **CSS3** with custom properties, Flexbox & Grid, responsive media queries
- **ES6+ JavaScript** — DOM manipulation, Fetch API, client-side JKR processing
- **CDN deps**: Font Awesome 7.1, Inter font, Pako 2.1.0 (zlib compression)

---

## Acknowledgments

### Project Creator

- **[MatFon73](https://github.com/MatFon73)** - Project creator and developer

### Special Thanks

- **[LocalThunk](https://x.com/localthunk)** - Creator of Balatro
- **[TeddyHuang-00](https://github.com/TeddyHuang-00)** - Creator of [BalatroSaveEditor](https://github.com/TeddyHuang-00/BalatroSaveEditor) - JKR format reference
- **Balatro Wiki** - For card images and information

### JKR Format Implementation

This project implements client-side JKR file processing inspired by the format documentation from **[BalatroSaveEditor](https://github.com/TeddyHuang-00/BalatroSaveEditor)** by TeddyHuang-00.

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

## Author

<div align="center">

**MatFon73** · [GitHub](https://github.com/MatFon73) · [Twitter](https://x.com/MatFon73)

_Systems Engineer_

</div>


