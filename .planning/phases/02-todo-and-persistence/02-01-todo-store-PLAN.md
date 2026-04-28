---
phase: 02-todo-and-persistence
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - todo.js
autonomous: true
requirements:
  - TODO-02
  - TODO-03
  - TODO-04
  - PERSIST-01
must_haves:
  truths:
    - "todo.js를 브라우저에서 로드하면 window.todoApp.store에 빈 store(또는 localStorage 복원본)가 보인다"
    - "addTodo/toggleTodo/deleteTodo 호출이 메모리 store와 localStorage(`todo-gsd:v1`)에 동시 반영된다"
    - "손상된 JSON이 localStorage에 있으면 빈 store로 폴백하고 콘솔 경고가 한 번 출력된다"
  artifacts:
    - path: "todo.js"
      provides: "Todo store + CRUD + localStorage 영속화 (UI/렌더링 없음)"
      contains: "window.todoApp"
  key_links:
    - from: "todo.js"
      to: "localStorage"
      via: "localStorage.getItem/setItem('todo-gsd:v1', ...)"
      pattern: "todo-gsd:v1"
---

<objective>
Phase 2의 데이터 레이어를 만든다. `todo.js`(신규)에 (1) 메모리 store, (2) localStorage 직렬화/복원, (3) 순수 CRUD API(`addTodo`/`toggleTodo`/`deleteTodo`/`getTodos`/`countByDate`), (4) 폴백/에러 처리를 구현한다. **DOM 조작·이벤트 바인딩·렌더링은 이 plan에서 하지 않는다** — 02-03이 추가한다.

Purpose: D2-01~D2-06(데이터 모델 + 영속화 규약)을 코드로 잠근다.
Output: 신규 파일 `todo.js` (window.todoApp namespace, CRUD/persistence 섹션만).
</objective>

<context>
@/Users/insang/Documents/강의/소프트웨어공학/2026/대면수업용/sdd/gsd/todo-gsd/.planning/PROJECT.md
@/Users/insang/Documents/강의/소프트웨어공학/2026/대면수업용/sdd/gsd/todo-gsd/.planning/REQUIREMENTS.md
@/Users/insang/Documents/강의/소프트웨어공학/2026/대면수업용/sdd/gsd/todo-gsd/.planning/ROADMAP.md
@/Users/insang/Documents/강의/소프트웨어공학/2026/대면수업용/sdd/gsd/todo-gsd/.planning/phases/02-todo-and-persistence/02-CONTEXT.md
@/Users/insang/Documents/강의/소프트웨어공학/2026/대면수업용/sdd/gsd/todo-gsd/calendar.js
@/Users/insang/Documents/강의/소프트웨어공학/2026/대면수업용/sdd/gsd/todo-gsd/CLAUDE.md

<interfaces>
<!-- 02-03이 의존할 todo.js의 공개 API -->

window.todoApp:
- `STORAGE_KEY` = `'todo-gsd:v1'`
- `getTodos(isoDate: string): Todo[]`        — 해당 날짜의 todo 배열 (createdAt 오름차순). 없으면 [].
- `countByDate(isoDate: string): number`     — 해당 날짜의 항목 수.
- `addTodo(isoDate: string, text: string): Todo | null`  — trim 후 빈 문자열이면 null. 200자 초과면 자른다.
- `toggleTodo(isoDate: string, id: string): boolean`     — 성공 시 true.
- `deleteTodo(isoDate: string, id: string): boolean`     — 성공 시 true.
- `_dump(): object`                          — (테스트/디버깅용) 현재 store 전체 객체 반환.
- `_reset(): void`                           — (테스트용) 메모리+localStorage를 빈 store로 초기화.

