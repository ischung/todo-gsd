---
phase: 03-design-tokens-and-visual-polish
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - styles.css
autonomous: true
requirements:
  - VIS-03
must_haves:
  truths:
    - "styles.css 최상단 `:root` 블록에 8–12개 semantic 색상 토큰이 정의되어 있다"
    - "styles.css 안에 `#`(hex)으로 시작하는 색 리터럴이 `:root` 블록 밖에서는 0개다"
    - "styles.css 안에 `rgba(`/`rgb(`로 시작하는 색 리터럴이 `:root` 블록 밖에서는 0개다"
    - "치환 후 시각 결과가 변경 전과 거의 동일하다 (1:1 매핑 — 톤 조정은 02 plan에서)"
    - "`index.html`, `calendar.js`, `todo.js`의 git diff가 0 lines다"
    - "localStorage 키/스키마 grep 결과가 변경 전과 동일하다 (`todo-gsd:v`, `SCHEMA_VERSION`)"
  artifacts:
    - path: "styles.css"
      provides: ":root 토큰 블록 + 모든 색 속성이 var(--color-*) 형태"
      contains: ":root {"
  key_links:
    - from: "styles.css 모든 셀렉터"
      to: ":root 토큰 정의"
      via: "var(--color-*)"
      pattern: "var\\(--color-"
---

<objective>
Phase 3을 두 단계로 분할한 첫 번째 plan. `styles.css` 최상단 `:root` 블록에 8–12개의 semantic 색상 토큰을 정의하고, 파일 안의 모든 색 리터럴(hex/rgba)을 토큰 참조(`var(--color-*)`)로 치환한다. **시각 결과는 변경 전과 동일** — 토큰 값은 기존 hex를 그대로 사용해 1:1 매핑한다. 톤 자체의 변경(soft blue, 오늘 셀 재구성 등)은 Plan 02에서 한다.

Purpose: D-01 (semantic only), D-02 (8–12개), D-03 (모든 리터럴 치환), D-12 (토큰 카테고리)를 잠근다. 시각 회귀 없이 인프라만 먼저 깔아 Plan 02에서는 토큰 값만 바꾸면 톤이 따라오게 한다.

Output: 토큰 블록이 추가되고 모든 색 참조가 `var(--*)`로 치환된 `styles.css` 단일 파일.
</objective>

<context>
@/Users/insang/Documents/강의/소프트웨어공학/2026/대면수업용/sdd/gsd/todo-gsd/.planning/PROJECT.md
@/Users/insang/Documents/강의/소프트웨어공학/2026/대면수업용/sdd/gsd/todo-gsd/.planning/REQUIREMENTS.md
@/Users/insang/Documents/강의/소프트웨어공학/2026/대면수업용/sdd/gsd/todo-gsd/.planning/ROADMAP.md
@/Users/insang/Documents/강의/소프트웨어공학/2026/대면수업용/sdd/gsd/todo-gsd/.planning/phases/03-design-tokens-and-visual-polish/03-CONTEXT.md
@/Users/insang/Documents/강의/소프트웨어공학/2026/대면수업용/sdd/gsd/todo-gsd/styles.css
@/Users/insang/Documents/강의/소프트웨어공학/2026/대면수업용/sdd/gsd/todo-gsd/index.html
@/Users/insang/Documents/강의/소프트웨어공학/2026/대면수업용/sdd/gsd/todo-gsd/CLAUDE.md

<token_set>
<!-- Plan 01에서 도입할 11개 semantic 토큰 + 기존 hex로의 1:1 매핑 -->
<!-- 카테고리는 D-12에 따른다. Plan 02에서 hex 값만 조정한다(이름/개수 동결). -->

표면 (Surface):
  --color-bg              = #fafafa   /* body 배경 */
  --color-surface         = #fff      /* 셀, 패널, 입력, 삭제 버튼 */
  --color-surface-muted   = #f7f7f7   /* 다른 달 셀 */
  --color-surface-hover   = #f0f0f0   /* nav-btn hover, todo-item 구분선 */

텍스트 (Text):
  --color-text            = #222      /* 기본 텍스트 */
  --color-text-muted      = #666      /* 요일 헤더, 삭제 버튼 텍스트 */
  --color-text-subtle     = #999      /* 완료 todo 텍스트 */
  --color-text-disabled   = #b8b8b8   /* 다른 달 셀 텍스트 */

보더 (Border):
  --color-border          = #e6e6e6   /* 셀, 패널 */
  --color-border-strong   = #d0d0d0   /* nav-btn, input */

