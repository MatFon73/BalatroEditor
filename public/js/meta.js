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

let _exportingMeta = false;

async function exportJkr() {
    if (_exportingMeta) return;
    _exportingMeta = true;
    try {
        if (!metaData.unlocked || !metaData.discovered || !metaData.alerted) {
            throw new Error('metaData structure is invalid');
        }
        showNotification('Preparing meta.jkr for export...', 'info');
        const jkrContent = await jsonToJkr(metaData);
        showNotification('Exporting meta.jkr...', 'info');
        const blob = new Blob([jkrContent], { type: 'application/octet-stream' });
        await exportBlob(blob, 'meta.jkr', 'meta.jkr exported successfully!');
    } catch (error) {
        showNotification('Export failed: ' + error.message, 'error');
    } finally {
        _exportingMeta = false;
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
            if (category === 'tarots' || category === 'planets' || category === 'spectrals') {
                continue;
            }
            items.push(key);
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
                    ${items.length > 0 ? items.map(item => createItemCard(item, category)).join('') : '<div class="empty-state"><i class="fa-solid fa-magnifying-glass"></i><p>No items found</p><span>Try a different search term</span></div>'}
                </div>
            </div>
        `;

        const elapsed = Date.now() - skeletonStart;
        const remaining = Math.max(0, 1000 - elapsed);

        const applyRender = () => {
            container.innerHTML = html;
            document.querySelectorAll('.item-card').forEach(card => {
                card.addEventListener('click', () => toggleItem(card.dataset.id));
                card.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        toggleItem(card.dataset.id);
                    }
                });
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
        <div class="item-card ${state}" data-id="${id}" tabindex="0" role="button">
            <div class="status-badge"></div>
            <img data-src="${imgUrl}" data-id="${id}" data-category="${category}" alt="${name}" loading="lazy" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23222' width='100' height='100'/%3E%3Cpath d='M35 42a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm22-6-8 12-6-5-10 13h34l-10-20z' fill='%23333'/%3E%3C/svg%3E">
            <div class="item-name">${name}</div>
            <div class="state-indicator">${state === 'unlocked' ? 'Unlocked' : state === 'discovered' ? 'Discovered' : 'Locked'}</div>
        </div>
    `;
}

function getImageUrl(id, category) {
    const exceptionalUrl = getExceptionalImageUrl(id, category);
    if (exceptionalUrl) return exceptionalUrl;
    const urls = getImageUrls(id, category);
    return urls.length > 0 ? urls[0] : PLACEHOLDER_SVG;
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
