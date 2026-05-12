let profileData = null;
let editMode = false;

const REQUIRED_PROFILE_KEYS = [
    'name',
    'career_stats',
    'high_scores',
    'progress',
    'challenge_progress'
];

function validateProfileData(data) {
    const errors = [];
    if (data.unlocked || data.discovered || data.alerted) {
        return {
            valid: false,
            error: 'This is a meta.jkr file, not a profile.jkr file. Please select your profile.jkr file instead.'
        };
    }
    REQUIRED_PROFILE_KEYS.forEach(key => {
        if (!data.hasOwnProperty(key)) {
            errors.push('Missing required key: ' + key);
        }
    });
    if (data.career_stats && typeof data.career_stats !== 'object') {
        errors.push('career_stats must be an object');
    }
    if (data.high_scores && typeof data.high_scores !== 'object') {
        errors.push('high_scores must be an object');
    }
    if (data.progress) {
        if (!data.progress.challenges) errors.push('progress.challenges is missing');
        if (!data.progress.deck_stakes) errors.push('progress.deck_stakes is missing');
    }
    if (errors.length > 0) {
        return { valid: false, error: 'Invalid profile.jkr structure:\n' + errors.join('\n') };
    }
    return { valid: true };
}

function isProfileMode() {
    return currentCategory === 'profile';
}

function toggleEditMode() {
    editMode = !editMode;
    const editBtn = document.getElementById('toggle-edit-btn');
    const allInputs = document.querySelectorAll('.profile-input, .stat-value-input, .progress-input, .editable-stat');
    if (editMode) {
        editBtn.innerHTML = '<i class="fa-solid fa-lock-open"></i> Editing';
        editBtn.classList.add('editing');
        allInputs.forEach(input => input.removeAttribute('readonly'));
    } else {
        editBtn.innerHTML = '<i class="fa-solid fa-pen-to-square"></i> Edit Mode';
        editBtn.classList.remove('editing');
        allInputs.forEach(input => input.setAttribute('readonly', 'true'));
    }
}

function renderProfile() {
    const container = document.getElementById('content-container');
    if (!profileData) {
        container.innerHTML = `
            <div class="profile-empty">
                <div class="empty-icon"><i class="fa-solid fa-user"></i></div>
                <h2>No Profile Loaded</h2>
                <p>Import your Balatro profile.jkr to view and edit your stats</p>
                <div style="background: var(--bg-secondary); padding: 16px; border-radius: 8px; margin: 20px auto; max-width: 500px; border: 1px solid var(--border);">
                    <p style="font-size: 12px; color: var(--text-secondary); margin-bottom: 12px;">
                        <i class="fa-solid fa-circle-info"></i> <strong>File Location:</strong><br>
                        Windows: <code>C:\\Users\\YourName\\AppData\\Roaming\\Balatro\\profile.jkr</code><br>
                        Mac: <code>~/Library/Application Support/Balatro/profile.jkr</code><br>
                        Linux: <code>~/.local/share/Balatro/profile.jkr</code>
                    </p>
                </div>
                <label for="import-profile-jkr" class="control-btn primary" style="margin: 20px auto; width: 200px; cursor: pointer; font-size:13px;">
                    <i class="fa-solid fa-upload"></i> Import profile.jkr
                    <input type="file" id="import-profile-jkr" accept=".jkr" style="display: none;">
                </label>
            </div>
        `;
        const profileInput = document.getElementById('import-profile-jkr');
        if (profileInput) {
            profileInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) importProfileJkr(file);
            });
        }
        return;
    }

    container.innerHTML = `
        <div class="profile-container">
            <div class="profile-header">
                <div class="profile-name-section">
                    <h2><i style="color:#FFD700" class="fa-solid fa-crown"></i> Player Profile</h2>
                    <input type="text" id="player-name" class="profile-input" value="${profileData.name || 'Player'}" placeholder="Player Name" readonly>
                </div>
                <div class="profile-controls">
                    <button style="font-size:13px;" id="toggle-edit-btn" class="control-btn">
                        <i class="fa-solid fa-pen-to-square"></i> Edit Mode
                    </button>
                    <button style="font-size:13px;" id="save-profile" class="control-btn primary">
                        <i class="fa-solid fa-floppy-disk"></i> Save & Export
                    </button>
                </div>
            </div>

            <div class="profile-section">
                <h3><i class="fa-solid fa-trophy"></i> High Scores</h3>
                <div class="stats-grid">${renderHighScores()}</div>
            </div>

            <div class="profile-section">
                <h3><i class="fa-solid fa-ranking-star"></i> Career Statistics</h3>
                <div class="stats-grid">${renderCareerStats()}</div>
            </div>

            <div class="profile-section">
                <h3><i class="fa-solid fa-bars-progress"></i> Progress</h3>
                <div class="progress-grid">${renderProgress()}</div>
            </div>

            ${profileData.MEMORY ? `
            <div class="profile-section">
                <h3><i class="fa-solid fa-clock-rotate-left"></i> Last Session</h3>
                <div class="stats-grid">${renderMemory()}</div>
            </div>` : ''}

            ${profileData.deck_usage ? `
            <div class="profile-section">
                <h3><i class="fa-solid fa-clone"></i> Deck Statistics</h3>
                <div class="deck-stakes-grid">${renderDeckUsage()}</div>
            </div>` : ''}

            ${profileData.joker_usage ? `
            <div class="profile-section">
                <h3><i class="fa-solid fa-theater-masks"></i> Top 10 Jokers Used</h3>
                <div class="table-container">${renderTopJokers()}</div>
            </div>` : ''}

            ${profileData.hand_usage ? `
            <div class="profile-section">
                <h3><i class="fa-solid fa-hand-back-fist"></i> Hand Types Played</h3>
                <div class="stats-grid">${renderHandUsage()}</div>
            </div>` : ''}

            ${profileData.consumeable_usage ? `
            <div class="profile-section">
                <h3><i class="fa-solid fa-star-and-crescent"></i> Top 10 Consumables Used</h3>
                <div class="table-container">${renderTopConsumables()}</div>
            </div>` : ''}

            ${profileData.challenge_progress ? `
            <div class="profile-section">
                <h3><i class="fa-solid fa-list-check"></i> Challenge Progress</h3>
                <div class="challenge-grid">${renderChallengeProgress()}</div>
            </div>` : ''}
        </div>
    `;
    attachProfileEventListeners();
}

