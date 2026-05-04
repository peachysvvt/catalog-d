'use strict';

let _currentSort = 'status';

function setSort(sort) {
  _currentSort = sort;
}

function getSort() {
  return _currentSort;
}

function sortItems(items, lib) {
  const arr = [...items];

  if (_currentSort === 'status') {
    arr.sort((a, b) => {
      const diff = statusOrder(lib, a.status) - statusOrder(lib, b.status);
      if (diff !== 0) return diff;
      return a.title.localeCompare(b.title);
    });
  } else if (_currentSort === 'rating') {
    arr.sort((a, b) => {
      const ra = a.rating || 0;
      const rb = b.rating || 0;
      if (rb !== ra) return rb - ra;
      return a.title.localeCompare(b.title);
    });
  } else if (_currentSort === 'alpha') {
    arr.sort((a, b) => a.title.localeCompare(b.title));
  }

  return arr;
}