Todo 타입:
{ id: string, text: string, done: boolean, createdAt: number }
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: todo.js 데이터 레이어 작성</name>
  <files>todo.js</files>
  <read_first>
    - .planning/phases/02-todo-and-persistence/02-CONTEXT.md (D2-01~D2-06, D2-09, D2-19)
    - calendar.js (전역 namespace 패턴, 'use strict', 한국어 주석 톤)
    - CLAUDE.md (정적 웹 앱, 빌드 도구 없음, import/export 금지)
  </read_first>
  <action>
    프로젝트 루트에 `todo.js`를 신규 생성한다. 모듈 시스템 사용 금지(빌드 도구 없음). 다음 구조를 그대로 작성:

    1. 파일 상단:
       ```js
       // Phase 2: Todo 데이터 레이어 — store + CRUD + localStorage 영속화.
       // D2-01 ISO YYYY-MM-DD 키 / D2-02 단일 키 직렬화 / D2-03 스키마 / D2-04 mutation 즉시 저장
       // D2-05 폴백 / D2-06 quota는 콘솔 경고만.

       'use strict';
       ```

    2. 상수:
       ```js
       const STORAGE_KEY = 'todo-gsd:v1';
       const SCHEMA_VERSION = 1;
       const MAX_TEXT_LEN = 200;
       ```

    3. 메모리 store (load 결과로 초기화). 형태: `{ version: 1, byDate: { [iso]: Todo[] } }`.
       - `let store = loadFromStorage();`

    4. `loadFromStorage()`:
       - `try` 블록으로 `localStorage.getItem(STORAGE_KEY)` 읽고 `JSON.parse`.
       - null/undefined → `emptyStore()` 반환.
       - 파싱 성공했지만 `parsed.version !== SCHEMA_VERSION` 또는 `typeof parsed.byDate !== 'object'` → `console.warn('[todo] 스키마 mismatch — 빈 store로 폴백');` 후 `emptyStore()`.
       - 파싱 실패(catch) → `console.warn('[todo] localStorage 파싱 실패 — 빈 store로 폴백:', err.message);` 후 `emptyStore()`.
       - 성공 시 그대로 반환.

    5. `emptyStore()` → `{ version: SCHEMA_VERSION, byDate: {} }`.

    6. `saveToStorage()` (모든 mutation 끝에 호출):
       - `try { localStorage.setItem(STORAGE_KEY, JSON.stringify(store)); } catch (err) { console.warn('[todo] 저장 실패(quota 등):', err.message); }`
       - D2-06: quota 초과해도 throw 하지 않는다.

    7. `genId()` (D2-03):
       - `'t_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6)`

    8. `isValidIso(iso)` 헬퍼:
       - `/^\d{4}-\d{2}-\d{2}$/.test(iso)` — 형식 가드.

    9. `getTodos(iso)`:
       - `isValidIso(iso)` 아니면 `[]` 반환.
       - `(store.byDate[iso] || []).slice().sort((a, b) => a.createdAt - b.createdAt)` — 오름차순 복사 반환(외부에서 수정해도 store 보호).

    10. `countByDate(iso)`:
        - `isValidIso(iso)` 아니면 0.
        - `(store.byDate[iso] || []).length`.

    11. `addTodo(iso, text)`:
        - `isValidIso(iso)` 아니면 null.
        - `const trimmed = String(text ?? '').trim();`  → 빈 문자열이면 null.
        - 200자 초과: `trimmed.slice(0, MAX_TEXT_LEN)`.
        - `const todo = { id: genId(), text: trimmed.slice(0, MAX_TEXT_LEN), done: false, createdAt: Date.now() };`
        - `if (!store.byDate[iso]) store.byDate[iso] = [];`
        - `store.byDate[iso].push(todo);`
        - `saveToStorage();`
        - `return todo;`

    12. `toggleTodo(iso, id)`:
        - `const list = store.byDate[iso]; if (!list) return false;`
        - `const item = list.find(t => t.id === id); if (!item) return false;`
        - `item.done = !item.done; saveToStorage(); return true;`

    13. `deleteTodo(iso, id)`:
        - `const list = store.byDate[iso]; if (!list) return false;`
        - `const idx = list.findIndex(t => t.id === id); if (idx < 0) return false;`
        - `list.splice(idx, 1);`
        - `if (list.length === 0) delete store.byDate[iso];`  — 빈 배열 흔적 제거(직렬화 깔끔).
        - `saveToStorage(); return true;`

    14. 디버그/테스트용:
        - `_dump()` → `JSON.parse(JSON.stringify(store))` (deep clone, 외부 변형 방지).
        - `_reset()` → `store = emptyStore(); saveToStorage();`

    15. 전역 노출(D2-19):
        ```js
        window.todoApp = {
          STORAGE_KEY,
          getTodos,
          countByDate,
          addTodo,
          toggleTodo,
          deleteTodo,
          _dump,
          _reset,
        };
        ```

    16. 파일 끝에 줄바꿈 1개. import/export, ES module syntax 금지.

    **주의:** 이 plan에서는 DOM 조작이나 이벤트 바인딩을 절대 추가하지 않는다. `document`/`addEventListener` 호출 0회. (02-03이 추가한다.)
  </action>
  <verify>
    <automated>test -f todo.js && grep -q "'use strict'" todo.js && grep -q "todo-gsd:v1" todo.js && grep -q "window.todoApp" todo.js && grep -q "addTodo" todo.js && grep -q "toggleTodo" todo.js && grep -q "deleteTodo" todo.js && grep -q "countByDate" todo.js && grep -q "getTodos" todo.js && grep -q "JSON.parse" todo.js && grep -q "JSON.stringify" todo.js && ! grep -qE "document\.|addEventListener|innerHTML" todo.js && ! grep -qE "^\s*(import|export)\s" todo.js</automated>
  </verify>
  <acceptance_criteria>
    - `todo.js`가 프로젝트 루트에 존재한다.
    - `'use strict'` 선언, `STORAGE_KEY = 'todo-gsd:v1'` 상수.
    - `window.todoApp`에 `getTodos`, `countByDate`, `addTodo`, `toggleTodo`, `deleteTodo`, `_dump`, `_reset` 7개 메서드가 노출됨.
    - DOM API 호출(`document.*`, `addEventListener`, `innerHTML`) 0회.
    - import/export 구문 0회 (빌드 도구 없음).
    - 모든 mutation 이후 `saveToStorage()` 호출이 있다(grep 기준 `addTodo`/`toggleTodo`/`deleteTodo` 함수 본문에서 확인).
  </acceptance_criteria>
  <done>
    브라우저 콘솔에서 `window.todoApp.addTodo('2026-04-28','테스트')` 실행 후 `localStorage.getItem('todo-gsd:v1')`에 해당 항목이 직렬화되어 저장됨을 확인할 수 있다(02-03이 index.html에 script 태그를 연결한 뒤 실제 검증).
  </done>
</task>

</tasks>

<verification>
- `todo.js` 단일 신규 파일.
- 데이터 레이어만 — DOM 코드 0줄.
- localStorage 키 `todo-gsd:v1`, 스키마 `{ version: 1, byDate: {iso: Todo[]} }`.
- 폴백: 손상 JSON / 스키마 mismatch / quota 초과 모두 throw 없이 콘솔 경고.
</verification>

<success_criteria>
- 02-03 plan이 `window.todoApp`의 API만 사용해 패널 UI를 그릴 수 있다.
- 새로고침 후 `_dump()` 결과가 직전 상태와 동일하다(02-03 통합 후 UAT로 검증).
</success_criteria>

<output>
완료 후 `.planning/phases/02-todo-and-persistence/02-01-SUMMARY.md`를 생성하라.
</output>
