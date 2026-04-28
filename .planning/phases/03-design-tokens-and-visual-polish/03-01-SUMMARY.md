---
phase: 03-design-tokens-and-visual-polish
plan: 01
status: complete
date: 2026-04-28
---

# Plan 03-01: 디자인 토큰 인프라 — Summary

## 무엇을 만들었나

`styles.css` 최상단에 12개 semantic 색상 토큰(`:root` CSS custom properties)을 정의하고, 파일 전체의 색 리터럴을 모두 `var(--color-*)` 참조로 1:1 치환했다. 시각 결과는 변경 전과 동일 — 톤 조정은 Plan 03-02 영역.

## 토큰 카테고리 (12개, D-12)

- **Surface (4):** `--color-bg`, `--color-surface`, `--color-surface-muted`, `--color-surface-hover`
- **Text (4):** `--color-text`, `--color-text-muted`, `--color-text-subtle`, `--color-text-disabled`
- **Border (2):** `--color-border`, `--color-border-strong`
- **Accent (2):** `--color-accent`, `--color-accent-bg`

## 검증 결과

| Gate | Expected | Actual |
|------|----------|--------|
| 토큰 개수 (`--color-*`) | 12 | 12 ✓ |
| `:root` 밖 hex 리터럴 | 1 (`#c0392b`) | 1 ✓ |
| `:root` 밖 rgba 리터럴 | 1 (`rgba(255,255,255,0.25)`) | 1 ✓ |
| `var(--color-*)` 사용처 | ≥ 25 | 32 ✓ |
| `opacity:` 등장 | 0 | 0 ✓ |
| `index.html`/`calendar.js`/`todo.js` diff | 0 lines | 0 ✓ |
| `todo-gsd:v` 키 보존 | ≥ 1 | 1 ✓ |
| `SCHEMA_VERSION` 보존 | ≥ 1 | 3 ✓ |

## 의도된 잔존 리터럴 (Plan 02에서 처리)

1. `.todo-item__delete:hover { color: #c0392b; }` — destructive 빨강. Plan 02가 라이트 미니멀 톤에 맞춰 `var(--color-text)`로 통합 예정.
2. `.day--today .day__badge { background: rgba(255, 255, 255, 0.25); }` — 흰 배경 위 흰 반투명. Plan 02가 오늘 셀 재구성하며 토큰화 예정.

## key-files.created

- `styles.css` (수정 — `:root` 블록 신규 + 색 속성 var 치환)

## Self-Check: PASSED

- VIS-03 부분 충족 (`:root` 토큰 일원화 인프라).
- VIS-01/02는 Plan 02 종료 시 충족 예정.

## 다음 단계

Plan 03-02가 `:root` 블록의 hex 값만 교체해 라이트 미니멀 톤(soft blue)으로 전환. 오늘 셀 재구성 + 잔존 리터럴 2건 정돈.
