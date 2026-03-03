#!/usr/bin/env node
const { chromium } = require('playwright');

const BASE_URL = process.env.SMOKE_BASE_URL || 'http://127.0.0.1:4173';
const TBT_BUDGET_MS = Number(process.env.PERF_TBT_BUDGET_MS || 1000);
const MAX_LONGTASK_BUDGET_MS = Number(process.env.PERF_MAX_LONGTASK_BUDGET_MS || 900);

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.addInitScript(() => {
    window.__longTaskStats = {
      entries: [],
      supported: typeof PerformanceObserver !== 'undefined',
    };

    if (!window.__longTaskStats.supported) return;

    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          window.__longTaskStats.entries.push({
            startTime: entry.startTime,
            duration: entry.duration,
            name: entry.name,
          });
        }
      });
      observer.observe({ type: 'longtask', buffered: true });
      window.__longTaskStats.active = true;
    } catch (err) {
      window.__longTaskStats.active = false;
      window.__longTaskStats.error = String(err && err.message ? err.message : err);
    }
  });

  await page.goto(BASE_URL, { waitUntil: 'load', timeout: 15000 });
  await page.waitForTimeout(600);

  // Interaction sweep: tab switches + slider/button actions
  await page.click('.mode-tab[data-tab="kepler"]');
  await page.waitForSelector('#kepler-view:not([hidden])');
  await page.locator('#kepler-a').evaluate((el) => {
    el.value = '2.1';
    el.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await page.locator('#kepler-e').evaluate((el) => {
    el.value = '0.45';
    el.dispatchEvent(new Event('input', { bubbles: true }));
  });

  await page.click('.mode-tab[data-tab="dynamics"]');
  await page.waitForSelector('#dynamics-view:not([hidden])');
  await page.locator('#dyn-force').evaluate((el) => {
    el.value = '15';
    el.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await page.click('#dyn-thrust-btn');

  await page.click('.mode-tab[data-tab="simulator"]');
  await page.waitForTimeout(1000);

  const stats = await page.evaluate(() => {
    const nav = performance.getEntriesByType('navigation')[0];
    const longStats = window.__longTaskStats || { entries: [], supported: false };
    const entries = Array.isArray(longStats.entries) ? longStats.entries : [];
    const longTaskCount = entries.length;
    const totalLongTaskMs = entries.reduce((acc, cur) => acc + cur.duration, 0);
    const tbtApproxMs = entries.reduce((acc, cur) => acc + Math.max(0, cur.duration - 50), 0);
    const maxLongTaskMs = entries.reduce((max, cur) => Math.max(max, cur.duration), 0);

    return {
      longTaskSupported: !!longStats.supported,
      longTaskObserverActive: longStats.active !== false,
      longTaskError: longStats.error || null,
      longTaskCount,
      totalLongTaskMs: Math.round(totalLongTaskMs),
      tbtApproxMs: Math.round(tbtApproxMs),
      maxLongTaskMs: Math.round(maxLongTaskMs),
      loadMs: nav ? Math.round(nav.loadEventEnd) : null,
    };
  });

  await browser.close();

  console.log('[perf-longtask] baseUrl:', BASE_URL);
  console.log('[perf-longtask] supported:', stats.longTaskSupported);
  console.log('[perf-longtask] observerActive:', stats.longTaskObserverActive);
  console.log('[perf-longtask] loadMs:', stats.loadMs);
  console.log('[perf-longtask] longTaskCount:', stats.longTaskCount);
  console.log('[perf-longtask] totalLongTaskMs:', stats.totalLongTaskMs);
  console.log('[perf-longtask] tbtApproxMs:', stats.tbtApproxMs);
  console.log('[perf-longtask] maxLongTaskMs:', stats.maxLongTaskMs);
  console.log('[perf-longtask] budgets:', `tbt<=${TBT_BUDGET_MS}ms, maxLongTask<=${MAX_LONGTASK_BUDGET_MS}ms`);

  if (!stats.longTaskSupported || !stats.longTaskObserverActive) {
    console.error('[fail] long task observer not available:', stats.longTaskError || 'unsupported');
    process.exit(1);
  }

  const budgetErrors = [];
  if (stats.tbtApproxMs > TBT_BUDGET_MS) {
    budgetErrors.push(`tbtApproxMs ${stats.tbtApproxMs}ms > budget ${TBT_BUDGET_MS}ms`);
  }
  if (stats.maxLongTaskMs > MAX_LONGTASK_BUDGET_MS) {
    budgetErrors.push(`maxLongTaskMs ${stats.maxLongTaskMs}ms > budget ${MAX_LONGTASK_BUDGET_MS}ms`);
  }

  if (budgetErrors.length) {
    console.error('[fail] longtask budget exceeded');
    for (const err of budgetErrors) console.error(' -', err);
    process.exit(1);
  }

  console.log('[ok] longtask snapshot within budget');
})();
