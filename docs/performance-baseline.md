# Performance Baseline Draft (v1)

## Scope
Core learning flow only:
- 3D Simulator initial entry
- Kepler Lab interaction (slider + canvas redraw)
- Dynamics Lab interaction (thrust click + metric update)

## Metrics
1. **Initial Load (LCP-like proxy)**
   - Target: <= 2.5s on desktop dev machine
   - Warning: 2.5s ~ 4.0s
   - Fail: > 4.0s

2. **Interactive Responsiveness (input -> visible update)**
   - Target: <= 120ms for slider/button reaction
   - Warning: 120ms ~ 250ms
   - Fail: > 250ms

3. **Render Smoothness (FPS proxy)**
   - Target: median >= 50 FPS during normal interaction
   - Warning: 35 ~ 49 FPS
   - Fail: < 35 FPS

## Measurement Procedure (Manual v0)
1. Open Chrome latest, clear cache (or hard reload)
2. Record Performance panel for each flow segment (10~15s)
3. Capture:
   - first meaningful paint timestamp
   - input event to next frame latency
   - FPS lane median estimate
4. Store findings in release note appendix

## Reporting Format
- Environment: device / browser / resolution
- Segment: simulator|kepler|dynamics
- Load(ms), Interaction(ms), FPS(median)
- Verdict: pass|warning|fail
- Notes: bottleneck suspicion

## Next Step
Automate part of this baseline with Playwright + trace collection once smoke E2E is available.
