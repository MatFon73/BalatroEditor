const REPO_URL = 'https://github.com/MatFon73/BalatroEditor';

function showSafeDownloadModal(filename) {
    return new Promise(resolve => {
        const overlay = document.createElement('div');
        overlay.className = 'safe-dl-overlay';
        overlay.innerHTML = `
            <div class="safe-dl-modal">
                <div class="safe-dl-icon"><i class="fa-solid fa-shield-halved"></i></div>
                <h3 class="safe-dl-title">${filename}</h3>
                <p class="safe-dl-msg">${__('safe_dl.msg')}</p>
                <p class="safe-dl-code">${__('safe_dl.code')}</p>
                <a href="${REPO_URL}" target="_blank" rel="noopener noreferrer" class="safe-dl-github">
                    <i class="fa-brands fa-github"></i> ${__('safe_dl.github')}
                </a>
                <div class="safe-dl-actions">
                    <button class="safe-dl-cancel">${__('safe_dl.cancel')}</button>
                    <button class="safe-dl-confirm">${__('safe_dl.confirm', { filename })}</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        overlay.querySelector('.safe-dl-cancel').addEventListener('click', () => {
            overlay.remove();
            resolve(false);
        });
        overlay.querySelector('.safe-dl-confirm').addEventListener('click', () => {
            overlay.remove();
            resolve(true);
        });
        overlay.addEventListener('click', e => {
            if (e.target === overlay) {
                overlay.remove();
                resolve(false);
            }
        });
    });
}

const CATEGORIES = {
    jokers: { prefix: 'j_', name: 'nav.jokers', catalog: [
        '8_ball', 'abstract', 'acrobat', 'ancient', 'arrowhead', 'astronomer',
        'banner', 'baron', 'baseball', 'blackboard', 'bloodstone', 'blue_joker',
        'blueprint', 'bootstraps', 'brainstorm', 'bull', 'burglar', 'burnt',
        'business', 'campfire', 'caino', 'card_sharp', 'cartomancer', 'castle',
        'cavendish', 'ceremonial', 'certificate', 'chaos', 'chicot', 'clever',
        'cloud_9', 'constellation', 'crafty', 'crazy', 'credit_card', 'delayed_grat',
        'devious', 'diet_cola', 'dna', 'drivers_license', 'droll', 'drunkard',
        'duo', 'dusk', 'egg', 'erosion', 'even_steven', 'faceless',
        'family', 'fibonacci', 'flash', 'flower_pot', 'fortune_teller', 'four_fingers',
        'gift', 'glass', 'gluttenous_joker', 'golden', 'greedy_joker', 'green_joker',
        'gros_michel', 'hack', 'half', 'hallucination', 'hanging_chad', 'hiker',
        'hit_the_road', 'hologram', 'ice_cream', 'idol', 'invisible', 'joker',
        'jolly', 'juggler', 'loyalty_card', 'luchador', 'lucky_cat', 'lusty_joker',
        'mad', 'madness', 'mail', 'marble', 'matador', 'merry_andy',
        'midas_mask', 'mime', 'misprint', 'mr_bones', 'mystic_summit', 'obelisk',
        'odd_todd', 'onyx_agate', 'oops', 'order', 'pareidolia', 'perkeo',
        'photograph', 'popcorn', 'raised_fist', 'ramen', 'red_card', 'reserved_parking',
        'ride_the_bus', 'riff_raff', 'ring_master', 'rocket', 'rough_gem', 'runner',
        'satellite', 'scary_face', 'scholar', 'seance', 'seeing_double', 'selzer',
        'shoot_the_moon', 'shortcut', 'sixth_sense', 'sly', 'smeared', 'smiley',
        'sock_and_buskin', 'space', 'splash', 'square', 'steel_joker', 'stencil',
        'stone', 'stuntman', 'supernova', 'superposition', 'swashbuckler', 'throwback',
        'ticket', 'to_the_moon', 'todo_list', 'trading', 'tribe', 'triboulet',
        'trio', 'troubadour', 'trousers', 'turtle_bean', 'vagabond', 'vampire',
        'walkie_talkie', 'wee', 'wily', 'wrathful_joker', 'yorick', 'zany'
    ] },
    tarots: { prefix: 'c_', name: 'nav.tarots', filter: ['fool', 'magician', 'high_priestess', 'empress', 'emperor', 'heirophant', 'lovers', 'chariot', 'justice', 'hermit', 'wheel_of_fortune', 'strength', 'hanged_man', 'death', 'temperance', 'devil', 'tower', 'star', 'moon', 'sun', 'judgement', 'world'] },
    planets: { prefix: 'c_', name: 'nav.planets', filter: ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto', 'planet_x', 'ceres', 'eris'] },
    spectrals: { prefix: 'c_', name: 'nav.spectrals', filter: ['familiar', 'grim', 'incantation', 'talisman', 'aura', 'wraith', 'sigil', 'ouija', 'ectoplasm', 'immolate', 'ankh', 'deja_vu', 'hex', 'trance', 'medium', 'cryptid', 'soul', 'black_hole'] },
    vouchers: { prefix: 'v_', name: 'nav.vouchers', catalog: [
        'antimatter', 'blank', 'clearance_sale', 'crystal_ball', 'directors_cut', 'glow_up',
        'grabber', 'hieroglyph', 'hone', 'illusion', 'liquidation', 'magic_trick',
        'money_tree', 'nacho_tong', 'observatory', 'omen_globe', 'overstock_norm', 'overstock_plus',
        'paint_brush', 'palette', 'petroglyph', 'planet_merchant', 'planet_tycoon', 'recyclomancy',
        'reroll_glut', 'reroll_surplus', 'retcon', 'seed_money', 'tarot_merchant', 'tarot_tycoon',
        'telescope', 'wasteful'
    ] },
    decks: { prefix: 'b_', name: 'nav.decks', catalog: [
        'abandoned', 'anaglyph', 'black', 'blue', 'challenge', 'checkered',
        'erratic', 'ghost', 'green', 'magic', 'nebula', 'painted',
        'plasma', 'red', 'yellow', 'zodiac'
    ] },
    boosters: { prefix: 'p_', name: 'nav.boosters', filter: [
        'arcana_normal_1', 'arcana_normal_2', 'arcana_normal_3', 'arcana_normal_4',
        'arcana_jumbo_1', 'arcana_jumbo_2', 'arcana_mega_1', 'arcana_mega_2',
        'buffoon_normal_1', 'buffoon_normal_2', 'buffoon_jumbo_1', 'buffoon_mega_1',
        'celestial_normal_1', 'celestial_normal_2', 'celestial_normal_3', 'celestial_normal_4',
        'celestial_jumbo_1', 'celestial_jumbo_2', 'celestial_mega_1', 'celestial_mega_2',
        'spectral_normal_1', 'spectral_normal_2', 'spectral_jumbo_1', 'spectral_mega_1',
        'standard_normal_1', 'standard_normal_2', 'standard_normal_3', 'standard_normal_4',
        'standard_jumbo_1', 'standard_jumbo_2', 'standard_mega_1', 'standard_mega_2'
    ] },
    modifiers: {
        name: 'nav.modifiers',
        isMultiple: true,
        subcategories: [
            { prefix: 'm_', name: 'nav.enhancements' },
            { prefix: 'e_', name: 'nav.editions' },
            { prefix: 'soul', name: 'nav.seals', isSeal: true }
        ]
    },
    tags: { prefix: 'tag_', name: 'nav.tags', filter: ['boss', 'buffoon', 'charm', 'coupon', 'd_six', 'double', 'economy', 'ethereal', 'foil', 'garbage', 'handy', 'holo', 'investment', 'juggle', 'meteor', 'negative', 'orbital', 'polychrome', 'rare', 'skip', 'standard', 'top_up', 'uncommon', 'voucher'] },
    blinds: { prefix: 'bl_', name: 'nav.blinds', filter: ['arm', 'big', 'club', 'eye', 'final_acorn', 'final_bell', 'final_heart', 'final_leaf', 'final_vessel', 'fish', 'flint', 'goad', 'head', 'hook', 'house', 'manacle', 'mark', 'mouth', 'needle', 'ox', 'pillar', 'plant', 'psychic', 'serpent', 'small', 'tooth', 'wall', 'water', 'wheel', 'window'] },
    profile: { name: 'nav.profile' }
};

const NOTIFICATION_DURATION = 3000;
let _currentNotification = null;
let _notificationTimeout = null;

function showNotification(message, type = 'info') {
    if (_currentNotification) {
        clearTimeout(_notificationTimeout);
        _currentNotification.remove();
        _currentNotification = null;
    }

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed; top: 20px; right: 20px; padding: 16px 24px;
        background: ${type === 'success' ? 'var(--success)' : type === 'error' ? 'var(--danger)' : 'var(--accent-primary)'};
        color: white; border-radius: 10px; box-shadow: 0 8px 24px rgba(0,0,0,0.3);
        z-index: 9999; animation: slideIn 0.3s ease; font-weight: 500;
    `;
    document.body.appendChild(notification);
    _currentNotification = notification;

    _notificationTimeout = setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            notification.remove();
            if (_currentNotification === notification) {
                _currentNotification = null;
                _notificationTimeout = null;
            }
        }, 300);
    }, NOTIFICATION_DURATION);
}

