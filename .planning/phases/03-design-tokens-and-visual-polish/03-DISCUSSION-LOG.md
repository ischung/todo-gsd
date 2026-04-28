# Phase 3: 디자인 토큰 + 시각 다듬기 - Discussion Log

> **Audit trail only.** CONTEXT.md is the canonical input for downstream agents.

**Date:** 2026-04-28
**Phase:** 03-design-tokens-and-visual-polish
**Mode:** discuss (interactive, --auto)

## Gray Areas Identified

ROADMAP.md success criteria가 많은 결정을 이미 잠궜으므로 (`:root` 토큰 8–12개, 오늘 셀 배경색 채우기 + WCAG AA, 다른 달 셀 opacity 금지, CSS only), 디자인 비전 영역만 사용자 결정으로 남김.

| # | Area | Options |
|---|---|---|
| 1 | 토큰 네이밍 체계 | Semantic only / Hybrid / Primitive only |
| 2 | 액센트 컬러 | Soft blue로 차분하게 / 현재 #3478f6 유지 / Neutral 위주 |
| 3 | 오늘 셀 표현 | Soft accent bg + 진한 글자 / 진한 bg + 흰 글자 / 보더 ring |
| 4 | 다른 달 셀 톤 | 명확히 다르되 클릭 어포던스 유지 / 거의 안 보일 정도 / 배경 동일 + 글자만 muted |

## User Selections

| # | Area | Choice |
|---|---|---|
| 1 | 토큰 네이밍 | **Semantic only** — 8–12개 제약과 일치, 사용처 명확 |
| 2 | 액센트 | **Soft blue로 차분하게** — 라이트 미니멀 톤 일관 |
| 3 | 오늘 셀 | **Soft accent bg + 진한 액센트 글자** — 미니멀 톤과 가장 자연스러움. 미리보기 채택 |
| 4 | 다른 달 | **명확히 다르되 클릭 어포던스 유지** — 현재 수준 유지하되 토큰화 |

전 항목 추천안 채택. 추가 자유 입력 없음.

## Codebase Scout Summary

- `styles.css` 단일 파일 변경 대상
- 색 리터럴 약 15종 (텍스트 5, 배경 7, 보더 5, 액센트 1 + rgba 1, destructive 1)
- BEM 셀렉터 체계 그대로 활용 가능 — 신규 modifier 불필요
- `index.html`, `calendar.js`, `todo.js` 무변경 검증 대상

## Deferred Ideas

- 다크 모드/테마 (PROJECT.md Out of Scope)
- 타이포그래피·스페이싱 토큰 (Phase 3은 색상 토큰 범위)
- destructive 컬러(`#c0392b`) 토큰화 방식 — planner 재량으로 위임

## Notes

- Phase 2가 이미 완료된 상태에서 사용자가 `/gsd-discuss-phase 2`로 호출했으나 의도는 Phase 3 (v1.1 첫 페이즈)로 확인됨. Phase 3으로 전환하여 진행.
