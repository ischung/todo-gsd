# Architecture Research — v1.1 UX 다듬기

**Domain:** Static personal calendar-todo web app (HTML/CSS/Vanilla JS, localStorage)
**Researched:** 2026-04-28
**Confidence:** HIGH (실제 v1 소스 4개 파일을 직접 읽고, 함수/셀렉터 이름·위치를 라인 번호와 함께 인용)

> **Scope reminder:** v1.1은 **표현/인터랙션/접근성 계층만** 변경. 데이터 모델, localStorage 키(`todo-gsd:v1`), `SCHEMA_VERSION=1`, store 구조(`{ version, byDate }`) **모두 변경 없음**. 어떤 페이즈도 `loadFromStorage`/`saveToStorage`/`emptyStore`/`addTodo`/`toggleTodo`/`deleteTodo` 시그니처를 건드리지 않는다.

---

## 1. 실제 v1 파일 구조 (직접 확인)

```
todo-gsd/
├── index.html        # 57 lines — 정적 마크업, defer로 calendar.js → todo.js 로드
├── styles.css        # 224 lines — 단일 시트, 색상 리터럴 산발
├── calendar.js       # 129 lines — 월 렌더, 월 이동, window.calendarApp 노출
└── todo.js           # 265 lines — store + CRUD + 패널/배지 렌더, window.todoApp 노출
```

### 1.1 `index.html` 핵심 노드

| Selector / id | 위치 (라인) | 역할 |
|---|---|---|
| `<main class="calendar">` | 13 | 달력 래퍼 |
| `header.calendar__header` + `#cal-prev` / `#cal-today` / `#cal-next` / `#cal-title` | 14–19 | 네비 + 타이틀 |
| `.weekday-header` (role="row") + `.weekday-header__cell` ×7 | 21–29 | 요일 헤더 |
| `#cal-grid.calendar__grid` (`role="grid" aria-labelledby="cal-title"`) | 31 | **42셀 컨테이너 — 키보드 네비/포커스의 진입점** |
| `<aside id="todo-panel" class="todo-panel" hidden>` | 35–55 | 인라인 todo 패널 (별도 모달 X) |
| `#todo-panel-title`, `#todo-panel-close` | 40, 41 | 패널 헤더 |
| `<form id="todo-form">` + `#todo-input` + `#todo-add` | 44–52 | 입력 form (Enter는 form submit으로) |
| `<ul id="todo-list" class="todo-list" aria-live="polite">` | 54 | 항목 리스트 |

**중요:** 셀(`.day`)은 `calendar.js` 런타임에 `innerHTML`로 생성됨 — `index.html`에 정적 셀은 없다.

### 1.2 `calendar.js` 함수/상태 (직접 인용)

| 심볼 | 라인 | 시그니처/역할 |
|---|---|---|
| `state` | 7–10 | `{ year, month }` (month: 0–11) — 모듈 로컬, **export 없이 `window.calendarApp.state`로 노출** (128) |
| `toISODate(year, month, day)` | 13–17 | 로컬 시각 기준 `YYYY-MM-DD` 생성 |
| `isSameYMD(a, b)` | 19–23 | Date 동일 일자 비교 |
| `buildCells(year, month)` | 27–56 | 42셀 시퀀스 (이전·현재·다음 달) |
| `renderMonth(year, month)` | 58–84 | **innerHTML 일괄 교체로 셀 렌더**. 셀 마크업: `<div class="day [day--other-month] [day--today]" role="gridcell" data-date="YYYY-MM-DD"><span class="day__num">N</span></div>` (77) |
| `renderCurrent()` | 86–88 | state 기준 재렌더 |
| `goPrevMonth` / `goNextMonth` / `goToday` | 91–118 | 월 이동, 핸들러로 직접 바인딩 (120–122) |
| `window.calendarApp` | 128 | `{ state, renderMonth, renderCurrent, goPrevMonth, goNextMonth, goToday }` |

