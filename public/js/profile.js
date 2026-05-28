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
            error: __('error.not_profile_file')
        };
    }
    REQUIRED_PROFILE_KEYS.forEach(key => {
        if (!data.hasOwnProperty(key)) {
            errors.push(__('error.missing_key', { key }));
        }
    });
    if (data.career_stats && typeof data.career_stats !== 'object') {
        errors.push(__('error.career_stats_type'));
    }
    if (data.high_scores && typeof data.high_scores !== 'object') {
        errors.push(__('error.high_scores_type'));
    }
    if (data.progress) {
        if (!data.progress.challenges) errors.push(__('error.challenges_missing'));
        if (!data.progress.deck_stakes) errors.push(__('error.deck_stakes_missing'));
    }
    if (errors.length > 0) {
        return { valid: false, error: __('error.invalid_profile', { details: errors.join('\n') }) };
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
        editBtn.innerHTML = `<i class="fa-solid fa-lock-open"></i> ${__('btn.editing')}`;
        editBtn.classList.add('editing');
        allInputs.forEach(input => input.removeAttribute('readonly'));
    } else {
        editBtn.innerHTML = `<i class="fa-solid fa-pen-to-square"></i> ${__('btn.edit_mode')}`;
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
                <h2>${__('state.no_profile')}</h2>
                <p>${__('state.no_profile_desc')}</p>
                <div style="background: var(--bg-secondary); padding: 16px; border-radius: 8px; margin: 20px auto; max-width: 500px; border: 1px solid var(--border);">
                    <p style="font-size: 12px; color: var(--text-secondary); margin-bottom: 12px;">
                        <i class="fa-solid fa-circle-info"></i> <strong>${__('footer.file_location')}</strong><br>
                        ${__('footer.windows_path')}<br>
                        ${__('footer.mac_path')}<br>
                        ${__('footer.linux_path')}
                    </p>
                </div>
                <label for="import-profile-jkr" class="control-btn primary" style="margin: 20px auto; width: 200px; cursor: pointer; font-size:13px;">
                    <i class="fa-solid fa-upload"></i> ${__('btn.import_profile')}
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
                    <h2><i style="color:#FFD700" class="fa-solid fa-crown"></i> ${__('section.player_profile')}</h2>
                    <input type="text" id="player-name" class="profile-input" value="${profileData.name || 'Player'}" placeholder="${__('placeholder.player_name')}" readonly>
                </div>
                <div class="profile-controls">
                    <button style="font-size:13px;" id="toggle-edit-btn" class="control-btn">
                        <i class="fa-solid fa-pen-to-square"></i> ${__('btn.edit_mode')}
                    </button>
                    <button style="font-size:13px;" id="save-profile" class="control-btn primary">
                        <i class="fa-solid fa-floppy-disk"></i> ${__('btn.save_export')}
                    </button>
                </div>
            </div>

            <div class="profile-section">
                <h3><i class="fa-solid fa-trophy"></i> ${__('section.high_scores')}</h3>
                <div class="stats-grid">${renderHighScores()}</div>
            </div>

            <div class="profile-section">
                <h3><i class="fa-solid fa-ranking-star"></i> ${__('section.career_stats')}</h3>
                <div class="stats-grid">${renderCareerStats()}</div>
            </div>

            <div class="profile-section">
                <h3><i class="fa-solid fa-bars-progress"></i> ${__('section.progress')}</h3>
                <div class="progress-grid">${renderProgress()}</div>
            </div>

            ${profileData.MEMORY ? `
            <div class="profile-section">
                <h3><i class="fa-solid fa-clock-rotate-left"></i> ${__('section.last_session')}</h3>
                <div class="stats-grid">${renderMemory()}</div>
            </div>` : ''}

            ${profileData.deck_usage ? `
            <div class="profile-section">
                <h3><i class="fa-solid fa-clone"></i> ${__('section.deck_stats')}</h3>
                <div class="deck-stakes-grid">${renderDeckUsage()}</div>
            </div>` : ''}

            ${profileData.joker_usage ? `
            <div class="profile-section">
                <h3><i class="fa-solid fa-theater-masks"></i> ${__('section.top_jokers')}</h3>
                <div class="table-container">${renderTopJokers()}</div>
            </div>` : ''}

            ${profileData.hand_usage ? `
            <div class="profile-section">
                <h3><i class="fa-solid fa-hand-back-fist"></i> ${__('section.hand_types')}</h3>
                <div class="stats-grid">${renderHandUsage()}</div>
            </div>` : ''}

            ${profileData.consumeable_usage ? `
            <div class="profile-section">
                <h3><i class="fa-solid fa-star-and-crescent"></i> ${__('section.top_consumables')}</h3>
                <div class="table-container">${renderTopConsumables()}</div>
            </div>` : ''}

            ${profileData.challenge_progress ? `
            <div class="profile-section">
                <h3><i class="fa-solid fa-list-check"></i> ${__('section.challenge_progress')}</h3>
                <div class="challenge-grid">${renderChallengeProgress()}</div>
            </div>` : ''}
        </div>
    `;
    attachProfileEventListeners();
}

function renderHighScores() {
    if (!profileData.high_scores) return `<p>${__('empty.no_high_scores')}</p>`;
    const scores = profileData.high_scores;
    const items = [
        { key: 'furthest_ante', label: __('stat.highest_ante'), icon: '<i class="fa-solid fa-meteor"></i>' },
        { key: 'furthest_round', label: __('stat.highest_round'), icon: '<i class="fa-solid fa-rotate"></i>' },
        { key: 'hand', label: __('stat.best_hand'), icon: '<i class="fa-solid fa-hand-back-fist"></i>' },
        { key: 'most_money', label: __('stat.most_money'), icon: '<i class="fa-solid fa-money-check-dollar"></i>' },
        { key: 'win_streak', label: __('stat.win_streak'), icon: '<i class="fa-solid fa-fire"></i>' },
        { key: 'boss_streak', label: __('stat.boss_streak'), icon: '<i class="fa-solid fa-skull"></i>' },
        { key: 'collection', label: __('stat.collection'), icon: '<i class="fa-solid fa-layer-group"></i>' }
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
    if (!profileData.career_stats) return `<p>${__('empty.no_career_stats')}</p>`;
    const stats = profileData.career_stats;
    const items = [
        { key: 'c_wins', label: __('stat.wins'), icon: '<i class="fa-solid fa-square-check"></i>' },
        { key: 'c_losses', label: __('stat.losses'), icon: '<i class="fa-solid fa-square-xmark"></i>' },
        { key: 'c_rounds', label: __('stat.rounds_played'), icon: '<i class="fa-solid fa-retweet"></i>' },
        { key: 'c_hands_played', label: __('stat.hands_played'), icon: '<i class="fa-solid fa-dice-six"></i>' },
        { key: 'c_cards_played', label: __('stat.cards_played'), icon: '<i class="fa-solid fa-gamepad"></i>' },
        { key: 'c_cards_discarded', label: __('stat.cards_discarded'), icon: '<i class="fa-solid fa-trash-can"></i>' },
        { key: 'c_dollars_earned', label: __('stat.dollars_earned'), icon: '<i class="fa-solid fa-sack-dollar"></i>' },
        { key: 'c_shop_dollars_spent', label: __('stat.shop_spending'), icon: '<i class="fa-solid fa-cart-shopping"></i>' },
        { key: 'c_jokers_sold', label: __('stat.jokers_sold'), icon: '<i class="fa-solid fa-theater-masks"></i>' },
        { key: 'c_vouchers_bought', label: __('stat.vouchers_bought'), icon: '<i class="fa-solid fa-ticket-simple"></i>' }
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
    if (!profileData.progress) return `<p>${__('empty.no_progress')}</p>`;
    const progress = profileData.progress;
    return `
        <div class="progress-card">
            <div class="progress-item">
                <span>${__('stat.challenges_completed')}</span>
                <div class="progress-bar-container">
                    <div class="progress-bar" style="width: ${(progress.challenges?.tally || 0) / (progress.challenges?.of || 20) * 100}%"></div>
                </div>
                <div class="progress-values">
                    <input type="number" class="progress-input" data-path="progress.challenges.tally" value="${progress.challenges?.tally || 0}" max="20" readonly> /
                    <span>${progress.challenges?.of || 20}</span>
                </div>
            </div>
            <div class="progress-item">
                <span>${__('stat.deck_stakes')}</span>
                <div class="progress-bar-container">
                    <div class="progress-bar" style="width: ${(progress.deck_stakes?.tally || 0) / (progress.deck_stakes?.of || 120) * 100}%"></div>
                </div>
                <div class="progress-values">
                    <input type="number" class="progress-input" data-path="progress.deck_stakes.tally" value="${progress.deck_stakes?.tally || 0}" max="120" readonly> /
                    <span>${progress.deck_stakes?.of || 120}</span>
                </div>
            </div>
            <div class="progress-item">
                <span>${__('stat.joker_stickers')}</span>
                <div class="progress-bar-container">
                    <div class="progress-bar" style="width: ${(progress.joker_stickers?.tally || 0) / (progress.joker_stickers?.of || 1200) * 100}%"></div>
                </div>
                <div class="progress-values">
                    <input type="number" class="progress-input" data-path="progress.joker_stickers.tally" value="${progress.joker_stickers?.tally || 0}" max="1200" readonly> /
                    <span>${progress.joker_stickers?.of || 1200}</span>
                </div>
            </div>
            <div class="progress-item">
                <span>${__('stat.items_discovered')}</span>
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
    const items = [
        { key: 'deck', label: __('stat.last_deck'), icon: 'fa-clone', plain: true, fallback: __('stat.unknown') },
        { key: 'stake', label: __('stat.last_stake'), icon: 'fa-layer-group', editable: true, min: 1, max: 8 },
        { key: 'furthest_ante', label: __('stat.highest_ante'), icon: 'fa-meteor' },
        { key: 'furthest_round', label: __('stat.highest_round'), icon: 'fa-rotate' },
        { key: 'most_money', label: __('stat.most_money'), icon: 'fa-money-check-dollar' },
    ];
    return items.map(item => {
        const val = memory[item.key];
        if (val === undefined || val === null) return '';
        return `
            <div class="stat-card">
                <div class="stat-icon"><i class="fa-solid ${item.icon}"></i></div>
                <div class="stat-content">
                    <div class="stat-label">${item.label}</div>
                    ${item.editable
                        ? `<input type="number" class="editable-stat" data-path="MEMORY.${item.key}" value="${val || 1}" min="${item.min}" max="${item.max}" readonly>`
                        : item.plain
                            ? `<div class="stat-value">${val ?? item.fallback}</div>`
                            : `<input type="number" class="stat-value-input" data-path="MEMORY.${item.key}" value="${val || 0}" readonly>`
                    }
                </div>
            </div>
        `;
    }).join('');
}

