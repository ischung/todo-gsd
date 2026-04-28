# Roadmap: 개인용 달력 Todo 앱

**Created:** 2026-04-28
**Last updated:** 2026-04-28 — v1.1 Phase 3 shipped
**Granularity:** Coarse

## Milestones

- ✅ **v1 MVP** — Phases 1-2 (shipped 2026-04-28) → see `.planning/milestones/v1-ROADMAP.md`
- 🟢 **v1.1 UX 다듬기** — Phases 3-5 (Phase 3 shipped 2026-04-28; Phase 4/5 pending)

## Active Phases (v1.1)

| # | Phase | Goal | Requirements | Status |
|---|-------|------|--------------|--------|
| 3 | 디자인 토큰 + 시각 다듬기 | 라이트 미니멀 톤 디자인 토큰 도입, 오늘/다른 달 셀 시각 정돈 | VIS-01, VIS-02, VIS-03 | ✓ Complete |
| 4 | 인터랙션 + 정보 밀도 | 완료 표현·즉시 삭제·IME-안전 입력 흐름과 셀 정보 밀도 | INT-01~04, INFO-01, INFO-02 | ○ Pending |
| 5 | 키보드 / 접근성 | 단축키·그리드 키보드 네비·ARIA 정책 완비 | A11Y-01~08 | ○ Pending |

---

## Phase 3: 디자인 토큰 + 시각 다듬기 (v1.1)

