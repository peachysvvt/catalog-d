'use strict';

let _lib = 'shows';
let _items = [];
let _searchQuery = '';
let _viewMode = 'list';

// ---- LIBRARY LOADING ----

async function loadLibrary(lib) {
  _lib = lib;
  _items = await getAll(lib);

  document.querySelectorAll('.tab').forEach(t =>
    t.classList.toggle('active', t.dataset.lib === lib)
  );

  applyAccent(lib);

  _searchQuery = '';
  document.getElementById('search-input').value = '';
  _hideAutofill();

  setSort('status');
  document.getElementById('sort-select').value = 'status';

  resetFilters();
  renderFilters();
  renderList();
}

// ---- VIEW MODE ----

function loadViewMode() {
  _viewMode = localStorage.getItem('catalogd-view') || 'list';
  _applyViewMode();
}

function setViewMode(mode) {
  _viewMode = mode;
  localStorage.setItem('catalogd-view', _viewMode);
  _applyViewMode();
  renderList();
}

function _applyViewMode() {
  const list = document.getElementById('list');
  if (list) list.className = _viewMode === 'grid' ? 'list-grid' : '';
  const listBtn = document.getElementById('view-list-btn');
  const gridBtn = document.getElementById('view-grid-btn');
  if (listBtn) listBtn.classList.toggle('active', _viewMode === 'list');
  if (gridBtn) gridBtn.classList.toggle('active', _viewMode === 'grid');
}

// ---- LIST ----

function renderList() {
  const container = document.getElementById('list');
  let items = [..._items];

  if (_searchQuery) {
    const q = _searchQuery.toLowerCase();
    items = items.filter(i =>
      i.title.toLowerCase().includes(q) ||
      (i.tags || []).some(t => t.toLowerCase().includes(q))
    );
  }

  items = applyFilters(items, _lib);
  items = sortItems(items, _lib);

  if (items.length === 0) {
    container.innerHTML = _items.length === 0
      ? `<div class="empty-state">
           <span>No items yet</span>
           <button class="empty-state-action" id="load-test-data">Load sample data</button>
         </div>`
      : `<div class="empty-state"><span>No matches</span></div>`;

    const btn = document.getElementById('load-test-data');
    if (btn) btn.addEventListener('click', _loadTestData);
    return;
  }

  const frag = document.createDocumentFragment();
  items.forEach(item => {
    const el = document.createElement('div');
    if (_viewMode === 'grid') {
      el.className = 'card-item';
      el.innerHTML = _cardHTML(item);
    } else {
      el.className = 'list-item';
      el.innerHTML = _itemHTML(item);
    }
    el.addEventListener('click', () => openDetail(item));
    frag.appendChild(el);
  });

  container.innerHTML = '';
  container.appendChild(frag);
}

function _itemHTML(item) {
  const ratingStr = item.rating ? ` · ${item.rating}/5` : '';
  const tagsStr = item.tags && item.tags.length
    ? `<div class="item-tags">${esc(item.tags.join(', '))}</div>`
    : '';
  const thumb = item.image
    ? `<img class="item-thumb" src="${esc(item.image)}" alt="" loading="lazy">`
    : `<div class="item-thumb-placeholder">${esc((item.title || '?').charAt(0).toUpperCase())}</div>`;
  return `
    ${thumb}
    <div class="item-info">
      <div class="item-title">${esc(item.title)}</div>
      <div class="item-meta">${esc(item.status)}${ratingStr}</div>
      ${tagsStr}
    </div>
  `;
}

function _cardHTML(item) {
  const stars = item.rating ? '★'.repeat(item.rating) : '';
  const poster = item.image
    ? `<img class="card-img" src="${esc(item.image)}" alt="${esc(item.title)}" loading="lazy">`
    : `<div class="card-img-placeholder">${esc((item.title || '?').charAt(0).toUpperCase())}</div>`;
  return `
    ${poster}
    <div class="card-info">
      <div class="card-title">${esc(item.title)}</div>
      <div class="card-meta">
        <span class="card-status">${esc(item.status)}</span>
        ${stars ? `<span class="card-rating">${stars}</span>` : ''}
      </div>
    </div>
  `;
}

// ---- FILTERS ----

function renderFilters() {
  _renderStatusFilters();
  _renderRatingFilters();
  _renderTagFilters();
  _renderConditionalFilters();
}

function _renderStatusFilters() {
  const el = document.getElementById('status-filters');
  el.innerHTML = statusOptions(_lib).map(s =>
    `<button class="filter-btn${isFilterActive('status', s) ? ' active' : ''}"
             data-type="status" data-value="${esc(s)}">${esc(s)}</button>`
  ).join('');
}

