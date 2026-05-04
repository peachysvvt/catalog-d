'use strict';

const DB_NAME = 'catalogd';
const DB_VERSION = 1;
const STORES = ['shows', 'movies', 'books', 'games', 'restaurants'];

let _db = null;

function initDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      STORES.forEach(name => {
        if (!db.objectStoreNames.contains(name)) {
          db.createObjectStore(name, { keyPath: 'id' });
        }
      });
    };

    req.onsuccess = (e) => {
      _db = e.target.result;
      resolve(_db);
    };

    req.onerror = () => reject(req.error);
  });
}

function getAll(lib) {
  return new Promise((resolve, reject) => {
    const tx = _db.transaction(lib, 'readonly');
    const req = tx.objectStore(lib).getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function addItem(lib, item) {
  return new Promise((resolve, reject) => {
    const tx = _db.transaction(lib, 'readwrite');
    const req = tx.objectStore(lib).add(item);
    req.onsuccess = () => resolve(item);
    req.onerror = () => reject(req.error);
  });
}

function updateItem(lib, item) {
  return new Promise((resolve, reject) => {
    const tx = _db.transaction(lib, 'readwrite');
    const req = tx.objectStore(lib).put(item);
    req.onsuccess = () => resolve(item);
    req.onerror = () => reject(req.error);
  });
}

function deleteItem(lib, id) {
  return new Promise((resolve, reject) => {
    const tx = _db.transaction(lib, 'readwrite');
    const req = tx.objectStore(lib).delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

function exists(lib, title) {
  return getAll(lib).then(items =>
    items.some(i => i.title.toLowerCase() === title.toLowerCase())
  );
}

function generateId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}