액센트 (Accent):
  --color-accent          = #3478f6   /* 액센트 단일 — 오늘 셀 bg, focus, nav-btn--today */
  --color-accent-bg       = #e6effd   /* 배지 배경 (오늘 셀 외) */
  --color-accent-text     = #fff      /* 오늘 셀 위 글자 */

(총 13개 — D-02 8–12 범위 한도. 다음 중 하나로 13→12로 줄일 것:
 a) `--color-surface-hover`를 `--color-surface-muted`로 흡수(현재 둘 다 회색이지만 의미 다름 — 분리 유지 권장),
 b) `--color-accent-text`를 제거하고 02 plan에서 `--color-accent` 진한 톤으로 대체 (02에서 오늘 셀 텍스트가 흰색이 아니게 되므로 자연스러움).
 → **권장 b**: Plan 01 단계에서는 `--color-accent-text: #fff`로 두되, Plan 02가 오늘 셀 재구성 시 이 토큰을 제거하고 `--color-accent` 진한 톤으로 통합한다. Plan 01 시점 토큰 개수는 13. **하지만 D-02 상한 12를 지키려면 Plan 01에서 미리 12개로 맞춰야 한다.**

→ **확정안 (12개):** `--color-accent-text` 제거. 오늘 셀 텍스트(`#fff`)는 Plan 01에서 한시적으로 `var(--color-surface)` 재사용으로 매핑(`#fff`로 동일). 의미상 어색하지만 1:1 hex 보존이 목표이고, Plan 02가 오늘 셀을 재구성하며 이 매핑을 정상화한다.
)

위험 신호 토큰화:
  `#c0392b` (delete:hover 텍스트) — destructive 의미. Plan 01에서 토큰화하지 않고 인라인 hex로 남기지 말 것.
  → **결정:** `--color-danger: #c0392b` 1개 추가. 13개로 다시 초과.
  → **재확정 (12개):** `#c0392b`는 Plan 01 단계에서 인라인 그대로 두고, Plan 02에서 라이트 미니멀 톤에 맞춰 제거 또는 `--color-text-muted`로 통합 결정. Plan 01 verify의 hex 0개 grep은 `:root` 블록과 **이 한 줄 예외(`color: #c0392b`)** 를 허용한다. action에서 명시한다.

**최종 12개 토큰:** bg, surface, surface-muted, surface-hover, text, text-muted, text-subtle, text-disabled, border, border-strong, accent, accent-bg.
</token_set>
</context>

<approach>
**왜 분할하는가.** 토큰 도입 + 시각 톤 변경을 한 plan에 묶으면 verify 시 "치환이 맞는지" "톤이 좋은지" 두 축이 섞여 회귀 디버깅이 어렵다. Plan 01은 hex를 그대로 토큰 변수로 옮겨 시각 회귀 0을 보장하고, Plan 02가 토큰 값만 조정해 톤을 잠근다.

**1:1 매핑 원칙.** 기존 hex를 토큰 값에 그대로 넣는다. 예: `--color-accent: #3478f6` (Plan 02에서 `#2563eb` 류로 교체). 이렇게 하면 Plan 01 끝 시점의 화면은 변경 전과 픽셀 동일해야 한다.

**예외 1건 — `#c0392b` (delete:hover 텍스트).** destructive 의미라 Plan 01에서 강제 토큰화하면 12개를 초과한다. Plan 01 단계에서는 인라인 hex 그대로 두고 verify의 hex grep에서 이 한 줄을 예외로 허용한다 (action에 명시). Plan 02가 톤 결정과 함께 처리.
</approach>

<tasks>

