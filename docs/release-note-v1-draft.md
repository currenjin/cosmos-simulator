# Release Note v1 (Draft)

## Summary
This revision focuses on **technical quality and learning feedback depth** for the core flow:
`3D Simulator -> Kepler Lab -> Dynamics Lab`.

## Completed Checklist
- [x] Hardened runtime initialization paths to reduce crash-prone failures
- [x] Added console-check script (`scripts/console-checks.sh`)
- [x] Added console check documentation (`docs/console-checks.md`)
- [x] Enhanced Kepler Lab guidance + real-time interpretation feedback
- [x] Enhanced Dynamics Lab guidance + conservation/acceleration feedback
- [x] Applied minimum mobile responsiveness improvements for core lab interactions
- [x] Updated README with latest flow and verification commands
- [x] Added revised MVP plan document (`docs/mvp-plan.md`)
- [x] Added Playwright UI state regression (`scripts/playwright-ui-state-regression.js`)
- [x] Added Playwright calculation/feedback regression (`scripts/playwright-calculation-regression.js`)
- [x] Added HUD throttling snapshot script + docs (`scripts/hud-throttle-snapshot.js`, `docs/performance-baseline.md`)

## Quality Notes
- Automated checks:
  - `npm run check:console`
  - `npm run smoke:browser`
  - `npm run test:ui-state`
  - `npm run test:calc-regression`
- Performance trend checks (recommended):
  - `npm run perf:snapshot`
  - `npm run perf:longtask`
  - `npm run perf:hud-throttle`
- Manual browser verification remains required for visual/interaction quality.
- CI workflow enable status: `docs/ci-workflow-enable.md` (PAT `workflow` scope 필요)

## Remaining Risks (Detailed)
1. **Final manual release smoke not yet completed (T23 BLOCKED)**
   - Likelihood: Medium
   - Impact: High (visual/layout edge regression may pass headless checks)
   - Trigger: last-mile browser/device differences, especially mobile viewport
   - Mitigation: complete 10-minute manual checklist (tab loop, sliders, thrust, console, 390/430)
   - Owner/ETA: human manual smoke before release cut

2. **Physics-learning copy still iterative**
   - Likelihood: Medium
   - Impact: Medium (conceptual misunderstanding despite technically correct simulation)
   - Trigger: first-time learner confusion on law interpretation text
   - Mitigation: run short classroom/user feedback loop, revise KR/EN copy in small batches
   - Owner/ETA: content+FE, after v1 rollout feedback week

3. **Mobile UX remains baseline (not optimized)**
   - Likelihood: Medium
   - Impact: Medium-High (small-screen operation fatigue, possible drop in completion)
   - Trigger: heavy use on 390px devices in portrait/landscape switching
   - Mitigation: compact mode, denser metric cards, prioritized controls for one-thumb flow
   - Owner/ETA: FE owner, v1.1 scope candidate

## Recommended Next
- Add Playwright smoke checks for tab switch + key interaction paths.
- Add optional compact mobile mode for lab controls.
- Expand guided missions/quizzes after stabilization.