**핵심 관찰:**
- `renderMonth`는 매 호출마다 `gridEl.innerHTML = html`로 셀 전체를 교체 — **모든 DOM 속성/이벤트가 매번 날아간다**. 따라서 keyboard focus/`tabindex`/`aria-current`/`aria-selected` 모두 **렌더 시점에 마크업으로 같이 출력**해야지, 외부에서 set 후 보존을 기대하면 안 됨.
- 80번 라인 직후 `window.todoApp?.afterRenderMonth?.(year, month)` 훅 — **batch 후 후처리 진입점**.
- 셀에는 현재 `tabindex` 없음 → **focusable 아님**.
- 셀에 `aria-current` 없음, `aria-selected` 없음 → **그리드 a11y 미흡**.

### 1.3 `todo.js` 함수/상태 (직접 인용)

| 심볼 | 라인 | 역할 |
|---|---|---|
| `STORAGE_KEY = 'todo-gsd:v1'` | 9 | **불변** — v1.1에서 키/스키마 변경 금지 |
| `SCHEMA_VERSION = 1` | 10 | 동일 |
| `MAX_TEXT_LEN = 200` | 11 | 동일 |
| `emptyStore`, `loadFromStorage`, `saveToStorage` | 13–42 | 영속화 — 변경 없음 |
| `genId`, `isValidIso` | 44–50 | 유틸 |
| `getTodos(iso)`, `countByDate(iso)` | 52–60 | 조회 헬퍼 |
| `addTodo`, `toggleTodo`, `deleteTodo` | 62–97 | mutate 후 즉시 `saveToStorage()` |
| `selectedDate` (모듈 레벨 let) | 110 | 현재 열린 패널의 ISO. 단일 진실 |
| `escapeHtml`, `formatPanelTitle`, `toItemHtml` | 112–135 | 마크업 유틸. `toItemHtml`은 `<li class="todo-item [todo-item--done]" data-id>` + `.todo-item__check`/`.todo-item__text`/`.todo-item__delete` |
| `renderBadgesForGrid()` | 137–159 | **모든 `.day`를 순회하며 배지 토글 + `.day--selected` 토글** (157) — v1.1 "모두 완료" 표시도 **여기에 통합되는 게 자연스러움** |
| `renderPanelList()` | 161–170 | 리스트 innerHTML 교체 |
| `openPanel(iso)`, `closePanel()` | 172–190 | 패널 표시/숨김. `openPanel`은 마지막에 input.focus() (182) — Enter 입력 흐름의 한 축 |
| `afterRenderMonth(_year,_month)` | 192–195 | calendar.js 훅. 내부적으로 `renderBadgesForGrid()` 호출 |
| 이벤트 위임 — grid click | 199–208 | `cell.closest('.day')` → `openPanel(iso)` |
| 이벤트 위임 — form submit | 210–223 | Enter/click 모두 통합 처리. `input.value = ''` 후 `input.focus()`는 **현재 빠짐** — 단, 브라우저는 submit 후 input의 포커스를 유지한다 |
| 이벤트 위임 — list click | 225–242 | `.todo-item__check` → toggle, `.todo-item__delete` → delete |
| `#todo-panel-close` 클릭 | 244 | `closePanel` |
| `window.todoApp` | 251–264 | 외부 노출 API (`getTodos`, `countByDate`, …, `_dump`, `_reset`) |

### 1.4 `styles.css` 셀렉터 인벤토리 (변경/추가 대상)

