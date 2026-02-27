const testCases = [
    // 1. Initial extreme level gap checks against GamingPH limits
    { name: "Pecopeco", pLvl: 40, wLvl: 50, actBase: 467 }, // Scenario 1 (Perfect Match)
    { name: "Isis", pLvl: 55, wLvl: 50, mLvl: 58, actBase: 170 }, // Scenario 2 (GamingPH ignores penalty)
    { name: "Ambernite", pLvl: 20, wLvl: 50, mLvl: 24, mBase: 39, actBase: 115 }, // Scenario 3 (Corrected expected base given DB base=39)
    { name: "Golem", pLvl: 50, wLvl: 80, actBase: 958 }, // Scenario A

    // 2. User's Live Solo Data (Player 54, World 56)
    { name: "Argiope", pLvl: 54, wLvl: 56, mLvl: 52, actBase: 237, actJob: 237 },
    { name: "Stainer", pLvl: 54, wLvl: 56, mLvl: 31, actBase: 4, actJob: 4 },
    { name: "Flora", pLvl: 54, wLvl: 56, mLvl: 45, actBase: 78, actJob: 78 },
    { name: "Argos", pLvl: 54, wLvl: 56, mLvl: 42, actBase: 13, actJob: 22 },
    { name: "Metaller", pLvl: 54, wLvl: 56, mLvl: 44, actBase: 31, actJob: 19 },
    { name: "Pecopeco Egg", pLvl: 54, wLvl: 56, mLvl: 5, actBase: 2, actJob: 2 },
    { name: "Pecopeco", pLvl: 54, wLvl: 56, mLvl: 43, actBase: 27, actJob: 9 },
    { name: "Soldier Skeleton", pLvl: 54, wLvl: 56, mLvl: 51, actBase: 193, actJob: 116 },
    { name: "Matyr", pLvl: 54, wLvl: 56, mLvl: 49, actBase: 116, actJob: 116 },
    { name: "Mummy", pLvl: 54, wLvl: 56, mLvl: 56, actBase: 261, actJob: 87 },

    // 3. User's Live Party Data (Player 54, World 56, Party 5, Jobs 5)
    { name: "Argiope", pLvl: 54, wLvl: 56, pSize: 5, uClasses: 5, actBase: 79, actJob: 79, isParty: true },

    // 4. User's Live Party Data (Player 54, World 56, Party 5, Jobs 4)
    { name: "Argiope", pLvl: 54, wLvl: 56, pSize: 5, uClasses: 4, actBase: 76, actJob: 76, isParty: true },

    // 5. Odin's Blessing Test (Player 54, World 56, Solo, Odin Active)
    { name: "Argiope", pLvl: 54, wLvl: 56, mLvl: 52, isOdin: true, actBase: 1422, actJob: 1422 },
    { name: "Soldier Skeleton", pLvl: 54, wLvl: 56, mLvl: 51, isOdin: true, actBase: 1158, actJob: 696 },
    { name: "Mummy", pLvl: 54, wLvl: 56, mLvl: 56, isOdin: true, actBase: 1566, actJob: 522 }
];

if (typeof module !== 'undefined' && module.exports) {
    module.exports = testCases;
}
