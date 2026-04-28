---
phase: 03-design-tokens-and-visual-polish
plan: 02
type: execute
wave: 2
depends_on:
  - "03-01"
files_modified:
  - styles.css
autonomous: true
requirements:
  - VIS-01
  - VIS-02
  - VIS-03
must_haves:
  truths:
    - "액센트 토큰이 soft blue 계열로 교체되어 페이지 전체 톤이 라이트 미니멀로 정돈된다"
    - "오늘 셀이 soft accent 배경 + 진한 액센트 글자 조합이며, 글자/배경 대비가 WCAG AA 4.5:1 이상이다"
    - "다른 달 셀이 muted 톤으로 흐려 보이되 `opacity` 속성을 사용하지 않는다"
    - "다른 달 셀을 클릭하면 todo 패널이 정상적으로 열린다"
    - "styles.css 안에 `:root` 블록 외 hex/rgba 색 리터럴이 0개다 (Plan 01의 잔존 2건도 토큰화/제거 완료)"
    - "`index.html`, `calendar.js`, `todo.js`의 git diff가 0 lines다"
  artifacts:
    - path: "styles.css"
      provides: "라이트 미니멀 톤이 적용된 토큰 값 + 오늘/다른 달 셀 정돈된 셀렉터"
      contains: "--color-accent"
  key_links:
    - from: ".day--today (셀렉터)"
      to: "--color-accent-bg / --color-accent (토큰)"
      via: "background + color"
      pattern: "\\.day--today"
    - from: ".day--other-month (셀렉터)"
      to: "--color-surface-muted / --color-text-disabled (토큰)"
      via: "background + color (opacity 없이)"
      pattern: "\\.day--other-month"
---

<objective>
Plan 01에서 깔아둔 토큰 인프라 위에서 토큰 값을 라이트 미니멀 톤으로 조정하고, 오늘 셀/다른 달 셀의 시각 표현을 D-04~D-10에 따라 재구성한다. **CSS only**, `styles.css` 단일 파일 변경.

Purpose: D-04 (액센트 soft blue 교체), D-05 (액센트 단일화), D-06 (오늘 셀 soft bg + 진한 글자), D-07 (WCAG AA 4.5:1), D-08 (보더 톤), D-09 (다른 달 muted), D-10 (`opacity` 금지), D-11 (전 요소 일관성)을 코드로 잠근다.

Output: 토큰 값이 soft blue 라이트 미니멀로 교체되고, `.day--today` / `.day--other-month` / `.todo-item__delete:hover` 등 시각 표현 셀렉터가 정돈된 `styles.css`.
</objective>

<context>
@/Users/insang/Documents/강의/소프트웨어공학/2026/대면수업용/sdd/gsd/todo-gsd/.planning/PROJECT.md
@/Users/insang/Documents/강의/소프트웨어공학/2026/대면수업용/sdd/gsd/todo-gsd/.planning/REQUIREMENTS.md
@/Users/insang/Documents/강의/소프트웨어공학/2026/대면수업용/sdd/gsd/todo-gsd/.planning/ROADMAP.md
@/Users/insang/Documents/강의/소프트웨어공학/2026/대면수업용/sdd/gsd/todo-gsd/.planning/phases/03-design-tokens-and-visual-polish/03-CONTEXT.md
@/Users/insang/Documents/강의/소프트웨어공학/2026/대면수업용/sdd/gsd/todo-gsd/.planning/phases/03-design-tokens-and-visual-polish/03-01-tokens-refactor-PLAN.md
@/Users/insang/Documents/강의/소프트웨어공학/2026/대면수업용/sdd/gsd/todo-gsd/styles.css
@/Users/insang/Documents/강의/소프트웨어공학/2026/대면수업용/sdd/gsd/todo-gsd/index.html

<contrast_targets>
<!-- D-07: WCAG AA 4.5:1 검증 — 권장 hex 조합 (executor가 DevTools로 확인하고 미달 시 조정) -->

오늘 셀:
  배경: --color-accent-bg = #dbeafe (Tailwind blue-100 류)
  글자: --color-accent    = #1d4ed8 (blue-700) 또는 #1e40af (blue-800)
  검증: #1d4ed8 on #dbeafe ≈ 7.6:1 (PASS)
        #1e40af on #dbeafe ≈ 9.8:1 (PASS)