<task type="auto">
  <name>Task 1: :root 토큰 블록 추가 + 색 리터럴 치환</name>
  <files>styles.css</files>
  <read_first>
    - .planning/phases/03-design-tokens-and-visual-polish/03-CONTEXT.md (D-01~D-12)
    - styles.css 전체 (현재 색 리터럴 위치 확인)
    - .planning/ROADMAP.md Phase 3 섹션 (Success criteria 1, Guards)
  </read_first>
  <action>
    `styles.css`를 다음 절차로 편집한다. **`index.html`/`calendar.js`/`todo.js`는 절대 건드리지 않는다.**

    1. **파일 최상단(line 1, `*, *::before, ...` 위)에 `:root` 블록 추가:**
       ```css
       :root {
         /* 표면 (Surface) */
         --color-bg: #fafafa;
         --color-surface: #fff;
         --color-surface-muted: #f7f7f7;
         --color-surface-hover: #f0f0f0;

         /* 텍스트 (Text) */
         --color-text: #222;
         --color-text-muted: #666;
         --color-text-subtle: #999;
         --color-text-disabled: #b8b8b8;

         /* 보더 (Border) */
         --color-border: #e6e6e6;
         --color-border-strong: #d0d0d0;

         /* 액센트 (Accent) */
         --color-accent: #3478f6;
         --color-accent-bg: #e6effd;
       }
       ```
       정확히 12개. **이 블록 안의 hex 값은 verify의 hex grep에서 제외된다.**

    2. **모든 색 리터럴을 var(...)로 치환** — 다음 매핑을 그대로 적용:

       | 기존 | 치환 |
       |------|------|
       | `color: #222;` (body, .day) | `color: var(--color-text);` |
       | `background: #fafafa;` (body) | `background: var(--color-bg);` |
       | `color: #666;` (.weekday-header__cell, .todo-item__delete) | `color: var(--color-text-muted);` |
       | `color: #999;` (.todo-item--done) | `color: var(--color-text-subtle);` |
       | `color: #b8b8b8;` (.day--other-month) | `color: var(--color-text-disabled);` |
       | `background: #f7f7f7;` (.day--other-month) | `background: var(--color-surface-muted);` |
       | `background: #fff;` (.nav-btn, .day, .todo-panel, .todo-panel__input, .todo-item__delete) | `background: var(--color-surface);` |
       | `background: #f0f0f0;` (.nav-btn:hover) | `background: var(--color-surface-hover);` |
       | `border-bottom: 1px solid #f0f0f0;` (.todo-item) | `border-bottom: 1px solid var(--color-surface-hover);` |
       | `border: 1px solid #e6e6e6;` (.day, .todo-panel) | `border: 1px solid var(--color-border);` |
       | `border: 1px solid #d0d0d0;` (.nav-btn, .todo-panel__input) | `border: 1px solid var(--color-border-strong);` |
       | `border-color: #3478f6;` (.nav-btn--today) | `border-color: var(--color-accent);` |
       | `color: #3478f6;` (.nav-btn--today, .day__badge) | `color: var(--color-accent);` |
       | `background: #3478f6;` (.day--today) | `background: var(--color-accent);` |
       | `border-color: #3478f6;` (.day--today) | `border-color: var(--color-accent);` |
       | `outline: 2px solid #3478f6;` (.day--selected, .todo-panel__input:focus) | `outline: 2px solid var(--color-accent);` |
       | `background: #e6effd;` (.day__badge) | `background: var(--color-accent-bg);` |

    3. **오늘 셀 위 흰색/반투명 흰색 — Plan 01 한시 처리:**
       - `.day--today { color: #fff; }` → `color: var(--color-surface);` (`#fff`로 동일)
       - `.day--today .day__num { color: #fff; }` → `color: var(--color-surface);`
       - `.day--today .day__badge { background: rgba(255, 255, 255, 0.25); color: #fff; }`
         → `background: rgba(255, 255, 255, 0.25); color: var(--color-surface);`
         **rgba(255,255,255,0.25)는 Plan 01에서 인라인 그대로 둔다.** Plan 02가 오늘 셀을 재구성하며 제거.

    4. **`.todo-item__delete:hover` — 인라인 예외 명시:**
       - `background: #f5f5f5;` → 토큰 미보유 → Plan 01에서 `var(--color-surface-hover)`로 매핑 (`#f0f0f0`로 살짝 변경, 1px 차이 — 시각적으로 거의 동일).
       - `color: #c0392b;` → **인라인 hex 그대로 유지**. Plan 02가 처리.
       - `border-color: #e0c0c0;` → 토큰 미보유 → Plan 01에서 `var(--color-border-strong)`로 매핑 (`#d0d0d0`, 거의 동일한 회색).
       - `border: 1px solid #e0e0e0;` (.todo-item__delete 기본) → `var(--color-border-strong)`로 매핑.

    5. **확인:** 작업 후 `:root` 블록 밖에서 hex 리터럴이 남아 있는 위치는 다음 2건뿐이어야 한다:
       - `.todo-item__delete:hover` 의 `color: #c0392b;` (1건)
       - `.day--today .day__badge` 의 `rgba(255, 255, 255, 0.25)` (rgba 1건)

    6. **금지 사항:**
       - 새 셀렉터 추가 금지 (구조 변경 X — 1:1 치환만)
       - opacity 추가 금지
       - `index.html`, `calendar.js`, `todo.js` 어떤 변경도 금지
  </action>
  <verify>
    <automated>
    # 1. styles.css 외 파일 무변경 (커밋 시점 기준 git diff 확인)
    test $(git diff --numstat HEAD -- index.html calendar.js todo.js | wc -l) -eq 0 && \
    # 2. :root 블록 존재 + 12개 토큰
    grep -c "^\s*--color-" styles.css | awk '$1 == 12 {exit 0} {exit 1}' && \
    # 3. :root 블록 밖 hex 리터럴: 정확히 1개 (#c0392b)
    test $(awk 'BEGIN{f=0} /^:root[[:space:]]*\{/{f=1; next} f && /^\}/{f=0; next} f{next} 1' styles.css | grep -oE "#[0-9a-fA-F]{3,6}" | wc -l) -eq 1 && \
    awk 'BEGIN{f=0} /^:root[[:space:]]*\{/{f=1; next} f && /^\}/{f=0; next} f{next} 1' styles.css | grep -q "#c0392b" && \
    # 4. :root 블록 밖 rgba/rgb 리터럴: 정확히 1개 (rgba(255,255,255,0.25))
    test $(awk 'BEGIN{f=0} /^:root[[:space:]]*\{/{f=1; next} f && /^\}/{f=0; next} f{next} 1' styles.css | grep -cE "rgba?\(") -eq 1 && \
    # 5. var(--color-*) 사용처 ≥ 25 (광범위 치환 증거)
    test $(grep -c "var(--color-" styles.css) -ge 25 && \
    # 6. opacity 미사용
    ! grep -q "opacity:" styles.css && \
    # 7. localStorage 키/스키마 grep 무변경
    test $(grep -c "todo-gsd:v" todo.js) -ge 1 && \
    test $(grep -c "SCHEMA_VERSION" todo.js) -ge 1
    </automated>
  </verify>
  <acceptance_criteria>
    - `styles.css` 최상단에 `:root { ... }` 블록이 있고 정확히 12개의 `--color-*` 토큰이 정의됨.
    - `:root` 블록 밖에는 hex 리터럴 1개(`#c0392b`)와 rgba 리터럴 1개(`rgba(255, 255, 255, 0.25)`)만 남음.
    - 모든 색 속성(color/background/border/outline)이 가능한 한 `var(--color-*)` 참조로 변환됨.
    - `index.html`, `calendar.js`, `todo.js`의 변경 라인 수 0.
    - 브라우저에서 새로고침 시 변경 전과 시각적으로 거의 동일하게 렌더링됨 (Plan 02에서 톤 변경).
  </acceptance_criteria>
  <done>
    `styles.css`에 토큰 인프라가 깔리고, Plan 02가 `:root` 블록의 hex 값만 조정해 시각 톤을 변경할 수 있는 상태.
  </done>