function renderDeckUsage() {
    if (!profileData.deck_usage) return '';
    const decks = profileData.deck_usage;
    const deckNames = {
        'b_red': __('deck.red'), 'b_blue': __('deck.blue'), 'b_yellow': __('deck.yellow'),
        'b_green': __('deck.green'), 'b_black': __('deck.black'), 'b_magic': __('deck.magic'),
        'b_nebula': __('deck.nebula'), 'b_ghost': __('deck.ghost'), 'b_abandoned': __('deck.abandoned'),
        'b_checkered': __('deck.checkered'), 'b_zodiac': __('deck.zodiac'), 'b_painted': __('deck.painted'),
        'b_anaglyph': __('deck.anaglyph'), 'b_plasma': __('deck.plasma'), 'b_erratic': __('deck.erratic')
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
                    <div class="deck-stat"><span>${__('stat.wins')}:</span><span class="stat-value">${totalWins}</span></div>
                    <div class="deck-stat"><span>${__('stat.losses')}:</span><span class="stat-value">${totalLosses}</span></div>
                    <div class="deck-stat"><span>${__('stat.win_rate')}</span><span class="stat-value">${winRate}%</span></div>
                    <div class="deck-stat"><span>${__('stat.total_rounds')}</span><span class="stat-value">${totalWins + totalLosses}</span></div>
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
                    <th><i class="fa-solid fa-theater-masks"></i> ${__('table.joker')}</th>
                    <th><i class="fa-solid fa-repeat"></i> ${__('table.used')}</th>
                    <th><i class="fa-solid fa-trophy"></i> ${__('table.wins')}</th>
                    <th><i class="fa-solid fa-skull"></i> ${__('table.losses')}</th>
                    <th><i class="fa-solid fa-percent"></i> ${__('table.win_rate')}</th>
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
                    <th><i class="fa-solid fa-star-and-crescent"></i> ${__('table.card')}</th>
                    <th><i class="fa-solid fa-repeat"></i> ${__('table.times_used')}</th>
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
            <div class="challenge-item ${isCompleted ? 'completed' : ''}" data-challenge="${challengeId}" tabindex="0" role="button">
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

    function toggleChallenge(item) {
        if (!editMode) return;
        const challengeId = item.dataset.challenge;
        const isCompleted = item.classList.contains('completed');
        if (!profileData.challenge_progress) profileData.challenge_progress = { completed: {} };
        if (!profileData.challenge_progress.completed) profileData.challenge_progress.completed = {};
        profileData.challenge_progress.completed[challengeId] = !isCompleted;
        item.classList.toggle('completed');
        const icon = item.querySelector('i');
        if (icon) icon.className = !isCompleted ? 'fa-solid fa-square-check' : 'fa-solid fa-square';
        const completedCount = Object.values(profileData.challenge_progress.completed).filter(v => v === true).length;
        if (profileData.progress && profileData.progress.challenges) {
            profileData.progress.challenges.tally = completedCount;
        }
    }

    document.querySelectorAll('.challenge-item').forEach(item => {
        item.addEventListener('click', () => toggleChallenge(item));
        item.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleChallenge(item);
            }
        });
    });

    const saveBtn = document.getElementById('save-profile');
    if (saveBtn) saveBtn.addEventListener('click', exportProfileJkr);
}

async function importProfileJkr(file) {
    try {
        showNotification(__('notif.loading_profile'), 'info');
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
        showNotification(__('notif.profile_loaded'), 'success');
    } catch (error) {
        showNotification(__('notif.profile_error', { message: error.message }), 'error');
    }
}

let _exportingProfile = false;

async function exportProfileJkr() {
    if (_exportingProfile) return;
    _exportingProfile = true;
    try {
        if (!profileData) {
            showNotification(__('notif.no_profile_data'), 'error');
            return;
        }
        const validation = validateProfileData(profileData);
        if (!validation.valid) {
            showNotification(__('notif.cannot_export', { message: validation.error }), 'error');
            return;
        }
        showNotification(__('notif.preparing_profile'), 'info');
        const jkrContent = await jsonToJkr(profileData);
        showNotification(__('notif.exporting_profile'), 'info');
        const blob = new Blob([jkrContent], { type: 'application/octet-stream' });
        await exportBlob(blob, 'profile.jkr', __('notif.exported_profile'));
    } catch (error) {
        showNotification(__('notif.profile_error', { message: error.message }), 'error');
    } finally {
        _exportingProfile = false;
    }
}
