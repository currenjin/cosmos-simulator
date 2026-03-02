# Console Error Hardening Checks

## Goal
Keep core flow (`3D -> Kepler -> Dynamics`) free from runtime console errors in latest Chrome.

## Automated quick check

```bash
bash scripts/console-checks.sh
```

Expected success output:
```text
[check] top-level throw guard
[check] key DOM ids
[ok] console checks passed
```

This check verifies:
- no top-level `throw new Error(...)` remains in runtime UI modules
- key DOM ids referenced in labs still exist in `index.html`

## Failure handling guide

If the script fails, follow this order:
1. `throw new Error` failure:
   - replace top-level throw with guarded init (`console.warn + skip`) in affected module
2. missing DOM id failure:
   - either restore the id in `index.html`, or update module/script together with intentional rename
3. rerun script and only then proceed to manual browser check

## Manual browser check
1. Start local server
   ```bash
   python3 -m http.server 4173
   ```
2. Open `http://localhost:4173`
3. Open DevTools console and go through:
   - `#simulator`
   - `#kepler`
   - `#dynamics`
4. Trigger key interactions:
   - Kepler: change `e`, `a`, speed buttons, tutorial open
   - Dynamics: thrust, reset, tutorial open
5. Confirm: no uncaught errors (warnings allowed only for intentionally missing optional UI).