# Stack Research — v1.1 UX 다듬기

**Domain:** Static personal calendar-todo web app (HTML/CSS/Vanilla JS, localStorage)
**Researched:** 2026-04-28
**Confidence:** HIGH (모두 well-established 표준 웹 기술 — MDN/CSSWG 명세 기반)

> **Hard constraint reminder:** v1.1은 **신규 의존성 금지**. 빌드 도구, 프레임워크, npm, 아이콘 폰트 패키지, CSS 프레임워크 모두 도입 불가. 아래 "추천"은 모두 **브라우저에 이미 들어있는 표준 기술**만 다룬다.

---

## Recommended Stack (표준 기술/Web API additions)

이번 마일스톤은 라이브러리를 추가하는 것이 아니라, **이미 사용 가능한 플랫폼 기능을 새로 활용**하는 것이다. 아래는 v1.1 요구사항을 충족시키기 위해 도입할 표준 기술 목록.

### Core Technologies (이미 사용 중 — 변경 없음)

| Technology | Purpose | v1.1에서의 역할 |
|------------|---------|----------------|
| HTML5 (semantic + ARIA) | 마크업 | aria-label/aria-current/role 보강 |
| CSS3 | 스타일링 | custom properties / pseudo-classes 신규 활용 |
| Vanilla JS (ES2020+) | 동작 | KeyboardEvent / focus management 신규 활용 |
| localStorage | 영속화 | (변경 없음 — 데이터 모델 동일) |

### CSS Features to Newly Adopt

| Feature | 적용 대상 v1.1 요구사항 | 왜 필요한가 |
|---------|------------------------|-------------|
| **CSS custom properties (`--color-bg`, `--color-fg`, `--color-accent`, `--color-muted`, `--color-today-bg` …)** | 라이트 미니멀 톤 통일 (시각 디자인 다듬기) | 현재 styles.css에 색상 리터럴(`#3478f6`, `#fafafa`, `#222` …)이 산발적으로 박혀있다. 토큰화하면 톤 정돈이 한 곳에서 끝나고, 향후 다크모드 도입(out of scope이지만)에도 마찰 적음. **별도 빌드 없이 :root에 선언만 하면 됨.** |
| **`:focus-visible`** | 키보드/접근성 (방향키 그리드 네비) | 현재 `.todo-panel__input:focus`만 있다. 키보드 사용자에게는 outline을 보여주고, 마우스 클릭에는 안 보여주는 게 정석. 모든 모던 브라우저 지원. |
| **`:focus-within`** | 할 일 패널 인터랙션 (Enter 입력 흐름) | 패널이 입력 모드일 때 컨테이너 단위로 시각 피드백 줄 때 유용 (선택적). |
| **`:has()` selector (선택적, 신중하게)** | 모두 완료 시 체크 아이콘 표시 | 가능은 하지만, **JS에서 클래스를 추가하는 방식이 더 단순**하고 호환성 안전. → JS 쪽으로 처리 권장. |
| **`@media (prefers-reduced-motion: reduce)`** | 인터랙션 다듬기 (전환/애니메이션 도입 시) | 완료 토글에 transition을 줄 거면 reduced-motion 사용자에겐 끄는 게 a11y 표준. **transition은 0.1~0.15s 정도로만, 과하지 않게.** |
| **`aria-current="date"` / `aria-current="true"`** | 오늘 강조 | 시각 강조뿐 아니라 스크린리더에도 "현재" 의미 전달. |
| **`role="grid"` + `aria-selected` / `tabindex` roving** | 방향키 그리드 네비게이션 | 이미 `role="grid"`/`role="gridcell"` 마크업은 있음. **roving tabindex 패턴**(한 번에 셀 하나만 `tabindex=0`, 나머지는 `tabindex=-1`)을 JS로 구현해야 방향키 네비가 정상 동작. WAI-ARIA Authoring Practices의 grid 패턴. |
| **CSS gradient/배경 + border 조합** | 오늘 강조 — "배경색"으로 변경 | 현재는 진한 파란 배경에 흰 글자(과한 강조). 라이트 미니멀 톤이면 **연한 액센트 배경(예: `--color-today-bg: #eaf2ff`) + 굵은 숫자**로 톤다운. |
| **`text-decoration: line-through` + `opacity` / `color`** | 완료 항목 취소선+흐리게 | 이미 line-through는 있음. 흐리게는 opacity 0.55~0.6 또는 muted color로. |

