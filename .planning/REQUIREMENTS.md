# Requirements: 개인용 달력 Todo 앱

**Defined:** 2026-04-28
**Core Value:** 날짜 단위로 할 일을 빠르게 적고 보고, 새로고침해도 그대로 남아 있어야 한다.

## v1 Requirements

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

## v2 Requirements

(없음 — 요구된 범위에 집중)

## Out of Scope

| Feature | Reason |
|---------|--------|
| 멀티 유저/로그인 | 개인용 단일 사용자 |
| 백엔드/서버 동기화 | localStorage로 충분 |
| 알림/리마인더 | 요청 범위 외 |
| 반복 일정, 태그, 우선순위 | v1 단순성 우선 |
| 모바일 네이티브 앱 | 웹 우선 |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| CAL-01 | Phase 1 | ✓ Validated (UAT 2026-04-28) |
| CAL-02 | Phase 1 | ✓ Validated (UAT 2026-04-28) |
| CAL-03 | Phase 2 | ✓ Validated (UAT 2026-04-28) |
| CAL-04 | Phase 1 | ✓ Validated (UAT 2026-04-28) |
| TODO-01 | Phase 2 | ✓ Validated (UAT 2026-04-28) |
| TODO-02 | Phase 2 | ✓ Validated (UAT 2026-04-28) |
| TODO-03 | Phase 2 | ✓ Validated (UAT 2026-04-28) |
| TODO-04 | Phase 2 | ✓ Validated (UAT 2026-04-28) |
| PERSIST-01 | Phase 2 | ✓ Validated (UAT 2026-04-28) |

**Coverage:**
- v1 requirements: 9 total
- Mapped to phases: 9
- Unmapped: 0 ✓

---
*Requirements defined: 2026-04-28*
*Last updated: 2026-04-28 — 마일스톤 v1 완료 (모든 9개 요구사항 Validated)*
