# Phase 2: Todo + 영속화 - Context

**Gathered:** 2026-04-28 (auto mode)
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 1이 만든 정적 달력 셸 위에 (1) 날짜별 할 일 CRUD, (2) 각 날짜 셀의 할 일 개수 배지, (3) localStorage 영속화를 더한다. 모든 v1 요구사항(CAL-03, TODO-01~04, PERSIST-01)을 이 페이즈가 닫는다. 백엔드/동기화/멀티 유저는 범위 외이며, 단일 브라우저·단일 사용자 가정은 그대로 유지한다.

</domain>

<decisions>
## Implementation Decisions

### 데이터 모델 / 키
- **D2-01:** 저장 단위는 ISO 날짜 문자열(`YYYY-MM-DD`, 로컬 시각 기준 — `calendar.js`의 `toISODate`와 동일 규약). UTC 변환 금지.
- **D2-02:** localStorage 키는 `todo-gsd:v1`. 단일 키에 전체 데이터 직렬화(JSON). 키별 분산 저장 안 함 — 단순성 우선, 데이터량 작음.
- **D2-03:** 직렬화 형태:
  ```json
  {
    "version": 1,
    "byDate": {
      "2026-04-28": [
        { "id": "t_1714312345678_ab12", "text": "장보기", "done": false, "createdAt": 1714312345678 }
      ]
    }
  }
  ```
  `id`는 `t_` + `Date.now()` + 짧은 랜덤(4자) 조합. 같은 ms에 여러 건 추가되어도 충돌 안 나게.
- **D2-04:** 저장은 모든 mutation(추가/토글/삭제) 직후에 동기 `localStorage.setItem` 호출. 별도 디바운스 없음 — 동작이 단순하고 데이터량이 작아 비용 무시.
- **D2-05:** 손상된 JSON / 스키마 mismatch / `version` 불일치는 빈 store로 폴백하고 콘솔에 경고만 남긴다. 자동 마이그레이션 없음(v1만 존재).
- **D2-06:** Quota Exceeded는 콘솔 경고만 — v1 단일 사용자 환경에서 발생 가능성이 매우 낮음. UI 모달/복구 없음.

### CRUD UX
- **D2-07:** 날짜 셀 클릭 → 그 날짜의 Todo 패널이 열린다. 패널은 달력 우측(또는 모바일 대응 시 아래)에 인라인 표시. 모달 아님. 다른 날짜 클릭 시 패널 내용만 교체.
- **D2-08:** 선택된 날짜 셀에는 `.day--selected` 시각 표시(테두리 강조). 오늘 셀(`.day--today`)과 동시 적용 가능 — 두 클래스가 함께 붙어도 깨지지 않게 스타일.
- **D2-09:** 패널 상단에 "YYYY년 M월 D일" + 입력창(텍스트) + 추가 버튼. Enter로도 추가 가능. 빈 문자열/공백만은 추가 거부(trim 후 길이 0이면 무시). 최대 길이 200자(초과는 자른다).
- **D2-10:** 각 항목은 한 줄: `[체크박스] 텍스트 [삭제 버튼]`. 체크박스 토글로 `done` 갱신. 삭제는 즉시 삭제(확인 모달 없음 — 단일 사용자, 실수 비용 낮음, 단순성 우선).
- **D2-11:** 완료된 항목은 텍스트에 취소선 + 흐린 색. 정렬 순서는 `createdAt` 오름차순 고정 (완료/미완료 분리하지 않음).

### 개수 배지 (CAL-03)
- **D2-12:** 모든 날짜 셀(현재 월 + 다른 달 채움 셀 모두)에 배지 표시. 다른 달 셀의 데이터도 존재하면 카운트한다(데이터는 ISO 키 기준이라 자연스럽게 잡힌다).
- **D2-13:** 0건이면 배지 자체를 렌더링하지 않는다(요구사항: "0이면 표시 안 함 또는 0" → "표시 안 함" 채택, 시각 노이즈 감소).
- **D2-14:** 배지 위치는 셀 우상단. `.day__badge` 클래스. 숫자만 표시. 99 초과는 `99+`.
- **D2-15:** CRUD 직후 (1) 패널 리스트와 (2) 해당 날짜 셀의 배지 두 곳을 즉시 갱신. 전체 재렌더링 대신 해당 셀의 배지만 부분 갱신해도 되고, 단순함을 우선해 현재 월 셀 전체 배지 재계산을 호출해도 된다(O(셀)이라 무시 가능).