| Selector | 라인 | 역할 | v1.1 처리 |
|---|---|---|---|
| `body` (`color: #222; background: #fafafa`) | 3–8 | 글로벌 | 토큰화 |
| `.calendar`, `.calendar__header`, `.calendar__title` | 10–30 | 컨테이너 | 토큰화 |
| `.nav-btn`, `.nav-btn--today` (border `#3478f6`) | 32–48 | 버튼 | 액센트 토큰화 |
| `.weekday-header`, `.weekday-header__cell` (`color: #666`) | 50–63 | 요일 헤더 | 토큰화 |
| `.calendar__grid` (display: grid, 7×6) | 65–71 | 그리드 | 변경 없음 |
| `.day` (배경 `#fff`, border `#e6e6e6`) | 73–85 | 셀 기본 | 토큰화. **`:focus-visible` 추가 대상** |
| `.day__num` | 87–91 | 일자 숫자 | 배지 스타일 다듬기와 별개 |
| `.day--other-month` (color `#b8b8b8`, bg `#f7f7f7`) | 93–96 | 다른 달 | **opacity 또는 muted 토큰으로 일원화** |
| `.day--today` (bg `#3478f6`, color `#fff`) | 98–102 | 오늘 | **연한 액센트 배경 + 굵은 숫자로 톤다운** (요구사항: "라이트 미니멀") |
| `.day--today .day__num` | 104–107 | 오늘 숫자 | 색상 토큰 적용 |
| `.day--selected` (outline `#3478f6`) | 111–114 | 선택 | `:focus-visible`과 시각 충돌 주의 — 분리 |
| `.day__badge` (bg `#e6effd`, color `#3478f6`) | 116–134 | 개수 배지 | 토큰화 + 라이트 톤 다듬기 |
| `.todo-panel*` | 136–174 | 패널 | 토큰화. `.todo-panel__input:focus`(171)는 `:focus-visible`로 변경 |
| `.todo-item`, `.todo-item__check/text/delete` | 176–218 | 항목 | **`.todo-item--done`은 line-through만 있음 — opacity 추가 필요** |
| `.todo-item--done .todo-item__text` (color `#999`) | 220–223 | 완료 | opacity/muted 토큰 |

---

## 2. v1.1 영역별 통합 지점 (어떤 기존 컴포넌트를 건드리는가)

### 2.1 영역 1 — 달력 시각 디자인 (CSS only)

**터치 파일:** `styles.css` (단독), `index.html` 0줄 변경, `*.js` 0줄 변경.

| 변경 셀렉터 | 작업 |
|---|---|
| `:root` (신규) | 디자인 토큰 8–12개 선언 (`--color-bg`, `--color-fg`, `--color-fg-muted`, `--color-border`, `--color-accent`, `--color-today-bg`, `--color-today-fg`, `--color-other-month-fg`, `--radius`, etc.) |
| `body` 3–8, `.nav-btn` 32–48, `.calendar__title` 24–30, `.weekday-header__cell` 57–63 | 색상 리터럴을 토큰 참조로 치환 |
| `.day--today` 98–102 | **재설계** — `background: var(--color-today-bg)` (연한 액센트), `color: var(--color-fg)` (검정 유지), `.day__num` 굵게 |
| `.day--other-month` 93–96 | 토큰화 + opacity 검토 |
| `.day__badge` 116–130, `.day--today .day__badge` 131–134 | 톤다운 |

**데이터 흐름:** 변경 없음.
**JS 연계:** 없음.

### 2.2 영역 2 — 할 일 패널 인터랙션

**터치 파일:** `styles.css` 주, `todo.js` 미세, `index.html` 0줄.

| 변경 지점 | 작업 |
|---|---|
| `.todo-item--done .todo-item__text` (styles.css 220) | `opacity: 0.55`(또는 muted color 토큰) 추가 — 현재 line-through만 있음 |
| (선택) `.todo-item__check`, `.todo-item__delete` | `:focus-visible` outline 정책 적용 |
| `todo.js` form submit 핸들러 (210–223) | **미세 보강:** `input.value = ''` 직후 `input.focus()` 명시 (현재는 브라우저 기본 동작에 의존) |
| `todo.js` list click 핸들러 (225–242) | **변경 없음** — 즉시 삭제·즉시 토글이 이미 정답. 확인 다이얼로그 도입 금지 |
| (선택) `todo.js` `closePanel` (185–190) | Escape 키로 닫는 keydown은 영역 4(키보드)에서 처리 — 여기서는 X |

**데이터 흐름:** 변경 없음 (mutation 함수는 그대로 호출).

### 2.3 영역 3 — 날짜 셀 정보 밀도 ("모두 완료" 체크 + 배지)

**터치 파일:** `todo.js` (`renderBadgesForGrid` 확장), `styles.css` (신규 셀렉터), `index.html` 0줄, `calendar.js` 0줄.