</task>

</tasks>

<guards>
PITFALLS — 이 plan에서 절대 위반하지 말 것:

- **localStorage 키/스키마 무변경**: `grep "todo-gsd:v" todo.js` 결과 변화 없음, `grep "SCHEMA_VERSION" todo.js` 결과 변화 없음. 이 plan은 `todo.js`를 만지지 않으므로 자연 보존.
- **`index.html`, `calendar.js`, `todo.js` 0줄 변경**: `git diff --numstat HEAD` 로 검증.
- **`opacity` 사용 금지**: 이 plan은 색 치환만이므로 opacity 추가 사유 없음.
- **새 셀렉터/모디파이어 추가 금지**: 구조 변경은 Plan 02 영역.
- **토큰 개수 12개 동결**: D-02 상한. 추가 시 Plan 02에서 결정.
</guards>

<acceptance>
ROADMAP Success criteria 1과 부분 매핑:
- "(1) `:root`에 8–12개 디자인 토큰이 정의되고 모든 색상 리터럴이 토큰으로 치환되어, 한 곳을 바꾸면 전 화면이 따라 변한다." → **이 plan에서 잠금** (잔존 리터럴 2건은 Plan 02가 처리).
- (2)~(4)는 Plan 02 acceptance.

VIS-03 Traceability: Pending → Plan 01 종료 시 부분 충족. Phase 3 종료 시 Plan 02 통과로 Complete 마킹.
</acceptance>

<output>
완료 후 `.planning/phases/03-design-tokens-and-visual-polish/03-01-SUMMARY.md`를 생성하라.
</output>