소프트 보더 (오늘 셀 border):
  --color-accent 동일 사용 또는 약간 옅은 톤

다른 달 셀:
  배경: --color-surface-muted = #f5f5f5 (현재 #f7f7f7와 거의 동일)
  글자: --color-text-disabled = #a0a0a0 (현재 #b8b8b8보다 살짝 진하게 — 어포던스 유지)
  검증: #a0a0a0 on #f5f5f5 ≈ 2.8:1 (대비 부족이지만 "흐리게" 의도이므로 의도적 — 본문 텍스트가 아니라 비활성 신호)

배지 (오늘 외):
  배경: --color-accent-bg
  글자: --color-accent
  → 오늘 셀 위 배지는 "오늘 셀 재구성" 결과로 자연스럽게 같은 톤이 됨.
</contrast_targets>
</context>

<approach>
**토큰 값만으로 톤을 바꾼다.** 셀렉터 본문은 Plan 01에서 이미 `var(--color-*)` 참조로 통일됐으므로, `:root` 블록의 hex 값을 바꾸면 화면 전체가 자동으로 따라온다. 다만 D-06이 오늘 셀의 의미 자체를 바꾸므로(`#fff` 글자 → 진한 액센트 글자), 셀렉터 일부는 토큰 매핑 변경이 필요하다.

**오늘 셀 재구성.** Plan 01에서 임시로 `var(--color-surface)`(=`#fff`)에 매핑돼 있던 `.day--today`의 글자 색을 `var(--color-accent)`로 바꾸고, 배경을 `var(--color-accent-bg)`(soft blue)로 교체한다. 이 변경으로 Plan 01의 잔존 `rgba(255,255,255,0.25)` 배지 배경도 의미가 사라지므로 `var(--color-accent)` 또는 투명도 없는 토큰으로 정돈한다.

**다른 달 셀.** 색상 토큰만으로 muted 톤 달성. `opacity` 속성을 추가하지 않는다(D-10). 글자 대비는 의도적으로 약하게 두되 클릭 어포던스(border + 배경)는 유지.

**delete:hover의 destructive 빨강.** Plan 01의 인라인 `#c0392b`를 미니멀 톤에 맞춰 처리. 옵션: (a) `--color-text-muted`로 통합(빨강 제거), (b) `--color-danger` 토큰 추가(13개로 증가, D-02 상한 위반). **선택 (a)** — 라이트 미니멀 일관성을 위해 빨강 제거. 사용자 의도는 "삭제 어포던스"인데 hover 시 배경 변화로 충분히 전달되며, 본 페이즈의 액센트와 충돌하는 빨강은 피한다.
</approach>

<tasks>