| 변경 지점 | 작업 |
|---|---|
| `todo.js` 신규 헬퍼 `isAllDone(iso)` | `const list = store.byDate[iso]; return Array.isArray(list) && list.length > 0 && list.every(t => t.done)` |
| `todo.js` `renderBadgesForGrid` (137–159) | `count` 분기 안에서 `cell.classList.toggle('day--all-done', isAllDone(iso))` + `.day__all-done` 자식 SVG 토글 (DOM 추가/제거) |
| `styles.css` 신규 | `.day--all-done`, `.day__all-done`, `.day__all-done .icon-check` |
| 인라인 SVG | `<span class="day__all-done" aria-label="모두 완료"><svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M3.5 8.5l3 3 6-7" .../></svg></span>` |

**왜 `renderBadgesForGrid`에 통합하는가 (질문 5):**
- `renderBadgesForGrid`는 이미 **(a)** 모든 `.day`를 순회하고, **(b)** count를 읽어 배지 DOM을 토글하고, **(c)** `.day--selected`를 같이 토글한다 (157).
- "모두 완료"는 동일한 데이터(`store.byDate[iso]`)에서 파생되며, **모든 mutation 후 이미 호출되는 함수**다 (form submit 221, toggle 235, delete 239).
- 별도 함수로 분리하면 4개 호출 사이트에 추가 호출이 필요 → 누락 위험 + 중복 순회.
- **결론:** `isAllDone(iso)`만 작은 헬퍼로 분리(테스트 가능성), 적용은 `renderBadgesForGrid` 내부에서 같은 셀 순회 안에 합침. **새 store 헬퍼는 1개 추가, 새 렌더 함수는 0개.**

### 2.4 영역 4 — 키보드/접근성

**터치 파일:** `calendar.js` 주, `todo.js` 보조, `styles.css` 보조, `index.html` 0줄(또는 거의 0줄).

| 변경 지점 | 작업 |
|---|---|
| `calendar.js` `state` (7–10) | `focusedIso: null` 추가 — roving tabindex의 단일 진실 |
| `calendar.js` `renderMonth` (58–84) 셀 마크업 (77) | 셀에 다음 속성 출력: `tabindex` (포커스 셀이면 `0`, 아니면 `-1`), `aria-current="date"` (오늘에만), `aria-selected` (선택된 날짜에만 — todo.js의 `selectedDate`와 동기화 필요) |
| `calendar.js` 신규 함수 `setFocusedCell(iso)` | 모든 `.day[tabindex]` 재설정 + `cell.focus({preventScroll: true})` |
| `calendar.js` 신규 grid `keydown` 위임 | `cal-grid` 컨테이너에 단일 listener: `ArrowLeft/Right/Up/Down`(±1, ±7), `Home`/`End`(주 시작/끝), `PageUp`/`PageDown`(월 이동), `Enter`/`Space`(선택 → `window.todoApp.openPanel(iso)`) |
| `calendar.js` 신규 page-level `keydown` | `t`/`T` → `goToday()` 후 `setFocusedCell(today)`. `Escape` → `window.todoApp.closePanel()`. **`event.target.tagName === 'INPUT'` 가드 필수** (입력창에서 ←/→가 커서 이동을 가로채면 안 됨) |
| `calendar.js` `renderMonth` 끝부분 | 새 month 렌더 후 `focusedIso`가 그리드 안에 있으면 그 셀로, 아니면 month의 1일로 fallback (재렌더가 focus를 죽이므로 명시적 복원) |
| `todo.js` `openPanel` (172–183) / `closePanel` (185–190) | `closePanel`에서 `document.activeElement`가 패널 내부였으면 `setFocusedCell(prevIso)`로 포커스 복귀 |
| `styles.css` 신규 | 글로벌 `:focus-visible { outline: 2px solid var(--color-accent); outline-offset: 2px; }`. `.day:focus-visible` 별도 처리. `.todo-panel__input:focus`(171)는 `:focus-visible`로 변경 |
| `styles.css` (선택) | `@media (prefers-reduced-motion: reduce)` — transition 도입 시 0s |

**기존 click 이벤트 유지:** grid의 click 위임(todo.js 199–208)은 마우스 사용자를 위해 그대로. keydown의 `Enter`/`Space`도 같은 `openPanel(iso)`을 호출하므로 분기 통합.

