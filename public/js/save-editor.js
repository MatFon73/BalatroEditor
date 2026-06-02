let saveData = null;
let _editingDisabled = false;
let _activeSaveTab = 'game';
const _editionTypes = ['e_foil', 'e_holo', 'e_negative', 'e_polychrome'];
const _enhancementTypes = ['m_bonus', 'm_mult', 'm_wild', 'm_glass', 'm_steel', 'm_gold', 'm_lucky'];
const _sealTypes = ['Red', 'Blue', 'Purple', 'Gold'];
const _suits = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];
const _suitData = {
    Hearts:   { initial: 'H', nominal: 0.03, original: 0.003, colour: { '\t\f4': 1, '\t\f1': 0.97254901960784, '\t\f2': 0.23137254901961, '\t\f3': 0.1843137254902 } },
    Diamonds: { initial: 'D', nominal: 0.01, original: 0.001, colour: { '\t\f4': 1, '\t\f1': 0.88627450980392, '\t\f2': 0.56470588235294, '\t\f3': 0 } },
    Clubs:    { initial: 'C', nominal: 0.02, original: 0.002, colour: { '\t\f4': 1, '\t\f1': 0, '\t\f2': 0.55686274509804, '\t\f3': 0.90196078431373 } },
    Spades:   { initial: 'S', nominal: 0.04, original: 0.004, colour: { '\t\f4': 1, '\t\f1': 0.30980392156863, '\t\f2': 0.1921568627451, '\t\f3': 0.72549019607843 } }
};
const _values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'Jack', 'Queen', 'King', 'Ace'];
const _valueAbbrev = { '2':'2','3':'3','4':'4','5':'5','6':'6','7':'7','8':'8','9':'9','10':'10','Jack':'J','Queen':'Q','King':'K','Ace':'A' };
const _valueMap = { '2':2,'3':3,'4':4,'5':5,'6':6,'7':7,'8':8,'9':9,'10':10,'Jack':11,'Queen':12,'King':13,'Ace':14 };

let _allJokerIds = null;
let _allVoucherIds = null;

const STAKES = [
    { id: 0, label: 'White Stake', labelEs: 'Apuesta Blanca' },
    { id: 1, label: 'Red Stake',   labelEs: 'Apuesta Roja' },
    { id: 2, label: 'Green Stake', labelEs: 'Apuesta Verde' },
    { id: 3, label: 'Black Stake', labelEs: 'Apuesta Negra' },
    { id: 4, label: 'Blue Stake',  labelEs: 'Apuesta Azul' },
    { id: 5, label: 'Purple Stake', labelEs: 'Apuesta Púrpura' },
    { id: 6, label: 'Orange Stake', labelEs: 'Apuesta Naranja' },
    { id: 7, label: 'Gold Stake',  labelEs: 'Apuesta Dorada' }
];

const DECK_NAMES = {
    b_red: 'Red Deck', b_blue: 'Blue Deck', b_yellow: 'Yellow Deck',
    b_green: 'Green Deck', b_black: 'Black Deck', b_magic: 'Magic Deck',
    b_nebula: 'Nebula Deck', b_ghost: 'Ghost Deck', b_abandoned: 'Abandoned Deck',
    b_checkered: 'Checkered Deck', b_zodiac: 'Zodiac Deck', b_painted: 'Painted Deck',
    b_anaglyph: 'Anaglyph Deck', b_plasma: 'Plasma Deck', b_erratic: 'Erratic Deck'
};

function getDeckPosition(index, totalDecks) {
    const cols = Math.min(totalDecks, 4);
    return { x: index % cols, y: Math.floor(index / cols) };
}

function getAllDeckIds() {
    const fromMeta = getAllItemIds('b_');
    if (fromMeta.length > 0) return fromMeta;
    return Object.keys(DECK_NAMES);
}

function getAllItemIds(prefix) {
    if (!metaData || !metaData.unlocked) return [];
    return Object.keys(metaData.unlocked)
        .filter(k => k.startsWith(prefix))
        .sort();
}

function getAllJokerIds() {
    if (_allJokerIds) return _allJokerIds;
    _allJokerIds = getAllItemIds('j_');
    return _allJokerIds;
}

function getAllVoucherIds() {
    if (_allVoucherIds) return _allVoucherIds;
    _allVoucherIds = getAllItemIds('v_');
    return _allVoucherIds;
}

function getSaveVouchers() {
    if (!saveData) return [];
    return Object.keys(saveData.GAME.used_vouchers || {}).filter(k => k.startsWith('v_')).sort();
}

function encodeNumKey(key) {
    return '\t\f' + key;
}

function decodeNumKey(key) {
    if (typeof key === 'string' && key.startsWith('\t\f')) {
        return parseInt(key.substring(2));
    }
    return key;
}

function getCardsInArea(area) {
    // area = saveData.cardAreas.jokers.cards (already encoded)
    const cards = saveData?.cardAreas?.[area]?.cards;
    if (!cards) return [];
    return Object.keys(cards)
        .filter(k => k.startsWith('\t\f'))
        .sort((a, b) => {
            const na = parseInt(a.substring(2));
            const nb = parseInt(b.substring(2));
            return na - nb;
        })
        .map(k => ({ key: k, card: cards[k], index: parseInt(k.substring(2)) }));
}

function _hasOopsJoker() {
    if (!saveData?.cardAreas?.jokers?.cards) return false;
    return Object.values(saveData.cardAreas.jokers.cards).some(
        c => c?.save_fields?.center === 'j_oops'
    );
}

function getNextCardIndex(area) {
    const entries = getCardsInArea(area);
    if (entries.length === 0) return 1;
    return Math.max(...entries.map(e => e.index)) + 1;
}

function getProperty(obj, path) {
    const parts = path.split('.');
    let cur = obj;
    for (const p of parts) {
        if (cur == null) return undefined;
        cur = cur[p];
    }
    return cur;
}

function setProperty(obj, path, value) {
    const parts = path.split('.');
    let cur = obj;
    for (let i = 0; i < parts.length - 1; i++) {
        if (!cur[parts[i]]) cur[parts[i]] = {};
        cur = cur[parts[i]];
    }
    cur[parts[parts.length - 1]] = value;
}

const _enhancementInfo = {
    m_bonus:  { effect: 'Bonus Card',  label: 'Bonus Card',  name: 'Bonus',      abilityValues: { bonus: 30 } },
    m_mult:   { effect: 'Mult Card',   label: 'Mult Card',   name: 'Mult',       abilityValues: { mult: 4 } },
    m_wild:   { effect: 'Wild Card',   label: 'Wild Card',   name: 'Wild' },
    m_glass:  { effect: 'Glass Card',  label: 'Glass Card',  name: 'Glass' },
    m_steel:  { effect: 'Steel Card',  label: 'Steel Card',  name: 'Steel' },
    m_gold:   { effect: 'Gold Card',   label: 'Gold Card',   name: 'Gold',       abilityValues: { h_dollars: 3 } },
    m_lucky:  { effect: 'Lucky Card',  label: 'Lucky Card',  name: 'Lucky Card', abilityValues: { mult: 20, p_dollars: 20 } }
};

const _consumableSets = {
    tarots:  { set: 'Tarot',   names: ['fool','magician','high_priestess','empress','emperor','heirophant','lovers','chariot','justice','hermit','wheel_of_fortune','strength','hanged_man','death','temperance','devil','tower','star','moon','sun','judgement','world'] },
    planets: { set: 'Planet',  names: ['mercury','venus','earth','mars','jupiter','saturn','uranus','neptune','pluto','planet_x','ceres','eris'] },
    spectrals: { set: 'Spectral', names: ['familiar','grim','incantation','talisman','aura','wraith','sigil','ouija','ectoplasm','immolate','ankh','deja_vu','hex','trance','medium','cryptid','soul','black_hole'] }
};

function getConsumableSet(id) {
    const name = id.replace(/^c_/, '');
    for (const cat of Object.values(_consumableSets)) {
        if (cat.names.includes(name)) return cat.set;
    }
    return null;
}

const _editionConfig = {
    e_foil:        { type: 'foil',        foil: true,        chips: 50 },
    e_holo:        { type: 'holo',        holo: true,        mult: 10 },
    e_polychrome:  { type: 'polychrome',  polychrome: true,  x_mult: 1.5 },
    e_negative:    { type: 'negative',    negative: true }
};

function getJokerName(id) {
    return _jokerNames[id] || formatName(id);
}

const _jokerNames = {
    j_joker: 'Joker',
    j_greedy: 'Greedy Joker',
    j_lusty: 'Lusty Joker',
    j_wrathful: 'Wrathful Joker',
    j_gluttonous: 'Gluttonous Joker',
    j_jolly: 'Jolly Joker',
    j_zany: 'Zany Joker',
    j_mad: 'Mad Joker',
    j_crazy: 'Crazy Joker',
    j_droll: 'Droll Joker',
    j_sly: 'Sly Joker',
    j_wily: 'Wily Joker',
    j_clever: 'Clever Joker',
    j_devious: 'Devious Joker',
    j_crafty: 'Crafty Joker',
    j_half: 'Half Joker',
    j_stencil: 'Joker Stencil',
    j_ceremonial: 'Ceremonial Dagger',
    j_marble: 'Marble Joker',
    j_loyalty: 'Loyalty Card',
    j_chaos: 'Chaos the Clown',
    j_steel: 'Steel Joker',
    j_abstract: 'Abstract Joker',
    j_space: 'Space Joker',
    j_blue: 'Blue Joker',
    j_faceless: 'Faceless Joker',
    j_green: 'Green Joker',
    j_stone: 'Stone Joker',
    j_golden: 'Golden Joker',
    j_baseball: 'Baseball Card',
    j_business: 'Business Card',
    j_trading: 'Trading Card',
    j_gift_card: 'Gift Card',
    j_smeared: 'Smeared Joker',
    j_invisible: 'Invisible Joker',
    j_burnt: 'Burnt Joker',
    j_square: 'Square Joker',
    j_glass: 'Glass Joker',
    j_wee: 'Wee Joker',
    j_flash: 'Flash Card',
    j_ancient: 'Ancient Joker',
    j_oops: "Oops! All 6s",
    j_seance: 'Séance',
    j_merry_andy: 'Merry Andy',
    j_idol: 'The Idol',
    j_caino: 'Canio',
    j_riff_raff: 'Riff-Raff',
    j_hit_the_road: 'Hit the Road',
    j_smiley: 'Smiley Face',
    j_todo: 'To Do List',
    j_walkie_talkie: 'Walkie Talkie',
    j_sock_and_buskin: 'Sock and Buskin',
    j_shoot_the_moon: 'Shoot the Moon',
    j_ride_the_bus: 'Ride the Bus',
    j_mr_bones: 'Mr. Bones',
    j_card_sharp: 'Card Sharp',
    j_seeing_double: 'Seeing Double',
    j_driver_license: "Driver's License",
    j_mail_in_rebate: 'Mail-In Rebate',
    j_to_the_moon: 'To the Moon'
};

