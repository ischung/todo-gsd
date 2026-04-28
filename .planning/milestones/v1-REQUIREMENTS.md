# Requirements Archive — v1 MVP

**Archived:** 2026-04-28
**Status:** ✅ All requirements validated via UAT

## v1 Requirements (final)

### Calendar

- [x] **CAL-01**: 사용자가 월간 달력 뷰를 볼 수 있다 (현재 월 기본 표시, 요일 헤더 포함) — Phase 1
- [x] **CAL-02**: 사용자가 이전/다음 달로 이동할 수 있다 — Phase 1
- [x] **CAL-03**: 각 날짜 셀에 해당 날짜의 할 일 개수가 표시된다 (0이면 표시 안 함; 99 초과 시 99+) — Phase 2
- [x] **CAL-04**: 사용자가 오늘 날짜를 시각적으로 구분해 볼 수 있다 — Phase 1

### Todo

- [x] **TODO-01**: 사용자가 날짜를 클릭하면 그 날짜의 할 일 목록을 볼 수 있다 — Phase 2
- [x] **TODO-02**: 사용자가 선택된 날짜에 새로운 할 일을 추가할 수 있다 (텍스트 입력) — Phase 2
- [x] **TODO-03**: 사용자가 할 일을 완료/미완료로 토글할 수 있다 (체크박스) — Phase 2
- [x] **TODO-04**: 사용자가 할 일을 삭제할 수 있다 — Phase 2

### Persistence

- [x] **PERSIST-01**: 모든 할 일 데이터가 브라우저 localStorage에 저장되어 새로고침 후에도 유지된다 — Phase 2

## Out of Scope (v1 결정)

| Feature | Reason |
|---------|--------|
| 멀티 유저/로그인 | 개인용 단일 사용자 |
| 백엔드/서버 동기화 | localStorage로 충분 |
| 알림/리마인더 | 요청 범위 외 |
| 반복 일정, 태그, 우선순위 | v1 단순성 우선 |
| 모바일 네이티브 앱 | 웹 우선 |

## Final Traceability

| Requirement | Phase | Status | Validation |
|-------------|-------|--------|------------|
| CAL-01 | Phase 1 | ✓ Validated | UAT 2026-04-28 |
| CAL-02 | Phase 1 | ✓ Validated | UAT 2026-04-28 |
| CAL-03 | Phase 2 | ✓ Validated | UAT 2026-04-28 (Test 6, 7 — 99+ 클램프 포함) |
| CAL-04 | Phase 1 | ✓ Validated | UAT 2026-04-28 |
| TODO-01 | Phase 2 | ✓ Validated | UAT 2026-04-28 (Test 1) |
| TODO-02 | Phase 2 | ✓ Validated | UAT 2026-04-28 (Test 2, 3) |
| TODO-03 | Phase 2 | ✓ Validated | UAT 2026-04-28 (Test 4) |
| TODO-04 | Phase 2 | ✓ Validated | UAT 2026-04-28 (Test 5) |
| PERSIST-01 | Phase 2 | ✓ Validated | UAT 2026-04-28 (Test 8) |

**Coverage:** 9/9 requirements validated. No gaps, no deferred items.

---

## Outcomes & Notes

- **모든 요구사항이 변경 없이 v1에서 완료** — 범위 조정 없음.
- UAT는 결함 0건으로 100% 통과 — 사양과 구현 정합성이 높았음.
- "할 일 개수" 표시는 99+ 클램프(3-digit 방어)를 추가로 확정.
- 단일 브라우저 가정으로 충분히 작동 — 다중 디바이스 동기화는 차후 마일스톤에서 재평가.

---

*Archived from .planning/REQUIREMENTS.md on 2026-04-28 at v1 milestone close.*
