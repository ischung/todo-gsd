// Phase 2: Todo 데이터 레이어 — store + CRUD + localStorage 영속화.
// D2-01 ISO YYYY-MM-DD 키 / D2-02 단일 키 직렬화 / D2-03 스키마 / D2-04 mutation 즉시 저장
// D2-05 폴백 / D2-06 quota는 콘솔 경고만.

'use strict';

// === 데이터 레이어 (02-01) ===

const STORAGE_KEY = 'todo-gsd:v1';
const SCHEMA_VERSION = 1;
const MAX_TEXT_LEN = 200;

function emptyStore() {
  return { version: SCHEMA_VERSION, byDate: {} };
}

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw == null) return emptyStore();
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.version !== SCHEMA_VERSION || typeof parsed.byDate !== 'object') {
      console.warn('[todo] 스키마 mismatch — 빈 store로 폴백');
      return emptyStore();
    }
    return parsed;
  } catch (err) {
    console.warn('[todo] localStorage 파싱 실패 — 빈 store로 폴백:', err.message);
    return emptyStore();
  }
}

let store = loadFromStorage();

function saveToStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch (err) {
    // D2-06: quota 초과 등은 throw 하지 않고 경고만.
    console.warn('[todo] 저장 실패(quota 등):', err.message);
  }
}

function genId() {
  return 't_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
}

function isValidIso(iso) {
  return typeof iso === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(iso);
}

function getTodos(iso) {
  if (!isValidIso(iso)) return [];
  return (store.byDate[iso] || []).slice().sort((a, b) => a.createdAt - b.createdAt);
}

function countByDate(iso) {
  if (!isValidIso(iso)) return 0;
  return (store.byDate[iso] || []).length;
}

function addTodo(iso, text) {
  if (!isValidIso(iso)) return null;
  const trimmed = String(text ?? '').trim();
  if (trimmed === '') return null;
  const todo = {
    id: genId(),
    text: trimmed.slice(0, MAX_TEXT_LEN),
    done: false,
    createdAt: Date.now(),
  };
  if (!store.byDate[iso]) store.byDate[iso] = [];
  store.byDate[iso].push(todo);
  saveToStorage();
  return todo;
}

function toggleTodo(iso, id) {
  const list = store.byDate[iso];
  if (!list) return false;
  const item = list.find((t) => t.id === id);
  if (!item) return false;
  item.done = !item.done;
  saveToStorage();
  return true;
}

function deleteTodo(iso, id) {
  const list = store.byDate[iso];
  if (!list) return false;
  const idx = list.findIndex((t) => t.id === id);
  if (idx < 0) return false;
  list.splice(idx, 1);
  if (list.length === 0) delete store.byDate[iso];
  saveToStorage();
  return true;
}

function _dump() {
  return JSON.parse(JSON.stringify(store));
}

function _reset() {
  store = emptyStore();
  saveToStorage();
}

// === 렌더링 (02-03) ===

let selectedDate = null;

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatPanelTitle(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return `${y}년 ${m}월 ${d}일`;
}

function toItemHtml(t) {
  const cls = 'todo-item' + (t.done ? ' todo-item--done' : '');
  const checked = t.done ? 'checked' : '';
  const safe = escapeHtml(t.text);
  return `<li class="${cls}" data-id="${t.id}">
    <input type="checkbox" class="todo-item__check" ${checked} aria-label="완료 토글">
    <span class="todo-item__text">${safe}</span>
    <button type="button" class="todo-item__delete" aria-label="삭제">삭제</button>
  </li>`;
}

function renderBadgesForGrid() {
  const grid = document.getElementById('cal-grid');
  if (!grid) return;
  grid.querySelectorAll('.day').forEach((cell) => {
    const iso = cell.getAttribute('data-date');
    if (!iso) return;
    const count = countByDate(iso);
    let badge = cell.querySelector('.day__badge');
    if (count === 0) {
      // D2-13: 0건이면 배지 제거.
      if (badge) badge.remove();
    } else {
      if (!badge) {
        badge = document.createElement('span');
        badge.className = 'day__badge';
        cell.appendChild(badge);
      }
      // D2-14: 99 초과는 99+로 클램프.
      badge.textContent = count > 99 ? '99+' : String(count);
    }
    cell.classList.toggle('day--selected', iso === selectedDate);
  });
}

function renderPanelList() {
  const listEl = document.getElementById('todo-list');
  if (!listEl) return;
  if (!selectedDate) {
    listEl.innerHTML = '';
    return;
  }
  const items = getTodos(selectedDate);
  listEl.innerHTML = items.map(toItemHtml).join('');
}

function openPanel(iso) {
  if (!isValidIso(iso)) return;
  selectedDate = iso;
  const panel = document.getElementById('todo-panel');
  if (panel) panel.hidden = false;
  const titleEl = document.getElementById('todo-panel-title');
  if (titleEl) titleEl.textContent = formatPanelTitle(iso);
  renderPanelList();
  renderBadgesForGrid();
  const input = document.getElementById('todo-input');
  if (input) input.focus();
}

function closePanel() {
  selectedDate = null;
  const panel = document.getElementById('todo-panel');
  if (panel) panel.hidden = true;
  renderBadgesForGrid();
}

function afterRenderMonth(_year, _month) {
  // 셀의 data-date를 신뢰하므로 인자는 사용하지 않는다 (시그니처 일관성).
  renderBadgesForGrid();
}

// === 이벤트 위임 (02-03) ===

const _gridEl = document.getElementById('cal-grid');
if (_gridEl) {
  _gridEl.addEventListener('click', (e) => {
    const cell = e.target.closest('.day');
    if (!cell) return;
    const iso = cell.getAttribute('data-date');
    if (!iso) return;
    openPanel(iso);
  });
}

const _formEl = document.getElementById('todo-form');
if (_formEl) {
  _formEl.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!selectedDate) return;
    const input = document.getElementById('todo-input');
    if (!input) return;
    const created = addTodo(selectedDate, input.value);
    if (!created) return;
    input.value = '';
    renderPanelList();
    renderBadgesForGrid();
  });
}

const _listEl = document.getElementById('todo-list');
if (_listEl) {
  _listEl.addEventListener('click', (e) => {
    const li = e.target.closest('.todo-item');
    if (!li || !selectedDate) return;
    const id = li.getAttribute('data-id');
    if (!id) return;
    if (e.target.classList.contains('todo-item__check')) {
      toggleTodo(selectedDate, id);
      renderPanelList();
      renderBadgesForGrid();
    } else if (e.target.classList.contains('todo-item__delete')) {
      deleteTodo(selectedDate, id);
      renderPanelList();
      renderBadgesForGrid();
    }
  });
}

document.getElementById('todo-panel-close')?.addEventListener('click', closePanel);

// 초기 배지 1회 그리기 (calendar.js의 renderCurrent가 먼저 실행됨 — 같은 defer 큐).
renderBadgesForGrid();

// === Public API (D2-19) ===

window.todoApp = {
  STORAGE_KEY,
  getTodos,
  countByDate,
  addTodo,
  toggleTodo,
  deleteTodo,
  afterRenderMonth,
  openPanel,
  closePanel,
  get selectedDate() { return selectedDate; },
  _dump,
  _reset,
};
