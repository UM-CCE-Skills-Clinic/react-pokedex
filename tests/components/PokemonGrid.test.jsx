import axios from 'axios';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import PokemonGrid, { TypeBadge, TypeFilter } from '../../src/components/PokemonGrid';

// Two Pokemon in the tidy shape our components expect.
const bulbasaur = {
  id: 1,
  name: 'bulbasaur',
  displayName: 'Bulbasaur',
  image: 'bulbasaur.png',
  types: ['grass', 'poison']
};

const pikachu = {
  id: 25,
  name: 'pikachu',
  displayName: 'Pikachu',
  image: 'pikachu.png',
  types: ['electric']
};

function renderWithRouter(ui) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('TypeBadge', () => {
  it('shows the type name', () => {
    renderWithRouter(<TypeBadge type="fire" />);

    expect(screen.getByText('fire')).toBeInTheDocument();
  });
});

describe('PokemonGrid', () => {
  it('shows a card for every Pokemon', () => {
    renderWithRouter(<PokemonGrid pokemon={[bulbasaur, pikachu]} />);

    expect(screen.getByText('Bulbasaur')).toBeInTheDocument();
    expect(screen.getByText('Pikachu')).toBeInTheDocument();
  });

  it('links each card to that Pokemon page', () => {
    renderWithRouter(<PokemonGrid pokemon={[pikachu]} />);

    expect(screen.getByRole('link')).toHaveAttribute('href', '/pokemon/pikachu');
  });

  it('shows the padded Pokedex number', () => {
    renderWithRouter(<PokemonGrid pokemon={[bulbasaur]} />);

    expect(screen.getByText('#001')).toBeInTheDocument();
  });

  it('shows every type the Pokemon has', () => {
    renderWithRouter(<PokemonGrid pokemon={[bulbasaur]} />);

    expect(screen.getByText('grass')).toBeInTheDocument();
    expect(screen.getByText('poison')).toBeInTheDocument();
  });

  it('shows the picture with the name as its alt text', () => {
    renderWithRouter(<PokemonGrid pokemon={[pikachu]} />);

    expect(screen.getByAltText('Pikachu')).toHaveAttribute('src', 'pikachu.png');
  });

  it('shows nothing when the list is empty', () => {
    renderWithRouter(<PokemonGrid pokemon={[]} />);

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});

describe('TypeFilter', () => {
  it('loads the types and shows one link each', async () => {
    vi.spyOn(axios, 'get').mockResolvedValue({
      data: { results: [{ name: 'fire' }, { name: 'water' }] }
    });

    renderWithRouter(<TypeFilter selectedType="" />);

    // "All" is there straight away; the rest arrive once the request finishes.
    expect(screen.getByRole('link', { name: 'All' })).toBeInTheDocument();

    expect(await screen.findByRole('link', { name: 'Fire' })).toHaveAttribute('href', '/type/fire');
    expect(screen.getByRole('link', { name: 'Water' })).toHaveAttribute('href', '/type/water');
  });

  it('leaves out the types that have no Pokemon', async () => {
    vi.spyOn(axios, 'get').mockResolvedValue({
      data: {
        results: [{ name: 'fire' }, { name: 'unknown' }, { name: 'shadow' }, { name: 'stellar' }]
      }
    });

    renderWithRouter(<TypeFilter selectedType="" />);

    await screen.findByRole('link', { name: 'Fire' });

    expect(screen.queryByRole('link', { name: 'Unknown' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Shadow' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Stellar' })).not.toBeInTheDocument();
  });

  it('still shows All if the types fail to load', async () => {
    vi.spyOn(axios, 'get').mockRejectedValue(new Error('Network Error'));

    renderWithRouter(<TypeFilter selectedType="" />);

    // The filters are an extra, so a failure must not break the page.
    await waitFor(() => {
      expect(screen.getByRole('link', { name: 'All' })).toBeInTheDocument();
    });
  });
});