function formatName(id) {
    return id
        .replace(/^(j_|c_|v_|b_|m_|e_|tag_|bl_|p_)/, '')
        .replace(/_/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

function formatProfileName(id) {
    return id
        .replace(/^(j_|c_|v_|b_|m_|e_|tag_|bl_|p_)/, '')
        .replace(/_\d+$/, '')
        .replace(/_/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());
}

function debounce(fn, delay = 200) {
    let timer;
    return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
    };
}

function setNestedValue(obj, path, value) {
    const keys = path.split('.');
    let current = obj;
    for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
}

async function exportBlob(blob, suggestedName, successMessage) {
    try {
        if (window.showSaveFilePicker) {
            try {
                const fileHandle = await window.showSaveFilePicker({
                    suggestedName,
                    types: [{
                        description: __('app.title'),
                        accept: { 'application/octet-stream': ['.jkr'] }
                    }]
                });
                const writable = await fileHandle.createWritable();
                await writable.write(blob);
                await writable.close();
                showNotification(successMessage, 'success');
            } catch (err) {
                if (err.name === 'AbortError') {
                    showNotification(__('notif.export_cancelled'), 'info');
                } else {
                    throw err;
                }
            }
        } else {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = suggestedName;
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            setTimeout(() => {
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            }, 100);
            showNotification(successMessage, 'success');
        }
    } catch (error) {
        showNotification(__('notif.exporting_error', { message: error.message }), 'error');
    }
}

function readFileAsArrayBuffer(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error(__('notif.file_read_error')));
        reader.readAsArrayBuffer(file);
    });
}
