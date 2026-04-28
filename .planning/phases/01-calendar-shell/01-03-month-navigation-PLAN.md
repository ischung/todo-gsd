---
phase: 01-calendar-shell
plan: 03
type: execute
wave: 3
depends_on: [01-02]
files_modified:
  - calendar.js
autonomous: true
requirements:
  - CAL-02
must_haves:
  truths:
    - "이전 달 버튼을 누르면 한 달 이전이 렌더되고 헤더 연/월 표시도 갱신된다"
    - "다음 달 버튼을 누르면 한 달 이후가 렌더되고 헤더 연/월 표시도 갱신된다"
    - "오늘 버튼을 누르면 현재 시스템 월로 즉시 복귀한다"
    - "12월에서 다음 달로 이동하면 다음 해 1월로, 1월에서 이전 달로 이동하면 이전 해 12월로 정확히 넘어간다"
  artifacts:
    - path: "calendar.js"
      provides: "이전/오늘/다음 버튼 핸들러 — state를 갱신 후 renderCurrent() 호출"
      contains: "addEventListener"
  key_links:
    - from: "#cal-prev / #cal-next / #cal-today click"
      to: "state 갱신 → renderCurrent()"
      via: "addEventListener('click', ...)"
      pattern: "cal-prev|cal-next|cal-today"
---

<objective>
01-02에서 만든 `state`, `renderCurrent()`에 월 이동 버튼 핸들러를 연결한다. 이전/다음/오늘 세 버튼이 동작하고, 연·월 경계(1월↔12월)도 정확히 처리된다.

Purpose: D-05(이전/오늘/다음 버튼), D-07(월 단위 이동만, 연도 점프/단축키/스와이프 없음), D-08(state 갱신 → 리렌더 패턴) 구현. CAL-02 충족.
Output: `calendar.js`에 이벤트 핸들러 블록 추가.
</objective>

<context>
@/Users/insang/Documents/강의/소프트웨어공학/2026/대면수업용/sdd/gsd/todo-gsd/.planning/phases/01-calendar-shell/01-CONTEXT.md
@/Users/insang/Documents/강의/소프트웨어공학/2026/대면수업용/sdd/gsd/todo-gsd/.planning/phases/01-calendar-shell/01-02-render-month-PLAN.md
@/Users/insang/Documents/강의/소프트웨어공학/2026/대면수업용/sdd/gsd/todo-gsd/calendar.js
@/Users/insang/Documents/강의/소프트웨어공학/2026/대면수업용/sdd/gsd/todo-gsd/index.html
</context>

<tasks>

