#!/usr/bin/env node
const { chromium } = require('playwright');
const { waitForBaseUrl } = require('./wait-for-base-url');

const BASE_URL = process.env.SMOKE_BASE_URL || 'http://127.0.0.1:4173';

async function sampleUpdates(page, selector, sampleMs = 3000) {
  await page.waitForSelector(selector);
  return page.evaluate(
    ({ selector, sampleMs }) =>
      new Promise((resolve) => {
        const node = document.querySelector(selector);
        if (!node) return resolve({ updates: 0, hz: 0, sampleMs });
        let updates = 0;
        const observer = new MutationObserver(() => {
          updates += 1;
        });
        observer.observe(node, { childList: true, characterData: true, subtree: true });
        const start = performance.now();
        setTimeout(() => {
          observer.disconnect();
          const elapsed = performance.now() - start;
          resolve({ updates, hz: updates / (elapsed / 1000), sampleMs: elapsed });
        }, sampleMs);
      }),
    { selector, sampleMs }
  );
}

(async () => {
  await waitForBaseUrl(BASE_URL);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  try {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 20000 });

    await page.click('.mode-tab[data-tab="kepler"]');
    await page.waitForSelector('#kepler-view:not([hidden])');
    const kepler = await sampleUpdates(page, '#kepler-r', 3000);

    await page.click('.mode-tab[data-tab="dynamics"]');
    await page.waitForSelector('#dynamics-view:not([hidden])');
    const dynamics = await sampleUpdates(page, '#dyn-e', 3000);

    const preThrottleAssumedHz = 60;

    console.log('[ok] hud throttle snapshot');
    console.log(
      JSON.stringify(
        {
          preThrottleAssumedHz,
          kepler: {
            updates: kepler.updates,
            measuredHz: Number(kepler.hz.toFixed(2)),
            inferredThrottleMs: Number((1000 / Math.max(kepler.hz, 0.0001)).toFixed(1))
          },
          dynamics: {
            updates: dynamics.updates,
            measuredHz: Number(dynamics.hz.toFixed(2)),
            inferredThrottleMs: Number((1000 / Math.max(dynamics.hz, 0.0001)).toFixed(1))
          }
        },
        null,
        2
      )
    );
  } catch (err) {
    console.error('[fail] hud throttle snapshot failed');
    console.error(err.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