const _jokerTemplates = {
    // Type A: extra as primitive → card.ability.extra = value
    // Type D: extra as primitive + ability-level keys → card.ability.extra = value, card.ability.key = val
    j_8_ball:            { extra: { value: 50, fixed: true } },
    j_acrobat:           { extra: { value: 3, fixed: true }, Xmult: { value: 1, fixed: true } },
    j_ancient:           { extra: { value: 1, fixed: true }, Xmult: { value: 1, fixed: true } },
    j_arrowhead:         { extra: { value: 50, fixed: true }, suit: { value: 'Spades', fixed: true } },
    j_banner:            { extra: { value: 4, fixed: true } },
    j_baron:             { extra: { value: 2, fixed: true } },
    j_baseball:          { extra: { value: 1, fixed: true } },
    j_blackboard:        { extra: { value: 3, fixed: true }, suit: { value: 'Spades', fixed: true } },
    j_blue:              { extra: { value: 2, fixed: true } },
    j_bull:              { extra: { value: 2, fixed: true } },
    j_burnt:             { extra: { value: 1, fixed: true } },
    j_caino:             { extra: { value: 1, fixed: true } },
    j_campfire:          { extra: { value: 0.5, fixed: true }, Xmult: { value: 1, fixed: false } },
    j_captain:           { extra: { value: 2, fixed: true }, Xmult: { value: 1, fixed: true } },
    j_cartomancer:       { extra: { value: 1, fixed: true } },
    j_certificate:       { extra: { value: 'S', fixed: true } },
    j_chaos:             { extra: { value: 1, fixed: true } },
    j_cloud_9:           { extra: { value: 1, fixed: true } },
    j_constellation:     { extra: { value: 0.1, fixed: true }, Xmult: { value: 1, fixed: false } },
    j_credit_card:       { extra: { value: -20, fixed: true } },
    j_dna:               { extra: { value: 1, fixed: true } },
    j_dusk:              { extra: { value: 1, fixed: true } },
    j_erosion:           { extra: { value: 4, fixed: true } },
    j_even_steven:       { extra: { value: 4, fixed: true } },
    j_fibonacci:         { extra: { value: 8, fixed: true } },
    j_flash:             { extra: { value: 2, fixed: true }, mult: { value: 0, fixed: false } },
    j_flower_pot:        { extra: { value: 20, fixed: true } },
    j_fortune_teller:    { extra: { value: 1, fixed: false } },
    j_glass:             { extra: { value: 1, fixed: true }, Xmult: { value: 1, fixed: true } },
    j_golden:            { extra: { value: 4, fixed: true } },
    j_golden_ticket:     { extra: { value: 5, fixed: true } },
    j_hallucination:     { extra: { value: 50, fixed: true } },
    j_hanging_chad:      { extra: { value: 2, fixed: true } },
    j_hiker:             { extra: { value: 5, fixed: false } },
    j_hit_the_road:      { extra: { value: 3, fixed: true }, Xmult: { value: 1, fixed: false } },
    j_hologram:          { extra: { value: 0.25, fixed: true }, Xmult: { value: 1, fixed: false } },
    j_idol:              { extra: { value: 2, fixed: true }, Xmult: { value: 1, fixed: true } },
    j_invisible:         { extra: { value: 2, fixed: true } },
    j_lovers:            { extra: { value: 1, fixed: true } },
    j_lucky_cat:         { extra: { value: 0.25, fixed: true }, Xmult: { value: 1, fixed: false } },
    j_madness:           { extra: { value: 0.5, fixed: true }, Xmult: { value: 0, fixed: false } },
    j_matador:           { extra: { value: 8, fixed: true } },
    j_mime:              { extra: { value: 1, fixed: true } },
    j_midas_mask:        { extra: { value: 1, fixed: true } },
    j_moon:              { extra: { value: 'Clubs', fixed: true } },
    j_odd_todd:          { extra: { value: 3, fixed: true } },
    j_obelisk:           { extra: { value: 0.2, fixed: true }, Xmult: { value: 0, fixed: false } },
    j_onyx_agate:        { extra: { value: 7, fixed: true }, suit: { value: 'Clubs', fixed: true } },
    j_photograph:        { extra: { value: 2, fixed: true } },
    j_raised_fist:       { extra: { value: -2, fixed: true } },
    j_ramen:             { extra: { value: -0.01, fixed: true }, Xmult: { value: 2, fixed: false } },
    j_red_card:          { extra: { value: 3, fixed: true }, mult: { value: 0, fixed: false } },
    j_ride_the_bus:      { extra: { value: 1, fixed: true }, mult: { value: 0, fixed: false } },
    j_riff_raff:         { extra: { value: 2, fixed: true } },
    j_rough_gem:         { extra: { value: 1, fixed: true }, suit: { value: 'Diamonds', fixed: true } },
    j_satellite:         { extra: { value: 1, fixed: true } },
    j_scary_face:        { extra: { value: 3, fixed: true } },
    j_seltzer:           { extra: { value: 10, fixed: false } },
    j_shoot_the_moon:   { extra: { value: 13, fixed: true } },
    j_smiley:            { extra: { value: 5, fixed: true } },
    j_smeared:           { extra: { value: 1, fixed: true } },
    j_sock_and_buskin:   { extra: { value: 2, fixed: true } },
    j_space:             { extra: { value: 4, fixed: true } },
    j_splash:            { extra: { value: 1, fixed: true } },
    j_steel:             { extra: { value: 0.2, fixed: true } },
    j_stone:             { extra: { value: 50, fixed: true } },
    j_supernova:         { extra: { value: 1, fixed: false } },
    j_superposition:     { extra: { value: 1, fixed: true } },
    j_swashbuckler:      { extra: { value: 0, fixed: false } },
    j_throwback:         { extra: { value: 0.25, fixed: true }, Xmult: { value: 1, fixed: false } },
    j_trading:           { extra: { value: 1, fixed: true } },
    j_vampire:           { extra: { value: 0.1, fixed: true }, Xmult: { value: 1, fixed: false } },
    j_vagabond:          { extra: { value: 4, fixed: true } },

    // Type B: extra is an object → card.ability.extra = { key: val, ... }
    j_abstract:          { extra: { mult: { value: 3, fixed: true } } },
    j_bloodstone:        { extra: { odds: { value: 2, fixed: true }, Xmult: { value: 1.5, fixed: true }, suit: { value: 'Hearts', fixed: true } } },
    j_bootstraps:        { extra: { mult: { value: 2, fixed: true }, dollars: { value: 5, fixed: true } } },
    j_castle:            { extra: { chips: { value: 0, fixed: false }, chip_mod: { value: 3, fixed: true } } },
    j_cavendish:         { extra: { Xmult: { value: 1.5, fixed: true }, odds: { value: 1000, fixed: true } } },
    j_ceremonial:        { extra: { mult: { value: 0, fixed: false } } },
    j_clever:            { extra: { t_chips: { value: 80, fixed: true }, type: { value: 'Two Pair', fixed: true } } },
    j_crazy:             { extra: { t_mult: { value: 10, fixed: true }, type: { value: 'Straight', fixed: true } } },
    j_devious:           { extra: { t_chips: { value: 100, fixed: true }, type: { value: 'Four of a Kind', fixed: true } } },
    j_droll:             { extra: { t_mult: { value: 10, fixed: true }, type: { value: 'Flush', fixed: true } } },
    j_drunkard:          { extra: { d_size: { value: 1, fixed: true } } },
    j_faceless:          { extra: { dollars: { value: 3, fixed: true }, faces: { value: 2, fixed: true } } },
    j_greedy:            { extra: { mult: { value: 3, fixed: true }, suit: { value: 'Diamonds', fixed: true } } },
    j_gros_michel:       { extra: { mult: { value: 15, fixed: true }, odds: { value: 6, fixed: true } } },
    j_half:              { extra: { mult: { value: 20, fixed: true }, size: { value: 3, fixed: true } } },
    j_ice_cream:         { extra: { chips: { value: 100, fixed: false }, chip_mod: { value: -2, fixed: true } } },
    j_jolly:             { extra: { t_mult: { value: 8, fixed: true }, type: { value: 'Pair', fixed: true } } },
    j_loyalty:           { extra: { Xmult: { value: 2, fixed: true }, every: { value: 6, fixed: true } } },
    j_lusty:             { extra: { mult: { value: 3, fixed: true }, suit: { value: 'Hearts', fixed: true } } },
    j_merry_andy:        { extra: { d_size: { value: 2, fixed: true }, h_size: { value: 1, fixed: true } } },
    j_misprint:          { extra: { min: { value: 0, fixed: true }, max: { value: 23, fixed: true } } },
    j_mystic_summit:     { extra: { mult: { value: 5, fixed: true }, d_remaining: { value: 0, fixed: true } } },
    j_oops:              { extra: { odds: { value: 2, fixed: false } } },
    j_popcorn:           { extra: { mult: { value: 20, fixed: true }, extra: { value: -4, fixed: true } } },
    j_reserved_parking:  { extra: { dollars: { value: 2, fixed: true }, odds: { value: 6, fixed: true } } },
    j_rocket:            { extra: { dollars: { value: 2, fixed: true }, increase: { value: 2, fixed: true } } },
    j_runner:            { extra: { chips: { value: 0, fixed: false }, chip_mod: { value: 15, fixed: true } } },
    j_rusty_joker:       { extra: { mult: { value: 3, fixed: true }, suit: { value: 'Diamonds', fixed: true } } },
    j_scholar:           { extra: { mult: { value: 4, fixed: true }, chips: { value: 20, fixed: true } } },
    j_seance:            { extra: { poker_hand: { value: 'Straight Flush', fixed: true } } },
    j_sly:               { extra: { t_chips: { value: 50, fixed: true }, type: { value: 'Pair', fixed: true } } },
    j_square:            { extra: { chips: { value: 0, fixed: false }, chip_mod: { value: 4, fixed: true } } },
    j_stuntman:          { extra: { chip_mod: { value: 250, fixed: true }, h_size: { value: 2, fixed: true } } },
    j_todo:              { extra: { dollars: { value: 1, fixed: true }, poker_hand: { value: 'High Card', fixed: true } } },
    j_troubadour:        { extra: { h_size: { value: 2, fixed: true }, h_plays: { value: -1, fixed: true } } },
    j_turtle_bean:       { extra: { h_size: { value: 5, fixed: true }, h_mod: { value: -1, fixed: true } } },
    j_the_duo:           { extra: { Xmult: { value: 2, fixed: true }, type: { value: 'Pair', fixed: true } } },
    j_the_trio:          { extra: { Xmult: { value: 3, fixed: true }, type: { value: 'Three of a Kind', fixed: true } } },
    j_the_family:        { extra: { Xmult: { value: 4, fixed: true }, type: { value: 'Four of a Kind', fixed: true } } },
    j_the_order:         { extra: { Xmult: { value: 3, fixed: true }, type: { value: 'Straight', fixed: true } } },
    j_the_tribe:         { extra: { Xmult: { value: 2, fixed: true }, type: { value: 'Flush', fixed: true } } },
    j_walkie_talkie:     { extra: { chips: { value: 100, fixed: true }, mult: { value: 4, fixed: true } } },
    j_wee:               { extra: { chips: { value: 0, fixed: false }, chip_mod: { value: 8, fixed: true } } },
    j_wily:              { extra: { t_chips: { value: 60, fixed: true }, type: { value: 'Three of a Kind', fixed: true } } },
    j_wrathful:          { extra: { mult: { value: 3, fixed: true }, suit: { value: 'Spades', fixed: true } } },
    j_yorick:            { extra: { xmult: { value: 2, fixed: true }, discards: { value: 23, fixed: true } } }
};

