---
status: complete
phase: 02-todo-and-persistence
source: 02-01-SUMMARY.md, 02-02-SUMMARY.md, 02-03-SUMMARY.md
started: 2026-04-28T00:00:00Z
updated: 2026-04-28T00:00:00Z
---

## Current Test

[testing complete]

## Tests

### 1. 셀 클릭 → 패널 열림
expected: 날짜 셀 클릭 시 Todo 패널이 표시되고, 헤더에 "YYYY년 M월 D일", 입력란 포커스, 선택 셀이 강조된다.
result: pass

### 2. 할 일 추가 (Enter / 버튼)
expected: 입력란에 텍스트 입력 후 Enter 또는 추가 버튼 클릭 시 리스트에 즉시 항목이 나타나고 입력란이 비워진다.
result: pass

### 3. 빈 문자열/공백 거부
expected: 빈 문자열이나 공백만 입력하고 제출하면 항목이 추가되지 않는다 (리스트 변화 없음).
result: pass

### 4. 체크 토글
expected: 항목 체크박스 클릭 시 완료 상태(취소선/done 스타일)로 토글되고, 다시 클릭하면 해제된다.
result: pass

### 5. 삭제
expected: 삭제 버튼 클릭 시 해당 항목이 리스트에서 즉시 제거된다.
result: pass

### 6. 배지 카운트 표시
expected: 항목이 1개 이상인 날짜 셀에 개수 배지가 표시되고, 0건이 되면 배지가 사라진다.
result: pass

### 7. 배지 99+ 클램프
expected: 한 날짜에 100개 이상 항목 추가 시 배지가 "99+"로 표시된다.
result: pass

### 8. localStorage 영속화
expected: 두 개 이상의 날짜에 항목 추가 후 페이지 새로고침 시 항목·완료상태·배지가 동일하게 복원된다.
result: pass

### 9. 월 이동 시 배지 재계산
expected: 이전/다음 월로 이동 시 새 월의 데이터에 맞춰 배지가 정확히 재계산되어 표시된다.
result: pass

### 10. 패널 닫기
expected: 패널의 닫기 버튼(#todo-panel-close) 클릭 시 패널이 숨겨진다(hidden 적용).
result: pass

## Summary

total: 10
passed: 10
issues: 0
pending: 0
skipped: 0
blocked: 0

## Gaps

[none yet]
