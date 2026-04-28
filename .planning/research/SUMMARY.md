# Project Research Summary

**Project:** 개인용 달력 Todo 앱 — v1.1 UX 다듬기
**Domain:** UX-polish layer on existing static HTML/CSS/Vanilla JS calendar-todo app (localStorage)
**Researched:** 2026-04-28
**Confidence:** HIGH

## Executive Summary

v1.1은 신규 기능 추가가 아니라 **이미 동작하는 v1 위에 시각/인터랙션/접근성 계층을 다듬어 매일 쓰기 거슬리지 않는 완성도까지 끌어올리는 마일스톤**이다. 4개 영역(달력 시각, 할 일 패널 인터랙션, 날짜 셀 정보 밀도, 키보드/접근성)은 모두 **브라우저에 이미 들어있는 표준 웹 기술**(CSS custom properties, `:focus-visible`, `prefers-reduced-motion`, `KeyboardEvent.key`, inline SVG, WAI-ARIA roving tabindex)로 충분히 구현 가능하며, **신규 의존성/빌드 도구는 일체 도입하지 않는다**(hard constraint).

권장 접근은 **3개 페이즈 직렬 분해**: (A) 디자인 토큰 + 시각 다듬기 [CSS only] → (B) 인터랙션 다듬기 + "모두 완료" 체크 아이콘 [todo.js + styles.css] → (C) 키보드/접근성 — roving tabindex + 단축키 + ARIA [calendar.js 주]. A가 토큰을 깔아야 B/C가 색상 리터럴을 박지 않고, B의 `isAllDone` 헬퍼/`renderBadgesForGrid` 확장이 자리 잡아야 C에서 셀 `aria-label`에 "모두 완료" 의미를 안전하게 합성할 수 있다. 데이터 모델, localStorage 키(`todo-gsd:v1`), 스키마 버전(`SCHEMA_VERSION=1`)은 **전 페이즈 변경 금지**.

핵심 리스크는 4가지다: (1) **WCAG 4.5:1 대비 미달**(라이트 톤 톤다운 시 흰 글자 그대로 두면 1.6:1로 추락) — 토큰 페어에 `--color-today-bg`/`--color-today-fg`를 명시적 4.5:1 이상으로 정의하고 DevTools Contrast checker로 verify. (2) **한국어 IME 조합 중 Enter** → 미완성 글자/중복 todo — 입력창에 `keydown` Enter 핸들러를 절대 추가하지 말고 기존 `<form>` `submit`만 유지(브라우저가 IME 조합 중 Enter를 submit으로 변환하지 않음). (3) **localStorage 스키마 무심코 변경** ("v1.1이니까 버전도 1.1"이라는 직관적 오류) → 사용자 데이터 영구 손실. 모든 페이즈 verify에 grep 가드 필수. (4) **방향키 그리드 네비의 월 경계 focus 증발** — `setFocusedCell`을 단일 진실로 두고 모든 분기를 그것으로 종결, 1일 ←은 자동으로 이전 달 말일로 진입.

## Key Findings

### Recommended Stack

표준 웹 플랫폼 기능만으로 v1.1 전 영역 구현 가능. STACK.md "도입 금지 목록"이 길게 명시되어 있으며 — CSS 프레임워크/JS 프레임워크/아이콘 폰트/빌드 도구/유틸리티 라이브러리/테마 시스템/스키마 마이그레이션 모두 제외. 핵심 "신규 활용" 기술은 모두 2022년 이후 모든 메이저 브라우저에서 polyfill 없이 동작.

**Core technologies (이미 사용 중 — 변경 없음):**
- HTML5 + ARIA, CSS3, Vanilla JS (ES2020+), localStorage

**v1.1에서 신규 활용 (표준 기술 추가):**
- **CSS custom properties** (`:root` 디자인 토큰 8–12개) — 라이트 미니멀 톤 일원화 + 다크모드 향후 확장 마찰 감소
- **`:focus-visible`** — 키보드/마우스 포커스 분기 (마우스 클릭 outline 깜빡임 제거)
- **`prefers-reduced-motion`** — transition 도입 시 a11y 표준
- **`KeyboardEvent.key`** (`keyCode` 절대 사용 금지) — ←/→/T/Home/End/PageUp/PageDown/Enter/Escape
- **WAI-ARIA roving tabindex** + **`role="grid"`/`gridcell"`/`row`** + **`aria-current="date"`** + **`aria-selected`**
- **인라인 SVG 1개** (체크 아이콘, `currentColor` + `aria-hidden`) — 의존성 0

