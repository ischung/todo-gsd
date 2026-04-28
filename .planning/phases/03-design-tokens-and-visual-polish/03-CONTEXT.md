# Phase 3: 디자인 토큰 + 시각 다듬기 - Context

**Gathered:** 2026-04-28
**Status:** Ready for planning

<domain>
## Phase Boundary

`styles.css`에 라이트 미니멀 톤 디자인 토큰(`:root` CSS custom properties)을 도입하고, 현재 색 리터럴을 모두 토큰으로 치환한다. 오늘 셀과 다른 달 셀의 시각 표현을 라이트 미니멀 톤에 맞게 정돈한다. **CSS only** — `index.html`, `calendar.js`, `todo.js`는 0줄 변경.

</domain>

<decisions>
## Implementation Decisions

### 토큰 네이밍 체계
- **D-01:** Semantic only 방식. 역할 기반 네이밍 (`--color-surface`, `--color-text`, `--color-text-muted`, `--color-accent` 등). primitive 팔레트는 도입하지 않는다.
- **D-02:** 토큰 개수는 8–12개 범위 안. `:root` 한 곳에서 모두 정의.
- **D-03:** 모든 색상 리터럴(`#3478f6`, `#fafafa`, `#222`, `#666`, `#999`, `#b8b8b8`, `#e6e6e6`, `#d0d0d0`, `#f0f0f0`, `#f7f7f7`, `#e6effd`, `#fff`, rgba 포함)은 토큰으로 치환.

### 액센트 컬러
- **D-04:** 현재 `#3478f6` (강한 채도)에서 **soft blue** 톤으로 교체. 라이트 미니멀에 어울리도록 채도와 명도 조정 (예: indigo/blue 600 계열 — `#2563eb` 또는 유사 톤).
- **D-05:** 액센트 컬러는 `--color-accent` 1개로 통합 사용처: 오늘 셀 텍스트, 포커스 ring, `nav-btn--today` 보더/텍스트, 배지 텍스트, todo `__check`/`__input:focus` outline.

### 오늘 셀 표현 (VIS-01)
- **D-06:** Soft accent 배경 + 진한 액센트 글자 방식. 배경은 라이트 톤(예: blue 100/200 계열, `#dbeafe` 류), 텍스트는 진한 액센트 컬러(`--color-accent`).
- **D-07:** WCAG AA 대비 4.5:1 이상 — DevTools Contrast checker로 검증. 토큰 조합 결정 시 대비 먼저 확인.
- **D-08:** 보더 색상도 액센트 톤으로 정돈하되 배경과 충돌하지 않도록 조정. `font-weight: 700` 강조 유지.

### 다른 달 셀 표현 (VIS-02)
- **D-09:** "명확히 다르되 클릭 어포던스 유지" 톤. 배경은 살짝 어두운 그레이(`#f5f5f5` 정도, 현재 `#f7f7f7` 와 비슷한 수준 유지하되 토큰화), 글자는 muted(예: `#a0a0a0` 류).
- **D-10:** **`opacity` 절대 사용 금지** — 색상 토큰만으로 처리. 클릭 시 todo 패널이 정상적으로 열려야 함.

### 일관성 (VIS-03)
- **D-11:** 헤더, 네비게이션 버튼, 요일 헤더, 배지, todo 패널, todo 아이템까지 모든 시각 요소가 동일한 토큰 셋에서 도출되어야 한다. 직접 색상 리터럴 잔존 0개.
- **D-12:** 토큰 카테고리 (제안, 8–12개 안에서 조정):
  - 표면: `--color-bg`, `--color-surface`, `--color-surface-muted` (다른 달용)
  - 텍스트: `--color-text`, `--color-text-muted`, `--color-text-subtle`
  - 보더: `--color-border`, `--color-border-strong`
  - 액센트: `--color-accent`, `--color-accent-bg` (오늘 셀 배경), `--color-accent-text` (오늘 셀 텍스트 = 액센트 진한 톤)

### Claude's Discretion
- 정확한 hex 값 — 위 결정과 WCAG 4.5:1 제약을 만족하는 범위에서 planner/executor가 선택
- 토큰 개수 8–12 안에서의 분할 (`-strong`/`-subtle` 변형 추가 여부)
- `nav-btn--today`의 액센트 적용 방식 (배경/보더/텍스트 중 어느 조합)
- todo 패널 내부 보더·구분선 톤 매칭

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### 페이즈 명세 / 요구사항
- `.planning/ROADMAP.md` §"Phase 3: 디자인 토큰 + 시각 다듬기 (v1.1)" — Goal, Success criteria 1–4, Deliverables, Guards 전체
- `.planning/REQUIREMENTS.md` — VIS-01, VIS-02, VIS-03 (Visual 섹션) 및 Traceability

