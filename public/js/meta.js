let metaData = {
    "unlocked": {},
    "discovered": {},
    "alerted": {}
};

const categories = {
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
    profile: { name: 'Profile', isProfile: true } // NUEVA LÍNEA
};


let currentCategory = 'jokers';
let searchTerm = '';

const API_URL = `${window.location.protocol}//${window.location.host}${window.location.pathname.replace('index.html', '')}api.php`;

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
    searchInput.addEventListener('input', (e) => {
        searchTerm = e.target.value;
        renderCategory(currentCategory);
    });

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
        exportJkrBtn.addEventListener('click', () => {
            console.log('Export JKR button clicked');
            exportJkr();
        });
    }

    const importJkrInput = document.getElementById('import-jkr');
    if (importJkrInput) {
        importJkrInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                console.log('Importing JKR file:', file.name);
                importJkr(file);
            }
        });
    }
});

async function jsonToJkr(jsonData) {
    try {
        const response = await fetch(`${API_URL}?endpoint=json-to-jkr`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(jsonData)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (!result.success) {
            throw new Error(result.error || 'Unknown error from server');
        }

        if (result.encoding === 'base64') {
            const binaryString = atob(result.jkr_content);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            return bytes;
        }

        return result.jkr_content;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

async function jkrToJson(jkrContent) {
    try {
        let contentToSend = jkrContent;
        if (jkrContent instanceof Uint8Array) {
            const binaryString = String.fromCharCode.apply(null, jkrContent);
            contentToSend = btoa(binaryString);
        }

        const response = await fetch(`${API_URL}?endpoint=jkr-to-json`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ jkr_content: contentToSend })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (!result.success) {
            throw new Error(result.error);
        }

        return result.data;
    } catch (error) {
        console.error('Error converting JKR to JSON:', error);
        throw error;
    }
}

async function exportJkr() {
    try {
        if (!metaData.unlocked || !metaData.discovered || !metaData.alerted) {
            throw new Error('metaData structure is invalid');
        }

        showNotification('Converting to JKR...', 'info');

        const jkrContent = await jsonToJkr(metaData);

        const blob = jkrContent instanceof Uint8Array
            ? new Blob([jkrContent], { type: 'application/octet-stream' })
            : new Blob([jkrContent], { type: 'text/plain' });

        if (window.showSaveFilePicker) {
            try {
                const fileHandle = await window.showSaveFilePicker({
                    suggestedName: 'meta.jkr',
                    types: [{
                        description: 'Balatro Save File',
                        accept: { 'application/octet-stream': ['.jkr'] }
                    }]
                });
                const writable = await fileHandle.createWritable();
                await writable.write(blob);
                await writable.close();
                showNotification('meta.jkr exported successfully!', 'success');
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
            link.download = 'meta.jkr';
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            setTimeout(() => {
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            }, 100);
            showNotification('meta.jkr exported successfully!', 'success');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

async function importJkr(file) {
    const reader = new FileReader();
    reader.onload = async (event) => {
        try {
            showNotification('Converting JKR...', 'info');
            const arrayBuffer = event.target.result;
            const uint8Array = new Uint8Array(arrayBuffer);
            const jsonData = await jkrToJson(uint8Array);
            
            console.log('=== RAW JKR DATA ===');
            console.log('Full jsonData:', jsonData);
            
            // Verificar la estructura
            console.log('Has unlocked?', jsonData.hasOwnProperty('unlocked'));
            console.log('Has discovered?', jsonData.hasOwnProperty('discovered'));
            console.log('Has alerted?', jsonData.hasOwnProperty('alerted'));
            
            // Contar estados ANTES de asignar
            if (jsonData.unlocked && jsonData.discovered) {
                const unlockedCount = Object.keys(jsonData.unlocked).filter(k => jsonData.unlocked[k] === true).length;
                const discoveredOnlyCount = Object.keys(jsonData.discovered).filter(k => 
                    jsonData.discovered[k] === true && jsonData.unlocked[k] !== true
                ).length;
                const totalDiscovered = Object.keys(jsonData.discovered).filter(k => jsonData.discovered[k] === true).length;
                
                console.log('Import counts:', {
                    unlocked: unlockedCount,
                    discoveredOnly: discoveredOnlyCount,
                    totalDiscovered: totalDiscovered
                });
                
                // Mostrar algunas muestras
                console.log('Sample discovered items:', Object.keys(jsonData.discovered).slice(0, 10).map(k => ({
                    id: k,
                    discovered: jsonData.discovered[k],
                    unlocked: jsonData.unlocked[k]
                })));
            }
            
            // Asignar correctamente los datos importados
            metaData.unlocked = jsonData.unlocked || {};
            metaData.discovered = jsonData.discovered || {};
            metaData.alerted = jsonData.alerted || {};
            
            // Verificar después de asignar
            console.log('After assignment:', {
                unlockedKeys: Object.keys(metaData.unlocked).length,
                discoveredKeys: Object.keys(metaData.discovered).length,
                alertedKeys: Object.keys(metaData.alerted).length
            });
            
            renderCategory(currentCategory);
            showNotification('meta.jkr imported successfully!', 'success');
        } catch (error) {
            console.error('Import error:', error);
            showNotification('Error importing JKR: ' + error.message, 'error');
        }
    };
    reader.readAsArrayBuffer(file);
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 24px;
        background: ${type === 'success' ? 'var(--success)' : type === 'error' ? 'var(--danger)' : 'var(--accent-primary)'};
        color: white;
        border-radius: 10px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
        z-index: 9999;
        animation: slideIn 0.3s ease;
        font-weight: 500;
    `;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

async function loadMetaJSON() {
    try {
        showSkeletonLoading();
        const response = await fetch('data/meta.json');
        const data = await response.json();
        
        // Asignar correctamente cada propiedad
        metaData.unlocked = data.unlocked || {};
        metaData.discovered = data.discovered || {};
        metaData.alerted = data.alerted || {};
        
        await new Promise(resolve => setTimeout(resolve, 300));
        renderCategory(currentCategory);
    } catch (error) {
        console.error('Error loading meta.json:', error);
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
            <div class="skeleton-grid">
                ${skeletonCards}
            </div>
        </div>
    `;
}

function formatName(id) {
    return id
        .replace(/^(j_|c_|v_|b_|m_|e_|tag_|bl_|p_)/, '')
        .replace(/_/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
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

function getImageUrl(id, category) {
    const name = formatName(id);
    const wikiName = name.replace(/ /g, '_');
    const cleanId = id.replace(/^(j_|v_|c_|m_|e_|bl_|tag_)/, '');

    const baseUrl = 'https://balatrowiki.org/images/';
    const buildUrl = (file) => `${baseUrl}${file}`;

    const specialCasesMap = {
        jokers: {
            'joker': 'Joker.png',
            'stencil': 'Joker_Stencil.png',
            'trousers': 'Spare_Trousers.png',
            'mime': 'Mime.png',
            'cloud_9': 'Cloud_9.png',
            'mail': 'Mail-In_Rebate.png',
            'four_fingers': 'Four_Fingers.png',
            'seance': 'Séance.png',
            'mr_bones': 'Mr._Bones.png',
            'caino': 'Canio.png',
            'chaos': 'Chaos_the_Clown.png',
            'drivers_license': "Driver's_License.png",
            'baseball': 'Baseball_Card.png',
            'business': 'Business_Card.png',
            'trading': 'Trading_Card.png',
            'flash': 'Flash_Card.png',
            'gift': 'Gift_Card.png',
            'ceremonial': 'Ceremonial_Dagger.png',
            'perkeo': 'Perkeo.png',
            'chicot': 'Chicot.png',
            'triboulet': 'Triboulet.png',
            'yorick': 'Yorick.png',
            'idol': 'The_Idol.png',
            'family': 'The_Family.png',
            'order': 'The_Order.png',
            'tribe': 'The_Tribe.png',
            'delayed_grat': 'Delayed_Gratification.png',
            'gluttenous_joker': 'Gluttonous_Joker.png',
            'duo': 'The_Duo.png',
            'trio': 'The_Trio.png',
            'oops': 'Oops!_All_6s.png',
            'dna': 'DNA.png',
            'hit_the_road': 'Hit_the_Road.png',
            'ride_the_bus': 'Ride_the_Bus.png',
            'riff_raff': 'Riff-Raff.png',
            'ring_master': 'Showman.png',
            'selzer': 'Seltzer.png',
            'smiley': 'Smiley_Face.png',
            'sock_and_buskin': 'Sock_and_Buskin.png',
            'shoot_the_moon': 'Shoot_the_Moon.png',
            'ticket': 'Golden_Ticket.png',
            'to_the_moon': 'To_the_Moon.png',
            'todo_list': 'To_Do_List.png'
        },
        vouchers: {
            'directors_cut': "Director's_Cut.png",
            'overstock_norm': 'Overstock.png'
        },
        planets: { 'soul': 'The_Soul.png' },
        spectrals: { 'soul': 'The_Soul.png' },
        modifiers: {
            'negative': 'Joker_(Negative).png',
            'base': 'Joker.png'
        },
        blinds: {
            'small': 'Small_Blind.png',
            'big': 'Big_Blind.png',
            'final_acorn': 'Amber_Acorn.png',
            'final_bell': 'Verdant_Leaf.png',
            'final_heart': 'Violet_Vessel.png',
            'final_leaf': 'Crimson_Heart.png',
            'final_vessel': 'Cerulean_Bell.png'
        },
        tags: {
            'top_up': 'Top-up_Tag.png',
            'd_six': 'D6_Tag.png',
            'skip': 'Speed_Tag.png',
            'holo': 'Holographic_Tag.png'
        },
        tarots: {
            'death': 'Death.png',
            'heirophant': 'The_Hierophant.png',
            'justice': 'Justice.png',
            'strength': 'Strength.png',
            'temperance': 'Temperance.png',
            'wheel_of_fortune': 'The_Wheel_of_Fortune.png',
            'judgement': 'Judgement.png'
        }
    };

    if (specialCasesMap[category]?.[cleanId]) {
        return buildUrl(specialCasesMap[category][cleanId]);
    }
    switch (category) {
        case 'jokers':
            return buildUrl(`${wikiName}_Joker.png`);
        case 'vouchers':
            return buildUrl(`${wikiName}.png`);
        case 'decks':
            return buildUrl(`${wikiName}_Deck.png`);
        case 'planets':
        case 'spectrals':
            return buildUrl(`${wikiName}.png`);
        case 'modifiers':
        case (id.startsWith('m_') || id.startsWith('e_') ? 'extra' : ''):
            if (id.startsWith('m_')) return buildUrl(`${wikiName}_Card.png`);
            return buildUrl(`${wikiName}.png`);
        case 'blinds':
            return buildUrl(`The_${wikiName}.png`);
        case 'tags':
            return buildUrl(`${wikiName}_Tag.png`);
        case 'tarots':
            return buildUrl(`The_${wikiName}.png`);
        default:
            return buildUrl(`${wikiName}.png`);
    }
}

function getItemsForCategory(category) {
    const cat = categories[category];
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
        return [...new Set(items)].sort(); // Eliminar duplicados
    }

    // Para categorías normales, iterar sobre TODAS las keys que existen
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
        }
        else if (cat.isSeal && key === 'soul') {
            items.push(key);
        }
        else if (key.startsWith(cat.prefix) && !key.startsWith('p_')) {
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
    return [...new Set(items)].sort(); // Eliminar duplicados
}

function renderCategory(category) {
    currentCategory = category;
    const container = document.getElementById('content-container');
    
    // Si es la categoría profile, usar el renderer de profile
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

    // Código existente para otras categorías...
    showCategorySkeletonLoading(category);

    setTimeout(() => {
        let items = getItemsForCategory(category);

        if (searchTerm) {
            items = items.filter(item => {
                const name = formatName(item).toLowerCase();
                return name.includes(searchTerm.toLowerCase());
            });
        }

        const cat = categories[category];
        const allItems = getItemsForCategory(category);
        const unlocked = allItems.filter(item => metaData.unlocked[item] === true).length;
        const discovered = allItems.filter(item => metaData.discovered[item] === true && metaData.unlocked[item] !== true).length;
        const total = allItems.length;

        container.innerHTML = `
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

        document.querySelectorAll('.item-card').forEach(card => {
            card.addEventListener('click', () => toggleItem(card.dataset.id));
        });

        loadImagesQuietly();
    }, 150);
}

function loadImagesQuietly() {
    document.querySelectorAll('img[data-src]').forEach(img => {
        const originalUrl = img.dataset.src;
        const id = img.dataset.id;
        const category = img.dataset.category;
        
        tryLoadImage(img, originalUrl, id, category);
    });
}

function tryLoadImage(imgElement, url, id, category) {
    const testImg = new Image();
    
    testImg.onload = function() {
        imgElement.src = url;
        imgElement.removeAttribute('data-src');
    };
    
    testImg.onerror = function() {
        // Intentar URL alternativa para jokers
        if (category === 'jokers') {
            const name = formatName(id);
            const wikiName = name.replace(/ /g, '_');
            
            let alternativeUrl;
            if (url.includes('_Joker.png')) {
                alternativeUrl = `https://balatrowiki.org/images/${wikiName}.png`;
            } else {
                alternativeUrl = `https://balatrowiki.org/images/${wikiName}_Joker.png`;
            }
            
            // Intentar la URL alternativa
            const testImg2 = new Image();
            testImg2.onload = function() {
                imgElement.src = alternativeUrl;
                imgElement.removeAttribute('data-src');
            };
            testImg2.onerror = function() {
                // Si ambas fallan, mostrar placeholder
                imgElement.src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22%3E%3Crect fill=%22%23333%22 width=%22100%22 height=%22100%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 fill=%22%23666%22 text-anchor=%22middle%22 dy=%22.3em%22 font-size=%2212%22%3E?%3C/text%3E%3C/svg%3E';
                imgElement.removeAttribute('data-src');
            };
            testImg2.src = alternativeUrl;
        } else {
            // Para otras categorías, mostrar placeholder directamente
            imgElement.src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22%3E%3Crect fill=%22%23333%22 width=%22100%22 height=%22100%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 fill=%22%23666%22 text-anchor=%22middle%22 dy=%22.3em%22 font-size=%2212%22%3E?%3C/text%3E%3C/svg%3E';
            imgElement.removeAttribute('data-src');
        }
    };
    
    testImg.src = url;
}

function showCategorySkeletonLoading(category) {
    const container = document.getElementById('content-container');
    const cat = categories[category];
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
            <div class="skeleton-grid">
                ${skeletonCards}
            </div>
        </div>
    `;
}

function getItemState(id) {
    const unlocked = metaData.unlocked[id];
    const discovered = metaData.discovered[id];
    
    if (unlocked === true) {
        return 'unlocked';
    } else if (discovered === true && unlocked !== true) {
        return 'discovered';
    } else {
        return 'locked';
    }
}

function createItemCard(id, category) {
    const state = getItemState(id);
    const name = formatName(id);
    const imgUrl = getImageUrl(id, category);

    return `
        <div class="item-card ${state}" data-id="${id}">
            <div class="status-badge"></div>
            <img data-src="${imgUrl}" data-id="${id}" data-category="${category}" alt="${name}" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23333' width='100' height='100'/%3E%3C/svg%3E">
            <div class="item-name">${name}</div>
            <div class="state-indicator">${state === 'unlocked' ? 'Unlocked' : state === 'discovered' ? 'Discovered' : 'Locked'}</div>
        </div>
    `;
}

function toggleItem(id) {
    const currentState = getItemState(id);
    
    // Ciclo: locked -> discovered -> unlocked -> locked
    if (currentState === 'locked') {
        metaData.discovered[id] = true;
        metaData.unlocked[id] = false;
    } else if (currentState === 'discovered') {
        metaData.discovered[id] = true;
        metaData.unlocked[id] = true;
        metaData.alerted[id] = true;
    } else { // unlocked
        metaData.discovered[id] = false;
        metaData.unlocked[id] = false;
        metaData.alerted[id] = false;
    }

    // Actualizar solo la carta específica sin re-renderizar todo
    const card = document.querySelector(`[data-id="${id}"]`);
    if (card) {
        const newState = getItemState(id);
        
        // Remover todas las clases de estado
        card.classList.remove('locked', 'discovered', 'unlocked');
        
        // Agregar la nueva clase de estado
        card.classList.add(newState);
        
        // Actualizar el indicador de estado
        const stateIndicator = card.querySelector('.state-indicator');
        if (stateIndicator) {
            stateIndicator.textContent = newState === 'unlocked' ? 'Unlocked' : 
                                         newState === 'discovered' ? 'Discovered' : 
                                         'Locked';
        }
    }

    // Actualizar solo las estadísticas
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

function exportJSON() {
    const dataStr = JSON.stringify(metaData, null, 4);
    const blob = new Blob([dataStr], { type: 'application/json' });

    if (window.showSaveFilePicker) {
        window.showSaveFilePicker({
            suggestedName: 'meta.json',
            types: [{
                description: 'JSON File',
                accept: { 'application/json': ['.json'] }
            }]
        }).then(async (fileHandle) => {
            const writable = await fileHandle.createWritable();
            await writable.write(blob);
            await writable.close();
            showNotification('meta.json exported successfully!', 'success');
        }).catch((err) => {
            if (err.name !== 'AbortError') {
                console.error('Save error:', err);
                fallbackDownload(blob, 'meta.json');
            } else {
                showNotification('Export cancelled', 'info');
            }
        });
    } else {
        fallbackDownload(blob, 'meta.json');
    }
}

function fallbackDownload(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }, 100);
    showNotification(`${filename} exported successfully!`, 'success');
}