자세한 사항: `.planning/research/STACK.md`

### Expected Features

v1 위에 얹는 polish이므로 "feature"는 대부분 **기존 동작의 다듬어진 표현 방식**을 의미.

**Must have (table stakes):**
- 오늘 셀: 라이트 톤 액센트 배경 + 진한 숫자 + `aria-current="date"`
- 다른 달 셀: 톤다운 (opacity 아닌 color/bg 토큰) + 클릭 가능성 유지
- 완료 항목: line-through + muted color (opacity와 동시 3중 적용 금지)
- Enter 입력 흐름: `<form>` submit 그대로, 추가 후 `input.focus()` 명시 보강
- 삭제 즉시 반영 (no confirm, no undo) — v1 동작 유지
- 숫자 배지 톤다운, 모두 완료된 날짜에 인라인 SVG 체크 아이콘 (배지 자리 교체)
- ←/→ 월 이동, `T`/`t` 오늘로 (input 가드 + modifier 없는 단독 키)
- 방향키 그리드 셀 이동 (±1일/±7일, Home/End, 월 경계 자동 진입)
- roving tabindex, `aria-current`/`aria-selected` 동적 토글, `:focus-visible` 글로벌

**Should have (시간 남으면):**
- 셀 단위 풍부한 `aria-label` ("4월 28일, 할 일 3개, 오늘")
- `PageUp`/`PageDown` 월 이동, `Escape` 패널 닫기 + 포커스 복귀
- 완료 토글 0.1s transition + reduced-motion 분기
- `role="row"` 래퍼 추가, hover 셀 미세 하이라이트

**Defer (anti-features — 명시 제외):**
- 다크 모드, 모바일 반응형/터치, 삭제 확인 다이얼로그, Undo 토스트, 빈 상태/온보딩, 알림, 반복/태그/우선순위, drag-and-drop, 검색/필터, 다른 뷰(주/일/연), 셀 todo 텍스트 미리보기, emoji 체크 아이콘, 아이콘 폰트, 프레임워크, localStorage 스키마 마이그레이션

자세한 사항: `.planning/research/FEATURES.md`

### Architecture Approach

기존 4파일 구조(index.html / styles.css / calendar.js / todo.js) **유지, 신규 파일 0개**. 단일 `styles.css` 확장 권장 (분할은 YAGNI). 데이터 흐름 변화 0건 — `STORAGE_KEY`/`SCHEMA_VERSION`/`Todo` shape/CRUD 시그니처/렌더 트리거 전부 무변경. 신규 모듈 상태는 `state.focusedIso`(calendar.js) 단 하나 — 세션 한정 UI 상태, localStorage 저장 없음.

**Major components (v1.1 책임 추가):**
1. **Calendar grid renderer** (`calendar.js`) — 기존: 월 셀 빌드/렌더, 월 이동. 추가: roving tabindex 마크업 출력, `aria-current`/`aria-selected`, `focusedIso` 보존, 그리드 keydown, 페이지 단축키
2. **Todo UI renderer** (`todo.js` 108–242) — 기존: 패널/리스트/배지 렌더, 이벤트 위임. 추가: `isAllDone(iso)` 헬퍼, `renderBadgesForGrid` 확장 (`.day--all-done` + 인라인 SVG 토글), 완료 항목 시각, panel close 시 focus 복귀
3. **Todo store + persistence** (`todo.js` 1–106) — **변경 없음**
4. **Visual layer** (`styles.css`) — 토큰 + `:focus-visible` + `.day--all-done` + `.todo-item--done` muted + reduced-motion (논리 섹션 주석으로 구분)

**책임 경계 원칙:** 데이터 질문은 todo.js (`isAllDone`), 포커스/키보드 네비는 calendar.js, 패널 closePanel이 calendar.js의 `setFocusedCell`을 단방향 호출. CSS는 행동을 모름 (JS 클래스 토글 → CSS 시각화 분리).

자세한 사항: `.planning/research/ARCHITECTURE.md`

### Critical Pitfalls

