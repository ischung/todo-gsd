---
phase: 01-calendar-shell
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - index.html
  - styles.css
autonomous: true
requirements:
  - CAL-01
  - CAL-04
must_haves:
  truths:
    - "브라우저에서 index.html을 열면 헤더(이전/오늘/다음 버튼 + 연·월 표시)와 7열 요일 헤더, 6×7 빈 셀 그리드가 보인다"
    - "오늘 강조용 클래스(.day--today)와 다른 달 흐림용 클래스(.day--other-month)가 styles.css에 정의되어 있다"
    - "JS 없이도 정적 마크업/스타일이 깨지지 않고 정렬된다"
  artifacts:
    - path: "index.html"
      provides: "달력 셸 마크업: 헤더, 이동 버튼, 요일 헤더, 그리드 컨테이너"
      contains: "id=\"cal-grid\""
    - path: "styles.css"
      provides: "그리드 7열 레이아웃, 오늘/다른 달 셀 스타일"
      contains: ".day--today"
  key_links:
    - from: "index.html"
      to: "styles.css"
      via: "<link rel=\"stylesheet\" href=\"styles.css\">"
      pattern: "link.*styles\\.css"
    - from: "index.html"
      to: "calendar.js"
      via: "<script src=\"calendar.js\" defer></script>"
      pattern: "script.*calendar\\.js"
---

<objective>
Phase 1의 정적 셸을 만든다: `index.html`(단일 페이지 마크업)과 `styles.css`(그리드/오늘 강조 스타일). 이후 wave에서 `calendar.js`가 그리드 안의 셀을 채울 수 있도록 DOM 후크(id/클래스)와 시각적 토큰(클래스명)을 미리 확정한다.

Purpose: D-09(단일 페이지), D-10(파일 분리), D-01(요일 헤더 일~토), D-02(6주 고정 그리드), D-04(헤더 형식), D-05(이전/오늘/다음 버튼 배치), D-06(오늘 강조 시각 토큰)을 마크업/스타일로 풀어 둔다.
Output: 두 개의 신규 파일 — `index.html`, `styles.css`.
</objective>

<context>
@/Users/insang/Documents/강의/소프트웨어공학/2026/대면수업용/sdd/gsd/todo-gsd/.planning/PROJECT.md
@/Users/insang/Documents/강의/소프트웨어공학/2026/대면수업용/sdd/gsd/todo-gsd/.planning/REQUIREMENTS.md
@/Users/insang/Documents/강의/소프트웨어공학/2026/대면수업용/sdd/gsd/todo-gsd/.planning/ROADMAP.md
@/Users/insang/Documents/강의/소프트웨어공학/2026/대면수업용/sdd/gsd/todo-gsd/.planning/phases/01-calendar-shell/01-CONTEXT.md
@/Users/insang/Documents/강의/소프트웨어공학/2026/대면수업용/sdd/gsd/todo-gsd/CLAUDE.md

<interfaces>
<!-- 다음 wave의 calendar.js가 의존할 DOM 계약. 이 plan이 만들어 두는 후크. -->

DOM hooks (index.html이 노출):
- `#cal-title`         — "YYYY년 M월" 텍스트가 들어갈 헤더 요소 (D-04)
- `#cal-prev`          — "‹ 이전 달" 버튼 (D-05)
- `#cal-today`         — "오늘" 버튼 (D-05)
- `#cal-next`          — "다음 달 ›" 버튼 (D-05)
- `#cal-grid`          — 6×7 = 42개의 `.day` 셀이 채워질 컨테이너 (D-02)
- `.weekday-header`    — 요일 헤더 7칸을 감싸는 정적 영역 (D-01)

