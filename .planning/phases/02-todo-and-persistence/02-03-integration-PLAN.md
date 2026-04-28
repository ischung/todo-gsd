---
phase: 02-todo-and-persistence
plan: 03
type: execute
wave: 2
depends_on:
  - 02-01
  - 02-02
files_modified:
  - todo.js
  - calendar.js
autonomous: true
requirements:
  - TODO-01
  - TODO-02
  - TODO-03
  - TODO-04
  - CAL-03
  - PERSIST-01
must_haves:
  truths:
    - "달력 셀을 클릭하면 그 날짜의 Todo 패널이 열리고, 추가/체크/삭제가 즉시 반영된다"
    - "각 날짜 셀에 그 날짜의 항목 수가 배지로 표시되고 0건이면 배지가 없다"
    - "페이지 새로고침 후에도 모든 항목과 완료 상태가 동일하게 보인다"
    - "월을 바꿔도 배지가 새 월의 데이터로 다시 그려진다"
  artifacts:
    - path: "todo.js"
      provides: "패널/리스트/배지 렌더링 + 셀 클릭/폼/체크/삭제 이벤트 위임"
      contains: "afterRenderMonth"
    - path: "calendar.js"
      provides: "renderMonth 끝에 todoApp.afterRenderMonth hook 한 줄 추가"
      contains: "todoApp"
  key_links:
    - from: "calendar.js"
      to: "todo.js"
      via: "window.todoApp?.afterRenderMonth?.(year, month)"
      pattern: "todoApp\\?\\.afterRenderMonth"
---

<objective>
02-01의 데이터 레이어(`window.todoApp`)와 02-02의 DOM/CSS 후크를 연결한다. 셀 클릭 → 패널 열기 → CRUD → 배지 갱신 → 영속화의 전체 사용자 흐름을 완성한다. `calendar.js`에는 한 줄(hook 호출)만 추가하고, 나머지 로직은 모두 `todo.js`에 둔다.

Purpose: D2-07~D2-15, D2-18(렌더 hook), D2-19를 코드로 잠근다. CAL-03 + TODO-01~04 + PERSIST-01 모두 이 plan에서 닫힌다.
Output: `todo.js` 갱신(렌더/이벤트 섹션 추가), `calendar.js`의 `renderMonth` 마지막에 hook 호출 한 줄 추가.
</objective>

<context>
@/Users/insang/Documents/강의/소프트웨어공학/2026/대면수업용/sdd/gsd/todo-gsd/.planning/PROJECT.md
@/Users/insang/Documents/강의/소프트웨어공학/2026/대면수업용/sdd/gsd/todo-gsd/.planning/REQUIREMENTS.md
@/Users/insang/Documents/강의/소프트웨어공학/2026/대면수업용/sdd/gsd/todo-gsd/.planning/ROADMAP.md
@/Users/insang/Documents/강의/소프트웨어공학/2026/대면수업용/sdd/gsd/todo-gsd/.planning/phases/02-todo-and-persistence/02-CONTEXT.md
@/Users/insang/Documents/강의/소프트웨어공학/2026/대면수업용/sdd/gsd/todo-gsd/.planning/phases/02-todo-and-persistence/02-01-todo-store-PLAN.md
@/Users/insang/Documents/강의/소프트웨어공학/2026/대면수업용/sdd/gsd/todo-gsd/.planning/phases/02-todo-and-persistence/02-02-panel-ui-shell-PLAN.md
@/Users/insang/Documents/강의/소프트웨어공학/2026/대면수업용/sdd/gsd/todo-gsd/calendar.js
@/Users/insang/Documents/강의/소프트웨어공학/2026/대면수업용/sdd/gsd/todo-gsd/index.html
@/Users/insang/Documents/강의/소프트웨어공학/2026/대면수업용/sdd/gsd/todo-gsd/styles.css

<interfaces>
<!-- 새로 노출하는 todoApp 메서드 (02-01의 CRUD 위에 추가) -->

window.todoApp:
- (기존) STORAGE_KEY, getTodos, countByDate, addTodo, toggleTodo, deleteTodo, _dump, _reset
- (신규) `afterRenderMonth(year: number, month: number): void`
    — calendar.js가 renderMonth 끝에서 호출. 현재 그리드의 모든 `.day` 셀을 훑어 배지를 갱신한다.
- (신규) `selectedDate: string | null`
    — 현재 패널이 보여주는 ISO 날짜. 없으면 null.