1. **WCAG 4.5:1 대비 미달 (Pitfall 1, Phase A)** — 라이트 톤 톤다운하면서 글자색을 같이 갱신하지 않으면 흰 글자가 1.6:1로 추락. 토큰 페어 `--color-today-bg: #eaf2ff` + `--color-today-fg: #1a3d8f` 정의 + DevTools Contrast checker 캡처를 verify에 첨부.
2. **한국어 IME 조합 중 Enter (Pitfall 5, Phase B)** — 입력창에 `keydown` Enter 핸들러를 추가하지 말 것. `<form>` `submit`만 유지 (브라우저가 IME 조합 중 Enter를 submit으로 변환하지 않음). 어쩔 수 없으면 `e.isComposing || e.keyCode === 229` 가드 필수.
3. **localStorage 키/스키마 무변경 사고 (Pitfall 11, 모든 페이즈)** — "v1.1이니까 버전도 1.1"의 직관적 오류 → v1 데이터 즉시 폴백 손실. **복구 불가**. 모든 페이즈 verify에 grep 가드: `grep -n "todo-gsd:v" todo.js`(1줄) + `grep "SCHEMA_VERSION" todo.js`(=1).
4. **방향키 월 경계 focus 증발 (Pitfall 6, Phase C)** — 1일 ← 누르면 focus가 `<body>`로 빠지거나 그리드에 머무름. `setFocusedCell`을 단일 진실로 두고 모든 분기가 그것으로 종결. 1일 ← → 이전 달 말일 자동 진입 + setFocusedCell.
5. **글로벌 단축키가 input 안에서도 트리거 (Pitfall 12, Phase C)** — 입력창에서 ←로 커서 이동 못 하게 됨. 페이지 keydown에 `if (e.target.tagName === 'INPUT') return` + `if (e.metaKey || e.ctrlKey || e.altKey) return` 가드.

추가 함정 10개 (다른 달 어포던스 상실, 취소선+흐리게 3중 과적용, 즉시삭제 hit-area, roving tabindex 누락, aria-label 과잉, `:focus-visible` 누락, reduced-motion 무시, 다른 달 오늘 강조, isAllDone off-by-one 빈배열, 오늘 셀 위 배지 가시성)는 PITFALLS.md At-a-Glance Summary 표 참고.

자세한 사항: `.planning/research/PITFALLS.md`

## Implications for Roadmap

연구 결과, **3개 페이즈 직렬 분해**가 자연스러우며 영역 의존성과 파일 충돌 회피가 모두 충족된다.

### Phase A: 디자인 토큰 + 시각 다듬기 (CSS only)
**Rationale:** 토큰이 깔리지 않으면 B/C에서 추가하는 신규 셀렉터가 색상 리터럴을 또 박게 되어 두 번 일하게 된다. CSS만 건드리므로 다른 영역과 코드 충돌 0.
**Delivers:** `:root` 디자인 토큰 (8–12개), 오늘 셀 톤다운 + WCAG 4.5:1 대비 보장, 다른 달 셀 토큰화(opacity 사용 금지), 배지 톤다운 + 오늘 셀 위 배지 가시성, `body`/`.nav-btn`/`.calendar__title`/`.weekday-header__cell`/`.day` 색상 리터럴 토큰 치환.
**Files:** `styles.css` 단독 (index.html/JS 0줄)
**Addresses:** 달력 시각 디자인 다듬기 (FEATURES.md A 영역 전체)
**Avoids:** Pitfall 1 (대비 깨짐), Pitfall 2 (다른 달 어포던스), Pitfall 13 (다른 달 오늘 강조), Pitfall 15 (오늘 위 배지 가시성), Pitfall 11 (localStorage grep 가드)

### Phase B: 인터랙션 다듬기 + "모두 완료" 체크 + 배지 정돈
**Rationale:** A의 토큰 위에서만 신규 셀렉터가 일관되게 정의 가능. C가 셀 마크업(`renderMonth` 라인 77)을 광범위하게 변경하므로, 같은 라인 충돌 회피 위해 B를 먼저 끝낸다. B의 `isAllDone` 헬퍼와 `renderBadgesForGrid` 확장이 자리 잡아야 C에서 `aria-label`에 "모두 완료" 의미를 안전하게 합성 가능.
**Delivers:** `isAllDone(iso)` 헬퍼 (length>0 + every(done) 가드), `renderBadgesForGrid` 확장 (배지 자리 인라인 SVG 체크 토글), `.todo-item--done` muted color (opacity 3중 적용 금지), submit 후 `input.focus()` 명시 보강, 삭제 버튼 hit-area ≥28×28 검증.
**Files:** `todo.js` (헬퍼/렌더 확장/submit 보강), `styles.css` (.day--all-done, .day__all-done, .icon-check, .todo-item--done 강화), `index.html` 0줄
**Uses:** 인라인 SVG `<path d="M3.5 8.5l3 3 6-7" stroke="currentColor"/>`, 기존 `<form>` submit
**Avoids:** Pitfall 3 (취소선+흐리게 균형), Pitfall 4 (오삭제), Pitfall 5 (한국어 IME), Pitfall 14 (isAllDone off-by-one), Pitfall 10 (reduced-motion, transition 도입 시), Pitfall 11

