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

- [TODO] T01 콘솔 에러 제로 재점검(3개 핵심 화면)
- [TODO] T02 런타임 가드 누락 케이스 5개 추가
- [TODO] T03 콘솔 체크 스크립트 실행 가이드 보강
- [TODO] T04 Kepler Law 1 피드백 문구 정확도 보정
- [TODO] T05 Kepler Law 2 면적속도 설명+수치 보조
- [TODO] T06 Kepler Law 3 주기-반장축 상관 시각 강조
- [TODO] T07 Dynamics 힘/가속도 방향 피드백 강화
- [TODO] T08 Dynamics 에너지 드리프트 경고 기준 정리
- [TODO] T09 Dynamics 각운동량 안정도 표현 개선
- [TODO] T10 모바일 390px 패널 오버플로우 제거
- [TODO] T11 모바일 430px 버튼 탭 영역(>=44px) 보정
- [TODO] T12 모바일 세로/가로 전환 시 레이아웃 유지
- [TODO] T13 접근성: 버튼 aria-label 누락 점검/보완
- [TODO] T14 탭 전환 키보드 포커스 흐름 정리
- [TODO] T15 README 실행/검증 절차를 체크리스트화
- [TODO] T16 README 문제해결 섹션(자주 막힘 3개) 추가
- [TODO] T17 docs/mvp-plan.md와 실제 구현 간 갭 반영
- [TODO] T18 docs/release-note-v1-draft.md 리스크 상세화
- [TODO] T19 성능 측정 기준(FPS/초기 로드) 문서 초안
- [TODO] T20 성능 quick win 2개 반영
- [TODO] T21 코드 주석 정리(핵심 계산부 위주)
- [TODO] T22 중복 유틸 함수 정리(리팩터링 소규모)
- [TODO] T23 최종 스모크 테스트(핵심 흐름 10분)
- [TODO] T24 24h 결과 요약 리포트 생성
