---
phase: 01-calendar-shell
plan: 02
type: execute
wave: 2
depends_on: [01-01]
files_modified:
  - calendar.js
autonomous: true
requirements:
  - CAL-01
  - CAL-04
must_haves:
  truths:
    - "브라우저에서 index.html을 열면 현재 월의 달력이 6주 고정 그리드로 정확히 렌더링된다"
    - "이전/다음 달의 채움 칸이 .day--other-month로 흐리게 표시된다"
    - "현재 월의 오늘 날짜 셀에만 .day--today가 적용되어 강조된다"
  artifacts:
    - path: "calendar.js"
      provides: "renderMonth(year, month) — 42개 셀을 #cal-grid에 렌더링"
      contains: "function renderMonth"
  key_links:
    - from: "calendar.js renderMonth()"
      to: "#cal-grid"
      via: "innerHTML 교체"
      pattern: "cal-grid"
    - from: "calendar.js"
      to: "styles.css 클래스"
      via: "셀에 .day, .day--today, .day--other-month 부여"
      pattern: "day--today"
---

<objective>
`calendar.js`를 신규 생성하고, 주어진 (year, month)에 대해 일요일 시작·6주 고정 그리드 42칸을 `#cal-grid`에 렌더링하는 `renderMonth(year, month)` 함수를 구현한다. 페이지 로드 시 현재 월을 자동 렌더한다.

Purpose: D-01(일요일 시작), D-02(6주 고정 42칸), D-03(이전/다음 달 흐림), D-06(현재 월의 오늘만 강조), D-08(현재 월을 JS 변수 상태로 보유)을 코드로 풀어낸다. 월 이동 버튼 핸들러는 다음 plan(01-03)이 담당한다 — 이 plan은 "주어진 월을 그리는 순수 렌더 함수"까지만 책임진다.
Output: 신규 파일 `calendar.js`.
</objective>

<context>
@/Users/insang/Documents/강의/소프트웨어공학/2026/대면수업용/sdd/gsd/todo-gsd/.planning/phases/01-calendar-shell/01-CONTEXT.md
@/Users/insang/Documents/강의/소프트웨어공학/2026/대면수업용/sdd/gsd/todo-gsd/.planning/phases/01-calendar-shell/01-01-skeleton-and-styles-PLAN.md
@/Users/insang/Documents/강의/소프트웨어공학/2026/대면수업용/sdd/gsd/todo-gsd/index.html
@/Users/insang/Documents/강의/소프트웨어공학/2026/대면수업용/sdd/gsd/todo-gsd/styles.css

<interfaces>
<!-- 이 plan이 만드는 외부 노출 계약 -->

calendar.js 모듈 전역 (script src="calendar.js" defer):
- `state` (let): `{ year: number, month: number /* 0-11 */ }`
- `renderMonth(year, month)`: `#cal-title`을 "YYYY년 M월"로 갱신하고, `#cal-grid`에 42개의 `.day` 자식을 다시 그린다. 부수효과만, 반환값 없음.
- `renderCurrent()`: `state.year`/`state.month`로 `renderMonth`를 호출하는 단축 함수. 다음 plan(01-03)이 버튼 핸들러에서 호출.

