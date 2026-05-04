'use strict';

let _autofillTimer = null;
let _toastTimer = null;

async function init() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js').catch(() => {});
  }

  loadTheme();
  await initDB();
  loadViewMode();
  await loadLibrary('shows');
  _bindEvents();
}

function _bindEvents() {
  // Theme toggle
  document.getElementById('theme-toggle').addEventListener('click', () => {
    toggleTheme();
    applyAccent(getCurrentLib());
  });

  // Library tabs
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => loadLibrary(tab.dataset.lib));
  });

  // Search + autofill
  document.getElementById('search-input').addEventListener('input', e => {
    const q = e.target.value.trim();
    setSearchQuery(q);
    renderList();

    clearTimeout(_autofillTimer);
    if (q.length >= 2) {
      _autofillTimer = setTimeout(async () => {
        const results = await autofillSearch(getCurrentLib(), q);
        renderAutofillResults(results);
      }, 320);
    } else {
      document.getElementById('autofill-results').classList.add('hidden');
      document.getElementById('autofill-results').innerHTML = '';
    }
  });

  // Add button
  document.getElementById('add-btn').addEventListener('click', () => {
    const q = document.getElementById('search-input').value.trim();
    if (!q) return;
    createItemFromTitle(q).then(() => {
      document.getElementById('search-input').value = '';
      document.getElementById('autofill-results').classList.add('hidden');
      document.getElementById('autofill-results').innerHTML = '';
      setSearchQuery('');
    });
  });

  // Enter key in search also adds
  document.getElementById('search-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      const q = e.target.value.trim();
      if (!q) return;
      createItemFromTitle(q).then(() => {
        e.target.value = '';
        document.getElementById('autofill-results').classList.add('hidden');
        document.getElementById('autofill-results').innerHTML = '';
        setSearchQuery('');
      });
    }
  });

  // Filter buttons (event delegation)
  document.getElementById('filter-bar').addEventListener('click', e => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;

    const type = btn.dataset.type;
    const raw = btn.dataset.value;
    const value = type === 'rating' ? parseInt(raw, 10) : raw;

    toggleFilter(type, value);
    btn.classList.toggle('active');
    renderList();
  });

  // Sort
  document.getElementById('sort-select').addEventListener('change', e => {
    setSort(e.target.value);
    renderList();
  });

  // View mode toggle
  document.getElementById('view-list-btn').addEventListener('click', () => setViewMode('list'));
  document.getElementById('view-grid-btn').addEventListener('click', () => setViewMode('grid'));

  // Bulk add
  document.getElementById('bulk-add-btn').addEventListener('click', _openBulkAdd);
  document.getElementById('bulk-overlay-bg').addEventListener('click', _closeBulkAdd);
  document.getElementById('bulk-cancel').addEventListener('click', _closeBulkAdd);

  document.getElementById('bulk-add-all').addEventListener('click', async () => {
    const text = document.getElementById('bulk-textarea').value;
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    if (!lines.length) { _closeBulkAdd(); return; }
    const added = await bulkAdd(lines);
    _closeBulkAdd();
    _showToast(`Added ${added} item${added !== 1 ? 's' : ''}`);
  });

  // Close detail overlay
  document.getElementById('overlay-bg').addEventListener('click', closeDetail);

  // Escape closes whichever panel is open
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeDetail();
      _closeBulkAdd();
    }
  });
}

function _openBulkAdd() {
  const overlay = document.getElementById('bulk-overlay');
  overlay.classList.remove('hidden');
  requestAnimationFrame(() => overlay.classList.add('visible'));
  document.getElementById('bulk-textarea').value = '';
  document.getElementById('bulk-textarea').focus();
}

function _closeBulkAdd() {
  const overlay = document.getElementById('bulk-overlay');
  if (overlay.classList.contains('hidden')) return;
  overlay.classList.remove('visible');
  setTimeout(() => overlay.classList.add('hidden'), 250);
}

function _showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('visible');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => toast.classList.remove('visible'), 2500);
}

document.addEventListener('DOMContentLoaded', init);
