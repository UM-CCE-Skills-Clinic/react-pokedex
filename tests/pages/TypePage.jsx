import axios from 'axios';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import TypePage from '../../src/pages/TypePage';

const pokemonResponse = {
  id: 92,
  name: 'gastly',
  height: 13,
  weight: 1,
  sprites: {
    front_default: 'sprite.png',
    other: { 'official-artwork': { front_default: 'artwork.png' } }
  },
  types: [{ type: { name: 'ghost' } }],
  abilities: [{ ability: { name: 'levitate' }, is_hidden: false }],
  stats: [{ stat: { name: 'hp' }, base_stat: 30 }]
};

const speciesResponse = {
  flavor_text_entries: [{ language: { name: 'en' }, flavor_text: 'Born from gases.' }],
  genera: [{ language: { name: 'en' }, genus: 'Gas Pokemon' }],
  capture_rate: 190,
  base_happiness: 50
};

const notFoundError = { response: { status: 404 } };

// `members` is how many Pokemon this type has, so we can check the paging.
function mockApi({ members = 1 } = {}) {
  const list = Array.from({ length: members }, () => ({ pokemon: { name: 'gastly' } }));

  vi.spyOn(axios, 'get').mockImplementation((url) => {
    // The list of all types, for the filter row.
    if (url.endsWith('/type')) {
      return Promise.resolve({ data: { results: [{ name: 'ghost' }] } });
    }
    // One specific type, with its Pokemon.
    if (url.includes('/type/')) {
      return Promise.resolve({ data: { pokemon: list } });
    }
    if (url.includes('/pokemon-species/')) {
      return Promise.resolve({ data: speciesResponse });
    }
    return Promise.resolve({ data: pokemonResponse });
  });
}

function renderType(type = 'ghost', search = '') {
  return render(
    <MemoryRouter initialEntries={[`/type/${type}${search}`]}>
      <Routes>
        <Route path="/type/:type" element={<TypePage />} />
      </Routes>
    </MemoryRouter>
  );
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('TypePage', () => {
  it('shows a loading message first, then the Pokemon of that type', async () => {
    mockApi();
    renderType('ghost');

    expect(screen.getByText('Loading Pokemon...')).toBeInTheDocument();

    expect(await screen.findByText('Gastly')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /ghost Pokemon/ })).toBeInTheDocument();
  });

  it('counts how many Pokemon the type has', async () => {
    mockApi({ members: 96 });
    renderType('ghost');

    expect(await screen.findByText('96 Pokemon of this type')).toBeInTheDocument();
  });

  it('splits the list into pages of 20', async () => {
    mockApi({ members: 96 });
    renderType('ghost');

    await screen.findByText('96 Pokemon of this type');

    // 96 Pokemon, 20 per page, rounded up.
    expect(screen.getByText('/ 5')).toBeInTheDocument();
  });

  it('shows only one page of cards at a time', async () => {
    mockApi({ members: 96 });
    renderType('ghost');

    await screen.findByText('96 Pokemon of this type');

    // 20 Pokemon cards, plus the "All" and "Ghost" filter links.
    expect(await screen.findAllByText('Gastly')).toHaveLength(20);
  });

  it('says not found when the type does not exist', async () => {
    vi.spyOn(axios, 'get').mockImplementation((url) => {
      if (url.endsWith('/type')) {
        return Promise.resolve({ data: { results: [] } });
      }
      return Promise.reject(notFoundError);
    });

    renderType('banana');

    expect(await screen.findByText('Type not found')).toBeInTheDocument();
  });

  it('shows an error message when the request fails', async () => {
    vi.spyOn(axios, 'get').mockRejectedValue(new Error('Network Error'));

    renderType('ghost');

    expect(await screen.findByText('Could not load this type')).toBeInTheDocument();
  });
});
