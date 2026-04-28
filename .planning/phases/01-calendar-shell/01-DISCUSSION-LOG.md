# Phase 1: 달력 셸 - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions captured in CONTEXT.md — this log preserves the analysis.

**Date:** 2026-04-28
**Phase:** 01-calendar-shell
**Mode:** auto (자동 모드 — Claude가 합리적 기본값으로 결정)

## 분석한 Gray Areas와 자동 결정

| 영역 | 옵션 | 선택 | 사유 |
|------|------|------|------|
| 주 시작 요일 | 일요일 / 월요일 | **일요일** | 한국 일반 달력 관습 |
| 그리드 행 수 | 가변(4~6행) / 고정 6행 | **고정 6행** | 월 이동 시 레이아웃 점프 방지 |
| 이전/다음 달 빈 칸 | 완전 공백 / 흐린 숫자 표시 | **흐린 숫자 표시** | 달력 정렬·맥락 가독성 |
| 헤더 표기 | "April 2026" / "2026년 4월" | **2026년 4월** | 한국어 사용자 |
| 이동 컨트롤 | 화살표만 / 텍스트+화살표 / 키보드 | **텍스트+화살표 + "오늘" 버튼** | 명료성 + 빠른 복귀 |
| 오늘 강조 | 테두리만 / 배경 채우기 / 원형 | **배경(accent) + 흰 글자** | 한눈에 식별 가능 |
| 월 이동 단위 | 월/연/스와이프 | **월 단위만** | v1 단순성, 범위 외 항목 보존 |
| 파일 구조 | 1파일 / 분리 | **index.html + styles.css + calendar.js** | 프로젝트 규약 준수 |

## Deferred (스코프 외 — 향후 페이즈)

- 날짜 클릭 → Todo 패널 → Phase 2
- 날짜 셀 할 일 개수 배지 → Phase 2
- localStorage 영속화 → Phase 2

## Out of Scope 유지 (재추가 방지)

- 주말 색상 구분, 공휴일, 키보드 네비, 연도 점프, 스와이프 — v1에서 명시적으로 제외

---

*Generated in auto mode (no interactive Q&A). User can edit CONTEXT.md before /gsd-plan-phase 1 if any default is wrong.*