function renderHighScores() {
    if (!profileData.high_scores) return '<p>No high scores data</p>';
    const scores = profileData.high_scores;
    const items = [
        { key: 'furthest_ante', label: 'Highest Ante', icon: '<i class="fa-solid fa-meteor"></i>' },
        { key: 'furthest_round', label: 'Highest Round', icon: '<i class="fa-solid fa-rotate"></i>' },
        { key: 'hand', label: 'Best Hand', icon: '<i class="fa-solid fa-hand-back-fist"></i>' },
        { key: 'most_money', label: 'Most Money', icon: '<i class="fa-solid fa-money-check-dollar"></i>' },
        { key: 'win_streak', label: 'Best Win Streak', icon: '<i class="fa-solid fa-fire"></i>' },
        { key: 'boss_streak', label: 'Boss Streak', icon: '<i class="fa-solid fa-skull"></i>' },
        { key: 'collection', label: 'Collection', icon: '<i class="fa-solid fa-layer-group"></i>' }
    ];
    return items.map(item => {
        const score = scores[item.key];
        if (!score) return '';
        return `
            <div class="stat-card">
                <div class="stat-icon">${item.icon}</div>
                <div class="stat-content">
                    <div class="stat-label">${item.label}</div>
                    <input type="number" class="stat-value-input" data-path="high_scores.${item.key}.amt" value="${score.amt || 0}"${item.key === 'collection' ? ' max="340"' : ''} readonly>
                    ${item.key === 'collection' ? '<span class="stat-total">/ ' + (score.tot || 340) + '</span>' : ''}
                </div>
            </div>
        `;
    }).join('');
}

