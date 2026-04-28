# Feature Research — v1.1 UX 다듬기

**Domain:** Static personal calendar-todo web app — UX polish milestone (no new features, only visual/interaction/a11y refinement)
**Researched:** 2026-04-28
**Confidence:** HIGH (W3C ARIA Authoring Practices + 메이저 캘린더-todo 앱들의 보편 패턴)

> 이번 마일스톤은 "신규 기능"이 아니라 **이미 동작하는 v1 기능의 표현/인터랙션 레이어**를 다듬는 작업이다. 따라서 아래 표에서 "feature"는 대부분 **기존 기능의 다듬어진 동작 방식**을 의미한다. requirements 단계에서 이 표를 보고 REQ-ID를 부여한다.

---

## Feature Landscape

### Table Stakes (Users Expect These)

매일 쓰기 거슬리지 않는 캘린더-todo 앱이라면 사용자가 **당연히 그렇게 동작할 거라 기대**하는 것들. 하나라도 빠지면 "덜 다듬어진" 느낌을 준다.

#### A. 달력 시각 디자인 — 오늘 강조 / 다른 달 / 톤

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **오늘 날짜를 시각적으로 명확히 강조** (배경색 채우기) | Google Calendar / Apple Calendar / Notion / Fantastical 모두 오늘을 단독 강조. 사용자는 한눈에 "오늘"을 찾는 것을 가장 자주 한다. | LOW | 라이트 미니멀 톤이면 **연한 액센트 배경(예: `#eaf2ff`) + 진한 숫자**가 표준. 현재 v1은 진한 파란 + 흰 글자 — 미니멀 톤에 비해 과함, 톤다운 필요. `aria-current="date"` 동시 부여. |
| **오늘 강조 = 배경 채우기**(원형 도트나 보더가 아닌) | 사용자가 명시적으로 "배경색"을 선택했고, 셀이 사각형이라 배경 채우기가 가장 자연스럽다. | LOW | 원형 도트(Apple) vs 사각형 배경(Google Calendar 데스크톱) 중 후자 채택. 상세는 아래 "오늘 강조 패턴 비교" 참고. |
| **다른 달(전월/차월) 셀 흐리게 표시** | 6주 그리드에서 현재 월에 시각적 우선순위를 주기 위함. Google/Apple 모두 동일. | LOW | opacity 0.4~0.55 또는 muted color. 현재 v1은 `color: #b8b8b8 + bg: #f7f7f7`로 적절 — 토큰화만 필요. |
| **다른 달 셀도 클릭 가능** | 사용자가 그 날짜의 todo를 보거나 추가할 수 있어야 함. v1에서 이미 동작 중 — 회귀 방지. | LOW | "흐리게" ≠ "비활성"이라는 점이 핵심. cursor: pointer 유지, hover 피드백 유지. |
| **라이트 미니멀 단일 톤** | 사용자가 명시적으로 다크모드 거부, 라이트 미니멀 톤 요구. | LOW | CSS custom properties로 4~10개 토큰만 정의. |
| **호버/포커스 셀 명확한 시각 피드백** | 클릭 가능한 영역임을 알린다. | LOW | hover bg + `:focus-visible` outline. 마우스 클릭에는 outline 보이지 않게 분기. |

#### B. 할 일 패널 인터랙션

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **완료 = 취소선 + 흐리게 동시** | "완료감"은 가독성 변화(취소선) + 시각 강도 감소(흐리게)가 함께 있을 때 가장 명확. Todoist / Things / Apple Reminders 모두 두 가지를 같이 쓴다. | LOW | 현재 v1: `line-through + color #999`만. v1.1: `line-through + opacity 0.55~0.6` (또는 muted color). 체크박스 자체도 살짝 흐리게. |
| **Enter로 추가, 빈 입력은 무시, 추가 후 입력칸 비우고 포커스 유지** | 연속 입력 흐름의 절대 표준. Slack/Linear/Notion 입력 패턴과 동일. | LOW | 현재 v1: `<form>` submit으로 이미 동작 중. **단, 명시적 검증 필요** — addTodo가 trim 후 빈 문자열을 null로 거부하고, submit 핸들러가 null일 때 `input.value` 안 비우는지(현재는 그래서 OK). 추가 후 `input.focus()` 명시적 호출 권장(현재는 자연스럽게 유지되지만 보장은 안 됨). |
| **삭제 즉시 반영, 확인 다이얼로그 없음, undo 없음** | 사용자가 명시적으로 요구. 단일 사용자 앱에서 다이얼로그는 마찰만 만든다. | LOW | 현재 v1: 즉시 삭제 동작 — 변경 없음. |
| **체크박스 토글 즉시 반영, 모든 렌더 동기** | 클릭과 시각 변화 사이 지연 없음. | LOW | 현재 v1 동작 중. transition을 도입한다면 0.1~0.15s 이하. |
| **완료 항목도 목록에 그대로 남고 정렬 유지** | 사용자가 다시 토글하거나 삭제할 수 있어야 함. 자동으로 하단 이동시키지 않음. | LOW | 현재 v1: createdAt 오름차순 정렬 — 유지. (자동 재정렬은 사용자에게 인지 부담을 준다.) |