---

## 3. CSS 파일 분리 vs 단일 styles.css 확장 (질문 3)

**권고: 단일 `styles.css` 확장.**

근거:
- 현재 224줄. 토큰 + a11y 정책 + 신규 셀렉터 추가해도 ~350줄 미만 — 분할 가치 없음.
- 분할은 페이지에서 `<link>` 태그 추가 또는 `@import`(추가 RTT) 필요. 정적 사이트 이점이 깎인다.
- 분할이 정당화되려면 **컴포넌트 단위 격리** 또는 **번들러**가 전제 — 둘 다 v1.1 constraint 위반.
- 단, **파일 내부의 논리적 섹션 구분 주석**은 강하게 권장 (이미 `/* === Phase 2: ... === */` 패턴 존재 — 109줄). 새 섹션:
  ```
  /* === v1.1 §1: design tokens === */
  /* === v1.1 §2: focus policy === */
  /* === v1.1 §3: motion preferences === */
  /* === v1.1 §4: all-done check === */
  ```

**대안 (비채택):** `tokens.css` 분리는 미래에 다크모드/테마 도입 시점에 의미가 있다. 그 때 옮기면 됨. 지금은 YAGNI.

---

## 4. 셀 focusable 여부 + 변경 지점 (질문 4)

**현재 상태 (확인됨):**
- `calendar.js` 77번 셀 마크업: `<div class="..." role="gridcell" data-date="...">` — **`tabindex` 없음 → 셀은 키보드 포커스 불가능**.
- `#cal-grid`(31)에도 `tabindex` 없음 → **그리드 자체도 포커스 불가**.
- `index.html`에 정적 셀이 없으므로(런타임 생성), **마크업을 고치는 단일 지점은 `calendar.js`의 `renderMonth` 77번 라인**.

**변경 (roving tabindex 패턴, WAI-ARIA grid 권고):**
1. `state.focusedIso` 도입 (calendar.js).
2. `renderMonth` 셀 빌드 시 `tabindex = (iso === state.focusedIso) ? '0' : '-1'` 출력.
3. 초기값: `state.focusedIso = toISODate(state.year, state.month, 1)` 또는 오늘이 현재 month 안이면 오늘.
4. 키보드 네비 시 `setFocusedCell(newIso)` → tabindex 재배포 + `el.focus()`.
5. 월 이동 후 (renderMonth 직후) `focusedIso`가 새 month 안에 있는지 검사하고 없으면 1일로 fallback.

**왜 셀별 roving이고 grid 컨테이너 단일 tabindex가 아닌가:**
- WAI-ARIA Grid 패턴은 두 방식 모두 허용. 그러나 **실제 사용 셀로 곧장 포커스가 들어가야 화면 리더가 "선택된 일자"를 즉시 읽을 수 있다.**
- 컨테이너 단일 tabindex 방식은 키보드 네비 코드는 단순하지만, focus ring의 위치가 컨테이너 전체에 그려져 시각적 피드백이 모호해진다.

---

## 5. "모두 완료" 검사 위치 — store 헬퍼 vs 셀 렌더 시점 (질문 5)

**권고: store 헬퍼 `isAllDone(iso)` + 렌더 시점 호출 (둘 다, 책임 분리).**

| 옵션 | 장 | 단 | 결정 |
|---|---|---|---|
| (A) `renderBadgesForGrid` 안에서 `list.every(t => t.done) && list.length > 0`을 인라인 | 코드 1줄 | **데이터 의미가 렌더 함수에 묻힘**. 향후 키보드 네비 a11y에서도 같은 검사가 필요해질 수 있음 | 비권장 |
| (B) `todo.js`에 `isAllDone(iso)` 헬퍼 추가 + `renderBadgesForGrid`에서 호출 | 데이터 질문은 데이터 레이어에. `window.todoApp.isAllDone`로 공개 가능. 테스트 단위 명확 | 함수 1개 증가(미미) | **✓ 채택** |
| (C) store에 `allDoneByDate: Set` 같은 파생 캐시 | 빠름 | 모든 mutation에서 동기화 필요 — 버그 표면적 증가, 42셀 규모에 불필요 | **금지 (YAGNI)** |

