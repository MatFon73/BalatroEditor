let metaData = {
    unlocked: {},
    discovered: {},
    alerted: {}
};

let currentCategory = 'jokers';
let searchTerm = '';

document.addEventListener('DOMContentLoaded', () => {
    loadMetaJSON();

    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            renderCategory(tab.dataset.category);
            if (window.innerWidth <= 768) {
                document.getElementById('sidebar').classList.remove('active');
            }
        });
    });

    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', debounce((e) => {
        searchTerm = e.target.value;
        renderCategory(currentCategory);
    }, 200));

    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const sidebar = document.getElementById('sidebar');
    mobileMenuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('active');
    });

    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 768 &&
            sidebar.classList.contains('active') &&
            !sidebar.contains(e.target) &&
            !mobileMenuToggle.contains(e.target)) {
            sidebar.classList.remove('active');
        }
    });

    document.getElementById('unlock-all').addEventListener('click', unlockAll);
    document.getElementById('lock-all').addEventListener('click', lockAll);

    const exportJkrBtn = document.getElementById('export-jkr');
    if (exportJkrBtn) {
        exportJkrBtn.addEventListener('click', exportJkr);
    }

    const importJkrInput = document.getElementById('import-jkr');
    if (importJkrInput) {
        importJkrInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) importJkr(file);
        });
    }
});

async function exportJkr() {
    try {
        if (!metaData.unlocked || !metaData.discovered || !metaData.alerted) {
            throw new Error('metaData structure is invalid');
        }
        showNotification('Converting to JKR...', 'info');
        const jkrContent = await jsonToJkr(metaData);
        const blob = new Blob([jkrContent], { type: 'application/octet-stream' });
        await exportBlob(blob, 'meta.jkr', 'meta.jkr exported successfully!');
    } catch (error) {
        showNotification('Error exporting: ' + error.message, 'error');
    }
}

async function importJkr(file) {
    if (file.name !== 'meta.jkr' && file.name !== '1') {
        showNotification('Please select a valid meta.jkr file', 'error');
        return;
    }
    try {
        showNotification('Converting JKR...', 'info');
        const arrayBuffer = await readFileAsArrayBuffer(file);
        const uint8Array = new Uint8Array(arrayBuffer);
        const jsonData = await jkrToJson(uint8Array);

        if (!jsonData.unlocked || !jsonData.discovered) {
            showNotification('Invalid meta.jkr: missing unlocked/discovered data', 'error');
            return;
        }

        metaData.unlocked = jsonData.unlocked || {};
        metaData.discovered = jsonData.discovered || {};
        metaData.alerted = jsonData.alerted || {};

        renderCategory(currentCategory);
        showNotification('meta.jkr imported successfully!', 'success');
    } catch (error) {
        showNotification('Error importing JKR: ' + error.message, 'error');
    }
}

async function loadMetaJSON() {
    try {
        showSkeletonLoading();
        const response = await fetch('data/meta.json');
        const data = await response.json();
        metaData.unlocked = data.unlocked || {};
        metaData.discovered = data.discovered || {};
        metaData.alerted = data.alerted || {};
        await new Promise(resolve => setTimeout(resolve, 300));
        renderCategory(currentCategory);
    } catch (error) {
        document.getElementById('content-container').innerHTML = `
            <div class="loading" style="color: var(--danger);">
                Error loading meta.json<br>
                <span style="font-size: 12px; color: var(--text-tertiary);">Make sure the file is in the same folder</span>
            </div>
        `;
    }
}

function showSkeletonLoading() {
    const container = document.getElementById('content-container');
    const skeletonCards = Array(12).fill(0).map(() => `
        <div class="skeleton-card">
            <div class="skeleton-image"></div>
            <div class="skeleton-text"></div>
        </div>
    `).join('');
    container.innerHTML = `
        <div class="content-section active">
            <div class="category-header">
                <h2>Loading...</h2>
                <div class="stats">
                    <div class="stat-item">
                        <div class="stat-label">Unlocked</div>
                        <div class="stat-value">- / -</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">Discovered</div>
                        <div class="stat-value">- / -</div>
                    </div>
                </div>
            </div>
            <div class="skeleton-grid">${skeletonCards}</div>
        </div>
    `;
}

