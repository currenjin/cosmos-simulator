# COSMOS ATLAS

실제 하늘 시뮬레이터와 우주 물리 학습 랩을 제공하는 정적 웹앱입니다.

## 프로젝트 목적

- 관측 가능한 하늘 정보를 직관적으로 탐색한다.
- 케플러/뉴턴 물리를 인터랙션으로 학습한다.
- 설치 없이 브라우저에서 즉시 실행 가능한 학습 도구를 만든다.

## MVP 범위 (v1)

### 포함 (Must)

1. **하늘 시뮬레이터 기본 흐름**
   - 위치/날짜/시간 입력
   - 별/별자리/주요 천체 표시
   - 현재 시각 동기화
2. **학습 랩 2종**
   - Kepler Lab: 케플러 3법칙 핵심 상호작용
   - Dynamics Lab: 뉴턴 3법칙/보존법칙 기본 시뮬레이션
3. **기본 사용성**
   - 탭 기반 내비게이션(3D/Kepler/Dynamics)
   - 언어(한/영) + 단위 전환
4. **배포 가능 상태**
   - 정적 서버에서 실행 가능
   - GitHub Pages 자동 배포 가능

### 제외 (Not in MVP)

- 사용자 계정/로그인
- 학습 진도 저장/클라우드 동기화
- 모바일 앱 패키징
- 고급 천체 데이터 확장(대규모 카탈로그, 망원경 제어 연동)

## MVP 완료 조건 (Definition of Done)

- [ ] 처음 방문 사용자가 5분 안에 `하늘 보기 → Kepler Lab 실행 → Dynamics Lab 실행` 가능
- [ ] 콘솔 에러 없이 주요 기능 동작 (Chrome 최신 버전 기준)
- [ ] 로컬 정적 서버 실행 가이드가 README만으로 재현 가능
- [ ] main push 시 GitHub Pages 배포 파이프라인 정상 동작

## 다음 우선순위 (Post-MVP)

1. 학습 미션/퀴즈 추가
2. 사용자 설정 저장(localStorage)
3. 모바일 반응형 UX 개선
4. 성능 최적화(FPS/렌더링 비용)

## 최신 사용자 플로우

1. **3D 시뮬레이터**: 하늘 탐색, 천체 찾기, 스케일 점프
2. **Kepler Lab**: e/a 조절, 면적(CV) 확인, T²/a³ 검증, 뉴턴 연결 확인
3. **Dynamics Lab**: 추력/질량 조절, 에너지/각운동량 drift 확인

## 품질 체크 (콘솔/안정성)

```bash
bash scripts/console-checks.sh
```

성공 기준: `[ok] console checks passed` 출력.
수동 확인 + 실패 대응 가이드는 `docs/console-checks.md` 참고.

## 자동 브라우저 스모크 체크 (Playwright)

사전 1회 설치:

```bash
npm install
npx playwright install chromium
```

실행:

```bash
npm run smoke:browser
```

또는 콘솔 체크 + 브라우저 스모크를 연속 실행:

```bash
npm test
```

판독 기준:
- 성공: `[ok] playwright smoke passed`
- 실패: `[fail] playwright smoke failed` + 상세 에러 목록 출력
- 기본 대상 URL: `http://127.0.0.1:4173` (필요 시 `SMOKE_BASE_URL` 환경변수로 변경)

## 스크린샷 자리표시자 (업데이트 예정)

- `[TODO] screenshots/flow-3d-simulator.png`
- `[TODO] screenshots/flow-kepler-lab.png`
- `[TODO] screenshots/flow-dynamics-lab.png`

## 실행/검증 체크리스트

- [ ] `cd cosmos-atlas`
- [ ] `python3 -m http.server 4173` 실행
- [ ] 브라우저에서 `http://localhost:4173` 접속
- [ ] 탭 이동 확인: `3D -> Kepler -> Dynamics`
- [ ] Kepler: `e/a` 조절 시 수치/시각 피드백 갱신 확인
- [ ] Dynamics: 추력 적용 후 `a, v, E/L drift` 텍스트 갱신 확인
- [ ] `bash scripts/console-checks.sh` 실행 후 `[ok] console checks passed` 확인

## 로컬 실행

아래처럼 정적 서버로 실행할 수 있습니다.

```bash
cd cosmos-atlas
python3 -m http.server 4173
```

브라우저에서 `http://localhost:4173` 접속.

## 문제해결 (자주 막힘 3가지)

1. **포트 4173이 이미 사용 중일 때**
   - 증상: `OSError: [Errno 48] Address already in use`
   - 해결: 다른 포트로 실행 (`python3 -m http.server 5173`) 후 해당 포트로 접속
2. **콘솔 체크 실패 시**
   - 증상: `scripts/console-checks.sh`가 `[ok]` 없이 종료
   - 해결: 누락 DOM id/런타임 가드 경고를 먼저 수정하고 스크립트 재실행
3. **탭 전환 후 화면이 비어 보일 때**
   - 증상: 모바일 회전 직후 캔버스가 작게 보이거나 갱신 지연
   - 해결: 탭을 한 번 다시 선택하거나 창 크기 변경(회전)으로 리사이즈 이벤트 재트리거

## GitHub Pages 배포

1. 저장소 `Settings > Pages`로 이동
2. Source를 `GitHub Actions`로 선택
3. `main` 브랜치에 push 하면 `.github/workflows/deploy.yml`로 자동 배포
4. 배포 완료 후 제공 URL 접속

## 파일 구조

- `index.html`: 앱 UI 구조
- `styles.css`: 전체 스타일/테마
- `app.js`: 메인 UI 제어 및 2D 스카이 로직
- `sky3d.js`: Three.js 기반 3D 하늘 시뮬레이터
- `kepler-lab.js`: 케플러 법칙 학습 시뮬레이션
- `dynamics-lab.js`: 동역학/보존법칙 학습 시뮬레이션
- `cosmic-journey.js`: 우주 탐색 시나리오 로직
- `targets.js`: 기본 천체 데이터
- `settings.js`: 전역 설정(언어/단위)
- `assets/`: 로고/아이콘 등 정적 리소스
