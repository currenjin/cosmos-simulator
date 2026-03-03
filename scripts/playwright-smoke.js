#!/usr/bin/env node
const { chromium } = require('playwright');
const { waitForBaseUrl } = require('./wait-for-base-url');

const BASE_URL = process.env.SMOKE_BASE_URL || 'http://127.0.0.1:4173';

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
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 15000 });

    await page.click('.mode-tab[data-tab="kepler"]');
    await page.waitForSelector('#kepler-view:not([hidden])');
    await page.locator('#kepler-a').evaluate((el) => {
      el.value = '1.8';
      el.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await page.locator('#kepler-e').evaluate((el) => {
      el.value = '0.3';
      el.dispatchEvent(new Event('input', { bubbles: true }));
    });

    await page.click('.mode-tab[data-tab="dynamics"]');
    await page.waitForSelector('#dynamics-view:not([hidden])');
    await page.locator('#dyn-force').evaluate((el) => {
      el.value = '10';
      el.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await page.locator('#dyn-mass').evaluate((el) => {
      el.value = '2.0';
      el.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await page.click('#dyn-thrust-btn');
    await page.waitForTimeout(300);

    const keplerFeedback = (await page.locator('#kepler-feedback').innerText()).trim();
    const dynamicsFeedback = (await page.locator('#dyn-feedback').innerText()).trim();

    console.log('[smoke] kepler feedback:', keplerFeedback || '(empty)');
    console.log('[smoke] dynamics feedback:', dynamicsFeedback || '(empty)');
  } catch (err) {
    errors.push(`[smoke] ${err.message}`);
  }

  await browser.close();

  if (errors.length) {
    console.error('[fail] playwright smoke failed');
    for (const err of errors) console.error(' -', err);
    process.exit(1);
  }

  console.log('[ok] playwright smoke passed');
})();
