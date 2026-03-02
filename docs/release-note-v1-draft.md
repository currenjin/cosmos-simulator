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
- [x] Updated README with latest flow and screenshot placeholders
- [x] Added revised MVP plan document (`docs/mvp-plan.md`)

## Quality Notes
- Automated quick check:
  - `bash scripts/console-checks.sh`
- Manual browser verification remains required for visual/interaction quality.

## Remaining Risks (Detailed)
1. **No automated browser E2E tests yet**
   - Likelihood: High
   - Impact: High (tab switching / interaction regressions can reach production unnoticed)
   - Trigger: refactor around mode events, canvas lifecycle, or i18n update paths
   - Mitigation: add smoke E2E for `3D -> Kepler -> Dynamics`, slider/button interactions, and no-console-error gate
   - Owner/ETA: FE owner, next sprint first half

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
