document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input');
    const sizeFilter = document.getElementById('size-filter');
    const elementFilter = document.getElementById('element-filter');
    const sortFilter = document.getElementById('sort-filter');
    const playerLevelInput = document.getElementById('player-level');
    const worldLevelInput = document.getElementById('world-level');
    const partySizeInput = document.getElementById('party-size');
    const uniqueClassesInput = document.getElementById('unique-classes');
    const odinBlessingInput = document.getElementById('odin-blessing');
    const monsterList = document.getElementById('monster-list');

    let monstersData = [];

    // Load monster data
    if (typeof window.ROX_MONSTERS_DATA !== 'undefined') {
        monstersData = window.ROX_MONSTERS_DATA;
        renderMonsters();
    } else {
        fetch('monsters.json')
            .then(response => response.json())
            .then(data => {
                monstersData = data;
                renderMonsters();
            })
            .catch(error => {
                console.error('Error loading monsters:', error);
                monsterList.innerHTML = '<div class="no-results">Error loading monster data. Make sure you are running a local server to fetch the JSON file.</div>';
            });
    }

    // Load saved settings
    const savedPlayerLevel = localStorage.getItem('rox_player_level');
    if (savedPlayerLevel) playerLevelInput.value = savedPlayerLevel;

    const savedWorldLevel = localStorage.getItem('rox_world_level');
    if (savedWorldLevel) worldLevelInput.value = savedWorldLevel;

    // Add event listeners
    const inputs = [searchInput, sizeFilter, elementFilter, sortFilter, playerLevelInput, worldLevelInput, partySizeInput, uniqueClassesInput, odinBlessingInput];
    inputs.forEach(input => {
        input.addEventListener('input', renderMonsters);
        input.addEventListener('change', renderMonsters);
    });

    // Enforce visual value clamping on the inputs when user finishes typing
    playerLevelInput.addEventListener('change', (e) => {
        e.target.value = Math.max(1, Math.min(150, parseInt(e.target.value) || 1));
        localStorage.setItem('rox_player_level', e.target.value);
        renderMonsters();
    });
    worldLevelInput.addEventListener('change', (e) => {
        e.target.value = Math.max(1, Math.min(150, parseInt(e.target.value) || 1));
        localStorage.setItem('rox_world_level', e.target.value);
        renderMonsters();
    });
    partySizeInput.addEventListener('change', (e) => {
        e.target.value = Math.max(1, Math.min(5, parseInt(e.target.value) || 1));
        renderMonsters();
    });
    uniqueClassesInput.addEventListener('change', (e) => {
        e.target.value = Math.max(1, Math.min(5, parseInt(e.target.value) || 1));
        renderMonsters();
    });

    function renderMonsters() {
        const searchTerm = searchInput.value.toLowerCase();
        const sizeVal = sizeFilter.value;
        const elementVal = elementFilter.value;
        const sortVal = sortFilter.value;

        // Parse and clamp values to sensible limits to prevent unexpected behavior
        const playerLvl = Math.max(1, Math.min(150, parseInt(playerLevelInput.value) || 1));
        const worldLvl = Math.max(1, Math.min(150, parseInt(worldLevelInput.value) || 1));
        const partySize = Math.max(1, Math.min(5, parseInt(partySizeInput.value) || 1));
        const uniqueClasses = Math.max(1, Math.min(5, parseInt(uniqueClassesInput.value) || 1));

        const isOdinActive = odinBlessingInput.checked;

        const filtered = monstersData.filter(m => {
            const matchesSearch = m.name.toLowerCase().includes(searchTerm) || m.location.toLowerCase().includes(searchTerm);
            const matchesSize = sizeVal === 'All' || m.size === sizeVal;
            const matchesElement = elementVal === 'All' || m.element === elementVal;
            return matchesSearch && matchesSize && matchesElement;
        });

        const wlBonusInfo = calculateWorldLevelBonus(playerLvl, worldLvl);
        const partyBonusMult = calculatePartyBonus(partySize, uniqueClasses);

        const calculated = filtered.map(m => {
            const penaltyInfo = calculatePenalty(playerLvl, m.level);

            // Apply all modifiers
            let finalBase = calculateFinalExp(m.base_xp, penaltyInfo.percentage, wlBonusInfo.multiplier, partyBonusMult, isOdinActive);
            let finalJob = calculateFinalExp(m.job_xp, penaltyInfo.percentage, wlBonusInfo.multiplier, partyBonusMult, isOdinActive);

            return {
                ...m,
                penaltyInfo,
                wlBonusInfo,
                baseTotal: finalBase,
                jobTotal: finalJob,
                combinedExp: finalBase + finalJob
            };
        });

        // Sort results
        calculated.sort((a, b) => {
            if (sortVal === 'base') {
                return b.baseTotal - a.baseTotal || a.level - b.level;
            } else if (sortVal === 'job') {
                return b.jobTotal - a.jobTotal || a.level - b.level;
            } else {
                return b.combinedExp - a.combinedExp || a.level - b.level; // Default sorting
            }
        });

        if (calculated.length === 0) {
            monsterList.innerHTML = '<div class="no-results">No monsters found matching your criteria.</div>';
            return;
        }

        let html = '';
        calculated.forEach(m => {
            html += `
                <div class="monster-row">
                    <div class="col-name">
                        <div class="m-name">${m.name}</div>
                        <div class="m-location">${m.location}</div>
                    </div>
                    <div class="col-level m-level">Lv. ${m.level}</div>
                    <div class="col-details">
                        <div class="m-tags">
                            <span class="tag">${m.size}</span>
                            <span class="tag">${m.element}</span>
                        </div>
                    </div>
                    <div class="col-base exp-val" style="color: var(--primary)">${m.baseTotal.toLocaleString()}</div>
                    <div class="col-job exp-val" style="color: #a78bfa">${m.jobTotal.toLocaleString()}</div>
                    <div class="col-penalty">
                        <span class="penalty-badge ${m.penaltyInfo.class}">${m.penaltyInfo.text}</span>
                        ${wlBonusInfo.multiplier !== 1.0 ? `<div style="font-size: 0.7rem; color: var(--accent); margin-top: 4px; text-align: center;">${wlBonusInfo.label}</div>` : ''}
                    </div>
                </div>
            `;
        });

        monsterList.innerHTML = html;
    }
});