function renderCareerStats() {
    if (!profileData.career_stats) return '<p>No career stats data</p>';
    const stats = profileData.career_stats;
    const items = [
        { key: 'c_wins', label: 'Wins', icon: '<i class="fa-solid fa-square-check"></i>' },
        { key: 'c_losses', label: 'Losses', icon: '<i class="fa-solid fa-square-xmark"></i>' },
        { key: 'c_rounds', label: 'Rounds Played', icon: '<i class="fa-solid fa-retweet"></i>' },
        { key: 'c_hands_played', label: 'Hands Played', icon: '<i class="fa-solid fa-dice-six"></i>' },
        { key: 'c_cards_played', label: 'Cards Played', icon: '<i class="fa-solid fa-gamepad"></i>' },
        { key: 'c_cards_discarded', label: 'Cards Discarded', icon: '<i class="fa-solid fa-trash-can"></i>' },
        { key: 'c_dollars_earned', label: 'Dollars Earned', icon: '<i class="fa-solid fa-sack-dollar"></i>' },
        { key: 'c_shop_dollars_spent', label: 'Shop Spending', icon: '<i class="fa-solid fa-cart-shopping"></i>' },
        { key: 'c_jokers_sold', label: 'Jokers Sold', icon: '<i class="fa-solid fa-theater-masks"></i>' },
        { key: 'c_vouchers_bought', label: 'Vouchers Bought', icon: '<i class="fa-solid fa-ticket-simple"></i>' }
    ];
    return items.map(item => `
        <div class="stat-card">
            <div class="stat-icon">${item.icon}</div>
            <div class="stat-content">
                <div class="stat-label">${item.label}</div>
                <input type="number" class="stat-value-input" data-path="career_stats.${item.key}" value="${stats[item.key] || 0}" readonly>
            </div>
        </div>
    `).join('');
}

function renderProgress() {
    if (!profileData.progress) return '<p>No progress data</p>';
    const progress = profileData.progress;
    return `
        <div class="progress-card">
            <div class="progress-item">
                <span>Challenges Completed</span>
                <div class="progress-bar-container">
                    <div class="progress-bar" style="width: ${(progress.challenges?.tally || 0) / (progress.challenges?.of || 20) * 100}%"></div>
                </div>
                <div class="progress-values">
                    <input type="number" class="progress-input" data-path="progress.challenges.tally" value="${progress.challenges?.tally || 0}" max="20" readonly> /
                    <span>${progress.challenges?.of || 20}</span>
                </div>
            </div>
            <div class="progress-item">
                <span>Deck Stakes</span>
                <div class="progress-bar-container">
                    <div class="progress-bar" style="width: ${(progress.deck_stakes?.tally || 0) / (progress.deck_stakes?.of || 120) * 100}%"></div>
                </div>
                <div class="progress-values">
                    <input type="number" class="progress-input" data-path="progress.deck_stakes.tally" value="${progress.deck_stakes?.tally || 0}" max="120" readonly> /
                    <span>${progress.deck_stakes?.of || 120}</span>
                </div>
            </div>
            <div class="progress-item">
                <span>Joker Stickers</span>
                <div class="progress-bar-container">
                    <div class="progress-bar" style="width: ${(progress.joker_stickers?.tally || 0) / (progress.joker_stickers?.of || 1200) * 100}%"></div>
                </div>
                <div class="progress-values">
                    <input type="number" class="progress-input" data-path="progress.joker_stickers.tally" value="${progress.joker_stickers?.tally || 0}" max="1200" readonly> /
                    <span>${progress.joker_stickers?.of || 1200}</span>
                </div>
            </div>
            <div class="progress-item">
                <span>Items Discovered</span>
                <div class="progress-bar-container">
                    <div class="progress-bar" style="width: ${(progress.discovered?.tally || 0) / (progress.discovered?.of || 340) * 100}%"></div>
                </div>
                <div class="progress-values">
                    <input type="number" class="progress-input" data-path="progress.discovered.tally" value="${progress.discovered?.tally || 0}" max="340" readonly> /
                    <span>${progress.discovered?.of || 340}</span>
                </div>
            </div>
        </div>
    `;
}

function renderMemory() {
    if (!profileData.MEMORY) return '';
    const memory = profileData.MEMORY;
    return `
        <div class="stat-card">
            <div class="stat-icon"><i class="fa-solid fa-clone"></i></div>
            <div class="stat-content">
                <div class="stat-label">Last Deck Used</div>
                <div class="stat-value">${memory.deck || 'Unknown'}</div>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon"><i class="fa-solid fa-layer-group"></i></div>
            <div class="stat-content">
                <div class="stat-label">Last Stake</div>
                <input type="number" class="editable-stat" data-path="MEMORY.stake" value="${memory.stake || 1}" min="1" max="8" readonly>
            </div>
        </div>
    `;
}

