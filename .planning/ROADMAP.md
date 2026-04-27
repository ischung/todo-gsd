# Roadmap: 개인용 달력 Todo 앱

**Created:** 2026-04-28
**Granularity:** Coarse (2 phases)

## Overview

| # | Phase | Goal | Requirements | Success Criteria |
|---|-------|------|--------------|------------------|
| 1 | 달력 셸 | 월간 달력 UI를 화면에 띄우고 월 이동/오늘 강조까지 동작 | CAL-01, CAL-02, CAL-04 | 3 |
| 2 | Todo + 영속화 | 날짜별 할 일 CRUD와 개수 배지, localStorage 영속화 완성 | CAL-03, TODO-01~04, PERSIST-01 | 4 |

---

## Phase 1: 달력 셸

**Goal:** 사용자가 월간 달력을 보고, 이전/다음 달로 이동할 수 있으며, 오늘 날짜가 강조되어 보이는 정적 UI를 완성한다.

**Requirements:** CAL-01, CAL-02, CAL-04

**UI hint:** yes

**Success criteria:**
1. 페이지를 열면 현재 월의 달력이 요일 헤더와 함께 정확히 렌더링된다 (이전/다음 달의 빈 칸도 채워 정렬).
2. "이전 달"/"다음 달" 버튼으로 월을 자유롭게 이동할 수 있고 헤더의 연/월 표시가 갱신된다.
3. 오늘 날짜 셀은 다른 날짜와 시각적으로 구별된다.

**Deliverables:**
- `index.html` — 달력 셸 마크업
- `styles.css` — 달력 그리드/오늘 강조 스타일
- `calendar.js` — 월 단위 렌더링 및 월 이동 로직

---

## Phase 2: Todo + 영속화

**Goal:** 날짜를 클릭해 할 일을 추가/완료/삭제할 수 있고, 각 날짜 셀에 개수가 표시되며, 새로고침해도 모든 데이터가 유지된다.

**Requirements:** CAL-03, TODO-01, TODO-02, TODO-03, TODO-04, PERSIST-01

**Depends on:** Phase 1

**UI hint:** yes

**Success criteria:**
1. 날짜를 클릭하면 그 날짜의 할 일 목록 패널이 열리고, 입력창으로 새 할 일을 추가할 수 있다.
2. 각 할 일을 체크박스로 완료/미완료 토글하고 삭제 버튼으로 삭제할 수 있다.
3. 모든 날짜 셀에 그 날짜의 할 일 개수가 배지로 표시되고, CRUD 직후 즉시 갱신된다.
4. 페이지 새로고침 후에도 모든 할 일과 완료 상태가 그대로 복원된다 (localStorage).

**Deliverables:**
- `todo.js` — 날짜별 할 일 CRUD, 개수 계산, localStorage 직렬화
- `index.html`/`styles.css` 갱신 — 할 일 패널 UI 및 개수 배지

---

## Dependencies

```
Phase 1 (달력 셸)
   └─> Phase 2 (Todo + 영속화)
```

---
*Roadmap created: 2026-04-28*