function updateStats() {
    const items = getItemsForCategory(currentCategory);
    const unlocked = items.filter(item => metaData.unlocked[item] === true).length;
    const discovered = items.filter(item => metaData.discovered[item] === true && metaData.unlocked[item] !== true).length;
    const total = items.length;
    const statsContainer = document.querySelector('.stats');
    if (statsContainer) {
        statsContainer.innerHTML = `
            <div class="stat-item">
                <div class="stat-label">Unlocked</div>
                <div class="stat-value">${unlocked} / ${total}</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">Discovered</div>
                <div class="stat-value">${discovered} / ${total}</div>
            </div>
        `;
    }
}

function getItemsForCategory(category) {
    const cat = CATEGORIES[category];
    const items = [];
    if (cat.isMultiple) {
        cat.subcategories.forEach(subcat => {
            for (let key in metaData.unlocked) {
                if (subcat.isSeal && key === 'soul') {
                    items.push(key);
                } else if (key.startsWith(subcat.prefix) && !key.startsWith('p_')) {
                    items.push(key);
                }
            }
        });
        return [...new Set(items)].sort();
    }
    const allKeys = new Set([
        ...Object.keys(metaData.unlocked || {}),
        ...Object.keys(metaData.discovered || {}),
        ...Object.keys(metaData.alerted || {})
    ]);
    for (let key of allKeys) {
        if (cat.filter) {
            const itemName = key.replace(cat.prefix, '');
            if (cat.filter.includes(itemName)) {
                items.push(key);
            }
        } else if (cat.isSeal && key === 'soul') {
            items.push(key);
        } else if (key.startsWith(cat.prefix) && !key.startsWith('p_')) {
            const itemName = key.replace(cat.prefix, '');
            if (category === 'tarots' || category === 'planets' || category === 'spectrals') {
                continue;
            }
            if (cat.prefix === 'c_') {
                const planetCards = ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto', 'planet_x', 'ceres', 'eris'];
                const spectralCards = ['familiar', 'grim', 'incantation', 'talisman', 'aura', 'wraith', 'sigil', 'ouija', 'ectoplasm', 'immolate', 'ankh', 'deja_vu', 'hex', 'trance', 'medium', 'cryptid', 'soul', 'black_hole'];
                if (!planetCards.includes(itemName) && !spectralCards.includes(itemName)) {
                    items.push(key);
                }
            } else {
                items.push(key);
            }
        }
    }
    return [...new Set(items)].sort();
}

function renderCategory(category) {
    currentCategory = category;
    const container = document.getElementById('content-container');
    if (category === 'profile') {
        if (typeof renderProfile === 'function') {
            renderProfile();
        } else {
            container.innerHTML = `
                <div class="loading" style="color: var(--danger);">
                    Profile module not loaded<br>
                    <span style="font-size: 12px; color: var(--text-tertiary);">Make sure profile.js is included</span>
                </div>
            `;
        }
        return;
    }
    showCategorySkeletonLoading(category);
    const skeletonStart = Date.now();
    setTimeout(() => {
        let items = getItemsForCategory(category);
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            items = items.filter(item => formatName(item).toLowerCase().includes(term));
        }
        const cat = CATEGORIES[category];
        const allItems = getItemsForCategory(category);
        const unlocked = allItems.filter(item => metaData.unlocked[item] === true).length;
        const discovered = allItems.filter(item => metaData.discovered[item] === true && metaData.unlocked[item] !== true).length;
        const total = allItems.length;

        const html = `
            <div class="content-section active">
                <div class="category-header">
                    <h2>${cat.name}</h2>
                    <div class="stats">
                        <div class="stat-item">
                            <div class="stat-label">Unlocked</div>
                            <div class="stat-value">${unlocked} / ${total}</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-label">Discovered</div>
                            <div class="stat-value">${discovered} / ${total}</div>
                        </div>
                    </div>
                </div>
                <div class="items-grid">
                    ${items.length > 0 ? items.map(item => createItemCard(item, category)).join('') : '<p style="grid-column: 1/-1; text-align: center; color: var(--text-secondary); padding: 40px;">No items found</p>'}
                </div>
            </div>
        `;

        const elapsed = Date.now() - skeletonStart;
        const remaining = Math.max(0, 1000 - elapsed);

        const applyRender = () => {
            container.innerHTML = html;
            document.querySelectorAll('.item-card').forEach(card => {
                card.addEventListener('click', () => toggleItem(card.dataset.id));
            });
            loadImagesInContainer(container);
        };

        if (remaining > 0) {
            setTimeout(applyRender, remaining);
        } else {
            applyRender();
        }
    }, 300);
}

