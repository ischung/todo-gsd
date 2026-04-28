# 개인용 달력 Todo 앱

## What This Is

월간 달력 화면에서 날짜를 클릭해 그 날짜의 할 일을 추가/완료/삭제할 수 있는 1인용 정적 웹 앱. 각 날짜 셀에는 할 일 개수가 99+ 클램프와 함께 표시되며, localStorage 기반으로 새로고침해도 데이터가 유지된다.

## Current State

**Shipped:** v1 MVP (2026-04-28) — 모든 9개 v1 요구사항 Validated. 672 LOC, 4 files, UAT 14/14 pass.

## Core Value

날짜 단위로 할 일을 빠르게 적고 보고, 새로고침해도 그대로 남아 있어야 한다.

## Requirements

### Validated

- [x] 월간 달력 뷰 표시 및 월 이동 — Phase 1 UAT 통과 (2026-04-28, CAL-01/02/04)
- [x] 날짜 클릭 시 해당 날짜의 할 일 목록 보기 — Phase 2 UAT 통과 (2026-04-28, TODO-01)
- [x] 할 일 추가 — Phase 2 UAT 통과 (2026-04-28, TODO-02)
- [x] 할 일 완료 토글 — Phase 2 UAT 통과 (2026-04-28, TODO-03)
- [x] 할 일 삭제 — Phase 2 UAT 통과 (2026-04-28, TODO-04)
- [x] 각 날짜 셀에 할 일 개수 표시 (99+ 클램프) — Phase 2 UAT 통과 (2026-04-28, CAL-03)
- [x] 새로고침 후에도 데이터 유지 (localStorage) — Phase 2 UAT 통과 (2026-04-28, PERSIST-01)

### Active

(없음 — 마일스톤 v1 모든 요구사항 Validated)

### Out of Scope

- 멀티 유저/로그인 — 개인용
- 서버/백엔드 — localStorage로 충분
- 알림/리마인더 — 요청 범위 외
- 반복 일정, 태그, 우선순위 — v1 단순화
- 모바일 네이티브 앱 — 웹 우선

## Context

- 개인용 단일 사용자 웹 앱
- 데이터 저장: 브라우저 localStorage
- 별도 백엔드 없음

## Constraints

- **Tech stack**: 브라우저에서 동작하는 정적 웹 앱 (HTML/CSS/JS) — 백엔드 없음, 단순성 우선
- **Persistence**: localStorage — 단일 브라우저 한정 가정

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| localStorage 사용 | 1인용·새로고침 유지 요구 충족, 백엔드 불필요 | ✓ Validated (Phase 2) |
| 정적 웹 앱(HTML/CSS/JS) | 범위가 작아 프레임워크 오버헤드 회피 | ✓ Validated (Phase 1, 2) |
| 배지 카운트 99+ 클램프 | 한 날짜 100개 이상 시 레이아웃 보호 | ✓ Validated (Phase 2) |
| innerHTML + escapeHtml | XSS 방어를 데이터 레이어에서 차단 | ✓ Validated (Phase 2) |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition:**
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone:**
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-28 — v1 MVP 마일스톤 shipped, archived to milestones/*
