'use strict';

// ---- API KEYS ----
// Add your keys here to enable autofill search.
// Google Books works without a key for basic searches.
const API_KEYS = {
  tmdb:   '',   // https://www.themoviedb.org/settings/api
  rawg:   '',   // https://rawg.io/apidocs
  places: ''    // Google Places API (requires backend proxy for CORS)
};

async function searchTMDB(query, mediaType) {
  if (!API_KEYS.tmdb) return [];
  const type = mediaType === 'movies' ? 'movie' : 'tv';
  const url = `https://api.themoviedb.org/3/search/${type}?api_key=${encodeURIComponent(API_KEYS.tmdb)}&query=${encodeURIComponent(query)}&page=1`;
  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    return (data.results || []).slice(0, 6).map(r => ({
      title: r.title || r.name || '',
      image: r.poster_path ? `https://image.tmdb.org/t/p/w300${r.poster_path}` : ''
    })).filter(r => r.title);
  } catch { return []; }
}

async function searchGoogleBooks(query) {
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=6&printType=books`;
  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    return (data.items || []).slice(0, 6).map(r => ({
      title: r.volumeInfo?.title || '',
      image: r.volumeInfo?.imageLinks?.thumbnail || ''
    })).filter(r => r.title);
  } catch { return []; }
}

async function searchRAWG(query) {
  if (!API_KEYS.rawg) return [];
  const url = `https://api.rawg.io/api/games?key=${encodeURIComponent(API_KEYS.rawg)}&search=${encodeURIComponent(query)}&page_size=6`;
  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    return (data.results || []).slice(0, 6).map(r => ({
      title: r.name || '',
      image: r.background_image || ''
    })).filter(r => r.title);
  } catch { return []; }
}

async function searchPlaces(query) {
  // Google Places requires a backend proxy due to browser CORS restrictions.
  // Implement a proxy endpoint and call it here.
  return [];
}

async function autofillSearch(lib, query) {
  if (!query || query.length < 2) return [];
  switch (lib) {
    case 'shows':       return searchTMDB(query, 'shows');
    case 'movies':      return searchTMDB(query, 'movies');
    case 'books':       return searchGoogleBooks(query);
    case 'games':       return searchRAWG(query);
    case 'restaurants': return searchPlaces(query);
    default:            return [];
  }
}
