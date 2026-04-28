# 개인용 달력 Todo 앱

## What This Is

월간 달력 화면에서 날짜를 클릭해 그 날짜의 할 일을 추가/완료/삭제할 수 있는 1인용 정적 웹 앱. 각 날짜 셀에는 할 일 개수가 99+ 클램프와 함께 표시되며, localStorage 기반으로 새로고침해도 데이터가 유지된다.

## Current State

**Shipped:** v1 MVP (2026-04-28) — 모든 9개 v1 요구사항 Validated. 672 LOC, 4 files, UAT 14/14 pass.

## Core Value

날짜 단위로 할 일을 빠르게 적고 보고, 새로고침해도 그대로 남아 있어야 한다.

## Current Milestone: v1.1 UX 다듬기

**Goal:** v1에서 만든 달력 Todo 앱의 시각·인터랙션·접근성을 다듬어, 매일 쓰기 거슬리지 않는 완성도까지 끌어올린다.

**Target features:**
- 달력 시각 디자인 — 오늘 날짜 강조(배경색), 다른 달 셀 흐리게, 라이트 미니멀 톤
- 할 일 패널 인터랙션 — 완료 항목 취소선+흐리게, 삭제 즉시 반영, Enter 입력 흐름 정돈
- 날짜 셀 정보 밀도 — 숫자 배지 스타일 다듬기, 모두 완료된 날짜 체크 아이콘 표시
- 키보드/접근성 — ←/→/T 단축키, 방향키 그리드 네비게이션, aria-label 정비

## Requirements

### Validated

<!-- Shipped and confirmed valuable. -->

- [x] 월간 달력 뷰 표시 및 월 이동 — Phase 1 UAT 통과 (2026-04-28, CAL-01/02/04)
- [x] 날짜 클릭 시 해당 날짜의 할 일 목록 보기 — Phase 2 UAT 통과 (2026-04-28, TODO-01)
- [x] 할 일 추가 — Phase 2 UAT 통과 (2026-04-28, TODO-02)
- [x] 할 일 완료 토글 — Phase 2 UAT 통과 (2026-04-28, TODO-03)
- [x] 할 일 삭제 — Phase 2 UAT 통과 (2026-04-28, TODO-04)
- [x] 각 날짜 셀에 할 일 개수 표시 (99+ 클램프) — Phase 2 UAT 통과 (2026-04-28, CAL-03)
- [x] 새로고침 후에도 데이터 유지 (localStorage) — Phase 2 UAT 통과 (2026-04-28, PERSIST-01)
- [x] 디자인 토큰 + 라이트 미니멀 톤 (오늘 셀 soft 배경 + 진한 액센트, 다른 달 muted) — Phase 3 UAT 통과 (2026-04-28, VIS-01/02/03)

### Active

<!-- Current scope. Building toward these in v1.1. -->

- [ ] 할 일 패널 인터랙션 다듬기 (완료 표현, 삭제 동작, 입력 흐름) — Phase 4
- [ ] 날짜 셀 정보 밀도 향상 (배지 스타일, 모두 완료 표시) — Phase 4
- [ ] 키보드 단축키 및 접근성 (←/→/T, 방향키 네비, aria) — Phase 5

### Out of Scope

- 멀티 유저/로그인 — 개인용
- 서버/백엔드 — localStorage로 충분
- 알림/리마인더 — 요청 범위 외
- 반복 일정, 태그, 우선순위 — v1 단순화
- 모바일 네이티브 앱 — 웹 우선
- 다크 모드 — v1.1 범위 초과 (테마 시스템 도입 비용)
- 모바일 반응형/터치 최적화 — v1.1 범위 외, 데스크톱 UX 우선
- 빈 상태/온보딩 안내 — v1.1 범위 외

## Context

- 개인용 단일 사용자 웹 앱
- 데이터 저장: 브라우저 localStorage
- 별도 백엔드 없음
- v1 기능 골격 완성됨 (Phase 1, 2). v1.1은 표현·인터랙션·접근성 계층 다듬기로 데이터 모델 변경 없음.

## Constraints

- **Tech stack**: 브라우저에서 동작하는 정적 웹 앱 (HTML/CSS/JS) — 백엔드 없음, 단순성 우선
- **Persistence**: localStorage — 단일 브라우저 한정 가정
- **No new dependencies**: v1.1에서도 프레임워크/빌드 도구 도입 금지 — 정적 자산만

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| localStorage 사용 | 1인용·새로고침 유지 요구 충족, 백엔드 불필요 | ✓ Validated (Phase 2) |
| 정적 웹 앱(HTML/CSS/JS) | 범위가 작아 프레임워크 오버헤드 회피 | ✓ Validated (Phase 1, 2) |
| 배지 카운트 99+ 클램프 | 한 날짜 100개 이상 시 레이아웃 보호 | ✓ Validated (Phase 2) |
| innerHTML + escapeHtml | XSS 방어를 데이터 레이어에서 차단 | ✓ Validated (Phase 2) |
| Semantic only 디자인 토큰(12개) | primitive 팔레트 없이 역할 기반 — 한 곳 바꾸면 전 화면 따라옴 | ✓ Validated (Phase 3) |
| 다른 달 셀에 opacity 금지, 색상 토큰만 | 어포던스 보존 (3중 muting 회피) | ✓ Validated (Phase 3) |
| v1.1은 UX 다듬기로 한정 | 기능 추가 전에 매일 쓰기 좋은 완성도 확보 | — Pending (Phase 4/5) |
| 다크 모드 보류 | 테마 시스템 도입은 별도 마일스톤 가치 | — Pending |

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
*Last updated: 2026-04-28 — v1 milestone archived, v1.1 Phase 3 shipped*