function getJokerTemplate(jokerId) {
    const tpl = _jokerTemplates[jokerId];
    if (tpl == null) return undefined;
    const result = {};
    for (const [k, v] of Object.entries(tpl)) {
        if (k === 'extra' && typeof v === 'object' && !('value' in v)) {
            // extra is an object with sub-keys (Type B)
            const sub = {};
            for (const [sk, sv] of Object.entries(v)) {
                if (sv != null && typeof sv === 'object' && 'value' in sv) {
                    sub[sk] = sv.value;
                } else {
                    sub[sk] = sv;
                }
            }
            result[k] = sub;
        } else if (v != null && typeof v === 'object' && 'value' in v) {
            result[k] = v.value;
        } else {
            result[k] = v;
        }
    }
    return result;
}

function getJokerExtraFields(jokerId) {
    const tpl = _jokerTemplates[jokerId];
    if (!tpl) return null;
    const fields = [];
    const labels = {
        min: 'Min Mult', max: 'Max Mult', mult: 'Mult', chips: 'Chips',
        chip_mod: 'Chip Scaling', Xmult: 'X Mult', xmult: 'X Mult',
        odds: 'Odds (1 in)', h_size: 'Hand Size', h_plays: 'Hand Plays',
        d_size: 'Discard Size', size: 'Max Hand Size', bonus: 'Bonus',
        every: 'Every N Hands', dollars: 'Money', increase: '$ Increase',
        suit: 'Suit', type: 'Hand Type', poker_hand: 'Poker Hand',
        faces: 'Face Cards', h_mod: 'Hand Mod', discards: 'Discards Needed',
        extra: 'Value'
    };
    const pushField = (k, v) => {
        let val, editable, fieldType;
        if (v != null && typeof v === 'object' && 'value' in v) {
            val = v.value;
            editable = v.fixed === false;
            fieldType = typeof val === 'number' ? 'number' : 'text';
        } else if (typeof v === 'number') {
            val = v;
            editable = false;
            fieldType = 'number';
        } else if (typeof v === 'boolean') {
            val = v;
            editable = false;
            fieldType = 'text';
        } else {
            val = v;
            editable = false;
            fieldType = 'text';
        }
        if (k === 'suit') fieldType = 'select';
        if (k === 'type' || k === 'poker_hand') fieldType = 'select';
        fields.push({
            key: k, label: labels[k] || k, value: val, editable,
            type: fieldType,
            options: k === 'suit' ? ['Hearts','Diamonds','Clubs','Spades'] :
                     k === 'type' ? ['High Card','Pair','Two Pair','Three of a Kind','Straight','Flush','Full House','Four of a Kind','Five of a Kind','Flush House','Straight Flush','Flush Five'] :
                     k === 'poker_hand' ? ['High Card','Pair','Two Pair','Three of a Kind','Straight','Flush','Full House','Four of a Kind','Five of a Kind','Flush House','Straight Flush','Flush Five'] : null
        });
    };
    for (const [k, v] of Object.entries(tpl)) {
        if (k === 'fixed') continue;
        if (k === 'extra' && typeof v === 'object' && !('value' in v)) {
            // extra is an object with sub-keys (Type B) — iterate sub-keys
            for (const [sk, sv] of Object.entries(v)) {
                if (sk === 'fixed') continue;
                pushField(sk, sv);
            }
        } else {
            pushField(k, v);
        }
    }
    return fields;
}

function normalizeJokerExtra(card) {
    const jokerId = card.save_fields?.center;
    if (!jokerId || !card.ability) return;
    const tpl = _jokerTemplates[jokerId];
    if (!tpl || !('extra' in tpl)) return;
    const te = tpl.extra;
    if (typeof te !== 'object' || te === null || 'value' in te) return;
    if (typeof card.ability.extra !== 'object' || card.ability.extra == null) {
        card.ability.extra = {};
    }
    for (const [sk, sv] of Object.entries(te)) {
        if (sk === 'fixed') continue;
        if (card.ability.extra[sk] === undefined) {
            if (sv != null && typeof sv === 'object' && 'value' in sv) {
                card.ability.extra[sk] = typeof sv.value === 'number' ? sv.value : (sv.value || '');
            }
        }
    }
}

function updateCardSprite(card) {
    if (!card || !card.base) return;
    const s = card.base.suit || 'Hearts';
    const v = card.base.value || '2';
    card.save_fields.card = (_suitData[s]?.initial || 'H') + '_' + (_valueAbbrev[v] || v);
}

function getCurrentEdition(card) {
    if (!card || !card.edition || !card.edition.type) return null;
    const t = card.edition.type;
    for (const ed of _editionTypes) {
        if (ed === 'e_' + t) return ed;
    }
    return null;
}

function setEdition(card, edition) {
    if (!card) return;
    if (!edition) {
        delete card.edition;
        return;
    }
    const config = _editionConfig[edition];
    if (!config) return;
    card.edition = { ...config };
}

function getCurrentEnhancement(card) {
    if (!card) return null;
    const center = card.save_fields?.center;
    if (center && _enhancementTypes.includes(center)) return center;
    return null;
}

function setEnhancement(card, enhancement) {
    if (!card) return;
    card.save_fields = card.save_fields || {};
    card.ability = card.ability || {};

    if (enhancement && _enhancementInfo[enhancement]) {
        const info = _enhancementInfo[enhancement];
        card.save_fields.center = enhancement;
        card.label = info.label;
        card.ability.set = 'Enhanced';
        card.ability.effect = info.effect;
        card.ability.name = info.name;
        card.ability.bonus = 0;
        card.ability.mult = 0;
        if (info.abilityValues) {
            for (const [k, v] of Object.entries(info.abilityValues)) {
                card.ability[k] = v;
            }
        }
        delete card.ability.extra;
    } else {
        card.save_fields.center = 'c_base';
        card.label = 'Base Card';
        card.ability.set = 'Default';
        card.ability.effect = 'Base';
        card.ability.name = 'Default Base';
        card.ability.bonus = 0;
        card.ability.mult = 0;
        card.ability.h_dollars = 0;
        card.ability.p_dollars = 0;
        delete card.ability.extra;
    }
}

function getCurrentSeal(card) {
    if (!card) return null;
    if (card.seal && _sealTypes.includes(card.seal)) return card.seal;
    return null;
}

function setSeal(card, seal) {
    if (!card) return;
    if (seal) card.seal = seal;
    else delete card.seal;
}