function renderDeckUsage() {
    if (!profileData.deck_usage) return '';
    const decks = profileData.deck_usage;
    const deckNames = {
        'b_red': 'Red Deck', 'b_blue': 'Blue Deck', 'b_yellow': 'Yellow Deck',
        'b_green': 'Green Deck', 'b_black': 'Black Deck', 'b_magic': 'Magic Deck',
        'b_nebula': 'Nebula Deck', 'b_ghost': 'Ghost Deck', 'b_abandoned': 'Abandoned Deck',
        'b_checkered': 'Checkered Deck', 'b_zodiac': 'Zodiac Deck', 'b_painted': 'Painted Deck',
        'b_anaglyph': 'Anaglyph Deck', 'b_plasma': 'Plasma Deck', 'b_erratic': 'Erratic Deck'
    };
    return Object.keys(decks).map(deckId => {
        const deck = decks[deckId];
        const totalWins = Object.values(deck.wins || {}).reduce((a, b) => a + b, 0);
        const totalLosses = Object.values(deck.losses || {}).reduce((a, b) => a + b, 0);
        const winRate = totalWins + totalLosses > 0 ? (totalWins / (totalWins + totalLosses) * 100).toFixed(1) : 0;
        return `
            <div class="deck-card">
                <h4><i class="fa-solid fa-clone"></i> ${deckNames[deckId] || deckId}</h4>
                <div class="deck-stats">
                    <div class="deck-stat"><span>Wins:</span><span class="stat-value">${totalWins}</span></div>
                    <div class="deck-stat"><span>Losses:</span><span class="stat-value">${totalLosses}</span></div>
                    <div class="deck-stat"><span>Win Rate:</span><span class="stat-value">${winRate}%</span></div>
                    <div class="deck-stat"><span>Times Used:</span><span class="stat-value">${deck.count || 0}</span></div>
                </div>
            </div>
        `;
    }).join('');
}

function renderTopJokers() {
    if (!profileData.joker_usage) return '';
    const jokers = Object.entries(profileData.joker_usage)
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 10);
    return `
        <table class="stats-table">
            <thead>
                <tr>
                    <th><i class="fa-solid fa-hashtag"></i></th>
                    <th><i class="fa-solid fa-theater-masks"></i> Joker</th>
                    <th><i class="fa-solid fa-repeat"></i> Used</th>
                    <th><i class="fa-solid fa-trophy"></i> Wins</th>
                    <th><i class="fa-solid fa-skull"></i> Losses</th>
                    <th><i class="fa-solid fa-percent"></i> Win Rate</th>
                </tr>
            </thead>
            <tbody>
                ${jokers.map(([id, data], index) => {
                    const wins = Object.values(data.wins || {}).reduce((a, b) => a + b, 0);
                    const losses = Object.values(data.losses || {}).reduce((a, b) => a + b, 0);
                    const winRate = wins + losses > 0 ? ((wins / (wins + losses)) * 100).toFixed(1) : 0;
                    return `
                        <tr>
                            <td>${index + 1}</td>
                            <td>${formatProfileName(id)}</td>
                            <td><input type="number" class="editable-stat tiny" data-path="joker_usage.${id}.count" value="${data.count}" readonly></td>
                            <td>${wins}</td>
                            <td>${losses}</td>
                            <td>${winRate}%</td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;
}

function renderHandUsage() {
    if (!profileData.hand_usage) return '';
    const hands = Object.entries(profileData.hand_usage).sort((a, b) => b[1].count - a[1].count);
    return hands.map(([handType, data]) => `
        <div class="stat-card">
            <div class="stat-icon"><i class="fa-solid fa-hand-back-fist"></i></div>
            <div class="stat-content">
                <div class="stat-label">${data.order}</div>
                <input type="number" class="stat-value-input" data-path="hand_usage.${handType}.count" value="${data.count}" readonly>
            </div>
        </div>
    `).join('');
}

