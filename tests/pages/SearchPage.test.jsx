import axios from 'axios';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import SearchPage from '../../src/pages/SearchPage';

const pokemonResponse = {
  id: 25,
  name: 'pikachu',
  height: 4,
  weight: 60,
  sprites: {
    front_default: 'sprite.png',
    other: { 'official-artwork': { front_default: 'artwork.png' } }
  },
  types: [{ type: { name: 'electric' } }],
  abilities: [{ ability: { name: 'static' }, is_hidden: false }],
  stats: [{ stat: { name: 'hp' }, base_stat: 35 }]
};

const speciesResponse = {
  flavor_text_entries: [{ language: { name: 'en' }, flavor_text: 'It raises its tail.' }],
  genera: [{ language: { name: 'en' }, genus: 'Mouse Pokemon' }],
  capture_rate: 190,
  base_happiness: 50
};

const notFoundError = { response: { status: 404 } };

function renderSearch(query) {
  return render(
    <MemoryRouter initialEntries={[`/search?q=${query}`]}>
      <SearchPage />
    </MemoryRouter>
  );
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('SearchPage', () => {
  it('shows the one Pokemon when the name matches exactly', async () => {
    vi.spyOn(axios, 'get').mockImplementation((url) => {
      if (url.includes('/type')) {
        return Promise.resolve({ data: { results: [] } });
      }
      if (url.includes('/pokemon-species/')) {
        return Promise.resolve({ data: speciesResponse });
      }
      return Promise.resolve({ data: pokemonResponse });
    });

    renderSearch('pikachu');

    expect(await screen.findByText('Pikachu')).toBeInTheDocument();
    expect(screen.getByText('1 Pokemon found')).toBeInTheDocument();
  });

  it('falls back to matching part of a name', async () => {
    vi.spyOn(axios, 'get').mockImplementation((url) => {
      if (url.includes('/type')) {
        return Promise.resolve({ data: { results: [] } });
      }
      // There is no Pokemon actually called "chu".
      if (url.endsWith('/pokemon/chu')) {
        return Promise.reject(notFoundError);
      }
      if (url.includes('/pokemon-species/')) {
        return Promise.resolve({ data: speciesResponse });
      }
      // The full list of names, which we then filter.
      if (url.includes('/pokemon?')) {
        return Promise.resolve({
          data: { results: [{ name: 'pikachu' }, { name: 'raichu' }, { name: 'bulbasaur' }] }
        });
      }
      return Promise.resolve({ data: pokemonResponse });
    });

    renderSearch('chu');

    // "pikachu" and "raichu" contain "chu"; "bulbasaur" does not.
    expect(await screen.findByText('2 Pokemon found')).toBeInTheDocument();
  });

  it('says so when nothing matches', async () => {
    vi.spyOn(axios, 'get').mockImplementation((url) => {
      if (url.includes('/type')) {
        return Promise.resolve({ data: { results: [] } });
      }
      if (url.includes('/pokemon?')) {
        return Promise.resolve({ data: { results: [{ name: 'pikachu' }] } });
      }
      return Promise.reject(notFoundError);
    });

    renderSearch('zzzz');

    expect(await screen.findByText('No Pokemon found')).toBeInTheDocument();
    expect(screen.getByText('0 Pokemon found')).toBeInTheDocument();
  });

  it('shows an error message when the search fails', async () => {
    vi.spyOn(axios, 'get').mockRejectedValue(new Error('Network Error'));

    renderSearch('pikachu');

    expect(await screen.findByText('Search failed')).toBeInTheDocument();
  });
});