function renderSaveEditor() {
    const container = document.getElementById('content-container');
    if (!saveData) {
        container.innerHTML = `
            <div class="save-empty">
                <div class="empty-icon"><i class="fa-solid fa-pen-to-square"></i></div>
                <h2>${__('save.no_save')}</h2>
                <p>${__('save.no_save_desc')}</p>
                <div style="background: var(--bg-secondary); padding: 16px; border-radius: 8px; margin: 20px auto; max-width: 500px; border: 1px solid var(--border);">
                    <p style="font-size: 12px; color: var(--text-secondary); margin-bottom: 6px;">
                        <i class="fa-solid fa-circle-info"></i> ${__('footer.save_legend')}
                    </p>
                    <p style="font-size: 12px; color: var(--text-secondary); margin-bottom: 12px;">
                        <i class="fa-solid fa-folder-open"></i> <strong>${__('footer.file_location')}</strong><br>
                        ${__('footer.save_windows_path')}<br>
                        ${__('footer.save_mac_path')}<br>
                        ${__('footer.save_linux_path')}
                    </p>
                </div>
                <div style="display:flex; gap:12px; flex-wrap:wrap; justify-content:center;">
                    <label for="import-save-jkr" class="control-btn primary" style="cursor: pointer; font-size:13px;">
                        <i class="fa-solid fa-upload"></i> ${__('btn.import_save')}
                        <input type="file" id="import-save-jkr" accept=".jkr" style="display: none;">
                    </label>
                </div>
            </div>
        `;
        const input = document.getElementById('import-save-jkr');
        if (input) input.addEventListener('change', e => {
            const file = e.target.files[0];
            if (file) importSaveJkr(file);
        });
        return;
    }

    container.innerHTML = `
        <div class="save-container">
            <div class="save-header">
                <h2><i class="fa-solid fa-pen-to-square"></i> ${__('save.editor_title')}</h2>
                <div class="save-controls">
                    <button id="save-export-btn" class="control-btn primary" style="font-size:13px;">
                        <i class="fa-solid fa-floppy-disk"></i> ${__('btn.save_export')}
                    </button>
                </div>
            </div>
            <div class="save-tabs" id="save-tabs">
                <button class="save-tab active" data-tab="game"><i class="fa-solid fa-sliders"></i> ${__('save.tab.game')}</button>
                <button class="save-tab" data-tab="jokers"><i class="fa-solid fa-theater-masks"></i> ${__('save.tab.jokers')}</button>
                <button class="save-tab" data-tab="deck"><i class="fa-solid fa-layer-group"></i> ${__('save.tab.deck')}</button>
                <button class="save-tab" data-tab="vouchers"><i class="fa-solid fa-ticket"></i> ${__('save.tab.vouchers')}</button>
                <button class="save-tab" data-tab="planets"><i class="fa-solid fa-globe"></i> ${__('save.tab.planets')}</button>
                <button class="save-tab" data-tab="consumables"><i class="fa-solid fa-flask"></i> ${__('save.tab.consumables')}</button>
            </div>
            <div id="save-tab-contents">
                <div class="save-tab-content active" data-content="game">${renderGameTab()}</div>
                <div class="save-tab-content" data-content="jokers">${renderJokersTab()}</div>
                <div class="save-tab-content" data-content="deck">${renderDeckTab()}</div>
                <div class="save-tab-content" data-content="vouchers">${renderVouchersTab()}</div>
                <div class="save-tab-content" data-content="planets">${renderPlanetsTab()}</div>
                <div class="save-tab-content" data-content="consumables">${renderConsumablesTab()}</div>
            </div>
        </div>
    `;
    attachSaveEventListeners();
    switchSaveTab(_activeSaveTab);
    loadImagesInContainer(container);
}

function switchSaveTab(tab) {
    _activeSaveTab = tab;
    document.querySelectorAll('.save-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.save-tab-content').forEach(t => t.classList.remove('active'));
    document.querySelector(`.save-tab[data-tab="${tab}"]`)?.classList.add('active');
    document.querySelector(`.save-tab-content[data-content="${tab}"]`)?.classList.add('active');
}

// ─── GAME TAB ────────────────────────────────────────────────────
function renderGameTab() {
    if (!saveData) return '';
    const currentLang = localStorage.getItem('balatro-editor-lang') || 'en';
    const currentDeck = saveData.BACK?.key || 'b_red';
    const currentStake = saveData.BACK?.stake ?? 0;
    const decks = getAllDeckIds();
    const fields = [
        { key: 'dollars', label: __('save.stat.money'), icon: 'fa-sack-dollar', path: 'GAME.dollars', type: 'number' },
        { key: 'max_jokers', label: __('save.stat.joker_slots'), icon: 'fa-theater-masks', path: 'GAME.max_jokers', type: 'number' },
        { key: 'hands_left', label: __('save.stat.hands'), icon: 'fa-hand', path: 'GAME.current_round.hands_left', type: 'number' },
        { key: 'discards_left', label: __('save.stat.discards'), icon: 'fa-trash', path: 'GAME.current_round.discards_left', type: 'number' },
        { key: 'hand_size', label: __('save.stat.hand_size'), icon: 'fa-arrows-alt-h', path: 'GAME.starting_params.hand_size', type: 'number' },
        { key: 'consumable_slots', label: __('save.stat.consume_slots'), icon: 'fa-flask', path: 'GAME.starting_params.consumable_slots', type: 'number' },
        { key: 'round', label: __('save.stat.round'), icon: 'fa-rotate', path: 'GAME.round', type: 'number' },
        { key: 'ante', label: __('save.stat.ante'), icon: 'fa-meteor', path: 'GAME.round_resets.ante', type: 'number' },
        { key: 'reroll_cost', label: __('save.stat.reroll_cost'), icon: 'fa-arrows-rotate', path: 'GAME.current_round.reroll_cost', type: 'number' },
        { key: 'discount_percent', label: __('save.stat.discount'), icon: 'fa-percent', path: 'GAME.discount_percent', type: 'number' },
    ];
    return `
        <div class="save-section">
            <h3><i class="fa-solid fa-sliders"></i> ${__('save.tab.game')}</h3>
            <div class="game-deck-section">
                <div class="game-stat-card">
                    <div class="game-stat-label"><i class="fa-solid fa-layer-group"></i> ${__('Deck')}</div>
                    <select class="game-deck-select" data-field="deck">
                        ${decks.map(d => `<option value="${d}" ${d === currentDeck ? 'selected' : ''}>${DECK_NAMES[d] || formatName(d)}</option>`).join('')}
                    </select>
                </div>
                <div class="game-stat-card">
                    <div class="game-stat-label"><i class="fa-solid fa-trophy"></i> ${__('Stake')}</div>
                    <select class="game-stake-select" data-field="stake">
                        ${STAKES.map(s => `<option value="${s.id}" ${s.id === currentStake ? 'selected' : ''}>${currentLang === 'es' ? s.labelEs : s.label}</option>`).join('')}
                    </select>
                </div>
            </div>
            <div class="game-stats-grid">
                ${fields.map(f => {
                    const val = getProperty(saveData, f.path) ?? 0;
                    return `
                        <div class="game-stat-card">
                            <div class="game-stat-label"><i class="fa-solid ${f.icon}"></i> ${f.label}</div>
                            <input type="number" class="game-stat-input" data-path="${f.path}" value="${val}" min="0">
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
}

// ─── JOKERS TAB ──────────────────────────────────────────────────
function renderJokersTab() {
    if (!saveData) return '';
    const jokerCards = getCardsInArea('jokers');
    const allJokers = getAllJokerIds();

    let html = `
        <div class="save-section">
            <h3><i class="fa-solid fa-theater-masks"></i> ${__('save.tab.jokers')} (${jokerCards.length})</h3>
            <div class="joker-list">
    `;

    jokerCards.forEach(({ key, card, index }) => {
        const currentId = card.save_fields?.center || '';
        const ability = card.ability || {};
        normalizeJokerExtra(card);
        const currentEdition = getCurrentEdition(card);
        const eternal = ability.eternal === true;
        const perishable = ability.perishable === true;
        const rental = ability.rental === true;

        let extraFieldsHtml = '';
        const extraFields = getJokerExtraFields(currentId);
        if (extraFields && extraFields.length > 0) {
            const rawExtra = ability.extra;
            const extraObj = (rawExtra != null && typeof rawExtra === 'object') ? rawExtra : {};
            extraFieldsHtml = `<div class="joker-extra-fields" data-key="${key}">`;
            extraFieldsHtml += `<span class="joker-extra-label"><i class="fa-solid fa-sliders"></i> Stats</span>`;
            extraFieldsHtml += `<div class="joker-extra-grid">`;
            for (const f of extraFields) {
                let val;
                if (f.key === 'extra' && typeof rawExtra === 'number') {
                    val = rawExtra;
                } else if (f.key === 'extra' && typeof rawExtra === 'string') {
                    val = rawExtra;
                } else {
                    val = extraObj[f.key] != null ? extraObj[f.key] : ability[f.key];
                }
                if (val == null) val = f.value;
                const inputId = `extra-${key.replace(/[^\w]/g, '')}-${f.key}`;
                if (!f.editable) {
                    extraFieldsHtml += `
                        <div class="joker-extra-row readonly">
                            <label for="${inputId}">${f.label}</label>
                            <span class="joker-extra-readonly" title="Fixed game value">${val}</span>
                        </div>`;
                } else if (f.type === 'select') {
                    extraFieldsHtml += `
                        <div class="joker-extra-row">
                            <label for="${inputId}">${f.label}</label>
                            <select class="joker-extra-input" data-key="${key}" data-extra-field="${f.key}">
                                ${f.options.map(o => `<option value="${o}" ${o === val ? 'selected' : ''}>${o}</option>`).join('')}
                            </select>
                        </div>`;
                } else {
                    extraFieldsHtml += `
                        <div class="joker-extra-row">
                            <label for="${inputId}">${f.label}</label>
                            <input id="${inputId}" type="${f.type}" class="joker-extra-input" data-key="${key}" data-extra-field="${f.key}" value="${val}" step="${f.type === 'number' ? 'any' : ''}">
                        </div>`;
                }
            }
            extraFieldsHtml += `</div></div>`;
        }

        html += `
            <div class="joker-item" data-key="${key}">
                <div class="joker-header">
                    <img class="joker-sprite" data-src="1" data-id="${currentId}" data-category="jokers" src="${PLACEHOLDER_SVG}" alt="${formatName(currentId)}" loading="lazy">
                    <div class="joker-header-info">
                        <span class="joker-id">#${index}</span>
                        <select class="joker-select" data-key="${key}" data-field="id">
                            ${allJokers.map(jid => `
                                <option value="${jid}" ${jid === currentId ? 'selected' : ''}>${formatName(jid)}</option>
                            `).join('')}
                        </select>
                        <div class="joker-abilities">
                            ${_editionTypes.map(ed => `
                                <button class="ability-btn ${ed === currentEdition ? 'active' : ''}" data-key="${key}" data-edition="${ed}">${formatName(ed)}</button>
                            `).join('')}
                        </div>
                        <div class="joker-stickers">
                            <label class="ability-check ${eternal ? 'danger' : ''}">
                                <input type="checkbox" data-key="${key}" data-flag="eternal" ${eternal ? 'checked' : ''}> Eternal
                            </label>
                            <label class="ability-check">
                                <input type="checkbox" data-key="${key}" data-flag="perishable" ${perishable ? 'checked' : ''}> Perishable
                            </label>
                            <label class="ability-check">
                                <input type="checkbox" data-key="${key}" data-flag="rental" ${rental ? 'checked' : ''}> Rental
                            </label>
                        </div>
                    </div>
                </div>
                ${extraFieldsHtml}
                <button class="remove-btn" data-key="${key}" data-area="jokers"><i class="fa-solid fa-trash"></i></button>
            </div>
        `;
    });

    html += `
            </div>
            <button class="add-btn" id="add-joker-btn" style="margin-top:12px;">
                <i class="fa-solid fa-list"></i> ${__('save.add_joker')}
            </button>
        </div>
    `;
    return html;
}