### JavaScript / Web APIs to Newly Adopt

| API / Pattern | 적용 대상 v1.1 요구사항 | 왜 필요한가 |
|---------------|------------------------|-------------|
| **`KeyboardEvent` + `event.key`** | ←/→/T 단축키, 방향키 그리드 네비 | `event.key === 'ArrowLeft'` / `'ArrowRight'` / `'t'` / `'T'` / `'Home'` / `'End'` / `'Enter'` / `'Escape'` 사용. **`keyCode` 절대 쓰지 말 것 (deprecated).** |
| **`document.activeElement`** | focus management | 패널 닫을 때 원래 셀로 포커스 복귀 등 a11y 흐름. |
| **`element.focus({ preventScroll: true })`** | 그리드 네비 시 포커스 이동 | 방향키로 셀 이동할 때 스크롤 점프 방지 옵션. |
| **이벤트 위임 + `event.target.closest('.day')`** | 그리드 키보드 핸들러 | 이미 click에는 위임을 쓰고 있음. keydown도 grid 컨테이너에 한 번만 붙이면 됨. |
| **`matchMedia('(prefers-reduced-motion: reduce)')`** (선택적) | JS-driven 애니메이션 분기 | CSS @media로 충분하면 불필요. |
| **Form: `<input>` `keydown` Enter 처리는 form submit으로** | 할 일 입력 흐름 | 이미 `<form>` + submit 위임이 들어있음 — **별도 keydown 핸들러 추가 금지**. 추가 입력 흐름(예: Escape로 패널 닫기)만 keydown으로 보강. |
| **`element.scrollIntoView({ block: 'nearest' })`** | 방향키 네비로 다른 달 진입 시 (선택적) | 6주 그리드는 한 화면에 다 들어오므로 보통 불필요. |
| **`requestAnimationFrame`** | 필요 없음 | 현재 렌더 규모(42셀)에선 직접 DOM 조작이 충분히 빠르다. **도입하지 말 것 — 과도한 최적화.** |

### Iconography 결정 — 체크 아이콘 ("모두 완료된 날짜")

**권장: 인라인 SVG (단 1개의 작은 path).**

| Option | Pros | Cons | 결정 |
|--------|------|------|------|
| **Inline SVG (currentColor 사용)** | 의존성 0, 색상이 CSS의 `color`/custom property 따라감, 선명함, a11y 시 `<svg aria-hidden="true">` 또는 `<title>` 처리 명확 | 마크업이 약간 길어짐 (path 1줄) | **✓ 채택** |
| CSS pseudo-element (`::after`) + border trick으로 체크마크 그리기 | DOM 추가 0 | 회전된 border 트릭은 모양 미세조정 어렵고, 다른 셀에 영향 줄 수 있음 | 가능하지만 SVG가 더 깔끔 |
| Unicode `✓` (U+2713) / `✔` (U+2714) | 가장 단순 | **폰트마다 모양이 다름** (system-ui 폰트별 렌더링 편차), 크기 조절 한계, 라이트 미니멀 톤 어긋날 위험 | 비권장 |
| 시스템 폰트 / emoji `✅` | 0 비용 | emoji는 컬러풀해서 미니멀 톤 깨짐, 운영체제별 모양 다름 | 비권장 |
| 아이콘 폰트 패키지 (Font Awesome 등) | — | **신규 의존성 — constraint 위반** | **금지** |

