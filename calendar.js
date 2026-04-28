// Phase 1: 월간 달력 셸 — 렌더 로직.
// D-01 일요일 시작 / D-02 6주 고정 / D-03 다른 달 흐림 / D-06 현재 월의 오늘만 강조.

'use strict';

// D-08: 현재 표시 중인 월을 모듈 상태로 보유.
const state = {
  year: new Date().getFullYear(),
  month: new Date().getMonth(), // 0-11
};

// ISO YYYY-MM-DD 포맷 (로컬 시각 기준, UTC 변환 금지).
function toISODate(year, month /* 0-11 */, day) {
  const mm = String(month + 1).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  return `${year}-${mm}-${dd}`;
}

function isSameYMD(a, b) {
  return a.getFullYear() === b.getFullYear()
      && a.getMonth() === b.getMonth()
      && a.getDate() === b.getDate();
}

// 42개 셀의 (year, month, day, isOtherMonth) 시퀀스 생성.
// D-01: getDay()는 일=0 ... 토=6. 그대로 첫 칸 오프셋으로 사용.
function buildCells(year, month) {
  const firstOfMonth = new Date(year, month, 1);
  const startOffset = firstOfMonth.getDay(); // 0=일
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const cells = [];

  // 앞쪽 채움: 이전 달 끝부분.
  for (let i = startOffset - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    const d = new Date(year, month - 1, day);
    cells.push({ year: d.getFullYear(), month: d.getMonth(), day, otherMonth: true });
  }

  // 현재 달.
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({ year, month, day, otherMonth: false });
  }

  // 뒤쪽 채움: 항상 42칸이 되도록 다음 달 시작부터.
  let nextDay = 1;
  while (cells.length < 42) {
    const d = new Date(year, month + 1, nextDay);
    cells.push({ year: d.getFullYear(), month: d.getMonth(), day: nextDay, otherMonth: true });
    nextDay++;
  }

  return cells;
}

function renderMonth(year, month) {
  const titleEl = document.getElementById('cal-title');
  const gridEl = document.getElementById('cal-grid');
  if (!titleEl || !gridEl) return;

  // D-04: "YYYY년 M월" (M은 0 패딩 없이).
  titleEl.textContent = `${year}년 ${month + 1}월`;

  const today = new Date();
  const cells = buildCells(year, month);

  // 한 번에 innerHTML 교체로 깜박임 최소화.
  const html = cells.map((c) => {
    const cellDate = new Date(c.year, c.month, c.day);
    const classes = ['day'];
    if (c.otherMonth) classes.push('day--other-month');
    // D-06: 현재 월(year/month 일치)의 오늘만 강조. 다른 달의 동일 숫자는 강조 X.
    if (!c.otherMonth && isSameYMD(cellDate, today)) classes.push('day--today');
    const iso = toISODate(c.year, c.month, c.day);
    return `<div class="${classes.join(' ')}" role="gridcell" data-date="${iso}"><span class="day__num">${c.day}</span></div>`;
  }).join('');

  gridEl.innerHTML = html;

  // Phase 2 hook: todo.js가 로드되어 있으면 배지를 입힌다. 없으면 무시.
  window.todoApp?.afterRenderMonth?.(year, month);
}

function renderCurrent() {
  renderMonth(state.year, state.month);
}

// 월 이동 핸들러 (D-05, D-07, D-08).
function goPrevMonth() {
  // month가 0(1월)이면 전년도 12월로.
  if (state.month === 0) {
    state.year -= 1;
    state.month = 11;
  } else {
    state.month -= 1;
  }
  renderCurrent();
}

function goNextMonth() {
  // month가 11(12월)이면 다음 해 1월로.
  if (state.month === 11) {
    state.year += 1;
    state.month = 0;
  } else {
    state.month += 1;
  }
  renderCurrent();
}

function goToday() {
  const now = new Date();
  state.year = now.getFullYear();
  state.month = now.getMonth();
  renderCurrent();
}

document.getElementById('cal-prev').addEventListener('click', goPrevMonth);
document.getElementById('cal-next').addEventListener('click', goNextMonth);
document.getElementById('cal-today').addEventListener('click', goToday);

// 페이지 로드 시 현재 월 렌더 (script defer라 DOM 준비 완료 보장).
renderCurrent();

// 다음 plan(01-03)이 사용할 수 있도록 전역에 노출.
window.calendarApp = { state, renderMonth, renderCurrent, goPrevMonth, goNextMonth, goToday };
