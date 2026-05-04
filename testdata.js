'use strict';

async function addTestData() {
  const data = {
    shows: [
      { title: 'Breaking Bad',    status: 'Completed',   rating: 5, tags: ['drama', 'crime'],       notes: 'Masterclass in storytelling.' },
      { title: 'The Wire',        status: 'Started',     rating: 4, tags: ['drama', 'crime'],       notes: 'Gets better every season.' },
      { title: 'Severance',       status: 'Paused',      rating: 4, tags: ['sci-fi', 'thriller'],   notes: 'Incredibly original premise.' },
      { title: 'Dark',            status: 'Not Started', rating: null, tags: ['sci-fi', 'german'], notes: '' },
      { title: 'The Bear',        status: 'Completed',   rating: 5, tags: ['drama'],                notes: 'Intense and brilliant.' },
      { title: 'Succession',      status: 'Completed',   rating: 5, tags: ['drama', 'satire'],      notes: '' }
    ],
    movies: [
      { title: 'Parasite',          status: 'Completed', rating: 5, tags: ['thriller', 'korean'],     notes: '' },
      { title: 'The Lighthouse',    status: 'Completed', rating: 4, tags: ['horror', 'arthouse'],     notes: 'Beautifully shot.' },
      { title: 'Dune',              status: 'Completed', rating: 4, tags: ['sci-fi', 'epic'],         notes: '' },
      { title: 'Everything Everywhere All at Once', status: 'Completed', rating: 5, tags: ['sci-fi', 'comedy'], notes: 'Surprisingly moving.' },
      { title: 'Past Lives',        status: 'Not Started', rating: null, tags: ['drama', 'romance'], notes: '' }
    ],
    books: [
      { title: 'Dune',                   status: 'Completed',   rating: 5, tags: ['sci-fi', 'classic'],    notes: '', ownership: 'Owned' },
      { title: 'Blood Meridian',         status: 'Dropped',     rating: 3, tags: ['literary', 'western'],  notes: 'Too brutal to finish.', ownership: 'Owned' },
      { title: 'The Power of the Dog',   status: 'Not Started', rating: null, tags: ['western'],           notes: '', ownership: 'Not Owned' },
      { title: 'Piranesi',               status: 'Completed',   rating: 5, tags: ['fantasy', 'mystery'],   notes: 'Unlike anything else.', ownership: 'Owned' },
      { title: 'Normal People',          status: 'Completed',   rating: 4, tags: ['literary', 'romance'],  notes: '', ownership: 'Not Owned' }
    ],
    games: [
      { title: 'Elden Ring',       status: 'Paused',      rating: 5, tags: ['rpg', 'souls-like'],      notes: 'Magnificent open world.', ownership: 'Owned' },
      { title: 'Disco Elysium',    status: 'Completed',   rating: 5, tags: ['rpg', 'detective'],       notes: 'Best writing in any game.', ownership: 'Owned' },
      { title: 'Hollow Knight',    status: 'Started',     rating: 4, tags: ['metroidvania', 'indie'],  notes: '', ownership: 'Owned' },
      { title: 'Hades',            status: 'Completed',   rating: 5, tags: ['roguelike', 'action'],    notes: 'Incredible loop.', ownership: 'Owned' },
      { title: 'Return of the Obra Dinn', status: 'Not Started', rating: null, tags: ['puzzle', 'mystery'], notes: '', ownership: 'Not Owned' }
    ],
    restaurants: [
      { title: 'Nobu',               status: 'Visited',     rating: 5, tags: ['fine dining'],    cuisine: ['Japanese', 'Peruvian'], notes: 'Worth it for a special occasion.' },
      { title: 'Local Ramen Spot',   status: 'Visited',     rating: 4, tags: ['casual', 'cheap'], cuisine: ['Japanese'],            notes: 'Best ramen in the area.' },
      { title: 'The Corner Bistro',  status: 'Not Visited', rating: null, tags: ['want to try'], cuisine: ['French'],               notes: '' },
      { title: 'Salt Bae Place',     status: 'Visited',     rating: 2, tags: ['overrated'],       cuisine: ['Turkish', 'Steakhouse'], notes: 'Not worth it.' },
      { title: 'New Thai Place',     status: 'Not Visited', rating: null, tags: ['want to try'],  cuisine: ['Thai'],                 notes: 'Recommended by a friend.' }
    ]
  };

  for (const [lib, items] of Object.entries(data)) {
    for (const item of items) {
      const already = await exists(lib, item.title);
      if (already) continue;
      const full = {
        id: generateId(),
        title: item.title,
        image: item.image || '',
        status: item.status,
        rating: item.rating,
        tags: item.tags || [],
        notes: item.notes || ''
      };
      if (item.ownership !== undefined) full.ownership = item.ownership;
      if (item.cuisine !== undefined) full.cuisine = item.cuisine;
      await addItem(lib, full);
    }
  }
}