### Phase C: 키보드 / 접근성 (roving tabindex + 단축키 + ARIA)
**Rationale:** 셀 마크업(`tabindex`/`aria-current`/`aria-selected`)을 가장 광범위하게 변경하는 페이즈. A의 토큰과 B의 클래스 토글 위에 얹는다. focus 관리 인프라(`focusedIso`, `setFocusedCell`)가 가장 새 코드 비중이 크고, 월 경계 4가지 케이스 검증 부담이 크므로 마지막에 배치.
**Delivers:** `state.focusedIso`, `setFocusedCell(iso)`, 그리드 keydown 위임 (←→±1일, ↑↓±7일, Home/End, PageUp/Down, Enter/Space=패널 열기), 페이지 keydown (←/→ 월, T 오늘, Escape 패널 닫기) + input/modifier 가드, `renderMonth` 셀에 `tabindex`/`aria-current`/`aria-selected` 출력, 글로벌 `:focus-visible` 정책, `closePanel`에서 직전 셀로 focus 복귀.
**Files:** `calendar.js` 주, `todo.js` 보조 (closePanel focus 복귀), `styles.css` 보조 (.day:focus-visible)
**Implements:** Calendar grid renderer 키보드 책임, Todo UI focus 복귀 책임
**Avoids:** Pitfall 6 (월 경계 focus), Pitfall 7 (roving tabindex 누락), Pitfall 8 (aria 과잉), Pitfall 9 (`:focus-visible`), Pitfall 12 (input 안 단축키), Pitfall 11

### Phase Ordering Rationale

- **A → B → C 직렬**이 의존성과 충돌 회피 모두 충족: A의 토큰을 B/C가 사용, B의 `isAllDone`을 C의 셀 aria-label이 사용, B와 C는 동일 셀 마크업/`renderBadgesForGrid`를 건드릴 가능성이 있어 직렬화로 충돌 회피.
- 병렬화는 가능하지만(A↔B는 다른 파일/셀렉터), B에서 `.day--all-done` 색상에 토큰 사용을 위해 A가 먼저 land해야 하므로 단순성 위해 직렬 권장.
- 모든 페이즈가 데이터 모델 무변경 가드 grep을 verify의 마지막 단계로 공유 (Pitfall 11).
- 모든 페이즈에서 `selectedDate`(todo.js, "패널 열린 날짜")와 `focusedIso`(calendar.js, "키보드 포커스 위치")는 다른 개념으로 구분 — 동일화 금지.

### Research Flags

**Phases likely needing deeper research during planning:**
- **Phase C (키보드/접근성):** WAI-ARIA Date Picker Dialog 패턴의 월 경계 자동 진입 + roving tabindex 인프라는 본 마일스톤의 가장 큰 신규 코드. 4가지 경계 케이스(1일 ← / 말일 → / 첫 주 ↑ / 마지막 주 ↓) 동작과 `aria-selected` vs `:focus-visible` vs `.day--selected` 시각 충돌 해소를 페이즈 계획 시 더 구체화 필요. 또한 **Open Question (requirements 단계 결정 필수):** 페이지 ←/→ 월 이동 vs 그리드 ←/→ 셀 이동 충돌 정책 — 후보안 (1) Shift+←/→ 월 (2) 컨텍스트 의존(그리드 포커스 시 셀, 그 외 월) (3) 페이지 ←/→ 제거하고 그리드 네비가 자연스럽게 월 경계 넘게.