### 통합/구조
- **D2-16:** 신규 파일 `todo.js` — 데이터 레이어(store, CRUD, 영속화) + Todo 패널/배지 렌더 + 이벤트 바인딩까지 담는다. 빌드 도구가 없어 모듈 분리 비용이 더 큼. 단, 함수 단위로 명확히 구획(주석 헤더로 섹션 구분).
- **D2-17:** `index.html`은 `<script src="todo.js" defer>`를 `calendar.js` 다음에 추가. `defer` 보장으로 calendar.js의 `window.calendarApp`이 todo.js 실행 시점에 이미 노출되어 있다.
- **D2-18:** `calendar.js`는 최소 수정 — `renderMonth` 안에서 외부 hook(`window.todoApp?.afterRenderMonth?.(...)`)을 호출해 todo.js가 배지를 입힐 기회를 갖게 한다. 셀 클릭 위임은 todo.js가 `#cal-grid`에 직접 `addEventListener`로 등록(이벤트 위임 — 셀이 매번 다시 그려져도 부모는 유지됨).
- **D2-19:** 전역 namespace는 `window.todoApp`. 기존 `window.calendarApp`과 충돌 없음.

### Claude's Discretion
- 패널의 정확한 폭/배치(우측/하단) 등 시각 디테일.
- 색상은 Phase 1의 `#3478f6` accent와 회색 톤을 그대로 재사용.
- 접근성(role, aria-label)은 합리적 수준에서 부여(필수 모달 트랩 등은 없음 — 인라인 패널이라 불필요).

</decisions>

<specifics>
## Specific Ideas

- "달력처럼 보이는 달력에 메모 붙이기" — 셀 클릭 → 인라인 노트.
- 개수 배지는 셀 우상단에 작게(원형 또는 라운드 사각). 색은 가볍게.
- 새로고침 후에도 그대로 — 새로고침 자체가 핵심 UAT 시나리오.

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### 프로젝트 컨텍스트
- `.planning/PROJECT.md` — Core Value, Constraints (정적 웹 앱, localStorage)
- `.planning/REQUIREMENTS.md` §Calendar(CAL-03) §Todo(TODO-01~04) §Persistence(PERSIST-01)
- `.planning/ROADMAP.md` §Phase 2 — 목표·산출물·성공 기준

### 직접 의존하는 Phase 1 산출물
- `index.html` — 기존 마크업, `#cal-grid` / `.day` / `.day__num` 후크
- `styles.css` — `.day`, `.day--today`, `.day--other-month` 스타일
- `calendar.js` — `window.calendarApp.{state, renderMonth, renderCurrent, ...}`, `data-date` ISO 부착, `defer`로 DOM 후 실행
- `.planning/phases/01-calendar-shell/01-CONTEXT.md` — D-01~D-10 의사결정 (특히 D-10 단일 파일 규칙)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `calendar.js`의 `toISODate(year, month, day)` — Todo 키 생성과 동일 포맷이므로 todo.js에서 동일한 ISO 변환 유틸을 별도로 만들지 말고 셀의 `data-date` 속성을 그대로 읽어 쓰는 것이 안전하다(중복 구현 회피).
- `#cal-grid` 컨테이너는 `innerHTML` 한 번에 교체된다 — 이벤트 위임이 자연스럽다.
- `data-date="YYYY-MM-DD"` 속성이 모든 `.day` 셀에 이미 있다(현재 월 + 다른 달 채움 셀 모두).
- `window.calendarApp.renderCurrent()` — 월 이동 직후에도 호출되므로, 같은 hook 지점에서 todo.js의 배지 재계산이 트리거되도록 설계하면 깔끔.

### Established Patterns
- ES2017+ vanilla JS, `'use strict'`, 모듈 패턴 없음(전역 namespace 객체로 노출).
- 함수 분리 + 주석으로 섹션 구분, 한국어 주석 OK (calendar.js 스타일과 동일하게).
- 빌드 도구 없음 → import/export 금지.
- HTML/CSS는 BEM 유사 네이밍(`block__elem--mod`).

### Integration Points
- `index.html`: `<script src="todo.js" defer></script>`를 `calendar.js` 다음 줄에 추가.
- `index.html`: `<main class="calendar">` 옆 또는 아래에 `<aside class="todo-panel" hidden>` 마크업 추가.
- `styles.css`: `.todo-panel`, `.todo-list`, `.todo-item`, `.day__badge`, `.day--selected` 클래스 추가.
- `calendar.js`: `renderMonth` 끝부분에 `window.todoApp?.afterRenderMonth?.(year, month);` 한 줄 추가(없으면 호출 안 됨 → Phase 1 단독 실행 시에도 안전).

</code_context>

<deferred>
## Deferred Ideas

- 다중 디바이스 동기화, 백엔드 API — Out of Scope (PROJECT.md)
- 알림/리마인더, 반복 일정, 태그/우선순위 — Out of Scope
- Drag-to-move(다른 날짜로 이동), 일자 범위 선택 — v2 후보(여기서는 처리 안 함)
- 대용량 데이터(수만 건) 최적화 — 단일 사용자 가정상 불필요

</deferred>

---

*Phase: 02-todo-and-persistence*
*Context gathered: 2026-04-28*