// ─── DECK TAB ────────────────────────────────────────────────────
function renderDeckTab() {
    if (!saveData) return '';
    const deckCards = getCardsInArea('deck');

    const suitMeta = {
        'Hearts':   { icon: '\u2665', color: '#ff4757' },
        'Diamonds': { icon: '\u2666', color: '#ffa502' },
        'Clubs':    { icon: '\u2663', color: '#2ed573' },
        'Spades':   { icon: '\u2660', color: '#3742fa' }
    };

    const suitSections = { 'Hearts': [], 'Diamonds': [], 'Clubs': [], 'Spades': [], _new: [] };
    deckCards.forEach(entry => {
        if (entry.card._newCard) {
            suitSections._new.push(entry);
        } else {
            const suit = entry.card.base?.suit || 'Hearts';
            if (suitSections[suit]) suitSections[suit].push(entry);
            else suitSections._new.push(entry);
        }
    });

    let bulkAction = '<div class="bulk-bar hidden" id="deck-bulk-bar">';
    bulkAction += `
            <span class="bulk-label"><i class="fa-solid fa-check-square"></i> <span id="deck-bulk-count">0</span> selected</span>
            <div class="bulk-sep"></div>
            <select id="bulk-suit"><option value="">Suit...</option>${_suits.map(s => `<option value="${s}">${s}</option>`).join('')}</select>
            <select id="bulk-value"><option value="">Value...</option>${_values.map(v => `<option value="${v}">${v}</option>`).join('')}</select>
            <select id="bulk-enhance"><option value="">Enhance...</option>${_enhancementTypes.map(e => `<option value="${e}">${formatName(e).replace('m_','')}</option>`).join('')}<option value="__none__">(none)</option></select>
            <select id="bulk-seal"><option value="">Seal...</option>${_sealTypes.map(s => `<option value="${s}">${s}</option>`).join('')}<option value="__none__">(none)</option></select>
            <button class="bulk-apply" id="bulk-apply-btn">Apply</button>
            <div class="bulk-sep"></div>
            <button class="bulk-remove" id="bulk-remove-btn"><i class="fa-solid fa-trash"></i> Remove</button>
    `;
    bulkAction += '</div>';

    let html = `
        <div class="save-section">
            <h3><i class="fa-solid fa-layer-group"></i> ${__('save.tab.deck')} (${deckCards.length})</h3>
            <div style="margin-bottom:8px;">
                <label style="cursor:pointer;font-family:var(--font-terminal);font-size:12px;color:var(--text-dim);display:flex;align-items:center;gap:6px;">
                    <input type="checkbox" id="deck-select-all" style="accent-color:var(--gold);">
                    Select All
                </label>
            </div>
            ${bulkAction}
    `;

    function renderDeckCardBlock({ key, card, index }) {
        const base = card.base || {};
        const ability = card.ability || {};
        const isNew = card._newCard;
        const currentSuit = base.suit || '';
        const currentValue = base.value == null ? '' : String(base.value);
        const currentEnhancement = getCurrentEnhancement(card);
        const currentSeal = getCurrentSeal(card);
        const sm = suitMeta[currentSuit];
        const sColor = sm?.color || '#ff6b35';
        const sIcon = sm?.icon || '';

        return `
            <div class="deck-card-item ${isNew ? 'new-card' : ''}" data-key="${key}" style="--suit-color:${sColor}">
                <label class="deck-card-check">
                    <input type="checkbox" class="deck-card-cb" data-key="${key}" data-area="deck">
                </label>
                <span class="deck-card-label" style="color:${sColor}">
                    ${isNew ? `<i class="fa-solid fa-star"></i> ${__('save.deck.new_card')}` : `${sIcon} ${currentValue}`}
                </span>
                <select class="deck-suit-select" data-key="${key}" data-field="suit">
                    ${isNew ? '<option value="">-</option>' : ''}
                    ${_suits.map(s => `<option value="${s}" ${s === currentSuit ? 'selected' : ''}>${suitMeta[s].icon}</option>`).join('')}
                </select>
                <select class="deck-value-select" data-key="${key}" data-field="value">
                    ${isNew ? '<option value="">-</option>' : ''}
                    ${_values.map(v => `<option value="${v}" ${v === currentValue ? 'selected' : ''}>${v}</option>`).join('')}
                </select>
                <select class="deck-enhance-select" data-key="${key}" data-field="enhancement">
                    <option value="">-</option>
                    ${_enhancementTypes.map(e => `<option value="${e}" ${e === currentEnhancement ? 'selected' : ''}>${formatName(e).replace('m_','')}</option>`).join('')}
                </select>
                <select class="deck-seal-select" data-key="${key}" data-field="seal">
                    <option value="">-</option>
                    ${_sealTypes.map(s => `<option value="${s}" ${s === currentSeal ? 'selected' : ''}>${s}</option>`).join('')}
                </select>
                ${currentEnhancement === 'm_lucky' ? `<span class="lucky-odds">${_hasOopsJoker() ? '2/15' : '1/15'} <i class="fa-solid fa-xmark"></i>20 · ${_hasOopsJoker() ? '2/5' : '1/5'} <i class="fa-solid fa-dollar-sign"></i>20</span>` : ''}
                <button class="remove-btn" data-key="${key}" data-area="deck"><i class="fa-solid fa-trash"></i></button>
            </div>
        `;
    }

    // New cards section
    _suits.forEach(suit => {
        const meta = suitMeta[suit];
        const cards = suitSections[suit];
        if (cards.length === 0) return;

        html += `
            <div class="deck-suit-section">
                <h4 class="deck-suit-header" style="color:${meta.color};">
                    <label style="display:flex;align-items:center;gap:6px;cursor:pointer;">
                        <input type="checkbox" class="suit-select-all" data-suit="${suit}" style="accent-color:var(--gold);">
                        <span class="deck-suit-icon">${meta.icon}</span>
                    </label>
                    ${suit}
                    <span class="deck-suit-count">(${cards.length})</span>
                </h4>
                <div class="deck-grid">
                    ${cards.map(renderDeckCardBlock).join('')}
                </div>
            </div>
        `;
    });

    if (suitSections._new.length > 0) {
        html += `
            <div class="deck-suit-section">
                <h4 class="deck-suit-header" style="color:#ff6b35;">
                    <label style="display:flex;align-items:center;gap:6px;cursor:pointer;">
                        <input type="checkbox" class="suit-select-all" data-suit="_new" style="accent-color:var(--gold);">
                        <i class="fa-solid fa-star"></i>
                    </label>
                    ${__('save.deck.new_cards')}
                    <span class="deck-suit-count">(${suitSections._new.length})</span>
                </h4>
                <div class="deck-grid">
                    ${suitSections._new.map(renderDeckCardBlock).join('')}
                </div>
            </div>
        `;
    }

    html += `
            <button class="add-btn" id="add-deck-btn" style="margin-top:12px;">
                <i class="fa-solid fa-plus"></i> ${__('save.add_card')}
            </button>
        </div>
    `;
    return html;
}

// ─── VOUCHERS TAB ────────────────────────────────────────────────
function renderVouchersTab() {
    if (!saveData) return '';
    const usedVouchers = saveData.GAME.used_vouchers || {};
    const voucherList = Object.keys(usedVouchers).filter(k => k.startsWith('v_')).sort();
    const allVouchers = getAllVoucherIds();

    let html = `
        <div class="save-section">
            <h3><i class="fa-solid fa-ticket"></i> ${__('save.tab.vouchers')} (${voucherList.length})</h3>
            <div class="voucher-list">
    `;

    voucherList.forEach(vid => {
        html += `
            <div class="voucher-item" data-vid="${vid}">
                <span class="voucher-id">${formatName(vid)}</span>
                <span style="color: var(--text-dim); font-family: var(--font-terminal); font-size:12px;">${vid}</span>
                <button class="remove-btn" data-vid="${vid}"><i class="fa-solid fa-trash"></i></button>
            </div>
        `;
    });

    html += `
            </div>
            <div style="display:flex; gap:8px; margin-top:12px;">
                <select id="add-voucher-select" style="flex:1; padding:8px 12px; background: var(--bg-tertiary); border:2px solid var(--bg-panel); border-radius:10px; color: var(--text-light); font-family: var(--font-terminal); font-size:14px;">
                    <option value="">${__('save.select_voucher')}</option>
                    ${allVouchers.map(v => `<option value="${v}">${formatName(v)}</option>`).join('')}
                </select>
                <button class="add-btn" id="add-voucher-btn" style="width:auto; padding:8px 18px;">
                    <i class="fa-solid fa-plus"></i> ${__('save.add')}
                </button>
            </div>
        </div>
    `;
    return html;
}

