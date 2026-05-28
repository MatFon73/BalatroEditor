const CATEGORIES = {
    jokers: { prefix: 'j_', name: 'Jokers' },
    tarots: { prefix: 'c_', name: 'Tarots', filter: ['fool', 'magician', 'high_priestess', 'empress', 'emperor', 'heirophant', 'lovers', 'chariot', 'justice', 'hermit', 'wheel_of_fortune', 'strength', 'hanged_man', 'death', 'temperance', 'devil', 'tower', 'star', 'moon', 'sun', 'judgement', 'world'] },
    planets: { prefix: 'c_', name: 'Planets', filter: ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto', 'planet_x', 'ceres', 'eris'] },
    spectrals: { prefix: 'c_', name: 'Spectrals', filter: ['familiar', 'grim', 'incantation', 'talisman', 'aura', 'wraith', 'sigil', 'ouija', 'ectoplasm', 'immolate', 'ankh', 'deja_vu', 'hex', 'trance', 'medium', 'cryptid', 'soul', 'black_hole'] },
    vouchers: { prefix: 'v_', name: 'Vouchers' },
    decks: { prefix: 'b_', name: 'Decks' },
    modifiers: {
        name: 'Card Modifiers',
        isMultiple: true,
        subcategories: [
            { prefix: 'm_', name: 'Enhancements' },
            { prefix: 'e_', name: 'Editions' },
            { prefix: 'soul', name: 'Seals', isSeal: true }
        ]
    },
    tags: { prefix: 'tag_', name: 'Tags' },
    blinds: { prefix: 'bl_', name: 'Blinds' },
    profile: { name: 'Profile' }
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
                        description: 'Balatro Save File',
                        accept: { 'application/octet-stream': ['.jkr'] }
                    }]
                });
                const writable = await fileHandle.createWritable();
                await writable.write(blob);
                await writable.close();
                showNotification(successMessage, 'success');
            } catch (err) {
                if (err.name === 'AbortError') {
                    showNotification('Export cancelled', 'info');
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
        showNotification('Error exporting: ' + error.message, 'error');
    }
}

function readFileAsArrayBuffer(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsArrayBuffer(file);
    });
}
