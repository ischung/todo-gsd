# Plan 01-03 Summary: Month Navigation

**Status:** ✓ Complete
**Date:** 2026-04-28

## What was built

`calendar.js`에 월 이동 핸들러 추가:
- `goPrevMonth()` — 1월(month=0)에서 전년도 12월로 정확히 전환.
- `goNextMonth()` — 12월(month=11)에서 다음 해 1월로 정확히 전환.
- `goToday()` — 시스템 현재 월로 즉시 복귀.
- `#cal-prev`/`#cal-next`/`#cal-today` 세 버튼에 click 리스너 등록.
- `window.calendarApp` 노출 객체에 세 함수 추가.

## Decisions honored

- D-05 세 버튼 / D-07 월 단위만, 키보드/스와이프/연도 점프 없음 / D-08 state 갱신 → renderCurrent 패턴.

## Verification

- `node --check calendar.js` 통과.
- `keydown|keyup|keypress` 핸들러 없음 확인 (D-07 준수).
- 모든 acceptance grep 체크 통과.

## Phase 1 outcome

CAL-01, CAL-02, CAL-04 동작 가능. ROADMAP 성공 기준 #1/#2/#3 충족.