**구현 패턴:**
```html
<span class="day__all-done" aria-label="모두 완료">
  <svg class="icon-check" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
    <path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor"
          stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
</span>
```
- `currentColor`로 그려서 셀의 글자색(또는 액센트 색)을 그대로 받음.
- `aria-hidden="true"` + 부모에 `aria-label`로 의미 전달 (스크린리더 중복 방지).
- v1.1에서 필요한 SVG는 **체크 아이콘 1개뿐** — 라이브러리 도입 정당화 불가.

### Browser Compatibility (한 줄 메모)

- 본 프로젝트는 "최신 데스크톱 브라우저"를 가정 (Chrome / Edge / Firefox / Safari ≥ 2023 버전).
- 위에 나열한 모든 기능 — CSS custom properties, `:focus-visible`, `prefers-reduced-motion`, `aria-current`, `KeyboardEvent.key`, inline SVG, `focus({preventScroll})` — 은 **2022년 이후 모든 메이저 브라우저에서 지원**됨. polyfill 불필요.
- IE11 등 레거시는 비대상.
- `:has()`만 비교적 최근(2023 후반 보편화)이라, **사용 가능하지만 핵심 기능에 의존하지 말 것** — JS 클래스 토글이 더 안전.

---

## Code Structure 변경 — 현재 파일에 추가할 섹션/모듈

기존 4개 파일 구조 유지. **새 파일 추가 없음.** 각 파일의 추가/수정 지점만 표시.

### `index.html` — 마이너 추가
- `<main class="calendar">`에 **`tabindex="0"` 또는 셀별 roving tabindex 도입** (그리드 키보드 네비 진입점).
- 셀 마크업에 `aria-selected` 속성을 동적으로 토글할 수 있도록 JS 측 책임으로 둔다 (마크업 자체 변경은 거의 없음).
- 패널의 입력창에 이미 `aria-label`이 있음 — OK. 그 외 ARIA 속성 정비는 JS가 동적으로 set/unset.
- 새 셀 자식: `<span class="day__all-done">` (체크 아이콘) — **모두 완료된 날짜에만 JS가 추가**.
- (선택) `<svg>` symbol을 `<head>` 또는 `<body>` 시작에 한 번 정의해두고 `<use>`로 참조하는 방식도 가능 — 하지만 체크 1개뿐이라 굳이 안 해도 됨.

### `styles.css` — 큰 폭의 다듬기 (구조 분할)
파일 상단에 새 섹션을 추가하고, 기존 색상 리터럴을 토큰으로 치환.

새 섹션 순서 권장:
1. **`:root` design tokens** — `--color-bg`, `--color-surface`, `--color-fg`, `--color-fg-muted`, `--color-border`, `--color-accent`, `--color-today-bg`, `--color-today-fg`, `--color-other-month-fg`, `--radius-sm`, `--radius-md`, `--space-1..4`, `--font-size-sm/base`. (단, 토큰을 너무 많이 만들지 말 것 — 실제 쓰는 것만.)
2. **`:focus-visible` 글로벌 outline 정책** — 모든 인터랙티브 요소에 일관된 outline.
3. **`@media (prefers-reduced-motion: reduce)`** — transition/animation 모두 0s로 (transition을 도입하는 경우에 한해).
4. 기존 `.calendar`, `.day`, `.todo-panel` 스타일을 토큰 기반으로 리팩토링.
5. 신규: `.day--all-done`, `.day__all-done .icon-check`, `.todo-item--done` 강화 (opacity 등).

### `calendar.js` — 키보드 네비/포커스 로직 추가
- 새 모듈 상태: `focusedIso`(현재 포커스된 셀의 ISO 날짜) — 그리드 roving tabindex의 단일 진실.
- 새 함수:
  - `setFocusedCell(iso)` — 모든 셀의 `tabindex` 재설정, 해당 셀 `.focus({preventScroll: true})`.
  - 그리드 컨테이너에 **단 하나의 `keydown` 리스너** — `ArrowLeft/Right/Up/Down/Home/End/PageUp/PageDown/Enter/Space` 처리.
  - 페이지 레벨 `keydown` 리스너 — `ArrowLeft`(Cmd/Ctrl 없이는 그리드 안에서만 동작하도록 분리), `T`/`t` (오늘로), `Escape` (패널 닫기). **단축키가 input 안에서 트리거되지 않도록 `event.target.tagName === 'INPUT'` 가드 필요.**
