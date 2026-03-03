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

4. **Main-thread Blocking (Long Task/TBT proxy)**
   - Target: interaction sweep 기준 `tbtApproxMs <= 500ms`
   - Warning: `501 ~ 1000ms`
   - Fail: `> 1000ms`

## Measurement Procedure

### A) Automated quick snapshot (v1)
1. 로컬 서버 실행 (`python3 -m http.server 4173`)
2. `npm run perf:snapshot`
3. 출력값 기록:
   - `domContentLoadedMs`
   - `loadMs`
   - `fcpMs`

### B) Automated blocking-time snapshot (v1)
1. 로컬 서버 실행 (`python3 -m http.server 4173`)
2. `npm run perf:longtask`
3. 출력값 기록:
   - `longTaskCount`
   - `totalLongTaskMs`
   - `tbtApproxMs`
   - `maxLongTaskMs`

### C) Manual deep check (v0)
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

## Latest Snapshot (2026-03-02, local headless chromium)
- domContentLoadedMs: **1810ms**
- loadMs: **1810ms**
- fcpMs: **248ms**
- quick verdict: **load target(<=2.5s) 만족**

## Latest LongTask/TBT Proxy (2026-03-03, local headless chromium)
- loadMs: **1728ms**
- longTaskCount: **3**
- totalLongTaskMs: **1066ms**
- tbtApproxMs: **916ms**
- maxLongTaskMs: **800ms**
- quick verdict: **Warning 구간(501~1000ms)** → 초기 진입/탭 전환 시 메인스레드 블로킹 최적화 필요

## Throttling Change Before/After (HUD update)

최근 변경에서 HUD 텍스트 갱신 빈도를 제한해(Kepler `updateNewtonInfo`, Dynamics `renderConservation`) 렌더 루프 부담을 낮췄다.

### 기준
- **Before(가정)**: 매 프레임 갱신 (약 60Hz, ~16.7ms 간격)
- **After(코드 상한)**:
  - Kepler HUD: `>=100ms` 간격 (이론 최대 10Hz)
  - Dynamics HUD: `>=120ms` 간격 (이론 최대 8.33Hz)

### 측정 (2026-03-03, headless chromium, 3s observer)
- 실행: `node scripts/hud-throttle-snapshot.js`

| Segment | Before (assumed) | After (measured) | Change |
|---|---:|---:|---:|
| Kepler `#kepler-r` text updates | ~60 Hz | **9.63 Hz** (~103.8ms) | 약 **-83.9%** 빈도 감소 |
| Dynamics `#dyn-e` text updates | ~60 Hz | **7.32 Hz** (~136.7ms) | 약 **-87.8%** 빈도 감소 |

해석:
- HUD 텍스트/DOM 갱신 횟수 감소로 메인 스레드 작업량을 줄여, 캔버스 렌더링 우선순위를 유지하는 데 유리.
- 값 표시 지연은 100~140ms 수준으로 학습용 피드백 체감 품질에 큰 영향 없이 동작.

## Next Step
- Playwright trace 수집을 붙여 탭 전환 구간(3D→Kepler→Dynamics) interaction latency를 반자동 측정
- 모바일 viewport(390/430) 별도 baseline 추가