function _renderRatingFilters() {
  const el = document.getElementById('rating-filters');
  el.innerHTML = [1, 2, 3, 4, 5].map(r =>
    `<button class="filter-btn${isFilterActive('rating', r) ? ' active' : ''}"
             data-type="rating" data-value="${r}">${r}</button>`
  ).join('');
}

function _renderTagFilters() {
  const el = document.getElementById('tag-filters');
  const tags = [...new Set(_items.flatMap(i => i.tags || []))].sort();
  el.innerHTML = tags.map(t =>
    `<button class="filter-btn${isFilterActive('tags', t) ? ' active' : ''}"
             data-type="tags" data-value="${esc(t)}">${esc(t)}</button>`
  ).join('');
}

function _renderConditionalFilters() {
  const ownershipEl = document.getElementById('ownership-filters');
  const cuisineEl = document.getElementById('cuisine-filters');

  if (_lib === 'books' || _lib === 'games') {
    ownershipEl.classList.remove('hidden');
    ownershipEl.innerHTML = ['Owned', 'Not Owned', 'Unset'].map(o =>
      `<button class="filter-btn${isFilterActive('ownership', o) ? ' active' : ''}"
               data-type="ownership" data-value="${o}">${o}</button>`
    ).join('');
  } else {
    ownershipEl.classList.add('hidden');
    ownershipEl.innerHTML = '';
  }

  if (_lib === 'restaurants') {
    cuisineEl.classList.remove('hidden');
    const cuisines = [...new Set(_items.flatMap(i => i.cuisine || []))].sort();
    cuisineEl.innerHTML = cuisines.map(c =>
      `<button class="filter-btn${isFilterActive('cuisine', c) ? ' active' : ''}"
               data-type="cuisine" data-value="${esc(c)}">${esc(c)}</button>`
    ).join('');
  } else {
    cuisineEl.classList.add('hidden');
    cuisineEl.innerHTML = '';
  }
}

// ---- DETAIL PANEL ----

function openDetail(item) {
  const overlay = document.getElementById('overlay');
  document.getElementById('panel-content').innerHTML = _buildDetailHTML(item);
  overlay.classList.remove('hidden');
  requestAnimationFrame(() => overlay.classList.add('visible'));
  _bindDetailEvents(item);
}

function closeDetail() {
  const overlay = document.getElementById('overlay');
  overlay.classList.remove('visible');
  setTimeout(() => overlay.classList.add('hidden'), 250);
}

function _buildDetailHTML(item) {
  const statuses = statusOptions(_lib);
  const isBooks = _lib === 'books';
  const isGames = _lib === 'games';
  const isRestaurant = _lib === 'restaurants';

  const ownershipHTML = (isBooks || isGames) ? `
    <div class="field-group">
      <label class="field-label">Ownership</label>
      <div class="ownership-options">
        ${['Owned', 'Not Owned', 'Unset'].map(o =>
          `<button class="ownership-btn${(item.ownership || 'Unset') === o ? ' active' : ''}"
                   data-ownership="${o}">${o}</button>`
        ).join('')}
      </div>
    </div>` : '';

  const cuisineHTML = isRestaurant ? `
    <div class="field-group">
      <label class="field-label">Cuisine</label>
      <input type="text" class="field-input" id="detail-cuisine"
             value="${esc((item.cuisine || []).join(', '))}"
             placeholder="Italian, Japanese, ...">
    </div>` : '';

  return `
    <div class="field-group">
      <label class="field-label" for="detail-title">Title</label>
      <input type="text" class="field-input" id="detail-title" value="${esc(item.title)}">
    </div>

    <div class="field-group">
      <label class="field-label">Status</label>
      <div class="status-options">
        ${statuses.map(s =>
          `<button class="status-btn${item.status === s ? ' active' : ''}"
                   data-status="${esc(s)}">${esc(s)}</button>`
        ).join('')}
      </div>
    </div>

    <div class="field-group">
      <label class="field-label">Rating</label>
      <div class="rating-options">
        ${[1, 2, 3, 4, 5].map(r =>
          `<button class="rating-btn${item.rating === r ? ' active' : ''}"
                   data-rating="${r}">${r}</button>`
        ).join('')}
      </div>
    </div>

    <div class="field-group">
      <label class="field-label" for="detail-tags">Tags</label>
      <input type="text" class="field-input" id="detail-tags"
             value="${esc((item.tags || []).join(', '))}"
             placeholder="tag1, tag2, ...">
    </div>

    <div class="field-group">
      <label class="field-label" for="detail-notes">Notes</label>
      <textarea class="field-input" id="detail-notes" rows="3">${esc(item.notes || '')}</textarea>
    </div>

    <div class="field-group">
      <label class="field-label" for="detail-image">Cover art URL</label>
      <input type="text" class="field-input" id="detail-image"
             value="${esc(item.image || '')}"
             placeholder="https://...">
    </div>

    ${ownershipHTML}
    ${cuisineHTML}

    <div class="detail-actions">
      <button class="btn-save" id="detail-save">Save</button>
      <button class="btn-delete" id="detail-delete">Delete</button>
    </div>
  `;
}