DOM 결과 (셀 한 개의 마크업 형태):
```html
<div class="day [day--other-month] [day--today]" role="gridcell" data-date="YYYY-MM-DD">
  <span class="day__num">D</span>
</div>
```
- `data-date`는 ISO 형식 `YYYY-MM-DD` (Phase 2의 Todo 매핑 키로 재사용 예정).
- 다른 달 셀은 `day--other-month` 추가.
- 정확히 0~1개의 셀만 `day--today`를 가질 수 있다 (현재 월의 오늘만, D-06).
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: calendar.js 렌더 로직 구현</name>
  <files>calendar.js</files>
  <read_first>
    - index.html (DOM 후크: `#cal-title`, `#cal-grid`)
    - styles.css (`.day`, `.day--today`, `.day--other-month`, `.day__num` 클래스 계약)
    - 01-CONTEXT.md D-01/D-02/D-03/D-04/D-06/D-08
  </read_first>
  <action>
    프로젝트 루트에 `calendar.js`를 신규 생성한다. 다음 구조 그대로 작성 (Vanilla JS, 모듈 시스템 없음, IIFE 또는 평문 스크립트 — 평문 스크립트로 충분):

    ```js
    // Phase 1: 월간 달력 셸 — 렌더 로직.
    // D-01 일요일 시작 / D-02 6주 고정 / D-03 다른 달 흐림 / D-06 현재 월의 오늘만 강조.

    'use strict';

    // D-08: 현재 표시 중인 월을 모듈 상태로 보유.
    const state = {
      year: new Date().getFullYear(),
      month: new Date().getMonth(), // 0-11
    };

    // ISO YYYY-MM-DD 포맷 (로컬 시각 기준, UTC 변환 금지).
    function toISODate(year, month /* 0-11 */, day) {
      const mm = String(month + 1).padStart(2, '0');
      const dd = String(day).padStart(2, '0');
      return `${year}-${mm}-${dd}`;
    }

    function isSameYMD(a, b) {
      return a.getFullYear() === b.getFullYear()
          && a.getMonth() === b.getMonth()
          && a.getDate() === b.getDate();
    }

    // 42개 셀의 (year, month, day, isOtherMonth) 시퀀스 생성.
    // D-01: getDay()는 일=0 ... 토=6. 그대로 첫 칸 오프셋으로 사용.
    function buildCells(year, month) {
      const firstOfMonth = new Date(year, month, 1);
      const startOffset = firstOfMonth.getDay(); // 0=일
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const daysInPrevMonth = new Date(year, month, 0).getDate();

      const cells = [];

      // 앞쪽 채움: 이전 달 끝부분.
      for (let i = startOffset - 1; i >= 0; i--) {
        const day = daysInPrevMonth - i;
        const d = new Date(year, month - 1, day);
        cells.push({ year: d.getFullYear(), month: d.getMonth(), day, otherMonth: true });
      }

      // 현재 달.
      for (let day = 1; day <= daysInMonth; day++) {
        cells.push({ year, month, day, otherMonth: false });
      }

      // 뒤쪽 채움: 항상 42칸이 되도록 다음 달 시작부터.
      let nextDay = 1;
      while (cells.length < 42) {
        const d = new Date(year, month + 1, nextDay);
        cells.push({ year: d.getFullYear(), month: d.getMonth(), day: nextDay, otherMonth: true });
        nextDay++;
      }

      return cells;
    }

    function renderMonth(year, month) {
      const titleEl = document.getElementById('cal-title');
      const gridEl = document.getElementById('cal-grid');
      if (!titleEl || !gridEl) return;

      // D-04: "YYYY년 M월" (M은 0 패딩 없이).
      titleEl.textContent = `${year}년 ${month + 1}월`;

      const today = new Date();
      const cells = buildCells(year, month);

      // 한 번에 innerHTML 교체로 깜박임 최소화.
      const html = cells.map((c) => {
        const cellDate = new Date(c.year, c.month, c.day);
        const classes = ['day'];
        if (c.otherMonth) classes.push('day--other-month');
        // D-06: 현재 월(year/month 일치)의 오늘만 강조. 다른 달의 동일 숫자는 강조 X.
        if (!c.otherMonth && isSameYMD(cellDate, today)) classes.push('day--today');
        const iso = toISODate(c.year, c.month, c.day);
        return `<div class="${classes.join(' ')}" role="gridcell" data-date="${iso}"><span class="day__num">${c.day}</span></div>`;
      }).join('');

      gridEl.innerHTML = html;
    }

    function renderCurrent() {
      renderMonth(state.year, state.month);
    }

    // 페이지 로드 시 현재 월 렌더 (script defer라 DOM 준비 완료 보장).
    renderCurrent();

    // 다음 plan(01-03)이 사용할 수 있도록 전역에 노출.
    window.calendarApp = { state, renderMonth, renderCurrent };
    ```

    위 코드를 그대로 작성한다. 라이브러리, 빌드 단계, 모듈 import/export 사용 금지 (D-10).
  </action>
  <verify>
    <automated>test -f calendar.js &amp;&amp; grep -q 'function renderMonth' calendar.js &amp;&amp; grep -q 'function buildCells' calendar.js &amp;&amp; grep -q 'function renderCurrent' calendar.js &amp;&amp; grep -q "cells.length &lt; 42" calendar.js &amp;&amp; grep -q 'day--other-month' calendar.js &amp;&amp; grep -q 'day--today' calendar.js &amp;&amp; grep -q 'data-date' calendar.js &amp;&amp; grep -q "년 " calendar.js &amp;&amp; grep -q "월" calendar.js &amp;&amp; grep -q 'window.calendarApp' calendar.js &amp;&amp; node -e "const fs=require('fs');new Function(fs.readFileSync('calendar.js','utf8').replace(/document|window|new Date/g,'/*x*/'))" 2&gt;/dev/null || node --check calendar.js</automated>
  </verify>
  <acceptance_criteria>
    - `calendar.js`가 프로젝트 루트에 존재한다.
    - `renderMonth(year, month)`, `buildCells(year, month)`, `renderCurrent()` 세 함수가 정의되어 있다.
    - `cells.length < 42` 루프로 항상 42개 셀이 보장된다 (D-02).
    - 셀 마크업에 `data-date="YYYY-MM-DD"`가 포함되고, `.day__num`에 숫자가 들어간다.
    - `day--today`는 `c.otherMonth === false`인 경우에만 추가된다 (D-06: 정확히 현재 월의 오늘만).
    - `node --check calendar.js`가 syntax 에러 없이 통과한다.
    - `window.calendarApp = { state, renderMonth, renderCurrent }`로 다음 plan이 접근할 수 있다.
  </acceptance_criteria>
  <done>
    브라우저에서 index.html을 열면 현재 월이 6주 고정 그리드로 그려지고, 일요일이 좌측 첫 칸이며, 이전/다음 달 채움 칸은 흐리게, 오늘 셀은 accent로 강조된다.
  </done>
</task>

</tasks>

<verification>
- 헤더 텍스트가 "YYYY년 M월" 형식으로 갱신된다.
- `#cal-grid` 안의 자식 div 개수가 정확히 42개이다.
- 어느 달이든 첫 번째 셀의 요일이 일요일(인덱스 0)에 정렬된다.
- 현재 월일 때 `.day--today`가 정확히 1개, 다른 월을 표시할 때는 0개이다.
</verification>

<success_criteria>
- ROADMAP 성공 기준 #1(현재 월 렌더링), #3(오늘 강조)이 충족된다.
- 다음 plan(01-03)이 `window.calendarApp.state`와 `renderCurrent()`만으로 월 이동을 구현할 수 있다.
</success_criteria>

<output>
완료 후 `.planning/phases/01-calendar-shell/01-02-SUMMARY.md`를 생성하라.
</output>