#### C. 날짜 셀 정보 밀도

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **숫자 배지로 todo 개수 표시** | v1에서 이미 있음. "있다/없다 + 얼마나 있다"를 한 글자로 보여주는 가장 압축적인 방법. | LOW | 톤다운된 배지 색(액센트 배경 + 액센트 글자)으로 다듬기. 99+ 클램프 유지. |
| **모두 완료된 날짜에 체크 아이콘 표시** | 사용자가 "오늘 다 끝냈다"는 만족감을 한눈에. Things/TickTick의 완료 카운트 패턴의 단순화 버전. | LOW-MEDIUM | 인라인 SVG 1개 (`<path d="M3.5 8.5l3 3 6-7" .../>`). 조건: `count > 0 && all(done)`. 위치: 배지 자리 또는 배지 옆. **0건은 체크 아이콘 표시 안 함** (애초에 할 일 없는 날과 구분되어야 함). |
| **빈 날짜는 배지/아이콘 없음** | 시각적 노이즈 최소화. | LOW | 현재 v1 동작 중 — 유지. |

#### D. 키보드 / 접근성

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **←/→ 키로 월 이동** (input 안에 있을 때 제외) | Google Calendar / Notion 등 데스크톱 캘린더 표준. | LOW | 페이지 레벨 keydown. `event.target.tagName === 'INPUT'` 가드 필수 (커서 이동 방해 금지). modifier 없는 단독 키만. |
| **`T` / `t`로 오늘로 이동** | Google Calendar 표준 단축키. | LOW | 동일하게 input 가드. modifier 없는 단독 키. (Cmd/Ctrl+T는 브라우저 새 탭이라 자연 분리됨.) |
| **방향키로 그리드 셀 간 이동** (↑↓는 ±7일, ←→는 ±1일) | **W3C ARIA Authoring Practices "Grid Pattern" 표준.** 모든 데이터 그리드/캘린더 위젯의 사실상 합의. | MEDIUM | roving tabindex 패턴: 한 번에 셀 하나만 `tabindex=0`, 나머지는 `tabindex=-1`. ←→ ±1일, ↑↓ ±7일, Home=주의 첫 날, End=주의 마지막 날. Enter/Space로 패널 열기. |
| **방향키로 월 경계 넘으면 자동으로 다음/이전 달로 이동** | 캘린더 UX 표준. (W3C 일반 grid 패턴은 "멈춤"이 기본이지만, **Date Picker 패턴은 자동 진입을 권장**.) | MEDIUM | 마지막 날에서 → 누르면 다음 달 1일로 점프 + 그 셀에 포커스. |
| **`role="grid"` / `role="gridcell"` / `role="row"` 마크업** | 스크린리더가 셀 위치(행/열)를 안내하는 데 필수. | LOW | 현재 v1: grid/gridcell은 있고, **row가 빠져 있음** (셀 42개를 평면으로 깔아둠). 행 단위 그룹핑이 표준이지만 CSS grid에서 row가 wrapper 없어도 시각적으로 동작 — 필요시 7개씩 묶거나, ARIA만 그대로 두는 절충 검토. (W3C 권장: `role="row"` 래퍼로 묶기.) |
| **`aria-current="date"`로 오늘 셀 표시** | 스크린리더에 "현재 날짜" 의미 전달. CSS 시각 강조와 별개. | LOW | 현재 v1: 없음. 추가 필요. |
| **`aria-selected="true"`로 선택 셀 표시** | grid 패턴에서 활성 셀을 알리는 표준 속성. | LOW | 현재 v1: `.day--selected` CSS만 있음. ARIA 속성 추가 필요. |
| **인터랙티브 요소 모두 `aria-label` 또는 가시 텍스트** | a11y 기본. | LOW | 현재 v1: nav-btn / 닫기 / input / 체크박스 / 삭제 버튼 모두 aria-label 또는 가시 텍스트 있음 — 점검만 필요. 셀 자체 aria-label("2026년 4월 28일, 할 일 3개, 모두 완료")은 차별화로 분류. |
| **`:focus-visible`로 키보드/마우스 포커스 분기** | a11y 표준. 마우스 클릭에 outline이 깜빡거리는 것은 거슬림. 키보드 사용자에게는 outline이 필수. | LOW | 글로벌 정책으로. `outline: none`을 무조건 적용하지 말 것. |

---

### Differentiators (Competitive Advantage / v1.1 선택 가능)

