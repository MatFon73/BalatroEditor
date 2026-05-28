const _translations = {
  "en": {
    "app.title": "Balatro Editor",
    "app.version": "v2.0.1 — 1.0.1.o-FULL",
    "app.description": "Balatro mod that allows editing the profile and joker collection.",
    "nav.jokers": "Jokers",
    "nav.tarots": "Tarots",
    "nav.planets": "Planets",
    "nav.spectrals": "Spectrals",
    "nav.vouchers": "Vouchers",
    "nav.decks": "Decks",
    "nav.modifiers": "Card Modifiers",
    "nav.tags": "Tags",
    "nav.blinds": "Blinds",
    "nav.profile": "Profile",
    "nav.edit_games": "Edit Games",
    "nav.enhancements": "Enhancements",
    "nav.editions": "Editions",
    "nav.seals": "Seals",
    "nav.coming_soon": "Coming Soon",
    "search.placeholder": "Search cards...",
    "btn.unlock_all": "Unlock All",
    "btn.lock_all": "Lock All",
    "btn.import": "Import",
    "btn.export": "Export",
    "btn.edit_mode": "Edit Mode",
    "btn.editing": "Editing",
    "btn.save_export": "Save & Export",
    "btn.import_profile": "Import profile.jkr",
    "section.player_profile": "Player Profile",
    "section.high_scores": "High Scores",
    "section.career_stats": "Career Statistics",
    "section.progress": "Progress",
    "section.last_session": "Last Session",
    "section.deck_stats": "Deck Statistics",
    "section.top_jokers": "Top 10 Jokers Used",
    "section.hand_types": "Hand Types Played",
    "section.top_consumables": "Top 10 Consumables Used",
    "section.challenge_progress": "Challenge Progress",
    "stat.unlocked": "Unlocked",
    "stat.discovered": "Discovered",
    "stat.locked": "Locked",
    "stat.wins": "Wins",
    "stat.losses": "Losses",
    "stat.rounds_played": "Rounds Played",
    "stat.hands_played": "Hands Played",
    "stat.cards_played": "Cards Played",
    "stat.cards_discarded": "Cards Discarded",
    "stat.dollars_earned": "Dollars Earned",
    "stat.shop_spending": "Shop Spending",
    "stat.jokers_sold": "Jokers Sold",
    "stat.vouchers_bought": "Vouchers Bought",
    "stat.highest_ante": "Highest Ante",
    "stat.highest_round": "Highest Round",
    "stat.best_hand": "Best Hand",
    "stat.most_money": "Most Money",
    "stat.win_streak": "Best Win Streak",
    "stat.boss_streak": "Boss Streak",
    "stat.collection": "Collection",
    "stat.win_rate": "Win Rate:",
    "stat.times_used": "Times Used:",
    "stat.total_rounds": "Total Rounds:",
    "stat.challenges_completed": "Challenges Completed",
    "stat.deck_stakes": "Deck Stakes",
    "stat.joker_stickers": "Joker Stickers",
    "stat.items_discovered": "Items Discovered",
    "stat.last_deck": "Last Deck Used",
    "stat.last_stake": "Last Stake",
    "stat.unknown": "Unknown",
    "table.joker": "Joker",
    "table.used": "Used",
    "table.wins": "Wins",
    "table.losses": "Losses",
    "table.win_rate": "Win Rate",
    "table.card": "Card",
    "table.times_used": "Times Used",
    "deck.red": "Red Deck",
    "deck.blue": "Blue Deck",
    "deck.yellow": "Yellow Deck",
    "deck.green": "Green Deck",
    "deck.black": "Black Deck",
    "deck.magic": "Magic Deck",
    "deck.nebula": "Nebula Deck",
    "deck.ghost": "Ghost Deck",
    "deck.abandoned": "Abandoned Deck",
    "deck.checkered": "Checkered Deck",
    "deck.zodiac": "Zodiac Deck",
    "deck.painted": "Painted Deck",
    "deck.anaglyph": "Anaglyph Deck",
    "deck.plasma": "Plasma Deck",
    "deck.erratic": "Erratic Deck",
    "placeholder.player_name": "Player Name",
    "notif.preparing_meta": "Preparing meta.jkr for export...",
    "notif.exporting_meta": "Exporting meta.jkr...",
    "notif.exported_meta": "meta.jkr exported successfully!",
    "notif.export_failed": "Export failed: {message}",
    "notif.invalid_meta_file": "Please select a valid meta.jkr file",
    "notif.converting": "Converting JKR...",
    "notif.invalid_meta_data": "Invalid meta.jkr: missing unlocked/discovered data",
    "notif.imported_meta": "meta.jkr imported successfully!",
    "notif.import_error": "Error importing JKR: {message}",
    "notif.preparing_profile": "Preparing profile.jkr for export...",
    "notif.exporting_profile": "Exporting profile.jkr...",
    "notif.exported_profile": "Profile exported successfully!",
    "notif.loading_profile": "Loading profile...",
    "notif.profile_loaded": "Profile loaded successfully!",
    "notif.profile_error": "Error loading profile: {message}",
    "notif.no_profile_data": "No profile data to export",
    "notif.cannot_export": "Cannot export: {message}",
    "notif.export_cancelled": "Export cancelled",
    "notif.exporting_error": "Error exporting: {message}",
    "notif.file_read_error": "Failed to read file",
    "state.loading_data": "Loading data...",
    "state.loading": "Loading...",
    "state.skeleton_unlocked": "Unlocked",
    "state.skeleton_discovered": "Discovered",
    "state.no_profile": "No Profile Loaded",
    "state.no_profile_desc": "Import your Balatro profile.jkr to view and edit your stats",
    "error.no_profile_module": "Profile module not loaded",
    "error.no_profile_module_desc": "Make sure profile.js is included",
    "error.load_meta": "Error loading meta.json",
    "error.load_meta_desc": "Make sure the file is in the same folder",
    "error.meta_invalid": "metaData structure is invalid",
    "error.not_profile_file": "This is a meta.jkr file, not a profile.jkr file. Please select your profile.jkr file instead.",
    "error.missing_key": "Missing required key: {key}",
    "error.career_stats_type": "career_stats must be an object",
    "error.high_scores_type": "high_scores must be an object",
    "error.challenges_missing": "progress.challenges is missing",
    "error.deck_stakes_missing": "progress.deck_stakes is missing",
    "error.invalid_profile": "Invalid profile.jkr structure:\n{details}",
    "empty.no_items": "No items found",
    "empty.try_different": "Try a different search term",
    "empty.no_high_scores": "No high scores data",
    "empty.no_career_stats": "No career stats data",
    "empty.no_progress": "No progress data",
    "footer.created_by": "Created by @MatFon73",
    "footer.jkr_credit": "JKR Convertor based on BalatroSaveEditor",
    "footer.file_location": "File Location:",
    "footer.windows_path": "Windows: C:\\Users\\YourName\\AppData\\Roaming\\Balatro\\profile.jkr",
    "footer.mac_path": "Mac: ~/Library/Application Support/Balatro/profile.jkr",
    "footer.linux_path": "Linux: ~/.local/share/Balatro/profile.jkr"
  },
  "es": {
    "app.title": "Balatro Editor",
    "app.version": "v2.0.1 — 1.0.1.o-FULL",
    "app.description": "Mod de Balatro que permite editar el perfil y la colecci\u00f3n de comodines.",
    "nav.jokers": "Comodines",
    "nav.tarots": "Arcanos",
    "nav.planets": "Planetas",
    "nav.spectrals": "Espectrales",
    "nav.vouchers": "Vales",
    "nav.decks": "Mazos",
    "nav.modifiers": "Modificadores de Cartas",
    "nav.tags": "Etiquetas",
    "nav.blinds": "Ciegas",
    "nav.profile": "Perfil",
    "nav.edit_games": "Editar Partidas",
    "nav.enhancements": "Mejoras",
    "nav.editions": "Ediciones",
    "nav.seals": "Sellos",
    "nav.coming_soon": "Pr\u00f3ximamente",
    "search.placeholder": "Buscar cartas...",
    "btn.unlock_all": "Desbloquear Todo",
    "btn.lock_all": "Bloquear Todo",
    "btn.import": "Importar",
    "btn.export": "Exportar",
    "btn.edit_mode": "Modo Edici\u00f3n",
    "btn.editing": "Editando",
    "btn.save_export": "Guardar y Exportar",
    "btn.import_profile": "Importar profile.jkr",
    "section.player_profile": "Perfil del Jugador",
    "section.high_scores": "Puntajes Altos",
    "section.career_stats": "Estad\u00edsticas de Carrera",
    "section.progress": "Progreso",
    "section.last_session": "\u00daltima Sesi\u00f3n",
    "section.deck_stats": "Estad\u00edsticas de Mazos",
    "section.top_jokers": "Top 10 Comodines Usados",
    "section.hand_types": "Tipos de Mano Jugados",
    "section.top_consumables": "Top 10 Consumibles Usados",
    "section.challenge_progress": "Progreso de Desaf\u00edos",
    "stat.unlocked": "Desbloqueado",
    "stat.discovered": "Descubierto",
    "stat.locked": "Bloqueado",
    "stat.wins": "Victorias",
    "stat.losses": "Derrotas",
    "stat.rounds_played": "Rondas Jugadas",
    "stat.hands_played": "Manos Jugadas",
    "stat.cards_played": "Cartas Jugadas",
    "stat.cards_discarded": "Cartas Descartadas",
    "stat.dollars_earned": "Ganancias",
    "stat.shop_spending": "Gastos en Tienda",
    "stat.jokers_sold": "Comodines Vendidos",
    "stat.vouchers_bought": "Vales Comprados",
    "stat.highest_ante": "Ante M\u00e1s Alto",
    "stat.highest_round": "Ronda M\u00e1s Alta",
    "stat.best_hand": "Mejor Mano",
    "stat.most_money": "M\u00e1s Dinero",
    "stat.win_streak": "Mejor Racha",
    "stat.boss_streak": "Racha de Jefes",
    "stat.collection": "Colecci\u00f3n",
    "stat.win_rate": "Porcentaje:",
    "stat.times_used": "Veces Usado:",
    "stat.total_rounds": "Rondas Totales:",
    "stat.challenges_completed": "Desaf\u00edos Completados",
    "stat.deck_stakes": "Apuestas de Mazo",
    "stat.joker_stickers": "Stickers de Comodines",
    "stat.items_discovered": "Objetos Descubiertos",
    "stat.last_deck": "\u00daltimo Mazo Usado",
    "stat.last_stake": "\u00daltima Apuesta",
    "stat.unknown": "Desconocido",
    "table.joker": "Comod\u00edn",
    "table.used": "Usado",
    "table.wins": "Victorias",
    "table.losses": "Derrotas",
    "table.win_rate": "Porcentaje",
    "table.card": "Carta",
    "table.times_used": "Veces Usado",
    "deck.red": "Mazo Rojo",
    "deck.blue": "Mazo Azul",
    "deck.yellow": "Mazo Amarillo",
    "deck.green": "Mazo Verde",
    "deck.black": "Mazo Negro",
    "deck.magic": "Mazo M\u00e1gico",
    "deck.nebula": "Mazo Nebulosa",
    "deck.ghost": "Mazo Fantasma",
    "deck.abandoned": "Mazo Abandonado",
    "deck.checkered": "Mazo Ajedrez",
    "deck.zodiac": "Mazo Zodiaco",
    "deck.painted": "Mazo Pintado",
    "deck.anaglyph": "Mazo Anaglifo",
    "deck.plasma": "Mazo Plasma",
    "deck.erratic": "Mazo Err\u00e1tico",
    "placeholder.player_name": "Nombre del Jugador",
    "notif.preparing_meta": "Preparando meta.jkr para exportar...",
    "notif.exporting_meta": "Exportando meta.jkr...",
    "notif.exported_meta": "\u00a1meta.jkr exportado exitosamente!",
    "notif.export_failed": "Error al exportar: {message}",
    "notif.invalid_meta_file": "Seleccion\u00e1 un archivo meta.jkr v\u00e1lido",
    "notif.converting": "Convirtiendo JKR...",
    "notif.invalid_meta_data": "meta.jkr inv\u00e1lido: faltan datos de unlocked/discovered",
    "notif.imported_meta": "\u00a1meta.jkr importado exitosamente!",
    "notif.import_error": "Error al importar JKR: {message}",
    "notif.preparing_profile": "Preparando profile.jkr para exportar...",
    "notif.exporting_profile": "Exportando profile.jkr...",
    "notif.exported_profile": "\u00a1Perfil exportado exitosamente!",
    "notif.loading_profile": "Cargando perfil...",
    "notif.profile_loaded": "\u00a1Perfil cargado exitosamente!",
    "notif.profile_error": "Error al cargar perfil: {message}",
    "notif.no_profile_data": "No hay datos de perfil para exportar",
    "notif.cannot_export": "No se puede exportar: {message}",
    "notif.export_cancelled": "Exportaci\u00f3n cancelada",
    "notif.exporting_error": "Error al exportar: {message}",
    "notif.file_read_error": "Error al leer el archivo",
    "state.loading_data": "Cargando datos...",
    "state.loading": "Cargando...",
    "state.skeleton_unlocked": "Desbloqueado",
    "state.skeleton_discovered": "Descubierto",
    "state.no_profile": "Sin Perfil Cargado",
    "state.no_profile_desc": "Import\u00e1 tu profile.jkr de Balatro para ver y editar tus estad\u00edsticas",
    "error.no_profile_module": "M\u00f3dulo de perfil no cargado",
    "error.no_profile_module_desc": "Asegurate de que profile.js est\u00e9 incluido",
    "error.load_meta": "Error al cargar meta.json",
    "error.load_meta_desc": "Asegurate de que el archivo est\u00e9 en la misma carpeta",
    "error.meta_invalid": "La estructura de metaData no es v\u00e1lida",
    "error.not_profile_file": "Este es un archivo meta.jkr, no un profile.jkr. Seleccion\u00e1 tu archivo profile.jkr.",
    "error.missing_key": "Falta clave requerida: {key}",
    "error.career_stats_type": "career_stats debe ser un objeto",
    "error.high_scores_type": "high_scores debe ser un objeto",
    "error.challenges_missing": "Falta progress.challenges",
    "error.deck_stakes_missing": "Falta progress.deck_stakes",
    "error.invalid_profile": "Estructura de profile.jkr inv\u00e1lida:\n{details}",
    "empty.no_items": "Sin resultados",
    "empty.try_different": "Prob\u00e1 con otro t\u00e9rmino de b\u00fasqueda",
    "empty.no_high_scores": "Sin datos de puntajes altos",
    "empty.no_career_stats": "Sin datos de estad\u00edsticas",
    "empty.no_progress": "Sin datos de progreso",
    "footer.created_by": "Creado por @MatFon73",
    "footer.jkr_credit": "Convertidor JKR basado en BalatroSaveEditor",
    "footer.file_location": "Ubicaci\u00f3n del Archivo:",
    "footer.windows_path": "Windows: C:\\Users\\TuNombre\\AppData\\Roaming\\Balatro\\profile.jkr",
    "footer.mac_path": "Mac: ~/Library/Application Support/Balatro/profile.jkr",
    "footer.linux_path": "Linux: ~/.local/share/Balatro/profile.jkr"
  }
};