<task type="auto">
  <name>Task 1: 토큰 값 soft blue 톤 교체 + 오늘 셀/다른 달 셀/잔존 리터럴 정돈</name>
  <files>styles.css</files>
  <read_first>
    - .planning/phases/03-design-tokens-and-visual-polish/03-CONTEXT.md (D-04~D-12)
    - .planning/phases/03-design-tokens-and-visual-polish/03-01-tokens-refactor-PLAN.md (Plan 01에서 토큰화한 매핑 표)
    - styles.css (Plan 01 결과 — :root 블록 + 잔존 리터럴 2건 위치)
    - .planning/ROADMAP.md Phase 3 Success criteria 2~4
  </read_first>
  <action>
    `styles.css`를 다음 절차로 편집한다. **`index.html`/`calendar.js`/`todo.js`는 절대 건드리지 않는다.**

    1. **`:root` 블록의 토큰 값 교체:**
       ```css
       :root {
         /* 표면 (Surface) */
         --color-bg: #fafafa;            /* 유지 */
         --color-surface: #ffffff;        /* 유지 (3자리 → 6자리만 정돈) */
         --color-surface-muted: #f5f5f5;  /* #f7f7f7 → #f5f5f5 (D-09 살짝 진하게) */
         --color-surface-hover: #f1f1f1;  /* #f0f0f0 → #f1f1f1 (미세 정돈) */

         /* 텍스트 (Text) */
         --color-text: #1f2937;           /* #222 → blue-gray-800 류 (라이트 미니멀 표준) */
         --color-text-muted: #6b7280;     /* #666 → blue-gray-500 */
         --color-text-subtle: #9ca3af;    /* #999 → blue-gray-400 */
         --color-text-disabled: #a0a0a0;  /* #b8b8b8 → 살짝 진하게 (어포던스 유지) */

         /* 보더 (Border) */
         --color-border: #e5e7eb;         /* #e6e6e6 → blue-gray-200 */
         --color-border-strong: #d1d5db;  /* #d0d0d0 → blue-gray-300 */

         /* 액센트 (Accent) — D-04: soft blue */
         --color-accent: #1d4ed8;         /* blue-700, 진한 액센트 (오늘 셀 글자 + focus + nav-btn--today) */
         --color-accent-bg: #dbeafe;      /* blue-100, soft accent 배경 (오늘 셀 + 배지) */
       }
       ```

       정확히 12개 토큰 유지(D-02). 새 토큰 추가 금지.

    2. **`.day--today` 재구성 (D-06, D-07, D-08):**
       Plan 01 결과:
       ```css
       .day--today {
         background: var(--color-accent);   /* 진한 파랑 채움 — 변경 대상 */
         color: var(--color-surface);        /* #fff — 변경 대상 */
         border-color: var(--color-accent);
       }
       .day--today .day__num { color: var(--color-surface); font-weight: 700; }
       ```
       Plan 02 변경:
       ```css
       .day--today {
         background: var(--color-accent-bg);  /* soft blue 배경 (D-06) */
         color: var(--color-accent);           /* 진한 액센트 글자 (D-06) */
         border-color: var(--color-accent);    /* 보더는 액센트 유지 (D-08) */
       }
       .day--today .day__num {
         color: var(--color-accent);           /* 진한 액센트 — #fff 제거 */
         font-weight: 700;                     /* 강조 유지 (D-08) */
       }
       ```
       → 대비: `#1d4ed8` on `#dbeafe` ≈ 7.6:1 (WCAG AA 4.5:1 PASS, D-07).

    3. **`.day--today .day__badge` 정돈 (잔존 rgba 제거):**
       Plan 01 결과:
       ```css
       .day--today .day__badge {
         background: rgba(255, 255, 255, 0.25);
         color: var(--color-surface);
       }
       ```
       Plan 02 변경:
       ```css
       .day--today .day__badge {
         background: var(--color-surface);   /* 흰색 — soft accent 배경 위에서 또렷 */
         color: var(--color-accent);          /* 진한 액센트 */
       }
       ```
       → rgba 리터럴 제거. 대비: `#1d4ed8` on `#ffffff` ≈ 9.7:1 (PASS).

    4. **`.day--other-month` 검증 (D-09, D-10):**
       Plan 01 결과 그대로 충분:
       ```css
       .day--other-month {
         color: var(--color-text-disabled);
         background: var(--color-surface-muted);
       }
       ```
       추가/변경 없음. **`opacity` 속성을 추가하지 않는다.** 클릭 동작은 calendar.js가 처리하므로 CSS는 색만 결정.

    5. **`.todo-item__delete:hover` — `#c0392b` 잔존 리터럴 제거 (D-11 일관성):**
       Plan 01 결과:
       ```css
       .todo-item__delete:hover {
         background: var(--color-surface-hover);
         color: #c0392b;                          /* 인라인 빨강 — 제거 대상 */
         border-color: var(--color-border-strong);
       }
       ```
       Plan 02 변경:
       ```css
       .todo-item__delete:hover {
         background: var(--color-surface-hover);
         color: var(--color-text);                 /* muted → text(진하게) — hover 시그널 */
         border-color: var(--color-border-strong);
       }
       ```
       → 빨강 제거, hover 시 텍스트 색이 진해지는 방식으로 어포던스 유지. 라이트 미니멀 톤 일관성(D-11).

    6. **`.nav-btn--today` 일관성 점검 (D-05):**
       Plan 01 결과 (변경 불필요):
       ```css
       .nav-btn--today {
         border-color: var(--color-accent);
         color: var(--color-accent);
       }
       ```
       토큰 값 교체로 자동 soft blue 적용됨. 추가 변경 없음.

    7. **`.day__badge` (오늘 외) 일관성:**
       Plan 01 결과:
       ```css
       .day__badge {
         background: var(--color-accent-bg);
         color: var(--color-accent);
       }
       ```
       토큰 값 교체로 자동 정돈. 추가 변경 없음.

    8. **`.todo-item--done .todo-item__text` 일관성 점검:**
       Plan 01 결과 그대로:
       ```css
       .todo-item--done .todo-item__text {
         text-decoration: line-through;
         color: var(--color-text-subtle);
       }
       ```
       Phase 4의 INT-01과 겹치지만 Phase 3 단계에서는 토큰 일관성만 확인. 변경 없음.

    9. **`outline: 2px solid var(--color-accent); outline-offset: -2px` 통일 확인:**
       `.day--selected`, `.todo-panel__input:focus` 두 곳 — Plan 01에서 이미 통일됨. 변경 없음.

    10. **검증 체크리스트:**
        - `:root` 블록 외에 hex 리터럴 0개.
        - `:root` 블록 외에 rgba/rgb 리터럴 0개.
        - `opacity:` 0회 등장.
        - 토큰 개수 정확히 12개.
        - `index.html`/`calendar.js`/`todo.js` git diff 0 lines.

    11. **금지 사항:**
        - 새 토큰 추가 금지 (12개 동결, D-02 상한).
        - 새 셀렉터/모디파이어 추가 금지 (구조 변경 X — Phase 4/5 영역).
        - `opacity` 추가 금지.
        - `index.html`, `calendar.js`, `todo.js` 어떤 변경도 금지.
        - 폰트/스페이싱/사이즈 토큰 추가 금지 (Out of Scope, deferred).
  </action>
  <verify>
    <automated>
    # 1. styles.css 외 파일 무변경
    test $(git diff --numstat HEAD -- index.html calendar.js todo.js | wc -l) -eq 0 && \
    # 2. :root 블록 12개 토큰 유지
    grep -c "^\s*--color-" styles.css | awk '$1 == 12 {exit 0} {exit 1}' && \
    # 3. :root 블록 밖 hex 리터럴 0개
    test $(awk 'BEGIN{f=0} /^:root[[:space:]]*\{/{f=1; next} f && /^\}/{f=0; next} f{next} 1' styles.css | grep -oE "#[0-9a-fA-F]{3,6}" | wc -l) -eq 0 && \
    # 4. :root 블록 밖 rgba/rgb 리터럴 0개
    test $(awk 'BEGIN{f=0} /^:root[[:space:]]*\{/{f=1; next} f && /^\}/{f=0; next} f{next} 1' styles.css | grep -cE "rgba?\(") -eq 0 && \
    # 5. opacity 미사용
    ! grep -q "opacity:" styles.css && \
    # 6. .day--today가 --color-accent-bg 배경 + --color-accent 글자 사용
    awk '/\.day--today \{/,/\}/' styles.css | grep -q "background: var(--color-accent-bg)" && \
    awk '/\.day--today \{/,/\}/' styles.css | grep -q "color: var(--color-accent)" && \
    # 7. .day--other-month는 opacity 없이 color/background 토큰만 사용
    awk '/\.day--other-month \{/,/\}/' styles.css | grep -q "var(--color-text-disabled)" && \
    awk '/\.day--other-month \{/,/\}/' styles.css | grep -q "var(--color-surface-muted)" && \
    ! awk '/\.day--other-month \{/,/\}/' styles.css | grep -q "opacity" && \
    # 8. localStorage 키/스키마 grep 무변경
    test $(grep -c "todo-gsd:v" todo.js) -ge 1 && \
    test $(grep -c "SCHEMA_VERSION" todo.js) -ge 1 && \
    # 9. var(--color-*) 사용처 ≥ 25 (Plan 01 인프라 보존)
    test $(grep -c "var(--color-" styles.css) -ge 25
    </automated>
    <manual>
    1. 브라우저에서 `index.html`을 열고 오늘 날짜 셀을 시각적으로 확인:
       - 배경이 soft blue (라이트 톤)
       - 글자가 진한 파랑
       - DevTools → Elements → 해당 요소 → Accessibility → Contrast checker 가 4.5:1 이상 표시
    2. 다른 달 셀(이전/다음 달 채움)을 확인:
       - 회색 배경 + muted 글자로 흐리게
       - 클릭 시 todo 패널이 정상 오픈
       - DevTools에서 `.day--other-month`의 computed style에 `opacity` 속성이 없음
    3. 헤더/네비게이션 버튼/요일 헤더/배지/todo 패널 전반이 같은 톤(라이트 미니멀)로 통일됐는지 한 화면에서 확인.
    4. 삭제 버튼 hover 시 빨강이 사라지고 muted → text 진해지는 방식인지 확인.
    </manual>
  </verify>
  <acceptance_criteria>
    - `:root` 토큰 값이 soft blue 계열로 교체됨 (`--color-accent: #1d4ed8`, `--color-accent-bg: #dbeafe` 또는 contrast_targets 표 안의 동등 톤).
    - `.day--today`가 `var(--color-accent-bg)` 배경 + `var(--color-accent)` 글자로 재구성됨.
    - `.day--today .day__badge`의 `rgba(255,255,255,0.25)` 잔존이 제거되고 토큰 참조로 대체됨.
    - `.todo-item__delete:hover`의 `#c0392b` 인라인이 제거되고 토큰 참조로 대체됨.
    - `:root` 블록 외 hex/rgba/rgb 리터럴 0개.
    - `opacity` 속성 0회 사용.
    - `index.html`, `calendar.js`, `todo.js` 변경 라인 0.
    - 브라우저 시각 확인: 오늘 셀 대비 ≥ 4.5:1, 다른 달 셀 흐리지만 클릭 가능, 전체 톤 일관.
  </acceptance_criteria>
  <done>
    Phase 3 Success criteria 1~4 모두 충족. VIS-01/02/03 Pending → Complete 마킹 가능 상태.
  </done>
