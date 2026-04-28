# Requirements: 개인용 달력 Todo 앱

**Defined:** 2026-04-28
**Core Value:** 날짜 단위로 할 일을 빠르게 적고 보고, 새로고침해도 그대로 남아 있어야 한다.

## v1 Requirements (Shipped)

### Calendar

- [x] **CAL-01**: 사용자가 월간 달력 뷰를 볼 수 있다 (현재 월 기본 표시, 요일 헤더 포함)
- [x] **CAL-02**: 사용자가 이전/다음 달로 이동할 수 있다
- [x] **CAL-03**: 각 날짜 셀에 해당 날짜의 할 일 개수가 표시된다 (0이면 표시 안 함 또는 0)
- [x] **CAL-04**: 사용자가 오늘 날짜를 시각적으로 구분해 볼 수 있다

### Todo

- [x] **TODO-01**: 사용자가 날짜를 클릭하면 그 날짜의 할 일 목록을 볼 수 있다
- [x] **TODO-02**: 사용자가 선택된 날짜에 새로운 할 일을 추가할 수 있다 (텍스트 입력)
- [x] **TODO-03**: 사용자가 할 일을 완료/미완료로 토글할 수 있다 (체크박스)
- [x] **TODO-04**: 사용자가 할 일을 삭제할 수 있다

### Persistence

- [x] **PERSIST-01**: 모든 할 일 데이터가 브라우저 localStorage에 저장되어 새로고침 후에도 유지된다

## v1.1 Requirements (UX 다듬기)

### Visual (시각 디자인)

- [ ] **VIS-01**: 오늘 날짜 셀이 배경색 채우기로 강조된다 (라이트 톤 액센트 배경 + WCAG 4.5:1 이상 대비 글자색)
- [ ] **VIS-02**: 이번 달이 아닌 셀(앞/뒤 달 채우기)이 톤다운된 색상으로 흐리게 표시되되 클릭은 그대로 가능하다 (opacity 미사용 — 색상 토큰으로 처리)
- [ ] **VIS-03**: 라이트 미니멀 톤의 디자인 토큰(`:root` CSS custom properties)이 정의되고, 색상/배경/테두리 모든 시각 속성이 토큰을 통해 일원화된다

### Interaction (할 일 패널 인터랙션)

- [ ] **INT-01**: 완료된 할 일이 취소선 + muted 색상으로 동시에 표시된다 (opacity 적용 금지 — 체크/삭제 버튼 가시성 유지)
- [ ] **INT-02**: 할 일 추가 후 입력창이 비워지고 포커스가 입력창에 유지된다 (연속 입력 흐름 보존)
- [ ] **INT-03**: 한국어 IME 조합 중 Enter가 실수 추가/중복을 일으키지 않는다 (`<form>` submit 사용 유지, 입력창에 별도 keydown Enter 핸들러 추가 금지)
- [ ] **INT-04**: 삭제 버튼의 클릭 영역이 ≥28×28px이며 즉시 삭제된다 (확인 다이얼로그·Undo 토스트 없음)

### Info (날짜 셀 정보 밀도)

- [ ] **INFO-01**: 날짜 셀의 숫자 배지가 라이트 미니멀 톤에 맞게 다듬어진 스타일(색상/모양/크기)로 표시된다 (오늘 셀 위에서도 가독성 유지)
- [ ] **INFO-02**: 해당 날짜의 모든 할 일이 완료되면(>0개 + 전부 완료) 셀의 숫자 배지 자리에 인라인 SVG 체크 아이콘이 표시된다 (할 일이 0개인 빈 날짜와 시각적으로 구분)

### Accessibility (키보드 / 접근성)