**구현 위치:** `countByDate` 바로 아래 (todo.js 60 근처).

```js
function isAllDone(iso) {
  if (!isValidIso(iso)) return false;
  const list = store.byDate[iso];
  return Array.isArray(list) && list.length > 0 && list.every(t => t.done);
}
```

**렌더 시점 호출:** `renderBadgesForGrid` 셀 순회 안에서 `count`를 이미 계산하므로, 같은 자리에서 `isAllDone(iso)` 호출. 추가 순회 없음.

**`window.todoApp` export:** `isAllDone`을 외부 API에 추가 — 키보드 네비 a11y(`aria-label`에 "모두 완료" 포함)에서 calendar.js가 사용할 수 있게.

---

## 6. 페이즈 의존성 그래프 (질문 6)

**가정:** v1.1 = 4개 영역 → 충돌 없는 페이즈 분해.

```
┌───────────────────────────────────────────────────────────────┐
│  Phase A — 디자인 토큰 + 시각 디자인 (CSS only)                  │
│  files: styles.css                                             │
│  no JS / no HTML changes                                       │
└──────────────┬────────────────────────────────────────────────┘
               │ provides: var(--color-accent), --color-today-bg, …
               │           :focus-visible 정책 (영역 4가 의존)
               ▼
┌───────────────────────────────────────────────────────────────┐
│  Phase B — 할 일 패널 인터랙션 + "모두 완료" 표시                  │
│  files: todo.js (isAllDone, renderBadgesForGrid 확장,           │
│           submit 후 input.focus() 보강),                        │
│         styles.css (.day--all-done, .todo-item--done opacity), │
│         index.html (no change — SVG는 JS에서 생성)              │
└──────────────┬────────────────────────────────────────────────┘
               │ provides: window.todoApp.isAllDone
               │           셀에 .day--all-done 클래스/SVG 토글
               ▼
┌───────────────────────────────────────────────────────────────┐
│  Phase C — 키보드 / 접근성 (roving tabindex + 단축키 + aria)     │
│  files: calendar.js (state.focusedIso, renderMonth 마크업       │
│           확장, setFocusedCell, grid keydown, page keydown),    │
│         todo.js (closePanel 포커스 복귀),                       │
│         styles.css (.day:focus-visible 다듬기)                 │
└───────────────────────────────────────────────────────────────┘
```

**왜 이 순서인가:**
1. **A 먼저**: 토큰이 깔리지 않으면 B/C에서 추가하는 신규 셀렉터(`.day--all-done`, `.day:focus-visible`)도 색상 리터럴을 박게 됨 → 두 번 일하게 된다.
2. **B 두 번째**: B는 데이터 헬퍼(`isAllDone`)와 렌더 통합만 다루므로 **calendar.js를 건드리지 않는다**. 따라서 C와 평행 가능하지만, C가 셀 마크업(라인 77)을 크게 건드리므로 같은 라인 충돌을 막기 위해 직렬화. 또한 B의 `renderBadgesForGrid` 확장이 끝나야 C에서 `aria-label`로 "모두 완료"를 안전하게 부착할 수 있다.
3. **C 마지막**: 셀 마크업(`tabindex`/`aria-current`/`aria-selected`)을 가장 광범위하게 변경. A의 토큰과 B의 클래스 토글 위에 얹는다.

**충돌 방지 체크리스트:**
- A에서 `renderMonth`(calendar.js)와 `renderBadgesForGrid`(todo.js) **수정 금지** — CSS에 한정.
- B에서 `renderMonth`(calendar.js)의 셀 마크업 라인(77) **수정 금지** — todo.js의 `renderBadgesForGrid` 안에서 DOM 조작으로만 클래스/자식 토글.
- C에서 셀 마크업을 확장할 때, B에서 추가된 `.day--all-done`/자식 SVG가 `renderMonth`의 `innerHTML` 교체로 날아가는 점을 인지 → C 후 `afterRenderMonth` 훅이 즉시 다시 칠하므로 OK (현재도 같은 패턴, calendar.js 83).
- `selectedDate`(todo.js 110)와 `focusedIso`(C에서 calendar.js에 추가)는 **다른 개념**: 전자는 "패널이 열린 날짜", 후자는 "키보드 포커스 위치". 동일화하려는 유혹을 피한다 — 마우스 사용자는 패널만 열고 다른 셀로 keyboard 이동을 원할 수 있다.