- `renderMonth` 내부: 셀에 `aria-current="date"`(오늘) 속성 추가, `tabindex` 부여 정책 적용.
- `window.calendarApp`에 `setFocusedCell` 노출 (선택).

### `todo.js` — 인터랙션 다듬기 + "모두 완료" 표시
- 신규 헬퍼: `isAllDone(iso)` — `store.byDate[iso]`가 비어있지 않고 모든 항목 `done === true`이면 true.
- `renderBadgesForGrid()` 확장: count뿐 아니라 `.day--all-done` 클래스와 `.day__all-done` 자식(SVG) 토글.
- 삭제 즉시 반영(no-undo): 이미 즉시 삭제 동작 중 — 변경 없음. **확인 다이얼로그 도입 금지** (스코프 외).
- Enter 입력 흐름: 이미 `<form>` submit 처리됨 — 추가 작업 없음. **다만, 포커스를 입력창에 유지**(추가 후 자동 비움 + 포커스 잔존)하는지 확인 (현재 코드도 그렇게 동작).
- (선택) 완료 토글 시 transition 0.1s — `prefers-reduced-motion`이면 0s.
- `aria-live="polite"`는 이미 `<ul id="todo-list">`에 있음 — OK.

---

## What NOT to Use (도입 금지 목록 — anti-additions)

| 도입 금지 | 이유 | v1.1에서의 대안 |
|----------|------|----------------|
| **CSS 프레임워크 (Tailwind, Bootstrap, Bulma 등)** | 신규 의존성 — constraint 위반. 라이트 미니멀 톤을 일관시키는 데에 필요한 것은 토큰 4~10개일 뿐. | `:root` CSS custom properties |
| **CSS-in-JS / styled-components / Emotion** | 빌드/런타임 의존성 — constraint 위반 | 평범한 .css 파일 |
| **아이콘 폰트 패키지 (Font Awesome, Material Icons, Lucide-font 등)** | 신규 의존성, 폰트 로딩 비용, 미니멀 톤 어긋남 | 인라인 SVG 1개 (체크) |
| **아이콘 라이브러리 npm 패키지 (lucide, heroicons, react-icons …)** | 신규 의존성 | 인라인 SVG path 1줄 |
| **빌드 도구 (Vite, esbuild, webpack, parcel)** | constraint 정면 위반 | static 파일 그대로 |
| **JS 프레임워크/라이브러리 (React, Vue, Alpine, htmx, lit …)** | constraint 정면 위반. 현재 todo.js는 ~250줄로 충분히 관리 가능. | Vanilla JS 유지 |
| **상태관리 라이브러리** | 과도한 추상화. store는 이미 단일 객체 + 4개 mutate 함수로 충분. | 현재 패턴 유지 |
| **유틸리티 라이브러리 (lodash, dayjs, date-fns)** | 신규 의존성. 날짜 계산은 이미 `Date` + ISO 헬퍼로 끝나있음. | 표준 `Date` |
| **테마 시스템 / 다크모드** | PROJECT.md Out of Scope ("v1.1 범위 초과 — 테마 시스템 도입 비용") | 라이트 단일 톤만 |
| **`requestAnimationFrame` 기반 애니메이션 엔진** | 42셀 규모에 과도 | CSS transition (0.1~0.15s) |
| **모바일 반응형 / 터치 제스처 / 핀치줌 처리** | PROJECT.md Out of Scope (데스크톱 UX 우선) | 데스크톱 키보드 + 마우스만 |
| **확인 다이얼로그(`window.confirm`) for 삭제** | 요구사항 = "즉시 삭제 no-undo" — 다이얼로그 추가는 요구사항 위반 | 즉시 삭제 그대로 |
| **`localStorage` 스키마 마이그레이션** | v1.1은 데이터 모델 변경 없음 — version=1 그대로 | 변경 없음 |
| **deprecated `KeyboardEvent.keyCode`** | 표준 deprecated, key가 정답 | `event.key` 비교 |
| **`outline: none`을 무조건 적용** | a11y 위반 — 키보드 사용자 포커스 표시 사라짐 | `:focus-visible`로 분기 |
| **글로벌 keydown으로 모든 단축키 처리 (input 안에서도 동작)** | 입력창에서 ←/→로 커서 이동을 못 하게 됨 | `event.target.tagName === 'INPUT'` 가드 |
| **emoji 기반 체크 아이콘 (`✅`, `✔`)** | OS별 모양 차이, 미니멀 톤 깨짐 | 인라인 SVG `<path>` |