<task type="auto">
  <name>Task 1: 이전/오늘/다음 버튼 핸들러 추가</name>
  <files>calendar.js</files>
  <read_first>
    - 현재 `calendar.js`의 마지막 부분 (`renderCurrent();` 호출과 `window.calendarApp` 노출 라인) — 같은 위치 바로 위에 핸들러 블록을 끼워 넣을 것
    - index.html의 버튼 ID: `cal-prev`, `cal-today`, `cal-next`
  </read_first>
  <action>
    `calendar.js`의 `renderCurrent();` 호출(페이지 로드 시 첫 렌더) **직전**에 다음 핸들러 블록을 삽입한다. 기존 코드는 수정하지 않는다 (Surgical: 추가만).

    ```js
    // 월 이동 핸들러 (D-05, D-07, D-08).
    function goPrevMonth() {
      // month가 0(1월)이면 전년도 12월로.
      if (state.month === 0) {
        state.year -= 1;
        state.month = 11;
      } else {
        state.month -= 1;
      }
      renderCurrent();
    }

    function goNextMonth() {
      // month가 11(12월)이면 다음 해 1월로.
      if (state.month === 11) {
        state.year += 1;
        state.month = 0;
      } else {
        state.month += 1;
      }
      renderCurrent();
    }

    function goToday() {
      const now = new Date();
      state.year = now.getFullYear();
      state.month = now.getMonth();
      renderCurrent();
    }

    document.getElementById('cal-prev').addEventListener('click', goPrevMonth);
    document.getElementById('cal-next').addEventListener('click', goNextMonth);
    document.getElementById('cal-today').addEventListener('click', goToday);
    ```

    그리고 마지막 줄의 `window.calendarApp` 노출 객체에 세 함수를 추가한다 — 기존:
    ```js
    window.calendarApp = { state, renderMonth, renderCurrent };
    ```
    를 다음으로 교체:
    ```js
    window.calendarApp = { state, renderMonth, renderCurrent, goPrevMonth, goNextMonth, goToday };
    ```

    키보드 단축키, 스와이프, 연도 점프 핸들러는 추가하지 않는다 (D-07: Out of Scope).
  </action>
  <verify>
    <automated>grep -q 'function goPrevMonth' calendar.js &amp;&amp; grep -q 'function goNextMonth' calendar.js &amp;&amp; grep -q 'function goToday' calendar.js &amp;&amp; grep -q "getElementById('cal-prev').addEventListener" calendar.js &amp;&amp; grep -q "getElementById('cal-next').addEventListener" calendar.js &amp;&amp; grep -q "getElementById('cal-today').addEventListener" calendar.js &amp;&amp; grep -q 'state.month === 0' calendar.js &amp;&amp; grep -q 'state.month === 11' calendar.js &amp;&amp; grep -q 'goPrevMonth, goNextMonth, goToday' calendar.js &amp;&amp; node --check calendar.js</automated>
  </verify>
  <acceptance_criteria>
    - 세 함수 `goPrevMonth`, `goNextMonth`, `goToday`가 정의되어 있다.
    - 세 버튼 ID(`cal-prev`, `cal-next`, `cal-today`)에 `addEventListener('click', ...)`이 한 번씩 걸려 있다.
    - `goPrevMonth`는 `state.month === 0`일 때 `year -= 1; month = 11`로 전환한다.
    - `goNextMonth`는 `state.month === 11`일 때 `year += 1; month = 0`로 전환한다.
    - `window.calendarApp` 노출 객체에 `goPrevMonth, goNextMonth, goToday`가 추가되어 있다.
    - `node --check calendar.js`가 syntax 에러 없이 통과한다.
    - 키보드 이벤트(`keydown`/`keyup`/`keypress`) 핸들러가 calendar.js에 없다 (`! grep -E 'keydown|keyup|keypress' calendar.js`) — D-07.
  </acceptance_criteria>
  <done>
    브라우저에서 index.html을 열고 이전/다음 버튼을 반복 눌러 월을 자유롭게 이동할 수 있고 헤더 "YYYY년 M월"이 매번 갱신된다. 12월→1월, 1월→12월 경계가 연도 전환과 함께 정확히 처리된다. "오늘" 버튼으로 즉시 현재 월로 복귀할 수 있다.
  </done>
</task>

</tasks>

<verification>
- ROADMAP 성공 기준 #2(이전/다음 달 이동 + 헤더 갱신) 충족.
- 연도 경계 동작: 사용자가 1월에서 "이전 달"을 눌렀을 때 헤더가 "(year-1)년 12월"로 바뀐다.
- 오늘 버튼: 현재 월이 아닌 상태에서 클릭하면 현재 월로 점프하고 `.day--today`가 다시 보인다.
</verification>

<success_criteria>
- Phase 1의 모든 ROADMAP 성공 기준(#1, #2, #3)이 충족되어, 사용자가 "달력처럼 보이는 달력"에서 월을 자유롭게 이동하며 오늘을 한눈에 알 수 있다.
- CAL-01, CAL-02, CAL-04 요구사항이 동작 가능하다.
</success_criteria>

<output>
완료 후 `.planning/phases/01-calendar-shell/01-03-SUMMARY.md`를 생성하라.
</output>
