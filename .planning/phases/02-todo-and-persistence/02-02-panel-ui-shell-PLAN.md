---
phase: 02-todo-and-persistence
plan: 02
type: execute
wave: 1
depends_on: []
files_modified:
  - index.html
  - styles.css
autonomous: true
requirements:
  - TODO-01
  - CAL-03
must_haves:
  truths:
    - "index.html에 빈 Todo 패널 마크업(`.todo-panel`)이 존재하고 초기 hidden 상태다"
    - "styles.css에 `.todo-panel`, `.todo-list`, `.todo-item`, `.day__badge`, `.day--selected` 클래스가 정의되어 있다"
    - "todo.js가 `<script ... defer>`로 calendar.js 다음 줄에 연결되어 있다"
  artifacts:
    - path: "index.html"
      provides: "Todo 패널 마크업 골격 + todo.js 로드"
      contains: "class=\"todo-panel\""
    - path: "styles.css"
      provides: "패널/리스트/항목/배지/선택 셀 시각 스타일"
      contains: ".todo-panel"
  key_links:
    - from: "index.html"
      to: "todo.js"
      via: "<script src=\"todo.js\" defer></script>"
      pattern: "script.*todo\\.js"
---

<objective>
02-03이 채울 Todo 패널 UI의 정적 셸과 시각 토큰을 미리 만든다. 02-01과 병렬 실행 가능 — 같은 파일을 건드리지 않는다(`todo.js`는 02-01 담당, `index.html`/`styles.css`는 이 plan 담당).

Purpose: D2-07/08/09/10/11/14 시각 토큰을 마크업/CSS로 풀어 둔다. 02-03이 이 클래스들을 그대로 채우기만 하면 된다.
Output: `index.html` 갱신(패널 마크업 + todo.js 로드), `styles.css` 갱신(패널/배지/선택 스타일).
</objective>

<context>
@/Users/insang/Documents/강의/소프트웨어공학/2026/대면수업용/sdd/gsd/todo-gsd/.planning/PROJECT.md
@/Users/insang/Documents/강의/소프트웨어공학/2026/대면수업용/sdd/gsd/todo-gsd/.planning/REQUIREMENTS.md
@/Users/insang/Documents/강의/소프트웨어공학/2026/대면수업용/sdd/gsd/todo-gsd/.planning/ROADMAP.md
@/Users/insang/Documents/강의/소프트웨어공학/2026/대면수업용/sdd/gsd/todo-gsd/.planning/phases/02-todo-and-persistence/02-CONTEXT.md
@/Users/insang/Documents/강의/소프트웨어공학/2026/대면수업용/sdd/gsd/todo-gsd/index.html
@/Users/insang/Documents/강의/소프트웨어공학/2026/대면수업용/sdd/gsd/todo-gsd/styles.css

<interfaces>
<!-- 02-03이 사용할 DOM/CSS 후크 -->

DOM hooks (index.html):
- `<aside id="todo-panel" class="todo-panel" hidden aria-labelledby="todo-panel-title">` — 컨테이너
- `#todo-panel-title` — "YYYY년 M월 D일" 헤더 (h2)
- `#todo-input` — 텍스트 입력 (type="text", maxlength="200")
- `#todo-add` — 추가 버튼
- `#todo-list` — `<ul>`, 02-03이 `<li class="todo-item">`을 채움