function renderTopConsumables() {
    if (!profileData.consumeable_usage) return '';
    const consumables = Object.entries(profileData.consumeable_usage)
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 10);
    return `
        <table class="stats-table">
            <thead>
                <tr>
                    <th><i class="fa-solid fa-hashtag"></i></th>
                    <th><i class="fa-solid fa-star-and-crescent"></i> Card</th>
                    <th><i class="fa-solid fa-repeat"></i> Times Used</th>
                </tr>
            </thead>
            <tbody>
                ${consumables.map(([id, data], index) => `
                    <tr>
                        <td>${index + 1}</td>
                        <td>${formatProfileName(id)}</td>
                        <td><input type="number" class="editable-stat tiny" data-path="consumeable_usage.${id}.count" value="${data.count}" readonly></td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function renderChallengeProgress() {
    if (!profileData.challenge_progress) return '';
    const completed = profileData.challenge_progress.completed || {};
    const challenges = [
        'c_five_card_1', 'c_mad_world_1', 'c_monolith_1', 'c_inflation_1', 'c_luxury_1',
        'c_medusa_1', 'c_double_nothing_1', 'c_cruelty_1', 'c_golden_needle_1', 'c_fragile_1',
        'c_blast_off_1', 'c_knife_1', 'c_omelette_1', 'c_non_perishable_1', 'c_xray_1',
        'c_jokerless_1', 'c_bram_poker_1', 'c_city_1', 'c_rich_1', 'c_typecast_1'
    ];
    return challenges.map(challengeId => {
        const isCompleted = completed[challengeId] === true;
        return `
            <div class="challenge-item ${isCompleted ? 'completed' : ''}" data-challenge="${challengeId}">
                <i class="fa-solid ${isCompleted ? 'fa-square-check' : 'fa-square'}"></i>
                <span>${formatProfileName(challengeId)}</span>
            </div>
        `;
    }).join('');
}

function attachProfileEventListeners() {
    const editBtn = document.getElementById('toggle-edit-btn');
    if (editBtn) editBtn.addEventListener('click', toggleEditMode);

    const playerNameInput = document.getElementById('player-name');
    if (playerNameInput) {
        playerNameInput.addEventListener('change', (e) => {
            profileData.name = e.target.value;
        });
    }

    document.querySelectorAll('.stat-value-input, .progress-input, .editable-stat').forEach(input => {
        input.addEventListener('change', (e) => {
            const path = e.target.dataset.path;
            const value = parseFloat(e.target.value) || 0;
            setNestedValue(profileData, path, value);
            if (path.startsWith('progress.')) renderProfile();
        });
    });

    document.querySelectorAll('.challenge-item').forEach(item => {
        item.addEventListener('click', function () {
            if (!editMode) return;
            const challengeId = this.dataset.challenge;
            const isCompleted = this.classList.contains('completed');
            if (!profileData.challenge_progress) profileData.challenge_progress = { completed: {} };
            if (!profileData.challenge_progress.completed) profileData.challenge_progress.completed = {};
            profileData.challenge_progress.completed[challengeId] = !isCompleted;
            this.classList.toggle('completed');
            const icon = this.querySelector('i');
            if (icon) icon.className = !isCompleted ? 'fa-solid fa-square-check' : 'fa-solid fa-square';
            const completedCount = Object.values(profileData.challenge_progress.completed).filter(v => v === true).length;
            if (profileData.progress && profileData.progress.challenges) {
                profileData.progress.challenges.tally = completedCount;
            }
        });
    });

    const saveBtn = document.getElementById('save-profile');
    if (saveBtn) saveBtn.addEventListener('click', exportProfileJkr);
}

async function importProfileJkr(file) {
    try {
        showNotification('Loading profile...', 'info');
        const arrayBuffer = await readFileAsArrayBuffer(file);
        const uint8Array = new Uint8Array(arrayBuffer);
        const jsonData = await jkrToJson(uint8Array);
        const validation = validateProfileData(jsonData);
        if (!validation.valid) {
            showNotification(validation.error, 'error');
            return;
        }
        profileData = JSON.parse(JSON.stringify(jsonData));
        renderProfile();
        showNotification('Profile loaded successfully!', 'success');
    } catch (error) {
        showNotification('Error loading profile: ' + error.message, 'error');
    }
}

async function exportProfileJkr() {
    try {
        if (!profileData) {
            showNotification('No profile data to export', 'error');
            return;
        }
        const validation = validateProfileData(profileData);
        if (!validation.valid) {
            showNotification('Cannot export: ' + validation.error, 'error');
            return;
        }
        showNotification('Exporting profile...', 'info');
        const jkrContent = await jsonToJkr(profileData);
        const blob = new Blob([jkrContent], { type: 'application/octet-stream' });
        await exportBlob(blob, 'profile.jkr', 'Profile exported successfully!');
    } catch (error) {
        showNotification('Error exporting profile: ' + error.message, 'error');
    }
}