**Status:** ✓ Complete (PR #3, UAT 8/8)

**Goal:** 사용자가 페이지를 처음 보았을 때 라이트 미니멀 톤이 일관되게 적용되어 있고, 오늘 날짜는 충분한 대비로 강조되며, 다른 달 셀은 흐리지만 클릭 가능함이 명확히 느껴진다.

**Requirements:** VIS-01, VIS-02, VIS-03

**Plans:** 2 plans
- [x] 03-01-tokens-refactor-PLAN.md — `:root` 12개 semantic 토큰 도입 + 색 리터럴 1:1 치환 (시각 무변경)
- [x] 03-02-visual-polish-PLAN.md — soft blue 토큰 값 + 오늘/다른 달 셀 재구성 (WCAG AA, opacity 금지)

---

## Phase 4: 인터랙션 + 정보 밀도 (v1.1)

**Goal:** 사용자가 할 일을 추가/완료/삭제할 때 흐름이 끊기지 않고, 한국어 IME에서도 실수 입력이 없으며, 모두 완료된 날짜는 셀에서 한눈에 식별된다.

**Requirements:** INT-01, INT-02, INT-03, INT-04, INFO-01, INFO-02

**Depends on:** Phase 3 (토큰을 사용해야 신규 셀렉터가 색 리터럴을 박지 않음)

**UI hint:** yes

**Success criteria:**
1. 완료된 할 일이 취소선과 muted 색상으로 동시 표시되며, 체크박스/삭제 버튼은 여전히 또렷이 클릭 가능하다 (`opacity` 적용 금지 — 3중 muting 회피).
2. 할 일 추가 후 입력창은 비워지고 포커스가 입력창에 유지되어, 사용자가 쉼 없이 다음 항목을 타이핑할 수 있다.
3. 한국어로 입력하다가 조합 중 Enter를 눌러도 미완성 글자나 중복 항목이 추가되지 않는다 (`<form>` submit 경로만 사용 — 입력창에 별도 keydown Enter 핸들러를 추가하지 않는다).
4. 삭제 버튼을 클릭하면 즉시 삭제되고, 클릭 영역은 ≥28×28px이며 확인 다이얼로그/Undo 토스트가 나타나지 않는다.
5. 날짜 셀의 숫자 배지는 미니멀 톤에 맞게 다듬어진 색/모양/크기로 표시되며, 오늘 셀 위에서도 가독성이 유지된다.
6. 그 날짜의 할 일이 0개가 아니고 모두 완료되면 셀의 배지 자리에 인라인 SVG 체크 아이콘이 나타나고, 빈 날짜(0개)와 시각적으로 구분된다.

**Deliverables:**
- `todo.js` — `isAllDone(iso)` 헬퍼 추가(`length > 0 && every(done)` 가드), `renderBadgesForGrid` 확장 (`.day--all-done` 클래스 + 인라인 SVG 토글), submit 후 `input.focus()` 명시 보강
- `styles.css` — `.todo-item--done`(line-through + muted color), `.day--all-done`/`.icon-check` 스타일, 배지 톤 정돈
- `index.html` 0줄 변경

**Guards (PITFALLS 인용):**
- 입력창에 keydown Enter 핸들러 추가 금지 (한국어 IME 함정)
- 완료 항목에 `opacity` 적용 금지 (체크/삭제 버튼 가시성 손상)
- `isAllDone`은 빈 배열 → false (off-by-one 회피)
- localStorage 키/스키마 무변경 grep 가드

---

## Phase 5: 키보드 / 접근성 (v1.1)

**Goal:** 마우스를 떼고도 사용자가 달력을 자유롭게 탐색하고, 스크린리더 사용자도 충분한 의미를 전달받으며, 포커스 흐름이 자연스럽게 유지된다.

**Requirements:** A11Y-01, A11Y-02, A11Y-03, A11Y-04, A11Y-05, A11Y-06, A11Y-07, A11Y-08

**Depends on:** Phase 4 (`.day--all-done` 클래스가 selectorBytes 안에 자리 잡아야 `aria-label`에 "모두 완료" 의미 합성 가능)

**UI hint:** yes

**Success criteria:**
1. 페이지에서 ←/→ 키로 이전/다음 달, `T`/`t` 키로 오늘로 즉시 이동할 수 있고, 입력창 안에서 같은 키를 누르면 단축키가 비활성화된다 (커서 이동 보존).
2. 그리드 셀에 키보드 포커스가 있을 때 ←→는 ±1일, ↑↓는 ±7일로 셀이 이동하고, Home/End/PageUp/PageDown이 동작하며, 1일 ←은 자동으로 이전 달 말일로 진입한다 (4개 월 경계 케이스 동작 확인).
3. 그리드 셀이 roving tabindex 패턴을 따라, Tab 한 번에 그리드로 들어오고 한 번에 나간다 (모든 셀이 Tab 순서에 들어오지 않는다).
4. 오늘 셀에 `aria-current="date"`, 패널이 열린 셀에 `aria-selected="true"`가 동적으로 토글되며, `role="grid"` + 7개씩 `role="row"` + `role="gridcell"` 구조가 a11y tree에 노출된다.
5. 마우스 클릭 시에는 포커스 윤곽이 보이지 않고 키보드 사용 시에만 보인다 (`:focus-visible` 글로벌 정책).
6. 셀의 `aria-label`이 풍부하게 합성된다 (예: "4월 28일 화요일, 할 일 3개, 모두 완료, 오늘") — 스크린리더로 이동 시 충분한 컨텍스트 제공.
7. 패널을 닫을 때(Escape 또는 다른 방식) 직전에 포커스했던 셀로 포커스가 복귀하여 키보드 흐름이 끊기지 않는다.

**Deliverables:**
- `calendar.js` — `state.focusedIso`, `setFocusedCell(iso)`, 그리드 keydown 위임, 페이지 keydown(input/modifier 가드 포함), `renderMonth` 셀 마크업에 `tabindex`/`aria-current`/`aria-selected`/`role="row"` 출력
- `todo.js` — `closePanel`에서 `setFocusedCell` 호출(focus 복귀 단방향)
- `styles.css` — `.day:focus-visible`, 글로벌 `:focus-visible` outline 정책

**Open question (페이즈 진입 전 결정 완료):**
- 페이지 ←/→ 월 이동 vs 그리드 ←/→ 셀 이동 충돌 → **컨텍스트 분기**: 그리드 셀에 포커스 시 셀 이동, 그 외(또는 입력창/포커스 없음)는 페이지 단축키 비활성화/월 이동. (요구사항 A11Y-01, A11Y-02에 명시)

**Guards (PITFALLS 인용):**
- 1일 ← / 말일 → / 첫 주 ↑ / 마지막 주 ↓ 4가지 케이스에서 focus가 `<body>`로 빠지지 않는다
- 페이지 keydown에 `if (e.target.tagName === 'INPUT') return` + modifier 가드
- `selectedDate`(패널 열린 날짜)와 `focusedIso`(키보드 포커스)는 별개 — 동일화 금지
- localStorage 키/스키마 무변경 grep 가드

---

## Dependencies

```
v1 (archived):
  Phase 1 (달력 셸) ✓
     └─> Phase 2 (Todo + 영속화) ✓

v1.1:
            └─> Phase 3 (디자인 토큰 + 시각) ✓
                   └─> Phase 4 (인터랙션 + 정보 밀도)
                          └─> Phase 5 (키보드 / 접근성)
```

직렬 의존: Phase 3 토큰 위에 Phase 4가 색을 사용하고, Phase 4의 `isAllDone`/`.day--all-done` 위에 Phase 5가 `aria-label`을 합성한다.

## Progress

| Phase | Milestone | Plans | Status | Completed |
|-------|-----------|-------|--------|-----------|
| 1. 달력 셸 | v1 | 3/3 | Complete | 2026-04-28 |
| 2. Todo + 영속화 | v1 | 3/3 | Complete | 2026-04-28 |
| 3. 디자인 토큰 + 시각 다듬기 | v1.1 | 2/2 | Complete | 2026-04-28 |
| 4. 인터랙션 + 정보 밀도 | v1.1 | 0 | Pending | — |
| 5. 키보드 / 접근성 | v1.1 | 0 | Pending | — |

## Coverage

- v1 requirements: 9/9 mapped to Phases 1–2 ✓ (모두 Validated)
- v1.1 requirements: 17/17 mapped to Phases 3–5 (VIS 3/3 Complete, INT/INFO/A11Y 14 Pending)
- Total: 26 mapped, 0 unmapped

---
*Roadmap created: 2026-04-28*
*Last updated: 2026-04-28 — v1.1 Phase 3 shipped*
