# Cosmos Atlas 24H Queue

운영 규칙:
- 한 번에 1개 태스크만 수행
- 상태 전환마다 `#cosmos-lab` 보고: `[Task-ID] 상태 | 진행률 | 이슈 | 다음액션 | commit/push`
- 의미 있는 변경마다 commit + 즉시 push
- 외부 발신/파괴적 작업은 사용자 승인 없으면 중단 후 보고
- 막히면 15분 내 보류 처리 후 다음 태스크 진행

상태:
- TODO / DOING / DONE / BLOCKED

## Backlog

- [DONE] T01 콘솔 에러 제로 재점검(3개 핵심 화면)
- [DONE] T02 런타임 가드 누락 케이스 5개 추가
- [DONE] T03 콘솔 체크 스크립트 실행 가이드 보강
- [DONE] T04 Kepler Law 1 피드백 문구 정확도 보정
- [DONE] T05 Kepler Law 2 면적속도 설명+수치 보조
- [DONE] T06 Kepler Law 3 주기-반장축 상관 시각 강조
- [DONE] T07 Dynamics 힘/가속도 방향 피드백 강화
- [DONE] T08 Dynamics 에너지 드리프트 경고 기준 정리
- [DONE] T09 Dynamics 각운동량 안정도 표현 개선
- [DONE] T10 모바일 390px 패널 오버플로우 제거
- [DONE] T11 모바일 430px 버튼 탭 영역(>=44px) 보정
- [DONE] T12 모바일 세로/가로 전환 시 레이아웃 유지
- [DONE] T13 접근성: 버튼 aria-label 누락 점검/보완
- [DONE] T14 탭 전환 키보드 포커스 흐름 정리
- [DONE] T15 README 실행/검증 절차를 체크리스트화
- [DONE] T16 README 문제해결 섹션(자주 막힘 3개) 추가
- [DONE] T17 docs/mvp-plan.md와 실제 구현 간 갭 반영
- [DONE] T18 docs/release-note-v1-draft.md 리스크 상세화
- [DONE] T19 성능 측정 기준(FPS/초기 로드) 문서 초안
- [DONE] T20 성능 quick win 2개 반영
- [DONE] T21 코드 주석 정리(핵심 계산부 위주)
- [DONE] T22 중복 유틸 함수 정리(리팩터링 소규모)
- [BLOCKED] T23 최종 스모크 테스트(핵심 흐름 10분) (자동 스모크 통과, 최종 수동 브라우저 10분 검증 필요)
- [DONE] T24 24h 결과 요약 리포트 생성

### T23 수동 검증 체크리스트 (handoff)

수동 브라우저 10분 검증 시 아래 각 항목을 **PASS/FAIL**로 기록:

1. 탭 전환(3D → 케플러 → 동역학) 2회 반복 시 화면 깨짐/빈 화면 없음 (PASS 기준: 0회 오류)
2. Kepler Lab에서 `a`/`e` 슬라이더 조절 시 수치(`T, T², a³, F`)와 궤도 시각이 즉시 갱신 (PASS 기준: 2초 내 반영)
3. Dynamics Lab에서 `힘/질량` 조절 + `추력 1초 적용` 후 피드백(`a, v, drift`) 문구 갱신 (PASS 기준: 즉시 또는 1초 내 반영)
4. 콘솔 에러 확인 (PASS 기준: red error 0건, warning은 기록)
5. 모바일 폭(390px/430px)에서 패널 오버플로우/탭 터치 영역 문제 재발 없음 (PASS 기준: 재현 0건)

자동 스모크(Playwright, headless) 결과: 탭 전환 + 핵심 입력/피드백 갱신 + 콘솔/페이지 에러 0건 통과.

- [DONE] T25 Playwright 스모크 스크립트 정식화(scripts) + npm script 연결
- [DONE] T26 README에 자동 스모크 실행/해석 가이드 추가
- [DONE] T27 경량 성능 측정(초기 로드/FCP) 스크립트 초안 및 기준값 기록
- [DONE] T28 QA 문서(수동+자동 체크 매트릭스) 작성
