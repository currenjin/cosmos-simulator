# COSMOS ATLAS

실제 하늘 시뮬레이터와 우주 물리 학습 랩을 제공하는 정적 웹앱입니다.

## 주요 기능

- 상단 탭으로 `3D 시뮬레이터` / `케플러 랩` / `동역학 랩` 전환
- 위치/날짜/시간 기준으로 별/별자리/천체(Messier) 하늘 배치 반영
- 오리온/북두칠성/여름 삼각형 빠른 포커스
- 실시간 시간 동기화, 현재 위치/시간 맞추기
- 태양 고도 기반 박명/암야 반영, 고도 기반 별 가시성 감쇠
- Kepler Lab: 케플러 법칙(1, 2, 3) 및 뉴턴 중력 연결 학습
- Dynamics Lab: 뉴턴 3법칙, 에너지/각운동량 보존 시뮬레이션
- 전역 설정: 언어(한국어/English), 단위 전환

## 로컬 실행

아래처럼 정적 서버로 실행할 수 있습니다.

```bash
cd cosmos-simulator
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
