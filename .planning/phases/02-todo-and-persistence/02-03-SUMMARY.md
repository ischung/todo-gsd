# 02-03 Summary — 통합 (렌더 + 이벤트 + calendar hook)

**Status:** ✓ Complete
**Date:** 2026-04-28

## Delivered

- `todo.js` (확장)
  - 렌더: `renderBadgesForGrid` (D2-13/14: 0건이면 배지 제거, 99 초과 `99+` 클램프, `day--selected` 동기화), `renderPanelList`, `formatPanelTitle`, `toItemHtml`, `escapeHtml`(XSS 방어).
  - 패널 제어: `openPanel(iso)` (hidden 해제 + 헤더 갱신 + 리스트 렌더 + 입력 포커스), `closePanel()`.
  - 월 렌더 hook: `afterRenderMonth(year, month)` — 셀의 data-date를 신뢰해 배지 재계산.
  - 이벤트 위임 4곳: `#cal-grid` click → `openPanel`, `#todo-form` submit → addTodo + 재렌더, `#todo-list` click(체크/삭제 분기), `#todo-panel-close` click → closePanel.
  - 초기 1회 `renderBadgesForGrid()` 호출 (calendar.js의 `renderCurrent`가 같은 defer 큐 내 먼저 실행됨).
  - `window.todoApp` 갱신: `afterRenderMonth`, `openPanel`, `closePanel`, `selectedDate` (getter) 추가. 02-01의 함수/상수는 무수정.

- `calendar.js`
  - `renderMonth` 마지막 줄(`gridEl.innerHTML = html;`) **다음 줄**에 한 줄 추가:
    `window.todoApp?.afterRenderMonth?.(year, month);`
  - optional chaining으로 todo.js 미로드 시에도 noop (D2-18).
  - 그 외 모든 함수/상수/주석은 그대로.

## Requirements closed

- TODO-01 (셀 클릭 → 패널)
- TODO-02 (추가, Enter/버튼)
- TODO-03 (체크 토글)
- TODO-04 (삭제)
- CAL-03 (배지)
- PERSIST-01 (CRUD가 모두 `saveToStorage` 경유)

## Verification

- 자동 grep 검사 통과 (todo.js 12개 키워드, calendar.js 3개).
- `node --check` 양 파일 통과.
- XSS: 텍스트는 `escapeHtml` 후 innerHTML 삽입.
- Phase 1 단독 안전성: optional chaining hook으로 todo.js 미로드도 동작.

## Manual UAT (사용자 검증 항목)

1. 셀 클릭 → 패널 열림, 헤더 "YYYY년 M월 D일".
2. 두 날짜에 항목 추가 → 새로고침 → 동일 상태로 복원, 배지 숫자 일치.
3. 체크/삭제 즉시 반영, 100건 이상 추가 시 배지 `99+`.
4. 빈 문자열/공백 추가 무시.
5. 월 이동 시 배지 새 월 데이터로 재계산.
