import axios from 'axios';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import HomePage from '../../src/pages/HomePage';

// The smallest API answers that HomePage can work with.
const pokemonResponse = {
  id: 1,
  name: 'bulbasaur',
  height: 7,
  weight: 69,
  sprites: {
    front_default: 'sprite.png',
    other: { 'official-artwork': { front_default: 'artwork.png' } }
  },
  types: [{ type: { name: 'grass' } }],
  abilities: [{ ability: { name: 'overgrow' }, is_hidden: false }],
  stats: [{ stat: { name: 'hp' }, base_stat: 45 }]
};

const speciesResponse = {
  flavor_text_entries: [{ language: { name: 'en' }, flavor_text: 'A seed Pokemon.' }],
  genera: [{ language: { name: 'en' }, genus: 'Seed Pokemon' }],
  capture_rate: 45,
  base_happiness: 50
};

// Answer each request based on the address it is asking for.
// `count` decides how many pages the pagination shows.
function mockApi({ count = 1351, listResults = [{ name: 'bulbasaur' }] } = {}) {
  vi.spyOn(axios, 'get').mockImplementation((url) => {
    if (url.includes('/type')) {
      return Promise.resolve({ data: { results: [{ name: 'grass' }] } });
    }
    if (url.includes('/pokemon-species/')) {
      return Promise.resolve({ data: speciesResponse });
    }
    if (url.includes('/pokemon?')) {
      return Promise.resolve({ data: { count, results: listResults } });
    }
    return Promise.resolve({ data: pokemonResponse });
  });
}

function renderHome(path = '/') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <HomePage />
    </MemoryRouter>
  );
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('HomePage', () => {
  it('shows a loading message first, then the Pokemon', async () => {
    mockApi();
    renderHome();

    expect(screen.getByText('Loading Pokemon...')).toBeInTheDocument();

    // findBy waits for the request to finish.
    expect(await screen.findByText('Bulbasaur')).toBeInTheDocument();
    expect(screen.queryByText('Loading Pokemon...')).not.toBeInTheDocument();
  });

  it('asks the API for the page in the address bar', async () => {
    mockApi();
    renderHome('/?page=3');

    await screen.findByText('Bulbasaur');

    // Page 3 means we skip the first 40 Pokemon.
    expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('offset=40'));
  });

  it('starts on page 1 when the address has no page number', async () => {
    mockApi();
    renderHome();

    await screen.findByText('Bulbasaur');

    expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('offset=0'));
  });

  it('works out how many pages there are', async () => {
    mockApi({ count: 1351 });
    renderHome();

    await screen.findByText('Bulbasaur');

    // 1351 Pokemon, 20 per page, rounded up.
    expect(screen.getByText('/ 68')).toBeInTheDocument();
  });

  it('says so when nothing comes back', async () => {
    mockApi({ count: 0, listResults: [] });
    renderHome();

    expect(await screen.findByText('No Pokemon found')).toBeInTheDocument();
  });

  it('shows an error message when the request fails', async () => {
    vi.spyOn(axios, 'get').mockRejectedValue(new Error('Network Error'));
    renderHome();

    expect(await screen.findByText('Could not load Pokemon')).toBeInTheDocument();
  });
});
