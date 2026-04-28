# Pitfalls Research — v1.1 UX 다듬기

**Domain:** UX-polish layer on existing static HTML/CSS/Vanilla JS calendar-todo app (localStorage)
**Researched:** 2026-04-28
**Confidence:** HIGH (WAI-ARIA Authoring Practices Grid Pattern, MDN, W3C compositionevent 명세, WCAG 2.1 contrast — 모두 표준 출처)

> 이 문서는 **v1.1 UX-polish를 v1 코드 위에 올릴 때**에 한정한 함정만 다룬다. 일반적인 웹 보안/성능 함정은 다루지 않는다.
> 마일스톤은 자연스럽게 3개 페이즈로 분할된다 (STACK.md Open Question #4):
> - **Phase A** — 비주얼 토큰 + 시각 다듬기 (오늘 강조, 다른 달, 라이트 톤)
> - **Phase B** — 인터랙션 다듬기 + 모두 완료 체크 + 배지 정돈
> - **Phase C** — 키보드/접근성 (←/→/T, 그리드 네비, ARIA, focus 관리)
> Phase 표기는 이 분할 기준이다.

---

## At-a-Glance Summary (downstream consumer 표)

| # | Pitfall | Severity | Phase | Prevention (one-liner) |
|---|---------|----------|-------|-----------------------|
| 1 | "오늘" 배경색 vs 텍스트 대비 깨짐 (WCAG AA) | **CRITICAL** | A | 라이트 톤 배경(`#eaf2ff`)에 진한 글자(`#1a3d8f`); 4.5:1 명도비 측정 후 채택 |
| 2 | 다른 달 셀 opacity 과도 → 클릭 어포던스 상실 | HIGH | A | `opacity` 대신 `color`/`background` 토큰만 변경, 클릭은 동일 동작 유지 |
| 3 | 취소선 + 흐리게 동시 적용 → 가독성 vs 인지 부담 | HIGH | B | line-through는 유지, opacity는 `0.55` 이상 (절대 0.3 이하 금지), color는 muted 토큰 |
| 4 | 즉시 삭제 + no-undo + 작은 버튼 → 오삭제 | HIGH | B | 삭제 버튼 hit-area ≥ 28×28px, 텍스트와 ≥ 12px gap, 텍스트 영역과 다른 컬러 |
| 5 | **한국어 IME 조합 중 Enter → 미완성 글자 추가** | **CRITICAL** | B | `compositionstart`/`compositionend` 플래그로 조합중 submit 차단, `keydown`이 아닌 `submit` 이벤트만 사용 |
| 6 | 방향키 그리드 네비의 월 경계에서 focus 증발 | HIGH | C | 1일에서 ←는 자동으로 이전 달로 진입 + `setFocusedCell(이전달 말일)` 호출, 절대 `null`로 두지 말 것 |
| 7 | roving tabindex 누락 → Tab으로 42셀 전부 순회 | HIGH | C | 그리드 진입 시 1개 셀만 `tabindex=0`, 나머지 `tabindex=-1`; 단일 진실 `focusedIso` |
| 8 | aria-label 과잉 → 스크린리더 출력 폭주 | MEDIUM | C | 셀 1개당 label 1개 ("4월 28일, 할 일 3개, 오늘"), 자식 SVG/배지는 `aria-hidden="true"` |
| 9 | `:focus-visible` 누락 → 마우스 클릭 시 outline 깜빡임 | MEDIUM | C | 글로벌 `:focus { outline: none }` 금지; `:focus-visible`로만 outline 표시 |
| 10 | `prefers-reduced-motion` 미준수 → 멀미 유발 | MEDIUM | B | transition을 도입할 거면 `@media (prefers-reduced-motion: reduce)`로 0s 강제 |
| 11 | localStorage 키/스키마 무심코 변경 → v1 데이터 증발 | **CRITICAL** | A/B/C | `STORAGE_KEY = 'todo-gsd:v1'`/`SCHEMA_VERSION = 1` 변경 금지 — 페이즈 verify에 grep 가드 |
| 12 | 글로벌 단축키가 input 안에서도 트리거 | HIGH | C | 페이지 keydown에 `if (e.target.tagName === 'INPUT') return` 가드 |
| 13 | "오늘"이 **다른 달 표시** 동안에도 강조됨 | MEDIUM | A | 기존 `!c.otherMonth && isSameYMD(...)` 가드 유지, 토큰 리팩토링 시 사라뜨리지 말 것 |
| 14 | 모두 완료 체크 표시가 0건일 때도 켜지는 off-by-one | MEDIUM | B | `isAllDone`은 `length > 0 && every(done)` — 빈 배열 false 명시 |
| 15 | 배지 색이 "오늘" 배경 위에서 안 보임 | MEDIUM | A | `.day--today .day__badge` 별도 토큰 페어로 명시 (이미 v1에 있음 — 토큰화하면서 누락 금지) |

---

## Critical Pitfalls

### Pitfall 1: "오늘" 배경색이 텍스트 대비를 깨뜨림 (WCAG AA 미달)

**What goes wrong:**
v1은 `.day--today { background: #3478f6; color: #fff }`로 강한 파란 배경 + 흰 글자였다 (대비 4.5:1 OK). 라이트 미니멀로 톤다운하면서 무심코 `background: #cfe0ff` (연한 파랑) + `color: #fff` 또는 기본 `#222`로 바꾸면, 흰 글자는 대비 ~1.6:1로 **WCAG AA 미달**, 검은 글자는 대비 OK지만 강조가 약해져서 "오늘"이 안 보인다. 더 흔한 실수는 배지(`.day__badge`)에만 신경쓰고 숫자 자체의 대비는 잊는 것.

**Why it happens:**
"라이트 톤" = "연하게" 라는 단순 치환. 디자인 토큰을 바꿀 때 fg/bg 페어를 같이 검증하지 않음. 또 v1 시절의 `.day--today .day__num { color: #fff }` 규칙이 토큰 리팩토링 중에 사라지면서, 일반 셀 색(`#222`)이 연한 배경 위에 그대로 적용되어 "보이긴 하지만 '오늘' 같지 않음" 상태가 됨.

**How to avoid:**
- 토큰 정의: `--color-today-bg: #eaf2ff; --color-today-fg: #1a3d8f;` — 명도비 ≥ 7:1 (WCAG AAA) 우선, 최소 4.5:1.
- 페이즈 verify에 명시: 크롬 DevTools의 Contrast checker로 `.day--today` 텍스트/배경 비율 측정, 스크린샷 첨부.
- 배경만 바꾸지 말고 **숫자에 `font-weight: 700` + 진한 액센트 색**으로 강조를 유지 — 옅은 배경만으로는 강조가 약함.

**Warning signs:**
- "오늘이 어디지?" 라는 자기 질문이 나오면 강조가 부족.
- 노트북 저휘도/햇빛 아래에서 "오늘" 셀이 일반 셀과 구분 안 감.

**Phase to address:** **A** (시각 다듬기). Phase A success criteria에 "DevTools Contrast checker 4.5:1 이상 캡처 첨부" 가드.

---

### Pitfall 5: 한국어 IME 조합 중 Enter가 미완성 글자를 todo로 추가 (한국어 키보드 고전 함정)

**What goes wrong:**
한국어 입력기는 글자 조합이 끝나는 신호로 Enter를 사용한다 ("ㅎ안녕" → Enter로 "안녕" 확정). 이때 폼의 `submit` 또는 `keydown(Enter)` 핸들러가 같이 발화하면서, **조합 확정용 Enter가 동시에 todo 추가까지 발생**시킨다. 결과:
1. "안녕"을 입력하고 Enter → "안" 단계에서 한 번, "안녕" 확정 단계에서 한 번 → 같은 todo가 두 번 추가되거나 미완성 글자("안")가 todo로 들어감.
2. 더 심한 케이스: 일부 IME(특히 macOS 한글)는 조합 중 Enter를 keydown으로 흘리면서 isComposing=true 상태로 통지 — 이걸 무시하고 submit하면 입력값이 비어 있는 상태로 todo 추가 시도 → null 반환되어 조용히 실패하지만, 사용자는 "Enter가 먹지 않는다"고 느낌.

v1 코드는 다행히 `<form>` + `submit` 이벤트로만 처리하고 별도 `keydown` Enter 핸들러가 없다 (todo.js 212~223). 그러나 v1.1에서 "Escape로 패널 닫기"나 "단축키 정돈"을 추가하면서 폼 입력에 추가 keydown 핸들러를 붙이면 이 함정이 살아난다.

**Why it happens:**
- 영어/숫자 입력에서는 Enter 의미가 단일이라 개발자가 IME 조합 중 Enter를 떠올리지 못함.
- `keydown` Enter 핸들러를 추가할 때 `event.isComposing` 또는 `keyCode === 229` 가드를 잊음.
- composition 이벤트(`compositionstart`/`compositionend`)를 모름.

**How to avoid:**
- **첫째 원칙**: 입력창에 `keydown` Enter 핸들러를 **추가하지 말 것**. 현재의 `<form>` `submit` 위임만 유지. submit 이벤트는 IME 조합 확정과 충돌하지 않는다 (브라우저가 조합 중 Enter는 submit으로 변환하지 않음).
- 어쩔 수 없이 `keydown`을 입력창에 붙여야 한다면 가드 필수:
  ```js
  input.addEventListener('keydown', (e) => {
    if (e.isComposing || e.keyCode === 229) return; // IME 조합 중 무시
    if (e.key === 'Escape') closePanel();
    // Enter는 절대 여기서 처리하지 말 것 — form submit이 한다
  });
  ```
- 단축키 글로벌 핸들러도 `event.target.tagName === 'INPUT'` 가드로 입력창 안에서는 발동 안 하도록.

**Warning signs:**
- 한국어로 빠르게 입력 후 Enter 시 같은 todo가 2개 생김.
- 입력 직후 todo 텍스트가 "ㅎ" 같은 자모 단편으로 들어감.
- 입력창에서 한글 첫 글자 Enter가 무시되는 듯 보임.

**Phase to address:** **B** (인터랙션 다듬기). Phase B verify에 "한글 IME로 '안녕' 입력 후 Enter → todo 1개만 추가, 텍스트 '안녕'" 케이스 명시.

---

### Pitfall 11: localStorage 키/스키마 변경 사고 (v1 데이터 증발)

**What goes wrong:**
v1.1은 데이터 모델 무변경이 명시된 마일스톤이다. 그런데 페이즈 작업 중 누군가 `STORAGE_KEY = 'todo-gsd:v1.1'`로 바꾸거나 `SCHEMA_VERSION = 2`로 올리면, v1 사용자의 기존 todo가 즉시 빈 store로 폴백된다 (todo.js 22~24 — 스키마 mismatch 시 emptyStore). "마이그레이션을 위해 버전을 올렸다"는 선의도 마찬가지 결과.

**Why it happens:**
- "v1.1이니까 버전도 1.1"이라는 직관적이지만 잘못된 가정.
- "모두 완료 체크"를 위해 byDate에 `allDoneAt` 같은 필드를 추가하고 싶어짐 → 스키마 변경 → 버전 올림.
- 토큰 리팩토링 중 검색-치환으로 '`v1`' 문자열이 잘못 잡힘.

**How to avoid:**
- STACK.md/PROJECT.md에 "v1.1은 데이터 모델 무변경"이 못박혀 있음 — 이 문장을 success criteria에 인용.
- 모든 페이즈 verify 단계에 grep 가드:
  ```bash
  grep -n "todo-gsd:v" todo.js   # 결과는 'todo-gsd:v1' 한 줄만 나와야 함
  grep -n "SCHEMA_VERSION" todo.js  # SCHEMA_VERSION = 1 한 줄만
  ```
- "모두 완료" 표시는 **derived state** — 저장 안 함, 렌더 시 계산. 추가 필드 도입 금지.

**Warning signs:**
- 페이즈 끝에서 새로고침했더니 todo가 사라짐 (테스트 데이터 분실로 발견됨).
- DevTools Application → Local Storage에 `todo-gsd:v1` 외 새 키가 보임.

**Phase to address:** **모든 페이즈 (A/B/C)**. 모든 페이즈 verify의 마지막 가드.

---

## High-Severity Pitfalls

### Pitfall 2: 다른 달 셀 opacity 과도 → 클릭 어포던스 상실

**What goes wrong:**
"다른 달은 흐리게" 요구사항을 `opacity: 0.3` 같은 강한 투명도로 구현하면, 사용자는 그 셀이 "비활성화/클릭 불가"로 인지한다. 하지만 v1은 다른 달 셀도 클릭하면 그 날짜 패널이 열리는 동작을 유지한다 (todo.js 201~208 — `data-date`만 보고 동작). 시각만 dead처럼 보이고 실제로는 살아있는 상태 → 사용자가 클릭을 시도하지 않음.

**How to avoid:**
- `opacity` 사용 금지. 대신 `color: var(--color-other-month-fg)`(예: `#b8b8b8`) + `background: var(--color-surface-muted)`(예: `#f7f7f7`)로 톤다운만.
- `cursor: pointer`는 모든 셀에 동일하게 유지.
- hover 시 살짝 어두워지는 피드백을 모든 셀(다른 달 포함)에 동일하게 줌 → "이 셀도 클릭 가능"이 시각적으로 전달.

**Warning signs:**
- 사용자 테스트 중 다른 달 셀을 안 누름.
- 본인이 보기에도 "여기 누를 수 있나?" 라는 느낌.

**Phase to address:** **A**.

---

### Pitfall 3: 취소선 + 흐리게 동시 적용 시 가독성 vs 인지 부담 균형

**What goes wrong:**
완료 항목에 line-through + `opacity: 0.4` + muted color를 모두 강하게 주면, **너무 멀리 사라져서** 사용자가 "이게 뭐였더라?" 다시 읽기 어려워짐 (취소선 자체가 가독성 저하 요인). 반대로 line-through만, color만 따로 가하면 완료 인지가 약함.

**How to avoid:**
- line-through (그대로 유지) + `opacity: 0.55~0.65` + muted color 중 **2개만** 적용. 3개 동시 X.
- 권장 조합: line-through + `color: var(--color-fg-muted)` (약 `#999`) + opacity는 건드리지 않음. 이유: opacity는 체크박스/삭제 버튼까지 흐리게 만들어 클릭 어포던스 동시에 죽임.
- 체크박스와 삭제 버튼은 완료 후에도 100% 가시성 유지 (다시 토글하거나 삭제하기 위해).

**Phase to address:** **B**.

---

### Pitfall 4: 즉시 삭제 + no-undo + 작은 버튼 → 오삭제

**What goes wrong:**
요구사항이 "즉시 삭제, undo 없음, confirm 없음"이라 안전망이 0이다. 삭제 버튼이 텍스트 끝에 작게 붙어 있으면 (현재 v1: `padding: 4px 8px`, 글자 "삭제"), 빠른 클릭 또는 trackpad 미스클릭으로 인접 todo의 삭제 버튼을 누르거나, 텍스트 클릭하려다 버튼을 누르는 사고가 잦다. 데이터 손실은 영구적.

**How to avoid:**
- 삭제 버튼 **hit-area ≥ 28×28px** (시각 패딩과 별개로 클릭 영역 확보, 작은 ✕ 아이콘이라도 컨테이너 패딩으로 28px 보장).
- 텍스트와 삭제 버튼 사이 **gap ≥ 12px**.
- 삭제 버튼은 평상시 muted color (`#999`), hover 시에만 적색 강조 (이미 v1이 그렇게 함 — 유지).
- 삭제 버튼이 **체크박스와 같은 라인의 반대쪽**에 있어, 동선상 체크 클릭과 삭제 클릭이 멀게 분리됨 (이미 v1 구조 — 유지).
- v1.1에서 텍스트만 "삭제" → 작은 ✕ 아이콘으로 바꾸고 싶어질 수 있음. 그러면 hit-area 28×28 보장에 더 신경 써야 함.

**Phase to address:** **B**.

---

### Pitfall 6: 방향키 그리드 네비의 월 경계에서 focus 증발

**What goes wrong:**
4월 1일(일요일)이 그리드의 1행 1열에 있을 때 ←를 누르면? 다음 케이스가 실수로 발생:
1. **focus 사라짐**: 이전 셀이 없다고 판단해 아무것도 안 함 → focus가 그리드 첫 셀에 머무름. 사용자는 키가 먹지 않는 줄 앎.
2. **document.body로 focus 이탈**: blur만 일어나고 다음 focus 대상이 없음 → Tab 키로 다시 진입해야 함.
3. **다음 줄 끝(토요일)로 wrap**: 한 달 안에서만 wrap → 사용자는 "어? 4월 1일 ←에서 4월 7일 토요일?" 멘탈 모델 깨짐.
4. **그리드의 다른 달 prev 셀(3월 31일)로 가지만 월은 4월 그대로**: 시각은 흐린 셀, 그러나 클릭하면 패널은 3월 31일이 열림 → 혼란.

WAI-ARIA grid 패턴은 끝에서 멈춤이 기본이지만, 캘린더 UX는 자동 월 진입이 자연스럽다 (Google Calendar 기준).

**How to avoid:**
- **결정**: 1일에서 ← → **이전 달로 자동 전환 + 이전 달 말일로 focus 이동**. 말일에서 → → 다음 달 + 1일로 focus.
- 구현 단일 진실: `focusedIso` (ISO 문자열). 방향키는 `Date` 객체 산술로 계산 → 결과 ISO가 현재 표시 월과 다르면 `state.year/month`를 갱신하고 `renderCurrent()`, 직후 `setFocusedCell(newIso)`.
- **focus는 절대 잃지 않는다**: 모든 분기가 `setFocusedCell`로 끝나야 함. early return 금지.
- ↑/↓는 7일 산술. 그리드 첫 행 ↑는 이전 달 같은 요일로 이동.
- `Home` = 그 주의 일요일, `End` = 그 주의 토요일, `PageUp/Down` = 한 달 앞/뒤(같은 일자).

**Warning signs:**
- 방향키 누르고 가만히 있는데 화면에 outline이 안 보임.
- DevTools에서 `document.activeElement`가 `<body>`.
- 키 입력이 "씹히는" 느낌.

**Phase to address:** **C**. Phase C success criteria에 "1일 ← / 말일 → / 첫 주 ↑ / 마지막 주 ↓ 4가지 경계 케이스 수동 테스트" 명시.

---

### Pitfall 7: roving tabindex 누락 → Tab으로 42셀 전부 순회

**What goes wrong:**
`role="grid"`만 추가하고 `tabindex` 관리를 안 하면, 셀이 인터랙티브 요소로 취급되지 않아 Tab으로 진입조차 안 되거나 (현재 v1 상태), 반대로 모든 셀에 `tabindex="0"`을 주면 Tab을 42번 눌러야 헤더로 빠져나간다. 두 케이스 모두 키보드 사용자에게 적대적.

**How to avoid:**
- WAI-ARIA Grid 패턴: **roving tabindex** — 그리드 안에서 단 한 셀만 `tabindex="0"`, 나머지는 `tabindex="-1"`. Tab은 그리드 전체에 1번만 진입/이탈, 그리드 안에서는 방향키로만 이동.
- 단일 진실 `focusedIso`. `setFocusedCell(iso)` 호출 시:
  1. 모든 셀에 `tabindex = -1`
  2. iso 셀에 `tabindex = 0`
  3. iso 셀에 `.focus({ preventScroll: true })`
  4. 모든 셀의 `aria-selected` 적절히 토글
- 초기 진입점: 오늘 셀 (있으면) 또는 표시 월의 1일.

**Phase to address:** **C**.

---

### Pitfall 12: 글로벌 단축키가 input 안에서도 트리거

**What goes wrong:**
페이지 레벨 keydown에서 ←/→/T를 처리하면, todo 입력창 안에서 ← ("커서 왼쪽으로")를 누른 사용자에게도 "이전 달로" 동작이 발생. 텍스트 편집 불가능.

**How to avoid:**
```js
document.addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
  if (e.metaKey || e.ctrlKey || e.altKey) return; // Cmd+T 브라우저 새 탭과 충돌 방지
  if (e.key === 'ArrowLeft') goPrevMonth();
  else if (e.key === 'ArrowRight') goNextMonth();
  else if (e.key === 't' || e.key === 'T') goToday();
  else if (e.key === 'Escape') closePanel();
});
```
- 그리드 내부 방향키 네비는 그리드 컨테이너에 별도 keydown 리스너 — 페이지 레벨과 분리. `e.stopPropagation()`으로 페이지 레벨로 버블링 방지.

**Phase to address:** **C**.

---

## Medium-Severity Pitfalls

### Pitfall 8: aria-label 과잉/중복으로 스크린리더 출력 폭주

**What goes wrong:**
"접근성을 좋게 한다"고 셀에 `aria-label="4월 28일"`, 자식 숫자 `<span>`에 `aria-label="28일"`, 배지에 `aria-label="할 일 3개"`, 모두 완료 SVG에 `aria-label="모두 완료"`까지 다 붙이면, NVDA/VoiceOver가 한 셀 진입 시 "4월 28일, 28일, 할 일 3개, 모두 완료, 셀" 같은 5중 발화. 정보 폭주로 오히려 사용 불가.

**How to avoid:**
- 셀 1개당 의미 단위 1개. 셀에 통합 label만:
  ```js
  cell.setAttribute('aria-label',
    `${m}월 ${d}일${isToday ? ', 오늘' : ''}${count > 0 ? `, 할 일 ${count}개` : ''}${allDone ? ', 모두 완료' : ''}`);
  ```
- 자식 요소(숫자 span, 배지, SVG)는 모두 `aria-hidden="true"`.
- "오늘"은 `aria-current="date"`로 의미 전달. label에는 옵션으로만.
- `role="gridcell"`이 있으면 스크린리더가 자동으로 "셀"이라 발화 → label에 "셀" 단어 넣지 말 것.

**Phase to address:** **C**.

---

### Pitfall 9: `:focus-visible` 누락 → 마우스 클릭 시 outline 깜빡임

**What goes wrong:**
`outline: 2px solid var(--color-accent)`를 모든 `:focus`에 주면, 셀을 마우스로 클릭할 때마다 파란 테두리가 번쩍 → 미니멀 톤에 어긋난다. 반대로 `outline: none`을 글로벌로 주면 키보드 사용자가 자기 위치를 잃음 (a11y 위반).

**How to avoid:**
- 글로벌 `:focus { outline: none }` **금지**.
- `:focus-visible`로만 outline:
  ```css
  :focus { outline: none; } /* 절대 금지 — 안 씀 */
  :focus-visible { outline: 2px solid var(--color-accent); outline-offset: 2px; }
  ```
- 커스텀 outline 색은 라이트 톤에 맞는 액센트(`#3478f6` 또는 톤다운 버전). 배경과 4.5:1 이상.
- 모든 모던 브라우저 지원 (2022+).

**Phase to address:** **C** (또는 A에서 토큰 도입 시 같이).

---

### Pitfall 10: `prefers-reduced-motion` 무시한 transition으로 멀미 유발

**What goes wrong:**
완료 토글, 패널 열기, 셀 hover에 transition 0.3~0.5s를 주면 vestibular disorder 사용자에게 멀미 유발. macOS "동작 줄이기" 설정을 무시하는 앱은 ATAG 위반.

**How to avoid:**
- transition을 **굳이 도입하지 말 것** (미니멀 톤이면 0.0s가 더 어울림). STACK.md 권장과 일치.
- 도입한다면:
  - 0.1~0.15s 짧게.
  - 반드시:
  ```css
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      transition-duration: 0s !important;
      animation-duration: 0s !important;
    }
  }
  ```

**Phase to address:** **B** (transition 도입 결정 시).

---

### Pitfall 13: "오늘"이 다른 달 표시일 때도 강조됨

**What goes wrong:**
v1 `calendar.js` 75번 라인의 `!c.otherMonth && isSameYMD(...)` 가드를 토큰 리팩토링 또는 키보드 네비 추가 중 무심코 제거하면, 4월을 보다가 5월로 이동했을 때 4월의 오늘(예: 4/28)이 5월 그리드의 "다른 달" 셀로 다시 등장하면서 강조까지 켜짐 → 같은 화면에 "오늘" 셀이 여러 개 보이는 듯한 느낌.

**How to avoid:**
- 코드 주석으로 가드 의도 명시 (이미 D-06 표시되어 있음 — 유지).
- 페이즈 verify에서 "5월 보기로 이동했을 때 오늘 강조 셀이 있으면 안 됨" 확인.

**Phase to address:** **A** (시각 다듬기에서 토큰화하면서 가드가 살아있는지 확인).

---

### Pitfall 14: `isAllDone`의 빈 배열 off-by-one

**What goes wrong:**
"모두 완료된 날짜에 체크" 구현 시 `arr.every(t => t.done)`만 쓰면, **빈 배열은 every가 true 반환** → todo가 0개인 모든 날짜에 체크 아이콘이 켜져서 그리드가 체크로 도배.

**How to avoid:**
```js
function isAllDone(iso) {
  const list = store.byDate[iso];
  return Array.isArray(list) && list.length > 0 && list.every(t => t.done);
}
```
- length > 0 가드 명시.
- 페이즈 verify에 "할 일 0개인 날짜에 체크 표시 없음" 케이스 명시.

**Phase to address:** **B**.

---

### Pitfall 15: 배지 색이 "오늘" 배경 위에서 안 보임

**What goes wrong:**
v1은 `.day--today .day__badge { background: rgba(255,255,255,0.25); color: #fff }`로 오늘 셀 위 배지를 따로 처리했다. 토큰화하면서 `.day--today .day__badge` 규칙을 누락하면, 일반 배지 색(`#e6effd` 배경 + `#3478f6` 글자)이 오늘 셀의 새 라이트 배경(`#eaf2ff`) 위에서 거의 사라짐.

**How to avoid:**
- 토큰화하더라도 `.day--today .day__badge` 페어 토큰 별도 유지: `--color-today-badge-bg`, `--color-today-badge-fg`.
- 페이즈 verify에 "오늘 셀에 todo 3개 추가 → 배지 보임 + 4.5:1 대비" 확인.

**Phase to address:** **A**.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| 색상 리터럴(`#3478f6`) 그대로 두고 새 톤만 추가 | 토큰 도입 작업 생략 | 라이트 톤이 일관되지 않고, 다음 작업에서 또 누락 | **Never** in v1.1 — 토큰화는 Phase A 핵심 |
| `outline: none` 글로벌 | 깔끔한 화면 | 키보드 사용자 focus 손실 (a11y 위반) | **Never** |
| 모든 셀 `tabindex=0` | 빠르게 키보드 진입 가능 | Tab 42번 눌러야 헤더 도달 → 사용자 학대 | **Never** |
| Unicode `✓` 사용 | SVG 안 그려도 됨 | 폰트별 모양 편차, 미니멀 톤 깨짐 | Phase B 임시 → 같은 페이즈 안에서 SVG로 교체 |
| `keydown` Enter로 form submit 우회 | "더 즉각적" 느낌 | IME 함정 정통 발화 (Pitfall 5) | **Never** — `<form> submit` 그대로 |
| 입력창에 별도 단축키 핸들러 | 패널 안에서도 단축키 동작 | ←로 커서 이동 불가 | **Never** — input 안에서는 단축키 비활성 |

---

## Performance Traps

이 프로젝트의 스케일(42셀, 일평균 todo < 10개)에서 성능 함정은 거의 무관하다. 단, 주의할 1가지:

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| 방향키 누를 때마다 `renderCurrent()` 풀 리렌더 | 빠른 키 반복 시 깜빡임/포커스 깨짐 | 그리드 안에서의 focus 이동은 DOM 클래스/tabindex 토글만, **풀 리렌더 X**. 월 경계 진입 시에만 `renderCurrent()` 호출하고 직후 `setFocusedCell` | 키 자동반복(>10Hz) |

`requestAnimationFrame` 도입은 STACK.md에서 명시적으로 비권장 — 도입하지 말 것.

---

## Security Mistakes

이 마일스톤은 신규 입력 경로/외부 통신이 없다. v1에서 이미:
- todo 텍스트 200자 truncate (todo.js 68)
- `escapeHtml`로 출력 시 sanitize (todo.js 112~119)
- localStorage 키 고정 (cross-tab 충돌 없음)

v1.1에서 새로 발생할 수 있는 보안 mistake는 **`aria-label` 동적 생성 시 사용자 입력을 raw 삽입**하는 것이다 (예: 셀 label에 todo 텍스트를 포함시키면 `setAttribute`는 안전하지만 `innerHTML`로 만들면 XSS). 권장: aria-label에 사용자 텍스트는 포함시키지 말고 개수만 발화 ("할 일 3개"). 이미 위 Pitfall 8에서 다룸.

| Mistake | Risk | Prevention |
|---------|------|------------|
| aria-label에 todo 텍스트 raw 포함 → 스크린리더 발화에 사용자 텍스트 그대로 (XSS는 아님, 다만 매우 긴 텍스트로 a11y 사용성 저하) | a11y 사용성 저하 | aria-label은 메타데이터(개수, 날짜)만 |

---

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| 다른 달 셀을 비활성화처럼 보이게 함 | 클릭 시도 안 함 → 다음 달 todo 추가 못 함 | 톤다운만, 클릭 어포던스 유지 (Pitfall 2) |
| 완료 항목을 너무 흐리게 (opacity 0.3) | 다시 토글하려면 거의 안 보임 | line-through + muted color, opacity 건드리지 않기 (Pitfall 3) |
| Enter 후 입력창 focus 잃음 | 연속 입력 시 매번 클릭 필요 | submit 핸들러에서 `input.value = ''` 후 focus 유지 (이미 v1에서 됨 — 유지) |
| 패널 닫기 후 focus가 `<body>`로 빠짐 | Tab으로 다시 그리드 진입해야 함 | `closePanel`에서 직전 선택 셀로 `setFocusedCell(prev)` |
| 단축키 안내 부재 | 단축키 존재 모름 | 시각 인디케이터는 v1.1 Out of Scope (스코프 외) — 그러나 `aria-keyshortcuts` 속성으로 스크린리더에는 노출 가능 (선택) |

---

## "Looks Done But Isn't" Checklist

각 페이즈 완료 시 verify 단계에서 체크:

**Phase A — 시각 다듬기:**
- [ ] **오늘 강조**: DevTools Contrast checker 4.5:1 이상 캡처 (Pitfall 1)
- [ ] **오늘 강조 가드 살아있음**: 다른 달의 동일 일자에 `.day--today` 안 붙음 (Pitfall 13)
- [ ] **오늘 셀 배지 가시성**: 오늘에 todo 3개 추가 → 배지 보임 (Pitfall 15)
- [ ] **다른 달 클릭 가능**: 흐린 셀 클릭 → 패널 열림 (Pitfall 2)
- [ ] **localStorage 키 무변경**: `grep -n "todo-gsd:v" todo.js`가 1줄만 (Pitfall 11)

**Phase B — 인터랙션 + 모두 완료 체크:**
- [ ] **한국어 IME Enter 테스트**: "안녕" 입력 → 1개 추가, 텍스트 정확 (Pitfall 5)
- [ ] **삭제 버튼 hit-area**: DevTools에서 28×28px 이상 (Pitfall 4)
- [ ] **완료 토글 가독성**: 완료 후에도 텍스트 읽힘 (Pitfall 3)
- [ ] **체크 표시 off-by-one**: todo 0개 날짜에 체크 없음 (Pitfall 14)
- [ ] **체크 표시 정확**: 1개라도 미완료면 체크 없음
- [ ] **prefers-reduced-motion**: macOS "동작 줄이기" 켠 상태에서 transition 0s (Pitfall 10, 도입 시)
- [ ] **localStorage 스키마 무변경**: `grep "SCHEMA_VERSION" todo.js`가 `= 1` (Pitfall 11)

**Phase C — 키보드/접근성:**
- [ ] **roving tabindex**: DevTools에서 그리드 내 `tabindex=0` 셀이 정확히 1개 (Pitfall 7)
- [ ] **월 경계 4케이스**: 1일 ← / 말일 → / 첫 주 ↑ / 마지막 주 ↓ — focus 안 잃음 (Pitfall 6)
- [ ] **input 안에서 단축키 비활성**: 입력창에서 ← → 커서 이동, T → "T" 입력 (Pitfall 12)
- [ ] **Cmd+T는 브라우저로**: 단축키가 modifier 안 가로챔 (Pitfall 12)
- [ ] **`:focus-visible` 동작**: 마우스 클릭 시 outline 없음, Tab/방향키 시 outline 있음 (Pitfall 9)
- [ ] **aria-label 단일성**: 셀 자식들 모두 `aria-hidden="true"` (Pitfall 8)
- [ ] **스크린리더 발화 길이**: VoiceOver(macOS) 또는 NVDA로 셀 진입 시 발화 5단어 이내 (Pitfall 8)
- [ ] **패널 닫은 후 focus 복귀**: Escape 후 `document.activeElement`가 직전 셀
- [ ] **localStorage 키 무변경 (최종)**: 페이즈 끝 새로고침 → todo 유지 (Pitfall 11)

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| 1 (대비 깨짐) | LOW | 토큰 값만 변경, CSS 한 곳 수정 |
| 5 (IME Enter) | LOW | submit 단일 경로로 회귀, 신규 keydown 핸들러 제거 |
| 6 (focus 증발) | MEDIUM | `setFocusedCell` 단일 진실로 리팩토링 — 모든 분기 점검 |
| 11 (localStorage 사고) | **HIGH** | 사용자 데이터 영구 손실. **복구 불가** — 예방이 유일 |
| 7 (roving tabindex) | LOW | tabindex 일괄 -1 → focused 셀만 0 토글하는 헬퍼 1개 추가 |
| 14 (체크 off-by-one) | LOW | `length > 0` 한 줄 추가 |

---

## Pitfall-to-Phase Mapping (재확인)

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| 1 대비 깨짐 | A | DevTools Contrast checker 캡처 |
| 2 다른 달 어포던스 | A | 다른 달 셀 클릭 → 패널 오픈 |
| 3 취소선+흐리게 | B | 완료 후 텍스트 읽기 가능 + 체크/삭제 어포던스 유지 |
| 4 즉시 삭제 오클릭 | B | DevTools 박스모델로 hit-area 측정 |
| 5 IME Enter | B | 한글 "안녕" Enter 케이스 |
| 6 월 경계 focus | C | 4가지 경계 케이스 |
| 7 roving tabindex | C | `tabindex=0` 셀 1개만 |
| 8 aria 과잉 | C | VoiceOver 발화 단어 수 |
| 9 `:focus-visible` | C (또는 A) | 마우스 vs 키보드 분리 |
| 10 reduced-motion | B (도입 시) | 시스템 설정 켠 상태 테스트 |
| 11 localStorage 사고 | A/B/C 모두 | grep 가드 |
| 12 input 안 단축키 | C | 입력창에서 ← → 커서 이동 |
| 13 다른 달 오늘 강조 | A | 옆 달로 이동 후 강조 셀 0개 |
| 14 체크 off-by-one | B | 빈 날짜에 체크 없음 |
| 15 오늘 셀 배지 | A | 오늘에 배지 + 대비 |

---

## Sources

- W3C WAI-ARIA Authoring Practices — Grid Pattern (roving tabindex), Date Picker Dialog (HIGH).
- MDN — `KeyboardEvent.isComposing`, `compositionstart`/`compositionend` events, `:focus-visible`, `prefers-reduced-motion`, `aria-current` (HIGH).
- WCAG 2.1 — Success Criterion 1.4.3 Contrast (Minimum) 4.5:1 (HIGH).
- 한국 IME composition 동작 — Whatwg HTML spec on input events + 실측 (Chrome/Safari macOS 한글 입력기) (HIGH).
- 현재 리포지토리 (`index.html`, `styles.css`, `calendar.js`, `todo.js`, PROJECT.md) — 기존 코드/제약 직접 확인 (HIGH).
- STACK.md — 동일 마일스톤 stack research, "도입 금지" 목록 정합성 확인 (HIGH).

---
*Pitfalls research for: v1.1 UX 다듬기 — UX-polish on existing static calendar-todo*
*Researched: 2026-04-28*
