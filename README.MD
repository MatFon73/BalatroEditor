# [Balatro Editor](https://matfon73.github.io/) - Mateo Fonseca

<div align="center">

![Balatro](https://img.shields.io/badge/BalatroEditor-8b5cf6?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3QgeD0iMyIgeT0iMyIgd2lkdGg9IjE4IiBoZWlnaHQ9IjE4IiByeD0iMiIgZmlsbD0iI2ZmZiIvPgo8L3N2Zz4=)
![Version](https://img.shields.io/badge/version-2.0.0-a78bfa?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-10b981?style=for-the-badge)

**A minimalist and modern visual editor to modify your Balatro meta.jkr and profile.jkr files**

[Features](#features) • [Installation](#installation) • [Usage](#usage) • [Technologies](#technologies)

</div>

---

## Preview

<div align="center">
  <img src="https://i.postimg.cc/gjJ9Fqzq/Img-Balatro-Editor.jpg" alt="Balatro Meta Editor Preview" width="100%">
</div>

---

## Features

### Modern Minimalist Design

- Elegant dark interface with purple accents
- Smooth animations and fluid transitions
- Skeleton loading while data loads

### Smart Search

- Search any card in real-time
- Instant filtering by name

### Fully Responsive

- Adapted design for desktop and mobile
- Hamburger menu on small devices
- Flexible grid that adjusts to screen size

### Complete Collection Management

- Jokers
- Tarots
- Planets
- Spectrals
- Vouchers
- Decks
- Card Modifiers (Enhancements, Editions, Seals)
- Tags
- Blinds

### Profile Statistics Editor

- Edit player name
- Modify high scores (Highest Ante, Best Hand, Most Money, etc.)
- Update career statistics (Wins, Losses, Hands Played, etc.)
- Adjust progress tracking (Challenges, Deck Stakes, Joker Stickers)
- View detailed deck statistics with win rates
- **Import/Export profile.jkr files**

### Full Control

- Unlock/Discovered/Lock everything with one click
- Individual toggle for each card
- **Import/Export .jkr files** (native Balatro format)
- **100% Client-Side Processing** - No server required!

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
├── data/
│   └── meta.json
├── public/
│   ├── css/
│   │   ├── style.css
│   │   └── profile.css
│   └── js/
│       ├── meta.js
│       ├── profile.js
│       └── jkr-converter.js    ← Client-side JKR processing
├── favicon.ico
├── index.html
├── LICENSE
└── README.md
```

---

## Usage

### Getting Your Balatro Save Files

**File locations:**

**Windows:**
```
C:\Users\{Your_User}\AppData\Roaming\Balatro\1\meta.jkr
C:\Users\{Your_User}\AppData\Roaming\Balatro\profile.jkr
```

**macOS:**
```
~/Library/Application Support/Balatro/1/meta.jkr
~/Library/Application Support/Balatro/profile.jkr
```

**Linux:**
```
~/.local/share/Balatro/1/meta.jkr
~/.local/share/Balatro/profile.jkr
```

**Steam Deck:**
```
~/.local/share/Balatro/1/meta.jkr
~/.local/share/Balatro/profile.jkr
```

### Working with the Editor

#### Importing Your Save (meta.jkr)

1. Click **"Import .jkr"** button in the sidebar
2. Select your `meta.jkr` file from Balatro folder
3. Wait for the file to load (you'll see a success notification)
4. All your current unlocks will appear in the editor

#### Importing Your Profile (profile.jkr)

1. Click on the **"Profile"** tab in the sidebar
2. Click **"Import profile.jkr"** button
3. Select your `profile.jkr` file from Balatro folder
4. Your profile statistics will load and be ready for editing

#### Editing Cards

1. **Left Sidebar**: Navigate between different card categories
2. **Search Bar**: Filter cards by typing their name
3. **Card Grid**: Click any card to unlock/lock it
4. **Visual States**:
   - Green border: Card is unlocked
   - Yellow: Card is discovered
   - Red: Card is locked

#### Editing Profile Statistics

Once you've imported your profile.jkr:

1. **Enable Edit Mode**: Click the "Edit Mode" button to enable editing
2. **Player Name**: Click the name field to change your profile name
3. **High Scores**: Edit any high score value (Highest Ante, Best Hand, Most Money, Win Streak, etc.)
4. **Career Statistics**: Modify total counts (Wins, Losses, Hands Played, Dollars Earned, etc.)
5. **Progress Tracking**: Adjust completion percentages
   - Challenges Completed (max 20)
   - Deck Stakes (max 120)
   - Joker Stickers (max 1200)
   - Items Discovered (max 340)
6. **Challenge Progress**: Click on challenges to mark them as completed/incomplete
7. **Deck Statistics**: View (read-only) detailed stats for each deck including wins, losses, and win rates

Progress bars update automatically as you edit values.

#### Bulk Operations

- **Unlock All**: Unlocks all cards in the current category
- **Lock All**: Locks all cards in the current category

#### Exporting Your Changes

**For meta.jkr:**

1. After making your modifications, click **"Export .jkr"**
2. Save the file to your computer
3. **Close Balatro completely** (if running)
4. **Backup your original file** (highly recommended)
5. Replace the original `meta.jkr` at the Balatro folder location
6. Start Balatro and enjoy your changes

**For profile.jkr:**

1. After editing your statistics, click **"Save & Export"**
2. Save the file as `profile.jkr`
3. **Close Balatro completely** (if running)
4. **Backup your original file** (highly recommended)
5. Replace the original `profile.jkr` at the Balatro folder location
6. Start Balatro to see your updated profile

---

## Technologies

<table>
<tr>
<td align="center" width="33%">

### HTML5

**Version**: HTML Living Standard

**Usage**:

- Semantic structure
- Integrated SVG icons
- Enhanced accessibility

</td>
<td align="center" width="33%">

### CSS3

**Version**: CSS3 + Variables

**Usage**:

- Design system with CSS variables
- Flexbox & Grid Layout
- Animations and transitions
- Responsive media queries

</td>
<td align="center" width="33%">

### JavaScript

**Version**: ES6+ (ECMAScript 2015+)

**Usage**:

- DOM manipulation
- Fetch API for loading data
- Events and listeners
- Real-time filtering and search
- Client-side JKR processing

</td>
</tr>
</table>

### External Libraries

- **Font Awesome**: 7.1.0 - Icon library for UI elements
- **Google Fonts**: Inter font family
- **Pako**: 2.1.0 - Zlib compression/decompression for JKR files

---

## Technical Features

### Optimizations

- **Lazy Loading**: Images from Balatro Wiki
- **Skeleton Loading**: Visual feedback during data loading
- **Client-Side Processing**: All JKR conversions happen in your browser
- **No Server Required**: Works offline after initial load
- **Mobile First**: Design optimized for all devices

### Browser Compatibility

| Browser | Minimum Version |
| ------- | --------------- |
| Chrome  | 90+             |
| Firefox | 88+             |
| Edge    | 90+             |
| Safari  | 14+             |
| Opera   | 76+             |

---

## Troubleshooting

### Editor Not Opening

**Problem**: Double-clicking index.html doesn't work

**Solution**: 
- Right-click `index.html` → "Open with" → Select your preferred browser
- Or drag and drop `index.html` into an open browser window

### Images Not Loading

**Problem**: Card images show placeholder icons

**Solution**: 
- This is normal - images are loaded from Balatro Wiki on-demand
- Check your internet connection
- Some cards may not have images available

### Import/Export Not Working

**Problem**: Can't import or export .jkr files

**Solution**:
- Make sure you're using a modern browser (Chrome 90+, Firefox 88+, etc.)
- Check browser console (F12) for error messages
- Verify the file you're importing is a valid Balatro save file

### Profile Not Loading

**Problem**: Profile tab shows "No Profile Loaded"

**Solution**: 
- Make sure you're importing the `profile.jkr` file (not `meta.jkr`)
- Verify the file is from a valid Balatro save
- Try importing again after refreshing the page

### Changes Not Saving in Game

**Problem**: Exported file doesn't work in Balatro

**Solution**:
1. Make sure Balatro is completely closed before replacing files
2. Backup your original files first
3. Verify you're replacing the correct file in the correct location
4. Check that the file extension is exactly `.jkr` (not `.jkr.txt`)

---

## Acknowledgments

### Project Creator

- **[MatFon73](https://github.com/MatFon73)** - Project creator and developer

### Special Thanks

- **[LocalThunk](https://x.com/localthunk)** - Creator of Balatro
- **[TeddyHuang-00](https://github.com/TeddyHuang-00)** - Creator of [BalatroSaveEditor](https://github.com/TeddyHuang-00/BalatroSaveEditor) - JKR format reference
- **Balatro Wiki Community** - For card images and information
- **Contributors** - Everyone who has helped improve this project

### JKR Format Implementation

This project implements client-side JKR file processing inspired by the format documentation from **[BalatroSaveEditor](https://github.com/TeddyHuang-00/BalatroSaveEditor)** by TeddyHuang-00.

- **Repository**: [github.com/TeddyHuang-00/BalatroSaveEditor](https://github.com/TeddyHuang-00/BalatroSaveEditor)

---

## Useful Links

- [Balatro on Steam](https://store.steampowered.com/app/2379780/Balatro/)
- [LocalThunk on Twitter/X](https://x.com/localthunk)
- [Balatro Wiki](https://balatrogame.fandom.com/)
- [Official Balatro Website](https://www.playbalatro.com/)
- [Balatro Discord Community](https://discord.gg/balatro)
- [BalatroSaveEditor Repository](https://github.com/TeddyHuang-00/BalatroSaveEditor)

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Author

<div align="center">

**MatFon73**

[![GitHub](https://img.shields.io/badge/GitHub-MatFon73-181717?style=for-the-badge&logo=github)](https://github.com/MatFon73)
[![Twitter](https://img.shields.io/badge/Twitter-@MatFon73-1DA1F2?style=for-the-badge&logo=twitter)](https://x.com/MatFon73)

_Systems Engineer_

</div>

---

<div align="center">

Made for the Balatro community

</div>