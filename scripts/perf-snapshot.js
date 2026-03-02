#!/usr/bin/env node
const { chromium } = require('playwright');

const BASE_URL = process.env.SMOKE_BASE_URL || 'http://127.0.0.1:4173';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto(BASE_URL, { waitUntil: 'load', timeout: 15000 });
  await page.waitForTimeout(1200);

  const metrics = await page.evaluate(() => {
    const nav = performance.getEntriesByType('navigation')[0];
    const paintEntries = performance.getEntriesByType('paint');
    const fcp = paintEntries.find((e) => e.name === 'first-contentful-paint');
    return {
      domContentLoadedMs: nav ? Math.round(nav.domContentLoadedEventEnd) : null,
      loadMs: nav ? Math.round(nav.loadEventEnd) : null,
      fcpMs: fcp ? Math.round(fcp.startTime) : null,
    };
  });

  await browser.close();

  console.log('[perf] baseUrl:', BASE_URL);
  console.log('[perf] domContentLoadedMs:', metrics.domContentLoadedMs);
  console.log('[perf] loadMs:', metrics.loadMs);
  console.log('[perf] fcpMs:', metrics.fcpMs);

  if (metrics.domContentLoadedMs == null || metrics.loadMs == null) {
    console.error('[fail] navigation timing unavailable');
    process.exit(1);
  }
})();