function _bindDetailEvents(item) {
  document.querySelectorAll('.status-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.status-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  document.querySelectorAll('.rating-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const wasActive = btn.classList.contains('active');
      document.querySelectorAll('.rating-btn').forEach(b => b.classList.remove('active'));
      if (!wasActive) btn.classList.add('active');
    });
  });

  document.querySelectorAll('.ownership-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.ownership-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  document.getElementById('detail-save').addEventListener('click', async () => {
    const updated = _gatherFields(item);
    await updateItem(_lib, updated);
    const idx = _items.findIndex(i => i.id === item.id);
    if (idx !== -1) _items[idx] = updated;
    closeDetail();
    renderList();
    renderFilters();
  });

  document.getElementById('detail-delete').addEventListener('click', async () => {
    await deleteItem(_lib, item.id);
    _items = _items.filter(i => i.id !== item.id);
    closeDetail();
    renderList();
    renderFilters();
  });
}

function _gatherFields(item) {
  const title = document.getElementById('detail-title').value.trim() || item.title;
  const statusBtn = document.querySelector('.status-btn.active');
  const ratingBtn = document.querySelector('.rating-btn.active');
  const tags = document.getElementById('detail-tags').value
    .split(',').map(t => t.trim()).filter(Boolean);
  const notes = document.getElementById('detail-notes').value.trim();
  const image = (document.getElementById('detail-image')?.value || '').trim();

  const updated = {
    ...item,
    title,
    image,
    status: statusBtn ? statusBtn.dataset.status : item.status,
    rating: ratingBtn ? parseInt(ratingBtn.dataset.rating, 10) : null,
    tags,
    notes
  };

  if (_lib === 'books' || _lib === 'games') {
    const ownershipBtn = document.querySelector('.ownership-btn.active');
    updated.ownership = ownershipBtn ? ownershipBtn.dataset.ownership : (item.ownership || 'Unset');
  }

  if (_lib === 'restaurants') {
    const cuisineInput = document.getElementById('detail-cuisine');
    updated.cuisine = cuisineInput
      ? cuisineInput.value.split(',').map(c => c.trim()).filter(Boolean)
      : (item.cuisine || []);
  }

  return updated;
}

// ---- AUTOFILL ----

async function renderAutofillResults(results) {
  const container = document.getElementById('autofill-results');
  if (!results || results.length === 0) {
    _hideAutofill();
    return;
  }

  container.innerHTML = results.map(r =>
    `<div class="autofill-item" data-title="${esc(r.title)}" data-image="${esc(r.image || '')}">${esc(r.title)}</div>`
  ).join('');
  container.classList.remove('hidden');

  container.querySelectorAll('.autofill-item').forEach(el => {
    el.addEventListener('click', async () => {
      await createItemFromTitle(el.dataset.title, el.dataset.image || '');
      _hideAutofill();
      document.getElementById('search-input').value = '';
      _searchQuery = '';
    });
  });
}

function _hideAutofill() {
  const container = document.getElementById('autofill-results');
  container.classList.add('hidden');
  container.innerHTML = '';
}

// ---- ITEM CREATION ----

async function createItemFromTitle(title, image = '') {
  if (!title) return;
  const already = await exists(_lib, title);
  if (already) return;

  const item = {
    id: generateId(),
    title,
    image,
    status: defaultStatus(_lib),
    rating: null,
    tags: [],
    notes: ''
  };

  if (_lib === 'books' || _lib === 'games') item.ownership = 'Unset';
  if (_lib === 'restaurants') item.cuisine = [];

  await addItem(_lib, item);
  _items.push(item);
  renderList();
  renderFilters();
}

// ---- BULK ADD ----

async function bulkAdd(titles) {
  let added = 0;
  for (const title of titles) {
    const already = await exists(_lib, title);
    if (already) continue;
    const item = {
      id: generateId(),
      title,
      image: '',
      status: defaultStatus(_lib),
      rating: null,
      tags: [],
      notes: ''
    };
    if (_lib === 'books' || _lib === 'games') item.ownership = 'Unset';
    if (_lib === 'restaurants') item.cuisine = [];
    await addItem(_lib, item);
    _items.push(item);
    added++;
  }
  if (added > 0) {
    renderList();
    renderFilters();
  }
  return added;
}

// ---- SEARCH ----

function setSearchQuery(q) {
  _searchQuery = q;
}

// ---- TEST DATA ----

async function _loadTestData() {
  await addTestData();
  _items = await getAll(_lib);
  renderList();
  renderFilters();
}

// ---- UTILITIES ----

function esc(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getCurrentLib() {
  return _lib;
}
