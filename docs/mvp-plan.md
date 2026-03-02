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