- (신규) `openPanel(iso: string): void`
    — 외부에서도 호출 가능(테스트/디버그용). UI 부수효과: hidden 제거 + 헤더 갱신 + 리스트 렌더.
- (신규) `closePanel(): void`
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: todo.js — 렌더(패널 + 배지) + 이벤트 위임 추가</name>
  <files>todo.js</files>
  <read_first>
    - 02-01에서 작성된 현재 `todo.js` (CRUD + 영속화)
    - 02-02에서 갱신된 `index.html` (DOM 후크 ID/클래스)
    - 02-02에서 갱신된 `styles.css` (`.day__badge`, `.day--selected`, `.todo-item--done`)
    - 02-CONTEXT.md (D2-07~D2-15, D2-18, D2-19)
  </read_first>
  <action>
    기존 `todo.js`에 다음 섹션을 **파일 하단**(window.todoApp 노출 직전)에 추가한다. 02-01이 만든 함수/상수는 수정 금지(API 보존).

    파일 구조 권장(주석 헤더로 섹션 구분):
    ```
    // === 데이터 레이어 (02-01) ===
    ...기존 코드...
    // === 렌더링 (02-03) ===
    ...신규...
    // === 이벤트 위임 (02-03) ===
    ...신규...
    // === Public API ===
    window.todoApp = { ... };
    ```

    1. **렌더링 헬퍼**:

       (a) `renderBadgesForGrid()`:
           - `const grid = document.getElementById('cal-grid'); if (!grid) return;`
           - `grid.querySelectorAll('.day').forEach(cell => { ... })`로 각 셀 처리:
             - `const iso = cell.getAttribute('data-date'); if (!iso) return;`
             - `const count = countByDate(iso);`
             - `let badge = cell.querySelector('.day__badge');`
             - `count === 0`이면 `badge?.remove()` (D2-13).
             - 아니면:
               - 없으면 `badge = document.createElement('span'); badge.className = 'day__badge'; cell.appendChild(badge);`
               - `badge.textContent = count > 99 ? '99+' : String(count);` (D2-14).
             - 선택 강조 동기화: `cell.classList.toggle('day--selected', iso === selectedDate);`

       (b) `formatPanelTitle(iso)`:
           - `const [y, m, d] = iso.split('-').map(Number);`
           - `return ${y}년 ${m}월 ${d}일;`  (D-04와 동일 톤).

       (c) `renderPanelList()`:
           - `const listEl = document.getElementById('todo-list'); if (!listEl) return;`
           - `if (!selectedDate) { listEl.innerHTML = ''; return; }`
           - `const items = getTodos(selectedDate);` (이미 createdAt 오름차순)
           - `listEl.innerHTML = items.map(toItemHtml).join('');`
           - `toItemHtml(t)` 헬퍼:
             ```js
             function toItemHtml(t) {
               const cls = 'todo-item' + (t.done ? ' todo-item--done' : '');
               const checked = t.done ? 'checked' : '';
               const safe = escapeHtml(t.text);
               return `<li class="${cls}" data-id="${t.id}">
                 <input type="checkbox" class="todo-item__check" ${checked} aria-label="완료 토글">
                 <span class="todo-item__text">${safe}</span>
                 <button type="button" class="todo-item__delete" aria-label="삭제">삭제</button>
               </li>`;
             }
             ```
           - `escapeHtml(s)` 헬퍼: `&`, `<`, `>`, `"`, `'`를 엔티티로 치환(텍스트 XSS 방어).

       (d) `openPanel(iso)`:
           - `if (!isValidIso(iso)) return;`
           - `selectedDate = iso;`
           - `const panel = document.getElementById('todo-panel'); panel.hidden = false;`
           - `document.getElementById('todo-panel-title').textContent = formatPanelTitle(iso);`
           - `renderPanelList();`
           - `renderBadgesForGrid();`  // selected 클래스 토글 위해
           - `document.getElementById('todo-input').focus();`

       (e) `closePanel()`:
           - `selectedDate = null;`
           - `document.getElementById('todo-panel').hidden = true;`
           - `renderBadgesForGrid();`  // selected 클래스 제거

       (f) `afterRenderMonth(year, month)` — calendar.js의 hook 대상:
           - 인자는 시그니처 일관성을 위해 받지만 실제 사용은 안 한다(셀의 data-date를 신뢰).
           - `renderBadgesForGrid();`
           - `if (selectedDate) { /* 선택 셀이 새 월에도 존재하면 강조가 자동 동기화됨. 아니면 outline 없이 가만히 둔다. */ }`

    2. **이벤트 위임** (한 번만 등록):

       (a) DOM 준비는 `defer` 스크립트라 즉시 OK. 파일 하단에서 직접 등록.

       (b) 셀 클릭 (D2-07):
           ```js
           const grid = document.getElementById('cal-grid');
           if (grid) {
             grid.addEventListener('click', (e) => {
               const cell = e.target.closest('.day');
               if (!cell) return;
               const iso = cell.getAttribute('data-date');
               if (!iso) return;
               openPanel(iso);
             });
           }
           ```

       (c) 폼 제출 — 추가 (D2-09):
           ```js
           const form = document.getElementById('todo-form');
           if (form) {
             form.addEventListener('submit', (e) => {
               e.preventDefault();
               if (!selectedDate) return;
               const input = document.getElementById('todo-input');
               const text = input.value;
               const created = addTodo(selectedDate, text);
               if (!created) return;  // 빈 문자열 등은 무시
               input.value = '';
               renderPanelList();
               renderBadgesForGrid();
             });
           }
           ```

       (d) 리스트 위임 — 토글/삭제 (D2-10):
           ```js
           const listEl = document.getElementById('todo-list');
           if (listEl) {
             listEl.addEventListener('click', (e) => {
               const li = e.target.closest('.todo-item');
               if (!li || !selectedDate) return;
               const id = li.getAttribute('data-id');
               if (!id) return;

               if (e.target.classList.contains('todo-item__check')) {
                 toggleTodo(selectedDate, id);
                 renderPanelList();
                 renderBadgesForGrid();  // 개수는 그대로지만 selected 동기화 비용 무시
               } else if (e.target.classList.contains('todo-item__delete')) {
                 deleteTodo(selectedDate, id);
                 renderPanelList();
                 renderBadgesForGrid();
               }
             });
           }
           ```

       (e) 닫기 버튼:
           ```js
           document.getElementById('todo-panel-close')?.addEventListener('click', closePanel);
           ```

    3. **초기 배지 1회 그리기**:
       - 파일 하단(이벤트 등록 다음)에서 `renderBadgesForGrid()` 호출.
       - calendar.js의 `renderCurrent()`가 이미 실행된 후 todo.js가 실행되므로(같은 `defer` 큐, 선언 순서) `.day` 셀이 DOM에 있다.

    4. **window.todoApp 노출 갱신** — 기존 객체에 신규 메서드/getter 추가:
       ```js
       window.todoApp = {
         STORAGE_KEY,
         getTodos,
         countByDate,
         addTodo,
         toggleTodo,
         deleteTodo,
         afterRenderMonth,
         openPanel,
         closePanel,
         get selectedDate() { return selectedDate; },
         _dump,
         _reset,
       };
       ```

    5. 모듈 패턴/import/export 절대 금지. 신규 함수는 모두 파일 스코프 함수 선언.

    **주의:**
    - `escapeHtml`을 반드시 사용해 todo 텍스트를 그대로 innerHTML에 삽입하지 않는다(textContent로 처리하든, escape 후 innerHTML 사용하든 둘 중 하나로 일관).
    - 패널 input의 `maxlength="200"`이 이미 HTML에서 강제되지만, addTodo도 슬라이스로 방어한다(02-01에 이미 구현됨).
  </action>
  <verify>
    <automated>grep -q 'afterRenderMonth' todo.js && grep -q 'renderBadgesForGrid' todo.js && grep -q 'openPanel' todo.js && grep -q 'closePanel' todo.js && grep -q 'cal-grid' todo.js && grep -q 'todo-form' todo.js && grep -q 'todo-list' todo.js && grep -q 'todo-panel-close' todo.js && grep -q 'escapeHtml' todo.js && grep -q 'addEventListener' todo.js && grep -q 'data-date' todo.js && grep -q '99+' todo.js</automated>
  </verify>
  <acceptance_criteria>
    - 신규 함수 6개 정의: `renderBadgesForGrid`, `renderPanelList`, `openPanel`, `closePanel`, `afterRenderMonth`, `escapeHtml` (그리고 `formatPanelTitle`, `toItemHtml` 헬퍼).
    - `window.todoApp`에 `afterRenderMonth`, `openPanel`, `closePanel`, `selectedDate` 추가됨.
    - 4곳에 `addEventListener` 등록: `#cal-grid` click, `#todo-form` submit, `#todo-list` click, `#todo-panel-close` click.
    - 02-01의 함수/상수(STORAGE_KEY, addTodo 등)는 수정되지 않음(grep로 시그니처 보존 확인).
    - import/export 0회.
    - 텍스트는 escape 후 삽입되거나 textContent로 처리(innerHTML에 raw todo.text가 직접 들어가지 않음).
  </acceptance_criteria>
  <done>
    `todo.js`만으로 모든 인터랙션이 동작 가능한 상태. (단, 월 이동 시 배지 갱신은 calendar.js의 hook 호출이 필요 — Task 2에서 처리.)
  </done>