### 프로젝트 컨텍스트
- `.planning/PROJECT.md` §"Current Milestone: v1.1 UX 다듬기", §"Constraints" — 정적 자산, 의존성 추가 금지
- `.planning/STATE.md` — Phase 3 대기 상태

### 이전 페이즈 산출물 (변경하지 말 것)
- `.planning/phases/02-todo-and-persistence/02-CONTEXT.md` — Phase 2 결정 (localStorage 키, 스키마, 셀렉터 명명)
- `todo.js` — `todo-gsd:v` 키, `SCHEMA_VERSION` 변경 금지 (Guards)

### 대상 파일
- `styles.css` — 유일하게 변경할 파일
- `index.html`, `calendar.js`, `todo.js` — 0줄 변경 (검증 대상)

</canonical_refs>

<code_context>
## Existing Code Insights

### 현재 색 리터럴 (`styles.css`에서 추출)
- 텍스트: `#222` (기본), `#666` (요일 헤더, 삭제 버튼), `#999` (완료 todo), `#b8b8b8` (다른 달), `#fff` (오늘 셀 텍스트)
- 배경: `#fafafa` (body), `#fff` (셀, 패널, 입력, 삭제 버튼), `#f7f7f7` (다른 달), `#f0f0f0` (nav-btn hover, todo 구분선), `#f5f5f5` (delete hover), `#e6effd` (배지 bg)
- 보더: `#e6e6e6` (셀, 패널), `#d0d0d0` (nav-btn, input), `#e0e0e0` (delete), `#e0c0c0` (delete hover), `#f0f0f0` (todo-item bottom)
- 액센트: `#3478f6` (오늘 셀 bg, nav-btn--today, focus outline, 배지 text), `rgba(255,255,255,0.25)` (오늘 셀 위 배지)
- 위험 신호: `#c0392b` (delete hover text — 액센트와 충돌하는 임시 빨강. 토큰화 시 별도 결정 필요 — 유지/제거/교체)

### Reusable Assets
- `:root` 블록 자체는 신규 — 기존 코드 충돌 없음
- BEM 셀렉터 체계 일관 (`day--today`, `day--other-month`, `todo-item--done` 등) — 신규 modifier 추가 없이 색만 바꾸면 됨
- `system-ui` 폰트 스택 유지 (변경 범위 외)

### Established Patterns
- 모디파이어 클래스로 상태 표현: `--today`, `--other-month`, `--selected`, `--done` — 토큰 적용 시 그대로 활용
- 포커스 표현은 `outline: 2px solid <accent>; outline-offset: -2px` 통일 — 토큰화하기 좋음

### Integration Points
- `:root { --color-*: ... }` 블록을 파일 최상단(`*, *::before, ...` 위)에 추가
- 모든 색상 리터럴을 `var(--color-*)` 로 치환 (find/replace 단위 작업)
- `index.html`은 이미 `styles.css` 단일 링크 — 새 파일 생성 불필요

</code_context>

<specifics>
## Specific Ideas

- "라이트 미니멀 톤" — 채도 낮춘 soft blue 액센트, 그레이 스케일 위주, 강한 색 채움 회피
- 오늘 셀: `┌────┐ │28 •3│ ← soft blue bg + dark blue text └────┘` 류 비주얼
- 헤더/네비/배지/todo 패널 전부 같은 토큰 셋에서 파생되는 일관성

</specifics>

<deferred>
## Deferred Ideas

- 다크 모드 / 테마 시스템 — `PROJECT.md` Out of Scope 명시 (별도 마일스톤)
- 모바일/터치 최적화 — Out of Scope
- 폰트 스택 변경 / 타이포그래피 토큰 (font-size, weight, line-height) — Phase 3 범위는 색상 토큰. 필요 시 후속 페이즈
- 스페이싱 토큰 (padding, gap) — 동일 사유
- `delete:hover` 의 `#c0392b` 빨강이 미니멀 톤과 충돌하면 별도 destructive 토큰 도입 검토 — planner 재량

</deferred>

---

*Phase: 03-design-tokens-and-visual-polish*
*Context gathered: 2026-04-28*