function showCategorySkeletonLoading(category) {
    const container = document.getElementById('content-container');
    const cat = CATEGORIES[category];
    const skeletonCards = Array(8).fill(0).map(() => `
        <div class="skeleton-card">
            <div class="skeleton-image"></div>
            <div class="skeleton-text"></div>
        </div>
    `).join('');
    container.innerHTML = `
        <div class="content-section active">
            <div class="category-header">
                <h2>${cat.name}</h2>
                <div class="stats">
                    <div class="stat-item">
                        <div class="stat-label">Unlocked</div>
                        <div class="stat-value">- / -</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">Discovered</div>
                        <div class="stat-value">- / -</div>
                    </div>
                </div>
            </div>
            <div class="skeleton-grid">${skeletonCards}</div>
        </div>
    `;
}

function getItemState(id) {
    const unlocked = metaData.unlocked[id];
    const discovered = metaData.discovered[id];
    if (unlocked === true) return 'unlocked';
    if (discovered === true && unlocked !== true) return 'discovered';
    return 'locked';
}

function createItemCard(id, category) {
    const state = getItemState(id);
    const name = formatName(id);
    const imgUrl = getImageUrl(id, category);
    return `
        <div class="item-card ${state}" data-id="${id}">
            <div class="status-badge"></div>
            <img data-src="${imgUrl}" data-id="${id}" data-category="${category}" alt="${name}" loading="lazy" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23333' width='100' height='100'/%3E%3C/svg%3E">
            <div class="item-name">${name}</div>
            <div class="state-indicator">${state === 'unlocked' ? 'Unlocked' : state === 'discovered' ? 'Discovered' : 'Locked'}</div>
        </div>
    `;
}

function getImageUrl(id, category) {
    const exceptionalUrl = getExceptionalImageUrl(id, category);
    if (exceptionalUrl) return exceptionalUrl;

    const wikiName = formatName(id).replace(/ /g, '_');
    const cleanId = id.replace(/^(j_|v_|c_|m_|e_|bl_|tag_)/, '');
    const baseUrl = 'https://balatrowiki.org/images/';

    const specialFile = getSpecialFileName(id, category);
    if (specialFile) return baseUrl + specialFile;

    switch (category) {
        case 'jokers': return baseUrl + wikiName + '_Joker.png';
        case 'vouchers': return baseUrl + wikiName + '.png';
        case 'decks': return baseUrl + wikiName + '_Deck.png';
        case 'planets':
        case 'spectrals':
        case 'tarots': return baseUrl + 'The_' + wikiName + '.png';
        case 'modifiers':
            if (id.startsWith('m_')) return baseUrl + wikiName + '_Card.png';
            return baseUrl + wikiName + '.png';
        case 'blinds': return baseUrl + 'The_' + wikiName + '.png';
        case 'tags': return baseUrl + wikiName + '_Tag.png';
        default: return baseUrl + wikiName + '.png';
    }
}

function toggleItem(id) {
    const currentState = getItemState(id);
    if (currentState === 'locked') {
        metaData.discovered[id] = true;
        metaData.unlocked[id] = false;
    } else if (currentState === 'discovered') {
        metaData.discovered[id] = true;
        metaData.unlocked[id] = true;
        metaData.alerted[id] = true;
    } else {
        metaData.discovered[id] = false;
        metaData.unlocked[id] = false;
        metaData.alerted[id] = false;
    }
    const card = document.querySelector(`[data-id="${id}"]`);
    if (card) {
        const newState = getItemState(id);
        card.classList.remove('locked', 'discovered', 'unlocked');
        card.classList.add(newState);
        const stateIndicator = card.querySelector('.state-indicator');
        if (stateIndicator) {
            stateIndicator.textContent = newState === 'unlocked' ? 'Unlocked' :
                newState === 'discovered' ? 'Discovered' : 'Locked';
        }
    }
    updateStats();
}

function unlockAll() {
    for (let key in metaData.unlocked) {
        metaData.unlocked[key] = true;
        metaData.discovered[key] = true;
        metaData.alerted[key] = true;
    }
    renderCategory(currentCategory);
}

function lockAll() {
    for (let key in metaData.unlocked) {
        metaData.unlocked[key] = false;
        metaData.discovered[key] = false;
        metaData.alerted[key] = false;
    }
    renderCategory(currentCategory);
}
