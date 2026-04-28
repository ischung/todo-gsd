# Phase 2: Todo + 영속화 - Discussion Log

> **Audit trail only.** Downstream agents read CONTEXT.md, not this log.

**Date:** 2026-04-28
**Phase:** 02-todo-and-persistence
**Mode:** auto (컨텍스트가 plan-phase 단계에서 사전 합성됨)
**Areas analyzed:** 데이터 모델/키, 영속화 정책, CRUD UX, 개수 배지, 통합 구조

## 진행 경로 요약

`/gsd:plan-phase 2`(auto chain)에서 CONTEXT.md가 먼저 합성된 뒤 plan 3종이 생성되었다. 이후 `/gsd:discuss-phase 2`가 호출되었으나 — auto 모드 규칙상 (1) CONTEXT.md 존재 → "Update it" (2) plans 존재 → "Continue and replan after"로 분기. 검토 결과 모든 그레이 영역이 이미 결정되어 있어 **재논의 없이 audit trail만 기록**한다.

## 그레이 영역별 결정 (CONTEXT.md 매핑)

### 데이터 모델 / 키
| 결정 | 선택 | 사유 |
|---|---|---|
| 저장 단위 키 | ISO `YYYY-MM-DD` (로컬 시각) | calendar.js `toISODate`와 동일 규약, UTC 변환 회피 |
| localStorage 키 | 단일 `todo-gsd:v1` | 데이터량 작음, 키별 분산 불필요 |
| 항목 ID | `t_${Date.now()}_${rand4}` | 같은 ms 다중 추가 충돌 방지 |
| 정렬 | `createdAt` 오름차순 | 완료/미완료 분리 안 함 — 단순성 |

### 영속화 정책
| 결정 | 선택 | 사유 |
|---|---|---|
| 저장 시점 | mutation 직후 동기 setItem | 디바운스 불필요, 데이터 작음 |
| JSON 손상/스키마 mismatch | 빈 store 폴백 + 콘솔 경고 | 자동 마이그레이션 없음(v1만) |
| Quota 초과 | 콘솔 경고만, throw 안 함 | 1인 사용 환경에서 발생 가능성 무시 |

### CRUD UX
| 결정 | 선택 | 사유 |
|---|---|---|
| 패널 형태 | 인라인 `<aside>` (모달 X) | 다른 날짜 클릭 시 내용만 교체 |
| 입력 검증 | trim 후 빈 문자열 거부, 200자 컷 | 가벼운 가드 |
| 삭제 확인 | 즉시 삭제 (확인 모달 X) | 단일 사용자 실수 비용 낮음 |
| 완료 표시 | 취소선 + 흐림 | 익숙한 패턴 |
| Enter 추가 | `<form>` 제출로 자연스러움 | preventDefault로 새로고침 차단 |

### 개수 배지 (CAL-03)
| 결정 | 선택 | 사유 |
|---|---|---|
| 표시 범위 | 모든 셀(현재 월 + 다른 달 채움 포함) | data-date 키 자연 매핑 |
| 0건 처리 | 배지 미렌더 | 시각 노이즈 감소 |
| 위치 | 셀 우상단 (`.day__badge` absolute) | today 배경과 충돌 시 outline로 분리 |
| 99 초과 | `99+` 표기 | 가독성 |
| 갱신 시점 | CRUD 직후 + 월 이동 후(hook) | 부분 재계산, O(셀) 무시 가능 |

### 통합 구조
| 결정 | 선택 | 사유 |
|---|---|---|
| 파일 분리 | 단일 `todo.js` | 빌드 도구 없음 → 모듈 분리 비용↑ |
| script 순서 | calendar.js 다음 줄 (`defer`) | `window.calendarApp` 선노출 보장 |
| calendar.js 변경 | hook 1줄 (`window.todoApp?.afterRenderMonth?.(...)`) | optional chaining으로 Phase 1 단독 실행성 보존 |
| 셀 클릭 처리 | `#cal-grid` 이벤트 위임 | innerHTML 재생성에 안전 |
| 전역 namespace | `window.todoApp` | calendar 와 충돌 없음 |
| XSS 방어 | `escapeHtml` 후 innerHTML 또는 textContent | 텍스트 직삽 금지 |

## Scope Creep — 차단 항목

다음은 토론 중 등장할 수 있으나 ROADMAP 범위 외 — `<deferred>` 처리:
- Drag-to-move (다른 날짜로 이동)
- 일자 범위 선택 / 멀티 셀렉트
- 대용량 데이터 가상화
- 다중 디바이스 sync, 알림, 반복 일정, 태그/우선순위 — PROJECT.md Out of Scope 유지

## Auto-Resolved

CONTEXT.md 합성 시점에 `--auto` 컨텍스트로 19개 결정(D2-01 ~ D2-19)이 모두 권장값으로 잠김. 사용자 정정 0건.

## 검증

- ROADMAP 성공 기준 4개 → CONTEXT 결정으로 1:1 매핑 ✓
- 요구사항 6개(CAL-03, TODO-01~04, PERSIST-01) → 결정으로 추적 가능 ✓
- 다운스트림 에이전트(planner/executor)가 추가 질문 없이 동작 가능 ✓

---

*Phase: 02-todo-and-persistence*
*Discussion log written: 2026-04-28 (auto mode, post-plan audit)*
