# Milestones

Historical record of shipped versions.

---

## v1 — MVP

**Shipped:** 2026-04-28
**Phases:** 2 (Phase 1 달력 셸, Phase 2 Todo + 영속화)
**Plans:** 6/6 complete
**Stats:** 672 LOC (HTML 57 / CSS 223 / JS 392)
**UAT:** 14 tests pass / 0 issues
**Timeline:** 1일 (2026-04-28)

### Delivered

월간 달력 + 날짜별 할 일 CRUD + localStorage 영속화의 정적 1인용 웹 앱 MVP. 백엔드/프레임워크 없음.

### Key Accomplishments

1. 정적 월간 달력 셸 (요일 헤더, 6주 고정 그리드, 오늘 강조, 월 이동/연도 경계 처리)
2. localStorage 기반 todo 데이터 레이어 — store + CRUD + 폴백 (null/스키마 mismatch/quota 초과 graceful)
3. 날짜 클릭 → 패널 (Enter/버튼 추가, 체크 토글, 삭제, 99+ 배지 클램프)
4. calendar.js renderMonth hook + optional chaining으로 todo.js와 비결합 통합
5. escapeHtml로 데이터 레이어 XSS 방어 강제

### Archives

- `.planning/milestones/v1-ROADMAP.md` — 페이즈 상세
- `.planning/milestones/v1-REQUIREMENTS.md` — 9/9 요구사항 traceability

### Known Deferred Items

없음.

### Tech Debt

- localStorage 용량 제한(~5MB) — 다량 데이터 시 IndexedDB 검토
- 단일 브라우저 가정 — 다중 디바이스는 백엔드 도입 시 재평가

---