- [ ] **A11Y-01**: 페이지에서 ←/→로 이전/다음 달 이동, `T`(또는 `t`)로 오늘로 점프할 수 있다 (입력창 안에서는 비활성화 — `target.tagName === 'INPUT'` 가드, modifier 키 동시 입력 시 비활성화)
- [ ] **A11Y-02**: 그리드 셀에 키보드 포커스가 있으면 방향키로 셀 이동이 가능하다 (←→ ±1일, ↑↓ ±7일, Home/End 주의 시작/끝, PageUp/PageDown 월 이동, 월 경계는 자동으로 이전/다음 달로 진입). 그리드 ←/→는 페이지 ←/→ 월 이동보다 우선 (컨텍스트 분기)
- [ ] **A11Y-03**: 달력 셀이 roving tabindex 패턴을 따른다 (현재 포커스 셀만 `tabindex="0"`, 나머지는 `tabindex="-1"` — Tab 1번에 그리드 들어오고/나가기)
- [ ] **A11Y-04**: 오늘 셀에 `aria-current="date"`, 패널이 열린 셀에 `aria-selected="true"`가 동적으로 부여된다
- [ ] **A11Y-05**: 그리드가 `role="grid"` + 7개씩 묶인 `role="row"` 래퍼 + `role="gridcell"` 구조를 따른다
- [ ] **A11Y-06**: 키보드 사용 시에만 포커스 윤곽이 표시된다 (`:focus-visible` 글로벌 정책 — 마우스 클릭 시 outline 깜빡임 제거)
- [ ] **A11Y-07**: 셀의 `aria-label`이 풍부하게 합성된다 (예: "4월 28일 화요일, 할 일 3개, 모두 완료, 오늘")
- [ ] **A11Y-08**: 패널을 닫을 때(Escape 또는 다른 방식) 직전에 포커스했던 셀로 포커스가 복귀한다

## v2 Requirements (Future)

### Should-have (이번 마일스톤 P2 — 시간 남으면)

- **A11Y-09**: 완료 토글에 0.1~0.15s transition 적용 + `prefers-reduced-motion: reduce` 시 0s로 강제

## Out of Scope

| Feature | Reason |
|---------|--------|
| 멀티 유저/로그인 | 개인용 단일 사용자 |
| 백엔드/서버 동기화 | localStorage로 충분 |
| 알림/리마인더 | 요청 범위 외 |
| 반복 일정, 태그, 우선순위 | v1 단순성 우선 |
| 모바일 네이티브 앱 | 웹 우선 |
| 다크 모드 | 테마 시스템 도입은 별도 마일스톤 가치 (토큰만 깔아두고 미사용) |
| 모바일 반응형/터치 최적화 | v1.1은 데스크톱 UX 우선 |
| 빈 상태/온보딩 안내 | v1.1 범위 외 |
| 삭제 확인 다이얼로그 / Undo 토스트 | 사용자 명시 거부 — 즉시 삭제 |
| 셀 todo 텍스트 미리보기 | 미니멀 톤 침해 |
| Drag-and-drop으로 todo 이동 | 범위 외 |
| 검색/필터 | 범위 외 |
| 다른 뷰(주/일/연) | 월간 뷰만 유지 |
| Emoji 체크 아이콘 / 아이콘 폰트 | 인라인 SVG로 충분 |
| localStorage 스키마 마이그레이션 | v1.1는 키/스키마 무변경 (`todo-gsd:v1`, `SCHEMA_VERSION=1` 그대로) |

## Traceability

(v1.1 페이즈는 ROADMAP.md에서 매핑됨 — 이 표는 로드맵 작성 후 갱신)

| Requirement | Phase | Status |
|-------------|-------|--------|
| CAL-01 | Phase 1 | ✓ Complete |
| CAL-02 | Phase 1 | ✓ Complete |
| CAL-03 | Phase 2 | ✓ Complete |
| CAL-04 | Phase 1 | ✓ Complete |
| TODO-01 | Phase 2 | ✓ Complete |
| TODO-02 | Phase 2 | ✓ Complete |
| TODO-03 | Phase 2 | ✓ Complete |
| TODO-04 | Phase 2 | ✓ Complete |
| PERSIST-01 | Phase 2 | ✓ Complete |
| VIS-01 | Phase 3 | Pending |
| VIS-02 | Phase 3 | Pending |
| VIS-03 | Phase 3 | Pending |
| INT-01 | Phase 4 | Pending |
| INT-02 | Phase 4 | Pending |
| INT-03 | Phase 4 | Pending |
| INT-04 | Phase 4 | Pending |
| INFO-01 | Phase 4 | Pending |
| INFO-02 | Phase 4 | Pending |
| A11Y-01 | Phase 5 | Pending |
| A11Y-02 | Phase 5 | Pending |
| A11Y-03 | Phase 5 | Pending |
| A11Y-04 | Phase 5 | Pending |
| A11Y-05 | Phase 5 | Pending |
| A11Y-06 | Phase 5 | Pending |
| A11Y-07 | Phase 5 | Pending |
| A11Y-08 | Phase 5 | Pending |

**Coverage (v1.1):**
- v1.1 requirements: 17 total
- Mapped to phases: 17
- Unmapped: 0 ✓

---
*Requirements defined: 2026-04-28*
*Last updated: 2026-04-28 after milestone v1.1 scoping*
