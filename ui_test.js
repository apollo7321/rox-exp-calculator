const puppeteer = require('puppeteer');

const testCases = require('./test_cases.js');

async function runUITests() {
    console.log("Starting Puppeteer UI Tests...");
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    let passed = 0;
    let failed = 0;

    try {
        await page.goto('http://localhost:8080', { waitUntil: 'networkidle0' });

        for (let i = 0; i < testCases.length; i++) {
            const tc = testCases[i];

            // Set Player Level
            await page.evaluate((lvl) => {
                const el = document.getElementById('player-level');
                el.value = lvl;
                el.dispatchEvent(new Event('change'));
            }, tc.pLvl);

            // Set World Level
            await page.evaluate((lvl) => {
                const el = document.getElementById('world-level');
                el.value = lvl;
                el.dispatchEvent(new Event('change'));
            }, tc.wLvl);

            // Set Party Size
            await page.evaluate((size) => {
                const el = document.getElementById('party-size');
                el.value = size;
                el.dispatchEvent(new Event('change'));
            }, tc.pSize || 1);

            // Set Unique Classes
            await page.evaluate((classes) => {
                const el = document.getElementById('unique-classes');
                if (el) {
                    el.value = classes;
                    el.dispatchEvent(new Event('change'));
                }
            }, tc.uClasses || 1);

            // Toggle Odin
            if (tc.isOdin) {
                await page.evaluate(() => {
                    const el = document.getElementById('odin-blessing');
                    el.checked = true;
                    el.dispatchEvent(new Event('change'));
                });
            } else {
                await page.evaluate(() => {
                    const el = document.getElementById('odin-blessing');
                    el.checked = false;
                    el.dispatchEvent(new Event('change'));
                });
            }

            // Search for monster
            await page.evaluate((term) => {
                const el = document.getElementById('search-input');
                el.value = term;
                el.dispatchEvent(new Event('input'));
            }, tc.name);

            // Small delay to let UI render
            await new Promise(resolve => setTimeout(resolve, 100));

            // Extract results
            const results = await page.evaluate((tcName, tcLevel, tcActBase) => {
                let rows = Array.from(document.querySelectorAll('.monster-row'));
                if (rows.length === 0) return null;

                // Find the exact row if multiple matches (like Flora or Isis)
                let matchingRows = rows.filter(r => {
                    const name = r.querySelector('.m-name').textContent || '';
                    const levelText = r.querySelector('.m-level').textContent || '';
                    const level = parseInt(levelText.replace(/\D/g, ''));
                    return name.trim().toLowerCase() === tcName.toLowerCase() && (!tcLevel || level === tcLevel);
                });

                let row = matchingRows[0];
                if (!row) row = rows[0]; // fallback

                if (tcActBase && matchingRows.length > 1) {
                    let exact = matchingRows.find(r => parseInt(r.querySelector('.col-base').textContent.replace(/,/g, '')) === tcActBase);
                    if (exact) row = exact;
                }

                const baseText = row.querySelector('.col-base').textContent.replace(/,/g, '');
                const jobText = row.querySelector('.col-job').textContent.replace(/,/g, '');
                return {
                    base: parseInt(baseText),
                    job: parseInt(jobText)
                };
            }, tc.name, tc.mLvl, tc.actBase);

            if (!results) {
                console.log(`❌ UI Test #${i + 1} (${tc.name}): Failed - Monster not found in list`);
                failed++;
                continue;
            }

            let testPassed = true;
            // Validate Base EXP
            if (tc.actBase !== undefined && Math.abs(results.base - tc.actBase) > 1) {
                console.log(`❌ UI Test #${i + 1} (${tc.name}): Expected Base ${tc.actBase}, got ${results.base}`);
                testPassed = false;
            }

            // Validate Job EXP
            if (tc.actJob !== undefined && Math.abs(results.job - tc.actJob) > 1) {
                console.log(`❌ UI Test #${i + 1} (${tc.name}): Expected Job ${tc.actJob}, got ${results.job}`);
                testPassed = false;
            }

            if (testPassed) {
                console.log(`✅ UI Test #${i + 1} (${tc.name}): Passed`);
                passed++;
            } else {
                failed++;
            }
        }

    } catch (e) {
        console.error("Test execution failed:", e);
        failed++;
    } finally {
        await browser.close();
    }

    console.log(`\\n=== UI TEST RESULTS ===`);
    console.log(`Passed: ${passed} | Failed: ${failed}`);
    if (failed > 0) process.exit(1);
}

runUITests();
