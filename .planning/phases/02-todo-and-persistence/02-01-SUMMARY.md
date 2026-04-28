# 02-01 Summary — todo store + 영속화

**Status:** ✓ Complete
**Date:** 2026-04-28

## Delivered

- `todo.js` (신규) — 데이터 레이어 단독.
  - 상수: `STORAGE_KEY = 'todo-gsd:v1'`, `SCHEMA_VERSION = 1`, `MAX_TEXT_LEN = 200`.
  - 메모리 store: `{ version: 1, byDate: { [iso]: Todo[] } }`, 모듈 로드 시 `loadFromStorage()`로 초기화.
  - 폴백 (D2-05): null → 빈 store, 파싱 실패/스키마 mismatch → `console.warn` 후 빈 store.
  - 저장 (D2-06): quota 초과 등 throw 없이 경고만.
  - CRUD: `addTodo` (trim, 빈 문자열 거부, 200자 슬라이스), `toggleTodo`, `deleteTodo` (빈 배열 정리).
  - 조회: `getTodos` (createdAt 오름차순 복사 반환), `countByDate`.
  - 디버그: `_dump` (deep clone), `_reset`.
  - Public API는 `window.todoApp`에 노출.

## Constraints honored

- DOM API 호출 0회 (`document.*`, `addEventListener`, `innerHTML`). 02-03이 추가한다.
- import/export 구문 0회 (빌드 도구 없음).
- 모든 mutation 후 `saveToStorage()` 호출 (D2-04).

## Verification

- 자동: grep 검사 + `node --check` 통과.
- 수동(추후): 02-03이 index.html에 script 태그를 연결한 뒤 콘솔에서 `window.todoApp.addTodo` 라운드트립 확인.