// ─── PLANETS TAB ─────────────────────────────────────────────────
function renderPlanetsTab() {
    if (!saveData) return '';
    const hands = saveData.GAME?.hands || {};

    const handOrder = [
        'High Card', 'Pair', 'Two Pair', 'Three of a Kind', 'Straight',
        'Flush', 'Full House', 'Four of a Kind', 'Five of a Kind',
        'Flush House', 'Straight Flush', 'Flush Five'
    ];

    let html = `
        <div class="save-section">
            <h3><i class="fa-solid fa-globe"></i> ${__('save.tab.planets')}</h3>
            <div class="planets-grid">
    `;

    handOrder.forEach(handName => {
        const handData = hands[handName];
        if (!handData) return;
        const level = handData.level || 1;

        const chips = handData.chips || handData.s_chips || 0;
        const mult = handData.mult || handData.s_mult || 0;
        html += `
            <div class="planet-level-row">
                <span class="hand-name">${handName}</span>
                <span class="hand-level">${__('save.planet.level')} ${level}</span>
                <span class="hand-stat">${chips} <i class="fa-solid fa-circle" style="color:var(--gold);font-size:8px;vertical-align:middle;"></i> ${mult}</span>
                <input type="number" data-hand="${handName}" value="${level}" min="1" max="99">
            </div>
        `;
    });

    html += `
            </div>
        </div>
    `;
    return html;
}

// ─── CONSUMABLES TAB ─────────────────────────────────────────────
function renderConsumablesTab() {
    if (!saveData) return '';
    const consumableCards = getCardsInArea('consumeables');

    const allConsumables = Object.keys(metaData?.unlocked || {})
        .filter(k => k.startsWith('c_'))
        .sort();

    let html = `
        <div class="save-section">
            <h3><i class="fa-solid fa-flask"></i> ${__('save.tab.consumables')} (${consumableCards.length})</h3>
            <div class="consumable-list">
    `;

    consumableCards.forEach(({ key, card, index }) => {
        const currentId = card.save_fields?.center || '';
        html += `
            <div class="consumable-item" data-key="${key}">
                <span class="joker-id">#${index}</span>
                <select class="consumable-select" data-key="${key}" data-field="id">
                    ${allConsumables.map(cid => `
                        <option value="${cid}" ${cid === currentId ? 'selected' : ''}>${formatName(cid)}</option>
                    `).join('')}
                </select>
                <button class="remove-btn" data-key="${key}" data-area="consumeables"><i class="fa-solid fa-trash"></i></button>
            </div>
        `;
    });

    html += `
            </div>
            <button class="add-btn" id="add-consumable-btn" style="margin-top:12px;">
                <i class="fa-solid fa-plus"></i> ${__('save.add_consumable')}
            </button>
        </div>
    `;
    return html;
}

// ─── EVENT LISTENERS ─────────────────────────────────────────────
let _saveListenersAttached = false;

