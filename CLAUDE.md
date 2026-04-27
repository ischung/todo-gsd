# 개인용 달력 Todo 앱

GSD 워크플로우로 관리되는 정적 웹 앱 프로젝트. 백엔드 없음, localStorage 기반.

## Workflow

- 단계 진행: `/gsd-plan-phase N` → `/gsd-execute-phase N` → `/gsd-verify-work` → `/gsd-progress`
- 모든 계획/요구사항/로드맵 산출물은 `.planning/`에 있고 git에 커밋된다.
- Mode: yolo · Granularity: coarse · Parallelization: on · Models: balanced

## Key Files

- `.planning/PROJECT.md` — 프로젝트 컨텍스트 (Core Value, Requirements, Constraints, Key Decisions)
- `.planning/REQUIREMENTS.md` — REQ-ID 단위 v1 요구사항 + Traceability
- `.planning/ROADMAP.md` — 페이즈 분해 (현재 2개 페이즈)
- `.planning/STATE.md` — 현재 진행 상태
- `.planning/config.json` — 워크플로우 설정

## Tech Stack

- 정적 HTML/CSS/Vanilla JS (프레임워크 없음)
- 데이터: 브라우저 localStorage
- 단일 사용자 / 단일 브라우저 가정

## Conventions

- 새 요구사항이 생기면 `PROJECT.md` Active 섹션과 `REQUIREMENTS.md`에 동시에 추가하고, 적절한 페이즈에 매핑한다.
- 페이즈 완료 시 `STATE.md`와 `REQUIREMENTS.md` Traceability 상태를 갱신한다.
- 범위 밖 항목은 사유와 함께 `Out of Scope`에 명시한다 (재추가 방지).