</task>

</tasks>

<guards>
PITFALLS — 이 plan에서 절대 위반하지 말 것:

- **localStorage 키/스키마 무변경**: `grep "todo-gsd:v" todo.js` 결과 변화 없음, `grep "SCHEMA_VERSION" todo.js` 결과 변화 없음. 이 plan은 `todo.js`를 만지지 않으므로 자연 보존.
- **`index.html`, `calendar.js`, `todo.js` 0줄 변경**: `git diff --numstat HEAD` 로 검증.
- **`opacity` 사용 금지** (D-10): 다른 달 셀은 색상 토큰만으로 muted 처리. `.day--other-month`에 `opacity` 추가 시 즉시 회귀.
- **오늘 셀 글자 대비 4.5:1 이상** (D-07): DevTools Contrast checker로 검증. 미달 시 `--color-accent`를 더 진한 톤(`#1e3a8a` 등)으로 조정.
- **토큰 개수 12개 동결** (D-02): 새 토큰 추가 금지. `--color-danger` 추가 욕구 → action에서 `--color-text`로 통합 결정.
- **`.day--other-month` 클릭 어포던스 보존**: CSS 변경이 calendar.js의 click 핸들러에 영향 주지 않음을 수동 확인.
</guards>

<acceptance>
ROADMAP Success criteria (Phase 3) 1:1 매핑:

