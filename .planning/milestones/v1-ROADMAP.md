# Milestone v1: MVP

**Status:** ✅ SHIPPED 2026-04-28
**Phases:** 1-2
**Total Plans:** 6/6 complete

## Overview

월간 달력 화면에서 날짜를 클릭해 그 날짜의 할 일을 추가/완료/삭제할 수 있는 1인용 정적 웹 앱. 각 날짜 셀에는 할 일 개수가 표시되며, localStorage로 새로고침 후에도 데이터가 유지된다. 백엔드/프레임워크 없는 vanilla 스택.

## Phases

### Phase 1: 달력 셸

**Goal:** 사용자가 월간 달력을 보고, 이전/다음 달로 이동할 수 있으며, 오늘 날짜가 강조되어 보이는 정적 UI를 완성한다.
**Depends on:** —
**Plans:** 3/3 complete

Plans:

- [x] 01-01-skeleton-and-styles — index.html 셸 + styles.css 그리드/오늘 강조 토큰 (CAL-01, CAL-04)
- [x] 01-02-render-month — calendar.js renderMonth/buildCells, 6주 고정 그리드, 오늘 강조 (CAL-01, CAL-04)
- [x] 01-03-month-navigation — 이전/오늘/다음 버튼 핸들러, 연도 경계 처리 (CAL-02)

**Details:** UAT 통과 (Phase 1, 2026-04-28). CAL-01, CAL-02, CAL-04 Validated.

### Phase 2: Todo + 영속화

**Goal:** 날짜를 클릭해 할 일을 추가/완료/삭제할 수 있고, 각 날짜 셀에 개수가 표시되며, 새로고침해도 모든 데이터가 유지된다.
**Depends on:** Phase 1
**Plans:** 3/3 complete

Plans:

- [x] 02-01-todo-store — todo.js 데이터 레이어: store + CRUD + localStorage (TODO-02/03/04, PERSIST-01) [Wave 1]
- [x] 02-02-panel-ui-shell — index.html 패널 마크업 + styles.css 패널/배지/선택 셀 스타일 (TODO-01, CAL-03) [Wave 1]
- [x] 02-03-integration — todo.js 렌더/이벤트 + calendar.js renderMonth hook (TODO-01~04, CAL-03, PERSIST-01) [Wave 2]

**Details:** UAT 10/10 통과 (Phase 2, 2026-04-28). CAL-03, TODO-01~04, PERSIST-01 Validated.

---

## Milestone Summary

**Decimal Phases:** 없음

**Key Decisions:**

- 정적 웹 앱(HTML/CSS/Vanilla JS) — 범위가 작아 프레임워크 오버헤드 회피 — ✓ Validated
- localStorage 사용 — 1인용·새로고침 유지 요구 충족, 백엔드 불필요 — ✓ Validated
- 배지 카운트 99+ 클램프 — 한 날짜 100개 이상 시 레이아웃 보호 — ✓ Validated
- escapeHtml + innerHTML — XSS 방어를 데이터 레이어에서 차단 — ✓ Validated
- calendar.js → todo.js optional chaining hook — Phase 1 단독 안전성 보장, 비결합 통합 — ✓ Validated

**Issues Resolved:** 없음 (UAT 100% 통과, 결함 없이 종료)

**Issues Deferred:** 없음

**Technical Debt Incurred:**

- IndexedDB 미사용 — localStorage 용량 제한(~5MB) 도달 시 v2 검토 필요
- 단일 브라우저 가정 — 다중 디바이스 동기화는 백엔드 필요 시 v2+

**Stats:**

- LOC: 672 (HTML 57 / CSS 223 / JS 392)
- Files: index.html, styles.css, calendar.js, todo.js
- Timeline: 2026-04-28 (1일)
- UAT: 14 tests pass / 0 issues (Phase 1: 4, Phase 2: 10)

---

_For current project status, see .planning/ROADMAP.md_
