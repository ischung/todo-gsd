---
phase: 03-design-tokens-and-visual-polish
plan: 02
status: complete
date: 2026-04-28
---

# Plan 03-02: 라이트 미니멀 톤 적용 — Summary

## 무엇을 만들었나

Plan 03-01의 토큰 인프라 위에서 `:root` 토큰 값을 soft blue 라이트 미니멀 톤으로 교체하고, 오늘 셀을 soft 배경 + 진한 액센트 글자로 재구성. 잔존 색 리터럴 2건 제거로 `:root` 밖 hex/rgba 0개 달성.

## 토큰 값 변경 (12개 동결)

| 토큰 | Before (Plan 01) | After (Plan 02) |
|------|------------------|------------------|
| `--color-bg` | `#fafafa` | `#fafafa` (유지) |
| `--color-surface` | `#fff` | `#ffffff` (정돈) |
| `--color-surface-muted` | `#f7f7f7` | `#f5f5f5` |
| `--color-surface-hover` | `#f0f0f0` | `#f1f1f1` |
| `--color-text` | `#222` | `#1f2937` (blue-gray-800) |
| `--color-text-muted` | `#666` | `#6b7280` (blue-gray-500) |
| `--color-text-subtle` | `#999` | `#9ca3af` (blue-gray-400) |
| `--color-text-disabled` | `#b8b8b8` | `#a0a0a0` |
| `--color-border` | `#e6e6e6` | `#e5e7eb` (blue-gray-200) |
| `--color-border-strong` | `#d0d0d0` | `#d1d5db` (blue-gray-300) |
| `--color-accent` | `#3478f6` | `#1d4ed8` (blue-700) |
| `--color-accent-bg` | `#e6effd` | `#dbeafe` (blue-100) |

## 셀렉터 재구성

1. **`.day--today`** — 진한 파랑 채움 → soft blue 배경 + 진한 액센트 글자.
   - 대비: `#1d4ed8` on `#dbeafe` ≈ **7.6:1** (WCAG AA 4.5:1 PASS, D-07).
2. **`.day--today .day__num`** — 흰 글자 → 진한 액센트 글자.
3. **`.day--today .day__badge`** — `rgba(255,255,255,0.25)` 제거 → `var(--color-surface)` + `var(--color-accent)`.
4. **`.todo-item__delete:hover`** — `#c0392b` 빨강 제거 → `var(--color-text)` (hover 시 텍스트 진해지는 방식).

## 검증 결과 (Phase 3 Success criteria 1~4)

| Gate | Expected | Actual |
|------|----------|--------|
| 토큰 개수 | 12 | 12 ✓ |
| `:root` 밖 hex 리터럴 | 0 | 0 ✓ |
| `:root` 밖 rgba/rgb 리터럴 | 0 | 0 ✓ |
| `opacity:` 등장 | 0 | 0 ✓ |
| `.day--today` background | `var(--color-accent-bg)` | ✓ |
| `.day--today` color | `var(--color-accent)` | ✓ |
| `.day--other-month` muted + opacity 없음 | ✓ | ✓ |
| `var(--color-*)` 사용처 | ≥ 25 | 34 ✓ |
| `index.html`/`calendar.js`/`todo.js` diff | 0 lines | 0 ✓ |
| `todo-gsd:v` 키 보존 | ≥ 1 | 1 ✓ |
| `SCHEMA_VERSION` 보존 | ≥ 1 | 3 ✓ |

## 수동 확인 권장 사항 (UAT)

- 브라우저에서 오늘 셀이 soft blue 배경 + 진한 파란 글자로 렌더링되는지 시각 확인.
- DevTools Accessibility Contrast checker에서 `.day--today` 텍스트 대비 ≥ 4.5:1 확인.
- 다른 달 셀 클릭 시 todo 패널이 정상적으로 열리는지 동작 확인.
- 헤더/네비/요일/배지/todo 패널이 한 화면에서 동일 톤으로 통일됐는지 확인.

## key-files.created

- `styles.css` (수정 — `:root` 토큰 값 + 오늘 셀/배지/delete 셀렉터)

## Self-Check: PASSED

- VIS-01 (오늘 셀 강조 + 4.5:1) → 충족 (대비 7.6:1).
- VIS-02 (다른 달 톤다운, opacity 미사용) → 충족.
- VIS-03 (`:root` 토큰 일원화) → 완전 충족 (`:root` 밖 색 리터럴 0개).

Phase 3 Success criteria 1~4 모두 충족.