있으면 "잘 다듬은" 느낌을 주지만, 없어도 자연스러운 것들. v1.1에서 시간이 남으면 도입.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **셀 단위 풍부한 `aria-label`** ("2026년 4월 28일 화요일, 할 일 3개 중 1개 완료, 오늘") | 스크린리더 사용자에게 셀 한 번의 포커스로 컨텍스트 전체 전달. | LOW | `renderMonth`에서 셀당 텍스트 한 줄 만들기. localStorage 카운트 함께 합성. |
| **완료 토글에 0.1~0.15s transition** | "탁" 끊기지 않고 부드러운 완료감. | LOW | `prefers-reduced-motion: reduce`이면 0s. 미니멀 톤에 부합하도록 transition은 opacity/text-decoration-color 정도만. |
| **`PageUp`/`PageDown`으로 월 이동** (그리드 안에서) | W3C Date Picker Dialog 패턴 권장. 키보드 파워유저용. | LOW | 그리드 keydown 핸들러에 한 줄 추가. |
| **`Shift+PageUp`/`Shift+PageDown`으로 연 이동** | 동일 W3C 패턴. | LOW | 동일 핸들러. (선택적 — 1년 단위 이동 수요가 적으면 생략.) |
| **`Escape`로 패널 닫고 원래 셀에 포커스 복귀** | 키보드 흐름 완결성. | LOW | 페이지 keydown + `previouslyFocused` 변수 보관. |
| **모두 완료 표시에 `aria-label="모두 완료"`** | 스크린리더에도 의미 전달. | LOW | 셀 aria-label에 통합하면 더 자연스러움. |
| **호버 시 셀 하이라이트** | 클릭 가능 affordance 강화. | LOW | `:hover`에 미세한 bg 변화. (현재 v1: 호버 스타일 없음.) |
| **선택된 셀과 패널의 시각 연결** (선택된 셀의 액센트 색이 패널 헤더에도 비치는 등) | 패널이 어느 날짜에 묶여 있는지 강화. | LOW | 패널 타이틀에 날짜를 이미 표시 중이라 약한 차별화. |
| **`aria-live="polite"`로 todo 추가/삭제 알림** | 스크린리더 사용자에게 변화 인지. | LOW | 현재 v1: `<ul aria-live="polite">` 이미 있음 — 동작 검증만 필요. |
| **빈 todo 입력 시도 시 input 흔들기/에러 메시지** | "왜 추가가 안 되지?" 의문 제거. | LOW | 미니멀 톤에서는 **무동작이 더 깔끔할 수 있음** — 도입 신중. |

---

### Anti-Features (Explicitly Out of Scope)

사용자가 **명시적으로 거부**했거나, "흔히 요청되지만 이 앱의 미니멀 가치와 충돌"하는 것들. **requirements/roadmap에 들어가면 안 된다.**

