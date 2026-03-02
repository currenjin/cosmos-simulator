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

## 로컬 실행

아래처럼 정적 서버로 실행할 수 있습니다.

```bash
cd cosmos-atlas
python3 -m http.server 4173
```

브라우저에서 `http://localhost:4173` 접속.

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
