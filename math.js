// Shared EXP Math Logic for ROX Calculator

function calculateWorldLevelBonus(playerLvl, worldLvl) {
    if (playerLvl < worldLvl) {
        const diff = (worldLvl - playerLvl) - 3;
        if (diff > 0) {
            const targetBonus = Math.min(500, diff * 10);
            return { multiplier: 1.0 + (targetBonus / 100), label: `+${targetBonus}% WL Bonus` };
        }
    } else if (playerLvl > worldLvl) {
        const diff = playerLvl - worldLvl;
        const penalty = Math.min(100, diff * 10);
        return { multiplier: Math.max(0, 1.0 - (penalty / 100)), label: `-${penalty}% WL Penalty` };
    }
    return { multiplier: 1.0, label: `Normal WL` };
}

function calculatePenalty(playerLvl, monsterLvl) {
    const diff = Math.abs(playerLvl - monsterLvl);
    if (diff <= 3) return { percentage: 1.0, class: 'pen-100', text: '100% (Normal)' };
    if (diff <= 6) return { percentage: 0.8, class: 'pen-80', text: '80% (Minor Penalty)' };
    if (diff <= 8) return { percentage: 0.6, class: 'pen-60', text: '60% (Penalty)' };
    if (diff <= 9) return { percentage: 0.4, class: 'pen-40', text: '40% (High Penalty)' };
    if (diff <= 10) return { percentage: 0.2, class: 'pen-20', text: '20% (Severe Penalty)' };
    return { percentage: 0.1, class: 'pen-10', text: '10% (Extreme Penalty)' };
}

function calculatePartyBonus(partySize, uniqueClasses) {
    if (partySize <= 1) return 1.0;
    const membersBonus = 1.0 + ((partySize - 1) * 0.10);
    const jobsBonus = 1.0 + ((uniqueClasses - 1) * 0.05);
    const totalBonus = membersBonus * jobsBonus;
    return totalBonus / partySize;
}

function calculateFinalExp(baseXp, penMult, wlMult, partyMult, isOdin = false) {
    let finalXp = Math.floor(baseXp * penMult * wlMult * partyMult);
    finalXp = Math.max(1, finalXp);
    if (isOdin) finalXp *= 6; // 1x Base + 5x Odin Bonus = 6x Total
    return finalXp;
}

// Export for Node.js environments (like our tests.js script)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        calculateWorldLevelBonus,
        calculatePenalty,
        calculatePartyBonus,
        calculateFinalExp
    };
}
