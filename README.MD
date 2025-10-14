# Balatro Editor

<div align="center">

![Balatro](https://img.shields.io/badge/BalatroEditor-8b5cf6?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3QgeD0iMyIgeT0iMyIgd2lkdGg9IjE4IiBoZWlnaHQ9IjE4IiByeD0iMiIgZmlsbD0iI2ZmZiIvPgo8L3N2Zz4=)
![Version](https://img.shields.io/badge/version-1.0.0-a78bfa?style=for-the-badge)
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
- Export to .json for manual editing

---

## Installation

### Prerequisites

- XAMPP (Apache + PHP)
- Python 3.8 or higher
- Git

### Step 1: Clone the Repository

```bash
git clone https://github.com/MatFon73/BalatroEditor.git
```

### Step 2: Move to XAMPP htdocs

Move the project folder to your XAMPP htdocs directory:

**Windows:**

```
C:\xampp\htdocs\BalatroEditor\
```

**macOS:**

```
/Applications/XAMPP/htdocs/BalatroEditor/
```

**Linux:**

```
/opt/lampp/htdocs/BalatroEditor/
```

### Step 3: Clone BalatroSaveEditor

Navigate to your project folder and clone the required dependency:

```bash
cd C:\xampp\htdocs\BalatroEditor # Adjust path for your OS

git clone https://github.com/TeddyHuang-00/BalatroSaveEditor.git
```

### Step 4: Install Python Dependencies

```bash
cd BalatroSaveEditor

pip install -r requirements.txt

cd ..
```

### Step 5: Verify Python Installation

Make sure Python is accessible from command line:

```bash
py --version
```

If you get an error, add Python to your system PATH:

**Windows:**

- Add to PATH: `C:\Users\{Your_User}\AppData\Local\Programs\Python\Python313\;`

- Restart your terminal

**macOS/Linux:**

- Python should be available as `python3`

### Step 6: File Structure

Your final directory structure should look like this:

```
htdocs/
└── BalatroEditor/
    ├── BalatroSaveEditor/     ← Cloned repository
    │   ├── main.py
    │   └── requirements.txt
    ├── data/
    │   └── meta.json
    ├── public/
    │   ├── css/
    │   │   ├── style.css
    │   │   └── profile.css
    │   └── js/
    │       ├── meta.js
    │       └── profile.js
    ├── api.php            ← PHP API endpoint
    ├── favicon.ico
    ├── index.html
    ├── LICENSE
    ├── php_errors.log
    └── README.md
```

### Step 7: Start XAMPP

1. Open XAMPP Control Panel
2. Start **Apache** (MySQL is not required)
3. Make sure Apache is running on port 80 (or note your custom port)

### Step 8: Test the Installation

Open your browser and navigate to:

```
http://localhost/BalatroEditor/
```

To verify the API is working, visit:

```
http://localhost/BalatroEditor/api.php?endpoint=health
```

You should see a JSON response like:

```json
{
  "status": "ok",
  "balatro_editor_found": true,
  "python_available": true
}
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

1. **Player Name**: Click the name field to change your profile name
2. **High Scores**: Edit any high score value (Highest Ante, Best Hand, Most Money, Win Streak, etc.)
3. **Career Statistics**: Modify total counts (Wins, Losses, Hands Played, Dollars Earned, etc.)
4. **Progress Tracking**: Adjust completion percentages
   - Challenges Completed (max 20)
   - Deck Stakes (max 120)
   - Joker Stickers (max 1200)
   - Items Discovered (max 340)
5. **Deck Statistics**: View (read-only) detailed stats for each deck including wins, losses, and win rates

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

#### Alternative: JSON Export

If you prefer manual editing:

1. Click **"Export .json"** instead
2. Edit the JSON file with any text editor
3. Use the Python script to convert back:
   ```bash
   cd BalatroSaveEditor

   py main.py import path/to/meta.json -o meta.jkr
   ```

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

</td>
</tr>
</table>

### Backend

<table>
<tr>
<td align="center" width="50%">

### PHP

**Version**: 7.4+

**Usage**:

- API endpoint for JKR conversion
- Execute Python scripts
- Handle file operations

</td>
<td align="center" width="50%">

### Python

**Version**: 3.8+

**Usage**:

- JKR file encoding/decoding
- Lua serialization
- Zlib compression

</td>
</tr>
</table>

### External Libraries

- **Font Awesome**: 7.1.0 - Icon library for UI elements
- **Google Fonts**: Inter font family
- **BalatroSaveEditor**: JKR conversion engine

---

## Technical Features

### Optimizations

- **Lazy Loading**: Images from Balatro Wiki
- **Skeleton Loading**: Visual feedback during data loading
- **Async Operations**: Non-blocking file conversions
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

### Python Not Found Error

**Problem**: PHP can't execute Python commands

**Solution 1**: Use full path to Python in `api.php`:

```php
$python_cmd = 'C:\\Users\\{Your User}\\AppData\\Local\\Programs\\Python\\Python313\\python.exe'; // Windows

$python_cmd = '/usr/bin/python3'; // macOS/Linux
```

**Solution 2**: Add Python to system PATH

- **Windows**: System Properties → Environment Variables → PATH → Add Python directory
- **macOS/Linux**: Should work with `python3` command

### BalatroSaveEditor Not Found

Make sure the repository is cloned in the correct location:

```
htdocs/BalatroEditor/BalatroSaveEditor/main.py
```

Verify the file exists at this exact path.

### Apache Port Already in Use

If port 80 is occupied:

1. Open XAMPP Control Panel
2. Click **Config** → **httpd.conf**
3. Change `Listen 80` to `Listen 8080`
4. Restart Apache
5. Access editor at: `http://localhost:8080/BalatroEditor/`

### exec() Function Disabled in PHP

Some PHP installations disable `exec()` for security.

**Solution**: Edit `php.ini`:

```ini
; Remove 'exec' from this line (if present)
disable_functions =
```

Restart Apache after editing.

### Conversion Fails Without Error

1. Open browser console (F12)
2. Check for JavaScript errors
3. Verify API health endpoint returns `true` for both fields
4. Check Apache error logs in XAMPP

### Profile Not Loading

**Problem**: Profile tab shows "No Profile Loaded"

**Solution**: Make sure you're importing the `profile.jkr` file (not `meta.jkr`) and that the file is from a valid Balatro save.

---

## Acknowledgments

### Project Creator

- **[MatFon73](https://github.com/MatFon73)** - Project creator and developer

### Special Thanks

- **[LocalThunk](https://x.com/localthunk)** - Creator of Balatro
- **[TeddyHuang-00](https://github.com/TeddyHuang-00)** - Creator of [BalatroSaveEditor](https://github.com/TeddyHuang-00/BalatroSaveEditor)
- **Balatro Wiki Community** - For card images and information
- **Contributors** - Everyone who has helped improve this project

### JKR Format Implementation

This project uses the JKR file format encoding/decoding algorithm from **[BalatroSaveEditor](https://github.com/TeddyHuang-00/BalatroSaveEditor)** by TeddyHuang-00. Without their work in reverse-engineering the Balatro save format, this editor wouldn't have been possible.

- **Repository**: [github.com/TeddyHuang-00/BalatroSaveEditor](https://github.com/TeddyHuang-00/BalatroSaveEditor)
- **Implementation**: JKR format encoder/decoder with Lua serialization

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