CSS 클래스 계약 (styles.css가 정의):
- `.day`               — 모든 날짜 셀의 기본 스타일
- `.day--today`        — 현재 월의 오늘 셀 (배경 accent + 흰 글자, D-06)
- `.day--other-month`  — 이전/다음 달의 채움용 셀 (글자 흐림, D-03)
- `.day__num`          — 셀 안의 숫자 텍스트 노드용 (calendar.js에서 채울 위치)
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: index.html 셸 마크업 작성</name>
  <files>index.html</files>
  <read_first>
    - .planning/phases/01-calendar-shell/01-CONTEXT.md (D-01, D-02, D-04, D-05, D-09, D-10)
    - CLAUDE.md (정적 HTML/CSS/Vanilla JS, 빌드 도구 없음)
  </read_first>
  <action>
    프로젝트 루트에 `index.html`을 신규 생성한다. 다음 구조를 그대로 작성:

    1. `<!DOCTYPE html>` + `<html lang="ko">` + `<head>` 안에:
       - `<meta charset="UTF-8">`
       - `<meta name="viewport" content="width=device-width, initial-scale=1">`
       - `<title>달력 Todo</title>`
       - `<link rel="stylesheet" href="styles.css">`
       - `<script src="calendar.js" defer></script>`  (D-10: calendar.js는 다음 wave에서 생성됨, defer로 DOM 준비 후 실행)

    2. `<body>` 안에 한 개의 `<main class="calendar">` 컨테이너:

       (a) 헤더 영역 `<header class="calendar__header">`:
           - 좌측 버튼: `<button id="cal-prev" type="button" class="nav-btn" aria-label="이전 달">‹ 이전 달</button>` (D-05)
           - 중앙 제목: `<h1 id="cal-title" class="calendar__title">YYYY년 M월</h1>`  ← 텍스트는 placeholder, calendar.js가 채움 (D-04)
           - "오늘" 버튼: `<button id="cal-today" type="button" class="nav-btn nav-btn--today">오늘</button>` (D-05)
           - 우측 버튼: `<button id="cal-next" type="button" class="nav-btn" aria-label="다음 달">다음 달 ›</button>` (D-05)

       (b) 요일 헤더 `<div class="weekday-header" role="row">` — 정적으로 7칸을 직접 작성 (D-01: 일요일 시작):
           ```
           ["일","월","화","수","목","금","토"]
           ```
           각각 `<div class="weekday-header__cell" role="columnheader">일</div>` … `>토</div>`.

       (c) 달력 그리드 컨테이너:
           `<div id="cal-grid" class="calendar__grid" role="grid" aria-labelledby="cal-title"></div>`
           ← 비워 둔다. calendar.js가 42개의 `.day` 셀을 채운다 (D-02).

    3. Todo 패널 자리는 만들지 않는다 (D-09: Phase 2에서 추가).

    주석으로 다음 한 줄을 `<main>` 위에 남긴다:
    `<!-- Phase 1 셸: 달력만. Todo 패널은 Phase 2에서 추가. -->`

    파일 끝에 줄바꿈 1개. 인라인 스타일/스크립트 금지(D-10).
  </action>
  <verify>
    <automated>test -f index.html &amp;&amp; grep -q 'id="cal-title"' index.html &amp;&amp; grep -q 'id="cal-grid"' index.html &amp;&amp; grep -q 'id="cal-prev"' index.html &amp;&amp; grep -q 'id="cal-next"' index.html &amp;&amp; grep -q 'id="cal-today"' index.html &amp;&amp; grep -q 'href="styles.css"' index.html &amp;&amp; grep -q 'src="calendar.js"' index.html &amp;&amp; grep -q 'defer' index.html &amp;&amp; grep -q '>일<' index.html &amp;&amp; grep -q '>토<' index.html</automated>
  </verify>
  <acceptance_criteria>
    - `index.html`이 프로젝트 루트에 존재한다.
    - 5개의 ID 후크(`cal-title`, `cal-grid`, `cal-prev`, `cal-next`, `cal-today`)가 모두 마크업에 있다.
    - `<link rel="stylesheet" href="styles.css">`와 `<script src="calendar.js" defer>`가 head에 있다.
    - 요일 헤더에 일·월·화·수·목·금·토 7개 텍스트가 정확히 한 번씩 등장한다.
    - 인라인 `style=` 속성이나 `<style>` 블록이 없다 (`! grep -E '<style|style="' index.html`).
  </acceptance_criteria>
  <done>
    브라우저에서 index.html을 직접 열었을 때 (JS 없어도) 머리글 영역과 빈 그리드 영역이 마크업으로 보인다.
  </done>
</task>

