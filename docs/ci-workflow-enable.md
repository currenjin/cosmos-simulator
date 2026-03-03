# CI Workflow Enable Guide (T33 Recovery)

`T33`(GitHub Actions quality-gate 추가)는 코드 자체 준비는 되었지만,
현재 로컬 push 토큰에 `workflow` scope가 없어 `.github/workflows/*.yml` 반영이 차단됨.

## 증상

push 시 아래와 유사한 에러 발생:

```text
refusing to allow a Personal Access Token to create or update workflow
```

## 복구 절차

1. GitHub PAT 재발급(또는 기존 토큰 갱신)
   - 최소 필요 권한: `repo`, `workflow`
2. 로컬 인증 토큰 교체
   - 사용하는 credential manager/환경변수에 새 PAT 반영
3. `T33` 브랜치/커밋 재적용 후 push
4. GitHub Actions 탭에서 `Quality Gate` 워크플로우 감지 확인
5. PR 1건 생성해 자동 실행 여부 검증

## 검증 체크

- [ ] `.github/workflows/quality-gate.yml`가 원격 main에 존재
- [ ] PR 생성 시 `Quality Gate` job 자동 시작
- [ ] `npm test` 단계 성공/실패가 체크 상태에 반영

## 참고

권한 복구 전까지는 로컬에서 아래 순서로 동일 품질 게이트를 수동 실행:

```bash
npm run check:console
npm run smoke:browser
npm run test:ui-state
npm run test:calc-regression
```