CSS 클래스 계약:
- `.todo-panel`              — 인라인 패널 컨테이너 (hidden 시 미표시)
- `.todo-panel__header`      — 날짜 제목 영역
- `.todo-panel__form`        — 입력+추가 버튼 묶음
- `.todo-list`               — `<ul>` 베이스
- `.todo-item`               — 단일 항목 (체크박스/텍스트/삭제)
- `.todo-item--done`         — 완료 처리(취소선·흐림, D2-11)
- `.todo-item__check`        — 체크박스
- `.todo-item__text`         — 텍스트 노드
- `.todo-item__delete`       — 삭제 버튼
- `.day__badge`              — 셀 우상단 개수 배지 (D2-14)
- `.day--selected`           — 클릭된 셀 강조 (D2-08, today와 공존 가능)
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: index.html — Todo 패널 마크업 + todo.js 로드</name>
  <files>index.html</files>
  <read_first>
    - 현재 `index.html` (Phase 1 셸 그대로 보존)
    - 02-CONTEXT.md (D2-07 인라인 패널, D2-09 폼, D2-17 script 순서)
  </read_first>
  <action>
    기존 `index.html`을 다음과 같이 갱신한다(기존 마크업 보존, 추가만):

    1. `<head>`의 마지막 `<script>` 태그 다음 줄에 todo.js 로드 추가(D2-17):
       ```html
       <script src="todo.js" defer></script>
       ```
       → `calendar.js` 다음에 위치(둘 다 `defer`라 선언 순서대로 실행됨, calendar.js의 `window.calendarApp`이 todo.js 시점에 노출되어 있다).

    2. `<body>` 안의 기존 `<main class="calendar">`를 그대로 둔다. 그 직후(같은 body 자식 레벨)에 다음 패널을 추가:

       ```html
       <!-- Phase 2: 날짜 클릭 시 열리는 인라인 Todo 패널. todo.js가 보임/숨김과 내용을 제어. -->
       <aside id="todo-panel"
              class="todo-panel"
              hidden
              aria-labelledby="todo-panel-title">
         <header class="todo-panel__header">
           <h2 id="todo-panel-title" class="todo-panel__title">날짜를 선택하세요</h2>
           <button id="todo-panel-close" type="button" class="nav-btn" aria-label="패널 닫기">×</button>
         </header>

         <form id="todo-form" class="todo-panel__form" autocomplete="off">
           <input id="todo-input"
                  class="todo-panel__input"
                  type="text"
                  maxlength="200"
                  placeholder="할 일을 입력하세요"
                  aria-label="새 할 일">
           <button id="todo-add" type="submit" class="nav-btn">추가</button>
         </form>

         <ul id="todo-list" class="todo-list" aria-live="polite"></ul>
       </aside>
       ```

       - `hidden` 속성으로 초기에 숨김(02-03이 첫 클릭 시 제거).
       - `<form>`을 사용해 Enter 제출이 자연스럽게 동작(D2-09). 02-03이 `submit` 이벤트에서 `preventDefault`.
       - `<ul aria-live="polite">` — 항목 변동을 스크린리더에 알림(가벼운 접근성).

    3. 다른 부분은 수정하지 않는다. 기존 주석(`<!-- Phase 1 셸: ... -->`)은 그대로 유지.

    4. 파일 끝에 줄바꿈 1개. 인라인 스타일/스크립트 금지.
  </action>
  <verify>
    <automated>grep -q 'src="todo.js"' index.html && grep -q 'class="todo-panel"' index.html && grep -q 'id="todo-panel"' index.html && grep -q 'id="todo-input"' index.html && grep -q 'id="todo-list"' index.html && grep -q 'id="todo-form"' index.html && grep -q 'id="todo-add"' index.html && grep -q 'id="todo-panel-close"' index.html && grep -q 'hidden' index.html && grep -q 'maxlength="200"' index.html && ! grep -qE '<style|style="' index.html</automated>
  </verify>
  <acceptance_criteria>
    - `<script src="todo.js" defer></script>`가 `<script src="calendar.js" defer></script>` **다음 줄**에 있다.
    - `<aside>` 패널이 `<main class="calendar">` 다음 형제로 추가됨.
    - 5개 ID 후크(`todo-panel`, `todo-panel-title`, `todo-input`, `todo-list`, `todo-form`, `todo-add`, `todo-panel-close`) 모두 존재.
    - 초기 `hidden` 속성이 `<aside>`에 부착됨.
    - Phase 1의 모든 ID(`cal-title`, `cal-grid`, `cal-prev`, `cal-next`, `cal-today`)는 그대로 보존됨.
    - 인라인 `style=` 또는 `<style>` 블록 0개.
  </acceptance_criteria>
  <done>
    브라우저에서 index.html을 열었을 때 패널은 보이지 않지만(hidden), 개발자 도구로 hidden 속성을 제거하면 빈 패널 골격이 정상 렌더링된다.
  </done>
</task>