1. **"`:root`에 8–12개 디자인 토큰... 한 곳을 바꾸면 전 화면이 따라 변한다"** → Plan 01 + Plan 02로 완성. 토큰 12개, 색 리터럴 0개.
2. **"오늘 날짜 셀은 라이트 톤 배경색 + 글자 대비 WCAG AA 4.5:1 이상"** → Plan 02 Task 1 step 2. `#1d4ed8` on `#dbeafe` ≈ 7.6:1.
3. **"이번 달이 아닌 셀 톤다운, `opacity` 미사용, 클릭 시 todo 패널 정상 오픈"** → Plan 02 Task 1 step 4. `--color-text-disabled` + `--color-surface-muted` + opacity 0회 + 수동 클릭 확인.
4. **"헤더/네비/요일/배지 모든 UI 일관된 라이트 미니멀 톤"** → Plan 01 인프라 + Plan 02 토큰 값으로 자동 일관. 직접 색 리터럴 0개.

Requirements:
- VIS-01 (오늘 셀 강조 + 4.5:1) → Plan 02 step 2.
- VIS-02 (다른 달 톤다운, opacity 미사용) → Plan 02 step 4 + guards.
- VIS-03 (`:root` 토큰 일원화) → Plan 01 인프라 + Plan 02 잔존 리터럴 정돈.
</acceptance>

<output>
완료 후 `.planning/phases/03-design-tokens-and-visual-polish/03-02-SUMMARY.md`를 생성하라.
</output>
