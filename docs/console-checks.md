# Console Error Hardening Checks

## Goal
Keep core flow (`3D -> Kepler -> Dynamics`) free from runtime console errors in latest Chrome.

## Automated quick check

```bash
bash scripts/console-checks.sh
```

This check verifies:
- no top-level `throw new Error(...)` remains in runtime UI modules
- key DOM ids referenced in labs still exist in `index.html`

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