#!/usr/bin/env node
const { chromium } = require('playwright');
const { waitForBaseUrl } = require('./wait-for-base-url');

const BASE_URL = process.env.SMOKE_BASE_URL || 'http://127.0.0.1:4173';

const num = (text) => {
  const m = String(text || '').replace(/,/g, '').match(/-?\d+(\.\d+)?/);
  return m ? Number(m[0]) : NaN;
};

(async () => {
  await waitForBaseUrl(BASE_URL);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const errors = [];

  try {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 20000 });

    // Kepler calculation consistency: T^2 ~= a^3 and feedback formatting
    await page.click('.mode-tab[data-tab="kepler"]');
    await page.waitForSelector('#kepler-view:not([hidden])');

    await page.locator('#kepler-a').evaluate((el) => {
      el.value = '1.6';
      el.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await page.locator('#kepler-e').evaluate((el) => {
      el.value = '0.2';
      el.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await page.waitForTimeout(100);

    const t2 = num(await page.locator('#kepler-t2').innerText());
    const a3 = num(await page.locator('#kepler-a3').innerText());
    if (!Number.isFinite(t2) || !Number.isFinite(a3) || Math.abs(t2 - a3) > 0.02) {
      throw new Error(`Kepler T²/a³ mismatch: t2=${t2}, a3=${a3}`);
    }

    const lawCheck = (await page.locator('#kepler-law-check').innerText()).trim();
    if (!lawCheck.includes('T²/a³') || !lawCheck.includes('~1')) {
      throw new Error(`Kepler law-check text missing expected tokens: ${lawCheck}`);
    }

    await page.waitForTimeout(1200);
    const areaCount = Number((await page.locator('#kepler-area-count').innerText()).trim());
    if (!Number.isFinite(areaCount) || areaCount < 1) {
      throw new Error(`Kepler area sample count not increasing: ${areaCount}`);
    }

    const keplerFeedback = (await page.locator('#kepler-feedback').innerText()).trim();
    if (keplerFeedback.split('|').length !== 3) {
      throw new Error(`Kepler feedback segment count expected 3: ${keplerFeedback}`);
    }

    // Dynamics calculation/feedback consistency
    await page.click('.mode-tab[data-tab="dynamics"]');
    await page.waitForSelector('#dynamics-view:not([hidden])');

    await page.locator('#dyn-force').evaluate((el) => {
      el.value = '9';
      el.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await page.locator('#dyn-mass').evaluate((el) => {
      el.value = '4.5';
      el.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await page.waitForTimeout(80);

    const acc = num(await page.locator('#dyn-acc').innerText());
    if (!Number.isFinite(acc) || Math.abs(acc - 2) > 0.03) {
      throw new Error(`Dynamics acceleration mismatch: acc=${acc}, expected 2.00`);
    }

    const reaction = (await page.locator('#dyn-reaction').innerText()).trim();
    if (!reaction.includes('9.0')) {
      throw new Error(`Dynamics reaction text missing force value: ${reaction}`);
    }

    const dynFeedback = (await page.locator('#dyn-feedback').innerText()).trim();
    if (dynFeedback.split('|').length !== 3) {
      throw new Error(`Dynamics feedback segment count expected 3: ${dynFeedback}`);
    }

    console.log('[ok] calculation/feedback lightweight regression passed');
    console.log(`[detail] t2=${t2.toFixed(3)} a3=${a3.toFixed(3)} acc=${acc.toFixed(2)} areaCount=${areaCount}`);
  } catch (err) {
    errors.push(`[regression-lite] ${err.message}`);
  }

  await browser.close();

  if (errors.length) {
    console.error('[fail] calculation/feedback lightweight regression failed');
    for (const err of errors) console.error(' -', err);
    process.exit(1);
  }
})();