function attachSaveEventListeners() {
    // Tab switching
    document.querySelectorAll('.save-tab').forEach(tab => {
        tab.addEventListener('click', () => switchSaveTab(tab.dataset.tab));
    });

    // Game stat inputs
    document.querySelectorAll('.game-stat-input').forEach(input => {
        input.addEventListener('change', () => {
            const path = input.dataset.path;
            const val = parseInt(input.value) || 0;
            setProperty(saveData, path, val);
            showNotification(__('save.notif.updated'), 'success');
        });
    });

    // Deck select
    document.querySelectorAll('.game-deck-select').forEach(select => {
        select.addEventListener('change', () => {
            const deckKey = select.value;
            const allDecks = getAllDeckIds();
            const deckIdx = allDecks.indexOf(deckKey);
            const pos = getDeckPosition(deckIdx >= 0 ? deckIdx : 0, allDecks.length);
            const deckObj = {
                set: 'Back', key: deckKey, name: DECK_NAMES[deckKey] || formatName(deckKey),
                stake: saveData.BACK?.stake ?? 0, order: deckIdx + 1, unlocked: true, discovered: true, pos
            };
            saveData.BACK = deckObj;
            saveData.GAME.selected_back_key = deckObj;
            renderSaveEditor();
            showNotification(__('save.notif.updated'), 'success');
        });
    });

    // Stake select
    document.querySelectorAll('.game-stake-select').forEach(select => {
        select.addEventListener('change', () => {
            const stake = parseInt(select.value);
            if (saveData.BACK) saveData.BACK.stake = stake;
            if (saveData.GAME?.selected_back_key) saveData.GAME.selected_back_key.stake = stake;
            showNotification(__('save.notif.updated'), 'success');
        });
    });

    // Joker ID select
    document.querySelectorAll('.joker-item .joker-select[data-field="id"]').forEach(select => {
        select.addEventListener('change', () => {
            const key = select.dataset.key;
            const card = saveData.cardAreas.jokers.cards[key];
            if (card) {
                card.save_fields.center = select.value;
                card.label = getJokerName(select.value);
                if (card.ability) {
                    card.ability.name = getJokerName(select.value);
                    const tpl = getJokerTemplate(select.value);
                    if (tpl) {
                        for (const [k, v] of Object.entries(tpl)) {
                            if (k === 'extra') {
                                if (typeof v !== 'object') {
                                    card.ability.extra = v;         // primitive (Type A)
                                } else {
                                    card.ability.extra = { ...v };  // object (Type B)
                                }
                            } else {
                                card.ability[k] = v;                // ability-level (Type D)
                            }
                        }
                    } else {
                        card.ability.extra = {};
                    }
                    delete card.ability.effect;
                    card.ability.bonus = 0;
                    card.ability.mult = 0;
                    card.ability.hands_played_at_create = 0;
                }
                renderSaveEditor();
            }
        });
    });

    // Consumable ID select
    document.querySelectorAll('.consumable-item .consumable-select[data-field="id"]').forEach(select => {
        select.addEventListener('change', () => {
            const key = select.dataset.key;
            const card = saveData.cardAreas.consumeables.cards[key];
            if (!card) return;
            card.save_fields.center = select.value;
            card.label = getJokerName(select.value);
            if (card.ability) {
                card.ability.name = getJokerName(select.value);
                const safeSet = getConsumableSet(select.value);
                if (safeSet) card.ability.set = safeSet;
                if (!card.ability.consumeable) card.ability.consumeable = {};
                card.ability.extra = {};
                card.ability.hands_played_at_create = 0;
                card.ability.mult = 0;
                card.ability.bonus = 0;
            }
        });
    });

    // Joker edition buttons
    document.querySelectorAll('.ability-btn[data-edition]').forEach(btn => {
        btn.addEventListener('click', () => {
            const key = btn.dataset.key;
            const edition = btn.dataset.edition;
            const card = saveData.cardAreas.jokers.cards[key];
            if (!card) return;
            const siblings = btn.closest('.joker-abilities').querySelectorAll('.ability-btn[data-edition]');
            siblings.forEach(s => s.classList.remove('active'));
            if (getCurrentEdition(card) === edition) {
                setEdition(card, null);
            } else {
                btn.classList.add('active');
                setEdition(card, edition);
            }
        });
    });

    // Joker flags (eternal/perishable/rental)
    document.querySelectorAll('.ability-check input[type="checkbox"]').forEach(cb => {
        cb.addEventListener('change', () => {
            const key = cb.dataset.key;
            const flag = cb.dataset.flag;
            const card = saveData.cardAreas.jokers.cards[key];
            if (!card || !card.ability) return;
            card.ability[flag] = cb.checked;
            const label = cb.closest('.ability-check');
            if (label) label.classList.toggle('danger', flag === 'eternal' && cb.checked);
        });
    });

    // Joker extra fields
    document.querySelectorAll('.joker-extra-input').forEach(input => {
        input.addEventListener('change', () => {
            const key = input.dataset.key;
            const field = input.dataset.extraField;
            const card = saveData.cardAreas.jokers.cards[key];
            if (!card || !card.ability) return;
            const isNum = input.type === 'number';
            const val = isNum ? (parseFloat(input.value) || 0) : input.value;
            if (field === 'extra' && (card.ability.extra == null || typeof card.ability.extra !== 'object')) {
                card.ability.extra = val;
            } else if (card.ability.extra && typeof card.ability.extra === 'object') {
                card.ability.extra[field] = val;
            } else {
                card.ability[field] = val;
            }
            normalizeJokerExtra(card);
            showNotification(__('save.notif.updated'), 'success');
        });
    });

    // Remove joker/consumable/deck card with re-index
    document.querySelectorAll('.remove-btn[data-area]').forEach(btn => {
        btn.addEventListener('click', () => {
            const key = btn.dataset.key;
            const area = btn.dataset.area;
            const cards = saveData.cardAreas[area]?.cards;
            if (cards) {
                delete cards[key];
                // Re-index remaining cards to avoid gaps
                const entries = Object.keys(cards)
                    .filter(k => k.startsWith('\t\f'))
                    .sort((a, b) => parseInt(a.substring(2)) - parseInt(b.substring(2)))
                    .map(k => cards[k]);
                const newCards = {};
                entries.forEach((card, i) => {
                    newCards[encodeNumKey(String(i + 1))] = card;
                    if (card.rank != null) card.rank = i + 1;
                });
                saveData.cardAreas[area].cards = newCards;
            }
            renderSaveEditor();
            showNotification(__('save.notif.removed'), 'info');
        });
    });

    // Remove voucher
    document.querySelectorAll('.voucher-item .remove-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const vid = btn.dataset.vid;
            if (saveData.GAME.used_vouchers) {
                delete saveData.GAME.used_vouchers[vid];
                renderSaveEditor();
                showNotification(__('save.notif.removed'), 'info');
            }
        });
    });

    // Add joker — opens bulk add modal
    const addJokerBtn = document.getElementById('add-joker-btn');
    if (addJokerBtn) {
        addJokerBtn.addEventListener('click', showJokerAddModal);
    }

    // Add deck card
    const addDeckBtn = document.getElementById('add-deck-btn');
    if (addDeckBtn) {
        addDeckBtn.addEventListener('click', () => {
            const nextIdx = getNextCardIndex('deck');
            if (!saveData.cardAreas.deck.cards) saveData.cardAreas.deck.cards = {};
            Object.assign(saveData.cardAreas.deck.cards, createDefaultDeckCard(nextIdx));
            renderSaveEditor();
            showNotification(__('save.notif.card_added'), 'success');
        });
    }

    // Deck card edits
    document.querySelectorAll('.deck-card-item select').forEach(select => {
        select.addEventListener('change', () => {
            const key = select.dataset.key;
            const field = select.dataset.field;
            const card = saveData.cardAreas.deck.cards[key];
            if (!card) return;
            const val = select.value;

            const curSuit = card.base.suit || 'Hearts';
            const curVal = card.base.value || '2';

            if (field === 'suit') {
                if (!val) return;
                card.base.suit = val;
                card.base.name = `${curVal} of ${val}`;
                const sd = _suitData[val];
                if (sd) {
                    card.base.suit_nominal = sd.nominal;
                    card.base.suit_nominal_original = sd.original;
                    card.base.colour = { ...sd.colour };
                }
                updateCardSprite(card);
                if (card.base.value) {
                    delete card._newCard;
                    renderSaveEditor();
                }
            } else if (field === 'value') {
                if (!val) return;
                card.base.value = val;
                card.base.original_value = val;
                const nom = _valueMap[val] || 0;
                card.base.nominal = nom;
                card.base.id = nom;
                card.base.name = `${val} of ${curSuit}`;
                card.base.face_nominal = val === 'Jack' ? 0.1 : val === 'Queen' ? 0.2 : val === 'King' ? 0.3 : 0;
                updateCardSprite(card);
                if (card.base.suit) {
                    delete card._newCard;
                    renderSaveEditor();
                }
            } else if (field === 'enhancement') {
                setEnhancement(card, val || null);
            } else if (field === 'seal') {
                setSeal(card, val || null);
            }
        });
    });

    // Deck bulk — global select all
    const deckSelectAll = document.getElementById('deck-select-all');
    if (deckSelectAll) {
        deckSelectAll.addEventListener('change', () => {
            document.querySelectorAll('.deck-card-cb').forEach(c => c.checked = deckSelectAll.checked);
            document.querySelectorAll('.suit-select-all').forEach(c => c.checked = deckSelectAll.checked);
            updateDeckBulkBar();
        });
    }

    // Deck bulk — checkbox change → update bulk bar
    document.querySelectorAll('.deck-card-cb').forEach(cb => {
        cb.addEventListener('change', updateDeckBulkBar);
    });

    // Deck bulk — suit select all
    document.querySelectorAll('.suit-select-all').forEach(cb => {
        cb.addEventListener('change', () => {
            const suit = cb.dataset.suit;
            const section = cb.closest('.deck-suit-section');
            section.querySelectorAll('.deck-card-cb').forEach(c => c.checked = cb.checked);
            updateDeckBulkBar();
        });
    });

    // Deck bulk — apply
    const bulkApplyBtn = document.getElementById('bulk-apply-btn');
    if (bulkApplyBtn) {
        bulkApplyBtn.addEventListener('click', () => {
            const selected = document.querySelectorAll('.deck-card-cb:checked');
            const bulkSuit = document.getElementById('bulk-suit').value;
            const bulkValue = document.getElementById('bulk-value').value;
            const bulkEnhance = document.getElementById('bulk-enhance').value;
            const bulkSeal = document.getElementById('bulk-seal').value;
            selected.forEach(cb => {
                const key = cb.dataset.key;
                const card = saveData.cardAreas.deck.cards[key];
                if (!card) return;
                if (bulkSuit) {
                    card.base.suit = bulkSuit;
                    card.base.name = `${card.base.value || '2'} of ${bulkSuit}`;
                    const sd = _suitData[bulkSuit];
                    if (sd) {
                        card.base.suit_nominal = sd.nominal;
                        card.base.suit_nominal_original = sd.original;
                        card.base.colour = { ...sd.colour };
                    }
                }
                if (bulkValue) {
                    card.base.value = bulkValue;
                    card.base.original_value = bulkValue;
                    const nom = _valueMap[bulkValue] || 0;
                    card.base.nominal = nom;
                    card.base.id = nom;
                    card.base.name = `${bulkValue} of ${card.base.suit || 'Hearts'}`;
                    card.base.face_nominal = bulkValue === 'Jack' ? 0.1 : bulkValue === 'Queen' ? 0.2 : bulkValue === 'King' ? 0.3 : 0;
                }
                if (bulkEnhance === '__none__') {
                    setEnhancement(card, null);
                } else if (bulkEnhance) {
                    setEnhancement(card, bulkEnhance);
                }
                if (bulkSeal === '__none__') {
                    setSeal(card, null);
                } else if (bulkSeal) {
                    setSeal(card, bulkSeal);
                }
                updateCardSprite(card);
                delete card._newCard;
            });
            renderSaveEditor();
            showNotification(`Applied to ${selected.length} card(s)`, 'success');
        });
    }

    // Deck bulk — remove selected
    const bulkRemoveBtn = document.getElementById('bulk-remove-btn');
    if (bulkRemoveBtn) {
        bulkRemoveBtn.addEventListener('click', () => {
            const selected = document.querySelectorAll('.deck-card-cb:checked');
            const keys = [...selected].map(cb => cb.dataset.key);
            const cards = saveData.cardAreas.deck.cards;
            if (!cards) return;
            keys.forEach(k => delete cards[k]);
            // Re-index
            const entries = Object.keys(cards)
                .filter(k => k.startsWith('\t\f'))
                .sort((a, b) => parseInt(a.substring(2)) - parseInt(b.substring(2)))
                .map(k => cards[k]);
            const newCards = {};
            entries.forEach((card, i) => {
                newCards[encodeNumKey(String(i + 1))] = card;
                if (card.rank != null) card.rank = i + 1;
            });
            saveData.cardAreas.deck.cards = newCards;
            renderSaveEditor();
            showNotification(`Removed ${keys.length} card(s)`, 'info');
        });
    }

    // Add voucher
    const addVoucherBtn = document.getElementById('add-voucher-btn');
    if (addVoucherBtn) {
        addVoucherBtn.addEventListener('click', () => {
            const select = document.getElementById('add-voucher-select');
            if (!select || !select.value) return;
            if (!saveData.GAME.used_vouchers) saveData.GAME.used_vouchers = {};
            saveData.GAME.used_vouchers[select.value] = true;
            renderSaveEditor();
            showNotification(__('save.notif.voucher_added'), 'success');
        });
    }

    // Planet levels
    document.querySelectorAll('.planet-level-row input[type="number"]').forEach(input => {
        input.addEventListener('change', () => {
            const handName = input.dataset.hand;
            const level = parseInt(input.value) || 1;
            const handData = saveData.GAME?.hands?.[handName];
            if (handData) {
                handData.level = level;
                const lc = handData.l_chips || 0;
                const lm = handData.l_mult || 0;
                if (handData.s_chips != null) handData.chips = handData.s_chips + (level - 1) * lc;
                if (handData.s_mult != null) handData.mult = handData.s_mult + (level - 1) * lm;
            }
        });
    });

    // Consumable select
    document.querySelectorAll('.consumable-item .joker-select').forEach(select => {
        select.addEventListener('change', () => {
            const key = select.dataset.key;
            const card = saveData.cardAreas.consumeables.cards[key];
            if (card) {
                card.save_fields.center = select.value;
                card.label = getJokerName(select.value);
            }
        });
    });

    // Add consumable
    const addConsumableBtn = document.getElementById('add-consumable-btn');
    if (addConsumableBtn) {
        addConsumableBtn.addEventListener('click', () => {
            const nextIdx = getNextCardIndex('consumeables');
            if (!saveData.cardAreas.consumeables.cards) saveData.cardAreas.consumeables.cards = {};
            Object.assign(saveData.cardAreas.consumeables.cards, createDefaultConsumableCard(nextIdx));
            renderSaveEditor();
            showNotification(__('save.notif.consumable_added'), 'success');
        });
    }

    // Export
    const exportBtn = document.getElementById('save-export-btn');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportSaveJkr);
    }

}

function getNextPlayingCard() {
    let maxPc = 0;
    ['deck', 'jokers', 'consumeables'].forEach(area => {
        const cards = saveData?.cardAreas?.[area]?.cards;
        if (!cards) return;
        Object.values(cards).forEach(c => {
            if (c.playing_card && c.playing_card > maxPc) maxPc = c.playing_card;
            if (c.params?.playing_card && c.params.playing_card > maxPc) maxPc = c.params.playing_card;
        });
    });
    return maxPc + 1;
}

function ensureCardDefaults(data) {
    const areas = ['deck', 'jokers', 'consumeables'];
    areas.forEach(area => {
        const cards = data?.cardAreas?.[area]?.cards;
        if (!cards) return;
        Object.values(cards).forEach(card => {
            if (card && typeof card === 'object') {
                if (card['discount-percent'] === undefined) card['discount-percent'] = 0;
                if (card.ability) {
                    if (card.ability.bonus === undefined) card.ability.bonus = 0;
                    if (card.ability.mult === undefined) card.ability.mult = 0;
                    if (area === 'deck') {
                        delete card.ability.extra;
                    } else {
                        if (card.ability.extra === undefined) card.ability.extra = {};
                    }
                }
            }
        });
    });
    return data;
}