</task>

<task type="auto">
  <name>Task 2: calendar.js — renderMonth 끝에 todo hook 호출 추가</name>
  <files>calendar.js</files>
  <read_first>
    - 현재 `calendar.js`의 `renderMonth` 함수 (마지막 `gridEl.innerHTML = html;` 줄 위치)
    - 02-CONTEXT.md (D2-18 — todo.js가 없을 때도 안전해야 함)
  </read_first>
  <action>
    `calendar.js`의 `renderMonth(year, month)` 함수 본문 마지막 줄(`gridEl.innerHTML = html;`)의 **다음 줄**에 한 줄을 추가한다:

    ```js
    // Phase 2 hook: todo.js가 로드되어 있으면 배지를 입힌다. 없으면 무시.
    window.todoApp?.afterRenderMonth?.(year, month);
    ```

    그 외에는 어떤 수정도 하지 않는다(상수, 다른 함수, 주석, 모두 그대로).

    조건:
    - optional chaining(`?.`)을 사용해 todoApp이 없거나 메서드가 없으면 자동으로 noop이 된다(D2-18: Phase 1 단독 실행 안전성).
    - try/catch는 추가하지 않는다 — todo.js의 hook은 throw 하지 않게 작성됨(02-03 Task 1).
  </action>
  <verify>
    <automated>grep -q 'window.todoApp?.afterRenderMonth?.' calendar.js && grep -c 'gridEl.innerHTML = html;' calendar.js | grep -q '^1$' && grep -q "function renderMonth(year, month)" calendar.js</automated>
  </verify>
  <acceptance_criteria>
    - `calendar.js`에 `window.todoApp?.afterRenderMonth?.(year, month);` 라인이 정확히 1회 추가됨.
    - 추가 위치는 `renderMonth` 함수 내부, `gridEl.innerHTML = html;` 직후.
    - 다른 함수(`renderCurrent`, `goPrevMonth`, `goNextMonth`, `goToday`, `buildCells`, `toISODate`, `isSameYMD`)는 변경되지 않음.
    - 기존 `window.calendarApp` export도 그대로 유지됨.
  </acceptance_criteria>
  <done>
    개발자 도구에서 `window.calendarApp.goNextMonth()`를 호출하면 새 월 그리드가 그려진 직후 배지가 함께 갱신된다.
  </done>
</task>

</tasks>

<verification>
- 모든 v1 요구사항이 닫힘: TODO-01(셀 클릭→패널), TODO-02(추가), TODO-03(체크 토글), TODO-04(삭제), CAL-03(배지), PERSIST-01(localStorage 라운드트립).
- 새로고침 라운드트립: 항목 추가 → F5 → `_dump()` 결과 동일 + 패널은 닫힘 상태(selectedDate는 ephemeral).
- 월 이동 시 배지 자동 갱신.
- todo.js가 빠진 상태에서도 calendar.js는 에러 없이 동작(optional chaining hook).
- XSS 방어: 사용자 입력 텍스트가 escape되어 innerHTML 삽입.
</verification>

<success_criteria>
- 페이지 새로고침 후 모든 항목·완료 상태가 정확히 복원된다.
- 임의의 두 날짜에 항목을 추가한 뒤 월을 이동했다 돌아와도 두 날짜 셀의 배지 숫자가 동일하다.
- 빈 텍스트/공백만 입력 시 추가되지 않는다.
- 콘솔 에러 0회(정상 시나리오 기준).
</success_criteria>

<output>
완료 후 `.planning/phases/02-todo-and-persistence/02-03-SUMMARY.md`를 생성하라.
</output>
