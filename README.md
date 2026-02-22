# COSMOS ATLAS

실제 하늘 시뮬레이터와 우주 물리 법칙 학습 랩을 제공하는 정적 웹앱입니다.

## 기능

- 상단 탭으로 `3D 시뮬레이터` / `케플러 랩` / `동역학 랩` 전환
- 3D 하늘 시뮬레이터 전체 화면 모드 (관측자 시점)
- 위치/날짜/시간 기준으로 별/별자리/천체(Messier) 하늘 배치 반영
- 오리온/북두칠성/여름 삼각형 빠른 포커스 버튼
- 실시간 시간 동기화, 현재 위치/시간 맞추기 버튼
- 태양 고도 기반 박명/암야 반영, 고도 기반 별 가시성 감쇠
- COSMOS ATLAS 브랜딩: 로고, 통일된 컬러 시스템, 탭별 분위기 테마
- 전역 설정: 언어(한국어/English), 단위(천문 단위/마일 혼합) 전환
- Kepler Lab: 케플러 1·2·3법칙 학습, 뉴턴 연결, 실제 행성 데이터 비교
- Dynamics Lab: 뉴턴 3법칙, 에너지 보존, 각운동량 보존 시뮬레이션

## 로컬 실행

아무 정적 서버로 실행하면 됩니다.

```bash
cd sky-observer-planner
python3 -m http.server 4173
```

브라우저에서 `http://localhost:4173` 열기.

## GitHub Pages 배포

1. 이 폴더를 독립 레포지토리로 push
2. GitHub 저장소 설정에서 `Settings > Pages`
3. Source를 `GitHub Actions`로 선택
4. `main` 브랜치에 push 하면 `.github/workflows/deploy.yml`로 자동 배포
5. 배포 완료 후 제공 URL 접속

### 커스텀 도메인 없이 빠르게 쓰기

`username.github.io/repository-name` 형태로 접근됩니다.

## 파일 구조

- `index.html`: UI 구조
- `styles.css`: 화면 스타일
- `app.js`: 관측 계산 로직 + 렌더링
- `targets.js`: 기본 천체 데이터
- `sky3d.js`: Three.js 기반 3D 하늘 시뮬레이터
- `assets/cosmos-atlas-logo.svg`: COSMOS ATLAS 브랜드 로고
- `settings.js`: 전역 설정(언어/단위) 상태 관리
- `kepler-lab.js`: 케플러 학습(1/2/5/6) 시뮬레이션
- `dynamics-lab.js`: 뉴턴 3법칙 + 보존법칙 학습 시뮬레이션
