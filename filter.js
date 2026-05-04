'use strict';

let _filters = {
  status:    [],
  rating:    [],
  tags:      [],
  ownership: [],
  cuisine:   []
};

function resetFilters() {
  _filters = { status: [], rating: [], tags: [], ownership: [], cuisine: [] };
}

function toggleFilter(type, value) {
  const arr = _filters[type];
  if (!arr) return;
  const idx = arr.indexOf(value);
  if (idx === -1) arr.push(value);
  else arr.splice(idx, 1);
}

function isFilterActive(type, value) {
  return (_filters[type] || []).includes(value);
}

function hasActiveFilters() {
  return Object.values(_filters).some(a => a.length > 0);
}

function applyFilters(items, lib) {
  return items.filter(item => {
    if (_filters.status.length && !_filters.status.includes(item.status)) return false;
    if (_filters.rating.length && !_filters.rating.includes(item.rating)) return false;
    if (_filters.tags.length && !_filters.tags.every(t => (item.tags || []).includes(t))) return false;
    if (_filters.ownership.length && !_filters.ownership.includes(item.ownership || 'Unset')) return false;
    if (_filters.cuisine.length && !_filters.cuisine.every(c => (item.cuisine || []).includes(c))) return false;
    return true;
  });
}

function getActiveFilters() {
  return _filters;
}
