# 02-02 Summary — 패널 UI 셸 + todo.js 로드

**Status:** ✓ Complete
**Date:** 2026-04-28

## Delivered

- `index.html`
  - `<head>`에 `<script src="todo.js" defer>` 추가 (calendar.js 다음 줄).
  - `<main class="calendar">` 다음 형제로 `<aside id="todo-panel" hidden>` 패널 마크업 추가.
  - 후크 ID: `todo-panel`, `todo-panel-title`, `todo-panel-close`, `todo-form`, `todo-input`, `todo-add`, `todo-list`.
  - `<form>` 사용으로 Enter 제출 자연 지원, `<ul aria-live="polite">`로 가벼운 접근성.
  - Phase 1 마크업과 ID는 모두 보존.

- `styles.css` (Phase 1 규칙 보존, 끝에 추가)
  - `.day`에 `position: relative` 1줄 추가 (배지 absolute 기준).
  - `.day--selected` (outline 2px), `.day__badge` (+`.day--today .day__badge` 변형).
  - `.todo-panel` + `.todo-panel__header/__title/__form/__input` (+`[hidden] { display: none }`).
  - `.todo-list`, `.todo-item` (+`__check`/`__text`/`__delete`/`--done`).
  - 색상은 Phase 1 팔레트(`#3478f6` 액센트)를 재사용.

## Constraints honored

- 인라인 `style=` 또는 `<style>` 블록 0개.
- 02-01과 파일이 겹치지 않아 동시 실행 안전.

## Verification

- 자동 grep 검사 통과 (인덱스/CSS).
- 수동(추후): 02-03이 hidden 토글 로직을 붙인 뒤 셀 클릭으로 패널 표시 확인.