<task type="auto">
  <name>Task 2: styles.css 그리드/오늘 강조 스타일</name>
  <files>styles.css</files>
  <read_first>
    - 방금 작성한 `index.html`의 클래스/ID 구조
    - 01-CONTEXT.md (D-02 6주 고정, D-03 다른 달 흐림, D-06 오늘 강조)
  </read_first>
  <action>
    프로젝트 루트에 `styles.css`를 신규 생성한다. 다음 규칙을 작성:

    1. 베이스 리셋(최소): `*, *::before, *::after { box-sizing: border-box; }` 와 `body { margin: 0; font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Apple SD Gothic Neo", "Malgun Gothic", sans-serif; color: #222; background: #fafafa; }`.

    2. `.calendar` 컨테이너: `max-width: 960px; margin: 32px auto; padding: 16px;`.

    3. `.calendar__header`: flex 레이아웃 — `display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 12px;`.
       - `.calendar__title`: `font-size: 20px; font-weight: 600; margin: 0; flex: 1; text-align: center;` (D-04 중앙)
       - `.nav-btn`: `padding: 6px 12px; border: 1px solid #d0d0d0; background: #fff; border-radius: 6px; cursor: pointer; font-size: 14px;` + `:hover { background: #f0f0f0; }`
       - `.nav-btn--today`: `border-color: #3478f6; color: #3478f6;`

    4. 요일 헤더 `.weekday-header`: `display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; margin-bottom: 4px;`.
       - `.weekday-header__cell`: `text-align: center; font-size: 12px; color: #666; padding: 6px 0; font-weight: 600;`.

    5. 그리드 `.calendar__grid` (D-02 6주 = 6행 × 7열 고정):
       - `display: grid; grid-template-columns: repeat(7, 1fr); grid-template-rows: repeat(6, 1fr); gap: 4px; min-height: 480px;`
       - 6행 고정 — 행 수가 월에 따라 바뀌지 않게 함.

    6. 셀 `.day`:
       - `background: #fff; border: 1px solid #e6e6e6; border-radius: 6px; padding: 6px 8px; min-height: 72px; font-size: 13px; color: #222;`
       - 셀 안 숫자 위치 잡이 위해 `display: flex; flex-direction: column; align-items: flex-start;`
       - `.day__num`: `font-size: 13px; font-weight: 500; line-height: 1;`

    7. 다른 달 셀 `.day--other-month` (D-03): `color: #b8b8b8; background: #f7f7f7;` (글자/배경을 옅게 — 다른 달임을 시각 구분).

    8. 오늘 셀 `.day--today` (D-06): `background: #3478f6; color: #fff; border-color: #3478f6;`
       - `.day--today .day__num { color: #fff; font-weight: 700; }`
       - 명시: D-06에 따라 다른 달의 동일 숫자에는 적용되지 않는다 — 이 클래스는 calendar.js가 "현재 월의 오늘"에만 부여한다 (CSS는 그 계약을 그대로 시각화만 한다).

    9. 파일 끝에 줄바꿈 1개. 색상은 모두 위에 적힌 값을 그대로 사용 (정확한 팔레트 추가 변경은 추후 UI-SPEC 단계).
  </action>
  <verify>
    <automated>test -f styles.css &amp;&amp; grep -q '\.calendar__grid' styles.css &amp;&amp; grep -q 'repeat(7, 1fr)' styles.css &amp;&amp; grep -q 'repeat(6, 1fr)' styles.css &amp;&amp; grep -q '\.day--today' styles.css &amp;&amp; grep -q '\.day--other-month' styles.css &amp;&amp; grep -q '\.weekday-header' styles.css &amp;&amp; grep -q '\.nav-btn' styles.css</automated>
  </verify>
  <acceptance_criteria>
    - `styles.css`가 프로젝트 루트에 존재한다.
    - 그리드는 7열 × 6행 고정 (`repeat(7, 1fr)`와 `repeat(6, 1fr)`이 동시에 등장).
    - `.day--today`, `.day--other-month`, `.day__num`, `.weekday-header__cell`, `.nav-btn`, `.nav-btn--today` 셀렉터가 모두 정의됨.
    - `.day--today`의 background와 color가 각각 accent 색(`#3478f6`)과 `#fff`로 설정됨.
  </acceptance_criteria>
  <done>
    index.html을 다시 브라우저에서 열면 헤더가 정렬되고, 요일 헤더 7칸이 균등 분포되며, (셀이 비어 있어도) 6행 그리드 영역이 일정한 높이로 보인다.
  </done>
</task>

</tasks>

<verification>
- `index.html`과 `styles.css` 두 파일이 존재한다.
- DOM 후크 5개(`cal-title`, `cal-grid`, `cal-prev`, `cal-next`, `cal-today`)와 CSS 클래스 4개(`.day`, `.day--today`, `.day--other-month`, `.day__num`)가 다음 wave의 calendar.js가 그대로 사용할 수 있도록 확정되었다.
- 빌드 도구·인라인 스타일·인라인 스크립트가 없다.
</verification>

<success_criteria>
- 브라우저에서 index.html을 직접 열었을 때 헤더와 빈 6주 그리드 셸이 깨지지 않고 보인다.
- 다음 plan(01-02)이 `#cal-grid`를 `innerHTML` 또는 `appendChild`로 채우기만 하면 즉시 D-01/D-02/D-03/D-06 시각이 동작한다.
</success_criteria>

<output>
완료 후 `.planning/phases/01-calendar-shell/01-01-SUMMARY.md`를 생성하라.
</output>
