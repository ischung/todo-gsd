# Phase 1: 달력 셸 - Context

**Gathered:** 2026-04-28 (auto mode)
**Status:** Ready for planning

<domain>
## Phase Boundary

월간 달력 UI를 정적으로 렌더링하고, 이전/다음 달로 이동할 수 있으며, 오늘 날짜를 시각적으로 강조한다. Todo 추가/표시/영속화는 Phase 2의 범위이며, 이 페이즈는 "데이터 없는 빈 달력 셸"까지만 책임진다.

</domain>

<decisions>
## Implementation Decisions

### 주(week) 시작 요일
- **D-01:** 일요일을 한 주의 시작으로 한다 (요일 헤더: 일·월·화·수·목·금·토). 한국 일반 달력 관습 우선.

### 그리드 구조
- **D-02:** 항상 6주(6행 × 7열 = 42칸) 고정 그리드를 렌더링한다. 월에 따라 행 수가 바뀌지 않게 해 레이아웃 점프를 방지한다.
- **D-03:** 이전/다음 달의 날짜로 빈 칸을 채워 보여 주되, 시각적으로 흐리게(예: 더 옅은 글자색) 표시해 "다른 달"임을 구분한다. 클릭/상호작용 가능 여부는 Phase 2 결정 사항.

### 헤더 표시 형식
- **D-04:** "YYYY년 M월" 형식으로 한국어 표기 (예: "2026년 4월"). 달력 상단 중앙.
- **D-05:** 좌측에 "‹ 이전 달", 우측에 "다음 달 ›" 버튼. 텍스트+화살표 조합. "오늘" 버튼도 함께 두어 한 번에 현재 월로 복귀 가능.

### 오늘 강조
- **D-06:** 오늘 날짜 셀은 배경색(브랜드 accent)과 흰색 글자로 채워 한눈에 구분한다. 이전/다음 달의 "오늘이 아닌 같은 숫자"는 강조하지 않는다 (정확히 현재 월의 오늘만).

### 월 이동 동작
- **D-07:** 이전/다음 버튼은 월 단위 이동만 지원. 연도 점프, 키보드 단축키, 스와이프는 v1 범위 외 (Out of Scope 유지).
- **D-08:** 현재 월을 컴포넌트 상태(자바스크립트 변수)로 보유하고, 이동 시 해당 상태를 갱신 후 리렌더링한다.

### 페이지 구조
- **D-09:** `index.html`은 단일 페이지. 헤더(연/월 + 이동 버튼) + 달력 그리드 컨테이너만 포함. Todo 패널 자리는 Phase 2에서 추가.
- **D-10:** 스타일은 `styles.css` 단일 파일, 로직은 `calendar.js` 단일 파일. 빌드 도구 없음(브라우저에서 바로 열림).

### Claude's Discretion
- 정확한 색상 팔레트, 폰트 사이즈, 셀 크기/패딩 등 시각 디테일은 UI-SPEC 단계에서 잠긴다.
- 날짜 셀의 클릭 영역(셀 전체 vs 숫자만)은 Phase 2(Todo 진입)에서 결정.
- 키보드 포커스/접근성 보강은 잠재적 향상 항목이지만 v1 필수는 아님.

</decisions>

<specifics>
## Specific Ideas

- "달력처럼 보이는 달력" — 화면을 열자마자 익숙한 월간 달력 형태가 즉시 보여야 한다.
- 한국에서 흔히 쓰는 종이 달력/네이버 달력의 익숙한 레이아웃을 기준으로 한다 (일요일 시작, 빨강/파랑 주말 색은 v1에선 선택 사항).

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### 프로젝트 컨텍스트
- `.planning/PROJECT.md` — Core Value, Constraints (정적 웹 앱, localStorage)
- `.planning/REQUIREMENTS.md` §Calendar — CAL-01, CAL-02, CAL-04 정의
- `.planning/ROADMAP.md` §Phase 1 — 목표·산출물·성공 기준

### UI/스타일
- (없음 — UI-SPEC.md는 별도 워크플로우(`/gsd-ui-phase 1`)에서 생성될 예정)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- 없음. 코드베이스가 비어 있는 첫 페이즈 — 모든 파일이 신규 생성된다.

### Established Patterns
- 프로젝트 규약(CLAUDE.md): 정적 HTML/CSS/Vanilla JS, 빌드 도구·프레임워크 없음, 단일 사용자/단일 브라우저 가정.

### Integration Points
- 신규 파일: `index.html`, `styles.css`, `calendar.js` — 프로젝트 루트.
- Phase 2에서 동일 파일들에 Todo 패널과 데이터 바인딩이 추가될 것이므로, calendar.js의 월 상태/렌더 함수는 외부에서 호출 가능한 구조로 둔다 (예: `renderMonth(year, month)`).

</code_context>

<deferred>
## Deferred Ideas

- 날짜 셀 클릭 → Todo 패널 열기 — Phase 2 (TODO-01)
- 날짜별 할 일 개수 배지 — Phase 2 (CAL-03)
- localStorage 영속화 — Phase 2 (PERSIST-01)
- 주말 색상 구분, 공휴일 표시, 키보드 네비게이션, 연도 점프 — v1 Out of Scope (재추가 시 별도 페이즈)

</deferred>

---

*Phase: 01-calendar-shell*
*Context gathered: 2026-04-28*