---

## Stack Patterns by Variant

**기능 → 표준 기술 매핑 (요구사항 traceability 도우미):**

- 달력 시각 디자인 다듬기 → CSS custom properties + `aria-current` + 톤 다운 색상
- 할 일 패널 인터랙션 다듬기 → `text-decoration` + `opacity` + 기존 `<form>` submit + (선택) `transition` + `prefers-reduced-motion`
- 날짜 셀 정보 밀도 (배지 + 모두 완료 체크) → 기존 배지 스타일 정돈 + 인라인 SVG + `.day--all-done` 클래스
- 키보드/접근성 (←/→/T/방향키 그리드/aria-label) → `KeyboardEvent.key` + roving tabindex (`role="grid"` 패턴) + `:focus-visible` + `aria-current` + `aria-selected` + `aria-label` 정비

---

## Open Questions for Roadmap (downstream consumer 참고)

다음 단계(REQUIREMENTS/ROADMAP)에서 결정해야 할 사항:

1. **방향키 그리드 네비의 월 경계 동작** — Right at 말일 → 다음 달로 자동 진입할지, 그리드 끝에서 멈출지. (WAI-ARIA grid 패턴은 멈춤이 기본, 캘린더 UX는 진입이 일반적. 권장: 진입 + 자동 월 전환.)
2. **단축키 충돌** — `T`만 단독 처리할지, `Cmd/Ctrl+T`(브라우저 새 탭)와 충돌하지 않도록 modifier 없이 단독 키만 받을지. 권장: modifier 없는 단독 `t`/`T`만.
3. **transition 도입 여부** — 완료 토글에 부드러운 전환을 줄지(미니멀 톤이면 굳이 없어도 됨). 권장: 안 넣는 것이 미니멀에 부합. 넣는다면 0.1s + reduced-motion 분기 필수.
4. **Phase 분할** — (a) 비주얼 토큰 + 시각 다듬기, (b) 인터랙션 다듬기 + 모두 완료 체크, (c) 키보드/접근성 — 의 3개 페이즈로 자연스럽게 분리됨. (a)와 (b)는 독립, (c)는 마크업/JS 변경이 가장 크므로 가장 마지막.

---

## Sources

- MDN — `:focus-visible`, `prefers-reduced-motion`, `KeyboardEvent.key`, `aria-current`, CSS custom properties, `Element.focus({preventScroll})` (HIGH confidence — 표준 명세).
- W3C WAI-ARIA Authoring Practices — Grid Pattern (roving tabindex), Date Picker Dialog (HIGH confidence).
- 현재 리포지토리 코드 (`index.html`, `styles.css`, `calendar.js`, `todo.js`) — 기존 구조/네이밍/패턴 직접 확인 (HIGH confidence).
- PROJECT.md / REQUIREMENTS.md / ROADMAP.md — 제약 및 Out of Scope 항목 (HIGH confidence — 프로젝트 문서).

---
*Stack research for: v1.1 UX 다듬기*
*Researched: 2026-04-28*
