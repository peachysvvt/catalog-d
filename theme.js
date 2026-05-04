'use strict';

const ACCENT = {
  pink: {
    shows:       '#d08080',
    movies:      '#c88060',
    books:       '#a888c0',
    games:       '#c050a0',
    restaurants: '#c8a060'
  },
  blue: {
    shows:       '#6aabdc',
    movies:      '#4468c0',
    books:       '#6878c8',
    games:       '#38c8d8',
    restaurants: '#3a9090'
  }
};

let _theme = 'pink';

function loadTheme() {
  _theme = localStorage.getItem('catalogd-theme') || 'pink';
  _applyBodyClass();
}

function toggleTheme() {
  _theme = _theme === 'pink' ? 'blue' : 'pink';
  localStorage.setItem('catalogd-theme', _theme);
  _applyBodyClass();
}

function applyTheme() {
  _applyBodyClass();
}

function applyAccent(lib) {
  const color = accentFor(lib);
  document.documentElement.style.setProperty('--accent', color);
}

function accentFor(lib) {
  return (ACCENT[_theme] && ACCENT[_theme][lib]) || '#888';
}

function currentTheme() {
  return _theme;
}

function _applyBodyClass() {
  document.body.className = 'theme-' + _theme;
}
