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

## Remaining Risks
1. **No automated browser E2E tests yet**
   - Risk: regressions in interaction behavior may reappear.
2. **Physics-education copy tuning still iterative**
   - Risk: wording may need classroom feedback to optimize clarity.
3. **Mobile UX is minimum baseline**
   - Risk: advanced controls still dense on very small devices.

## Recommended Next
- Add Playwright smoke checks for tab switch + key interaction paths.
- Add optional compact mobile mode for lab controls.
- Expand guided missions/quizzes after stabilization.