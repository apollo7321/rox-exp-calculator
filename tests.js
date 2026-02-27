const fs = require('fs');
const path = require('path');
const {
    calculateWorldLevelBonus,
    calculatePenalty,
    calculatePartyBonus,
    calculateFinalExp
} = require('./math.js');

const monsters = JSON.parse(fs.readFileSync('monsters.json', 'utf8'));
const tests = require('./test_cases.js');

// ---------------------------------------------------------
// UNIT TESTS REGISTRY
// ---------------------------------------------------------

let passed = 0;
let errors = [];

tests.forEach((tc, idx) => {
    // Find monster (allow overriding by level if multiple exist like Flora)
    let m = monsters.find(x => x.name.toLowerCase() === tc.name.toLowerCase() && (!tc.mLvl || x.level === tc.mLvl) && (!tc.mBase || x.base_xp === tc.mBase));
    if (!m) m = monsters.find(x => x.name.toLowerCase() === tc.name.toLowerCase() && (!tc.mLvl || x.level === tc.mLvl)); // fallback
    if (!m) m = monsters.find(x => x.name.toLowerCase() === tc.name.toLowerCase()); // deep fallback

    if (!m) {
        errors.push(`Test #${idx + 1} Failed: Monster ${tc.name} not found in DB.`);
        return;
    }

    const wlMult = calculateWorldLevelBonus(tc.pLvl, tc.wLvl).multiplier;
    const penMult = calculatePenalty(tc.pLvl, m.level).percentage;
    const partyMult = calculatePartyBonus(tc.pSize || 1, tc.uClasses || 1);
    const isOdin = tc.isOdin || false;

    const cBase = calculateFinalExp(m.base_xp, penMult, wlMult, partyMult, isOdin);

    // Check base
    if (tc.actBase !== undefined && Math.abs(cBase - tc.actBase) > 1) { // allow 1 exp rounding diff
        errors.push(`Test #${idx + 1} (${tc.name}): Expected Base ${tc.actBase}, got ${cBase}`);
    }

    // Check job
    if (tc.actJob !== undefined) {
        const cJob = calculateFinalExp(m.job_xp, penMult, wlMult, partyMult, isOdin);
        if (Math.abs(cJob - tc.actJob) > 1) { // allow 1 exp rounding diff
            errors.push(`Test #${idx + 1} (${tc.name}): Expected Job ${tc.actJob}, got ${cJob}`);
        }
    }

    if (errors.length === 0 || !errors[errors.length - 1].includes(`Test #${idx + 1}`)) {
        passed++;
    }
});

console.log(`=== UNIT TEST RESULTS ===`);
if (errors.length === 0) {
    console.log(`✅ All ${passed}/${tests.length} tests passed successfully!`);
} else {
    console.log(`❌ ${passed}/${tests.length} tests passed.`);
    console.log(`Failed Tests:`);
    errors.forEach(e => console.log("  - " + e));
    process.exit(1);
}
