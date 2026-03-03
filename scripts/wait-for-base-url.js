#!/usr/bin/env node

async function waitForBaseUrl(baseUrl, { retries = 20, intervalMs = 500, timeoutMs = 3000 } = {}) {
  let lastError = null;

  for (let i = 0; i < retries; i += 1) {
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), timeoutMs);
      const res = await fetch(baseUrl, {
        method: 'GET',
        cache: 'no-store',
        signal: ctrl.signal,
      });
      clearTimeout(timer);

      if (res.ok) return true;
      lastError = new Error(`status ${res.status}`);
    } catch (err) {
      lastError = err;
    }

    await new Promise((r) => setTimeout(r, intervalMs));
  }

  throw new Error(`[base-url-unreachable] ${baseUrl} (${lastError ? lastError.message : 'unknown error'})`);
}

module.exports = { waitForBaseUrl };