function createDefaultDeckCard(index) {
    const ek = encodeNumKey(String(index));
    const pc = getNextPlayingCard();
    return {
        [ek]: {
            save_fields: { card: '', center: 'c_base' },
            params: { playing_card: pc },
            playing_card: pc,
            sort_id: Date.now() + index,
            sprite_facing: 'back',
            facing: 'back',
            label: 'Base Card',
            rank: index,
            extra_cost: 0,
            base: { times_played: 0 },
            ability: { bonus: 0, h_mult: 0, mult: 0, h_dollars: 0, set: 'Default', h_size: 0, t_mult: 0, extra_value: 0, x_mult: 1, perma_bonus: 0, p_dollars: 0, h_x_mult: 0, type: '', t_chips: 0, d_size: 0, effect: 'Base', hands_played_at_create: 0, name: 'Default Base' },
            added_to_deck: true,
            base_cost: 1,
            cost: 1,
            debuff: false,
            sell_cost: 1,
            'discount-percent': 0,

            _newCard: true
        }
    };
}

function createDefaultConsumableCard(index) {
    const ek = encodeNumKey(String(index));
    return {
        [ek]: {
            sprite_facing: 'front',
            facing: 'front',
            rank: index,
            save_fields: { center: 'c_fool' },
            label: 'The Fool',
            base: { nominal: 0, suit_nominal: 0, face_nominal: 0, times_played: 0 },
            bypass_discovery_center: true,
            ability: {
                bonus: 0, h_mult: 0, mult: 0, order: 1, h_dollars: 0,
                set: 'Tarot', h_size: 0, t_mult: 0, extra_value: 0,
                x_mult: 1, perma_bonus: 0, p_dollars: 0, h_x_mult: 0,
                type: '', t_chips: 0, name: 'The Fool', d_size: 0,
                extra: {}, hands_played_at_create: 0,
                consumeable: {}
            },
            base_cost: 1,
            params: { discover: false, bypass_discovery_center: true, bypass_discovery_ui: true },
            sort_id: Date.now() + index, extra_cost: 0, bypass_discovery_ui: true,
            cost: 1, debuff: false, bypass_lock: true, sell_cost: 1, added_to_deck: true,
            'discount-percent': 0
        }
    };
    return obj;
}

function createDefaultJokerCard(jokerId, index) {
    const ek = encodeNumKey(String(index));
    const tpl = getJokerTemplate(jokerId);
    let extra;
    if (tpl) {
        extra = ('extra' in tpl && typeof tpl.extra !== 'object') ? tpl.extra : (tpl.extra != null ? (typeof tpl.extra === 'object' ? { ...tpl.extra } : tpl.extra) : {});
    } else {
        extra = {};
    }
    const obj = {};
    obj[ek] = {
        sprite_facing: 'front',
        facing: 'front',
        rank: index,
        save_fields: { center: jokerId },
        label: getJokerName(jokerId),
        base: { nominal: 0, suit_nominal: 0, face_nominal: 0, times_played: 0 },
        bypass_discovery_center: true,
        ability: {
            extra: extra,
            h_mult: 0, order: 0, h_dollars: 0,
            set: 'Joker', h_size: 0, t_mult: 0, extra_value: 0,
            x_mult: 1, perma_bonus: 0, p_dollars: 0, h_x_mult: 0,
            type: '', t_chips: 0, name: getJokerName(jokerId), d_size: 0,
            hands_played_at_create: 0,
            bonus: 0, mult: 0
        },
        base_cost: 1,
        params: { discover: false, bypass_discovery_center: true, bypass_discovery_ui: true },
        sort_id: Date.now() + index, extra_cost: 0, bypass_discovery_ui: true,
        cost: 1, debuff: false, bypass_lock: true, sell_cost: 1, added_to_deck: true,
        'discount-percent': 0
    };
    return obj;
}

// ─── DECK BULK HELPERS ──────────────────────────────────────────
function updateDeckBulkBar() {
    const bar = document.getElementById('deck-bulk-bar');
    if (!bar) return;
    const checked = document.querySelectorAll('.deck-card-cb:checked');
    const count = document.getElementById('deck-bulk-count');
    if (count) count.textContent = checked.length;
    bar.classList.toggle('hidden', checked.length === 0);
}

// ─── BULK JOKER ADD MODAL ────────────────────────────────────────
function showJokerAddModal() {
    const allJokers = getAllJokerIds();
    if (allJokers.length === 0) {
        showNotification(__('No jokers available — import a meta.jkr first'), 'error');
        return;
    }

    const existingOverlay = document.querySelector('.modal-overlay');
    if (existingOverlay) existingOverlay.remove();

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3><i class="fa-solid fa-plus"></i> Add Jokers</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <input class="modal-search" type="text" placeholder="Search jokers...">
                <label class="modal-select-all">
                    <input type="checkbox" class="select-all-cb"> Select All
                </label>
                <div class="modal-joker-grid">
                    ${allJokers.map(jid => `
                        <label class="modal-joker-item" data-id="${jid}">
                            <img data-src="1" data-id="${jid}" data-category="jokers"
                                 src="${PLACEHOLDER_SVG}" alt="${getJokerName(jid)}" loading="lazy">
                            <span class="joker-name">${getJokerName(jid)}</span>
                            <input type="checkbox" value="${jid}">
                        </label>
                    `).join('')}
                </div>
            </div>
            <div class="modal-footer">
                <button class="modal-btn modal-btn-secondary modal-cancel">Cancel</button>
                <button class="modal-btn modal-btn-primary modal-confirm">
                    <i class="fa-solid fa-plus"></i> Add Selected
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);

    // Close handlers
    const close = () => overlay.remove();
    overlay.querySelector('.modal-close').addEventListener('click', close);
    overlay.querySelector('.modal-cancel').addEventListener('click', close);
    overlay.addEventListener('click', e => { if (e.target === overlay) close(); });

    // Select All
    const selectAllCb = overlay.querySelector('.select-all-cb');
    const itemCbs = overlay.querySelectorAll('.modal-joker-item input[type="checkbox"]');
    selectAllCb.addEventListener('change', () => {
        itemCbs.forEach(cb => cb.checked = selectAllCb.checked);
        itemCbs.forEach(cb => cb.closest('.modal-joker-item').classList.toggle('selected', cb.checked));
    });

    // Toggle item visual + checkbox on click
    overlay.querySelectorAll('.modal-joker-item').forEach(label => {
        const cb = label.querySelector('input[type="checkbox"]');
        label.addEventListener('click', e => {
            if (e.target.tagName !== 'INPUT') {
                cb.checked = !cb.checked;
                cb.dispatchEvent(new Event('change', { bubbles: true }));
            }
        });
        cb.addEventListener('change', () => {
            label.classList.toggle('selected', cb.checked);
            selectAllCb.checked = [...itemCbs].every(c => c.checked);
            selectAllCb.indeterminate = !selectAllCb.checked && [...itemCbs].some(c => c.checked);
        });
    });

    // Search filter
    const searchInput = overlay.querySelector('.modal-search');
    searchInput.addEventListener('input', () => {
        const q = searchInput.value.toLowerCase();
        overlay.querySelectorAll('.modal-joker-item').forEach(item => {
            const name = item.querySelector('.joker-name').textContent.toLowerCase();
            const id = item.dataset.id.toLowerCase();
            const match = name.includes(q) || id.includes(q);
            item.style.display = match ? '' : 'none';
        });
    });

    // Confirm — add selected jokers
    overlay.querySelector('.modal-confirm').addEventListener('click', () => {
        const selected = [...overlay.querySelectorAll('.modal-joker-item input[type="checkbox"]:checked')]
            .map(cb => cb.value);
        if (selected.length === 0) {
            showNotification('No jokers selected', 'error');
            return;
        }
        if (!saveData.cardAreas.jokers.cards) saveData.cardAreas.jokers.cards = {};
        let nextIdx = getNextCardIndex('jokers');
        selected.forEach(jid => {
            Object.assign(saveData.cardAreas.jokers.cards, createDefaultJokerCard(jid, nextIdx));
            nextIdx++;
        });
        const currentSlots = saveData.GAME?.max_jokers || 0;
        const newCount = getCardsInArea('jokers').length;
        if (saveData.GAME && newCount > currentSlots) {
            saveData.GAME.max_jokers = newCount;
            if (saveData.GAME.joker_slots != null) saveData.GAME.joker_slots = newCount;
        }
        overlay.remove();
        renderSaveEditor();
        showNotification(`Added ${selected.length} joker(s)`, 'success');
    });

    // Load images
    loadImagesInContainer(overlay);
}

// ─── IMPORT / EXPORT ─────────────────────────────────────────────
async function importSaveJkr(file) {
    try {
        showNotification(__('save.notif.loading'), 'info');
        const arrayBuffer = await readFileAsArrayBuffer(file);
        const uint8Array = new Uint8Array(arrayBuffer);
        const jsonData = await jkrToJson(uint8Array);

        if (!jsonData.cardAreas || !jsonData.GAME) {
            showNotification(__('save.notif.invalid'), 'error');
            return;
        }

        saveData = ensureCardDefaults(JSON.parse(JSON.stringify(jsonData)));
        renderSaveEditor();
        showNotification(__('save.notif.loaded'), 'success');
    } catch (error) {
        showNotification(__('save.notif.error', { message: error.message }), 'error');
    }
}

let _exportingSave = false;

async function exportSaveJkr() {
    if (_exportingSave) return;
    _exportingSave = true;
    try {
        if (!saveData) {
            showNotification(__('save.notif.no_data'), 'error');
            return;
        }
        if (!await showSafeDownloadModal('save.jkr')) return;
        showNotification(__('save.notif.preparing'), 'info');
        const jkrContent = await jsonToJkr(saveData);
        showNotification(__('save.notif.exporting'), 'info');
        const blob = new Blob([jkrContent], { type: 'application/octet-stream' });
        await exportBlob(blob, 'save.jkr', __('save.notif.exported'));
    } catch (error) {
        showNotification(__('save.notif.export_error', { message: error.message }), 'error');
    } finally {
        _exportingSave = false;
    }
}

function isSaveMode() {
    return currentCategory === 'save';
}
