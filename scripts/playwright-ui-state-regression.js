#!/usr/bin/env node
const { chromium } = require('playwright');
const { waitForBaseUrl } = require('./wait-for-base-url');

const BASE_URL = process.env.SMOKE_BASE_URL || 'http://127.0.0.1:4173';

function parseFloatSafe(text) {
  const match = String(text || '').replace(/,/g, '').match(/-?\d+(\.\d+)?/);
  return match ? Number(match[0]) : NaN;
}

(async () => {
  await waitForBaseUrl(BASE_URL);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const errors = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(`[console] ${msg.text()}`);
  });
  page.on('pageerror', (err) => errors.push(`[pageerror] ${err.message}`));

  try {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 20000 });

    // Tab state update check
    await page.click('.mode-tab[data-tab="kepler"]');
    await page.waitForSelector('#kepler-view:not([hidden])');
    const keplerSelected = await page.getAttribute('.mode-tab[data-tab="kepler"]', 'aria-selected');
    if (keplerSelected !== 'true') throw new Error(`kepler tab aria-selected expected true, got ${keplerSelected}`);

    // Kepler number panel should react to slider input
    const beforeLaw3 = await page.locator('#kepler-law-check').innerText();
    await page.locator('#kepler-a').evaluate((el) => {
      el.value = '2.4';
      el.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await page.waitForTimeout(80);
    const afterLaw3 = await page.locator('#kepler-law-check').innerText();
    if (beforeLaw3.trim() === afterLaw3.trim()) {
      throw new Error('kepler-law-check text did not change after a-slider update');
    }

    const periodValue = parseFloatSafe(await page.locator('#kepler-period').innerText());
    const expectedT = Math.sqrt(2.4 ** 3);
    if (!Number.isFinite(periodValue) || Math.abs(periodValue - expectedT) > 0.03) {
      throw new Error(`kepler period mismatch: got ${periodValue}, expected ~${expectedT.toFixed(3)}`);
    }

    // Dynamics tab state + panel update check
    await page.click('.mode-tab[data-tab="dynamics"]');
    await page.waitForSelector('#dynamics-view:not([hidden])');
    const dynamicsSelected = await page.getAttribute('.mode-tab[data-tab="dynamics"]', 'aria-selected');
    if (dynamicsSelected !== 'true') throw new Error(`dynamics tab aria-selected expected true, got ${dynamicsSelected}`);

    await page.locator('#dyn-force').evaluate((el) => {
      el.value = '12';
      el.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await page.locator('#dyn-mass').evaluate((el) => {
      el.value = '3';
      el.dispatchEvent(new Event('input', { bubbles: true }));
    });

    const accText = await page.locator('#dyn-acc').innerText();
    const accValue = parseFloatSafe(accText);
    if (!Number.isFinite(accValue) || Math.abs(accValue - 4) > 0.03) {
      throw new Error(`dyn acceleration mismatch: got ${accValue}, expected 4.00`);
    }

    const beforeVel = parseFloatSafe(await page.locator('#dyn-vel').innerText());
    await page.click('#dyn-thrust-btn');
    await page.waitForTimeout(120);
    const afterVel = parseFloatSafe(await page.locator('#dyn-vel').innerText());
    if (!Number.isFinite(beforeVel) || !Number.isFinite(afterVel) || afterVel <= beforeVel) {
      throw new Error(`dyn velocity did not increase after thrust: before=${beforeVel}, after=${afterVel}`);
    }

    const dynFeedback = (await page.locator('#dyn-feedback').innerText()).trim();
    if (!dynFeedback || !dynFeedback.includes('|')) {
      throw new Error(`dyn feedback shape invalid: ${dynFeedback || '(empty)'}`);
    }

    console.log('[ok] ui state regression checks passed');
    console.log(`[detail] kepler period=${periodValue.toFixed(3)}, dynamics vel ${beforeVel.toFixed(2)} -> ${afterVel.toFixed(2)}`);
  } catch (err) {
    errors.push(`[regression] ${err.message}`);
  }

  await browser.close();

  if (errors.length) {
    console.error('[fail] ui state regression checks failed');
    for (const err of errors) console.error(' -', err);
    process.exit(1);
  }
})();