let _lang = 'en';

function __(key, params = {}) {
    let val = _translations[_lang]?.[key];
    if (typeof val !== 'string') return key;
    return val.replace(/\{(\w+)\}/g, (_, p) => params[p] !== undefined ? params[p] : `{${p}}`);
}

function initLanguage() {
    _lang = localStorage.getItem('balatro-lang') || 'en';
    if (!_translations[_lang]) _lang = 'en';
    document.documentElement.lang = _lang;

    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === _lang);
    });

    applyTranslations();
    populateDropdowns();
}

function setLanguage(lang) {
    if (!_translations[lang]) return;
    _lang = lang;
    localStorage.setItem('balatro-lang', lang);
    document.documentElement.lang = lang;
    applyTranslations();
    populateDropdowns();
    if (typeof editMode !== 'undefined') editMode = false;
    if (typeof renderCategory === 'function') renderCategory(currentCategory);
}

function getCurrentLanguage() {
    return _lang;
}

function populateDropdowns() {
    const cats = ['jokers', 'tarots', 'planets', 'spectrals', 'vouchers', 'decks', 'modifiers', 'tags', 'blinds'];
    const select = document.getElementById('category-select');
    if (!select) return;
    select.innerHTML = cats.map(c =>
        `<option value="${c}">${__('nav.' + c)}</option>`
    ).join('');
}

function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.dataset.i18n;
        const text = __(key);
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
            el.placeholder = text;
        } else if (el.tagName === 'TITLE') {
            el.textContent = text;
        } else if (el.tagName === 'META') {
            el.content = text;
        } else {
            el.textContent = text;
        }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        el.placeholder = __(el.dataset.i18nPlaceholder);
    });

    document.querySelectorAll('[data-i18n-title]').forEach(el => {
        el.title = __(el.dataset.i18nTitle);
    });
}