| Feature | Why Requested (Surface Appeal) | Why Problematic Here | Alternative |
|---------|-------------------------------|----------------------|-------------|
| **다크 모드** | 야간 사용 편의, 모던 앱 표준 | 테마 시스템 도입 비용. PROJECT.md Out of Scope. v1.1 범위 초과. | 라이트 단일 톤만. 토큰화는 해두어 향후 마일스톤에서 다크 추가가 어렵지 않게는 한다. |
| **모바일 반응형 / 터치 최적화** | 사용 환경 다양성 | PROJECT.md 명시적 Out of Scope, "데스크톱 UX 우선" | 데스크톱 키보드+마우스만. viewport meta는 유지하되 미디어쿼리 분기 도입 안 함. |
| **삭제 확인 다이얼로그 (`window.confirm`)** | "실수 방지" | 사용자가 명시적으로 거부 ("즉시 삭제 no-confirm"). 단일 사용자 앱에서 다이얼로그는 매번 마찰. | 즉시 삭제 그대로. 실수 우려는 향후 멀티-셀렉트 선택 모드 같은 별도 기능으로 풀어야 할 문제이지 다이얼로그가 답이 아님. |
| **Undo 토스트 ("삭제됨 — 되돌리기")** | "안전망" | 사용자가 명시적으로 거부. 토스트 UI 컴포넌트, 타이머, 상태 보관, 애니메이션 추가 — 미니멀 톤과 정면 충돌. | 즉시 삭제. 사용자가 책임진다. |
| **빈 상태 / 온보딩 안내** ("아직 할 일이 없어요" 일러스트) | 첫 사용자 안내 | PROJECT.md Out of Scope. 1인용 앱 — 첫 사용 후엔 영원히 안 보임. | 비어있으면 그냥 비어있다. |
| **알림 / 리마인더** | 마감 임박 안내 | PROJECT.md Out of Scope. Notification API 권한, 백그라운드 동작 등 복잡도 폭증. | 사용자가 직접 본다. |
| **반복 일정 (매주, 매달 등)** | 흔한 todo 패턴 | PROJECT.md Out of Scope. 데이터 모델 확장 필수. | v2+ 마일스톤. |
| **태그 / 라벨 / 카테고리** | 분류 욕구 | PROJECT.md Out of Scope. UI 확장(필터, 색상, 입력) 큼. | v2+ 마일스톤. |
| **우선순위 (P1/P2/P3 또는 별표)** | "중요한 것 먼저" | PROJECT.md Out of Scope. 정렬/시각화 추가. | v2+ 마일스톤. |
| **drag-and-drop 정렬** | 순서 조정 | createdAt 정렬이 충분. drag-and-drop은 a11y와 키보드 호환성 비용 큼. | v2+ 마일스톤. 필요해지면 별도 마일스톤. |
| **드래그로 다른 날짜로 todo 옮기기** | 날짜 변경 | 데이터 모델은 받지만(byDate 키 변경), UI 복잡도 큼. v1.1 범위 외. | v2+에서 검토. 지금은 삭제 후 새 날짜에 추가. |
| **검색 / 필터** | 큰 목록에서 찾기 | 일자별 분리되어 있어 통합 검색 수요가 약함. | 향후 검토. |
| **주간 뷰 / 일간 뷰 / 연간 뷰** | 다양한 시점 | v1 핵심은 "월간 뷰" 단일. | v2+ 마일스톤. |
| **이벤트 색상/카테고리 색상** | 시각 분류 | 미니멀 톤과 충돌. 태그 부재 상태에서는 의미 부여 불가. | 도입 안 함. |
| **emoji 기반 체크 아이콘 (`✅`)** | 0 비용 표시 | OS별 모양 다름, 컬러풀해서 미니멀 톤 깨짐. | 인라인 SVG 1개. |
| **아이콘 폰트 (Font Awesome 등) / 아이콘 라이브러리** | 풍부한 아이콘 | 신규 의존성 — STACK.md constraint 위반. v1.1에서 필요한 SVG는 체크 1개뿐. | 인라인 SVG path. |
| **CSS 프레임워크 (Tailwind, Bootstrap)** | 빠른 스타일링 | 신규 의존성. 토큰 4~10개로 충분. | `:root` CSS custom properties. |
| **JS 프레임워크 (React 등) 도입** | 모던 스택 | constraint 정면 위반. 250줄 vanilla JS로 충분. | Vanilla JS 유지. |
| **`outline: none` 일괄 적용** | 보기 싫은 outline 제거 | a11y 위반 — 키보드 사용자 포커스 사라짐. | `:focus-visible`로 분기. |
| **글로벌 keydown으로 input 안에서도 단축키 동작** | 단축키 보편 적용 | input에서 ←→로 커서 이동 못 하게 됨 — 치명적. | `event.target.tagName === 'INPUT'` 가드. |
| **deprecated `KeyboardEvent.keyCode` 사용** | 레거시 호환 | 표준 deprecated. 본 프로젝트 호환 대상 아님. | `event.key` 비교만. |
| **localStorage 스키마 마이그레이션** | 모델 진화 | v1.1은 데이터 모델 무변경. version=1 그대로. | 변경 없음. |
| **셀에 todo 텍스트 미리보기 표시** | 정보 밀도 ↑ | 42셀 × 텍스트 = 시각 노이즈 폭증, 미니멀 톤과 충돌. 클릭하면 패널에서 보임. | 배지 + 모두 완료 체크 아이콘 정도가 적정선. |

---

## Pattern Comparison — 주요 영역별 표준 동작 분석

requirements 단계가 결정 근거를 빠르게 참조할 수 있도록 영역별 비교표.

### 1) "오늘 강조" 패턴 비교

| 패턴 | 예시 앱 | 장점 | 단점 | 본 앱 적합성 |
|------|---------|------|------|-------------|
| **사각형 배경 채우기** (액센트 색 + 글자색 반전 또는 진한 글자) | Google Calendar 데스크톱, Outlook 웹 | 셀이 사각형이라 자연스러움. 한눈에 띈다. 면적 강조라 시각 우선순위 명확. | 진한 색이면 라이트 미니멀 톤 깨짐 → **연한 톤 사용 필수**. | **✓ 채택** (사용자 명시 요구). 단 톤다운: `--color-today-bg: #eaf2ff` 같은 연한 액센트 + 진한 숫자. |
| **원형 도트 (숫자 위에 배경 원)** | Apple Calendar, iOS 캘린더 | 셀 전체를 변형 안 해 다른 정보(배지 등)와 공존하기 좋음. | 셀이 사각형 그리드일 때 어색할 수 있음. CSS 추가 복잡. | △ 가능하지만 사용자가 "배경 채우기" 명시. |
| **두꺼운 보더** | 일부 미니멀 디자인 | 면적 점유 없음. 미니멀 친화. | 강조도 약함, 다른 보더와 혼동 가능. | △ 사용자 요구와 다름. |
| **글자만 색/굵기** | 매우 미니멀한 디자인 | 시각 노이즈 최소. | 한눈에 안 띈다 — 매일 쓰는 앱엔 부족. | ✗ 채택 안 함. |

**결정:** 연한 액센트 배경 + 진한 숫자 + `aria-current="date"`.

### 2) "다른 달 셀" 흐림 처리

| 패턴 | opacity / 색상 | 클릭 가능성 | 비고 |
|------|---------------|-------------|------|
| **연한 글자 + 약간 어두운 배경** (현재 v1) | 글자 `#b8b8b8` (≈ opacity 0.55), bg `#f7f7f7` | 가능 | Google Calendar 패턴. **본 앱 채택.** |
| **opacity 0.3~0.5 일괄** | opacity: 0.4 | 가능 | 단순하지만 배지/아이콘까지 흐려져 가독성 ↓. |
| **숨김** | display: none | 불가 | 6주 그리드 깨짐. ✗ |
| **회색 텍스트만, 배경 동일** | color만 변경 | 가능 | 약함. |

