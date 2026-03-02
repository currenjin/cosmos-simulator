# QA Matrix (v1)

## 1) Automated Checks

- `npm run check:console`
  - 목적: 런타임 throw 가드/핵심 DOM id 누락 탐지
  - 통과 기준: `[ok] console checks passed`

- `npm run smoke:browser`
  - 목적: 핵심 플로우(탭 전환, Kepler/Dynamics 제어, 피드백 갱신) 스모크
  - 통과 기준: `[ok] playwright smoke passed`

- `npm run perf:snapshot`
  - 목적: 초기 로드/FCP 경량 측정
  - 통과 기준: nav timing 값 출력 + load target(<=2.5s) 점검

## 2) Manual Checks (Release Gate)

| 항목 | 절차 | PASS 기준 | FAIL 예시 |
|---|---|---|---|
| 탭 전환 안정성 | 3D→Kepler→Dynamics 2회 반복 | 화면 깨짐/빈 화면 0건 | 탭 전환 후 캔버스 미표시 |
| Kepler 제어 반응 | `a/e` 슬라이더 조절 | 수치+시각 2초 내 갱신 | 수치 고정/궤도 미변경 |
| Dynamics 제어 반응 | 힘/질량 조절 + 추력 1초 적용 | `a,v,drift` 피드백 1초 내 반영 | 피드백 미갱신 |
| 콘솔 오류 | DevTools Console 확인 | red error 0건 | Uncaught/ReferenceError 발생 |
| 모바일 390/430 | 패널/버튼 터치 검증 | 오버플로우·탭 영역 문제 0건 | 버튼 잘림/터치 실패 |

## 3) Release Verdict Rule

- **PASS**: Automated 3종 모두 통과 + Manual 5항목 PASS
- **BLOCKED**: Automated 통과라도 Manual 미수행 또는 FAIL 존재
- **FAIL**: Automated 실패(즉시 수정 후 재검증)
