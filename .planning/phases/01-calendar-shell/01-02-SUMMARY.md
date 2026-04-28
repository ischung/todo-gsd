# Plan 01-02 Summary: Render Month

**Status:** ✓ Complete
**Date:** 2026-04-28

## What was built

`calendar.js` 신규 작성:
- `state = { year, month }` — D-08 모듈 상태.
- `toISODate(y, m, d)` — 로컬 시각 기준 `YYYY-MM-DD`.
- `isSameYMD(a, b)` — 같은 년/월/일 비교.
- `buildCells(year, month)` — 일요일 시작 오프셋 + 6주 = 42칸 보장.
- `renderMonth(year, month)` — 헤더 텍스트 갱신 + `#cal-grid` innerHTML 교체.
- `renderCurrent()` — `state` 기반 단축 호출.
- 페이지 로드 시 `renderCurrent()` 자동 실행.
- `window.calendarApp = { state, renderMonth, renderCurrent }` 노출.

## Decisions honored

- D-01 일=0 오프셋 / D-02 `cells.length < 42` 루프 / D-03 `day--other-month` 부여 / D-04 헤더 형식 / D-06 `!otherMonth && isSameYMD` 가드.

## Verification

- `node --check calendar.js` 통과.
- 모든 acceptance grep 체크 통과.

## Hand-off to next plan

01-03이 `state`와 `renderCurrent()`만으로 이전/다음/오늘 핸들러 구현 가능.
