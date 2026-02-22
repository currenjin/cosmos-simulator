# Tonight Sky Planner

오늘 밤 보이는 천체를 추천해주는 정적 웹앱입니다.

## 기능

- 위치/날짜/장비 입력
- 야간 구간(태양 고도 -12° 이하) 자동 계산
- 천체별 고도/가시 시간 기반 점수화 추천
- 오늘 체크리스트 저장 (localStorage)
- 관측 성공/실패 로그 저장 (localStorage)

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
3. Source를 `Deploy from a branch`로 선택
4. Branch를 `main` / `/ (root)`로 선택
5. 배포 완료 후 제공 URL 접속

### 커스텀 도메인 없이 빠르게 쓰기

`username.github.io/repository-name` 형태로 접근됩니다.

## 파일 구조

- `index.html`: UI 구조
- `styles.css`: 화면 스타일
- `app.js`: 관측 계산 로직 + 렌더링
- `targets.js`: 기본 천체 데이터
