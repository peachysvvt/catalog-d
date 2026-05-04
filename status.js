'use strict';

const STATUS_OPTIONS = {
  entertainment: ['Not Started', 'Started', 'Paused', 'Dropped', 'Completed'],
  restaurant:    ['Not Visited', 'Visited']
};

// Lower index = shown first in default sort
const STATUS_RANK = {
  entertainment: {
    'Started':     0,
    'Paused':      1,
    'Not Started': 2,
    'Dropped':     3,
    'Completed':   4
  },
  restaurant: {
    'Not Visited': 0,
    'Visited':     1
  }
};

function libType(lib) {
  return lib === 'restaurants' ? 'restaurant' : 'entertainment';
}

function statusOptions(lib) {
  return STATUS_OPTIONS[libType(lib)];
}

function statusOrder(lib, status) {
  const type = libType(lib);
  const rank = STATUS_RANK[type][status];
  return rank !== undefined ? rank : 99;
}

function defaultStatus(lib) {
  return statusOptions(lib)[0];
}