<task type="auto">
  <name>Task 2: styles.css — 패널/리스트/배지/선택 셀 스타일 추가</name>
  <files>styles.css</files>
  <read_first>
    - 현재 `styles.css` (Phase 1 스타일 보존)
    - 02-CONTEXT.md (D2-08, D2-11, D2-14)
  </read_first>
  <action>
    기존 `styles.css` 파일 끝에 다음 규칙들을 추가한다(기존 규칙 수정 금지, 추가만):

    1. 셀 위치 후크 — `.day`에 `position: relative` 추가가 필요하면 기존 `.day` 규칙 안에 `position: relative;` 한 줄만 추가한다(다른 속성은 손대지 말 것).
       - 만약 기존 `.day`에 이미 `position`이 있다면 변경하지 않는다.

    2. **선택된 셀** (D2-08):
       ```css
       .day--selected {
         outline: 2px solid #3478f6;
         outline-offset: -2px;
       }
       ```
       - `outline`을 사용해 today 배경색(파랑)과 충돌해도 시각이 살아남도록 한다(border 변경 대신).

    3. **개수 배지** (D2-14):
       ```css
       .day__badge {
         position: absolute;
         top: 4px;
         right: 6px;
         min-width: 18px;
         height: 18px;
         padding: 0 5px;
         border-radius: 9px;
         background: #e6effd;
         color: #3478f6;
         font-size: 11px;
         font-weight: 600;
         line-height: 18px;
         text-align: center;
       }
       .day--today .day__badge {
         background: rgba(255, 255, 255, 0.25);
         color: #fff;
       }
       ```

    4. **Todo 패널** (D2-07):
       ```css
       .todo-panel {
         max-width: 960px;
         margin: 16px auto 32px;
         padding: 16px;
         background: #fff;
         border: 1px solid #e6e6e6;
         border-radius: 8px;
       }
       .todo-panel[hidden] { display: none; }

       .todo-panel__header {
         display: flex;
         align-items: center;
         justify-content: space-between;
         gap: 8px;
         margin-bottom: 12px;
       }
       .todo-panel__title {
         margin: 0;
         font-size: 16px;
         font-weight: 600;
       }

       .todo-panel__form {
         display: flex;
         gap: 8px;
         margin-bottom: 12px;
       }
       .todo-panel__input {
         flex: 1;
         padding: 6px 10px;
         border: 1px solid #d0d0d0;
         border-radius: 6px;
         font-size: 14px;
       }
       .todo-panel__input:focus {
         outline: 2px solid #3478f6;
         outline-offset: -2px;
       }
       ```

    5. **Todo 리스트/항목** (D2-10, D2-11):
       ```css
       .todo-list {
         list-style: none;
         margin: 0;
         padding: 0;
       }

       .todo-item {
         display: flex;
         align-items: center;
         gap: 8px;
         padding: 6px 4px;
         border-bottom: 1px solid #f0f0f0;
       }
       .todo-item:last-child { border-bottom: none; }

       .todo-item__check {
         flex: none;
         width: 16px;
         height: 16px;
         cursor: pointer;
       }

       .todo-item__text {
         flex: 1;
         font-size: 14px;
         word-break: break-word;
       }

       .todo-item__delete {
         flex: none;
         padding: 4px 8px;
         border: 1px solid #e0e0e0;
         background: #fff;
         border-radius: 4px;
         cursor: pointer;
         font-size: 12px;
         color: #666;
       }
       .todo-item__delete:hover {
         background: #f5f5f5;
         color: #c0392b;
         border-color: #e0c0c0;
       }

       .todo-item--done .todo-item__text {
         text-decoration: line-through;
         color: #999;
       }
       ```

    6. 파일 끝에 줄바꿈 1개. 색상은 Phase 1과 동일 팔레트(`#3478f6` accent, 회색 톤)를 재사용했다.
  </action>
  <verify>
    <automated>grep -q '\.todo-panel' styles.css && grep -q '\.todo-list' styles.css && grep -q '\.todo-item' styles.css && grep -q '\.todo-item--done' styles.css && grep -q '\.todo-item__check' styles.css && grep -q '\.todo-item__text' styles.css && grep -q '\.todo-item__delete' styles.css && grep -q '\.day__badge' styles.css && grep -q '\.day--selected' styles.css && grep -q 'position: relative' styles.css && grep -q '\.calendar__grid' styles.css && grep -q '\.day--today' styles.css</automated>
  </verify>
  <acceptance_criteria>
    - 신규 셀렉터 9개가 모두 정의됨: `.todo-panel`, `.todo-panel__header`, `.todo-panel__form`, `.todo-panel__input`, `.todo-list`, `.todo-item`, `.todo-item--done`, `.todo-item__check`, `.todo-item__text`, `.todo-item__delete`, `.day__badge`, `.day--selected`.
    - 기존 Phase 1 셀렉터(`.calendar`, `.calendar__grid`, `.day--today`, `.day--other-month`)는 모두 그대로 존재.
    - `.day` 규칙에 `position: relative`가 있다(배지 absolute 위치를 위해).
    - `.todo-panel[hidden]`이 `display: none`을 적용한다.
  </acceptance_criteria>
  <done>
    개발자 도구에서 `<aside>`의 hidden을 제거하고 `.day` 셀 하나에 `<span class="day__badge">3</span>`을 임시로 넣어 보면 우상단 배지와 패널이 의도대로 보인다.
  </done>
</task>

</tasks>

<verification>
- `index.html`: todo.js 로드 + 빈 패널 마크업(hidden) 추가. 기존 Phase 1 마크업 보존.
- `styles.css`: 패널·리스트·항목·배지·선택 셀 스타일 추가. Phase 1 스타일 보존.
- `todo.js`는 이 plan에서 만들지 않는다(02-01 담당).
- 02-01과 동시 실행되어도 충돌 없음(서로 다른 파일).
</verification>

<success_criteria>
- 02-03 plan이 `window.todoApp` API와 이 plan의 DOM/CSS 후크만 사용해 인터랙션을 완성할 수 있다.
- 시각 토큰이 모두 사전에 잠겨 있어 02-03은 데이터-DOM 매핑에만 집중할 수 있다.
</success_criteria>

<output>
완료 후 `.planning/phases/02-todo-and-persistence/02-02-SUMMARY.md`를 생성하라.
</output>