**표준 opacity 범위:** **0.4~0.6** 또는 muted color (대략 #aaa~#bbb). v1 현재 값이 표준 범위 안 — **유지 + 토큰화만**.

**클릭 가능성:** **표준은 "클릭 가능"**. Google/Apple 모두 다른 달 셀 클릭하면 그 달로 이동하거나 그 날짜 todo를 띄운다. 본 앱은 **그 날짜의 todo 패널을 띄우되, 월 전환은 하지 않음**(v1 현재 동작). 이는 다른 달 셀에서도 todo CRUD가 가능하다는 뜻 — 계속 유지.

### 3) "완료 토글 시각" 조합 비교

| 조합 | 가독성 | 완료감 | 사용 앱 | 본 앱 적합성 |
|------|--------|--------|---------|-------------|
| **취소선 단독** | 보통 | 약함 | (단독은 드뭄) | ✗ |
| **흐리게 단독** | 보통 | 보통 | Apple Reminders (체크박스만 색 변화) | ✗ |
| **취소선 + 흐리게** | 좋음 | 강함 | Todoist, Things, TickTick | **✓ 채택** |
| 취소선 + 컬러 변화(회색) | 좋음 | 보통 | 현재 v1 (`#999` + line-through) | △ 흐리게(opacity)로 한 단계 강화 |
| 완료 시 자동 하단 이동 | — | 강함 | 일부 앱 (자동 정렬) | ✗ 사용자 인지 부담, 사용자 요구 아님 |
| 완료 시 자동 삭제 | — | — | 안티패턴 | ✗ 데이터 손실 |

**결정:** `text-decoration: line-through` + `opacity: 0.55~0.6` (또는 muted color 강화).

### 4) "Enter 추가 + 빈 무시 + 포커스 유지" 흐름

**표준 동작 (Slack/Linear/Notion/Things 공통):**

1. 사용자가 input에 텍스트 입력
2. Enter 누르면 → form submit
3. submit 핸들러: `value.trim()`이 빈 문자열이면 **무동작** (에러 메시지도 없음, input value도 그대로)
4. 추가 성공: input.value = '' (비움), input은 여전히 포커스 유지
5. 새 todo가 목록 하단에 즉시 추가
6. 사용자는 바로 다음 todo를 입력할 수 있음 (포커스 이동 없음)

**현재 v1 코드 (`todo.js` 210~223라인) 검증:**
- `addTodo` 내부에서 trim 후 빈 문자열은 null 반환 ✓
- submit 핸들러에서 created가 null이면 input.value 안 비움 ✓
- 추가 후 input.value = '' ✓
- input.focus() **명시적 호출은 없음** — Enter 이후 브라우저 기본 포커스가 input에 남으나 보장은 약함

**v1.1 권장:** 추가 성공 후 `input.focus()` 명시적 호출 한 줄 추가 (안전장치).

### 5) "모두 완료" 표시 — 체크 아이콘 패턴

**비교한 앱:**
- **Things 3:** 일자별 진행률 도넛(0~100%)으로 표시 — 본 앱엔 과함
- **TickTick / Todoist 캘린더 뷰:** 셀에 체크 아이콘 또는 작은 ✓ — 본 앱 패턴과 동일
- **Apple Reminders:** 별도 표시 없음 — 단순

**결정:** **인라인 SVG 체크 아이콘**. 표시 조건: `count > 0 && all(t => t.done)`. count == 0인 빈 날짜는 표시 안 함(할 일 자체가 없는 날과 구분). 위치는 배지 자리(우상단)를 체크 아이콘으로 교체하거나, 배지 옆 — **배지 자리 교체가 시각적으로 깔끔** (배지와 체크 아이콘이 공존하면 노이즈).

근거: 사용자 명시 요구 + STACK.md 결정. SVG path 한 줄, currentColor로 셀 액센트 색 따라감.

### 6) 캘린더 키보드 네비 — W3C 표준

**W3C ARIA Authoring Practices — Date Picker Dialog 패턴 (권장 키 매핑):**

| 키 | 동작 |
|----|------|
| `←` (Left Arrow) | 이전 날짜 (-1일) |
| `→` (Right Arrow) | 다음 날짜 (+1일) |
| `↑` (Up Arrow) | 이전 주 (-7일) |
| `↓` (Down Arrow) | 다음 주 (+7일) |
| `Home` | 주의 첫째 날 (일요일) |
| `End` | 주의 마지막 날 (토요일) |
| `PageUp` | 같은 날짜의 전월 |
| `PageDown` | 같은 날짜의 차월 |
| `Shift+PageUp` | 같은 날짜의 전년 (선택) |
| `Shift+PageDown` | 같은 날짜의 차년 (선택) |
| `Enter` / `Space` | 셀 선택(= 패널 열기) |
| `Escape` | 패널 닫기 (active dialog 컨텍스트) |

**월 경계 동작:** Date Picker Dialog 패턴은 **자동 월 진입**을 권장(예: 4월 30일에서 → 누르면 5월 1일로). 일반 데이터 grid 패턴과 다른 점.

**roving tabindex:**
- 그리드 전체에 한 번에 단 하나의 셀만 `tabindex=0`, 나머지는 `tabindex=-1`
- 방향키로 이동할 때 이전 셀은 `tabindex=-1`, 새 셀은 `tabindex=0` + `.focus({preventScroll: true})`
- 이렇게 해야 Tab으로 그리드 진입/이탈이 한 번에 되고, 그리드 안에서는 방향키로만 이동

**페이지 단축키 (그리드 밖에서도 동작):**
- `←`, `→` (modifier 없이): 월 이동 — **Google Calendar 표준이지만 그리드 안 ←/→와 충돌** → 본 앱은 **그리드 안 ←/→는 셀 이동, 그리드 밖에서만 월 이동**으로 분리하거나, **항상 셀 이동만** 두고 월 이동은 헤더 버튼 + `T`만 두는 게 더 명확. **권장: 페이지 레벨 ←/→는 도입하지 않고 그리드 키보드 네비가 자연스럽게 월 경계를 넘게**.
  - 단, 사용자 요구가 "←/→로 월 이동"이므로, 이 충돌은 **requirements 단계에서 명시적 결정 필요**. 가능한 해소:
    - (안 1) `Shift+←`/`Shift+→`를 월 이동, ←→ 단독은 셀 이동 — 표준에서 약간 벗어남
    - (안 2) 그리드 안 포커스 시 ←→는 셀 이동, 그리드 밖(또는 포커스 어디에도 없을 때)은 월 이동 — 컨텍스트 의존, 명확함
    - (안 3) 그리드 키보드 네비를 v1.1에서 빼고 ←→는 월 이동만 — 차별화 한 단계 포기
- `T` / `t`: 오늘로. modifier 없이 단독.
- `Escape`: 패널 닫기.

### 7) ARIA 패턴 — 캘린더 그리드

**W3C 표준 마크업 (Date Picker Dialog 패턴):**

```html
<div role="grid" aria-labelledby="cal-title">
  <div role="row">                              <!-- 요일 헤더 행 -->
    <span role="columnheader">일</span>
    ...
  </div>
  <div role="row">                              <!-- 첫째 주 -->
    <button role="gridcell"
            tabindex="-1"
            aria-selected="false"
            aria-current="date"                 <!-- 오늘만 -->
            aria-label="2026년 4월 28일 화요일, 할 일 3개">
      28
    </button>
    ...
  </div>
  ...
</div>
```

**핵심 속성:**
- `role="grid"` — 그리드 컨테이너 (현재 v1 ✓)
- `role="row"` — 7개 셀 묶는 행 래퍼 (**현재 v1: 누락**)
- `role="columnheader"` — 요일 헤더 (현재 v1 ✓)
- `role="gridcell"` — 각 날짜 셀 (현재 v1 ✓)
- `aria-current="date"` — 오늘 셀에만. 시각 강조와 별개로 의미 전달 (**현재 v1: 누락**)
- `aria-selected="true"|"false"` — 선택된 셀 표시. selected는 grid 패턴 표준 (**현재 v1: 누락**)
- `tabindex="-1"`/`"0"` — roving tabindex (**현재 v1: 누락**)
- `aria-label` — 셀 컨텍스트 (날짜 + 상태). "28"만 보이는 텍스트로는 스크린리더에 부족 (**현재 v1: 누락 — table stakes는 아니고 차별화 분류**)

**현재 v1과 격차:**
- 추가 필수: `aria-current`, `aria-selected`, `tabindex` 정책
- 추가 권장: 셀 단위 `aria-label`, `role="row"` 래퍼
- 결정 필요: row 래퍼를 추가할지, ARIA 없이 CSS grid로만 둘지 (시각은 동일하나 a11y tree 구조 다름)

---

## Feature Dependencies

```
[CSS 토큰 (라이트 미니멀 톤)]
    └──enables──> [오늘 셀 톤다운 강조]
    └──enables──> [다른 달 셀 흐림 토큰화]
    └──enables──> [배지 톤다운]
    └──enables──> [완료 항목 흐리게]

[`aria-current="date"` 추가]
    └──pairs-with──> [오늘 셀 시각 강조] (시각/의미 일치)

[모두 완료 체크 아이콘]
    └──requires──> [todo store의 done 상태 집계 헬퍼 (isAllDone)]
    └──requires──> [renderBadgesForGrid 확장 (badge ↔ check 토글)]

[방향키 그리드 네비]
    └──requires──> [roving tabindex 인프라]
    └──requires──> [`focusedIso` 모듈 상태]
    └──pairs-with──> [`aria-selected` 동적 토글]
    └──may-conflict-with──> [페이지 레벨 ←/→ 월 이동] (해소 결정 필요)

[Escape로 패널 닫기]
    └──requires──> [page-level keydown + input 가드]
    └──enhances──> [방향키 그리드 네비] (마우스 없이 흐름 완결)

[셀 단위 aria-label]
    └──requires──> [todo count + isAllDone 합성]
    └──depends-on──> [renderMonth 시점에 store 상태 조회 가능 여부]

[`:focus-visible` 글로벌 정책]
    └──pairs-with──> [모든 키보드 네비 기능] (포커스 시각 표시)
```

### Dependency Notes

- **CSS 토큰화는 다른 모든 시각 작업의 전제.** 색상 리터럴이 흩어져 있는 상태에서 시각 다듬기를 시작하면 동일한 변경을 여러 곳에 반복하게 된다.
- **roving tabindex 인프라 없이는 방향키 네비 불가.** 한 셀씩 `tabindex=0` 상태를 보장해야 `.focus()`가 시각적으로 동작.
- **셀 단위 aria-label은 store 상태에 의존** — `renderMonth` 시점에 `window.todoApp.countByDate(iso)`를 부를 수 있어야 함. 현재 v1은 `afterRenderMonth`에서 배지를 합성하므로 같은 훅에 aria-label도 합성하는 것이 자연스러움.
- **페이지 ←/→ 월 이동 vs 그리드 ←/→ 셀 이동 충돌은 requirements 단계에서 명시적 결정 필수.** 제안: 그리드 셀에 포커스가 있으면 셀 이동, 없으면 월 이동. 또는 월 이동은 헤더 버튼/`T`만 둔다.

---

## MVP Definition (v1.1 마일스톤 한정)

### Launch With (v1.1 — 반드시 포함)

매일 쓰기 거슬리지 않으려면 빠질 수 없는 것들. = **table stakes 그대로**.

**A. 시각**
- [ ] CSS custom property 토큰 도입 (라이트 미니멀 톤)
- [ ] 오늘 셀 톤다운 (연한 액센트 배경 + 진한 숫자) + `aria-current="date"`
- [ ] 다른 달 셀 흐림 (현재 톤 유지, 토큰화)
- [ ] 클릭/호버/포커스 affordance 정돈, `:focus-visible` 글로벌

**B. 인터랙션**
- [ ] 완료 항목: 취소선 + 흐리게 (opacity 0.55~0.6)
- [ ] Enter 입력 흐름 검증 + 추가 후 명시적 `input.focus()`
- [ ] 삭제 즉시 반영 (현 동작 유지 — no confirm, no undo)

**C. 셀 정보 밀도**
- [ ] 배지 톤다운
- [ ] 모두 완료 체크 아이콘 (인라인 SVG, 배지 자리 교체)

**D. 키보드/접근성**
- [ ] ←/→ 월 이동 (input 가드 포함, 그리드 충돌 해소 정책 결정 후)
- [ ] `T`/`t` 오늘로
- [ ] 방향키 셀 이동 (±1일/±7일, Home/End 주 경계, 월 경계 자동 진입)
- [ ] roving tabindex 인프라
- [ ] `aria-current` / `aria-selected` 동적 토글
- [ ] Enter/Space로 셀 선택 = 패널 열기
- [ ] aria-label 정비 (기존 요소 점검)

### Add If Time Permits (v1.1 차별화)

- [ ] 셀 단위 풍부한 aria-label
- [ ] `PageUp`/`PageDown` 월 이동 (그리드 안)
- [ ] `Escape`로 패널 닫고 원래 셀에 포커스 복귀
- [ ] 완료 토글에 0.1s transition + reduced-motion 분기
- [ ] 호버 시 셀 미세 하이라이트
- [ ] `role="row"` 래퍼 추가

### Future Consideration (v1.2+)

- [ ] 다크 모드 (별도 마일스톤 — 토큰 인프라 활용)
- [ ] 모바일 반응형
- [ ] `Shift+PageUp`/`Shift+PageDown` 연 이동
- [ ] 셀에 todo 텍스트 미리보기 (정보 밀도 ↑, 노이즈 ↓ 균형 검증 필요)

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| CSS 토큰 도입 + 라이트 톤 정돈 | HIGH | LOW | **P1** |
| 오늘 셀 톤다운 + `aria-current` | HIGH | LOW | **P1** |
| 다른 달 셀 토큰화 | MEDIUM | LOW | **P1** |
| 완료: 취소선 + 흐리게 | HIGH | LOW | **P1** |
| Enter 추가 흐름 명시 + focus() 보장 | HIGH | LOW | **P1** |
| 삭제 즉시 반영 (현 동작 유지) | HIGH | LOW | **P1** |
| 배지 톤다운 | MEDIUM | LOW | **P1** |
| 모두 완료 체크 아이콘 (SVG) | HIGH | LOW | **P1** |
| `:focus-visible` 글로벌 | MEDIUM | LOW | **P1** |
| `T`/`t` 오늘로 | HIGH | LOW | **P1** |
| 방향키 셀 이동 + roving tabindex | HIGH | MEDIUM | **P1** |
| `aria-current` / `aria-selected` 토글 | MEDIUM | LOW | **P1** |
| Enter/Space로 패널 열기 | HIGH | LOW | **P1** |
| ←/→ 월 이동 (충돌 정책 동반) | HIGH | LOW-MEDIUM | **P1** |
| 셀 단위 aria-label | MEDIUM | LOW | **P2** |
| `PageUp`/`PageDown` 월 이동 | LOW | LOW | **P2** |
| `Escape` 패널 닫기 + 포커스 복귀 | MEDIUM | LOW | **P2** |
| 완료 토글 transition | LOW | LOW | **P2** |
| 호버 셀 하이라이트 | LOW | LOW | **P2** |
| `role="row"` 래퍼 | LOW | LOW | **P2** |
| 다크모드 / 반응형 / Undo / 다이얼로그 | — | — | **P3 (anti — 제외)** |

**Priority key:**
- **P1**: v1.1 launch에 필수 (table stakes)
- **P2**: 시간 남으면 추가 (differentiator)
- **P3**: anti-feature 또는 향후 마일스톤

---

## Competitor Feature Analysis (요약)

캘린더-todo 도메인의 대표 4개 앱이 본 마일스톤 영역을 어떻게 처리하는가.

| Feature | Google Calendar | Apple Calendar | Things 3 | Todoist | 본 앱 결정 |
|---------|----------------|----------------|----------|---------|-----------|
| 오늘 강조 | 사각 배경 (파랑) + 흰 숫자 | 빨강 원형 도트 | 진한 글자 | 옅은 배경 | 연한 액센트 사각 배경 + 진한 숫자 (라이트 톤) |
| 다른 달 셀 | 회색 글자, 배경 동일, 클릭 가능 | 옅은 회색, 클릭 가능 | (앱이 캘린더가 아니라 일자별 리스트) | 옅은 회색, 클릭 가능 | 회색 글자 + 살짝 어두운 배경, 클릭 가능 (= 현 v1 유지) |
| 완료 표현 | (캘린더는 todo 없음) | (캘린더는 todo 없음) | 취소선 + 흐리게 + 자동 하단 이동 | 취소선 + 흐리게 (정렬 유지) | 취소선 + 흐리게 (정렬 유지 — 인지 부담 회피) |
| 모두 완료 표시 | — | — | 진행률 도넛(부분) | 별도 표시 없음 | 인라인 SVG 체크 아이콘 (전체 완료시) |
| 키보드 단축키 | T/J/K, ←/→, Esc, P/N | (제한적) | 광범위 | 광범위 (vim-like) | T, ←/→, ↑↓, Home/End, Enter, Esc |
| 방향키 그리드 네비 | ✓ (W3C 패턴) | ✓ | (해당 없음) | ✓ | ✓ |
| 삭제 확인 | ✓ (다이얼로그) | ✓ (다이얼로그) | ✗ (즉시 + Undo) | △ | ✗ (즉시, Undo도 없음) |
| Undo | ✓ (토스트) | ✓ | ✓ | ✓ | ✗ (사용자 요구) |
| 다크모드 | ✓ | ✓ | ✓ | ✓ | ✗ (스코프 외) |
| 반응형 | ✓ | ✓ | ✓ | ✓ | ✗ (스코프 외) |

**시사점:** 본 앱이 메이저 앱과 의도적으로 다르게 가는 지점은 **삭제 확인/Undo/다크모드/반응형 부재**. 이는 "1인용 미니멀 데스크톱" 포지셔닝의 일관된 결과 — anti-feature로 명시했으므로 requirements 단계에서 다시 떠올릴 필요 없음.

---

## Sources

- **W3C WAI-ARIA Authoring Practices — Date Picker Dialog Pattern** (HIGH): 그리드 키보드 매핑(←→ ±1일, ↑↓ ±7일, Home/End/PageUp/PageDown), roving tabindex, `aria-current="date"`, `aria-selected`, `role="grid"`/`row`/`gridcell` 표준.
- **W3C WAI-ARIA Authoring Practices — Grid Pattern** (HIGH): roving tabindex 패턴 일반 (Date Picker는 이를 캘린더에 특화).
- **MDN** (HIGH): `:focus-visible`, `aria-current`, `KeyboardEvent.key`, `prefers-reduced-motion`.
- **Google Calendar / Apple Calendar / Notion / Todoist / Things 3 / Apple Reminders** — 도메인 표준 패턴 비교 (MEDIUM, 직접 사용 경험 + 공개 UI 기반).
- **현재 리포지토리 코드** (`index.html`, `styles.css`, `calendar.js`, `todo.js`) — v1과의 격차 식별 (HIGH).
- **`.planning/PROJECT.md` / `.planning/research/STACK.md`** — Out of Scope 항목, 제약, 이미 결정된 기술 스택 (HIGH).

---
*Feature research for: 개인용 달력 Todo 앱 — v1.1 UX 다듬기*
*Researched: 2026-04-28*