**병렬화 가능성 (참고):** A와 B는 충돌 없이 병렬 가능 (서로 다른 파일/셀렉터). 그러나 B에서 `.day--all-done` 색상에 토큰을 쓰려면 A의 토큰이 먼저 land해야 하므로, **단순성 위해 직렬 권장**.

---

## 7. 데이터 흐름 변화 — 명시적 진술

**v1.1 마일스톤 전체에서 데이터 흐름 변화는 0건.**

- localStorage 키: `todo-gsd:v1` (변경 없음)
- 스키마: `{ version: 1, byDate: { [iso]: Todo[] } }` (변경 없음)
- `Todo` shape: `{ id, text, done, createdAt }` (변경 없음)
- mutation entry points: `addTodo` / `toggleTodo` / `deleteTodo` (시그니처 변경 없음, 호출 사이트 변경 없음)
- 렌더 트리거: form submit / list click / panel close / month nav — 모두 기존과 동일
- 신규 read-only 헬퍼: `isAllDone(iso)` (조회만, mutation 0)
- 신규 모듈 상태: `state.focusedIso` (calendar.js 안, **localStorage에 저장 안 함** — 세션 한정 UI 상태)

**스키마 마이그레이션 불필요. 스키마 mismatch 폴백 로직(todo.js 22)도 변경 없음.**

---

## 8. Component Responsibilities (v1.1 적용 후 최종 형태)

| 컴포넌트 | 파일 | v1 책임 | v1.1 추가 책임 |
|---|---|---|---|
| Calendar grid renderer | calendar.js | 월 셀 빌드/렌더, 월 이동 | roving tabindex 마크업 출력, `aria-current`/`aria-selected`, `focusedIso` 보존, 키보드 네비, 단축키 |
| Todo store + persistence | todo.js (1–106) | CRUD + localStorage | (변경 없음) |
| Todo UI renderer | todo.js (108–242) | 패널/리스트/배지 렌더, 이벤트 위임 | "모두 완료" 클래스/SVG 토글, 완료 항목 opacity, panel close 시 focus 복귀, `isAllDone` 헬퍼 |
| Static markup | index.html | 정적 셸 | (거의 변경 없음 — JS가 동적 속성 부여) |
| Visual layer | styles.css | 모든 스타일 | 토큰 + `:focus-visible` + `.day--all-done` + `.todo-item--done` opacity + reduced-motion |

**책임 경계 원칙:**
- **데이터 질문은 todo.js가 답한다** (`isAllDone` 추가).
- **포커스/키보드 네비는 calendar.js가 소유한다** (그리드 책임).
- **패널 포커스 복귀는 todo.js가 calendar.js의 `setFocusedCell`을 호출** (단방향 의존: todo.js → calendar.js, 이미 todo.js → window.calendarApp 접근 가능).
- **CSS는 행동을 모른다** — 클래스 토글(JS) → 시각화(CSS) 분리 유지.

---

## Sources

- 직접 코드 읽기: `/Users/insang/Documents/.../todo-gsd/index.html`, `styles.css`, `calendar.js`, `todo.js` (HIGH — 라인 번호와 함수명 인용).
- `.planning/PROJECT.md`, `.planning/ROADMAP.md`, `.planning/research/STACK.md` (HIGH — 같은 마일스톤 문서 일관성 유지).
- W3C WAI-ARIA Authoring Practices — Grid Pattern (roving tabindex), Date Picker Dialog Pattern (HIGH).
- MDN — `:focus-visible`, `aria-current`, `Element.focus({preventScroll})`, `KeyboardEvent.key` (HIGH).

---
*Architecture research for: v1.1 UX 다듬기*
*Researched: 2026-04-28*
