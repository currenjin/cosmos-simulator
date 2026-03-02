# Cosmos Atlas MVP Plan (Revised)

## Scope Objective
Deliver a stable learning flow: **3D Simulator -> Kepler Lab -> Dynamics Lab** with low-friction UX and deployable quality.

## Prioritized Tasks (with Definition of Done mapping)

1. **Console Error Hardening (P0)**
   - Work: remove crash-prone top-level throws, add runtime guards.
   - DoD: core flow usable without uncaught console errors.

2. **Console Check Routine (P0)**
   - Work: add script and checklist for repeatable error checks.
   - DoD: one-command local check + manual browser checklist documented.

3. **Kepler Guidance & Feedback Depth (P1)**
   - Work: add guidance + combined law feedback (3rd law ratio, area stability, gravity zone).
   - DoD: user gets immediate textual interpretation from interaction state.

4. **Dynamics Feedback Depth (P1)**
   - Work: add guidance + acceleration regime + conservation stability feedback.
   - DoD: user can tell if drift is stable/acceptable/high at a glance.

5. **Minimum Mobile Responsiveness (P1)**
   - Work: optimize small-screen spacing, panel density, button stacking, canvas minimum heights.
   - DoD: core flow operable on narrow viewport without overlap/clipping.

6. **README Flow Refresh (P2)**
   - Work: update current user flow and quality check section.
   - DoD: newcomer can run app and validate quality gates from README only.

7. **Release Note Draft v1 (P2)**
   - Work: summarize completed items, checklist, and remaining risks.
   - DoD: release communication draft ready for final editing.

8. **Milestone Commit+Push Discipline (P0 Process)**
   - Work: commit each meaningful milestone and push immediately.
   - DoD: each task transition traceable via commit hash and push status.

## Plan vs Implementation Gap (2026-03-02)

### Closed / Mostly Closed
- Console error hardening + check routine is operational (`scripts/console-checks.sh` passes).
- Kepler feedback depth improved with law-3 scaling emphasis and on-canvas visual panel.
- Dynamics feedback depth improved with direction feedback + drift bands (`stable/watch/warning`).
- Mobile baseline improved for 390px overflow, 430px tap target(>=44px), and landscape orientation behavior.
- README now includes execution/verification checklist + troubleshooting top 3 blockers.

### Remaining Gaps (next queue focus)
1. **Release communication depth**: `docs/release-note-v1-draft.md` still needs richer risk detail and mitigation owner/action.
2. **Performance criteria formalization**: FPS/initial-load thresholds exist as intent but not yet unified into measurable acceptance gates.
3. **Refactor hygiene**: duplicate utility cleanup and comment normalization are not fully reflected in codebase.
4. **Final smoke + 24h report**: end-to-end 10-minute scenario and final summary artifacts still pending.

### Recommendation
Prioritize docs+quality closure (T18~T24) before further feature expansion to protect MVP release readiness.