**Phases with standard patterns (skip research-phase):**
- **Phase A (시각 다듬기):** 토큰 도입 + WCAG 대비 + light-tone 셀 강조는 표준 패턴. 추가 연구 불필요.
- **Phase B (인터랙션 + 모두 완료):** 인라인 SVG 1개 + `isAllDone` 헬퍼 + `<form>` submit 유지는 모두 PITFALLS/STACK/FEATURES에서 결론까지 도달. 한국어 IME 함정만 verify에 명시하면 됨.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | MDN/W3C 명세 기반 표준 기술만. 모든 권장 기능 2022+ 모든 메이저 브라우저 지원. 신규 의존성 0 — constraint 충돌 없음. |
| Features | HIGH | W3C ARIA Authoring Practices Date Picker Dialog 패턴 + 메이저 캘린더-todo 앱(Google Calendar/Apple/Things/Todoist) 보편 패턴. 사용자 명시 거부 항목(다크/모바일/Undo/confirm)은 PROJECT.md Out of Scope와 일치. |
| Architecture | HIGH | 실제 v1 소스 4개 파일을 라인 번호와 함께 직접 인용. 책임 경계와 통합 지점을 함수/셀렉터 레벨로 식별. |
| Pitfalls | HIGH | WCAG 2.1 / WHATWG composition 명세 / WAI-ARIA Grid 패턴 / v1 코드 직접 확인. 한국어 IME 함정은 macOS Chrome/Safari 실측 기반. |

**Overall confidence:** HIGH

### Gaps to Address

- **페이지 ←/→ 월 이동 vs 그리드 ←/→ 셀 이동 충돌 정책** — Requirements 단계에서 명시 결정 필수. 권장 기본안: 그리드 셀에 포커스가 있으면 셀 이동, 그 외(또는 포커스 없을 때)는 월 이동. 또는 월 이동은 헤더 버튼/`T`만 두고 페이지 ←/→ 제거.
- **`role="row"` 래퍼 추가 여부** — 현재 v1은 42셀을 평면으로 깔아둠. W3C 권장은 7개씩 row 래핑. CSS grid 시각은 동일하나 a11y tree 구조 다름. Phase C에서 결정 (table stakes 아님 — differentiator로 분류).
- **완료 토글 transition 도입 여부** — 미니멀 톤이면 0.0s가 부합. 도입 시 0.1~0.15s + `prefers-reduced-motion` 0s 강제 필수. Phase B 또는 P2로 미루기 가능.
- **셀 단위 풍부한 `aria-label` 합성 시점** — `renderBadgesForGrid` 안에서 합성하려면 `setAttribute('aria-label', ...)` 한 줄. Phase C에서 P2로 분류 가능.

## Sources

### Primary (HIGH confidence)
- **MDN** — `:focus-visible`, `prefers-reduced-motion`, `KeyboardEvent.key`, `KeyboardEvent.isComposing`, `compositionstart`/`compositionend`, `aria-current`, CSS custom properties, `Element.focus({preventScroll})`, inline SVG
- **W3C WAI-ARIA Authoring Practices** — Grid Pattern (roving tabindex), Date Picker Dialog Pattern (월 경계 자동 진입, 키 매핑 ←→±1 ↑↓±7 Home/End/PageUp/Down/Enter/Space/Escape, role="grid"/row/gridcell/columnheader, aria-current, aria-selected)
- **WCAG 2.1** — Success Criterion 1.4.3 Contrast (Minimum) 4.5:1 (AAA 7:1)
- **현재 리포지토리 코드** — `index.html` (57줄), `styles.css` (224줄), `calendar.js` (129줄), `todo.js` (265줄) — 함수/셀렉터/라인 번호 직접 인용
- **`.planning/PROJECT.md` / `.planning/REQUIREMENTS.md` / `.planning/ROADMAP.md`** — 제약, Out of Scope, 마일스톤 정의

### Secondary (MEDIUM confidence)
- **Google Calendar / Apple Calendar / Notion / Todoist / Things 3 / Apple Reminders** — 도메인 보편 패턴 (오늘 강조 형태, 다른 달 처리, 완료 표현, 키보드 단축키) 직접 사용 경험 + 공개 UI 기반
- **macOS Chrome/Safari 한글 IME 실측** — composition 이벤트 동작 확인

### Tertiary (LOW confidence)
- 없음 — 본 마일스톤의 모든 결정은 표준 명세 또는 기존 코드 직접 확인에 근거

---
*Research completed: 2026-04-28*
*Ready for roadmap: yes*
