import axios from 'axios';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import PokemonDetailsPage from '../../src/pages/PokemonDetailsPage';

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

// Render the page as if we had clicked through to /pokemon/pikachu,
// so useParams() can read the name out of the address.
function renderDetails(name = 'pikachu') {
  return render(
    <MemoryRouter initialEntries={[`/pokemon/${name}`]}>
      <Routes>
        <Route path="/pokemon/:nameOrId" element={<PokemonDetailsPage />} />
      </Routes>
    </MemoryRouter>
  );
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('PokemonDetailsPage', () => {
  it('shows a loading message first, then the Pokemon', async () => {
    vi.spyOn(axios, 'get')
      .mockResolvedValueOnce({ data: pokemonResponse })
      .mockResolvedValueOnce({ data: speciesResponse });

    renderDetails();

    expect(screen.getByText('Loading Pokemon...')).toBeInTheDocument();

    expect(await screen.findByRole('heading', { name: 'Pikachu' })).toBeInTheDocument();
    expect(screen.getByText('It raises its tail.')).toBeInTheDocument();
    expect(screen.getByText('Mouse Pokemon')).toBeInTheDocument();
  });

  it('looks up the name from the address', async () => {
    vi.spyOn(axios, 'get')
      .mockResolvedValueOnce({ data: pokemonResponse })
      .mockResolvedValueOnce({ data: speciesResponse });

    renderDetails('pikachu');

    await screen.findByRole('heading', { name: 'Pikachu' });

    expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/pokemon/pikachu'));
  });

  it('says not found when there is no such Pokemon', async () => {
    vi.spyOn(axios, 'get').mockRejectedValue(notFoundError);

    renderDetails('notarealpokemon');

    expect(await screen.findByText('Pokemon not found')).toBeInTheDocument();
  });

  it('shows an error message when the request fails', async () => {
    vi.spyOn(axios, 'get').mockRejectedValue(new Error('Network Error'));

    renderDetails();

    expect(await screen.findByText('Could not load this Pokemon')).toBeInTheDocument();
  });

  it('has a link back to the Pokedex', async () => {
    vi.spyOn(axios, 'get')
      .mockResolvedValueOnce({ data: pokemonResponse })
      .mockResolvedValueOnce({ data: speciesResponse });

    renderDetails();

    await screen.findByRole('heading', { name: 'Pikachu' });

    expect(screen.getByRole('link', { name: '← Back to Pokedex' })).toHaveAttribute('href', '/');
  });
});