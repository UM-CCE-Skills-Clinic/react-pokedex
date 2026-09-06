import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import PokemonDetail from '../../src/components/PokemonDetail';

// One Pokemon in the tidy shape loadPokemon gives us.
const pikachu = {
  id: 25,
  name: 'pikachu',
  displayName: 'Pikachu',
  image: 'pikachu.png',
  types: ['electric'],
  height: 0.4,
  weight: 6,
  abilities: [
    { name: 'Static', isHidden: false },
    { name: 'Lightning Rod', isHidden: true }
  ],
  stats: [
    { name: 'HP', value: 35 },
    { name: 'Speed', value: 90 }
  ],
  totalStats: 125,
  description: 'It raises its tail to check its surroundings.',
  genus: 'Mouse Pokemon',
  captureRate: 190,
  baseHappiness: 50
};

describe('PokemonDetail', () => {
  it('shows the name, number and category', () => {
    render(<PokemonDetail pokemon={pikachu} />);

    expect(screen.getByRole('heading', { name: 'Pikachu' })).toBeInTheDocument();
    expect(screen.getByText('#025')).toBeInTheDocument();
    expect(screen.getByText('Mouse Pokemon')).toBeInTheDocument();
  });

  it('shows the Pokedex description', () => {
    render(<PokemonDetail pokemon={pikachu} />);

    expect(screen.getByText('It raises its tail to check its surroundings.')).toBeInTheDocument();
  });

  it('shows the height and weight with their units', () => {
    render(<PokemonDetail pokemon={pikachu} />);

    expect(screen.getByText('0.4 m')).toBeInTheDocument();
    expect(screen.getByText('6 kg')).toBeInTheDocument();
  });

  it('shows the capture rate and happiness', () => {
    render(<PokemonDetail pokemon={pikachu} />);

    expect(screen.getByText('190')).toBeInTheDocument();
    expect(screen.getByText('50')).toBeInTheDocument();
  });

  it('marks a hidden ability with a badge', () => {
    render(<PokemonDetail pokemon={pikachu} />);

    expect(screen.getByText('Static')).toBeInTheDocument();
    expect(screen.getByText('Lightning Rod')).toBeInTheDocument();

    // Only the hidden one gets the badge.
    expect(screen.getAllByText('Hidden')).toHaveLength(1);
  });

  it('shows each stat with its value, and the total', () => {
    render(<PokemonDetail pokemon={pikachu} />);

    expect(screen.getByText('HP')).toBeInTheDocument();
    expect(screen.getByText('35')).toBeInTheDocument();
    expect(screen.getByText('Speed')).toBeInTheDocument();
    expect(screen.getByText('90')).toBeInTheDocument();
    expect(screen.getByText('125')).toBeInTheDocument();
  });

  it('shows the picture', () => {
    render(<PokemonDetail pokemon={pikachu} />);

    expect(screen.getByAltText('Pikachu')).toHaveAttribute('src', 'pikachu.png');
  });
});
